import 'dart:io' show Platform;

import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppConfig {
  static String get apiBaseUrl =>
      _resolveHost(dotenv.env['API_BASE_URL'] ?? 'http://localhost:4000/api/v1');

  static String get wsBaseUrl =>
      _resolveHost(dotenv.env['WS_BASE_URL'] ?? 'http://localhost:4000');

  static String get assetsUrl =>
      _resolveHost(dotenv.env['ASSETS_URL'] ?? 'http://localhost:4000/assets');

  /// Android emulator uses 10.0.2.2 to reach the host machine's localhost.
  static String _resolveHost(String url) {
    if (Platform.isAndroid) {
      return url.replaceAll('localhost', '10.0.2.2');
    }
    return url;
  }
}
