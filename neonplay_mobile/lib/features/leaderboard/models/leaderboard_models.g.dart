// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'leaderboard_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_LeaderboardEntry _$LeaderboardEntryFromJson(Map<String, dynamic> json) =>
    _LeaderboardEntry(
      rank: (json['rank'] as num?)?.toInt() ?? 0,
      id: json['userId'] as String? ?? '',
      username: json['username'] as String? ?? '',
      score: (json['score'] as num?)?.toDouble() ?? 0,
      avatar: json['avatarUrl'] as String?,
      prizeAmount: (json['prizeAmount'] as num?)?.toDouble(),
    );

Map<String, dynamic> _$LeaderboardEntryToJson(_LeaderboardEntry instance) =>
    <String, dynamic>{
      'rank': instance.rank,
      'userId': instance.id,
      'username': instance.username,
      'score': instance.score,
      'avatarUrl': instance.avatar,
      'prizeAmount': instance.prizeAmount,
    };

_LeaderboardData _$LeaderboardDataFromJson(Map<String, dynamic> json) =>
    _LeaderboardData(
      id: json['id'] as String? ?? '',
      type: json['type'] as String? ?? '',
      period: json['period'] as String? ?? '',
      entries:
          (json['entries'] as List<dynamic>?)
              ?.map((e) => LeaderboardEntry.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      totalEntries: (json['totalEntries'] as num?)?.toInt() ?? 0,
      prizePoolUsdc: (json['prizePoolUsdc'] as num?)?.toDouble() ?? 0,
      status: json['status'] as String?,
    );

Map<String, dynamic> _$LeaderboardDataToJson(_LeaderboardData instance) =>
    <String, dynamic>{
      'id': instance.id,
      'type': instance.type,
      'period': instance.period,
      'entries': instance.entries,
      'totalEntries': instance.totalEntries,
      'prizePoolUsdc': instance.prizePoolUsdc,
      'status': instance.status,
    };

_MyRank _$MyRankFromJson(Map<String, dynamic> json) => _MyRank(
  position: (json['rank'] as num?)?.toInt() ?? 0,
  score: (json['score'] as num?)?.toDouble() ?? 0,
  prizeAmount: (json['prizeAmount'] as num?)?.toDouble(),
  totalParticipants: (json['totalParticipants'] as num?)?.toInt() ?? 0,
);

Map<String, dynamic> _$MyRankToJson(_MyRank instance) => <String, dynamic>{
  'rank': instance.position,
  'score': instance.score,
  'prizeAmount': instance.prizeAmount,
  'totalParticipants': instance.totalParticipants,
};
