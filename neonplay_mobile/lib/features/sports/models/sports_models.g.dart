// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'sports_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_SportModel _$SportModelFromJson(Map<String, dynamic> json) => _SportModel(
  id: json['id'] as String,
  name: json['name'] as String,
  slug: json['slug'] as String,
  iconKey: json['iconKey'] as String?,
  isActive: json['isActive'] as bool? ?? true,
  sortOrder: (json['sortOrder'] as num?)?.toInt() ?? 0,
);

Map<String, dynamic> _$SportModelToJson(_SportModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'slug': instance.slug,
      'iconKey': instance.iconKey,
      'isActive': instance.isActive,
      'sortOrder': instance.sortOrder,
    };

_LeagueModel _$LeagueModelFromJson(Map<String, dynamic> json) => _LeagueModel(
  id: json['id'] as String,
  name: json['name'] as String,
  slug: json['slug'] as String,
  sportId: json['sportId'] as String?,
  country: json['country'] as String?,
  countryFlag: json['countryFlag'] as String?,
  logoUrl: json['logoUrl'] as String?,
  isActive: json['isActive'] as bool? ?? true,
);

Map<String, dynamic> _$LeagueModelToJson(_LeagueModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'slug': instance.slug,
      'sportId': instance.sportId,
      'country': instance.country,
      'countryFlag': instance.countryFlag,
      'logoUrl': instance.logoUrl,
      'isActive': instance.isActive,
    };

_TeamModel _$TeamModelFromJson(Map<String, dynamic> json) => _TeamModel(
  id: json['id'] as String,
  name: json['name'] as String,
  shortName: json['shortName'] as String?,
  slug: json['slug'] as String?,
  logoUrl: json['logoUrl'] as String?,
);

Map<String, dynamic> _$TeamModelToJson(_TeamModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'shortName': instance.shortName,
      'slug': instance.slug,
      'logoUrl': instance.logoUrl,
    };

_OddModel _$OddModelFromJson(Map<String, dynamic> json) => _OddModel(
  id: json['id'] as String,
  selection: json['selection'] as String,
  value: (json['value'] as num).toDouble(),
  isActive: json['isActive'] as bool? ?? true,
);

Map<String, dynamic> _$OddModelToJson(_OddModel instance) => <String, dynamic>{
  'id': instance.id,
  'selection': instance.selection,
  'value': instance.value,
  'isActive': instance.isActive,
};

_MarketModel _$MarketModelFromJson(Map<String, dynamic> json) => _MarketModel(
  id: json['id'] as String,
  type: json['type'] as String,
  name: json['name'] as String,
  line: (json['line'] as num?)?.toDouble(),
  isActive: json['isActive'] as bool? ?? true,
  isSuspended: json['isSuspended'] as bool? ?? false,
  odds:
      (json['odds'] as List<dynamic>?)
          ?.map((e) => OddModel.fromJson(e as Map<String, dynamic>))
          .toList() ??
      const [],
);

Map<String, dynamic> _$MarketModelToJson(_MarketModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'type': instance.type,
      'name': instance.name,
      'line': instance.line,
      'isActive': instance.isActive,
      'isSuspended': instance.isSuspended,
      'odds': instance.odds,
    };

_MatchModel _$MatchModelFromJson(Map<String, dynamic> json) => _MatchModel(
  id: json['id'] as String,
  sportId: json['sportId'] as String?,
  leagueId: json['leagueId'] as String?,
  homeTeam: TeamModel.fromJson(json['homeTeam'] as Map<String, dynamic>),
  awayTeam: TeamModel.fromJson(json['awayTeam'] as Map<String, dynamic>),
  league: json['league'] == null
      ? null
      : LeagueModel.fromJson(json['league'] as Map<String, dynamic>),
  sport: json['sport'] == null
      ? null
      : SportModel.fromJson(json['sport'] as Map<String, dynamic>),
  scheduledAt: json['scheduledAt'] as String,
  startedAt: json['startedAt'] as String?,
  status: json['status'] as String? ?? 'upcoming',
  homeScore: (json['homeScore'] as num?)?.toInt(),
  awayScore: (json['awayScore'] as num?)?.toInt(),
  liveMinute: (json['liveMinute'] as num?)?.toInt(),
  livePeriod: json['livePeriod'] as String?,
  isFeatured: json['isFeatured'] as bool? ?? false,
  markets:
      (json['markets'] as List<dynamic>?)
          ?.map((e) => MarketModel.fromJson(e as Map<String, dynamic>))
          .toList() ??
      const [],
);

