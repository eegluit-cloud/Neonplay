import 'package:dio/dio.dart';

class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final dynamic data;

  const ApiException({
    required this.message,
    this.statusCode,
    this.data,
  });

  factory ApiException.fromDioException(DioException e) {
    final response = e.response;
    final statusCode = response?.statusCode;
    final data = response?.data;

    String message;
    if (data is Map<String, dynamic> && data.containsKey('message')) {
      final msg = data['message'];
      message = msg is List ? msg.join(', ') : msg.toString();
    } else {
      switch (e.type) {
        case DioExceptionType.connectionTimeout:
        case DioExceptionType.sendTimeout:
        case DioExceptionType.receiveTimeout:
          message = 'Connection timed out. Please try again.';
        case DioExceptionType.connectionError:
          message = 'No internet connection.';
        case DioExceptionType.cancel:
          message = 'Request was cancelled.';
        default:
          message = _messageForStatus(statusCode) ?? 'Something went wrong.';
      }
    }

    return ApiException(
      message: message,
      statusCode: statusCode,
      data: data,
    );
  }

  static String? _messageForStatus(int? status) {
    return switch (status) {
      400 => 'Invalid request.',
      401 => 'Session expired. Please log in again.',
      403 => 'Access denied.',
      404 => 'Not found.',
      409 => 'Conflict.',
      422 => 'Validation error.',
      429 => 'Too many requests. Please wait a moment.',
      500 => 'Server error. Please try again later.',
      _ => null,
    };
  }

  bool get isUnauthorized => statusCode == 401;
  bool get isForbidden => statusCode == 403;
  bool get isNotFound => statusCode == 404;
  bool get isServerError => statusCode != null && statusCode! >= 500;
  bool get isNetworkError => statusCode == null;

  @override
  String toString() => 'ApiException($statusCode): $message';
}
