import 'dart:async';
import 'package:dio/dio.dart';
import '../storage/token_manager.dart';
import 'api_endpoints.dart';

/// Handles 401 responses by refreshing the access token and retrying.
/// Uses a mutex pattern to prevent concurrent refresh calls.
/// Mirrors the React interceptor at player-frontend/src/lib/api.ts lines 80-130.
class RefreshInterceptor extends Interceptor {
  final TokenManager _tokenManager;
  final Dio _dio;
  bool _isRefreshing = false;
  final List<_QueuedRequest> _failedQueue = [];

  RefreshInterceptor(this._tokenManager, this._dio);

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode != 401) {
      return handler.next(err);
    }

    // Don't try to refresh if we're already on the refresh endpoint
    if (err.requestOptions.path == ApiEndpoints.refresh) {
      return handler.next(err);
    }

    if (_isRefreshing) {
      // Queue this request to be retried after refresh completes
      final completer = Completer<Response>();
      _failedQueue.add(_QueuedRequest(
        requestOptions: err.requestOptions,
        completer: completer,
      ));
      try {
        final response = await completer.future;
        return handler.resolve(response);
      } catch (e) {
        return handler.next(err);
      }
    }

    _isRefreshing = true;

    try {
      final refreshToken = await _tokenManager.getRefreshToken();
      if (refreshToken == null) {
        _rejectQueue(err);
        await _tokenManager.clearTokens();
        return handler.next(err);
      }

      // Call refresh endpoint (sends refreshToken in body, not cookie)
      final response = await _dio.post(
        ApiEndpoints.refresh,
        data: {'refreshToken': refreshToken},
        options: Options(
          headers: {'X-App-Platform': 'mobile'},
        ),
      );

      final newAccessToken = response.data['accessToken'] as String;
      final newRefreshToken = response.data['refreshToken'] as String;
      await _tokenManager.setTokens(newAccessToken, newRefreshToken);

      // Retry the original request with new token
      err.requestOptions.headers['Authorization'] = 'Bearer $newAccessToken';
      final retryResponse = await _dio.fetch(err.requestOptions);

      // Process queued requests
      _resolveQueue(newAccessToken);

      return handler.resolve(retryResponse);
    } on DioException catch (refreshError) {
      _rejectQueue(refreshError);
      await _tokenManager.clearTokens();
      return handler.next(err);
    } finally {
      _isRefreshing = false;
    }
  }

  void _resolveQueue(String newAccessToken) {
    for (final queued in _failedQueue) {
      queued.requestOptions.headers['Authorization'] =
          'Bearer $newAccessToken';
      _dio.fetch(queued.requestOptions).then(
        queued.completer.complete,
        onError: queued.completer.completeError,
      );
    }
    _failedQueue.clear();
  }

  void _rejectQueue(dynamic error) {
    for (final queued in _failedQueue) {
      queued.completer.completeError(error);
    }
    _failedQueue.clear();
  }
}

class _QueuedRequest {
  final RequestOptions requestOptions;
  final Completer<Response> completer;

  _QueuedRequest({required this.requestOptions, required this.completer});
}
