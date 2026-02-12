import 'package:freezed_annotation/freezed_annotation.dart';

part 'activity_models.freezed.dart';
part 'activity_models.g.dart';

@freezed
abstract class RecentWin with _$RecentWin {
  const factory RecentWin({
    required String id,
    required String username,
    required String game,
    required double amount,
    @Default('USD') String currency,
    String? avatar,
    String? gameImage,
    DateTime? timestamp,
  }) = _RecentWin;

  factory RecentWin.fromJson(Map<String, dynamic> json) =>
      _$RecentWinFromJson(json);
}
