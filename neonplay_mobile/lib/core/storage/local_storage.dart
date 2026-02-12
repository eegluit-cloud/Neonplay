import 'package:shared_preferences/shared_preferences.dart';

/// Wrapper for SharedPreferences (non-sensitive data).
/// Used for: theme, locale, demo wallet, sidebar state, etc.
class LocalStorage {
  static SharedPreferences? _prefs;

  static Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  static SharedPreferences get instance {
    if (_prefs == null) {
      throw StateError('LocalStorage not initialized. Call init() first.');
    }
    return _prefs!;
  }

  static Future<bool> setBool(String key, bool value) =>
      instance.setBool(key, value);

  static bool? getBool(String key) => instance.getBool(key);

  static Future<bool> setString(String key, String value) =>
      instance.setString(key, value);

  static String? getString(String key) => instance.getString(key);

  static Future<bool> setDouble(String key, double value) =>
      instance.setDouble(key, value);

  static double? getDouble(String key) => instance.getDouble(key);

  static Future<bool> remove(String key) => instance.remove(key);
}
