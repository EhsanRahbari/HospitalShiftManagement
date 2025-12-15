// backend/hsm-server/prisma/seed.ts

import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import {
  PrismaClient,
  Role,
  ShiftStatus,
  ShiftType,
} from 'generated/client/index.js';
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
  console.log('🌱 Starting seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      role: Role.ADMIN,
      isActive: true,
    },
  });
  console.log('✅ Admin user created:', admin.username);

  // Create test doctor
  const doctorPassword = await bcrypt.hash('doctor123', 10);
  const doctor = await prisma.user.upsert({
    where: { username: 'doctor1' },
    update: {},
    create: {
      username: 'doctor1',
      password: doctorPassword,
      role: Role.DOCTOR,
      isActive: true,
    },
  });
  console.log('✅ Doctor user created:', doctor.username);

  // Create test nurse
  const nursePassword = await bcrypt.hash('nurse123', 10);
  const nurse = await prisma.user.upsert({
    where: { username: 'nurse1' },
    update: {},
    create: {
      username: 'nurse1',
      password: nursePassword,
      role: Role.NURSE,
      isActive: true,
    },
  });
  console.log('✅ Nurse user created:', nurse.username);

  // Create some shifts for doctor
  const now = new Date();
  const shifts = [];

  // This week's shifts
  for (let i = 0; i < 5; i++) {
    const shiftDate = new Date(now);
    shiftDate.setDate(now.getDate() + i);
    shiftDate.setHours(8, 0, 0, 0);

    const endDate = new Date(shiftDate);
    endDate.setHours(16, 0, 0, 0);

    const shift = await prisma.shift.create({
      data: {
        userId: doctor.id,
        title: `Morning Shift - Day ${i + 1}`,
        startTime: shiftDate,
        endTime: endDate,
        description: 'Regular morning shift',
        shiftType: ShiftType.REGULAR,
        status: ShiftStatus.SCHEDULED,
      },
    });
    shifts.push(shift);
  }

  // Create shifts for nurse
  for (let i = 0; i < 5; i++) {
    const shiftDate = new Date(now);
    shiftDate.setDate(now.getDate() + i);
    shiftDate.setHours(16, 0, 0, 0);

    const endDate = new Date(shiftDate);
    endDate.setHours(0, 0, 0, 0);
    endDate.setDate(endDate.getDate() + 1);

    const shift = await prisma.shift.create({
      data: {
        userId: nurse.id,
        title: `Night Shift - Day ${i + 1}`,
        startTime: shiftDate,
        endTime: endDate,
        description: 'Regular night shift',
        shiftType: ShiftType.REGULAR,
        status: ShiftStatus.SCHEDULED,
      },
    });
    shifts.push(shift);
  }

  console.log(`✅ Created ${shifts.length} shifts`);
  console.log('🌱 Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
