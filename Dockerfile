# syntax=docker/dockerfile:1

# --- Stage 1: install deps + compile TypeScript -----------------------------
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
COPY database ./database

RUN npm run build

# --- Stage 2: production runtime --------------------------------------------
FROM node:22-alpine AS production
ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Compiled JS + the raw .sql migration files (tsc only emits .ts -> .js,
# so the SQL files must be copied separately; database/migrate.ts resolves
# them relative to process.cwd(), see the comment in that file).
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/database/migrations ./database/migrations

RUN mkdir -p logs uploads && chown -R node:node /app

USER node

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:'+(process.env.PORT||4000)+'/api/v1/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "dist/src/server.js"]
