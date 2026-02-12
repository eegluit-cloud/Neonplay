import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/providers/auth_provider.dart';
import '../models/sports_models.dart';
import '../repositories/sports_repository.dart';

final sportsRepositoryProvider = Provider<SportsRepository>((ref) {
  return SportsRepository(ref.read(dioClientProvider));
});

/// Available sports list.
final sportsListProvider = FutureProvider<List<SportModel>>((ref) async {
  try {
    final sports = await ref.read(sportsRepositoryProvider).getSports();
    if (sports.isNotEmpty) return sports;
  } catch (_) {}
  return _simulatedSports;
});

/// Currently selected sport filter.
class ActiveSportNotifier extends Notifier<String?> {
  @override
  String? build() => null;

  void setSport(String? slug) => state = slug;
}

final activeSportProvider = NotifierProvider<ActiveSportNotifier, String?>(
  ActiveSportNotifier.new,
);

/// Matches with current sport filter – falls back to simulated data.
final matchesProvider = FutureProvider<PaginatedMatches>((ref) async {
  final sportSlug = ref.watch(activeSportProvider);
  try {
    final repo = ref.read(sportsRepositoryProvider);
    final result = await repo.getMatches(sportSlug: sportSlug, limit: 20);
    if (result.data.isNotEmpty) return result;
  } catch (_) {}
  // Fall back to simulated matches filtered by sport
  final allMatches = _simulatedEventMatches;
  final filtered = sportSlug == null
      ? allMatches
      : allMatches.where((m) => m.sport?.slug == sportSlug).toList();
  return PaginatedMatches(data: filtered, total: filtered.length);
});

/// Live matches – falls back to simulated live matches.
final liveMatchesProvider = FutureProvider<List<MatchModel>>((ref) async {
  try {
    final matches = await ref.read(sportsRepositoryProvider).getLiveMatches();
    if (matches.isNotEmpty) return matches;
  } catch (_) {}
  return _simulatedEventMatches.where((m) => m.status == 'live').toList();
});

/// Featured / highlight matches for the sports carousel.
final featuredMatchesProvider = FutureProvider<List<MatchModel>>((ref) async {
  try {
    final matches =
        await ref.read(sportsRepositoryProvider).getFeaturedMatches();
    if (matches.isNotEmpty) return matches;
  } catch (_) {}
  return _simulatedHighlightMatches;
});

/// User's bet history.
final myBetsProvider = FutureProvider<PaginatedBets>((ref) async {
  return ref.read(sportsRepositoryProvider).getMyBets();
});

// ---------------------------------------------------------------------------
// Simulated sports data – matches sportsData.ts from the web app.
// ---------------------------------------------------------------------------

final _simulatedSports = <SportModel>[
  const SportModel(id: 's1', name: 'Soccer', slug: 'soccer', iconKey: 'soccer', sortOrder: 0),
  const SportModel(id: 's2', name: 'Counter-Strike', slug: 'csgo', iconKey: 'csgo', sortOrder: 1),
  const SportModel(id: 's3', name: 'Basketball', slug: 'basketball', iconKey: 'basketball', sortOrder: 2),
  const SportModel(id: 's4', name: 'Tennis', slug: 'tennis', iconKey: 'tennis', sortOrder: 3),
  const SportModel(id: 's5', name: 'Dota 2', slug: 'dota', iconKey: 'dota', sortOrder: 4),
  const SportModel(id: 's6', name: 'Ice Hockey', slug: 'hockey', iconKey: 'hockey', sortOrder: 5),
  const SportModel(id: 's7', name: 'Table Tennis', slug: 'tabletennis', iconKey: 'tabletennis', sortOrder: 6),
  const SportModel(id: 's8', name: 'American Football', slug: 'americanfootball', iconKey: 'americanfootball', sortOrder: 7),
  const SportModel(id: 's9', name: 'Handball', slug: 'handball', iconKey: 'handball', sortOrder: 8),
  const SportModel(id: 's10', name: 'Darts', slug: 'darts', iconKey: 'darts', sortOrder: 9),
];

const _soccerSport = SportModel(id: 's1', name: 'Soccer', slug: 'soccer', iconKey: 'soccer');
const _basketballSport = SportModel(id: 's3', name: 'Basketball', slug: 'basketball', iconKey: 'basketball');
const _tennisSport = SportModel(id: 's4', name: 'Tennis', slug: 'tennis', iconKey: 'tennis');

