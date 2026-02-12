import 'package:freezed_annotation/freezed_annotation.dart';

part 'game_models.freezed.dart';
part 'game_models.g.dart';

@freezed
abstract class GameModel with _$GameModel {
  const factory GameModel({
    required String id,
    required String name,
    required String slug,
    String? description,
    String? thumbnailUrl,
    String? bannerUrl,
    @Default([]) List<String> tags,
    double? rtp,
    String? volatility,
    double? minBet,
    double? maxBet,
    @Default([]) List<String> features,
    @Default(false) bool isFeatured,
    @Default(false) bool isNew,
    @Default(false) bool isHot,
    @Default(0) int playCount,
    GameCategoryModel? category,
    GameProviderModel? provider,
  }) = _GameModel;

  factory GameModel.fromJson(Map<String, dynamic> json) =>
      _$GameModelFromJson(json);
}

@freezed
abstract class GameCategoryModel with _$GameCategoryModel {
  const factory GameCategoryModel({
    required String id,
    required String name,
    required String slug,
  }) = _GameCategoryModel;

  factory GameCategoryModel.fromJson(Map<String, dynamic> json) =>
      _$GameCategoryModelFromJson(json);
}

@freezed
abstract class GameProviderModel with _$GameProviderModel {
  const factory GameProviderModel({
    required String id,
    required String name,
    required String slug,
    String? logoUrl,
  }) = _GameProviderModel;

  factory GameProviderModel.fromJson(Map<String, dynamic> json) =>
      _$GameProviderModelFromJson(json);
}

@freezed
abstract class GameLaunchResponse with _$GameLaunchResponse {
  const factory GameLaunchResponse({
    required String url,
    String? sessionId,
  }) = _GameLaunchResponse;

  factory GameLaunchResponse.fromJson(Map<String, dynamic> json) =>
      _$GameLaunchResponseFromJson(json);
}

@freezed
abstract class PaginatedGames with _$PaginatedGames {
  const factory PaginatedGames({
    required List<GameModel> data,
    required int total,
    required int page,
    required int limit,
  }) = _PaginatedGames;

  factory PaginatedGames.fromJson(Map<String, dynamic> json) =>
      _$PaginatedGamesFromJson(json);
}
