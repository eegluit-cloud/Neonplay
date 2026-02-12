import '../../../core/network/api_endpoints.dart';
import '../../../core/network/api_response_parser.dart';
import '../../../core/network/dio_client.dart';
import '../models/jackpot_models.dart';

class JackpotRepository {
  final DioClient _client;

  JackpotRepository(this._client);

  Future<List<JackpotModel>> getAll() async {
    final response = await _client.get(ApiEndpoints.jackpot);
    return ApiResponseParser.parseArray(response.data, JackpotModel.fromJson);
  }

  Future<JackpotModel> getCurrent() async {
    final response = await _client.get(ApiEndpoints.jackpotCurrent);
    return JackpotModel.fromJson(response.data as Map<String, dynamic>);
  }
}
