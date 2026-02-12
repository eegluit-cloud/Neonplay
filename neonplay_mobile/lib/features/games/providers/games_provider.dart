import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/providers/auth_provider.dart';
import '../models/game_models.dart';
import '../repository/games_repository.dart';

final gamesRepositoryProvider = Provider<GamesRepository>((ref) {
  return GamesRepository(ref.read(dioClientProvider));
});

/// Paginated games list with optional filters.
/// Falls back to simulated games when the API is unavailable.
final gamesProvider = FutureProvider.family<PaginatedGames, GamesFilter>(
  (ref, filter) async {
    try {
      final repo = ref.read(gamesRepositoryProvider);
      final result = await repo.getAll(
        page: filter.page,
        category: filter.category,
        provider: filter.provider,
        search: filter.search,
        featured: filter.featured,
        hot: filter.hot,
        isNew: filter.isNew,
      );
      if (result.data.isNotEmpty) return result;
    } catch (_) {}

    // Client-side filtering on simulated data
    var games = _simulatedGames;
    if (filter.category != null) {
      games = games
          .where((g) => g.category?.slug == filter.category)
          .toList();
    }
    if (filter.provider != null) {
      games = games
          .where((g) => g.provider?.slug == filter.provider)
          .toList();
    }
    if (filter.search != null && filter.search!.isNotEmpty) {
      final q = filter.search!.toLowerCase();
      games = games
          .where((g) => g.name.toLowerCase().contains(q))
          .toList();
    }
    if (filter.hot == true) {
      games = games.where((g) => g.isHot || g.isFeatured).toList();
    }
    if (filter.isNew == true) {
      games = games.where((g) => g.isNew).toList();
    }
    if (filter.featured == true) {
      games = games.where((g) => g.isFeatured).toList();
    }
    return PaginatedGames(
      data: games,
      total: games.length,
      page: 1,
      limit: games.length,
    );
  },
);

/// Filter parameters for games queries.
class GamesFilter {
  final int page;
  final String? category;
  final String? provider;
  final String? search;
  final bool? featured;
  final bool? hot;
  final bool? isNew;

  const GamesFilter({
    this.page = 1,
    this.category,
    this.provider,
    this.search,
    this.featured,
    this.hot,
    this.isNew,
  });

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is GamesFilter &&
          page == other.page &&
          category == other.category &&
          provider == other.provider &&
          search == other.search &&
          featured == other.featured &&
          hot == other.hot &&
          isNew == other.isNew;

  @override
  int get hashCode => Object.hash(
        page,
        category,
        provider,
        search,
        featured,
        hot,
        isNew,
      );
}

/// All games (cached). Backend doesn't filter by boolean flags,
/// so we fetch everything once and filter client-side (same as web app).
/// Falls back to simulated games when API is unavailable.
final allGamesProvider = FutureProvider<List<GameModel>>((ref) async {
  try {
    final result = await ref.read(gamesRepositoryProvider).getAll(limit: 50);
    if (result.data.isNotEmpty) return result.data;
  } catch (_) {}
  return _simulatedGames;
});

/// Featured games – filtered client-side from all games.
final featuredGamesProvider = FutureProvider<List<GameModel>>((ref) async {
  final all = await ref.watch(allGamesProvider.future);
  final filtered = all.where((g) => g.isFeatured).toList();
  return filtered.isNotEmpty ? filtered : all.take(10).toList();
});

/// Hot games – filtered client-side from all games.
final hotGamesProvider = FutureProvider<List<GameModel>>((ref) async {
  final all = await ref.watch(allGamesProvider.future);
  final filtered = all.where((g) => g.isHot || g.isFeatured).toList();
  return filtered.isNotEmpty ? filtered : all.take(10).toList();
});

/// New games – filtered client-side from all games.
final newGamesProvider = FutureProvider<List<GameModel>>((ref) async {
  final all = await ref.watch(allGamesProvider.future);
  final filtered = all.where((g) => g.isNew).toList();
  return filtered.isNotEmpty ? filtered : all.take(10).toList();
});

/// Game categories – falls back to simulated data.
final gameCategoriesProvider =
    FutureProvider<List<GameCategoryModel>>((ref) async {
  try {
    final list = await ref.read(gamesRepositoryProvider).getCategories();
    if (list.isNotEmpty) return list;
  } catch (_) {}
  return _simulatedCategories;
});

