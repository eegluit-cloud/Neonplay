// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'jackpot_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_JackpotModel _$JackpotModelFromJson(Map<String, dynamic> json) =>
    _JackpotModel(
      id: json['id'] as String,
      name: json['name'] as String,
      currentValue: (json['currentValue'] as num).toDouble(),
      seedValue: (json['seedValue'] as num?)?.toDouble(),
      currency: json['currency'] as String?,
      lastWonBy: json['lastWonBy'] as String?,
      lastWonAmount: (json['lastWonAmount'] as num?)?.toDouble(),
      lastWonAt: json['lastWonAt'] == null
          ? null
          : DateTime.parse(json['lastWonAt'] as String),
    );

Map<String, dynamic> _$JackpotModelToJson(_JackpotModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'currentValue': instance.currentValue,
      'seedValue': instance.seedValue,
      'currency': instance.currency,
      'lastWonBy': instance.lastWonBy,
      'lastWonAmount': instance.lastWonAmount,
      'lastWonAt': instance.lastWonAt?.toIso8601String(),
    };
