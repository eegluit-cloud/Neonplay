import '../../../core/network/api_endpoints.dart';
import '../../../core/network/api_response_parser.dart';
import '../../../core/network/dio_client.dart';
import '../models/promotion_model.dart';

class PromotionsRepository {
  final DioClient _client;

  PromotionsRepository(this._client);

  Future<List<PromotionModel>> getAll() async {
    final response = await _client.get(ApiEndpoints.promotions);
    return ApiResponseParser.parseArray(response.data, PromotionModel.fromJson);
  }

  Future<PromotionModel> getBySlug(String slug) async {
    final response = await _client.get(ApiEndpoints.promotion(slug));
    return PromotionModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<void> claim(String slug) async {
    await _client.post(ApiEndpoints.claimPromotion(slug));
  }

  Future<void> claimDaily() async {
    await _client.post(ApiEndpoints.claimDaily);
  }
}
