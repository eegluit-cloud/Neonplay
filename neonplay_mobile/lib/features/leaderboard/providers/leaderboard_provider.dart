import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/providers/auth_provider.dart';
import '../models/leaderboard_models.dart';
import '../repositories/leaderboard_repository.dart';

final leaderboardRepositoryProvider = Provider<LeaderboardRepository>((ref) {
  return LeaderboardRepository(ref.read(dioClientProvider));
});

/// All leaderboards from the backend (cached).
final allLeaderboardsProvider =
    FutureProvider<List<LeaderboardData>>((ref) async {
  final repo = ref.read(leaderboardRepositoryProvider);
  return repo.getLeaderboards();
});

/// Leaderboard entries filtered by period.
/// Falls back to simulated data when backend has no entries (matches website).
final leaderboardProvider =
    FutureProvider.family<List<LeaderboardEntry>, String>((ref, period) async {
  final boards = await ref.watch(allLeaderboardsProvider.future);
  for (final board in boards) {
    if (board.period == period && board.entries.isNotEmpty) {
      return board.entries;
    }
  }
  return _simulatedEntries(period);
});

/// Current user's rank.
final myRankProvider =
    FutureProvider.family<MyRank, String>((ref, period) async {
  try {
    final repo = ref.read(leaderboardRepositoryProvider);
    return repo.getMyRank(period: period);
  } catch (_) {
    final pos = switch (period) {
      'weekly' => 8,
      'monthly' => 15,
      _ => 21,
    };
    return MyRank(position: pos, score: 0);
  }
});

/// Currently selected period tab.
class LeaderboardPeriodNotifier extends Notifier<String> {
  @override
  String build() => 'daily';

  void setPeriod(String period) => state = period;
}

final leaderboardPeriodProvider =
    NotifierProvider<LeaderboardPeriodNotifier, String>(
  LeaderboardPeriodNotifier.new,
);

// ---------------------------------------------------------------------------
// Simulated data – mirrors useLeaderboardData.ts so both apps show the same.
// ---------------------------------------------------------------------------

List<LeaderboardEntry> _simulatedEntries(String period) {
  return switch (period) {
    'weekly' => _weeklyWinners,
    'monthly' => _monthlyWinners,
    _ => _dailyWinners,
  };
}

final _dailyWinners = <LeaderboardEntry>[
  LeaderboardEntry(rank: 1, id: 's1', username: 'Marcus Chen', score: 9954.34),
  LeaderboardEntry(rank: 2, id: 's2', username: 'Elena Rodriguez', score: 2658.25),
  LeaderboardEntry(rank: 3, id: 's3', username: 'Jake Thompson', score: 2549.87),
  LeaderboardEntry(rank: 4, id: 's4', username: 'Sofia Martinez', score: 1954.34),
  LeaderboardEntry(rank: 5, id: 's5', username: 'CryptoKing99', score: 1254.89),
  LeaderboardEntry(rank: 6, id: 's6', username: 'LuckyDragon', score: 954.12),
  LeaderboardEntry(rank: 7, id: 's7', username: 'DiamondQueen', score: 854.50),
  LeaderboardEntry(rank: 8, id: 's8', username: 'Alex Turner', score: 754.20),
  LeaderboardEntry(rank: 9, id: 's9', username: 'MegaWinner', score: 654.80),
  LeaderboardEntry(rank: 10, id: 's10', username: 'Isabella Costa', score: 554.60),
  LeaderboardEntry(rank: 11, id: 's11', username: 'HighRoller88', score: 510),
  LeaderboardEntry(rank: 12, id: 's12', username: 'Ryan Mitchell', score: 498),
  LeaderboardEntry(rank: 13, id: 's13', username: 'GoldenAce', score: 485),
  LeaderboardEntry(rank: 14, id: 's14', username: 'Emma Davis', score: 472),
  LeaderboardEntry(rank: 15, id: 's15', username: 'ProGambler', score: 458),
  LeaderboardEntry(rank: 16, id: 's16', username: 'Olivia Brown', score: 445),
  LeaderboardEntry(rank: 17, id: 's17', username: 'BetMaster', score: 432),
  LeaderboardEntry(rank: 18, id: 's18', username: 'Noah Wilson', score: 418),
  LeaderboardEntry(rank: 19, id: 's19', username: 'RichPlayer', score: 405),
  LeaderboardEntry(rank: 20, id: 's20', username: 'Mia Johnson', score: 392),
  LeaderboardEntry(rank: 21, id: 's21', username: 'WinStreak', score: 378),
  LeaderboardEntry(rank: 22, id: 's22', username: 'Liam Garcia', score: 365),
  LeaderboardEntry(rank: 23, id: 's23', username: 'SlotKing', score: 352),
  LeaderboardEntry(rank: 24, id: 's24', username: 'Ava Martinez', score: 338),
  LeaderboardEntry(rank: 25, id: 's25', username: 'JackpotHunter', score: 325),
];