/// Team logo local assets – bundled in assets/images/teams/.
const _teamLogoUrls = <String, String>{
  'FC Barcelona': 'assets/images/teams/fc-barcelona.png',
  'Manchester City': 'assets/images/teams/manchester-city.png',
  'Arsenal FC': 'assets/images/teams/arsenal.png',
  'Chelsea FC': 'assets/images/teams/chelsea.png',
  'Memphis Grizzlies': 'assets/images/teams/memphis-grizzlies.png',
  'Orlando Magic': 'assets/images/teams/orlando-magic.png',
  'Houston Rockets': 'assets/images/teams/houston-rockets.png',
  'LA Lakers': 'assets/images/teams/la-lakers.png',
  'Real Sociedad': 'assets/images/teams/real-sociedad.png',
  'AC Milan': 'assets/images/teams/ac-milan.png',
  'US Lecce': 'assets/images/teams/us-lecce.png',
  'Atletico Madrid': 'assets/images/teams/atletico-madrid.png',
  'Deportivo Alaves': 'assets/images/teams/deportivo-alaves.png',
  'Paris Saint-Germain': 'assets/images/teams/psg.png',
  'Olympique Lyon': 'assets/images/teams/olympique-lyon.png',
  'Juventus FC': 'assets/images/teams/juventus.png',
  'Inter Milan': 'assets/images/teams/inter-milan.png',
  'Liverpool FC': 'assets/images/teams/liverpool.png',
  'Manchester United': 'assets/images/teams/manchester-united.png',
  'Golden State Warriors': 'assets/images/teams/golden-state-warriors.png',
  'Boston Celtics': 'assets/images/teams/boston-celtics.png',
  'Novak Djokovic': 'assets/images/teams/flag-serbia.png',
  'Carlos Alcaraz': 'assets/images/teams/flag-spain.png',
};

/// Injects team logo URLs into a match using the lookup map above.
MatchModel _withTeamLogos(MatchModel m) => m.copyWith(
  homeTeam: m.homeTeam.copyWith(logoUrl: _teamLogoUrls[m.homeTeam.name]),
  awayTeam: m.awayTeam.copyWith(logoUrl: _teamLogoUrls[m.awayTeam.name]),
);

/// Highlight matches (top featured carousel) – from sportsData.ts highlightMatches
final _simulatedHighlightMatches = <MatchModel>[
  MatchModel(
    id: 'h1',
    homeTeam: const TeamModel(id: 't1', name: 'FC Barcelona', shortName: 'BAR'),
    awayTeam: const TeamModel(id: 't2', name: 'Manchester City', shortName: 'MCI'),
    league: const LeagueModel(id: 'l1', name: 'International Champions League', slug: 'icl'),
    sport: _soccerSport,
    scheduledAt: DateTime.now().toIso8601String(),
    status: 'live',
    homeScore: 0,
    awayScore: 0,
    liveMinute: 8,
    livePeriod: '1st half',
    isFeatured: true,
    markets: [
      MarketModel(id: 'h1m1', type: '1x2', name: 'Match Winner', odds: [
        const OddModel(id: 'h1o1', selection: 'Home', value: 3.05),
        const OddModel(id: 'h1o2', selection: 'Draw', value: 3.35),
        const OddModel(id: 'h1o3', selection: 'Away', value: 2.10),
      ]),
    ],
  ),
  MatchModel(
    id: 'h2',
    homeTeam: const TeamModel(id: 't3', name: 'Arsenal FC', shortName: 'ARS'),
    awayTeam: const TeamModel(id: 't4', name: 'Chelsea FC', shortName: 'CHE'),
    league: const LeagueModel(id: 'l2', name: 'FA Cup', slug: 'fa-cup', country: 'England'),
    sport: _soccerSport,
    scheduledAt: DateTime.now().toIso8601String(),
    status: 'live',
    homeScore: 0,
    awayScore: 0,
    isFeatured: true,
    markets: [
      MarketModel(id: 'h2m1', type: '1x2', name: 'Match Winner', odds: [
        const OddModel(id: 'h2o1', selection: 'Home', value: 2.25),
        const OddModel(id: 'h2o2', selection: 'Draw', value: 3.35),
        const OddModel(id: 'h2o3', selection: 'Away', value: 3.25),
      ]),
    ],
  ),
  MatchModel(
    id: 'h3',
    homeTeam: const TeamModel(id: 't5', name: 'Memphis Grizzlies', shortName: 'MEM'),
    awayTeam: const TeamModel(id: 't6', name: 'Orlando Magic', shortName: 'ORL'),
    league: const LeagueModel(id: 'l3', name: 'NBA', slug: 'nba', country: 'USA'),
    sport: _basketballSport,
    scheduledAt: DateTime.now().toIso8601String(),
    status: 'upcoming',
    isFeatured: true,
    markets: [
      MarketModel(id: 'h3m1', type: '1x2', name: 'Match Winner', odds: [
        const OddModel(id: 'h3o1', selection: 'Home', value: 2.38),
        const OddModel(id: 'h3o2', selection: 'Draw', value: 3.35),
        const OddModel(id: 'h3o3', selection: 'Away', value: 1.58),
      ]),
    ],
  ),
  MatchModel(
    id: 'h4',
    homeTeam: const TeamModel(id: 't7', name: 'Houston Rockets', shortName: 'HOU'),
    awayTeam: const TeamModel(id: 't8', name: 'LA Lakers', shortName: 'LAL'),
    league: const LeagueModel(id: 'l3', name: 'NBA', slug: 'nba', country: 'USA'),
    sport: _basketballSport,
    scheduledAt: DateTime.now().toIso8601String(),
    status: 'upcoming',
    isFeatured: true,
    markets: [
      MarketModel(id: 'h4m1', type: '1x2', name: 'Match Winner', odds: [
        const OddModel(id: 'h4o1', selection: 'Home', value: 1.95),
        const OddModel(id: 'h4o2', selection: 'Draw', value: 3.35),
        const OddModel(id: 'h4o3', selection: 'Away', value: 1.85),
      ]),
    ],
  ),
].map(_withTeamLogos).toList();

