import '../../../core/network/api_endpoints.dart';
import '../../../core/network/dio_client.dart';
import '../models/leaderboard_models.dart';

class LeaderboardRepository {
  final DioClient _client;

  LeaderboardRepository(this._client);

  /// GET /leaderboard returns an array of LeaderboardData objects,
  /// each containing entries for a specific type+period combination.
  Future<List<LeaderboardData>> getLeaderboards() async {
    final response = await _client.get(ApiEndpoints.leaderboard);
    final list = response.data is List ? response.data as List : <dynamic>[];
    return list
        .map((e) => LeaderboardData.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  /// GET /leaderboard/:type/:period/my-position
  Future<MyRank> getMyRank({
    String type = 'wager',
    String period = 'daily',
  }) async {
    final response = await _client.get(
      '${ApiEndpoints.leaderboard}/$type/$period/my-position',
    );
    return MyRank.fromJson(response.data as Map<String, dynamic>);
  }
}
