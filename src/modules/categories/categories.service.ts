import { categoriesRepository } from './categories.repository';
import { NotFoundError, ConflictError, BadRequestError } from '../../common/errors';
import { slugify } from '../../common/utils/slugify';
import { CategoryRecord } from './categories.types';

async function ensureUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
  let slug = baseSlug;
  let suffix = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await categoriesRepository.findBySlug(slug);
    if (!existing || existing.id === excludeId) return slug;
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }
}

export const categoriesService = {
  async create(input: {
    name: string;
    slug?: string;
    description?: string;
    imageId?: string;
    parentId?: string;
    sortOrder?: number;
  }): Promise<CategoryRecord> {
    if (input.parentId) {
      const parent = await categoriesRepository.findById(input.parentId);
      if (!parent) throw new BadRequestError('Parent category not found');
    }

    const baseSlug = slugify(input.slug || input.name);
    const slug = await ensureUniqueSlug(baseSlug);

    return categoriesRepository.create({
      name: input.name,
      slug,
      description: input.description,
      imageId: input.imageId,
      parentId: input.parentId,
      sortOrder: input.sortOrder,
    });
  },

  async getById(id: string): Promise<CategoryRecord> {
    const category = await categoriesRepository.findById(id);
    if (!category) throw new NotFoundError('Category not found');
    return category;
  },

  async getBySlug(slug: string): Promise<CategoryRecord> {
    const category = await categoriesRepository.findBySlug(slug);
    if (!category || !category.is_active) throw new NotFoundError('Category not found');
    return category;
  },

  async list(activeOnly: boolean): Promise<CategoryRecord[]> {
    return categoriesRepository.list(activeOnly);
  },

  async update(
    id: string,
    input: {
      name?: string;
      slug?: string;
      description?: string;
      imageId?: string | null;
      parentId?: string | null;
      sortOrder?: number;
      isActive?: boolean;
    }
  ): Promise<CategoryRecord> {
    const existing = await categoriesRepository.findById(id);
    if (!existing) throw new NotFoundError('Category not found');

    if (input.parentId && input.parentId === id) {
      throw new BadRequestError('A category cannot be its own parent');
    }
    if (input.parentId) {
      const parent = await categoriesRepository.findById(input.parentId);
      if (!parent) throw new BadRequestError('Parent category not found');
    }

    let slug: string | undefined;
    if (input.slug || input.name) {
      const baseSlug = slugify(input.slug || input.name || existing.name);
      slug = await ensureUniqueSlug(baseSlug, id);
    }

    const updated = await categoriesRepository.update(id, { ...input, slug });
    if (!updated) throw new NotFoundError('Category not found');
    return updated;
  },

  async remove(id: string): Promise<void> {
    const existing = await categoriesRepository.findById(id);
    if (!existing) throw new NotFoundError('Category not found');

    const productCount = await categoriesRepository.countProducts(id);
    if (productCount > 0) {
      throw new ConflictError('Cannot delete a category that still has products assigned');
    }

    await categoriesRepository.remove(id);
  },
};
