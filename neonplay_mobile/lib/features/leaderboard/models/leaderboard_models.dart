import 'package:freezed_annotation/freezed_annotation.dart';

part 'leaderboard_models.freezed.dart';
part 'leaderboard_models.g.dart';

@freezed
abstract class LeaderboardEntry with _$LeaderboardEntry {
  const factory LeaderboardEntry({
    @Default(0) int rank,
    @JsonKey(name: 'userId') @Default('') String id,
    @Default('') String username,
    @Default(0) double score,
    @JsonKey(name: 'avatarUrl') String? avatar,
    double? prizeAmount,
  }) = _LeaderboardEntry;

  factory LeaderboardEntry.fromJson(Map<String, dynamic> json) =>
      _$LeaderboardEntryFromJson(json);
}

/// Represents a single leaderboard returned by the backend.
@freezed
abstract class LeaderboardData with _$LeaderboardData {
  const factory LeaderboardData({
    @Default('') String id,
    @Default('') String type,
    @Default('') String period,
    @Default([]) List<LeaderboardEntry> entries,
    @Default(0) int totalEntries,
    @Default(0) double prizePoolUsdc,
    String? status,
  }) = _LeaderboardData;

  factory LeaderboardData.fromJson(Map<String, dynamic> json) =>
      _$LeaderboardDataFromJson(json);
}

@freezed
abstract class MyRank with _$MyRank {
  const factory MyRank({
    @JsonKey(name: 'rank') @Default(0) int position,
    @Default(0) double score,
    double? prizeAmount,
    @Default(0) int totalParticipants,
  }) = _MyRank;

  factory MyRank.fromJson(Map<String, dynamic> json) =>
      _$MyRankFromJson(json);
}
