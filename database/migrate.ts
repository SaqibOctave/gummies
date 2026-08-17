import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Resolved from cwd rather than __dirname: the compiled dist/database/migrate.js
// sits alongside no .sql files (tsc only emits .ts output), so the raw
// database/migrations directory must be located relative to the project root.
const MIGRATIONS_DIR = path.resolve(process.cwd(), 'database', 'migrations');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

async function ensureMigrationsTable(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

function listMigrationFiles(): string[] {
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort();
}

async function getAppliedMigrations(): Promise<Set<string>> {
  const result = await pool.query<{ name: string }>('SELECT name FROM schema_migrations');
  return new Set(result.rows.map((row) => row.name));
}

async function up(): Promise<void> {
  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();
  const files = listMigrationFiles();
  const pending = files.filter((file) => !applied.has(file));

  if (pending.length === 0) {
    console.log('No pending migrations. Database is up to date.');
    return;
  }

  for (const file of pending) {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`Applied migration: ${file}`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Failed to apply migration ${file}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }
}

async function status(): Promise<void> {
  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();
  const files = listMigrationFiles();

  for (const file of files) {
    console.log(`[${applied.has(file) ? 'x' : ' '}] ${file}`);
  }
}

async function down(): Promise<void> {
  console.log(
    'Down migrations are not supported. Write a new forward migration to reverse a change.'
  );
}

async function main(): Promise<void> {
  const command = process.argv[2] ?? 'up';
  try {
    if (command === 'up') await up();
    else if (command === 'status') await status();
    else if (command === 'down') await down();
    else {
      console.error(`Unknown command: ${command}. Use "up" or "status".`);
      process.exitCode = 1;
    }
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
