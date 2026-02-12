# Flutter Mobile App Plan - Neonplay / PhiBet.io

## Context

Convert the PhiBet.io player-facing web app into a native mobile app (Android + iOS) using Flutter. The existing app is a React 18 + TypeScript casino/sportsbook platform with 34 screens, 90 API endpoints, 20+ modals, 28 hooks, and 201 assets. The Flutter app will live inside the monorepo at `/Users/gs/Desktop/Neonplay/neonplay_mobile/` and share the same NestJS backend.

**Key discovery**: The backend already has full Socket.IO WebSocket support (wallet balance updates, notifications, jackpot events, activity feed) that the web frontend doesn't use. The mobile app will use WebSockets for real-time features instead of the web app's polling approach.

---

## Backend Changes (Required Before Mobile Can Work)

### 1. CSRF Guard Bypass for Mobile (CRITICAL)

The `CsrfGuard` at [csrf.guard.ts](player-backend/src/common/guards/csrf.guard.ts) applies to ALL routes globally. Mobile apps don't use cookies, so every POST/PUT/PATCH/DELETE will fail with 403. Currently only these have `@SkipCsrf()`: login, register, refresh, huidu callback, payment webhooks.

**Fix** - Modify `CsrfGuard.canActivate()` to skip CSRF when request has valid Bearer JWT:
```typescript
// At top of canActivate() in csrf.guard.ts
const authHeader = request.headers.authorization;
if (authHeader?.startsWith('Bearer ')) {
  // Mobile apps authenticate via Bearer tokens, not cookies.
  // CSRF protection is only needed for cookie-based browser sessions.
  return true;
}
```

Also add `@SkipCsrf()` to `POST /auth/logout` (currently missing it).

### 2. Game Launch Platform Parameter

[huidu.service.ts](player-backend/src/modules/huidu/huidu.service.ts) line 98 hardcodes `platform: 1` (desktop). Huidu platform codes: 1=Desktop, 2=Mobile Web, 3=iOS, 4=Android.

**Fix**:
- Add `platform?: string` to game launch DTO
- Pass to `GamesService.launchGame()` and `HuiduService`
- Map: `'ios' → 3`, `'android' → 4`, default `2` for mobile

### 3. WebSocket CORS for Mobile

[main.gateway.ts](player-backend/src/websockets/gateways/main.gateway.ts) line 23 restricts CORS to `process.env.FRONTEND_URL`. Same in [redis-io.adapter.ts](player-backend/src/websockets/adapters/redis-io.adapter.ts).

**Fix**: Add mobile origins or use `origin: true` for WebSocket gateways (mobile clients connect via native Socket.IO, not browser).

---

## Phase 0: Project Scaffolding (Day 1-2)

### Create Project
```bash
cd /Users/gs/Desktop/Neonplay
flutter create --org io.phibet --project-name neonplay_mobile neonplay_mobile
```

### Dependencies (pubspec.yaml)

| Purpose | Package | Replaces (React) |
|---------|---------|-------------------|
| State management | `flutter_riverpod` + `riverpod_annotation` | React Context API (3 contexts) |
| Routing | `go_router` | React Router v6 |
| HTTP client | `dio` | Axios |
| WebSocket | `socket_io_client` | (web app uses polling; mobile upgrades to WebSocket) |
| Token storage | `flutter_secure_storage` | sessionStorage / localStorage |
| Local prefs | `shared_preferences` | localStorage (demo mode, settings) |
| Images | `cached_network_image` | `<img>` tags |
| SVG | `flutter_svg` | SVG imports |
| Animations | `flutter_animate` | GSAP + ScrollTrigger |
| Lottie | `lottie` | Confetti / spin wheel animations |
| WebView | `webview_flutter` | `<iframe>` (game launcher) |
| URL launcher | `url_launcher` | `window.open()` |
| Forms | `flutter_form_builder` + `form_builder_validators` | React Hook Form + Zod |
| Models | `freezed` + `json_serializable` | TypeScript interfaces |
| Fonts | `google_fonts` | Google Fonts CDN |
| Environment | `flutter_dotenv` | Vite env vars (VITE_API_URL, etc.) |
| Share | `share_plus` | `navigator.clipboard` |
| QR codes | `qr_flutter` | (new - crypto deposit addresses) |
| Audio | `audioplayers` | Web Audio API (useSpinSounds) |
| Haptics | `vibration` | (new - native haptic feedback) |
| Image picker | `image_picker` + `image_cropper` | Canvas API (useUserAvatar) |
| Deep links | `app_links` | (new - payment callbacks) |
| Device info | `device_info_plus` + `package_info_plus` | `navigator.userAgent` |
| Intl | `intl` | Date/number formatting |
| Code gen | `build_runner` + `freezed` + `json_serializable` + `riverpod_generator` | N/A |