/// Game providers – falls back to simulated data matching ProvidersCarousel.tsx.
/// Injects local logo assets for known providers when the API doesn't supply one.
final gameProvidersProvider =
    FutureProvider<List<GameProviderModel>>((ref) async {
  try {
    final list = await ref.read(gamesRepositoryProvider).getProviders();
    if (list.isNotEmpty) {
      return list.map((p) {
        if (p.logoUrl != null && p.logoUrl!.isNotEmpty) return p;
        final fallback = _providerLogoBySlug[p.slug];
        return fallback != null ? p.copyWith(logoUrl: fallback) : p;
      }).toList();
    }
  } catch (_) {}
  return _simulatedProviders;
});

// ---------------------------------------------------------------------------
// Simulated game categories.
// ---------------------------------------------------------------------------
const _simulatedCategories = <GameCategoryModel>[
  GameCategoryModel(id: 'slots', name: 'Slots', slug: 'slots'),
  GameCategoryModel(id: 'live-casino', name: 'Live Casino', slug: 'live-casino'),
  GameCategoryModel(id: 'crash', name: 'Crash Games', slug: 'crash-games'),
  GameCategoryModel(id: 'table', name: 'Table Games', slug: 'table-games'),
  GameCategoryModel(id: 'game-shows', name: 'Game Shows', slug: 'game-shows'),
  GameCategoryModel(id: 'blackjack', name: 'Blackjack', slug: 'blackjack'),
  GameCategoryModel(id: 'roulette', name: 'Roulette', slug: 'roulette'),
  GameCategoryModel(id: 'burst', name: 'Burst Games', slug: 'burst-games'),
];

// ---------------------------------------------------------------------------
// Provider logo lookup – used to inject local assets when API omits logoUrl.
// ---------------------------------------------------------------------------
const _providerLogoBySlug = <String, String>{
  'croco-gaming': 'assets/images/providers/croco.png',
  'jili': 'assets/images/providers/jili.png',
  'moka': 'assets/images/providers/moka.png',
  'amigo': 'assets/images/providers/amigo.png',
  'platipus': 'assets/images/providers/platipus.png',
  'jdb': 'assets/images/providers/jdb.png',
  'inout': 'assets/images/providers/inout.png',
  'nownow': 'assets/images/providers/nownow.png',
  'red-tiger': 'assets/images/providers/red-tiger.png',
  '3oaks': 'assets/images/providers/3oaks.png',
};

/// Curated providers for the lobby carousel — always uses local asset logos
/// (matches web's hardcoded ProvidersCarousel.tsx).
final carouselProvidersProvider =
    Provider<List<GameProviderModel>>((_) => _simulatedProviders);

// ---------------------------------------------------------------------------
// Simulated game providers – matches ProvidersCarousel.tsx data.
// ---------------------------------------------------------------------------
const _simulatedProviders = <GameProviderModel>[
  GameProviderModel(id: 'croco', name: 'Croco Gaming', slug: 'croco-gaming', logoUrl: 'assets/images/providers/croco.png'),
  GameProviderModel(id: 'jili', name: 'JILI', slug: 'jili', logoUrl: 'assets/images/providers/jili.png'),
  GameProviderModel(id: 'moka', name: 'Moka', slug: 'moka', logoUrl: 'assets/images/providers/moka.png'),
  GameProviderModel(id: 'amigo', name: 'Amigo', slug: 'amigo', logoUrl: 'assets/images/providers/amigo.png'),
  GameProviderModel(id: 'platipus', name: 'Platipus', slug: 'platipus', logoUrl: 'assets/images/providers/platipus.png'),
  GameProviderModel(id: 'jdb', name: 'JDB', slug: 'jdb', logoUrl: 'assets/images/providers/jdb.png'),
  GameProviderModel(id: 'inout', name: 'InOut', slug: 'inout', logoUrl: 'assets/images/providers/inout.png'),
  GameProviderModel(id: 'nownow', name: 'NowNow', slug: 'nownow', logoUrl: 'assets/images/providers/nownow.png'),
  GameProviderModel(id: 'redtiger', name: 'Red Tiger', slug: 'red-tiger', logoUrl: 'assets/images/providers/red-tiger.png'),
];

/// Favorites management.
class FavoritesNotifier extends Notifier<Set<String>> {
  @override
  Set<String> build() {
    _loadFavorites();
    return {};
  }

