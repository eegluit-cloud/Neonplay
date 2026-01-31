// Application-wide constants

// Currency constants
export const COIN_TYPES = {
  GC: 'GC', // Gold Coins (purchased)
  SC: 'SC', // Sweepstake Coins (earned/redeemable)
} as const;

// Transaction types
export const TRANSACTION_TYPES = {
  PURCHASE: 'purchase',
  BONUS: 'bonus',
  GAME_WIN: 'game_win',
  GAME_LOSS: 'game_loss',
  STAKE: 'stake',
  REDEEM: 'redeem',
  REFUND: 'refund',
  ADJUSTMENT: 'adjustment',
} as const;

// Default bonuses
export const DEFAULT_BONUSES = {
  DAILY: {
    GC: 1000,
    SC: 0.5,
  },
  WEEKLY: {
    GC: 5000,
    SC: 2.5,
  },
  MONTHLY: {
    GC: 20000,
    SC: 10,
  },
  WELCOME: {
    GC: 10000,
    SC: 5,
  },
} as const;

// VIP tiers
export const VIP_TIERS = {
  BRONZE: { level: 1, name: 'Bronze', minXp: 0 },
  SILVER: { level: 2, name: 'Silver', minXp: 10000 },
  GOLD: { level: 3, name: 'Gold', minXp: 50000 },
  PLATINUM: { level: 4, name: 'Platinum', minXp: 150000 },
  DIAMOND: { level: 5, name: 'Diamond', minXp: 500000 },
} as const;

// XP multipliers
export const XP_MULTIPLIERS = {
  PER_GC_WAGERED: 1, // 1 XP per 1 GC wagered
  PER_SC_WAGERED: 10, // 10 XP per 1 SC wagered
  PER_USD_PURCHASED: 100, // 100 XP per $1 purchased
} as const;

// Cashback percentages by VIP tier
export const CASHBACK_PERCENTAGES = {
  BRONZE: 0,
  SILVER: 1,
  GOLD: 2,
  PLATINUM: 3,
  DIAMOND: 5,
} as const;

// Rate limiting
export const RATE_LIMITS = {
  LOGIN: { ttl: 60, limit: 5 }, // 5 attempts per minute
  REGISTER: { ttl: 3600, limit: 3 }, // 3 per hour
  PASSWORD_RESET: { ttl: 3600, limit: 3 }, // 3 per hour
  VERIFICATION: { ttl: 3600, limit: 5 }, // 5 per hour
  API_DEFAULT: { ttl: 60, limit: 100 }, // 100 per minute
  GAME_LAUNCH: { ttl: 60, limit: 10 }, // 10 per minute
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// Leaderboard periods
export const LEADERBOARD_PERIODS = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
} as const;

// Leaderboard types
export const LEADERBOARD_TYPES = {
  BIGGEST_WIN: 'biggest_win',
  MOST_WAGERED: 'most_wagered',
  MOST_PLAYED: 'most_played',
} as const;

// Jackpot types
export const JACKPOT_TYPES = {
  MINI: { type: 'mini', seed: 100, triggerMin: 100, triggerMax: 500 },
  MINOR: { type: 'minor', seed: 1000, triggerMin: 1000, triggerMax: 5000 },
  MAJOR: { type: 'major', seed: 10000, triggerMin: 10000, triggerMax: 50000 },
  GRAND: { type: 'grand', seed: 100000, triggerMin: 100000, triggerMax: 1000000 },
} as const;

// Jackpot contribution percentages
export const JACKPOT_CONTRIBUTIONS = {
  MINI: 0.001, // 0.1%
  MINOR: 0.002, // 0.2%
  MAJOR: 0.003, // 0.3%
  GRAND: 0.004, // 0.4%
} as const;

// Match statuses
export const MATCH_STATUSES = {
  UPCOMING: 'upcoming',
  LIVE: 'live',
  FINISHED: 'finished',
  CANCELLED: 'cancelled',
  POSTPONED: 'postponed',
} as const;

// Bet statuses
export const BET_STATUSES = {
  PENDING: 'pending',
  WON: 'won',
  LOST: 'lost',
  VOID: 'void',
  CASHOUT: 'cashout',
} as const;

// Admin roles
export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  SUPPORT: 'support',
  MARKETING: 'marketing',
  FINANCE: 'finance',
} as const;

