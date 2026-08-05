import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

// A single shared PrismaClient instance. In dev, nodemon can trigger multiple
// module reloads; stashing the client on globalThis prevents exhausting the
// Postgres connection pool.
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.__wishcraftPrisma ||
  new PrismaClient({
    log: env.isProduction ? ['error', 'warn'] : ['error', 'warn'],
  });

if (!env.isProduction) {
  globalForPrisma.__wishcraftPrisma = prisma;
}

export const connectDatabase = async () => {
  await prisma.$connect();
  // eslint-disable-next-line no-console
  console.log('[db] PostgreSQL connected via Prisma');
};

export const disconnectDatabase = async () => {
  await prisma.$disconnect();
};

export default prisma;
