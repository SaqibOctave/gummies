import { customersRepository } from './customers.repository';
import { NotFoundError } from '../../common/errors';
import { query } from '../../config/database';

export const customersService = {
  async getById(id: string) {
    const customer = await customersRepository.findById(id);
    if (!customer) throw new NotFoundError('Customer not found');
    return customer;
  },

  async list(search: string | undefined, page: number, limit: number) {
    const offset = (page - 1) * limit;
    return customersRepository.list(search, limit, offset);
  },

  async getOrderHistory(customerId: string) {
    await this.getById(customerId);
    const result = await query(
      `SELECT id, order_number, status, grand_total, currency, placed_at
       FROM orders WHERE customer_id = $1 ORDER BY placed_at DESC`,
      [customerId]
    );
    return result.rows;
  },
};
