const { PrismaClient } = require('@prisma/client');

// Use the Prisma client from the player-backend
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Handle connection errors
prisma.$connect()
  .then(() => console.log('Admin backend connected to PostgreSQL via Prisma'))
  .catch((err) => {
    console.error('Admin backend Prisma connection error:', err);
    console.log('⚠️  App will continue without database connection for now');
  });

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;