  Future<void> _loadFavorites() async {
    try {
      final repo = ref.read(gamesRepositoryProvider);
      final games = await repo.getFavorites();
      state = games.map((g) => g.id).toSet();
    } catch (_) {}
  }

  bool isFavorite(String gameId) => state.contains(gameId);

  Future<void> toggle(String gameId) async {
    final repo = ref.read(gamesRepositoryProvider);
    if (state.contains(gameId)) {
      state = {...state}..remove(gameId);
      try {
        await repo.removeFavorite(gameId);
      } catch (_) {
        state = {...state, gameId};
      }
    } else {
      state = {...state, gameId};
      try {
        await repo.addFavorite(gameId);
      } catch (_) {
        state = {...state}..remove(gameId);
      }
    }
  }
}

final favoritesProvider =
    NotifierProvider<FavoritesNotifier, Set<String>>(FavoritesNotifier.new);

// ---------------------------------------------------------------------------
// Simulated games – realistic data from backend seed for offline/fallback.
// Uses placeholder thumbnail URLs matching the seed's pattern.
// ---------------------------------------------------------------------------
const _placeholderThumb = 'https://placehold.co/400x300/1a1a2e/f4d03f?text=';

const _catSlots = GameCategoryModel(id: 'cat-slots', name: 'Slots', slug: 'slots');
const _catLive = GameCategoryModel(id: 'cat-live', name: 'Live Casino', slug: 'live-casino');
const _catCrash = GameCategoryModel(id: 'cat-crash', name: 'Crash Games', slug: 'crash-games');
const _catTable = GameCategoryModel(id: 'cat-table', name: 'Table Games', slug: 'table-games');
const _catShows = GameCategoryModel(id: 'cat-shows', name: 'Game Shows', slug: 'game-shows');
const _catBlackjack = GameCategoryModel(id: 'cat-bj', name: 'Blackjack', slug: 'blackjack');
const _catRoulette = GameCategoryModel(id: 'cat-rl', name: 'Roulette', slug: 'roulette');
const _catBurst = GameCategoryModel(id: 'cat-burst', name: 'Burst Games', slug: 'burst-games');

const _provPragmatic = GameProviderModel(id: 'prov-pragmatic', name: 'Pragmatic Play', slug: 'pragmatic-play');
const _provNetent = GameProviderModel(id: 'prov-netent', name: 'NetEnt', slug: 'netent');
const _provEvolution = GameProviderModel(id: 'prov-evolution', name: 'Evolution Gaming', slug: 'evolution');
const _provPlayngo = GameProviderModel(id: 'prov-playgo', name: "Play'n GO", slug: 'play-n-go');
const _provHacksaw = GameProviderModel(id: 'prov-hacksaw', name: 'Hacksaw Gaming', slug: 'hacksaw');
const _provCroco = GameProviderModel(id: 'croco', name: 'Croco Gaming', slug: 'croco-gaming', logoUrl: 'assets/images/providers/croco.png');
const _provJili = GameProviderModel(id: 'jili', name: 'JILI', slug: 'jili', logoUrl: 'assets/images/providers/jili.png');

