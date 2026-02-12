import 'package:freezed_annotation/freezed_annotation.dart';

part 'vip_models.freezed.dart';
part 'vip_models.g.dart';

@freezed
abstract class VipLevel with _$VipLevel {
  const factory VipLevel({
    required String id,
    required String name,
    required int level,
    required double xpRequired,
    String? iconUrl,
    double? cashbackPercentage,
    @Default([]) List<String> benefits,
  }) = _VipLevel;

  factory VipLevel.fromJson(Map<String, dynamic> json) =>
      _$VipLevelFromJson(json);
}

@freezed
abstract class VipStatus with _$VipStatus {
  const factory VipStatus({
    required int currentLevel,
    required String levelName,
    required double currentXp,
    required double nextLevelXp,
    double? cashbackAvailable,
  }) = _VipStatus;

  factory VipStatus.fromJson(Map<String, dynamic> json) =>
      _$VipStatusFromJson(json);
}
