import 'dart:io' show Platform;

import '../../../core/network/api_endpoints.dart';
import '../../../core/network/dio_client.dart';
import '../models/game_models.dart';

class GamesRepository {
  final DioClient _client;

  GamesRepository(this._client);

  Future<PaginatedGames> getAll({
    int page = 1,
    int limit = 24,
    String? category,
    String? provider,
    String? search,
    bool? featured,
    bool? hot,
    bool? isNew,
  }) async {
    final response = await _client.get(
      ApiEndpoints.games,
      queryParameters: {
        'page': page,
        'limit': limit,
        'category': ?category,
        'provider': ?provider,
        'search': ?search,
        'featured': ?featured,
        'hot': ?hot,
        'new': ?isNew,
      },
    );
    // Backend returns { items: [...], meta: { page, limit, total } }
    final body = response.data as Map<String, dynamic>;
    final meta = body['meta'] as Map<String, dynamic>? ?? {};
    return PaginatedGames(
      data: _parseList<GameModel>(body, GameModel.fromJson),
      total: _parseInt(meta['total']) ?? 0,
      page: _parseInt(meta['page']) ?? 1,
      limit: _parseInt(meta['limit']) ?? limit,
    );
  }

  Future<GameModel> getBySlug(String slug) async {
    final response = await _client.get(ApiEndpoints.gameBySlug(slug));
    return GameModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<List<GameCategoryModel>> getCategories() async {
    try {
      final response = await _client.get(ApiEndpoints.gameCategories);
      return _parseArray<GameCategoryModel>(
          response.data, GameCategoryModel.fromJson);
    } catch (_) {
      // Endpoint may return 500 — return empty list gracefully
      return [];
    }
  }

  Future<List<GameProviderModel>> getProviders() async {
    final response = await _client.get(ApiEndpoints.gameProviders);
    return _parseArray<GameProviderModel>(
        response.data, GameProviderModel.fromJson);
  }

  Future<GameLaunchResponse> launchGame(String slug) async {
    final platform = Platform.isIOS ? 'ios' : 'android';
    final response = await _client.post(
      ApiEndpoints.launchGame(slug),
      data: {'platform': platform},
    );
    return GameLaunchResponse.fromJson(response.data as Map<String, dynamic>);
  }

  Future<List<GameModel>> getFavorites() async {
    final response = await _client.get(ApiEndpoints.favorites);
    return _parseArray<GameModel>(response.data, GameModel.fromJson);
  }

  Future<void> addFavorite(String gameId) async {
    await _client.post(ApiEndpoints.favorite(gameId));
  }

  Future<void> removeFavorite(String gameId) async {
    await _client.delete(ApiEndpoints.favorite(gameId));
  }

  /// Parse a list from { items: [...] }, { data: [...] }, or plain [...]
  List<T> _parseList<T>(
      Map<String, dynamic> body, T Function(Map<String, dynamic>) fromJson) {
    final items = body['items'] as List? ?? body['data'] as List? ?? [];
    return items
        .map((e) => fromJson(e as Map<String, dynamic>))
        .toList();
  }

  /// Parse response data that may be a plain array or { data/items: [...] }
  List<T> _parseArray<T>(
      dynamic data, T Function(Map<String, dynamic>) fromJson) {
    final List items;
    if (data is List) {
      items = data;
    } else if (data is Map<String, dynamic>) {
      items = data['data'] as List? ?? data['items'] as List? ?? [];
    } else {
      items = [];
    }
    return items
        .map((e) => fromJson(e as Map<String, dynamic>))
        .toList();
  }

  /// Parse an int that may come as String or num from the API
  int? _parseInt(dynamic value) {
    if (value is int) return value;
    if (value is num) return value.toInt();
    if (value is String) return int.tryParse(value);
    return null;
  }
}
