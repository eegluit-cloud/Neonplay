# Database Schema Documentation

## Overview

The NeonPlay2 Player Backend uses **PostgreSQL** with **Prisma ORM**. The schema contains **70+ models** organized into logical domains for a social casino platform.

## Database Configuration

- **Provider**: PostgreSQL
- **Connection**: Via `DATABASE_URL` environment variable
- **ORM**: Prisma Client (v5.8.0)

---

## Schema Domains

### 1. User & Authentication

| Model | Table Name | Description |
|-------|------------|-------------|
| `User` | `users` | Core user entity with profile, verification status, 2FA |
| `UserSession` | `user_sessions` | JWT refresh token sessions |
| `UserOAuthAccount` | `user_oauth_accounts` | OAuth provider connections (Google, Facebook, Apple) |
| `VerificationCode` | `verification_codes` | Email/phone/password reset verification codes |
| `LoginAttempt` | `login_attempts` | Login attempt tracking for security |

#### User Model Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `email` | String | Unique email address |
| `phone` | String? | Optional phone number |
| `passwordHash` | String? | Bcrypt hashed password |
| `username` | String | Unique username |
| `firstName` | String? | First name |
| `lastName` | String? | Last name |
| `dateOfBirth` | DateTime? | Date of birth for age verification |
| `countryCode` | String? | ISO country code |
| `stateCode` | String? | State/province code |
| `avatarUrl` | String? | Profile avatar URL |
| `emailVerifiedAt` | DateTime? | Email verification timestamp |
| `phoneVerifiedAt` | DateTime? | Phone verification timestamp |
| `identityVerifiedAt` | DateTime? | KYC verification timestamp |
| `isActive` | Boolean | Account active status |
| `isSuspended` | Boolean | Suspension status |
| `suspendedReason` | String? | Reason for suspension |
| `lastLoginAt` | DateTime? | Last login timestamp |
| `lastLoginIp` | String? | Last login IP address |
| `twoFactorSecret` | String? | TOTP secret for 2FA |
| `twoFactorEnabled` | Boolean | 2FA enabled status |
| `createdAt` | DateTime | Account creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

#### User Relations

```
User
├── sessions (UserSession[])        - Active login sessions
├── oauthAccounts (UserOAuthAccount[]) - OAuth connections
├── verificationCodes (VerificationCode[]) - Verification codes
├── wallet (Wallet)                 - User's wallet
├── transactions (Transaction[])    - All transactions
├── purchases (Purchase[])          - Coin purchases
├── redemptions (Redemption[])      - SC redemptions
├── bonusClaims (BonusClaim[])     - Bonus claims
├── favoriteGames (UserFavoriteGame[]) - Favorited games
├── recentGames (UserRecentGame[])  - Recently played games
├── gameSessions (GameSession[])    - Game play sessions
├── gameRounds (GameRound[])        - Individual game rounds
├── leaderboardEntries (LeaderboardEntry[]) - Leaderboard positions
├── bets (Bet[])                    - Sports bets
├── userPromotions (UserPromotion[]) - Promotion claims
├── vip (UserVip)                   - VIP status
├── referralCode (ReferralCode)     - User's referral code
├── referredBy (Referral)           - Who referred this user
├── referrals (Referral[])          - Users this user referred
├── notifications (Notification[])   - Notifications
├── notificationPrefs (NotificationPreference) - Notification settings
├── addresses (UserAddress[])       - Shipping addresses
├── prizeRedemptions (PrizeRedemption[]) - Prize redemptions
├── amoeEntries (AmoeEntry[])       - AMOE entries
├── contentViews (ContentView[])    - Video watch history
├── supportTickets (SupportTicket[]) - Support tickets
├── supportMessages (SupportMessage[]) - Support messages
├── settings (UserSetting)          - User preferences
├── responsibleGaming (ResponsibleGamingSetting) - RG limits
├── activityLogs (UserActivityLog[]) - Activity audit trail
├── privacySettings (UserPrivacySetting) - Privacy preferences
├── vipXpHistory (VipXpHistory[])   - XP transaction history
├── jackpotWins (JackpotWin[])      - Jackpot wins
├── publicWins (PublicWin[])        - Public win display
├── liveBets (LiveBet[])            - Live bet display
└── socialProofEvents (SocialProofEvent[]) - Social proof events
```

---

### 2. Wallet & Transactions

| Model | Table Name | Description |
|-------|------------|-------------|
| `Wallet` | `wallets` | User wallet with GC/SC balances |
| `Transaction` | `transactions` | All financial transactions |
| `CoinPackage` | `coin_packages` | Purchasable coin packages |
| `Purchase` | `purchases` | Coin purchase orders |
| `Redemption` | `redemptions` | SC redemption requests |
| `BonusClaim` | `bonus_claims` | Bonus claim history |
| `PaymentMethod` | `payment_methods` | Payment method configurations |
| `CryptoPaymentOption` | `crypto_payment_options` | Crypto payment options |
| `PayoutRequest` | `payout_requests` | Payout processing queue |

