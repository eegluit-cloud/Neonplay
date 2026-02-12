import '../../../core/network/api_endpoints.dart';
import '../../../core/network/api_response_parser.dart';
import '../../../core/network/dio_client.dart';

class HelpRepository {
  final DioClient _client;

  HelpRepository(this._client);

  Future<List<Map<String, dynamic>>> getFaqCategories() async {
    final response = await _client.get(ApiEndpoints.helpFaqCategories);
    return ApiResponseParser.parseArray(
        response.data, (json) => json);
  }

  Future<List<Map<String, dynamic>>> getFaqs({String? category}) async {
    final response = await _client.get(
      ApiEndpoints.helpFaq,
      queryParameters: {'category': ?category},
    );
    return ApiResponseParser.parseArray(
        response.data, (json) => json);
  }

  Future<List<Map<String, dynamic>>> getFeaturedFaqs() async {
    final response = await _client.get(ApiEndpoints.helpFaqFeatured);
    return ApiResponseParser.parseArray(
        response.data, (json) => json);
  }

  Future<void> submitTicket(Map<String, dynamic> data) async {
    await _client.post(ApiEndpoints.helpTickets, data: data);
  }
}