Map<String, dynamic> _$MatchModelToJson(_MatchModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'sportId': instance.sportId,
      'leagueId': instance.leagueId,
      'homeTeam': instance.homeTeam,
      'awayTeam': instance.awayTeam,
      'league': instance.league,
      'sport': instance.sport,
      'scheduledAt': instance.scheduledAt,
      'startedAt': instance.startedAt,
      'status': instance.status,
      'homeScore': instance.homeScore,
      'awayScore': instance.awayScore,
      'liveMinute': instance.liveMinute,
      'livePeriod': instance.livePeriod,
      'isFeatured': instance.isFeatured,
      'markets': instance.markets,
    };

_PaginatedMatches _$PaginatedMatchesFromJson(Map<String, dynamic> json) =>
    _PaginatedMatches(
      data: (json['data'] as List<dynamic>)
          .map((e) => MatchModel.fromJson(e as Map<String, dynamic>))
          .toList(),
      total: (json['total'] as num?)?.toInt() ?? 0,
      page: (json['page'] as num?)?.toInt() ?? 1,
      limit: (json['limit'] as num?)?.toInt() ?? 20,
    );

Map<String, dynamic> _$PaginatedMatchesToJson(_PaginatedMatches instance) =>
    <String, dynamic>{
      'data': instance.data,
      'total': instance.total,
      'page': instance.page,
      'limit': instance.limit,
    };

_BetSelectionModel _$BetSelectionModelFromJson(Map<String, dynamic> json) =>
    _BetSelectionModel(
      matchId: json['matchId'] as String,
      marketId: json['marketId'] as String,
      oddId: json['oddId'] as String,
      selection: json['selection'] as String,
      oddsAtPlacement: (json['oddsAtPlacement'] as num).toDouble(),
      matchName: json['matchName'] as String,
      market: json['market'] as String,
      league: json['league'] as String?,
      homeTeam: json['homeTeam'] == null
          ? null
          : TeamModel.fromJson(json['homeTeam'] as Map<String, dynamic>),
      awayTeam: json['awayTeam'] == null
          ? null
          : TeamModel.fromJson(json['awayTeam'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$BetSelectionModelToJson(_BetSelectionModel instance) =>
    <String, dynamic>{
      'matchId': instance.matchId,
      'marketId': instance.marketId,
      'oddId': instance.oddId,
      'selection': instance.selection,
      'oddsAtPlacement': instance.oddsAtPlacement,
      'matchName': instance.matchName,
      'market': instance.market,
      'league': instance.league,
      'homeTeam': instance.homeTeam,
      'awayTeam': instance.awayTeam,
    };

_BetModel _$BetModelFromJson(Map<String, dynamic> json) => _BetModel(
  id: json['id'] as String,
  type: json['type'] as String,
  currency: json['currency'] as String,
  stake: (json['stake'] as num).toDouble(),
  totalOdds: (json['totalOdds'] as num).toDouble(),
  potentialWin: (json['potentialWin'] as num).toDouble(),
  actualWin: (json['actualWin'] as num?)?.toDouble(),
  status: json['status'] as String? ?? 'pending',
  placedAt: json['placedAt'] as String,
  settledAt: json['settledAt'] as String?,
  selections:
      (json['selections'] as List<dynamic>?)
          ?.map((e) => BetSelectionModel.fromJson(e as Map<String, dynamic>))
          .toList() ??
      const [],
);

Map<String, dynamic> _$BetModelToJson(_BetModel instance) => <String, dynamic>{
  'id': instance.id,
  'type': instance.type,
  'currency': instance.currency,
  'stake': instance.stake,
  'totalOdds': instance.totalOdds,
  'potentialWin': instance.potentialWin,
  'actualWin': instance.actualWin,
  'status': instance.status,
  'placedAt': instance.placedAt,
  'settledAt': instance.settledAt,
  'selections': instance.selections,
};

_PaginatedBets _$PaginatedBetsFromJson(Map<String, dynamic> json) =>
    _PaginatedBets(
      data: (json['data'] as List<dynamic>)
          .map((e) => BetModel.fromJson(e as Map<String, dynamic>))
          .toList(),
      total: (json['total'] as num?)?.toInt() ?? 0,
      page: (json['page'] as num?)?.toInt() ?? 1,
      limit: (json['limit'] as num?)?.toInt() ?? 20,
    );

Map<String, dynamic> _$PaginatedBetsToJson(_PaginatedBets instance) =>
    <String, dynamic>{
      'data': instance.data,
      'total': instance.total,
      'page': instance.page,
      'limit': instance.limit,
    };
