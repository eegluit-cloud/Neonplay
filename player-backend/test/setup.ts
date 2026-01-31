// Global test setup
import { PrismaClient } from '@prisma/client';

// Increase timeout for integration tests
jest.setTimeout(30000);

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-min-32-characters';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-min-32-characters';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/wbc2026_test';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';

// Helper to create test prisma client
export function createTestPrismaClient(): PrismaClient {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
}

// Clean database between tests (for integration tests)
export async function cleanDatabase(prisma: PrismaClient): Promise<void> {
  const tablenames = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  `;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== '_prisma_migrations')
    .map((name) => `"public"."${name}"`)
    .join(', ');

  if (tables.length > 0) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
  }
}

// Global teardown
afterAll(async () => {
  // Add any global cleanup here
});
