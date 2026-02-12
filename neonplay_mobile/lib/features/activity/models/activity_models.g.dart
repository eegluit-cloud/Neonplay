// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'activity_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_RecentWin _$RecentWinFromJson(Map<String, dynamic> json) => _RecentWin(
  id: json['id'] as String,
  username: json['username'] as String,
  game: json['game'] as String,
  amount: (json['amount'] as num).toDouble(),
  currency: json['currency'] as String? ?? 'USD',
  avatar: json['avatar'] as String?,
  gameImage: json['gameImage'] as String?,
  timestamp: json['timestamp'] == null
      ? null
      : DateTime.parse(json['timestamp'] as String),
);

Map<String, dynamic> _$RecentWinToJson(_RecentWin instance) =>
    <String, dynamic>{
      'id': instance.id,
      'username': instance.username,
      'game': instance.game,
      'amount': instance.amount,
      'currency': instance.currency,
      'avatar': instance.avatar,
      'gameImage': instance.gameImage,
      'timestamp': instance.timestamp?.toIso8601String(),
    };