/// Event matches (main list) – from sportsData.ts eventMatches
final _simulatedEventMatches = <MatchModel>[
  MatchModel(
    id: 'e1',
    homeTeam: const TeamModel(id: 'te1', name: 'Real Sociedad', shortName: 'RSO'),
    awayTeam: const TeamModel(id: 'te2', name: 'FC Barcelona', shortName: 'BAR'),
    league: const LeagueModel(id: 'le1', name: 'LaLiga', slug: 'laliga', country: 'Spain'),
    sport: _soccerSport,
    scheduledAt: DateTime.now().toIso8601String(),
    status: 'upcoming',
    markets: [
      MarketModel(id: 'e1m1', type: '1x2', name: 'Match Winner', odds: [
        const OddModel(id: 'e1o1', selection: 'Home', value: 4.70),
        const OddModel(id: 'e1o2', selection: 'Draw', value: 4.40),
        const OddModel(id: 'e1o3', selection: 'Away', value: 1.61),
      ]),
    ],
  ),
  MatchModel(
    id: 'e2',
    homeTeam: const TeamModel(id: 'te3', name: 'AC Milan', shortName: 'MIL'),
    awayTeam: const TeamModel(id: 'te4', name: 'US Lecce', shortName: 'LEC'),
    league: const LeagueModel(id: 'le2', name: 'Serie A', slug: 'serie-a', country: 'Italy'),
    sport: _soccerSport,
    scheduledAt: DateTime.now().toIso8601String(),
    status: 'upcoming',
    markets: [
      MarketModel(id: 'e2m1', type: '1x2', name: 'Match Winner', odds: [
        const OddModel(id: 'e2o1', selection: 'Home', value: 1.28),
        const OddModel(id: 'e2o2', selection: 'Draw', value: 5.20),
        const OddModel(id: 'e2o3', selection: 'Away', value: 11.00),
      ]),
    ],
  ),
  MatchModel(
    id: 'e3',
    homeTeam: const TeamModel(id: 'te5', name: 'Atletico Madrid', shortName: 'ATM'),
    awayTeam: const TeamModel(id: 'te6', name: 'Deportivo Alaves', shortName: 'ALA'),
    league: const LeagueModel(id: 'le1', name: 'LaLiga', slug: 'laliga', country: 'Spain'),
    sport: _soccerSport,
    scheduledAt: DateTime.now().toIso8601String(),
    status: 'live',
    homeScore: 1,
    awayScore: 0,
    liveMinute: 49,
    livePeriod: '2nd half',
    markets: [
      MarketModel(id: 'e3m1', type: '1x2', name: 'Match Winner', odds: [
        const OddModel(id: 'e3o1', selection: 'Home', value: 1.07),
        const OddModel(id: 'e3o2', selection: 'Draw', value: 8.25),
        const OddModel(id: 'e3o3', selection: 'Away', value: 50.00),
      ]),
    ],
  ),
  MatchModel(
    id: 'e4',
    homeTeam: const TeamModel(id: 'te7', name: 'Paris Saint-Germain', shortName: 'PSG'),
    awayTeam: const TeamModel(id: 'te8', name: 'Olympique Lyon', shortName: 'OL'),
    league: const LeagueModel(id: 'le3', name: 'Ligue 1', slug: 'ligue-1', country: 'France'),
    sport: _soccerSport,
    scheduledAt: DateTime.now().toIso8601String(),
    status: 'upcoming',
    markets: [
      MarketModel(id: 'e4m1', type: '1x2', name: 'Match Winner', odds: [
        const OddModel(id: 'e4o1', selection: 'Home', value: 1.45),
        const OddModel(id: 'e4o2', selection: 'Draw', value: 4.80),
        const OddModel(id: 'e4o3', selection: 'Away', value: 6.50),
      ]),
    ],
  ),
  MatchModel(
    id: 'e5',
    homeTeam: const TeamModel(id: 'te9', name: 'Juventus FC', shortName: 'JUV'),
    awayTeam: const TeamModel(id: 'te10', name: 'Inter Milan', shortName: 'INT'),
    league: const LeagueModel(id: 'le2', name: 'Serie A', slug: 'serie-a', country: 'Italy'),
    sport: _soccerSport,
    scheduledAt: DateTime.now().toIso8601String(),
    status: 'upcoming',
    markets: [
      MarketModel(id: 'e5m1', type: '1x2', name: 'Match Winner', odds: [
        const OddModel(id: 'e5o1', selection: 'Home', value: 2.80),
        const OddModel(id: 'e5o2', selection: 'Draw', value: 3.20),
        const OddModel(id: 'e5o3', selection: 'Away', value: 2.50),
      ]),
    ],
  ),
  MatchModel(
    id: 'e6',
    homeTeam: const TeamModel(id: 'te11', name: 'Liverpool FC', shortName: 'LIV'),
    awayTeam: const TeamModel(id: 'te12', name: 'Manchester United', shortName: 'MUN'),
    league: const LeagueModel(id: 'le4', name: 'Premier League', slug: 'premier-league', country: 'England'),
    sport: _soccerSport,
    scheduledAt: DateTime.now().add(const Duration(days: 1)).toIso8601String(),
    status: 'upcoming',
    markets: [
      MarketModel(id: 'e6m1', type: '1x2', name: 'Match Winner', odds: [
        const OddModel(id: 'e6o1', selection: 'Home', value: 1.65),
        const OddModel(id: 'e6o2', selection: 'Draw', value: 4.00),
        const OddModel(id: 'e6o3', selection: 'Away', value: 5.00),
      ]),
    ],
  ),
  MatchModel(
    id: 'e7',
    homeTeam: const TeamModel(id: 'te13', name: 'Golden State Warriors', shortName: 'GSW'),
    awayTeam: const TeamModel(id: 'te14', name: 'Boston Celtics', shortName: 'BOS'),
    league: const LeagueModel(id: 'l3', name: 'NBA', slug: 'nba', country: 'USA'),
    sport: _basketballSport,
    scheduledAt: DateTime.now().toIso8601String(),
    status: 'upcoming',
    markets: [
      MarketModel(id: 'e7m1', type: '1x2', name: 'Match Winner', odds: [
        const OddModel(id: 'e7o1', selection: 'Home', value: 2.10),
        const OddModel(id: 'e7o2', selection: 'Draw', value: 0),
        const OddModel(id: 'e7o3', selection: 'Away', value: 1.75),
      ]),
    ],
  ),
  MatchModel(
    id: 'e8',
    homeTeam: const TeamModel(id: 'te15', name: 'Novak Djokovic', shortName: 'DJO'),
    awayTeam: const TeamModel(id: 'te16', name: 'Carlos Alcaraz', shortName: 'ALC'),
    league: const LeagueModel(id: 'le5', name: 'ATP Tour', slug: 'atp', country: 'Australia'),
    sport: _tennisSport,
    scheduledAt: DateTime.now().add(const Duration(days: 1)).toIso8601String(),
    status: 'upcoming',
    markets: [
      MarketModel(id: 'e8m1', type: '1x2', name: 'Match Winner', odds: [
        const OddModel(id: 'e8o1', selection: 'Home', value: 1.85),
        const OddModel(id: 'e8o2', selection: 'Draw', value: 0),
        const OddModel(id: 'e8o3', selection: 'Away', value: 1.95),
      ]),
    ],
  ),
].map(_withTeamLogos).toList();