final _simulatedGames = <GameModel>[
  // --- Slots ---
  GameModel(id: 'g1', name: 'Gates of Olympus', slug: 'gates-of-olympus',
    description: 'Tumble your way to divine wins', thumbnailUrl: '${_placeholderThumb}Gates+of+Olympus',
    rtp: 96.5, volatility: 'High', minBet: 0.10, maxBet: 1000, playCount: 15420,
    isFeatured: true, isHot: true, category: _catSlots, provider: _provPragmatic),
  GameModel(id: 'g2', name: 'Sweet Bonanza', slug: 'sweet-bonanza',
    description: 'Candy-filled slot with tumble wins', thumbnailUrl: '${_placeholderThumb}Sweet+Bonanza',
    rtp: 96.48, volatility: 'Medium-High', minBet: 0.20, maxBet: 500, playCount: 12300,
    isFeatured: true, isNew: true, category: _catSlots, provider: _provPragmatic),
  GameModel(id: 'g3', name: 'Starburst', slug: 'starburst',
    description: 'Classic gem slot with expanding wilds', thumbnailUrl: '${_placeholderThumb}Starburst',
    rtp: 96.09, volatility: 'Low', minBet: 0.10, maxBet: 200, playCount: 28900,
    isFeatured: true, category: _catSlots, provider: _provNetent),
  GameModel(id: 'g4', name: 'Book of Dead', slug: 'book-of-dead',
    description: 'Ancient Egypt adventure with free spins', thumbnailUrl: '${_placeholderThumb}Book+of+Dead',
    rtp: 96.21, volatility: 'High', minBet: 0.10, maxBet: 500, playCount: 19800,
    isHot: true, category: _catSlots, provider: _provPlayngo),
  GameModel(id: 'g5', name: 'Wanted Dead or a Wild', slug: 'wanted-dead-or-wild',
    description: 'Wild West bounty with massive multipliers', thumbnailUrl: '${_placeholderThumb}Wanted+Dead+or+Wild',
    rtp: 96.38, volatility: 'High', minBet: 0.20, maxBet: 1000, playCount: 8700,
    isFeatured: true, isNew: true, category: _catSlots, provider: _provHacksaw),
  GameModel(id: 'g6', name: 'Big Bass Bonanza', slug: 'big-bass-bonanza',
    description: 'Reel in big wins with the fisherman', thumbnailUrl: '${_placeholderThumb}Big+Bass+Bonanza',
    rtp: 96.71, volatility: 'High', minBet: 0.10, maxBet: 250, playCount: 11200,
    isHot: true, category: _catSlots, provider: _provPragmatic),
  GameModel(id: 'g7', name: 'Sugar Rush', slug: 'sugar-rush',
    description: 'Sweet grid slot with multipliers', thumbnailUrl: '${_placeholderThumb}Sugar+Rush',
    rtp: 96.50, volatility: 'High', minBet: 0.20, maxBet: 500, playCount: 9500,
    isNew: true, category: _catSlots, provider: _provPragmatic),
  GameModel(id: 'g8', name: 'Gonzo\'s Quest', slug: 'gonzos-quest',
    description: 'Avalanche slot with increasing multipliers', thumbnailUrl: '${_placeholderThumb}Gonzos+Quest',
    rtp: 95.97, volatility: 'Medium', minBet: 0.20, maxBet: 500, playCount: 22100,
    category: _catSlots, provider: _provNetent),
  GameModel(id: 'g9', name: 'Reactoonz', slug: 'reactoonz',
    description: 'Cluster pays with quirky aliens', thumbnailUrl: '${_placeholderThumb}Reactoonz',
    rtp: 96.51, volatility: 'High', minBet: 0.20, maxBet: 1000, playCount: 14300,
    isHot: true, category: _catSlots, provider: _provPlayngo),
  GameModel(id: 'g10', name: 'The Dog House', slug: 'the-dog-house',
    description: 'Sticky wilds and raining wilds', thumbnailUrl: '${_placeholderThumb}The+Dog+House',
    rtp: 96.51, volatility: 'High', minBet: 0.20, maxBet: 500, playCount: 10800,
    category: _catSlots, provider: _provPragmatic),
  GameModel(id: 'g11', name: 'Chaos Crew', slug: 'chaos-crew',
    description: 'Punk rock chaos with bonus features', thumbnailUrl: '${_placeholderThumb}Chaos+Crew',
    rtp: 96.40, volatility: 'Very High', minBet: 0.10, maxBet: 1000, playCount: 6500,
    isNew: true, category: _catSlots, provider: _provHacksaw),
  GameModel(id: 'g12', name: 'Fire Joker', slug: 'fire-joker',
    description: 'Classic 3-reel with respins', thumbnailUrl: '${_placeholderThumb}Fire+Joker',
    rtp: 96.15, volatility: 'High', minBet: 0.05, maxBet: 100, playCount: 17600,
    category: _catSlots, provider: _provPlayngo),

  // --- Live Casino ---
  GameModel(id: 'g13', name: 'Lightning Roulette', slug: 'lightning-roulette',
    description: 'Roulette with random multipliers up to 500x', thumbnailUrl: '${_placeholderThumb}Lightning+Roulette',
    rtp: 97.30, volatility: 'Medium', minBet: 0.20, maxBet: 10000, playCount: 31200,
    isFeatured: true, category: _catLive, provider: _provEvolution),
  GameModel(id: 'g14', name: 'Blackjack Live', slug: 'blackjack-live',
    description: 'Classic blackjack with live dealer', thumbnailUrl: '${_placeholderThumb}Blackjack+Live',
    rtp: 99.50, volatility: 'Low', minBet: 5.0, maxBet: 10000, playCount: 25400,
    isFeatured: true, category: _catLive, provider: _provEvolution),
  GameModel(id: 'g15', name: 'Baccarat Live', slug: 'baccarat-live',
    description: 'Elegant baccarat with squeeze', thumbnailUrl: '${_placeholderThumb}Baccarat+Live',
    rtp: 98.94, volatility: 'Low', minBet: 1.0, maxBet: 5000, playCount: 18700,
    category: _catLive, provider: _provEvolution),
  GameModel(id: 'g16', name: 'Speed Roulette', slug: 'speed-roulette',
    description: 'Fast-paced live roulette', thumbnailUrl: '${_placeholderThumb}Speed+Roulette',
    rtp: 97.30, volatility: 'Medium', minBet: 0.50, maxBet: 5000, playCount: 9800,
    isNew: true, category: _catLive, provider: _provEvolution),

  // --- Crash Games ---
  GameModel(id: 'g17', name: 'Aviator', slug: 'aviator',
    description: 'Cash out before the plane flies away', thumbnailUrl: '${_placeholderThumb}Aviator',
    rtp: 97.0, volatility: 'High', minBet: 0.10, maxBet: 1000, playCount: 42100,
    isFeatured: true, isHot: true, category: _catCrash, provider: _provPragmatic),
  GameModel(id: 'g18', name: 'Spaceman', slug: 'spaceman',
    description: 'Space-themed crash with dual bets', thumbnailUrl: '${_placeholderThumb}Spaceman',
    rtp: 96.50, volatility: 'High', minBet: 0.10, maxBet: 500, playCount: 15600,
    isNew: true, category: _catCrash, provider: _provPragmatic),
  GameModel(id: 'g19', name: 'JetX', slug: 'jetx',
    description: 'Jet-powered multiplier game', thumbnailUrl: '${_placeholderThumb}JetX',
    rtp: 96.0, volatility: 'High', minBet: 0.10, maxBet: 500, playCount: 8900,
    category: _catCrash, provider: _provCroco),
  GameModel(id: 'g20', name: 'Mines', slug: 'mines',
    description: 'Navigate the minefield for multipliers', thumbnailUrl: '${_placeholderThumb}Mines',
    rtp: 97.0, volatility: 'Medium', minBet: 0.10, maxBet: 1000, playCount: 11300,
    isHot: true, category: _catCrash, provider: _provCroco),

  // --- Game Shows ---
  GameModel(id: 'g21', name: 'Crazy Time', slug: 'crazy-time',
    description: 'Spin the wheel for bonus rounds', thumbnailUrl: '${_placeholderThumb}Crazy+Time',
    rtp: 95.50, volatility: 'Medium', minBet: 0.10, maxBet: 2500, playCount: 35800,
    isFeatured: true, isHot: true, category: _catShows, provider: _provEvolution),
  GameModel(id: 'g22', name: 'Monopoly Live', slug: 'monopoly-live',
    description: 'Board game meets live casino', thumbnailUrl: '${_placeholderThumb}Monopoly+Live',
    rtp: 96.23, volatility: 'Medium', minBet: 0.10, maxBet: 5000, playCount: 21400,
    isFeatured: true, category: _catShows, provider: _provEvolution),
  GameModel(id: 'g23', name: 'Dream Catcher', slug: 'dream-catcher',
    description: 'Money wheel game show', thumbnailUrl: '${_placeholderThumb}Dream+Catcher',
    rtp: 96.58, volatility: 'Low', minBet: 0.10, maxBet: 2500, playCount: 16200,
    category: _catShows, provider: _provEvolution),

  // --- Table Games ---
  GameModel(id: 'g24', name: 'European Roulette', slug: 'european-roulette',
    description: 'Single-zero roulette classic', thumbnailUrl: '${_placeholderThumb}European+Roulette',
    rtp: 97.30, volatility: 'Medium', minBet: 0.50, maxBet: 5000, playCount: 14100,
    category: _catTable, provider: _provNetent),
  GameModel(id: 'g25', name: 'Blackjack Classic', slug: 'blackjack-classic',
    description: 'Classic 21 card game', thumbnailUrl: '${_placeholderThumb}Blackjack+Classic',
    rtp: 99.50, volatility: 'Low', minBet: 1.0, maxBet: 5000, playCount: 20300,
    category: _catTable, provider: _provNetent),
  GameModel(id: 'g26', name: 'Texas Hold\'em Bonus', slug: 'texas-holdem-bonus',
    description: 'Casino poker with bonus bets', thumbnailUrl: '${_placeholderThumb}Texas+Holdem',
    rtp: 97.96, volatility: 'Medium', minBet: 1.0, maxBet: 2500, playCount: 7800,
    category: _catTable, provider: _provPlayngo),

  // --- Blackjack ---
  GameModel(id: 'g27', name: 'Blackjack VIP', slug: 'blackjack-vip',
    description: 'High-stakes live blackjack', thumbnailUrl: '${_placeholderThumb}Blackjack+VIP',
    rtp: 99.50, volatility: 'Low', minBet: 50.0, maxBet: 25000, playCount: 5200,
    isFeatured: true, category: _catBlackjack, provider: _provEvolution),
  GameModel(id: 'g28', name: 'Infinite Blackjack', slug: 'infinite-blackjack',
    description: 'Unlimited seats live blackjack', thumbnailUrl: '${_placeholderThumb}Infinite+Blackjack',
    rtp: 99.47, volatility: 'Low', minBet: 1.0, maxBet: 5000, playCount: 11600,
    isNew: true, category: _catBlackjack, provider: _provEvolution),

  // --- Roulette ---
  GameModel(id: 'g29', name: 'Immersive Roulette', slug: 'immersive-roulette',
    description: 'Multi-camera cinematic roulette', thumbnailUrl: '${_placeholderThumb}Immersive+Roulette',
    rtp: 97.30, volatility: 'Medium', minBet: 0.50, maxBet: 10000, playCount: 13400,
    isFeatured: true, category: _catRoulette, provider: _provEvolution),
  GameModel(id: 'g30', name: 'Auto Roulette', slug: 'auto-roulette',
    description: 'Automated roulette with fast rounds', thumbnailUrl: '${_placeholderThumb}Auto+Roulette',
    rtp: 97.30, volatility: 'Medium', minBet: 0.10, maxBet: 5000, playCount: 8700,
    category: _catRoulette, provider: _provEvolution),

  // --- Burst Games ---
  GameModel(id: 'g31', name: 'Plinko', slug: 'plinko',
    description: 'Drop the ball for multipliers', thumbnailUrl: '${_placeholderThumb}Plinko',
    rtp: 97.0, volatility: 'Medium', minBet: 0.10, maxBet: 1000, playCount: 19400,
    isHot: true, category: _catBurst, provider: _provCroco),
  GameModel(id: 'g32', name: 'Dice', slug: 'dice',
    description: 'Predict the roll and win', thumbnailUrl: '${_placeholderThumb}Dice',
    rtp: 99.0, volatility: 'Low', minBet: 0.01, maxBet: 1000, playCount: 22800,
    category: _catBurst, provider: _provCroco),
  GameModel(id: 'g33', name: 'Limbo', slug: 'limbo',
    description: 'Set your target multiplier', thumbnailUrl: '${_placeholderThumb}Limbo',
    rtp: 97.0, volatility: 'High', minBet: 0.10, maxBet: 1000, playCount: 14500,
    isNew: true, category: _catBurst, provider: _provJili),

  // --- Extra Slots (more variety) ---
  GameModel(id: 'g34', name: 'Wild West Gold', slug: 'wild-west-gold',
    description: 'Sticky wilds in the frontier', thumbnailUrl: '${_placeholderThumb}Wild+West+Gold',
    rtp: 96.51, volatility: 'High', minBet: 0.20, maxBet: 500, playCount: 13200,
    isHot: true, category: _catSlots, provider: _provPragmatic),
  GameModel(id: 'g35', name: 'Dead or Alive 2', slug: 'dead-or-alive-2',
    description: 'Legendary high volatility slot', thumbnailUrl: '${_placeholderThumb}Dead+or+Alive+2',
    rtp: 96.82, volatility: 'Very High', minBet: 0.09, maxBet: 500, playCount: 16800,
    category: _catSlots, provider: _provNetent),
  GameModel(id: 'g36', name: 'Rise of Olympus', slug: 'rise-of-olympus',
    description: 'Greek gods grid slot', thumbnailUrl: '${_placeholderThumb}Rise+of+Olympus',
    rtp: 96.50, volatility: 'High', minBet: 0.20, maxBet: 500, playCount: 11900,
    category: _catSlots, provider: _provPlayngo),
];