#### Wallet Model

```prisma
Wallet {
  id                   UUID (PK)
  userId               UUID (FK → User, unique)
  gcBalance            Decimal(18,2) - Gold Coins balance
  scBalance            Decimal(18,4) - Sweeps Coins balance
  gcLifetimePurchased  Decimal(18,2) - Total GC ever purchased
  scLifetimeEarned     Decimal(18,4) - Total SC ever earned
  scLifetimeRedeemed   Decimal(18,4) - Total SC ever redeemed
  version              Int - Optimistic locking
}
```

#### Transaction Types

| Type | Description |
|------|-------------|
| `purchase` | GC/SC purchase with real money |
| `bonus` | Bonus claim (daily, welcome, etc.) |
| `game_win` | Win from game play |
| `game_loss` | Loss from game play (stake) |
| `stake` | Bet placement |
| `redeem` | SC redemption for cash |
| `refund` | Purchase refund |
| `adjustment` | Manual admin adjustment |

---

### 3. Games

| Model | Table Name | Description |
|-------|------------|-------------|
| `GameProvider` | `game_providers` | Game provider configurations |
| `GameCategory` | `game_categories` | Game categorization |
| `Game` | `games` | Game catalog |
| `UserFavoriteGame` | `user_favorite_games` | User's favorited games |
| `UserRecentGame` | `user_recent_games` | Recently played games |
| `GameSession` | `game_sessions` | Game play sessions |
| `GameRound` | `game_rounds` | Individual game rounds |

#### Game Model Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `providerId` | UUID | FK to GameProvider |
| `externalGameId` | String? | Provider's game ID |
| `name` | String | Game name |
| `slug` | String | URL-friendly slug (unique) |
| `description` | String? | Game description |
| `thumbnailUrl` | String? | Thumbnail image URL |
| `bannerUrl` | String? | Banner image URL |
| `categoryId` | UUID | FK to GameCategory |
| `tags` | JSON | Array of tags |
| `rtp` | Decimal(5,2) | Return to Player percentage |
| `volatility` | String? | low, medium, high |
| `minBet` | Decimal(10,4) | Minimum bet amount |
| `maxBet` | Decimal(10,4) | Maximum bet amount |
| `features` | JSON | Game features (free spins, etc.) |
| `isFeatured` | Boolean | Featured on homepage |
| `isNew` | Boolean | Recently added |
| `isHot` | Boolean | Trending game |
| `isActive` | Boolean | Active status |
| `playCount` | Int | Total play count |
| `sortOrder` | Int | Display order |
| `releasedAt` | DateTime? | Release date |

#### Game Relations

```
Game
├── provider (GameProvider)
├── category (GameCategory)
├── favoriteUsers (UserFavoriteGame[])
├── recentUsers (UserRecentGame[])
├── sessions (GameSession[])
├── rounds (GameRound[])
├── jackpotWins (JackpotWin[])
├── publicWins (PublicWin[])
└── liveBets (LiveBet[])
```

---

### 4. Sports Betting

| Model | Table Name | Description |
|-------|------------|-------------|
| `Sport` | `sports` | Sports (Football, Basketball, etc.) |
| `League` | `leagues` | Leagues (NFL, NBA, etc.) |
| `Team` | `teams` | Teams |
| `Match` | `matches` | Scheduled/live matches |
| `Market` | `markets` | Betting markets (1X2, Over/Under) |
| `Odd` | `odds` | Odds for selections |
| `Bet` | `bets` | User bets |
| `BetSelection` | `bet_selections` | Individual bet selections |

#### Match Status Values

| Status | Description |
|--------|-------------|
| `upcoming` | Match not started |
| `live` | Match in progress |
| `finished` | Match completed |
| `cancelled` | Match cancelled |
| `postponed` | Match postponed |

#### Bet Status Values

| Status | Description |
|--------|-------------|
| `pending` | Bet awaiting result |
| `won` | Bet won |
| `lost` | Bet lost |
| `void` | Bet voided |
| `cashout` | Bet cashed out early |

---

### 5. Leaderboards

| Model | Table Name | Description |
|-------|------------|-------------|
| `Leaderboard` | `leaderboards` | Leaderboard definitions |
| `LeaderboardEntry` | `leaderboard_entries` | User positions |
| `LeaderboardSnapshot` | `leaderboard_snapshots` | Historical snapshots |

#### Leaderboard Types

