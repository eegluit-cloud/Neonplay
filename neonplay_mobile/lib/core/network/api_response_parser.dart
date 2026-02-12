/// Helpers for parsing backend API responses that may return data in
/// different shapes: plain arrays, `{ data: [...] }`, or `{ items: [...] }`.
class ApiResponseParser {
  /// Parse a list from response data that may be:
  /// - A plain `List`
  /// - `{ data: [...] }`
  /// - `{ items: [...] }`
  static List<T> parseArray<T>(
      dynamic data, T Function(Map<String, dynamic>) fromJson) {
    final List items;
    if (data is List) {
      items = data;
    } else if (data is Map<String, dynamic>) {
      items = data['data'] as List? ?? data['items'] as List? ?? [];
    } else {
      items = [];
    }
    return items
        .map((e) => fromJson(e as Map<String, dynamic>))
        .toList();
  }

  /// Parse an int that may come as `String` or `num` from the API.
  static int? parseInt(dynamic value) {
    if (value is int) return value;
    if (value is num) return value.toInt();
    if (value is String) return int.tryParse(value);
    return null;
  }

  /// Extract the `meta` pagination block from a paginated response.
  static Map<String, dynamic> parseMeta(Map<String, dynamic> body) {
    return body['meta'] as Map<String, dynamic>? ?? {};
  }

  /// Extract items list from `{ items: [...] }` or `{ data: [...] }`.
  static List<T> parseItems<T>(
      Map<String, dynamic> body, T Function(Map<String, dynamic>) fromJson) {
    final items = body['items'] as List? ?? body['data'] as List? ?? [];
    return items
        .map((e) => fromJson(e as Map<String, dynamic>))
        .toList();
  }
}
