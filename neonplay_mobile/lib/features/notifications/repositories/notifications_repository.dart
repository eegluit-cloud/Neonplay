import '../../../core/network/api_endpoints.dart';
import '../../../core/network/api_response_parser.dart';
import '../../../core/network/dio_client.dart';
import '../models/notification_model.dart';

class NotificationsRepository {
  final DioClient _client;

  NotificationsRepository(this._client);

  Future<List<NotificationModel>> getAll({
    int page = 1,
    int limit = 20,
    bool? unreadOnly,
  }) async {
    final response = await _client.get(
      ApiEndpoints.notifications,
      queryParameters: {
        'page': page,
        'limit': limit,
        'unreadOnly': ?unreadOnly,
      },
    );
    return ApiResponseParser.parseArray(
        response.data, NotificationModel.fromJson);
  }

  Future<void> markAsRead(String id) async {
    await _client.post(ApiEndpoints.markNotificationRead(id));
  }

  Future<void> markAllAsRead() async {
    await _client.post(ApiEndpoints.markAllNotificationsRead);
  }
}
