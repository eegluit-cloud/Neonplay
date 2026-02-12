import '../../../core/network/api_endpoints.dart';
import '../../../core/network/api_response_parser.dart';
import '../../../core/network/dio_client.dart';
import '../models/activity_models.dart';

class ActivityRepository {
  final DioClient _client;

  ActivityRepository(this._client);

  Future<List<RecentWin>> getRecentWins({int limit = 20}) async {
    final response = await _client.get(
      ApiEndpoints.activityWins,
      queryParameters: {'limit': limit},
    );
    return ApiResponseParser.parseArray(response.data, RecentWin.fromJson);
  }

  Future<List<RecentWin>> getPublicWins({int limit = 20}) async {
    final response = await _client.get(
      ApiEndpoints.activityPublicWins,
      queryParameters: {'limit': limit},
    );
    return ApiResponseParser.parseArray(response.data, RecentWin.fromJson);
  }
}
