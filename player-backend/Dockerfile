# Development stage - uses ts-node to skip build errors
FROM node:20-alpine AS development

WORKDIR /app

# Install OpenSSL for Prisma and build tools for native modules
RUN apk add --no-cache openssl openssl-dev python3 make g++

# Copy shared schema first
COPY shared ./shared/

# Install dependencies
COPY player-backend/package*.json ./
COPY player-backend/prisma ./prisma/

RUN npm ci

# Rebuild bcrypt for Alpine Linux
RUN npm rebuild bcrypt

# Generate Prisma client with correct binary targets
RUN npx prisma generate

# Copy source code
COPY player-backend .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/v1/health || exit 1

# Start application with ts-node (transpileOnly to skip type errors)
CMD ["npx", "ts-node", "--transpile-only", "-r", "tsconfig-paths/register", "src/main.ts"]
