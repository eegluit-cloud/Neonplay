// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'vip_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_VipLevel _$VipLevelFromJson(Map<String, dynamic> json) => _VipLevel(
  id: json['id'] as String,
  name: json['name'] as String,
  level: (json['level'] as num).toInt(),
  xpRequired: (json['xpRequired'] as num).toDouble(),
  iconUrl: json['iconUrl'] as String?,
  cashbackPercentage: (json['cashbackPercentage'] as num?)?.toDouble(),
  benefits:
      (json['benefits'] as List<dynamic>?)?.map((e) => e as String).toList() ??
      const [],
);

Map<String, dynamic> _$VipLevelToJson(_VipLevel instance) => <String, dynamic>{
  'id': instance.id,
  'name': instance.name,
  'level': instance.level,
  'xpRequired': instance.xpRequired,
  'iconUrl': instance.iconUrl,
  'cashbackPercentage': instance.cashbackPercentage,
  'benefits': instance.benefits,
};

_VipStatus _$VipStatusFromJson(Map<String, dynamic> json) => _VipStatus(
  currentLevel: (json['currentLevel'] as num).toInt(),
  levelName: json['levelName'] as String,
  currentXp: (json['currentXp'] as num).toDouble(),
  nextLevelXp: (json['nextLevelXp'] as num).toDouble(),
  cashbackAvailable: (json['cashbackAvailable'] as num?)?.toDouble(),
);

Map<String, dynamic> _$VipStatusToJson(_VipStatus instance) =>
    <String, dynamic>{
      'currentLevel': instance.currentLevel,
      'levelName': instance.levelName,
      'currentXp': instance.currentXp,
      'nextLevelXp': instance.nextLevelXp,
      'cashbackAvailable': instance.cashbackAvailable,
    };
