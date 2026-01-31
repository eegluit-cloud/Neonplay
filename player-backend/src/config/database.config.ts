import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  url: process.env.DATABASE_URL,
  poolSize: parseInt(process.env.DATABASE_POOL_SIZE || '20', 10),
  ssl: process.env.DATABASE_SSL === 'true',
  logging: process.env.DATABASE_LOGGING === 'true',

  // Connection settings
  connectionTimeout: parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || '30000', 10),
  idleTimeout: parseInt(process.env.DATABASE_IDLE_TIMEOUT || '10000', 10),

  // Replica settings (for read-heavy queries)
  replica: {
    url: process.env.DATABASE_REPLICA_URL,
    enabled: !!process.env.DATABASE_REPLICA_URL,
  },

  // Partitioning settings for large tables
  partitioning: {
    transactions: {
      enabled: process.env.DATABASE_PARTITION_TRANSACTIONS === 'true',
      interval: 'monthly', // Partition transactions by month
    },
    gameRounds: {
      enabled: process.env.DATABASE_PARTITION_GAME_ROUNDS === 'true',
      interval: 'monthly',
    },
  },
}));
