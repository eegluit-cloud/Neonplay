import '../../../core/network/api_endpoints.dart';
import '../../../core/network/dio_client.dart';
import '../models/sports_models.dart';

class SportsRepository {
  final DioClient _client;

  SportsRepository(this._client);

  Future<List<SportModel>> getSports() async {
    final response = await _client.get(ApiEndpoints.sports);
    return _parseArray<SportModel>(response.data, SportModel.fromJson);
  }

  Future<List<LeagueModel>> getLeagues({String? sportSlug}) async {
    final endpoint = sportSlug != null
        ? '${ApiEndpoints.sportsLeagues}/$sportSlug'
        : ApiEndpoints.sportsLeagues;
    final response = await _client.get(endpoint);
    return _parseArray<LeagueModel>(response.data, LeagueModel.fromJson);
  }

  Future<PaginatedMatches> getMatches({
    int page = 1,
    int limit = 20,
    String? sportSlug,
    String? leagueSlug,
    String? status,
    bool? featured,
  }) async {
    final response = await _client.get(
      ApiEndpoints.sportsMatches,
      queryParameters: {
        'page': page,
        'limit': limit,
        'sportSlug': ?sportSlug,
        'leagueSlug': ?leagueSlug,
        'status': ?status,
        'featured': ?featured,
      },
    );
    // Backend returns { items: [...], meta: { page, limit, total } }
    final body = response.data as Map<String, dynamic>;
    final meta = body['meta'] as Map<String, dynamic>? ?? {};
    return PaginatedMatches(
      data: _parseList<MatchModel>(body, MatchModel.fromJson),
      total: _parseInt(meta['total']) ?? 0,
      page: _parseInt(meta['page']) ?? 1,
      limit: _parseInt(meta['limit']) ?? limit,
    );
  }

  Future<List<MatchModel>> getLiveMatches() async {
    final response = await _client.get('${ApiEndpoints.sportsMatches}/live');
    return _parseArray<MatchModel>(response.data, MatchModel.fromJson);
  }

  Future<List<MatchModel>> getFeaturedMatches() async {
    final response =
        await _client.get('${ApiEndpoints.sportsMatches}/featured');
    return _parseArray<MatchModel>(response.data, MatchModel.fromJson);
  }

  Future<MatchModel> getMatch(String matchId) async {
    final response = await _client.get(ApiEndpoints.sportsMatch(matchId));
    return MatchModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<BetModel> placeBet({
    required String type,
    required double stake,
    required String currency,
    required List<Map<String, dynamic>> selections,
  }) async {
    final response = await _client.post(
      ApiEndpoints.sportsBets,
      data: {
        'type': type,
        'stake': stake,
        'currency': currency,
        'selections': selections,
      },
    );
    return BetModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<PaginatedBets> getMyBets({
    int page = 1,
    int limit = 20,
    String? status,
  }) async {
    final response = await _client.get(
      ApiEndpoints.sportsBets,
      queryParameters: {
        'page': page,
        'limit': limit,
        'status': ?status,
      },
    );
    final body = response.data as Map<String, dynamic>;
    final meta = body['meta'] as Map<String, dynamic>? ?? {};
    return PaginatedBets(
      data: _parseList<BetModel>(body, BetModel.fromJson),
      total: _parseInt(meta['total']) ?? 0,
      page: _parseInt(meta['page']) ?? 1,
      limit: _parseInt(meta['limit']) ?? limit,
    );
  }

  List<T> _parseList<T>(
      Map<String, dynamic> body, T Function(Map<String, dynamic>) fromJson) {
    final items = body['items'] as List? ?? body['data'] as List? ?? [];
    return items
        .map((e) => fromJson(e as Map<String, dynamic>))
        .toList();
  }

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

  int? _parseInt(dynamic value) {
    if (value is int) return value;
    if (value is num) return value.toInt();
    if (value is String) return int.tryParse(value);
    return null;
  }
}
