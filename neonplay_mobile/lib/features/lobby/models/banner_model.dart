import 'package:freezed_annotation/freezed_annotation.dart';

part 'banner_model.freezed.dart';
part 'banner_model.g.dart';

@freezed
abstract class BannerModel with _$BannerModel {
  const factory BannerModel({
    required String id,
    required String title,
    String? subtitle,
    String? imageUrl,
    String? videoUrl,
    String? linkUrl,
    String? ctaText,
    @Default(0) int order,
    @Default(true) bool isActive,
  }) = _BannerModel;

  factory BannerModel.fromJson(Map<String, dynamic> json) =>
      _$BannerModelFromJson(json);
}
