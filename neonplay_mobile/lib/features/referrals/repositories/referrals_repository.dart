import '../../../core/network/api_endpoints.dart';
import '../../../core/network/api_response_parser.dart';
import '../../../core/network/dio_client.dart';

class ReferralsRepository {
  final DioClient _client;

  ReferralsRepository(this._client);

  Future<Map<String, dynamic>> getStats() async {
    final response = await _client.get(ApiEndpoints.referralStats);
    return response.data as Map<String, dynamic>;
  }

  Future<String> getReferralCode() async {
    final response = await _client.get(ApiEndpoints.referralCode);
    return response.data['code'] as String? ?? '';
  }

  Future<List<Map<String, dynamic>>> getReferrals() async {
    final response = await _client.get(ApiEndpoints.referrals);
    return ApiResponseParser.parseArray(
        response.data, (json) => json);
  }
}
