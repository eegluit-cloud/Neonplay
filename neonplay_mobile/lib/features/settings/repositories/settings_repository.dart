import '../../../core/network/api_endpoints.dart';
import '../../../core/network/dio_client.dart';

class SettingsRepository {
  final DioClient _client;

  SettingsRepository(this._client);

  Future<Map<String, dynamic>> getSettings() async {
    final response = await _client.get(ApiEndpoints.settings);
    return response.data as Map<String, dynamic>;
  }

  Future<void> updateSettings(Map<String, dynamic> data) async {
    await _client.patch(ApiEndpoints.settings, data: data);
  }

  Future<Map<String, dynamic>> getPreferences() async {
    final response = await _client.get(ApiEndpoints.settingsPreferences);
    return response.data as Map<String, dynamic>;
  }

  Future<void> updatePreferences(Map<String, dynamic> data) async {
    await _client.patch(ApiEndpoints.settingsPreferences, data: data);
  }
}
