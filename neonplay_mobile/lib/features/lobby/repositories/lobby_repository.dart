import '../../../core/network/api_endpoints.dart';
import '../../../core/network/dio_client.dart';
import '../models/banner_model.dart';

class LobbyRepository {
  final DioClient _client;

  LobbyRepository(this._client);

  Future<List<BannerModel>> getBanners() async {
    try {
      final response = await _client.get(ApiEndpoints.cmsBanners);
      final List items;
      if (response.data is List) {
        items = response.data as List;
      } else {
        items = (response.data as Map<String, dynamic>)['data'] as List? ??
            (response.data as Map<String, dynamic>)['items'] as List? ??
            [];
      }
      return items
          .map((e) => BannerModel.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (_) {
      // CMS banners endpoint may not exist — hero_banner has a fallback
      return [];
    }
  }
}