| Type | Description |
|------|-------------|
| `biggest_win` | Largest single win |
| `most_wagered` | Total wagered amount |
| `most_played` | Most games played |

#### Leaderboard Periods

| Period | Description |
|--------|-------------|
| `daily` | Resets daily at midnight |
| `weekly` | Resets weekly on Monday |
| `monthly` | Resets on the 1st of month |

---

### 6. Promotions & Bonuses

| Model | Table Name | Description |
|-------|------------|-------------|
| `Promotion` | `promotions` | Promotion definitions |
| `SpinWheelSegment` | `spin_wheel_segments` | Spin wheel configuration |
| `UserPromotion` | `user_promotions` | User promotion claims |

#### Promotion Types

| Type | Description |
|------|-------------|
| `welcome` | New user welcome bonus |
| `deposit` | Deposit match bonus |
| `daily` | Daily login bonus |
| `weekly` | Weekly bonus |
| `monthly` | Monthly bonus |
| `spin_wheel` | Spin wheel reward |
| `code` | Promo code redemption |

---

### 7. VIP & Loyalty

| Model | Table Name | Description |
|-------|------------|-------------|
| `VipTier` | `vip_tiers` | VIP tier definitions |
| `UserVip` | `user_vip` | User VIP status |
| `VipXpHistory` | `vip_xp_history` | XP transaction history |

#### VIP Tiers

| Level | Tier | Min XP |
|-------|------|--------|
| 1 | Bronze | 0 |
| 2 | Silver | 1,000 |
| 3 | Gold | 10,000 |
| 4 | Platinum | 50,000 |
| 5 | Diamond | 200,000 |

---

### 8. Referrals

| Model | Table Name | Description |
|-------|------------|-------------|
| `ReferralCode` | `referral_codes` | User referral codes |
| `Referral` | `referrals` | Referral relationships |

#### Referral Status

| Status | Description |
|--------|-------------|
| `pending` | Referred user signed up |
| `qualified` | Referred user met requirements |
| `rewarded` | Rewards distributed |

---

### 9. Notifications

| Model | Table Name | Description |
|-------|------------|-------------|
| `Notification` | `notifications` | User notifications |
| `NotificationPreference` | `notification_preferences` | Notification settings |

#### Notification Types

| Type | Description |
|------|-------------|
| `system` | System announcements |
| `promotion` | Promotion notifications |
| `wallet` | Wallet activity |
| `game` | Game-related |
| `leaderboard` | Leaderboard updates |
| `bet` | Sports bet updates |

---

### 10. Jackpots

| Model | Table Name | Description |
|-------|------------|-------------|
| `Jackpot` | `jackpots` | Jackpot pools |
| `JackpotWin` | `jackpot_wins` | Jackpot win history |

#### Jackpot Types

| Type | Seed Amount | Trigger Range |
|------|-------------|---------------|
| `mini` | 100 SC | 100-500 SC |
| `minor` | 1,000 SC | 1,000-5,000 SC |
| `major` | 10,000 SC | 10,000-50,000 SC |
| `grand` | 100,000 SC | 100,000-500,000 SC |

---

### 11. Prizes & Rewards

| Model | Table Name | Description |
|-------|------------|-------------|
| `Prize` | `prizes` | Prize catalog |
| `PrizeTier` | `prize_tiers` | Leaderboard prize tiers |
| `PrizeRedemption` | `prize_redemptions` | Prize redemption orders |
| `UserAddress` | `user_addresses` | Shipping addresses |

---

### 12. AMOE (Alternative Method of Entry)

| Model | Table Name | Description |
|-------|------------|-------------|
| `AmoeEntry` | `amoe_entries` | AMOE entry requests |
| `AmoeConfig` | `amoe_config` | AMOE configuration |

#### AMOE Status

| Status | Description |
|--------|-------------|
| `generated` | Code generated |
| `submitted` | Entry submitted with address |
| `approved` | Entry approved by admin |
| `rejected` | Entry rejected |
| `redeemed` | SC credited to wallet |

---

### 13. Content / WBCTV

| Model | Table Name | Description |
|-------|------------|-------------|
| `ContentCategory` | `content_categories` | Video categories |
| `ContentVideo` | `content_videos` | Videos and live streams |
| `ContentView` | `content_views` | View tracking |

---

### 14. Activity Feed

| Model | Table Name | Description |
|-------|------------|-------------|
| `PublicWin` | `public_wins` | Public win display |
| `LiveBet` | `live_bets` | Live bet feed |
| `WinDisplayConfig` | `win_display_config` | Win display settings |
| `UserPrivacySetting` | `user_privacy_settings` | Privacy preferences |
| `SocialProofEvent` | `social_proof_events` | Social proof events |
| `SocialProofConfig` | `social_proof_config` | Social proof settings |

