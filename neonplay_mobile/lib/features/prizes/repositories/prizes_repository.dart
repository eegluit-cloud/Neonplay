import '../../../core/network/api_endpoints.dart';
import '../../../core/network/api_response_parser.dart';
import '../../../core/network/dio_client.dart';
import '../models/prize_models.dart';

class PrizesRepository {
  final DioClient _client;

  PrizesRepository(this._client);

  Future<List<PrizeModel>> getStore() async {
    final response = await _client.get(ApiEndpoints.prizeStore);
    return ApiResponseParser.parseArray(response.data, PrizeModel.fromJson);
  }

  Future<void> redeem(String prizeId) async {
    await _client.post(ApiEndpoints.redeemPrize(prizeId));
  }
}
