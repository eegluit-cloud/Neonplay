import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,

  // TLS settings
  tls: process.env.REDIS_TLS === 'true' ? {} : undefined,

  // Connection settings
  db: parseInt(process.env.REDIS_DB || '0', 10),
  keyPrefix: process.env.REDIS_KEY_PREFIX || 'wbc:',

  // Connection pooling
  maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES || '3', 10),
  retryDelayMs: parseInt(process.env.REDIS_RETRY_DELAY || '100', 10),

  // Cache TTL defaults (in seconds)
  ttl: {
    session: parseInt(process.env.REDIS_TTL_SESSION || '86400', 10), // 24 hours
    cache: parseInt(process.env.REDIS_TTL_CACHE || '3600', 10), // 1 hour
    rateLimit: parseInt(process.env.REDIS_TTL_RATE_LIMIT || '60', 10), // 1 minute
    leaderboard: parseInt(process.env.REDIS_TTL_LEADERBOARD || '300', 10), // 5 minutes
    jackpot: parseInt(process.env.REDIS_TTL_JACKPOT || '60', 10), // 1 minute
  },

  // Pub/Sub channels
  channels: {
    notifications: 'notification:new',
    walletUpdates: 'wallet:updated',
    leaderboardUpdates: 'leaderboard:updated',
    jackpotUpdates: 'jackpot:updated',
    activityFeed: 'activity:new',
    sportsUpdates: 'sports:updated',
  },

  // Cluster mode (for production)
  cluster: {
    enabled: process.env.REDIS_CLUSTER === 'true',
    nodes: process.env.REDIS_CLUSTER_NODES
      ? process.env.REDIS_CLUSTER_NODES.split(',').map((node) => {
          const [host, port] = node.split(':');
          return { host, port: parseInt(port, 10) };
        })
      : [],
  },
}));
