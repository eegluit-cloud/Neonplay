import '../../../core/network/api_endpoints.dart';
import '../../../core/network/api_response_parser.dart';
import '../../../core/network/dio_client.dart';
import '../models/vip_models.dart';

class VipRepository {
  final DioClient _client;

  VipRepository(this._client);

  Future<List<VipLevel>> getLevels() async {
    final response = await _client.get(ApiEndpoints.vipLevels);
    return ApiResponseParser.parseArray(response.data, VipLevel.fromJson);
  }

  Future<VipStatus> getStatus() async {
    final response = await _client.get(ApiEndpoints.vipStatus);
    return VipStatus.fromJson(response.data as Map<String, dynamic>);
  }

  Future<void> claimCashback() async {
    await _client.post(ApiEndpoints.vipClaimCashback);
  }
}
