import '../../../core/network/api_endpoints.dart';
import '../../../core/network/dio_client.dart';

class SpinWheelRepository {
  final DioClient _client;

  SpinWheelRepository(this._client);

  Future<Map<String, dynamic>> getConfig() async {
    final response = await _client.get(ApiEndpoints.spinWheelConfig);
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> spin() async {
    final response = await _client.post(ApiEndpoints.spinWheelSpin);
    return response.data as Map<String, dynamic>;
  }
}
