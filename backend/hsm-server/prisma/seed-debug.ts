// backend/hsm-server/prisma/seed-debug.ts

import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from '../generated/client/index.js';

console.log('🔍 Debugging Prisma Client...\n');

const connectionString = process.env.DATABASE_URL;
console.log('1. DATABASE_URL:', connectionString ? '✓ Set' : '✗ Missing');

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

console.log('2. PrismaClient type:', typeof prisma);
console.log('3. prisma.user type:', typeof prisma.user);
console.log(
  '4. prisma keys:',
  Object.keys(prisma).filter((k) => !k.startsWith('_')),
);

// Check what models exist
console.log('\n5. Available models:');
const models = Object.keys(prisma).filter(
  (k) =>
    !k.startsWith('_') &&
    !k.startsWith('$') &&
    typeof (prisma as any)[k] === 'object',
);
console.log('   Models found:', models.length > 0 ? models : 'None');

if (prisma.user) {
  console.log('\n✅ prisma.user exists!');
  console.log('   Methods:', Object.keys(prisma.user));
} else {
  console.log('\n❌ prisma.user is undefined!');
  console.log('   This means Prisma Client was not generated correctly.');
}

async function test() {
  try {
    await prisma.$connect();
    console.log('\n6. Database connection: ✓');
    await prisma.$disconnect();
    await pool.end();
  } catch (error) {
    console.error('\n6. Database connection: ✗', error);
    process.exit(1);
  }
}

test();
