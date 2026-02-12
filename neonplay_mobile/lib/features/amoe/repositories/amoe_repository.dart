import '../../../core/network/api_endpoints.dart';
import '../../../core/network/api_response_parser.dart';
import '../../../core/network/dio_client.dart';

class AmoeRepository {
  final DioClient _client;

  AmoeRepository(this._client);

  Future<Map<String, dynamic>> getConfig() async {
    final response = await _client.get(ApiEndpoints.amoeConfig);
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> generate() async {
    final response = await _client.post(ApiEndpoints.amoeGenerate);
    return response.data as Map<String, dynamic>;
  }

  Future<void> submit(Map<String, dynamic> data) async {
    await _client.post(ApiEndpoints.amoeSubmit, data: data);
  }

  Future<List<Map<String, dynamic>>> getHistory() async {
    final response = await _client.get(ApiEndpoints.amoeHistory);
    return ApiResponseParser.parseArray(
        response.data, (json) => json);
  }
}
