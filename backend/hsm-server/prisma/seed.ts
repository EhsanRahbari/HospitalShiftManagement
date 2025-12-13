// backend/hsm-server/prisma/seed.ts

import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from '../generated/client/index.js';
import * as bcrypt from 'bcrypt';

// Create PostgreSQL connection pool
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Create Prisma Client with adapter
const prisma = new PrismaClient({ adapter });

const SALT_ROUNDS = 10;

async function main() {
  console.log('🌱 Start seeding...\n');

  // Hash password
  const hashedPassword = await bcrypt.hash('admin123', SALT_ROUNDS);

  // Create admin user (upsert = create or update if exists)
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {}, // Don't update if exists
    create: {
      username: 'admin',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log('👤 Admin user:', {
    id: admin.id,
    username: admin.username,
    role: admin.role,
  });

  // Create sample doctor
  const doctorPassword = await bcrypt.hash('doctor123', SALT_ROUNDS);

  const doctor = await prisma.user.upsert({
    where: { username: 'dr.smith' },
    update: {},
    create: {
      username: 'dr.smith',
      password: doctorPassword,
      role: 'DOCTOR',
      isActive: true,
      createdById: admin.id,
    },
  });

  console.log('👨‍⚕️ Doctor user:', {
    id: doctor.id,
    username: doctor.username,
    role: doctor.role,
  });

  // Create sample nurse
  const nursePassword = await bcrypt.hash('nurse123', SALT_ROUNDS);

  const nurse = await prisma.user.upsert({
    where: { username: 'nurse.jones' },
    update: {},
    create: {
      username: 'nurse.jones',
      password: nursePassword,
      role: 'NURSE',
      isActive: true,
      createdById: admin.id,
    },
  });

  console.log('👩‍⚕️ Nurse user:', {
    id: nurse.id,
    username: nurse.username,
    role: nurse.role,
  });

  // Summary
  const count = await prisma.user.count();
  console.log(`\n✅ Seeding finished. Total users: ${count}\n`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
