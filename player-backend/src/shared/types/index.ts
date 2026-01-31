// Common types used across the application

// Pagination
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Currency types
export type FiatCurrency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';
export type CryptoCurrency = 'USDC' | 'USDT' | 'BTC' | 'ETH' | 'SOL' | 'DOGE';
export type Currency = FiatCurrency | CryptoCurrency;

// Transaction types
export type TransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'bonus'
  | 'game_win'
  | 'game_loss'
  | 'stake'
  | 'refund'
  | 'adjustment'
  | 'transfer'
  | 'conversion';

export type TransactionStatus = 'pending' | 'confirming' | 'completed' | 'failed' | 'reversed';

// Deposit status
export type DepositStatus = 'pending' | 'confirming' | 'completed' | 'failed' | 'refunded';

// Withdrawal status
export type WithdrawalStatus = 'pending' | 'processing' | 'completed' | 'rejected' | 'cancelled';

// User status types
export type UserVerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

// Game types
export type GameVolatility = 'low' | 'medium' | 'high';

export type GameCategory = 'slots' | 'crash' | 'live_casino' | 'table_games' | 'other';

// Leaderboard types
export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly';

export type LeaderboardType = 'biggest_win' | 'most_wagered' | 'most_played';

// Sports betting types
export type MatchStatus =
  | 'upcoming'
  | 'live'
  | 'finished'
  | 'cancelled'
  | 'postponed';

export type BetType = 'single' | 'combo' | 'system';

export type BetStatus = 'pending' | 'won' | 'lost' | 'void' | 'cashout';

export type MarketType =
  | '1x2'
  | 'over_under'
  | 'handicap'
  | 'both_score'
  | 'correct_score'
  | 'half_time'
  | 'double_chance';

export type OddSelection =
  | 'home'
  | 'draw'
  | 'away'
  | 'over'
  | 'under'
  | 'yes'
  | 'no';

// Promotion types
export type PromotionType =
  | 'welcome'
  | 'deposit'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'spin_wheel'
  | 'code';

export type UserPromotionStatus =
  | 'available'
  | 'claimed'
  | 'completed'
  | 'expired';

// VIP types
export type VipTierLevel = 1 | 2 | 3 | 4 | 5;

export type VipTierName = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';

export type XpSource = 'game_play' | 'purchase' | 'bonus';

// Referral types
export type ReferralStatus = 'pending' | 'qualified' | 'rewarded';

// Notification types
export type NotificationType =
  | 'system'
  | 'promotion'
  | 'wallet'
  | 'game'
  | 'leaderboard'
  | 'bet'
  | 'vip'
  | 'referral';

// Jackpot types
export type JackpotType = 'mini' | 'minor' | 'major' | 'grand';

// Prize types
export type PrizeCategory =
  | 'electronics'
  | 'gift_cards'
  | 'merchandise'
  | 'experiences'
  | 'bonus_credits';

export type PrizeType = 'leaderboard' | 'redemption_store' | 'both';

export type PrizeRedemptionStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

// AMOE types
export type AmoeStatus =
  | 'generated'
  | 'submitted'
  | 'approved'
  | 'rejected'
  | 'redeemed';

// Support types
export type TicketCategory =
  | 'general'
  | 'technical'
  | 'billing'
  | 'verification'
  | 'responsible_gaming';

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TicketStatus =
  | 'open'
  | 'awaiting_user'
  | 'in_progress'
  | 'resolved'
  | 'closed';

export type MessageSenderType = 'user' | 'admin' | 'system';

// User settings types
export type Theme = 'dark' | 'light' | 'system';

export type DisplayNamePreference = 'full' | 'first_initial' | 'anonymous';

// Admin types
export type AdminRole =
  | 'super_admin'
  | 'admin'
  | 'support'
  | 'marketing'
  | 'finance';

// Payment types
export type PaymentMethod =
  | 'credit_card'
  | 'apple_pay'
  | 'google_pay'
  | 'bank_transfer'
  | 'crypto';

// Note: CryptoCurrency is defined at the top of this file

export type WithdrawalMethod = 'bank_transfer' | 'paypal' | 'crypto';

// Legacy alias for backwards compatibility
export type RedemptionMethod = WithdrawalMethod;
export type RedemptionStatus = WithdrawalStatus;

// Activity feed types
export type SocialProofEventType =
  | 'win'
  | 'jackpot'
  | 'vip_levelup'
  | 'bonus_claimed'
  | 'cashout'
  | 'leaderboard_rank';

// Announcement types
export type AnnouncementType =
  | 'general'
  | 'maintenance'
  | 'promotion'
  | 'update';

export type AnnouncementPriority = 'low' | 'medium' | 'high' | 'critical';

// OAuth providers
export type OAuthProvider = 'google' | 'facebook' | 'apple';

// Verification types
export type VerificationType = 'email' | 'phone' | 'password_reset' | '2fa';

// API response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: Record<string, any>;
}
