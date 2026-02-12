// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'game_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_GameModel _$GameModelFromJson(Map<String, dynamic> json) => _GameModel(
  id: json['id'] as String,
  name: json['name'] as String,
  slug: json['slug'] as String,
  description: json['description'] as String?,
  thumbnailUrl: json['thumbnailUrl'] as String?,
  bannerUrl: json['bannerUrl'] as String?,
  tags:
      (json['tags'] as List<dynamic>?)?.map((e) => e as String).toList() ??
      const [],
  rtp: (json['rtp'] as num?)?.toDouble(),
  volatility: json['volatility'] as String?,
  minBet: (json['minBet'] as num?)?.toDouble(),
  maxBet: (json['maxBet'] as num?)?.toDouble(),
  features:
      (json['features'] as List<dynamic>?)?.map((e) => e as String).toList() ??
      const [],
  isFeatured: json['isFeatured'] as bool? ?? false,
  isNew: json['isNew'] as bool? ?? false,
  isHot: json['isHot'] as bool? ?? false,
  playCount: (json['playCount'] as num?)?.toInt() ?? 0,
  category: json['category'] == null
      ? null
      : GameCategoryModel.fromJson(json['category'] as Map<String, dynamic>),
  provider: json['provider'] == null
      ? null
      : GameProviderModel.fromJson(json['provider'] as Map<String, dynamic>),
);

Map<String, dynamic> _$GameModelToJson(_GameModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'slug': instance.slug,
      'description': instance.description,
      'thumbnailUrl': instance.thumbnailUrl,
      'bannerUrl': instance.bannerUrl,
      'tags': instance.tags,
      'rtp': instance.rtp,
      'volatility': instance.volatility,
      'minBet': instance.minBet,
      'maxBet': instance.maxBet,
      'features': instance.features,
      'isFeatured': instance.isFeatured,
      'isNew': instance.isNew,
      'isHot': instance.isHot,
      'playCount': instance.playCount,
      'category': instance.category,
      'provider': instance.provider,
    };

_GameCategoryModel _$GameCategoryModelFromJson(Map<String, dynamic> json) =>
    _GameCategoryModel(
      id: json['id'] as String,
      name: json['name'] as String,
      slug: json['slug'] as String,
    );

Map<String, dynamic> _$GameCategoryModelToJson(_GameCategoryModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'slug': instance.slug,
    };

_GameProviderModel _$GameProviderModelFromJson(Map<String, dynamic> json) =>
    _GameProviderModel(
      id: json['id'] as String,
      name: json['name'] as String,
      slug: json['slug'] as String,
      logoUrl: json['logoUrl'] as String?,
    );

Map<String, dynamic> _$GameProviderModelToJson(_GameProviderModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'slug': instance.slug,
      'logoUrl': instance.logoUrl,
    };

_GameLaunchResponse _$GameLaunchResponseFromJson(Map<String, dynamic> json) =>
    _GameLaunchResponse(
      url: json['url'] as String,
      sessionId: json['sessionId'] as String?,
    );

Map<String, dynamic> _$GameLaunchResponseToJson(_GameLaunchResponse instance) =>
    <String, dynamic>{'url': instance.url, 'sessionId': instance.sessionId};

_PaginatedGames _$PaginatedGamesFromJson(Map<String, dynamic> json) =>
    _PaginatedGames(
      data: (json['data'] as List<dynamic>)
          .map((e) => GameModel.fromJson(e as Map<String, dynamic>))
          .toList(),
      total: (json['total'] as num).toInt(),
      page: (json['page'] as num).toInt(),
      limit: (json['limit'] as num).toInt(),
    );

Map<String, dynamic> _$PaginatedGamesToJson(_PaginatedGames instance) =>
    <String, dynamic>{
      'data': instance.data,
      'total': instance.total,
      'page': instance.page,
      'limit': instance.limit,
    };
