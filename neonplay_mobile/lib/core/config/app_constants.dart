class AppConstants {
  // Polling intervals (seconds)
  static const int liveMatchesPollInterval = 30;
  static const int recentWinsPollInterval = 30;
  static const int publicWinsPollInterval = 60;
  static const int liveBetsPollInterval = 10;
  static const int liveVideosPollInterval = 60;
  static const int paymentStatusPollInterval = 3;

  // Pagination
  static const int defaultPageSize = 20;
  static const int gamesPageSize = 24;
  static const int leaderboardPageSize = 25;

  // Auth
  static const int otpLength = 6;
  static const int accessTokenExpirySeconds = 900; // 15 minutes

  // Rate limits (client-side throttle to avoid 429s)
  static const int maxRequestsPerMinute = 100;

  // UI
  static const double minTapTarget = 44.0;
  static const double defaultBorderRadius = 12.0;
  static const double headerHeight = 56.0;
  static const double bottomNavHeight = 64.0;
  static const double sidebarCollapsedWidth = 64.0;
  static const double sidebarExpandedWidth = 224.0;

  // Currencies
  static const List<String> fiatCurrencies = [
    'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'PHP', 'INR', 'THB', 'CNY', 'JPY',
  ];
  static const List<String> cryptoCurrencies = [
    'USDC', 'USDT', 'BTC', 'ETH', 'SOL', 'DOGE',
  ];
  static const List<String> allCurrencies = [
    ...fiatCurrencies,
    ...cryptoCurrencies,
  ];
}
