import 'package:dio/dio.dart';
import '../storage/token_manager.dart';

/// Injects Authorization header and mobile platform identifier.
class AuthInterceptor extends Interceptor {
  final TokenManager _tokenManager;

  AuthInterceptor(this._tokenManager);

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    // Inject Bearer token if available
    final accessToken = _tokenManager.getAccessToken();
    if (accessToken != null) {
      options.headers['Authorization'] = 'Bearer $accessToken';
    }

    // Identify as mobile app (used by backend CSRF guard to skip CSRF)
    options.headers['X-App-Platform'] = 'mobile';

    handler.next(options);
  }
}
