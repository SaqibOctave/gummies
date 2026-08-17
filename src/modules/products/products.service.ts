import { withTransaction } from '../../config/database';
import { productsRepository, ProductListFilter } from './products.repository';
import { variantsRepository } from './variants.repository';
import { imagesRepository } from './images.repository';
import { inventoryRepository } from '../inventory/inventory.repository';
import { categoriesRepository } from '../categories/categories.repository';
import { mediaRepository } from '../media/media.repository';
import { NotFoundError, ConflictError, BadRequestError } from '../../common/errors';
import { slugify } from '../../common/utils/slugify';
import { ProductRecord } from './products.types';

async function ensureUniqueProductSlug(baseSlug: string, excludeId?: string): Promise<string> {
  let slug = baseSlug;
  let suffix = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await productsRepository.findBySlug(slug);
    if (!existing || existing.id === excludeId) return slug;
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }
}

export const productsService = {
  async create(input: {
    categoryId?: string;
    name: string;
    slug?: string;
    description?: string;
    shortDescription?: string;
    basePrice: number;
    metaTitle?: string;
    metaDescription?: string;
  }): Promise<ProductRecord> {
    if (input.categoryId) {
      const category = await categoriesRepository.findById(input.categoryId);
      if (!category) throw new BadRequestError('Category not found');
    }

    const baseSlug = slugify(input.slug || input.name);
    const slug = await ensureUniqueProductSlug(baseSlug);

    return productsRepository.create({
      categoryId: input.categoryId,
      name: input.name,
      slug,
      description: input.description,
      shortDescription: input.shortDescription,
      basePrice: input.basePrice,
      metaTitle: input.metaTitle,
      metaDescription: input.metaDescription,
    });
  },

  async getById(id: string): Promise<ProductRecord> {
    const product = await productsRepository.findById(id);
    if (!product) throw new NotFoundError('Product not found');
    return product;
  },

  async getDetailBySlug(slug: string) {
    const product = await productsRepository.findBySlug(slug);
    if (!product || !product.is_active) throw new NotFoundError('Product not found');

    const [variants, images] = await Promise.all([
      variantsRepository.listByProductWithAvailability(product.id, true),
      imagesRepository.listByProduct(product.id),
    ]);

    return { ...product, variants, images };
  },

  async getAdminDetail(id: string) {
    const product = await this.getById(id);
    const [variants, images] = await Promise.all([
      variantsRepository.listByProduct(product.id, false),
      imagesRepository.listByProduct(product.id),
    ]);
    return { ...product, variants, images };
  },

  async list(filter: ProductListFilter, page: number, limit: number) {
    const offset = (page - 1) * limit;
    return productsRepository.list(filter, limit, offset);
  },

  async update(
    id: string,
    input: {
      categoryId?: string | null;
      name?: string;
      slug?: string;
      description?: string;
      shortDescription?: string;
      basePrice?: number;
      metaTitle?: string;
      metaDescription?: string;
      isActive?: boolean;
    }
  ): Promise<ProductRecord> {
    const existing = await productsRepository.findById(id);
    if (!existing) throw new NotFoundError('Product not found');

    if (input.categoryId) {
      const category = await categoriesRepository.findById(input.categoryId);
      if (!category) throw new BadRequestError('Category not found');
    }

    let slug: string | undefined;
    if (input.slug || input.name) {
      const baseSlug = slugify(input.slug || input.name || existing.name);
      slug = await ensureUniqueProductSlug(baseSlug, id);
    }

    const updated = await productsRepository.update(id, { ...input, slug });
    if (!updated) throw new NotFoundError('Product not found');
    return updated;
  },

  async remove(id: string): Promise<void> {
    const existing = await productsRepository.findById(id);
    if (!existing) throw new NotFoundError('Product not found');
    await productsRepository.remove(id);
  },

  // --- Variants ---

  async addVariant(
    productId: string,
    input: {
      sku: string;
      name: string;
      price: number;
      compareAtPrice?: number;
      attributes?: Record<string, unknown>;
      sortOrder?: number;
      initialQuantity?: number;
      lowStockThreshold?: number;
    }
  ) {
    const product = await productsRepository.findById(productId);
    if (!product) throw new NotFoundError('Product not found');

    const existingSku = await variantsRepository.findBySku(input.sku);
    if (existingSku) throw new ConflictError('A variant with this SKU already exists');

    return withTransaction(async (client) => {
      const variantResult = await client.query(
        `INSERT INTO product_variants (product_id, sku, name, price, compare_at_price, attributes, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, 0))
         RETURNING *`,
        [
          productId,
          input.sku,
          input.name,
          input.price,
          input.compareAtPrice ?? null,
          JSON.stringify(input.attributes ?? {}),
          input.sortOrder,
        ]
      );
      const variant = variantResult.rows[0];

      await inventoryRepository.createForVariant(
        client,
        variant.id,
        input.initialQuantity ?? 0,
        input.lowStockThreshold ?? 10
      );

      return variant;
    });
  },

  async updateVariant(
    variantId: string,
    input: {
      sku?: string;
      name?: string;
      price?: number;
      compareAtPrice?: number | null;
      attributes?: Record<string, unknown>;
      isActive?: boolean;
      sortOrder?: number;
    }
  ) {
    const existing = await variantsRepository.findById(variantId);
    if (!existing) throw new NotFoundError('Product variant not found');

    if (input.sku && input.sku !== existing.sku) {
      const skuOwner = await variantsRepository.findBySku(input.sku);
      if (skuOwner) throw new ConflictError('A variant with this SKU already exists');
    }

    const updated = await variantsRepository.update(variantId, input);
    if (!updated) throw new NotFoundError('Product variant not found');
    return updated;
  },

  async removeVariant(variantId: string): Promise<void> {
    const existing = await variantsRepository.findById(variantId);
    if (!existing) throw new NotFoundError('Product variant not found');
    await variantsRepository.remove(variantId);
  },

  // --- Images ---

  async attachImage(productId: string, mediaId: string, isPrimary: boolean, sortOrder = 0) {
    const product = await productsRepository.findById(productId);
    if (!product) throw new NotFoundError('Product not found');

    const media = await mediaRepository.findById(mediaId);
    if (!media) throw new NotFoundError('Media not found');

    const image = await imagesRepository.attach(productId, mediaId, sortOrder, isPrimary);

    if (isPrimary) {
      await imagesRepository.unsetPrimaryForProduct(productId);
      await imagesRepository.setPrimary(image.id);
    }

    return image;
  },

  async setPrimaryImage(productId: string, imageId: string) {
    const image = await imagesRepository.findById(imageId);
    if (!image || image.product_id !== productId) throw new NotFoundError('Product image not found');

    await imagesRepository.unsetPrimaryForProduct(productId);
    await imagesRepository.setPrimary(imageId);
  },

  async removeImage(productId: string, imageId: string): Promise<void> {
    const image = await imagesRepository.findById(imageId);
    if (!image || image.product_id !== productId) throw new NotFoundError('Product image not found');
    await imagesRepository.remove(imageId);
  },
};
