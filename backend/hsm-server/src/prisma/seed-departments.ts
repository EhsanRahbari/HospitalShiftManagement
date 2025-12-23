import { Pool } from 'pg';
import { PrismaClient } from '../../generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
// Create PostgreSQL connection pool
const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/hospital_shifts?schema=public';
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Create Prisma Client with adapter
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding departments and sections...');

  // Update admin user (no department needed)
  const adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (adminUser) {
    await prisma.user.update({
      where: { id: adminUser.id },
      data: {
        department: null,
        section: null,
      },
    });
    console.log('✅ Admin user updated');
  }

  // Find and update doctors
  const doctors = await prisma.user.findMany({
    where: { role: 'DOCTOR' },
  });

  if (doctors.length > 0) {
    // Assign departments to doctors
    const departments = ['Emergency', 'Surgery', 'Cardiology'];
    const sections = ['ER', 'OR', 'ICU'];

    for (let i = 0; i < doctors.length; i++) {
      const doctor = doctors[i];
      await prisma.user.update({
        where: { id: doctor.id },
        data: {
          department: departments[i % departments.length],
          section: sections[i % sections.length],
        },
      });
      console.log(`✅ Updated doctor: ${doctor.username}`);
    }
  }

  // Find and update nurses
  const nurses = await prisma.user.findMany({
    where: { role: 'NURSE' },
  });

  if (nurses.length > 0) {
    const departments = ['Emergency', 'Pediatrics', 'Surgery'];
    const sections = ['ICU', 'General', 'ER'];

    for (let i = 0; i < nurses.length; i++) {
      const nurse = nurses[i];
      await prisma.user.update({
        where: { id: nurse.id },
        data: {
          department: departments[i % departments.length],
          section: sections[i % sections.length],
        },
      });
      console.log(`✅ Updated nurse: ${nurse.username}`);
    }
  }

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