---

### 15. Help & Support

| Model | Table Name | Description |
|-------|------------|-------------|
| `FaqCategory` | `faq_categories` | FAQ categories |
| `Faq` | `faqs` | FAQ entries |
| `SupportTicket` | `support_tickets` | Support tickets |
| `SupportMessage` | `support_messages` | Ticket messages |

---

### 16. User Settings

| Model | Table Name | Description |
|-------|------------|-------------|
| `UserSetting` | `user_settings` | User preferences |
| `ResponsibleGamingSetting` | `responsible_gaming_settings` | RG limits |
| `UserActivityLog` | `user_activity_logs` | Activity audit trail |

---

### 17. Admin

| Model | Table Name | Description |
|-------|------------|-------------|
| `AdminUser` | `admin_users` | Admin accounts |
| `AdminSession` | `admin_sessions` | Admin sessions |
| `AdminAuditLog` | `admin_audit_logs` | Admin action logs |

#### Admin Roles

| Role | Description |
|------|-------------|
| `super_admin` | Full access |
| `admin` | Standard admin access |
| `support` | Customer support |
| `marketing` | Marketing access |
| `finance` | Financial access |

---

### 18. CMS / Static Content

| Model | Table Name | Description |
|-------|------------|-------------|
| `StaticPage` | `static_pages` | Static content pages |
| `Announcement` | `announcements` | Site announcements |
| `SiteSetting` | `site_settings` | Site configuration |
| `HeroBanner` | `hero_banners` | Homepage banners |

---

### 19. Communication Logs

| Model | Table Name | Description |
|-------|------------|-------------|
| `EmailLog` | `email_logs` | Email send history |
| `SmsLog` | `sms_logs` | SMS send history |

---

### 20. Media Library

| Model | Table Name | Description |
|-------|------------|-------------|
| `MediaCategory` | `media_categories` | Media asset categories |
| `MediaAsset` | `media_assets` | Media files |

---

## Key Indexes

### Performance Indexes

```sql
-- User lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Transaction queries
CREATE INDEX idx_transactions_user_created ON transactions(user_id, created_at);
CREATE INDEX idx_transactions_type_created ON transactions(type, created_at);

-- Game queries
CREATE INDEX idx_games_category ON games(category_id);
CREATE INDEX idx_games_provider ON games(provider_id);
CREATE INDEX idx_games_active_featured ON games(is_active, is_featured);

-- Leaderboard queries
CREATE INDEX idx_leaderboard_entries_score ON leaderboard_entries(leaderboard_id, score);

-- Notifications
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read, created_at);

-- Activity logs
CREATE INDEX idx_activity_logs_user ON user_activity_logs(user_id, created_at DESC);
```

---

## Decimal Precision

| Use Case | Precision | Scale | Example |
|----------|-----------|-------|---------|
| USD amounts | 10 | 2 | $99,999,999.99 |
| GC balance | 18 | 2 | 9999999999999999.99 GC |
| SC balance | 18 | 4 | 99999999999999.9999 SC |
| Odds | 6 | 2 | 9999.99 |
| Percentages | 5 | 2 | 100.00% |
| XP | BigInt | - | 9,223,372,036,854,775,807 |

---

## Entity Relationship Diagram (Simplified)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    User     │────<│   Wallet    │────<│ Transaction │
└─────────────┘     └─────────────┘     └─────────────┘
       │
       │     ┌─────────────┐     ┌─────────────┐
       ├────<│ GameSession │────<│  GameRound  │
       │     └─────────────┘     └─────────────┘
       │            │
       │            v
       │     ┌─────────────┐     ┌─────────────┐
       │     │    Game     │────<│GameProvider │
       │     └─────────────┘     └─────────────┘
       │
       │     ┌─────────────┐     ┌─────────────┐
       ├────<│     Bet     │────<│BetSelection │
       │     └─────────────┘     └─────────────┘
       │                               │
       │                               v
       │                         ┌─────────────┐
       │                         │    Match    │
       │                         └─────────────┘
       │
       │     ┌─────────────┐     ┌─────────────┐
       ├────<│   UserVip   │────<│   VipTier   │
       │     └─────────────┘     └─────────────┘
       │
       │     ┌─────────────┐
       ├────<│ Notification│
       │     └─────────────┘
       │
       │     ┌─────────────┐     ┌─────────────┐
       └────<│SupportTicket│────<│SupportMessage
             └─────────────┘     └─────────────┘
```

---

## Migration Commands

```bash
# Generate migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database
npx prisma migrate reset --force

# Seed database
npx prisma db seed

# Open Prisma Studio
npx prisma studio

# Generate Prisma Client
npx prisma generate
```
