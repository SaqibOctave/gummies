import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { env } from './env';
import { logger } from '../common/utils/logger';
import { formatError } from '../common/utils/formatError';

export const pool = new Pool({
  connectionString: env.db.connectionString,
  max: env.db.poolMax,
  idleTimeoutMillis: env.db.idleTimeoutMs,
  ssl: env.db.ssl ? { rejectUnauthorized: false } : undefined,
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle PostgreSQL client', { error: formatError(err) });
});

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  const result = await pool.query<T>(text, params as never[]);
  const durationMs = Date.now() - start;
  if (durationMs > 200) {
    logger.warn('Slow query', { text, durationMs });
  }
  return result;
}

export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function checkDatabaseConnection(): Promise<void> {
  await pool.query('SELECT 1');
}

export async function closeDatabasePool(): Promise<void> {
  await pool.end();
}
