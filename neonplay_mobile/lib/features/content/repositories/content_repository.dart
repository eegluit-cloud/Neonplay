import '../../../core/network/api_endpoints.dart';
import '../../../core/network/api_response_parser.dart';
import '../../../core/network/dio_client.dart';

class ContentRepository {
  final DioClient _client;

  ContentRepository(this._client);

  Future<List<Map<String, dynamic>>> getVideos({
    int page = 1,
    String? category,
    String? sort,
  }) async {
    final response = await _client.get(
      ApiEndpoints.contentVideos,
      queryParameters: {
        'page': page,
        'category': ?category,
        'sort': ?sort,
      },
    );
    return ApiResponseParser.parseArray(
        response.data, (json) => json);
  }

  Future<List<Map<String, dynamic>>> getFeatured() async {
    final response = await _client.get(ApiEndpoints.contentVideosFeatured);
    return ApiResponseParser.parseArray(
        response.data, (json) => json);
  }

  Future<List<Map<String, dynamic>>> getCategories() async {
    final response = await _client.get(ApiEndpoints.contentCategories);
    return ApiResponseParser.parseArray(
        response.data, (json) => json);
  }
}
