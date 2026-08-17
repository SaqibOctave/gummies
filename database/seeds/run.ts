import path from 'path';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

async function seedSuperAdmin(): Promise<void> {
  const email = (process.env.SEED_SUPER_ADMIN_EMAIL ?? 'admin@gummies.local').toLowerCase();
  const name = process.env.SEED_SUPER_ADMIN_NAME ?? 'Super Admin';
  const password = process.env.SEED_SUPER_ADMIN_PASSWORD ?? 'ChangeMe123!';

  const existing = await pool.query('SELECT id FROM admins WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    console.log(`Super admin already exists: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await pool.query(
    `INSERT INTO admins (name, email, password_hash, role, is_active)
     VALUES ($1, $2, $3, 'super_admin', true)`,
    [name, email, passwordHash]
  );
  console.log(`Created super admin: ${email}`);
}

async function seedSettings(): Promise<void> {
  const defaults: Array<[string, unknown]> = [
    ['store_name', 'Gummy Co.'],
    ['store_currency', 'USD'],
    ['flat_shipping_rate', 5.99],
    ['free_shipping_threshold', 50],
    ['tax_rate_percent', 0],
    ['contact_email', 'support@gummies.local'],
  ];

  for (const [key, value] of defaults) {
    await pool.query(
      `INSERT INTO settings (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO NOTHING`,
      [key, JSON.stringify(value)]
    );
  }
  console.log('Seeded default settings');
}

async function seedCatalog(): Promise<void> {
  const categoryResult = await pool.query('SELECT id FROM categories LIMIT 1');
  if (categoryResult.rows.length > 0) {
    console.log('Catalog already seeded, skipping demo products');
    return;
  }

  const category = await pool.query(
    `INSERT INTO categories (name, slug, description, sort_order, is_active)
     VALUES ('Vitamin Gummies', 'vitamin-gummies', 'Daily vitamin gummy supplements', 1, true)
     RETURNING id`
  );
  const categoryId = category.rows[0].id;

  const product = await pool.query(
    `INSERT INTO products (category_id, name, slug, description, short_description, base_price, is_active)
     VALUES ($1, 'Multivitamin Gummies', 'multivitamin-gummies',
             'Delicious daily multivitamin gummies for the whole family.',
             'Daily multivitamin support in gummy form.', 14.99, true)
     RETURNING id`,
    [categoryId]
  );
  const productId = product.rows[0].id;

  const variant = await pool.query(
    `INSERT INTO product_variants (product_id, sku, name, price, attributes, is_active, sort_order)
     VALUES ($1, 'MVG-60CT', '60 Count Bottle', 14.99, '{"count": 60}'::jsonb, true, 1)
     RETURNING id`,
    [productId]
  );
  const variantId = variant.rows[0].id;

  await pool.query(
    `INSERT INTO inventory (variant_id, quantity_on_hand, low_stock_threshold)
     VALUES ($1, 100, 10)`,
    [variantId]
  );

  console.log('Seeded demo category/product/variant/inventory');
}

async function main(): Promise<void> {
  await seedSuperAdmin();
  await seedSettings();
  await seedCatalog();
}

main()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
