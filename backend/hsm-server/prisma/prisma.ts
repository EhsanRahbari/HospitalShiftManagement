// backend/hsm-server/prisma/prisma.ts
// OR backend/hsm-server/prisma.ts (wherever it is)

import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/client/index'; // ⬅️ Prisma 7 standard import

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('❌ DATABASE_URL environment variable is not set');
}

const adapter = new PrismaPg({ connectionString });

export const prisma = new PrismaClient({
  adapter,
  log:
    process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
});

// Graceful shutdown
const cleanup = async () => {
  await prisma.$disconnect();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('beforeExit', cleanup);
