// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'promotion_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_PromotionModel _$PromotionModelFromJson(Map<String, dynamic> json) =>
    _PromotionModel(
      id: json['id'] as String,
      title: json['name'] as String,
      slug: json['slug'] as String?,
      description: json['description'] as String?,
      imageUrl: json['imageUrl'] as String?,
      type: json['type'] as String?,
      bonusAmount: (json['bonusAmount'] as num?)?.toDouble(),
      bonusPercentage: (json['percentageBonus'] as num?)?.toDouble(),
      wagerRequirement: (json['wageringRequirement'] as num?)?.toInt(),
      startDate: json['startsAt'] as String?,
      endDate: json['endsAt'] as String?,
      isActive: json['isActive'] as bool? ?? true,
      isClaimed: json['isClaimed'] as bool? ?? false,
    );

Map<String, dynamic> _$PromotionModelToJson(_PromotionModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.title,
      'slug': instance.slug,
      'description': instance.description,
      'imageUrl': instance.imageUrl,
      'type': instance.type,
      'bonusAmount': instance.bonusAmount,
      'percentageBonus': instance.bonusPercentage,
      'wageringRequirement': instance.wagerRequirement,
      'startsAt': instance.startDate,
      'endsAt': instance.endDate,
      'isActive': instance.isActive,
      'isClaimed': instance.isClaimed,
    };
