import 'package:dio/dio.dart';
import '../config/app_config.dart';
import '../storage/token_manager.dart';
import 'auth_interceptor.dart';
import 'refresh_interceptor.dart';
import 'api_exception.dart';

class DioClient {
  late final Dio dio;
  final TokenManager tokenManager;

  DioClient(this.tokenManager) {
    dio = Dio(
      BaseOptions(
        baseUrl: AppConfig.apiBaseUrl,
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 30),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    dio.interceptors.addAll([
      AuthInterceptor(tokenManager),
      RefreshInterceptor(tokenManager, dio),
    ]);
  }

  // GET
  Future<Response> get(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await dio.get(path,
          queryParameters: queryParameters, options: options);
    } on DioException catch (e) {
      throw ApiException.fromDioException(e);
    }
  }

  // POST
  Future<Response> post(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await dio.post(path,
          data: data, queryParameters: queryParameters, options: options);
    } on DioException catch (e) {
      throw ApiException.fromDioException(e);
    }
  }

  // PATCH
  Future<Response> patch(
    String path, {
    dynamic data,
    Options? options,
  }) async {
    try {
      return await dio.patch(path, data: data, options: options);
    } on DioException catch (e) {
      throw ApiException.fromDioException(e);
    }
  }

  // DELETE
  Future<Response> delete(
    String path, {
    dynamic data,
    Options? options,
  }) async {
    try {
      return await dio.delete(path, data: data, options: options);
    } on DioException catch (e) {
      throw ApiException.fromDioException(e);
    }
  }
}