### Copy Assets
From `player-frontend/src/assets/` to `neonplay_mobile/assets/`:
- `images/logos/` - 4 logo files (SVG + PNG)
- `images/badges/` - 8 VIP tier badges
- `images/prizes/` - 14 prize images
- `images/providers/` - 11 provider logos
- `images/social/` - 6 social icons
- `images/banners/` - ~50 banner/promo images
- `images/characters/` - ~10 character illustrations (dealers, mascots)
- `images/ui/` - ~30 UI elements (coins, roulette, treasure, etc.)
- `fonts/` - Download Inter (300-700) + Orbitron (400-900) TTF files

### Environment Files
```
.env.development:  API_BASE_URL=http://localhost:4000/api/v1
.env.production:   API_BASE_URL=https://api.phibet.io/api/v1
```

### Platform Config
- iOS bundle ID: `io.phibet.neonplay`
- Android package: `io.phibet.neonplay`
- App icons + splash screen
- Deep link scheme: `neonplay://` (for payment callbacks, referral links)
- iOS: Add URL scheme to Info.plist
- Android: Add intent filter to AndroidManifest.xml

---

## Phase 1: Core Infrastructure (Day 3-6)

### Network Layer
Mirrors [api.ts](player-frontend/src/lib/api.ts):

- `lib/core/network/dio_client.dart` - Dio instance, base URL from env, 30s timeouts
- `lib/core/network/auth_interceptor.dart` - Injects `Authorization: Bearer` + `X-App-Platform: mobile` headers
- `lib/core/network/refresh_interceptor.dart` - 401 detection → token refresh with request queue (mutex). Mirrors the exact pattern from api.ts lines 80-130: detect 401, check if already refreshing, queue failed requests, call `/auth/refresh` with refreshToken from body, update tokens, retry all queued requests, on failure clear tokens and redirect to register
- `lib/core/network/api_endpoints.dart` - All 90 endpoint paths as string constants
- `lib/core/network/api_exception.dart` - Typed exceptions (unauthorized, forbidden, notFound, serverError, networkError)

### Token Manager
Mirrors [tokenManager.ts](player-frontend/src/lib/tokenManager.ts):

- Access token: in-memory only (never persisted, same as React)
- Refresh token: `flutter_secure_storage` (iOS Keychain / Android EncryptedSharedPreferences)
- Methods: `setTokens()`, `getAccessToken()`, `getRefreshToken()`, `clearTokens()`, `hasSession()`
- No "Remember Me" distinction needed on mobile - secure storage persists across app restarts

### WebSocket Manager (NEW - not in web app)
The backend at [main.gateway.ts](player-backend/src/websockets/gateways/main.gateway.ts) supports these namespaces and events:

- **Main** (`/`): `wallet:balance_updated`, `leaderboard:updated`, `notification:new`, `activity:new_big_win`, `jackpot:updated`, `jackpot:won`
- **Wallet** (`/wallet`): `balance_updated`, `transaction_completed`
- **Notifications** (`/notifications`): `new`, `count_updated`, `system`
- **Jackpot** (`/jackpot`): `jackpot:value`, `jackpot:all_values`, `jackpot:won`, `jackpot:you_won`, `jackpot:reset`, `jackpot:near_miss`, `jackpot:recent_wins`, `jackpot:milestone`

`lib/core/network/socket_manager.dart`:
- Connect with JWT: `io(baseUrl, { auth: { token: accessToken } })`
- Auto-reconnect on disconnect
- Re-authenticate after token refresh
- Expose event streams as Dart `Stream<T>` for Riverpod providers

### Theme
Mirrors [index.css](player-frontend/src/index.css) CSS variables (lines 8-72):

- `lib/core/theme/app_colors.dart`:
  - Background: `#0A0C12` (hsl 220,20%,4%)
  - Foreground: `#FAFAFA` (hsl 0,0%,98%)
  - Primary (cyan): `#22D3EE` (hsl 187,85%,53%)
  - Accent (gold): `#FFAA00` (hsl 42,100%,50%)
  - Card: `#141822` (hsl 220,15%,8%)
  - Card hover: `#1E2230` (hsl 220,15%,12%)
  - Muted: `#262B38` (hsl 220,15%,15%)
  - Border: `#2A2F3D` (hsl 220,15%,18%)
  - Destructive: `#EF4444` (hsl 0,84%,60%)
  - Casino purple: `#AA44EE`, Casino pink: `#EE4488`, Casino blue: `#0EA5E9`, Casino orange: `#FF8C1A`
- `lib/core/theme/app_gradients.dart`:
  - Primary: cyan → blue
  - Gold: gold → orange
  - VIP: purple → pink
  - Card: dark gradient top → bottom
  - Hero: dark gradient
- `lib/core/theme/app_shadows.dart`: Cyan glow, gold glow, card shadow
- `lib/core/theme/app_text_styles.dart`: Inter (sans, 300-700) + Orbitron (display, 400-900)
- `lib/core/theme/app_dimensions.dart`: Border radius 12px, min tap target 44px, spacing scale
- `lib/core/theme/app_theme.dart`: Dark `ThemeData` combining all above

### Router
Mirrors [App.tsx](player-frontend/src/App.tsx) routes:

