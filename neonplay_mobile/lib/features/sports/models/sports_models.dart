import 'package:freezed_annotation/freezed_annotation.dart';

part 'sports_models.freezed.dart';
part 'sports_models.g.dart';

@freezed
abstract class SportModel with _$SportModel {
  const factory SportModel({
    required String id,
    required String name,
    required String slug,
    String? iconKey,
    @Default(true) bool isActive,
    @Default(0) int sortOrder,
  }) = _SportModel;

  factory SportModel.fromJson(Map<String, dynamic> json) =>
      _$SportModelFromJson(json);
}

@freezed
abstract class LeagueModel with _$LeagueModel {
  const factory LeagueModel({
    required String id,
    required String name,
    required String slug,
    String? sportId,
    String? country,
    String? countryFlag,
    String? logoUrl,
    @Default(true) bool isActive,
  }) = _LeagueModel;

  factory LeagueModel.fromJson(Map<String, dynamic> json) =>
      _$LeagueModelFromJson(json);
}

@freezed
abstract class TeamModel with _$TeamModel {
  const factory TeamModel({
    required String id,
    required String name,
    String? shortName,
    String? slug,
    String? logoUrl,
  }) = _TeamModel;

  factory TeamModel.fromJson(Map<String, dynamic> json) =>
      _$TeamModelFromJson(json);
}

@freezed
abstract class OddModel with _$OddModel {
  const factory OddModel({
    required String id,
    required String selection,
    required double value,
    @Default(true) bool isActive,
  }) = _OddModel;

  factory OddModel.fromJson(Map<String, dynamic> json) =>
      _$OddModelFromJson(json);
}

@freezed
abstract class MarketModel with _$MarketModel {
  const factory MarketModel({
    required String id,
    required String type,
    required String name,
    double? line,
    @Default(true) bool isActive,
    @Default(false) bool isSuspended,
    @Default([]) List<OddModel> odds,
  }) = _MarketModel;

  factory MarketModel.fromJson(Map<String, dynamic> json) =>
      _$MarketModelFromJson(json);
}

@freezed
abstract class MatchModel with _$MatchModel {
  const factory MatchModel({
    required String id,
    String? sportId,
    String? leagueId,
    required TeamModel homeTeam,
    required TeamModel awayTeam,
    LeagueModel? league,
    SportModel? sport,
    required String scheduledAt,
    String? startedAt,
    @Default('upcoming') String status,
    int? homeScore,
    int? awayScore,
    int? liveMinute,
    String? livePeriod,
    @Default(false) bool isFeatured,
    @Default([]) List<MarketModel> markets,
  }) = _MatchModel;

  factory MatchModel.fromJson(Map<String, dynamic> json) =>
      _$MatchModelFromJson(json);
}

@freezed
abstract class PaginatedMatches with _$PaginatedMatches {
  const factory PaginatedMatches({
    required List<MatchModel> data,
    @Default(0) int total,
    @Default(1) int page,
    @Default(20) int limit,
  }) = _PaginatedMatches;

  factory PaginatedMatches.fromJson(Map<String, dynamic> json) =>
      _$PaginatedMatchesFromJson(json);
}

@freezed
abstract class BetSelectionModel with _$BetSelectionModel {
  const factory BetSelectionModel({
    required String matchId,
    required String marketId,
    required String oddId,
    required String selection,
    required double oddsAtPlacement,
    required String matchName,
    required String market,
    String? league,
    TeamModel? homeTeam,
    TeamModel? awayTeam,
  }) = _BetSelectionModel;

  factory BetSelectionModel.fromJson(Map<String, dynamic> json) =>
      _$BetSelectionModelFromJson(json);
}

@freezed
abstract class BetModel with _$BetModel {
  const factory BetModel({
    required String id,
    required String type,
    required String currency,
    required double stake,
    required double totalOdds,
    required double potentialWin,
    double? actualWin,
    @Default('pending') String status,
    required String placedAt,
    String? settledAt,
    @Default([]) List<BetSelectionModel> selections,
  }) = _BetModel;

  factory BetModel.fromJson(Map<String, dynamic> json) =>
      _$BetModelFromJson(json);
}

@freezed
abstract class PaginatedBets with _$PaginatedBets {
  const factory PaginatedBets({
    required List<BetModel> data,
    @Default(0) int total,
    @Default(1) int page,
    @Default(20) int limit,
  }) = _PaginatedBets;

  factory PaginatedBets.fromJson(Map<String, dynamic> json) =>
      _$PaginatedBetsFromJson(json);
}
