import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import {
  PrismaClient,
  Role,
  ShiftStatus,
  ShiftType,
  ConventionType,
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

  // ==================== CREATE USERS ====================

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
      createdById: admin.id,
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
      createdById: admin.id,
    },
  });
  console.log('✅ Nurse user created:', nurse.username);

  // ==================== CREATE CONVENTIONS ====================

  const conventions = [];

  // Convention 1: Student Schedule
  const studentConvention = await prisma.convention.upsert({
    where: { id: 'student-schedule-convention' },
    update: {},
    create: {
      id: 'student-schedule-convention',
      title: 'Student Schedule',
      description:
        'Limited availability due to university classes. Cannot work weekday mornings (8 AM - 12 PM).',
      type: ConventionType.AVAILABILITY,
      isActive: true,
      createdById: admin.id,
    },
  });
  conventions.push(studentConvention);

  // Convention 2: No Night Shifts
  const noNightShifts = await prisma.convention.upsert({
    where: { id: 'no-night-shifts-convention' },
    update: {},
    create: {
      id: 'no-night-shifts-convention',
      title: 'No Night Shifts',
      description: 'Medical reason: Cannot work night shifts (10 PM - 6 AM).',
      type: ConventionType.MEDICAL,
      isActive: true,
      createdById: admin.id,
    },
  });
  conventions.push(noNightShifts);

  // Convention 3: Max 40 Hours/Week
  const maxHours = await prisma.convention.upsert({
    where: { id: 'max-hours-convention' },
    update: {},
    create: {
      id: 'max-hours-convention',
      title: 'Maximum 40 Hours per Week',
      description: 'Legal constraint: Cannot exceed 40 working hours per week.',
      type: ConventionType.LEGAL,
      isActive: true,
      createdById: admin.id,
    },
  });
  conventions.push(maxHours);

  // Convention 4: Weekend Only
  const weekendOnly = await prisma.convention.upsert({
    where: { id: 'weekend-only-convention' },
    update: {},
    create: {
      id: 'weekend-only-convention',
      title: 'Weekend Only Availability',
      description: 'Can only work on weekends (Saturday and Sunday).',
      type: ConventionType.AVAILABILITY,
      isActive: true,
      createdById: admin.id,
    },
  });
  conventions.push(weekendOnly);

  // Convention 5: Pregnancy Restriction
  const pregnancyRestriction = await prisma.convention.upsert({
    where: { id: 'pregnancy-restriction-convention' },
    update: {},
    create: {
      id: 'pregnancy-restriction-convention',
      title: 'Pregnancy - Light Duty',
      description:
        'Medical restriction: Cannot perform heavy lifting or long standing shifts.',
      type: ConventionType.MEDICAL,
      isActive: true,
      createdById: admin.id,
    },
  });
  conventions.push(pregnancyRestriction);

  // Convention 6: Temporary Emergency Leave
  const emergencyLeave = await prisma.convention.upsert({
    where: { id: 'emergency-leave-convention' },
    update: {},
    create: {
      id: 'emergency-leave-convention',
      title: 'Temporary Emergency Leave',
      description:
        'Family emergency: Reduced availability for the next 2 weeks.',
      type: ConventionType.RESTRICTION,
      isActive: true,
      createdById: admin.id,
    },
  });
  conventions.push(emergencyLeave);

  console.log(`✅ Created ${conventions.length} conventions`);

  // ==================== ASSIGN CONVENTIONS TO USERS ====================

  // Assign "Student Schedule" to doctor
  await prisma.userConvention.upsert({
    where: {
      userId_conventionId: {
        userId: doctor.id,
        conventionId: studentConvention.id,
      },
    },
    update: {},
    create: {
      userId: doctor.id,
      conventionId: studentConvention.id,
      assignedById: admin.id,
    },
  });

  // Assign "No Night Shifts" and "Max 40 Hours" to nurse
  await prisma.userConvention.upsert({
    where: {
      userId_conventionId: {
        userId: nurse.id,
        conventionId: noNightShifts.id,
      },
    },
    update: {},
    create: {
      userId: nurse.id,
      conventionId: noNightShifts.id,
      assignedById: admin.id,
    },
  });

  await prisma.userConvention.upsert({
    where: {
      userId_conventionId: {
        userId: nurse.id,
        conventionId: maxHours.id,
      },
    },
    update: {},
    create: {
      userId: nurse.id,
      conventionId: maxHours.id,
      assignedById: admin.id,
    },
  });

  console.log('✅ Assigned conventions to users');

  // ==================== CREATE SHIFTS ====================

  const now = new Date();
  const shifts = [];

  // This week's shifts for doctor
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
        title: `Evening Shift - Day ${i + 1}`,
        startTime: shiftDate,
        endTime: endDate,
        description: 'Regular evening shift',
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
