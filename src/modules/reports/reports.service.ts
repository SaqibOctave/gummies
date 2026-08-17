import { reportsRepository } from './reports.repository';
import { BadRequestError } from '../../common/errors';

export const reportsService = {
  async dashboard() {
    const [sales, ordersByStatus, counts, topProducts] = await Promise.all([
      reportsRepository.salesSummary(),
      reportsRepository.ordersByStatus(),
      reportsRepository.counts(),
      reportsRepository.topProducts(5),
    ]);

    return {
      sales: {
        orderCount: Number(sales.order_count),
        totalRevenue: Number(sales.total_revenue),
        averageOrderValue: Number(sales.average_order_value),
      },
      ordersByStatus: Object.fromEntries(ordersByStatus.map((r) => [r.status, Number(r.count)])),
      counts: {
        totalProducts: Number(counts.total_products),
        totalCategories: Number(counts.total_categories),
        totalCustomers: Number(counts.total_customers),
        lowStockVariants: Number(counts.low_stock_variants),
      },
      topProducts: topProducts.map((p) => ({
        productId: p.product_id,
        productName: p.product_name,
        totalQuantity: Number(p.total_quantity),
        totalRevenue: Number(p.total_revenue),
      })),
    };
  },

  async salesReport(dateFrom?: string, dateTo?: string) {
    const summary = await reportsRepository.salesSummary(dateFrom, dateTo);
    return {
      orderCount: Number(summary.order_count),
      totalRevenue: Number(summary.total_revenue),
      averageOrderValue: Number(summary.average_order_value),
    };
  },

  async revenueOverTime(dateFrom?: string, dateTo?: string) {
    if (!dateFrom || !dateTo) {
      throw new BadRequestError('dateFrom and dateTo are required');
    }
    const rows = await reportsRepository.revenueOverTime(dateFrom, dateTo);
    return rows.map((r) => ({
      day: r.day,
      revenue: Number(r.revenue),
      orderCount: Number(r.order_count),
    }));
  },

  async topProducts(limit: number, dateFrom?: string, dateTo?: string) {
    const rows = await reportsRepository.topProducts(limit, dateFrom, dateTo);
    return rows.map((p) => ({
      productId: p.product_id,
      productName: p.product_name,
      totalQuantity: Number(p.total_quantity),
      totalRevenue: Number(p.total_revenue),
    }));
  },
};
