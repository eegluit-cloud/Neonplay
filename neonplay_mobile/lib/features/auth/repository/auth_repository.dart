import '../../../core/network/api_endpoints.dart';
import '../../../core/network/dio_client.dart';
import '../models/auth_models.dart';
import '../models/user_model.dart';
import '../models/wallet_model.dart';

class AuthRepository {
  final DioClient _client;

  AuthRepository(this._client);

  Future<TokenResponse> login(LoginRequest request) async {
    final response = await _client.post(
      ApiEndpoints.login,
      data: request.toJson(),
    );
    return TokenResponse.fromJson(response.data as Map<String, dynamic>);
  }

  Future<TokenResponse> register(RegisterRequest request) async {
    final response = await _client.post(
      ApiEndpoints.register,
      data: request.toJson(),
    );
    return TokenResponse.fromJson(response.data as Map<String, dynamic>);
  }

  Future<void> logout(String refreshToken) async {
    await _client.post(
      ApiEndpoints.logout,
      data: {'refreshToken': refreshToken},
    );
  }

  Future<TokenResponse> refreshTokens(String refreshToken) async {
    final response = await _client.post(
      ApiEndpoints.refresh,
      data: {'refreshToken': refreshToken},
    );
    return TokenResponse.fromJson(response.data as Map<String, dynamic>);
  }

  Future<UserModel> getProfile() async {
    final response = await _client.get(ApiEndpoints.me);
    return UserModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<WalletModel> getWallet() async {
    final response = await _client.get(ApiEndpoints.wallet);
    return WalletModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<MessageResponse> forgotPassword(ForgotPasswordRequest request) async {
    final response = await _client.post(
      ApiEndpoints.forgotPassword,
      data: request.toJson(),
    );
    return MessageResponse.fromJson(response.data as Map<String, dynamic>);
  }

  Future<MessageResponse> resetPassword(ResetPasswordRequest request) async {
    final response = await _client.post(
      ApiEndpoints.resetPassword,
      data: request.toJson(),
    );
    return MessageResponse.fromJson(response.data as Map<String, dynamic>);
  }

  Future<MessageResponse> verifyEmail(VerifyEmailRequest request) async {
    final response = await _client.post(
      ApiEndpoints.verifyEmail,
      data: request.toJson(),
    );
    return MessageResponse.fromJson(response.data as Map<String, dynamic>);
  }

  Future<MessageResponse> resendVerification(String email) async {
    final response = await _client.post(
      ApiEndpoints.resendVerification,
      data: {'email': email},
    );
    return MessageResponse.fromJson(response.data as Map<String, dynamic>);
  }

  Future<MessageResponse> changePassword(ChangePasswordRequest request) async {
    final response = await _client.post(
      ApiEndpoints.changePassword,
      data: request.toJson(),
    );
    return MessageResponse.fromJson(response.data as Map<String, dynamic>);
  }
}
