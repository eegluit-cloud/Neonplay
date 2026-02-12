// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'prize_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_PrizeModel _$PrizeModelFromJson(Map<String, dynamic> json) => _PrizeModel(
  id: json['id'] as String,
  name: json['name'] as String,
  description: json['description'] as String?,
  imageUrl: json['imageUrl'] as String?,
  category: json['category'] as String?,
  tier: json['tier'] as String?,
  pointsCost: (json['pointsCost'] as num?)?.toInt(),
  isAvailable: json['isAvailable'] as bool? ?? true,
);

Map<String, dynamic> _$PrizeModelToJson(_PrizeModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'description': instance.description,
      'imageUrl': instance.imageUrl,
      'category': instance.category,
      'tier': instance.tier,
      'pointsCost': instance.pointsCost,
      'isAvailable': instance.isAvailable,
    };
