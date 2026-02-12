import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/providers/auth_provider.dart';
import '../models/activity_models.dart';
import '../repositories/activity_repository.dart';

final activityRepositoryProvider = Provider<ActivityRepository>((ref) {
  return ActivityRepository(ref.read(dioClientProvider));
});

/// Recent big wins for the lobby ticker.
/// Falls back to simulated data matching the website's RecentWins component.
final recentWinsProvider = FutureProvider<List<RecentWin>>((ref) async {
  try {
    final repo = ref.read(activityRepositoryProvider);
    final wins = await repo.getPublicWins(limit: 20);
    if (wins.isNotEmpty) return wins;
  } catch (_) {
    // Fall through to simulated data
  }
  return _simulatedRecentWins;
});

// ---------------------------------------------------------------------------
// Simulated recent wins – exact match of RecentWins.tsx data.
// ---------------------------------------------------------------------------
final _simulatedRecentWins = <RecentWin>[
  RecentWin(id: 'rw1', username: 'Marcus C.', game: 'Big Bass Splash', amount: 712.80, gameImage: 'assets/images/games/big-bass-splash.png'),
  RecentWin(id: 'rw2', username: 'Elena R.', game: 'Video Poker', amount: 2050.00, gameImage: 'assets/images/games/2-hand-casino-holdem.png'),
  RecentWin(id: 'rw3', username: 'CryptoKing', game: 'Power Pops', amount: 628.30, gameImage: 'assets/images/games/power-pops.png'),
  RecentWin(id: 'rw4', username: 'Jake T.', game: 'Fire in the Hole', amount: 5836.00, gameImage: 'assets/images/games/thor-hammer-time.png'),
  RecentWin(id: 'rw5', username: 'LuckyDragon', game: 'Bonanza Trillion', amount: 537.90, gameImage: 'assets/images/games/bonanza-trillion.png'),
  RecentWin(id: 'rw6', username: 'Sofia M.', game: 'Crazy Time', amount: 4820.00, gameImage: 'assets/images/games/crazy-time.png'),
  RecentWin(id: 'rw7', username: 'DiamondQ', game: 'Candy Bonanza', amount: 456.00, gameImage: 'assets/images/games/candy-bonanza.png'),
  RecentWin(id: 'rw8', username: 'Alex T.', game: 'Striking Hot 5', amount: 4210.00, gameImage: 'assets/images/games/striking-hot-5.png'),
  RecentWin(id: 'rw9', username: 'MegaWin', game: 'Poison Eve', amount: 398.00, gameImage: 'assets/images/games/poison-eve.png'),
  RecentWin(id: 'rw10', username: 'Isabella C.', game: 'Dragon Pearls', amount: 3750.00, gameImage: 'assets/images/games/dragon-pearls.png'),
  RecentWin(id: 'rw11', username: 'HighRoller', game: 'Aztec Twist', amount: 352.00, gameImage: 'assets/images/games/aztec-twist.png'),
  RecentWin(id: 'rw12', username: 'Ryan M.', game: 'Fortune Rabbit', amount: 3290.00, gameImage: 'assets/images/games/fortune-rabbit.png'),
  RecentWin(id: 'rw13', username: 'GoldenAce', game: 'Gonzos Quest', amount: 306.00, gameImage: 'assets/images/games/gonzos-quest.png'),
  RecentWin(id: 'rw14', username: 'Emma D.', game: 'Mammoth Peak', amount: 2830.00, gameImage: 'assets/images/games/mammoth-peak.png'),
  RecentWin(id: 'rw15', username: 'ProGambler', game: 'Pirate Bonanza', amount: 260.00, gameImage: 'assets/images/games/pirate-bonanza.png'),
  RecentWin(id: 'rw16', username: 'Olivia B.', game: 'Thor Hammer', amount: 2370.00, gameImage: 'assets/images/games/thor-hammer-time.png'),
  RecentWin(id: 'rw17', username: 'BetMaster', game: 'Book of Fallen', amount: 214.00, gameImage: 'assets/images/games/book-of-fallen.png'),
  RecentWin(id: 'rw18', username: 'Noah W.', game: 'Sun of Egypt', amount: 1910.00, gameImage: 'assets/images/games/sun-of-egypt.png'),
  RecentWin(id: 'rw19', username: 'RichPlayer', game: 'Rhino Robbery', amount: 168.00, gameImage: 'assets/images/games/rhino-robbery.png'),
  RecentWin(id: 'rw20', username: 'Mia J.', game: 'Grab the Gold', amount: 1450.00, gameImage: 'assets/images/games/grab-the-gold.png'),
  RecentWin(id: 'rw21', username: 'WinStreak', game: 'Immortal Fruits', amount: 122.00, gameImage: 'assets/images/games/immortal-fruits.png'),
];
