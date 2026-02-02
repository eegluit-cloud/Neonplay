const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
});

redis.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redis.on('connect', () => {
  console.log('Admin Backend connected to Redis');
});

// Cache invalidation helper functions
const invalidateCache = async (...keys) => {
  try {
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log('Cache invalidated for keys:', keys.join(', '));
    }
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
};

// Games & Categories
const invalidateCategoryCache = async () => {
  await invalidateCache('games:categories');
};

const invalidateProviderCache = async () => {
  await invalidateCache('games:providers');
};

const invalidateGameCache = async (gameId, gameSlug) => {
  const keys = ['games:featured', 'games:hot', 'games:new'];
  if (gameSlug) keys.push(`game:${gameSlug}`);
  await invalidateCache(...keys);
};

// VIP System
const invalidateVipCache = async () => {
  await invalidateCache('vip:tiers', 'vip:requirements', 'vip:page_content');
};

// Promotions
const invalidatePromotionCache = async () => {
  await invalidateCache('promotions:active', 'promotions:featured', 'promotions:spin-wheel');
};

// Content
const invalidateContentCache = async () => {
  await invalidateCache('content:categories', 'content:videos', 'content:live');
};

// FAQ
const invalidateFaqCache = async () => {
  await invalidateCache('faq:categories', 'faq:all', 'faq:featured');
};

// Announcements
const invalidateAnnouncementCache = async () => {
  await invalidateCache('announcements:active');
};

// Hero Banners
const invalidateBannerCache = async () => {
  await invalidateCache('banners:active', 'banners:all');
};

// Static Pages
const invalidateStaticPageCache = async () => {
  await invalidateCache('pages:all');
};

// Site Settings
const invalidateSiteSettingsCache = async () => {
  await invalidateCache('settings:public', 'settings:all');
};

// Sports
const invalidateSportsCache = async () => {
  await invalidateCache('sports:all', 'sports:matches', 'sports:live');
};

// Leaderboard
const invalidateLeaderboardCache = async () => {
  await invalidateCache('leaderboard:daily', 'leaderboard:weekly', 'leaderboard:monthly');
};

// Jackpots
const invalidateJackpotCache = async () => {
  await invalidateCache('jackpots:active', 'jackpots:all');
};

module.exports = {
  redis,
  invalidateCache,
  // Games
  invalidateCategoryCache,
  invalidateProviderCache,
  invalidateGameCache,
  // VIP
  invalidateVipCache,
  // Promotions
  invalidatePromotionCache,
  // Content
  invalidateContentCache,
  // FAQ
  invalidateFaqCache,
  // Announcements
  invalidateAnnouncementCache,
  // Banners
  invalidateBannerCache,
  // Static Pages
  invalidateStaticPageCache,
  // Settings
  invalidateSiteSettingsCache,
  // Sports
  invalidateSportsCache,
  // Leaderboard
  invalidateLeaderboardCache,
  // Jackpots
  invalidateJackpotCache,
};
