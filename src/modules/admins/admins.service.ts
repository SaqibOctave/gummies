import { adminsRepository } from './admins.repository';
import { ConflictError, NotFoundError, BadRequestError } from '../../common/errors';
import { hashPassword } from '../../common/utils/password';
import { toSafeAdmin, SafeAdmin } from './admins.types';
import { AdminRole } from '../../common/constants/roles';

export const adminsService = {
  async create(input: { name: string; email: string; password: string; role: AdminRole }): Promise<SafeAdmin> {
    const email = input.email.toLowerCase().trim();
    const existing = await adminsRepository.findByEmail(email);
    if (existing) throw new ConflictError('An admin with this email already exists');

    const passwordHash = await hashPassword(input.password);
    const admin = await adminsRepository.create({
      name: input.name,
      email,
      passwordHash,
      role: input.role,
    });
    return toSafeAdmin(admin);
  },

  async getById(id: string): Promise<SafeAdmin> {
    const admin = await adminsRepository.findById(id);
    if (!admin) throw new NotFoundError('Admin not found');
    return toSafeAdmin(admin);
  },

  async list(page: number, limit: number) {
    const offset = (page - 1) * limit;
    const { items, total } = await adminsRepository.list(limit, offset);
    return { items: items.map(toSafeAdmin), total };
  },

  async update(
    id: string,
    actingAdminId: string,
    input: { name?: string; role?: AdminRole; isActive?: boolean; password?: string }
  ): Promise<SafeAdmin> {
    const target = await adminsRepository.findById(id);
    if (!target) throw new NotFoundError('Admin not found');

    if (id === actingAdminId && (input.role !== undefined || input.isActive === false)) {
      throw new BadRequestError('You cannot change your own role or deactivate your own account');
    }

    if (
      target.role === 'super_admin' &&
      (input.role !== undefined && input.role !== 'super_admin')
    ) {
      const superAdminCount = await adminsRepository.countByRole('super_admin');
      if (superAdminCount <= 1) {
        throw new BadRequestError('At least one active super admin must remain');
      }
    }

    const passwordHash = input.password ? await hashPassword(input.password) : undefined;

    const updated = await adminsRepository.update(id, {
      name: input.name,
      role: input.role,
      isActive: input.isActive,
      passwordHash,
    });
    if (!updated) throw new NotFoundError('Admin not found');
    return toSafeAdmin(updated);
  },
};
