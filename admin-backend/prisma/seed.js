const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting admin-backend database seeding...');

  // Check if admin users already exist
  const adminCount = await prisma.adminUser.count();

  if (adminCount === 0) {
    console.log('Seeding default admin users...');

    // Create default admin users (password: Admin@123)
    const passwordHash = await bcrypt.hash('Admin@123', 12);

    await prisma.adminUser.create({
      data: {
        email: 'super@casino.com',
        passwordHash: passwordHash,
        name: 'Super Admin',
        role: 'super_admin',
        isActive: true,
      },
    });

    await prisma.adminUser.create({
      data: {
        email: 'admin@casino.com',
        passwordHash: passwordHash,
        name: 'Admin User',
        role: 'admin',
        isActive: true,
      },
    });

    await prisma.adminUser.create({
      data: {
        email: 'support@casino.com',
        passwordHash: passwordHash,
        name: 'Support User',
        role: 'support',
        isActive: true,
      },
    });

    console.log('✓ Default admin users created:');
    console.log('  super@casino.com / Admin@123 (Super Admin)');
    console.log('  admin@casino.com / Admin@123 (Admin)');
    console.log('  support@casino.com / Admin@123 (Support)');
  } else {
    console.log(`✓ ${adminCount} admin user(s) already exist, skipping seed`);
  }

  // Seed Game Categories if empty
  const categoryCount = await prisma.gameCategory.count();

  if (categoryCount === 0) {
    console.log('Seeding game categories...');

    const categories = [
      { name: 'Slots', slug: 'slots', icon: 'slot-machine', sortOrder: 1, isActive: true },
      { name: 'Table Games', slug: 'table-games', icon: 'table', sortOrder: 2, isActive: true },
      { name: 'Live Casino', slug: 'live-casino', icon: 'video', sortOrder: 3, isActive: true },
      { name: 'Jackpot', slug: 'jackpot', icon: 'trophy', sortOrder: 4, isActive: true },
      { name: 'Crash Games', slug: 'crash', icon: 'rocket', sortOrder: 5, isActive: true },
    ];

    for (const category of categories) {
      await prisma.gameCategory.create({ data: category });
    }

    console.log('✓ Game categories seeded');
  } else {
    console.log(`✓ ${categoryCount} game categor(ies) already exist, skipping seed`);
  }

  // Seed Game Aggregators if empty
  const aggregatorCount = await prisma.gameAggregator.count();

  if (aggregatorCount === 0) {
    console.log('Seeding game aggregators...');

    const aggregators = [
      { name: 'Alea Gaming', slug: 'alea', apiEndpoint: 'https://api.alea.com/v1', isActive: true },
      { name: 'SoftSwiss', slug: 'softswiss', apiEndpoint: 'https://api.softswiss.com/v2', isActive: true },
      { name: 'EveryMatrix', slug: 'everymatrix', apiEndpoint: 'https://api.everymatrix.com/v3', isActive: true },
    ];

    for (const aggregator of aggregators) {
      await prisma.gameAggregator.create({ data: aggregator });
    }

    console.log('✓ Game aggregators seeded');
  } else {
    console.log(`✓ ${aggregatorCount} game aggregator(s) already exist, skipping seed`);
  }

  // Seed Game Providers if empty
  const providerCount = await prisma.gameProvider.count();

  if (providerCount === 0) {
    console.log('Seeding game providers...');

    const aggregators = await prisma.gameAggregator.findMany();

    const providers = [
      { name: 'Kalamba', slug: 'kalamba', aggregatorId: aggregators[0]?.id, isActive: true },
      { name: 'Betsoft', slug: 'betsoft', aggregatorId: aggregators[0]?.id, isActive: true },
      { name: 'Hacksaw Gaming', slug: 'hacksaw', aggregatorId: aggregators[0]?.id, isActive: true },
      { name: 'Pragmatic Play', slug: 'pragmatic', aggregatorId: aggregators[1]?.id, isActive: true },
      { name: 'Evolution', slug: 'evolution', aggregatorId: aggregators[1]?.id, isActive: true },
      { name: 'NetEnt', slug: 'netent', aggregatorId: aggregators[1]?.id, isActive: true },
      { name: 'Play\'n GO', slug: 'playngo', aggregatorId: aggregators[2]?.id, isActive: true },
    ];

    for (const provider of providers) {
      await prisma.gameProvider.create({ data: provider });
    }

    console.log('✓ Game providers seeded');
  } else {
    console.log(`✓ ${providerCount} game provider(s) already exist, skipping seed`);
  }

  console.log('✓ Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
