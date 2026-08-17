import { createApp } from './app';
import { env } from './config/env';
import { checkDatabaseConnection, closeDatabasePool } from './config/database';
import { logger } from './common/utils/logger';
import { formatError } from './common/utils/formatError';

async function main(): Promise<void> {
  await checkDatabaseConnection();
  logger.info('Database connection established');

  const app = createApp();
  const server = app.listen(env.port, () => {
    logger.info(`Server listening on port ${env.port} (${env.nodeEnv})`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}, shutting down gracefully`);
    server.close(async () => {
      await closeDatabasePool();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

main().catch((error) => {
  logger.error('Failed to start server', { error: formatError(error) });
  process.exit(1);
});
