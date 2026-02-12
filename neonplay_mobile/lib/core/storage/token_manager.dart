import 'secure_storage.dart';

/// Manages JWT access and refresh tokens.
/// Access token is kept in-memory only (same as React web app).
/// Refresh token is stored in secure storage (Keychain/EncryptedSharedPrefs).
class TokenManager {
  static const _refreshTokenKey = 'refresh_token';

  /// In-memory access token - never persisted to disk.
  String? _accessToken;

  String? getAccessToken() => _accessToken;

  void setAccessToken(String token) {
    _accessToken = token;
  }

  Future<String?> getRefreshToken() =>
      SecureStorage.read(_refreshTokenKey);

  Future<void> setRefreshToken(String token) =>
      SecureStorage.write(_refreshTokenKey, token);

  Future<void> setTokens(String accessToken, String refreshToken) async {
    _accessToken = accessToken;
    await SecureStorage.write(_refreshTokenKey, refreshToken);
  }

  Future<void> clearTokens() async {
    _accessToken = null;
    await SecureStorage.delete(_refreshTokenKey);
  }

  Future<bool> hasSession() async {
    final rt = await getRefreshToken();
    return rt != null && rt.isNotEmpty;
  }
}
