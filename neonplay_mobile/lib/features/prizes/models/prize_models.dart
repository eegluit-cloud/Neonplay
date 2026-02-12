import 'package:freezed_annotation/freezed_annotation.dart';

part 'prize_models.freezed.dart';
part 'prize_models.g.dart';

@freezed
abstract class PrizeModel with _$PrizeModel {
  const factory PrizeModel({
    required String id,
    required String name,
    String? description,
    String? imageUrl,
    String? category,
    String? tier,
    int? pointsCost,
    @Default(true) bool isAvailable,
  }) = _PrizeModel;

  factory PrizeModel.fromJson(Map<String, dynamic> json) =>
      _$PrizeModelFromJson(json);
}
