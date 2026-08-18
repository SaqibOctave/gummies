import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const parsed = Number(raw);
  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable ${name} must be a number`);
  }
  return parsed;
}

function optionalBoolean(name: string, fallback: boolean): boolean {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  return raw.toLowerCase() === 'true';
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  port: optionalNumber('PORT', 4000),
  appUrl: process.env.APP_URL ?? 'http://localhost:4000',
  clientUrls: (process.env.CLIENT_URL ?? 'http://localhost:3000')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean),

  db: {
    connectionString: required('DATABASE_URL'),
    ssl: optionalBoolean('DB_SSL', false),
    poolMax: optionalNumber('DB_POOL_MAX', 10),
    idleTimeoutMs: optionalNumber('DB_IDLE_TIMEOUT_MS', 30000),
  },

  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET'),
    refreshSecret: required('JWT_REFRESH_SECRET'),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',
  },
  cookieSecret: required('COOKIE_SECRET'),

  seedSuperAdmin: {
    name: process.env.SEED_SUPER_ADMIN_NAME ?? 'Super Admin',
    email: process.env.SEED_SUPER_ADMIN_EMAIL ?? 'admin@gummies.local',
    password: process.env.SEED_SUPER_ADMIN_PASSWORD ?? 'ChangeMe123!',
  },

  storage: {
    driver: (process.env.STORAGE_DRIVER ?? 'local') as 'local' | 'minio',
    localUploadDir: process.env.LOCAL_UPLOAD_DIR ?? 'uploads',
    localPublicPath: process.env.LOCAL_PUBLIC_PATH ?? '/uploads',
    maxUploadSizeMb: optionalNumber('MAX_UPLOAD_SIZE_MB', 5),
    minio: {
      endpoint: process.env.MINIO_ENDPOINT ?? 'localhost',
      port: optionalNumber('MINIO_PORT', 9000),
      useSSL: optionalBoolean('MINIO_USE_SSL', false),
      accessKey: process.env.MINIO_ACCESS_KEY ?? 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY ?? 'minioadmin',
      bucket: process.env.MINIO_BUCKET ?? 'gummies-media',
      publicUrl: process.env.MINIO_PUBLIC_URL ?? 'http://localhost:9000',
    },
  },

  rateLimit: {
    windowMs: optionalNumber('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
    max: optionalNumber('RATE_LIMIT_MAX', 100),
    loginWindowMs: optionalNumber('LOGIN_RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
    loginMax: optionalNumber('LOGIN_RATE_LIMIT_MAX', 10),
  },

  logLevel: process.env.LOG_LEVEL ?? 'info',
};
