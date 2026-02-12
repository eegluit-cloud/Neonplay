import '../../../core/network/api_endpoints.dart';
import '../../../core/network/api_response_parser.dart';
import '../../../core/network/dio_client.dart';
import '../../auth/models/user_model.dart';
import '../../wallet/models/wallet_models.dart';

class ProfileRepository {
  final DioClient _client;

  ProfileRepository(this._client);

  Future<UserModel> getProfile() async {
    final response = await _client.get(ApiEndpoints.me);
    return UserModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<UserModel> updateProfile(Map<String, dynamic> data) async {
    final response = await _client.patch(ApiEndpoints.userProfile, data: data);
    return UserModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    await _client.post(
      ApiEndpoints.changePassword,
      data: {
        'currentPassword': currentPassword,
        'newPassword': newPassword,
      },
    );
  }

  Future<List<TransactionModel>> getTransactions({
    int page = 1,
    int limit = 20,
    String? dateFrom,
    String? dateTo,
  }) async {
    final response = await _client.get(
      ApiEndpoints.walletTransactions,
      queryParameters: {
        'page': page,
        'limit': limit,
        'dateFrom': ?dateFrom,
        'dateTo': ?dateTo,
      },
    );
    return ApiResponseParser.parseArray(
        response.data, TransactionModel.fromJson);
  }

  Future<String> uploadAvatar(String imageUrl) async {
    final response = await _client.post(
      ApiEndpoints.userAvatar,
      data: {'avatarUrl': imageUrl},
    );
    return response.data['avatarUrl'] as String? ?? imageUrl;
  }
}
