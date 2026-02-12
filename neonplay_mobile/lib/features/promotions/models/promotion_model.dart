import 'package:freezed_annotation/freezed_annotation.dart';

part 'promotion_model.freezed.dart';
part 'promotion_model.g.dart';

@freezed
abstract class PromotionModel with _$PromotionModel {
  const factory PromotionModel({
    required String id,
    @JsonKey(name: 'name') required String title,
    String? slug,
    String? description,
    String? imageUrl,
    String? type,
    double? bonusAmount,
    @JsonKey(name: 'percentageBonus') double? bonusPercentage,
    @JsonKey(name: 'wageringRequirement') int? wagerRequirement,
    @JsonKey(name: 'startsAt') String? startDate,
    @JsonKey(name: 'endsAt') String? endDate,
    @Default(true) bool isActive,
    @Default(false) bool isClaimed,
  }) = _PromotionModel;

  factory PromotionModel.fromJson(Map<String, dynamic> json) =>
      _$PromotionModelFromJson(json);
}