// Admin permissions
export const ADMIN_PERMISSIONS = {
  USERS_READ: 'users:read',
  USERS_WRITE: 'users:write',
  USERS_SUSPEND: 'users:suspend',
  GAMES_READ: 'games:read',
  GAMES_WRITE: 'games:write',
  TRANSACTIONS_READ: 'transactions:read',
  TRANSACTIONS_ADJUST: 'transactions:adjust',
  REDEMPTIONS_READ: 'redemptions:read',
  REDEMPTIONS_PROCESS: 'redemptions:process',
  PROMOTIONS_READ: 'promotions:read',
  PROMOTIONS_WRITE: 'promotions:write',
  TICKETS_READ: 'tickets:read',
  TICKETS_RESPOND: 'tickets:respond',
  AMOE_READ: 'amoe:read',
  AMOE_APPROVE: 'amoe:approve',
  ANALYTICS_VIEW: 'analytics:view',
  ADMINS_MANAGE: 'admins:manage',
  CMS_WRITE: 'cms:write',
} as const;

// Notification types
export const NOTIFICATION_TYPES = {
  SYSTEM: 'system',
  PROMOTION: 'promotion',
  WALLET: 'wallet',
  GAME: 'game',
  LEADERBOARD: 'leaderboard',
  BET: 'bet',
  VIP: 'vip',
  REFERRAL: 'referral',
} as const;

// Payment methods
export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  APPLE_PAY: 'apple_pay',
  GOOGLE_PAY: 'google_pay',
  BANK_TRANSFER: 'bank_transfer',
  CRYPTO: 'crypto',
} as const;

// Crypto currencies
export const CRYPTO_CURRENCIES = {
  BTC: { name: 'Bitcoin', symbol: 'BTC' },
  ETH: { name: 'Ethereum', symbol: 'ETH' },
  USDT: { name: 'Tether', symbol: 'USDT' },
  USDC: { name: 'USD Coin', symbol: 'USDC' },
  SOL: { name: 'Solana', symbol: 'SOL' },
  DOGE: { name: 'Dogecoin', symbol: 'DOGE' },
} as const;

// Ticket priorities
export const TICKET_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

// Ticket statuses
export const TICKET_STATUSES = {
  OPEN: 'open',
  AWAITING_USER: 'awaiting_user',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
} as const;

// Verification code expiry times (in milliseconds)
export const VERIFICATION_EXPIRY = {
  EMAIL: 15 * 60 * 1000, // 15 minutes
  PHONE: 10 * 60 * 1000, // 10 minutes
  PASSWORD_RESET: 60 * 60 * 1000, // 1 hour
  TWO_FACTOR: 5 * 60 * 1000, // 5 minutes
} as const;

// Session limits
export const SESSION_LIMITS = {
  MAX_CONCURRENT: 5,
  MAX_LOGIN_ATTEMPTS: 10,
  LOCKOUT_DURATION: 30 * 60 * 1000, // 30 minutes
} as const;

// AMOE limits
export const AMOE_LIMITS = {
  DAILY: 1,
  WEEKLY: 5,
  SC_PER_ENTRY: 1,
} as const;

// Referral rewards
export const REFERRAL_REWARDS = {
  REFERRER: { GC: 5000, SC: 2.5 },
  REFERRED: { GC: 5000, SC: 2.5 },
  QUALIFICATION_PURCHASE: 10, // $10 minimum purchase to qualify
} as const;

// Redemption limits
export const REDEMPTION_LIMITS = {
  MIN_SC: 50, // Minimum 50 SC to redeem
  SC_TO_USD_RATE: 1, // 1 SC = $1 USD
  DAILY_LIMIT: 500, // $500 per day
  WEEKLY_LIMIT: 2500, // $2500 per week
  MONTHLY_LIMIT: 10000, // $10000 per month
} as const;

// Game categories
export const GAME_CATEGORIES = {
  SLOTS: 'slots',
  CRASH: 'crash',
  LIVE_CASINO: 'live_casino',
  TABLE_GAMES: 'table_games',
  OTHER: 'other',
} as const;

// Content categories
export const CONTENT_CATEGORIES = {
  WINNERS: 'winners',
  NEWS: 'news',
  TIPS: 'tips',
  VIP: 'vip',
  TOURNAMENTS: 'tournaments',
  COMMUNITY: 'community',
} as const;