final _weeklyWinners = <LeaderboardEntry>[
  LeaderboardEntry(rank: 1, id: 'sw1', username: 'Victoria Blake', score: 45820.50),
  LeaderboardEntry(rank: 2, id: 'sw2', username: 'DragonMaster', score: 38450.25),
  LeaderboardEntry(rank: 3, id: 'sw3', username: 'Carlos Mendez', score: 31200.80),
  LeaderboardEntry(rank: 4, id: 'sw4', username: 'WhaleKing', score: 28900),
  LeaderboardEntry(rank: 5, id: 'sw5', username: 'Sophie Laurent', score: 24500.75),
  LeaderboardEntry(rank: 6, id: 'sw6', username: 'MaxProfit', score: 21800.30),
  LeaderboardEntry(rank: 7, id: 'sw7', username: 'Akira Tanaka', score: 19650.45),
  LeaderboardEntry(rank: 8, id: 'sw8', username: 'LadyLuck777', score: 17200.20),
  LeaderboardEntry(rank: 9, id: 'sw9', username: 'Hans Mueller', score: 15800.90),
  LeaderboardEntry(rank: 10, id: 'sw10', username: 'CasinoQueen', score: 14200.55),
  LeaderboardEntry(rank: 11, id: 'sw11', username: 'Laura Rossi', score: 12900.40),
  LeaderboardEntry(rank: 12, id: 'sw12', username: 'BigWinner99', score: 11500.25),
  LeaderboardEntry(rank: 13, id: 'sw13', username: 'Pierre Dubois', score: 10800.70),
  LeaderboardEntry(rank: 14, id: 'sw14', username: 'SlotMachine', score: 9650.35),
  LeaderboardEntry(rank: 15, id: 'sw15', username: 'Anna Schmidt', score: 8900.80),
];

final _monthlyWinners = <LeaderboardEntry>[
  LeaderboardEntry(rank: 1, id: 'sm1', username: 'William Sterling', score: 285000),
  LeaderboardEntry(rank: 2, id: 'sm2', username: 'CryptoWhale', score: 198500.50),
  LeaderboardEntry(rank: 3, id: 'sm3', username: 'Yuki Yamamoto', score: 156200.25),
  LeaderboardEntry(rank: 4, id: 'sm4', username: 'DiamondKing', score: 132800.75),
  LeaderboardEntry(rank: 5, id: 'sm5', username: 'Alexander Volkov', score: 118900.30),
  LeaderboardEntry(rank: 6, id: 'sm6', username: 'GoldRush88', score: 98500.45),
  LeaderboardEntry(rank: 7, id: 'sm7', username: 'Isabella Romano', score: 87200.20),
  LeaderboardEntry(rank: 8, id: 'sm8', username: 'HighStakes', score: 76800.90),
  LeaderboardEntry(rank: 9, id: 'sm9', username: 'Chen Wei', score: 68500.55),
  LeaderboardEntry(rank: 10, id: 'sm10', username: 'VIPPlayer', score: 59200.40),
  LeaderboardEntry(rank: 11, id: 'sm11', username: 'Maria Santos', score: 52800.25),
  LeaderboardEntry(rank: 12, id: 'sm12', username: 'EliteGambler', score: 48500.70),
  LeaderboardEntry(rank: 13, id: 'sm13', username: 'David Park', score: 42100.35),
  LeaderboardEntry(rank: 14, id: 'sm14', username: 'LuckyCharm', score: 38900.80),
  LeaderboardEntry(rank: 15, id: 'sm15', username: 'Sarah Kim', score: 35200.15),
];
