import { withTransaction } from '../../config/database';
import { ordersRepository } from './orders.repository';
import { customersRepository } from '../customers/customers.repository';
import { variantsRepository } from '../products/variants.repository';
import { inventoryService } from '../inventory/inventory.service';
import { settingsService } from '../settings/settings.service';
import { generateOrderNumber } from '../../common/utils/orderNumber';
import { BadRequestError, NotFoundError, ConflictError } from '../../common/errors';
import { CreateOrderInput } from './orders.types';
import {
  OrderStatus,
  ORDER_STATUS_TRANSITIONS,
  INVENTORY_RELEASING_STATUSES,
} from '../../common/constants/orderStatus';

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

export const ordersService = {
  async createOrder(input: CreateOrderInput) {
    if (!input.items || input.items.length === 0) {
      throw new BadRequestError('Order must contain at least one item');
    }

    const checkoutSettings = await settingsService.getCheckoutSettings();

    return withTransaction(async (client) => {
      const customer = await customersRepository.findOrCreateWithClient(client, {
        name: input.contactName,
        email: input.contactEmail,
        phone: input.contactPhone,
      });

      const lineItems: {
        productId: string;
        variantId: string;
        productName: string;
        variantName: string;
        sku: string;
        unitPrice: number;
        quantity: number;
        lineTotal: number;
      }[] = [];

      let subtotal = 0;
      for (const item of input.items) {
        if (item.quantity <= 0) throw new BadRequestError('Item quantity must be positive');

        const variant = await variantsRepository.findPurchasableById(item.variantId);
        if (!variant || !variant.is_active || !variant.product_is_active) {
          throw new NotFoundError(`Product variant not found or unavailable: ${item.variantId}`);
        }

        const unitPrice = Number(variant.price);
        const lineTotal = roundCurrency(unitPrice * item.quantity);
        subtotal = roundCurrency(subtotal + lineTotal);

        lineItems.push({
          productId: variant.product_id,
          variantId: variant.id,
          productName: variant.product_name,
          variantName: variant.name,
          sku: variant.sku,
          unitPrice,
          quantity: item.quantity,
          lineTotal,
        });
      }

      const shippingTotal =
        subtotal >= checkoutSettings.freeShippingThreshold && checkoutSettings.freeShippingThreshold > 0
          ? 0
          : checkoutSettings.flatShippingRate;
      const taxTotal = roundCurrency((subtotal * checkoutSettings.taxRatePercent) / 100);
      const grandTotal = roundCurrency(subtotal + shippingTotal + taxTotal);

      let order;
      let attempts = 0;
      // Order numbers are random; retry on the astronomically rare collision.
      // eslint-disable-next-line no-constant-condition
      while (true) {
        try {
          order = await ordersRepository.insertOrder(client, {
            orderNumber: generateOrderNumber(),
            customerId: customer.id,
            contactName: input.contactName,
            contactEmail: input.contactEmail.toLowerCase().trim(),
            contactPhone: input.contactPhone,
            shippingAddress: input.shippingAddress,
            billingAddress: input.billingAddress ?? input.shippingAddress,
            currency: checkoutSettings.currency,
            subtotal,
            shippingTotal,
            taxTotal,
            grandTotal,
            customerNotes: input.customerNotes,
          });
          break;
        } catch (error) {
          const pgError = error as { code?: string };
          attempts += 1;
          if (pgError.code === '23505' && attempts < 5) continue;
          throw error;
        }
      }

      for (const item of lineItems) {
        await ordersRepository.insertOrderItem(client, {
          orderId: order.id,
          productId: item.productId,
          variantId: item.variantId,
          productName: item.productName,
          variantName: item.variantName,
          sku: item.sku,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          lineTotal: item.lineTotal,
        });

        await inventoryService.reserveWithClient(client, item.variantId, item.quantity, order.id);
      }

      await ordersRepository.insertStatusHistory(client, {
        orderId: order.id,
        fromStatus: null,
        toStatus: 'pending',
      });

      return { order, items: lineItems };
    });
  },

  async getByOrderNumber(orderNumber: string, email: string) {
    const order = await ordersRepository.findByOrderNumber(orderNumber);
    if (!order || order.contact_email.toLowerCase() !== email.toLowerCase().trim()) {
      throw new NotFoundError('Order not found');
    }
    const items = await ordersRepository.itemsByOrderId(order.id);
    return { ...order, items };
  },

  async getById(id: string) {
    const order = await ordersRepository.findById(id);
    if (!order) throw new NotFoundError('Order not found');
    const [items, statusHistory] = await Promise.all([
      ordersRepository.itemsByOrderId(order.id),
      ordersRepository.statusHistoryByOrderId(order.id),
    ]);
    return { ...order, items, statusHistory };
  },

  async list(
    filter: { status?: OrderStatus; search?: string; customerId?: string },
    page: number,
    limit: number
  ) {
    const offset = (page - 1) * limit;
    return ordersRepository.list(filter, limit, offset);
  },

  async updateStatus(
    orderId: string,
    newStatus: OrderStatus,
    note: string | undefined,
    adminId: string
  ) {
    return withTransaction(async (client) => {
      const order = await ordersRepository.lockById(client, orderId);
      if (!order) throw new NotFoundError('Order not found');

      const allowed = ORDER_STATUS_TRANSITIONS[order.status];
      if (!allowed.includes(newStatus)) {
        throw new ConflictError(
          `Cannot transition order from "${order.status}" to "${newStatus}"`
        );
      }

      const items = await ordersRepository.itemsByOrderId(order.id);

      if (newStatus === 'shipped') {
        for (const item of items) {
          if (item.variant_id) {
            await inventoryService.fulfillWithClient(
              client,
              item.variant_id,
              item.quantity,
              order.id
            );
          }
        }
      } else if (
        INVENTORY_RELEASING_STATUSES.includes(newStatus) &&
        ['pending', 'confirmed', 'processing'].includes(order.status)
      ) {
        // Stock was only reserved (not yet fulfilled at shipment), so release it.
        for (const item of items) {
          if (item.variant_id) {
            await inventoryService.releaseWithClient(
              client,
              item.variant_id,
              item.quantity,
              order.id
            );
          }
        }
      }

      const updated = await ordersRepository.updateStatus(client, orderId, newStatus);
      await ordersRepository.insertStatusHistory(client, {
        orderId,
        fromStatus: order.status,
        toStatus: newStatus,
        note,
        changedBy: adminId,
      });

      return updated;
    });
  },
};
