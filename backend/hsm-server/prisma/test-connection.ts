// packages/database/test-connection.ts
import { prisma } from './prisma';

async function testConnection() {
  try {
    console.log('🔌 Testing database connection...\n');

    // Connect
    await prisma.$connect();
    console.log('✅ Connected to database successfully!\n');

    // Get database info
    const result: any = await prisma.$queryRaw`
      SELECT 
        current_database() as database,
        current_user as user,
        version() as version,
        NOW() as current_time
    `;

    console.log('📊 Database Information:');
    console.log('  Database:', result[0].database);
    console.log('  User:', result[0].user);
    console.log('  Time:', result[0].current_time);
    console.log(
      '  Version:',
      result[0].version.split(' ')[0],
      result[0].version.split(' ')[1],
    );
    console.log('');

    // Test User table (if exists)
    try {
      const count = await prisma.user.count();
      console.log('👥 Users in database:', count);
    } catch (e) {
      console.log('ℹ️  User table not yet created (run migrations first)');
    }

    console.log('\n✨ All tests passed!');
  } catch (error) {
    console.error('\n❌ Connection test failed:');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('\n👋 Disconnected');
  }
}

testConnection();