- `lib/core/router/app_router.dart` - GoRouter with `redirect` for auth guard
- 6 public routes: `/` (register), `/terms`, `/privacy`, `/responsible-gambling`, `/faq`, `/provably-fair`
- 30 protected routes wrapped in `ShellRoute` with `AppScaffold`
- Auth redirect: unauthenticated → `/`, authenticated on `/` → `/lobby`

### Utilities
- `lib/core/utils/currency_formatter.dart` - 16 currencies with proper symbols:
  - Fiat: USD ($), EUR (€), GBP (£), CAD (C$), AUD (A$), PHP (₱), INR (₹), THB (฿), CNY (¥), JPY (¥)
  - Crypto: USDC, USDT ($ prefix), BTC (₿, 8 decimals), ETH (Ξ, 6 decimals), SOL, DOGE
- `lib/core/utils/validators.dart` - Email, password (strength indicator logic), username
- `lib/core/utils/extensions.dart` - String, BuildContext, DateTime extensions
- `lib/core/utils/debouncer.dart` - For search input

---

## Phase 2: Auth Feature (Day 7-10)

Mirrors [AuthContext.tsx](player-frontend/src/contexts/AuthContext.tsx):

### Models (Freezed)
- `UserModel` - id, email, username, firstName, lastName, avatar, role, isEmailVerified, createdAt
- `WalletBalancesModel` - 16 currency fields (USD through DOGE)
- `WalletModel` - balances, lifetimeStats (deposited, withdrawn, wagered, won, bonuses)
- `TokenResponse` - accessToken, refreshToken, expiresIn, tokenType
- `LoginRequest`, `RegisterRequest`, `ForgotPasswordRequest`, `ResetPasswordRequest`

### Repository (`AuthRepository`)
- `login(email, password)` → `POST /auth/login` (has @SkipCsrf)
- `register(data)` → `POST /auth/register` (has @SkipCsrf)
- `logout(refreshToken)` → `POST /auth/logout` (needs CSRF bypass)
- `getProfile()` → `GET /auth/me`
- `refreshTokens(refreshToken)` → `POST /auth/refresh` (has @SkipCsrf, accepts token in body)
- `forgotPassword(email)` → `POST /auth/forgot-password`
- `resetPassword(token, password)` → `POST /auth/reset-password`
- `verifyEmail(code)` → `POST /auth/verify-email`
- `verifyPhone(phone, code)` → `POST /auth/verify-phone`
- `resendVerification(email)` → `POST /auth/resend-verification`