// Static page slugs
export const STATIC_PAGE_SLUGS = {
  TERMS: 'terms',
  PRIVACY: 'privacy',
  FAIRNESS: 'fairness',
  RESPONSIBLE_GAMING: 'responsible-gaming',
  ABOUT: 'about',
  CAREERS: 'careers',
  CONTACT: 'contact',
} as const;

// WebSocket events
export const WS_EVENTS = {
  // Wallet events
  WALLET_BALANCE_UPDATED: 'wallet:balance_updated',
  WALLET_TRANSACTION_COMPLETED: 'wallet:transaction_completed',

  // Leaderboard events
  LEADERBOARD_UPDATED: 'leaderboard:updated',
  LEADERBOARD_USER_RANK_CHANGED: 'leaderboard:user_rank_changed',

  // Sports events
  MATCH_SCORE_UPDATED: 'match:score_updated',
  MATCH_ODDS_UPDATED: 'match:odds_updated',
  MATCH_STATUS_CHANGED: 'match:status_changed',
  BET_SETTLED: 'bet:settled',

  // Jackpot events
  JACKPOT_UPDATED: 'jackpot:updated',
  JACKPOT_WON: 'jackpot:won',

  // Notification events
  NOTIFICATION_NEW: 'notification:new',
  NOTIFICATION_COUNT_UPDATED: 'notification:count_updated',

  // Activity events
  ACTIVITY_NEW_BIG_WIN: 'activity:new_big_win',
  ACTIVITY_WINS_BATCH: 'activity:wins_batch',
  ACTIVITY_NEW_BET: 'activity:new_bet',
  ACTIVITY_HIGH_ROLLER_BET: 'activity:high_roller_bet',
  ACTIVITY_SOCIAL_PROOF_TOAST: 'activity:social_proof_toast',
} as const;

// Error codes
export const ERROR_CODES = {
  // Auth errors
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
  AUTH_ACCOUNT_LOCKED: 'AUTH_ACCOUNT_LOCKED',
  AUTH_ACCOUNT_SUSPENDED: 'AUTH_ACCOUNT_SUSPENDED',
  AUTH_EMAIL_NOT_VERIFIED: 'AUTH_EMAIL_NOT_VERIFIED',

  // User errors
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
  USER_AGE_RESTRICTION: 'USER_AGE_RESTRICTION',
  USER_LOCATION_RESTRICTED: 'USER_LOCATION_RESTRICTED',

  // Wallet errors
  WALLET_INSUFFICIENT_BALANCE: 'WALLET_INSUFFICIENT_BALANCE',
  WALLET_TRANSACTION_FAILED: 'WALLET_TRANSACTION_FAILED',
  WALLET_LIMIT_EXCEEDED: 'WALLET_LIMIT_EXCEEDED',

  // Game errors
  GAME_NOT_FOUND: 'GAME_NOT_FOUND',
  GAME_NOT_AVAILABLE: 'GAME_NOT_AVAILABLE',
  GAME_SESSION_EXPIRED: 'GAME_SESSION_EXPIRED',

  // Bet errors
  BET_INVALID_SELECTION: 'BET_INVALID_SELECTION',
  BET_MATCH_STARTED: 'BET_MATCH_STARTED',
  BET_ODDS_CHANGED: 'BET_ODDS_CHANGED',
  BET_NOT_FOUND: 'BET_NOT_FOUND',

  // Promotion errors
  PROMO_NOT_FOUND: 'PROMO_NOT_FOUND',
  PROMO_EXPIRED: 'PROMO_EXPIRED',
  PROMO_ALREADY_CLAIMED: 'PROMO_ALREADY_CLAIMED',
  PROMO_REQUIREMENTS_NOT_MET: 'PROMO_REQUIREMENTS_NOT_MET',

  // Verification errors
  VERIFICATION_CODE_INVALID: 'VERIFICATION_CODE_INVALID',
  VERIFICATION_CODE_EXPIRED: 'VERIFICATION_CODE_EXPIRED',
  VERIFICATION_TOO_MANY_ATTEMPTS: 'VERIFICATION_TOO_MANY_ATTEMPTS',

  // General errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;
