/// All API endpoint paths matching player-backend routes.
class ApiEndpoints {
  // Auth
  static const String register = '/auth/register';
  static const String login = '/auth/login';
  static const String logout = '/auth/logout';
  static const String me = '/auth/me';
  static const String refresh = '/auth/refresh';
  static const String forgotPassword = '/auth/forgot-password';
  static const String resetPassword = '/auth/reset-password';
  static const String verifyEmail = '/auth/verify-email';
  static const String verifyPhone = '/auth/verify-phone';
  static const String resendVerification = '/auth/resend-verification';
  static const String changePassword = '/auth/me/change-password';

  // Games
  static const String games = '/games';
  static String gameBySlug(String slug) => '/games/$slug';
  static const String gameCategories = '/games/categories';
  static const String gameProviders = '/providers';
  static String launchGame(String slug) => '/games/$slug/launch';
  static const String favorites = '/games/favorites';
  static String favorite(String gameId) => '/games/favorites/$gameId';

  // Wallet
  static const String wallet = '/wallet';
  static const String walletTransactions = '/wallet/transactions';
  static const String walletPurchase = '/wallet/purchase';
  static const String walletPackages = '/wallet/packages';
  static const String walletPaymentMethods = '/wallet/payment-methods';
  static const String walletCryptoOptions = '/wallet/crypto-options';

  // Pay247
  static const String pay247CreateDeposit = '/payment/pay247/deposit/create';
  static const String pay247CreateWithdrawal = '/payment/pay247/withdrawal/create';
  static String pay247DepositStatus(String orderId) =>
      '/payment/pay247/deposit/$orderId/status';
  static String pay247WithdrawalStatus(String orderId) =>
      '/payment/pay247/withdrawal/$orderId/status';

  // Leaderboard
  static const String leaderboard = '/leaderboard';
  static const String leaderboardMe = '/leaderboard/me';

  // Promotions
  static const String promotions = '/promotions';
  static String promotion(String slug) => '/promotions/$slug';
  static String claimPromotion(String slug) => '/promotions/$slug/claim';
  static const String claimDaily = '/promotions/daily/claim';

  // VIP
  static const String vipLevels = '/vip/levels';
  static const String vipStatus = '/vip/status';
  static const String vipBenefits = '/vip/benefits';
  static const String vipClaimCashback = '/vip/cashback/claim';

  // Referrals
  static const String referralStats = '/referrals/stats';
  static const String referrals = '/referrals';
  static const String referralCode = '/referrals/code';

  // Notifications
  static const String notifications = '/notifications';
  static String markNotificationRead(String id) => '/notifications/$id/read';
  static const String markAllNotificationsRead = '/notifications/read-all';

  // Users
  static const String userProfile = '/users/profile';
  static const String userAvatar = '/users/me/avatar';

  // Settings
  static const String settings = '/settings';
  static const String settingsPreferences = '/settings/preferences';

  // AMOE
  static const String amoeConfig = '/amoe/config';
  static const String amoeGenerate = '/amoe/generate';
  static const String amoeSubmit = '/amoe/submit';
  static const String amoeHistory = '/amoe/history';

  // Content / Videos
  static const String contentVideos = '/content/videos';
  static String contentVideo(String id) => '/content/videos/$id';
  static const String contentVideosFeatured = '/content/videos/featured';
  static const String contentVideosLive = '/content/videos/live';
  static const String contentCategories = '/content/categories';
  static String trackVideoView(String videoId) =>
      '/content/videos/$videoId/track';

  // Prizes
  static const String prizes = '/prizes';
  static const String prizeStore = '/prizes/store';
  static const String prizeCategories = '/prizes/categories';
  static const String prizeTiers = '/prizes/tiers';
  static String redeemPrize(String prizeId) => '/prizes/redeem/$prizeId';
  static const String prizeRedemptions = '/prizes/user/redemptions';

  // Sports
  static const String sports = '/sports';
  static const String sportsLeagues = '/sports/leagues';
  static const String sportsMatches = '/sports/matches';
  static String sportsMatch(String matchId) => '/sports/matches/$matchId';
  static const String sportsBets = '/sports/bets';

  // Spin Wheel
  static const String spinWheelConfig = '/promotions/spin-wheel/config';
  static const String spinWheelSpin = '/promotions/spin-wheel/spin';

  // CMS
  static const String cmsSettings = '/cms/settings';
  static const String cmsBanners = '/cms/banners';
  static String cmsPage(String slug) => '/cms/pages/$slug';
  static const String cmsAnnouncements = '/cms/announcements';

  // Help / FAQ
  static const String helpFaqCategories = '/help/faq/categories';
  static const String helpFaq = '/help/faq';
  static const String helpFaqFeatured = '/help/faq/featured';
  static const String helpTickets = '/help/tickets';

  // Jackpot
  static const String jackpot = '/jackpot';
  static const String jackpotCurrent = '/jackpot/current';
  static const String jackpotWinners = '/jackpot/winners';

  // Activity
  static const String activityWins = '/activity/wins';
  static const String activityPublicWins = '/activity/public-wins';
  static const String activityLiveBets = '/activity/live-bets';

  // Health
  static const String health = '/health';
}