### Provider (Riverpod AsyncNotifier)
- `AuthProvider` - manages `AuthState` (authenticated/unauthenticated/loading)
- On app start: `hasSession()` → `refreshTokens()` → `getProfile()` + `getBalance()` (same as React's `initAuth`)
- Login: POST → setTokens → getProfile → getBalance → navigate to /lobby
- Logout: POST → clearTokens → disconnect WebSocket → navigate to /
- Auto-connects WebSocket after successful auth

### Screens
- `RegisterScreen` - Landing page with marketing content (hero section, slot machine picker, leaderboard preview, provider carousel, FAQ accordion). Matches [Register.tsx](player-frontend/src/pages/Register.tsx)
- Bottom sheets (Flutter's equivalent of React modals):
  - `LoginBottomSheet` - Email/password, social login buttons, "Forgot password?" link
  - `RegisterBottomSheet` - 3-step flow: email → username → password with strength indicator
  - `ForgotPasswordSheet` - Email input → sends reset link
  - `ResetPasswordSheet` - New password with strength indicator
  - `EmailVerificationSheet` - OTP input for email verification
  - `PhoneVerificationSheet` - Phone number input → OTP verification
  - `OtpInput` widget - 6-digit OTP input with auto-advance
  - `PasswordStrengthIndicator` widget - Real-time strength bar
  - `SocialLoginButtons` widget - Google, Facebook, Apple (currently stubs in React)

---

## Phase 3: App Shell + Navigation (Day 11-14)

Mirrors the React layout pattern where every protected page includes Header, Sidebar, MobileBottomNav:

### AppScaffold (ShellRoute builder)
```
Scaffold
├── AppBar → AppHeader
├── Drawer → AppSidebar
├── Body → current route child
├── BottomNavigationBar → MobileBottomNav
└── FloatingActionButton → SupportButton
```

### AppHeader
Mirrors [Header.tsx](player-frontend/src/components/Header.tsx):
- PhiBet.io logo (tap → /lobby)
- `CoinBalancePill` - Primary currency balance, tap to toggle USD/BTC
- Wallet icon (tap → opens WalletBottomSheet)
- League position badge (tap → /leaderboard)
- Gift icon with unread badge (tap → /promotions)
- Notification bell with unread count badge (tap → opens NotificationsPanel)
- User avatar (tap → /profile)

### AppSidebar (Drawer)
Mirrors [Sidebar.tsx](player-frontend/src/components/Sidebar.tsx) - 7 collapsible sections:
1. **Standalone**: Lobby (home)
2. **Sports**: Sports Home, Live, Soccer, Basketball, Tennis, Esports
3. **Casino**: All Games, Favorites, Hot Games, Slots, Crash Games, Live Casino, Providers
4. **Promotions**: All Promotions, VIP Club, Refer a Friend, Prizes, Leaderboard
5. **Account**: Profile, Wallet (→ profile transactions tab)
6. **Support**: Live Chat (FAQ), Telegram (external), WhatsApp (external), Provably Fair, Responsible Gambling
7. **Legal**: Terms & Conditions, Privacy Policy

Sidebar widgets (when expanded on tablet):
- VIP Status card with progress bar
- Claimable coins with countdown timer
- Daily winners mini-leaderboard
- Theme toggle (dark/light) + language selector

Bottom: Logout button

### MobileBottomNav
Mirrors [MobileBottomNav.tsx](player-frontend/src/components/MobileBottomNav.tsx):
5 tabs: Menu (opens drawer), Sports, Casino (dice icon), Bets (→ /profile), Favorites

### Footer
Links + social icons + legal text. Scrolls with page content.

### NotificationsPanel
Mirrors [NotificationsPanel.tsx](player-frontend/src/components/NotificationsPanel.tsx):
- Slides in from right
- 3 tabs: Promotions, Activity (transactions), System
- Unread badge counts per tab
- "Show unread only" toggle
- Mark all as read
- Uses WebSocket `notification:new` and `count_updated` events for real-time updates

### SupportButton
Floating button (bottom-right), opens in-app chat or links to FAQ page.

---

## Phase 4: Wallet Feature (Day 15-18)

Mirrors [AppModeContext.tsx](player-frontend/src/contexts/AppModeContext.tsx) + [WalletModal.tsx](player-frontend/src/components/WalletModal.tsx):

### Providers
- `WalletProvider` - 16-currency balances, primaryCurrency, formatCurrency(), refreshWallet()
  - Listens to WebSocket `wallet:balance_updated` and `transaction_completed` for real-time updates
- `AppModeProvider` - Demo mode (unauthenticated users get fake wallet stored in SharedPreferences)
- `CoinPackagesProvider` - Available purchase packages

### Screens
- `WalletBottomSheet` - Two tabs: Deposit / Withdraw
- **Deposit flow**:
  - Amount input with currency selector
  - Payment method cards (Credit Card, Apple Pay, Google Pay, Bank Transfer, Crypto)
  - Pay247 integration (UPI, Bank, GCash for INR/PHP) → opens in external browser via `url_launcher`
  - Crypto deposit: wallet address + QR code (`qr_flutter`) + copy button
  - Status polling for Pay247: poll `GET /payment/pay247/deposit/:orderId/status` every 3s after return
- **Withdraw flow**:
  - Amount input, method selection
  - Account details forms (UPI ID, bank account, crypto address, GCash number)
  - Submission + status tracking
- `GetCoinsSheet` - Coin package grid with purchase flow
- `LowCoinModal` - Warning when balance is low, CTA to deposit

### Deep Linking
- Register `neonplay://payment/callback` for Pay247 return
- Parse order ID from callback URL, start status polling

---

## Phase 5: Games Feature + WebView (Day 19-24)

### Repository (`GamesRepository`)
- `getAll(page, limit, category, provider, search, featured, hot, new)` → `GET /games`
- `getBySlug(slug)` → `GET /games/{slug}`
- `getCategories()` → `GET /games/categories`
- `getProviders()` → `GET /providers`
- `getFeatured()` → `GET /games?featured=true&limit=10`
- `getNew()` → `GET /games?new=true&limit=10`
- `getHot()` → `GET /games?hot=true&limit=10`
- `launchGame(slug, platform)` → `POST /games/{slug}/launch` (sends platform: 'ios'/'android')
- `getFavorites()` → `GET /games/favorites`
- `addFavorite(gameId)` → `POST /games/favorites/{gameId}`
- `removeFavorite(gameId)` → `DELETE /games/favorites/{gameId}`

### Models (Freezed)
- `GameModel` - id, name, slug, description, thumbnailUrl, bannerUrl, tags, rtp, volatility, minBet, maxBet, features, isFeatured, isNew, isHot, playCount, category, provider
- `GameCategoryModel` - id, name, slug
- `GameProviderModel` - id, name, slug, logoUrl

### Providers
- `GamesProvider` - Paginated game list with filters (category, provider, search)
- `FeaturedGamesProvider`, `HotGamesProvider`, `NewGamesProvider`
- `GameCategoriesProvider`, `GameProvidersProvider`
- `FavoritesProvider` - favoriteIds Set, toggleFavorite(), isFavorite()

### Screens
- `CasinoScreen` - Search bar + provider/volatility filters + game sections + provider carousel. Mirrors [Casino.tsx](player-frontend/src/pages/Casino.tsx)
- `CategoryGamesScreen` - **Single reusable screen** for all 11 category routes (slots, hot-games, crash-games, live-casino, game-shows, table-games, blackjack, roulette, new-releases, burst-games, featured). Takes category param.
- `GameDetailScreen` - Game launcher using `webview_flutter`:
  - Play button overlay → calls launch API → loads URL in WebView
  - `WebViewController` with JavaScript enabled, autoplay allowed
  - Fullscreen toggle: `SystemChrome.setEnabledSystemUIMode(immersiveSticky)` + optional landscape lock
  - Back button shows "Exit game?" confirmation dialog
  - Game info below WebView (name, provider, RTP, volatility)
  - Mirrors [GameDetail.tsx](player-frontend/src/pages/GameDetail.tsx)
- `ProvidersScreen` - Provider grid (3 cols mobile, 4+ tablet). Mirrors [Providers.tsx](player-frontend/src/pages/Providers.tsx)
- `ProviderGamesScreen` - Games filtered by provider
- `FavoritesScreen` - Favorite games grid with search + empty state
- `SearchScreen` - Global game search with debounced input

### Shared Widgets
- `GameCard` - Thumbnail with gradient overlay, provider badge, favorite heart, play icon on tap
- `GamesGrid` - Responsive grid (2 cols mobile, 3 tablet, 4+ desktop)
- `GamesSection` - Horizontal scroll row with title + "See All" button
- `HotGamesSection`, `CrashGamesSection` - Specialized game sections
- `ProvidersCarousel` - Horizontal scrolling provider logos
- `GameCategoryNav` - Horizontal category tab chips
- `CategoryFilterChips` - Provider/volatility filter chips

---

## Phase 6: Lobby Screen (Day 25-27)

Assembles game components into the main home screen. Mirrors [Index.tsx](player-frontend/src/pages/Index.tsx):

- `LobbyScreen`:
  - `HeroSection` - PageView banner carousel with auto-advance, promotional CTAs. Loads banners from `GET /cms/banners`
  - `LobbyModeSwitcher` - All | Casino | Sports toggle (changes visible sections)
  - `GameCategoryNav` - Category chips (Lobby, Slots, Live, Crash, Table, etc.)
  - `LiveSportsHighlights` widget (when mode = All or Sports)
  - `RecentWins` - Horizontal scrolling ticker of recent wins (uses WebSocket `activity:new_big_win` or falls back to 30s polling from `GET /activity/wins`)
  - Multiple `GamesSection` rows (Hot Games, Slots, Crash Games, New Games, etc.)
  - `ProvidersCarousel`
  - `Leaderboard` widget (preview, daily tab)
  - `PromoBanners` - Promotional cards

---

## Phase 7: Sports + Betslip (Day 28-32)

Mirrors [BetslipContext.tsx](player-frontend/src/contexts/BetslipContext.tsx) + [Sports.tsx](player-frontend/src/pages/Sports.tsx):

### Models (Freezed)
- `SportModel`, `LeagueModel`, `MatchModel`, `MarketModel`, `OddModel`
- `BetModel`, `BetSelectionModel` - eventId, matchName, market, selection, odds, league, teams

### Repository (`SportsRepository`)
- `getSports()`, `getLeagues(sportId)`, `getMatches(leagueId, status, limit)`, `getMatch(matchId)`
- `getLiveMatches()`, `getUpcomingMatches(limit)`
- `placeBet(matchId, oddId, amount, coinType)` → `POST /sports/bets`
- `getMyBets(page, status)` → `GET /sports/bets`

### Providers
- `SportsProvider` - sports list
- `LeaguesProvider` - leagues by sport
- `MatchesProvider` - matches with filters
- `LiveMatchesProvider` - 30s polling via Timer (upgrade to WebSocket when backend adds sports events)
- `BetslipProvider` (StateNotifier) - selections array, stake (default 5), activeTab (single/combo/system), quickBetEnabled
  - `addSelection()` - replaces if same event
  - `removeSelection()`, `clearSelections()`
  - `totalOdds` - product of all odds (combo)
  - `potentialWin` - calculated per tab type
- `MyBetsProvider` - user's bet history with pagination

### Screens
- `SportsScreen`:
  - Top icon row (Live, Favorites, sport filters)
  - Tabs: Highlights, Event Builder, Bets Feed
  - Sport filter chips (Soccer, Basketball, Tennis, Esports)
  - `EventCard` - Teams, score/time, odds buttons
  - `OddsButton` - Tappable odds with selected/unselected states, haptic feedback on select
  - `TeamLogo` - Team logo/abbreviation
  - `LiveSportsHighlights` - Carousel of live matches
  - `PopularEvents`, `UpcomingEvents` sections
- `BetslipBar` - Sticky bar at bottom showing selection count, tap to expand
- `BetslipPanel` - Bottom sheet with: selection list, stake input, single/combo/system tabs, potential win display, "Place Bet" button with haptic + sound feedback

---

## Phase 8: Profile (Day 33-36)

Mirrors [Profile.tsx](player-frontend/src/pages/Profile.tsx) with 5 tabs:

### Repository (`ProfileRepository`)
- `getProfile()`, `updateProfile(data)` → `PATCH /users/profile`
- `changePassword(current, new)` → `POST /auth/me/change-password`
- `getGameHistory(page, type, dateFrom, dateTo)` → from games/sports endpoints
- `getTransactions(page, dateFrom, dateTo)` → `GET /wallet/transactions`
- `uploadAvatar(file)` → compress image (200x200 JPEG, 0.8 quality using `image_picker` + `image_cropper`), upload to S3/CDN, then `POST /users/me/avatar` with URL

### Screens
- `ProfileScreen` with TabBar:
  1. **Game History** - Sports + casino bet history table with expandable details, date range picker, pagination
  2. **Profile** - Edit firstName, lastName, email (readonly), DOB (date picker), address, phone. Avatar upload with camera/gallery picker
  3. **Password** - Current password + new password with strength indicator
  4. **KYC** - Document upload placeholder (not yet implemented in backend)
  5. **Transactions** - Deposit/withdrawal history with date filters, pagination

Header area: User avatar (tappable to change), VIP level badge with progress bar, balance display

---

## Phase 9: Rewards Features (Day 37-41)

### Promotions
Mirrors [Promotions.tsx](player-frontend/src/pages/Promotions.tsx):
- `PromotionsRepository` - getAll, getBySlug, claim, claimDaily
- `PromotionsProvider`
- `PromotionsScreen` - Daily spin wheel card, mega jackpot card, daily/weekly/monthly bonus cards with countdown timers, VIP promo card, API-driven promo cards
- `PromotionDetailSheet` - Full promo details + claim button

### VIP
Mirrors [VIP.tsx](player-frontend/src/pages/VIP.tsx):
- `VipRepository` - getLevels, getStatus, getBenefits, claimCashback
- `VipLevelsProvider`, `VipStatusProvider`
- `VipScreen` - Current level banner with animated progress, tier cards (Starter → Bronze → Silver → Gold → Platinum → Diamond), XP tracking, benefits per tier, cashback claim button
- `VipStatusCard` widget (used in sidebar too)
- `VipTierCard`, `VipProgressBar` widgets

### Referrals
Mirrors [ReferFriend.tsx](player-frontend/src/pages/ReferFriend.tsx):
- `ReferralsRepository` - getStats, getReferrals, getCode
- `ReferralsProvider`
- `ReferFriendScreen` - Referral code display, copy button, share via `share_plus` (native share sheet), referral stats (total, earnings), referral list

### Prizes
Mirrors [Prizes.tsx](player-frontend/src/pages/Prizes.tsx):
- `PrizesRepository` - getStore, getCategories, getTiers, redeem, getRedemptions
- `PrizesProvider`
- `PrizesScreen` - Prize grid with category tabs, tier display
- `RedeemSheet` - Prize details + shipping address form + confirm

### Leaderboard
Mirrors [LeaderboardPage.tsx](player-frontend/src/pages/LeaderboardPage.tsx):
- `LeaderboardRepository` - getLeaderboard(period), getMyRank
- `LeaderboardProvider` - daily/weekly/monthly data + personal rank
  - Listens to WebSocket `leaderboard:updated` for real-time updates
  - Falls back to simulated updates if WebSocket unavailable (amount changes every 5s, positions every 7s - mirrors [useLeaderboardData.ts](player-frontend/src/hooks/useLeaderboardData.ts))
- `LeaderboardScreen` - Period tabs, ranking table with crown icons for top 3, user's rank highlighted
- `Leaderboard` widget (compact version for lobby + sidebar)

---

## Phase 10: Jackpot + Spin Wheel + Activity (Day 42-45)

### Jackpot (NEW - web app doesn't have a dedicated jackpot screen, but backend supports it)
- `JackpotRepository` - getAll, getCurrent, getWinners
- `JackpotProvider` - Listens to WebSocket events: `jackpot:value`, `jackpot:all_values`, `jackpot:won`, `jackpot:you_won`, `jackpot:near_miss`, `jackpot:milestone`
- `JackpotWidget` - Animated jackpot counter (used on promotions page + lobby)

### Spin Wheel
- `SpinWheelRepository` - getConfig, spin
- `SpinWheelProvider` - config (segments, spins remaining), cooldown timer, spin result
- `SpinGiftSheet` - Animated wheel using `CustomPainter` with rotation animation, sound effects (`audioplayers`), haptic feedback, result celebration (confetti via `lottie`)
- Sound effects: tick during spin, whoosh, win fanfare (replaces Web Audio API from [useSpinSounds.ts](player-frontend/src/hooks/useSpinSounds.ts))

### Activity Feed
- `ActivityRepository` - getRecentWins, getPublicWins, getLiveBets
- `ActivityProvider` - Listens to WebSocket `activity:new_big_win` for real-time updates, falls back to polling
- `RecentWins` widget - Scrolling ticker used on lobby
- `LastBets` widget - User's recent bets

### Notifications
- `NotificationsRepository` - getAll(page, unreadOnly), markAsRead(id), markAllAsRead
- `NotificationsProvider` - Listens to WebSocket `notification:new`, `count_updated`, `system`
- `NotificationsPanel` - Slide-in panel with 3 tabs (Promotions, Activity, System), unread badges, mark all as read

---

## Phase 11: Content + Static Pages + AMOE (Day 46-49)

### NeonPlayTV / Content
Mirrors [NeonPlayTV.tsx](player-frontend/src/pages/NeonPlayTV.tsx) (exists but not routed in web app):
- `ContentRepository` - getVideos(page, category, sort), getVideo(id), getFeatured, getLive, getCategories, trackView
- `ContentProvider`
- `ContentScreen` (NeonPlayTV) - Video categories (News, Winners, Tips, VIP, Tournaments, Community), episode grid with thumbnails and duration badges, live streams with LIVE badge + viewer count, pagination
- Video playback: Use `video_player` package or in-app browser for external video URLs

### CMS Content
- `CmsRepository` - getSettings, getBanners, getPage(slug), getAnnouncements
- `CmsProvider` - Site settings, hero banners, announcements
- `AnnouncementBanner` widget - Dismissible banner at top of lobby for site-wide announcements

### Static Content Pages
Shared `StaticContentPage` widget that renders CMS HTML/markdown:
- `TermsScreen`, `PrivacyScreen`, `ResponsibleGamblingScreen`, `ProvablyFairScreen`
- `FaqScreen` - FAQ categories + expandable accordion sections + support ticket submission
  - Uses `HelpRepository` - getFaqCategories, getFaqs(category), getFeaturedFaqs, submitTicket, getTickets

### AMOE
- `AmoeRepository` - getConfig, generate, submit, getHistory
- `AmoeProvider`
- `AmoeScreen` - AMOE code generation + submission form + entry history

### Settings
- `SettingsRepository` - getSettings, updateSettings, getPreferences, updatePreferences
- `SettingsProvider` + `ThemeProvider`

---

## Phase 12: Polish, Animations & Testing (Day 50-56)

### Animations (replacing GSAP)
Using `flutter_animate` package for declarative animations:
- **Scroll reveal**: `.animate().fadeIn().slideY()` triggered by `Visibility` widget
- **Staggered grids**: `.animate().fadeIn().slideY()` with `delay` based on index (mirrors [useScrollStagger.ts](player-frontend/src/hooks/useScrollStagger.ts))
- **Counter animation**: Animated number counting for balances, jackpot, leaderboard (mirrors [useCounterAnimation.ts](player-frontend/src/hooks/useCounterAnimation.ts))
- **Shimmer loading**: `shimmer` package for skeleton loading states on all data screens
- **Page transitions**: Custom fade/slide transitions in GoRouter
- **Glow pulse**: Animated BoxShadow with cyan/gold glow on CTAs
- **Float animation**: Gentle up/down float for characters/mascots
- **Confetti**: Lottie animation on wins, spin wheel results

### Haptic Feedback
- Bet placement: medium impact
- Spin wheel: light ticks during spin, heavy on result
- Favorite toggle: light impact
- Pull-to-refresh: selection tick

### Audio
- Spin wheel: tick, whoosh, win fanfare (using `audioplayers`)
- Bet placed: confirmation sound
- Win notification: celebration sound

### Error Handling
- Global error boundary widget (wraps all screens)
- Network error state with retry button
- Offline state detection via `connectivity_plus`
- Toast/snackbar system for user feedback

### Performance
- Image caching via `cached_network_image` with memory/disk cache
- List virtualization with `ListView.builder` / `GridView.builder`
- Lazy loading game grids (load more on scroll)
- Route-based code organization (no need for lazy loading - Dart compiles to native)

### Not Found
- `NotFoundScreen` - 404 page for invalid routes

### Testing
- **Unit tests** (40+):
  - TokenManager: set/get/clear/hasSession
  - CurrencyFormatter: all 16 currencies, edge cases (JPY 0 decimals, BTC 8 decimals)
  - AuthRepository: login, register, logout, refresh (mock Dio)
  - GamesRepository: getAll, getBySlug, launch (mock Dio)
  - BetslipProvider: addSelection, removeSelection, totalOdds, potentialWin (single vs combo vs system)
  - WalletProvider: balance update, currency switch, demo mode
  - RefreshInterceptor: 401 handling, queue, concurrent refresh prevention
- **Widget tests** (15+):
  - GameCard: renders thumbnail, name, provider; tap triggers navigation
  - CoinBalancePill: correct symbol + formatted amount
  - OddsButton: selected/unselected states
  - LoginBottomSheet: validation, error display
  - RegisterBottomSheet: 3-step flow, password strength
- **Integration tests** (5+):
  - Auth flow: register → lobby → logout → register
  - Game launch: navigate → tap play → WebView loads
  - Betslip: select odds → betslip opens → stake → place bet
  - Lobby navigation: sidebar ↔ bottom nav ↔ all sections
  - Wallet: open → deposit → amount → method

---

## Project Structure

```
neonplay_mobile/lib/
├── main.dart                          # Entry point, ProviderScope, dotenv
├── app.dart                           # MaterialApp.router, theme, GoRouter
│
├── core/
│   ├── config/
│   │   ├── app_config.dart            # API_BASE_URL, WS_URL from env
│   │   └── app_constants.dart         # Polling intervals, page sizes, limits
│   ├── network/
│   │   ├── dio_client.dart            # Dio instance with interceptors
│   │   ├── auth_interceptor.dart      # Bearer token + X-App-Platform header
│   │   ├── refresh_interceptor.dart   # 401 → refresh with mutex queue
│   │   ├── api_endpoints.dart         # All 90 endpoint paths
│   │   ├── api_exception.dart         # Typed exceptions
│   │   └── socket_manager.dart        # Socket.IO connection + event streams
│   ├── storage/
│   │   ├── secure_storage.dart        # flutter_secure_storage wrapper
│   │   ├── local_storage.dart         # shared_preferences wrapper
│   │   └── token_manager.dart         # Access (memory) + refresh (secure) tokens
│   ├── theme/
│   │   ├── app_colors.dart            # All HSL colors from CSS vars
│   │   ├── app_gradients.dart         # Primary, gold, VIP, card, hero
│   │   ├── app_shadows.dart           # Glow + card shadows
│   │   ├── app_text_styles.dart       # Inter + Orbitron styles
│   │   ├── app_dimensions.dart        # Radii, spacing, tap targets
│   │   └── app_theme.dart             # Dark ThemeData
│   ├── router/
│   │   ├── app_router.dart            # GoRouter with all 36 routes
│   │   ├── route_names.dart           # String constants
│   │   └── auth_guard.dart            # Redirect logic
│   ├── utils/
│   │   ├── currency_formatter.dart    # 16 currencies
│   │   ├── validators.dart            # Email, password, username
│   │   ├── extensions.dart            # Dart extensions
│   │   └── debouncer.dart             # Search debounce
│   └── widgets/                       # Shared across all features
│       ├── app_scaffold.dart          # Shell: header + drawer + bottom nav + body
│       ├── app_header.dart            # Balance pill, notifications, avatar
│       ├── app_sidebar.dart           # Drawer with 7 sections + widgets
│       ├── mobile_bottom_nav.dart     # 5-tab bottom bar
│       ├── footer.dart                # Links + social + legal
│       ├── notifications_panel.dart   # Slide-in 3-tab panel
│       ├── support_button.dart        # Floating support FAB
│       ├── game_card.dart             # Game thumbnail + overlay
│       ├── games_grid.dart            # Responsive grid
│       ├── games_section.dart         # Horizontal scroll row + "See All"
│       ├── providers_carousel.dart    # Provider logo scroll
│       ├── coin_balance_pill.dart     # Balance display
│       ├── section_header.dart        # Title + "See All" row
│       ├── loading_state.dart         # Shimmer skeleton
│       ├── error_state.dart           # Error + retry
│       ├── empty_state.dart           # Empty state illustration
│       ├── gradient_button.dart       # Cyan, gold, VIP variants
│       ├── glow_container.dart        # Card with glow effect
│       ├── cached_image.dart          # CachedNetworkImage wrapper
│       └── pull_to_refresh.dart       # Pull-to-refresh wrapper
│
├── features/
│   ├── auth/          (models/ repository/ providers/ screens/ widgets/)
│   ├── wallet/        (models/ repository/ providers/ screens/ widgets/)
│   ├── lobby/         (providers/ screens/ widgets/)
│   ├── games/         (models/ repository/ providers/ screens/ widgets/)
│   ├── sports/        (models/ repository/ providers/ screens/ widgets/)
│   ├── profile/       (repository/ providers/ screens/ widgets/)
│   ├── promotions/    (models/ repository/ providers/ screens/ widgets/)
│   ├── vip/           (models/ repository/ providers/ screens/ widgets/)
│   ├── leaderboard/   (models/ repository/ providers/ screens/ widgets/)
│   ├── referrals/     (models/ repository/ providers/ screens/ widgets/)
│   ├── prizes/        (models/ repository/ providers/ screens/ widgets/)
│   ├── jackpot/       (models/ repository/ providers/ widgets/)
│   ├── spin_wheel/    (models/ repository/ providers/ screens/ widgets/)
│   ├── notifications/ (models/ repository/ providers/ widgets/)
│   ├── activity/      (models/ repository/ providers/ widgets/)
│   ├── content/       (repository/ providers/ screens/ widgets/)
│   ├── amoe/          (models/ repository/ providers/ screens/)
│   ├── settings/      (repository/ providers/ widgets/)
│   └── help/          (repository/ providers/ screens/ widgets/)
```

---

## Scope Summary

| Metric | Count |
|--------|-------|
| Screens (full pages) | 34 |
| Bottom sheets / modals | 22 |
| Feature modules | 19 |
| Riverpod providers | ~40 |
| Repositories | 20 |
| Freezed models | ~35 |
| API endpoints | 90 |
| WebSocket event types | 16 |
| Shared widgets | 20 |
| Estimated Dart files | ~200 |
| Timeline | ~12 weeks (1 developer) |

---

## Verification Plan

After each phase, verify by:
1. `flutter analyze` - zero warnings/errors
2. `flutter test` - all unit + widget tests pass
3. Run on iOS Simulator + Android Emulator - visual parity check
4. Test API calls against local backend (`docker compose up`)
5. Compare each screen side-by-side with the web app
