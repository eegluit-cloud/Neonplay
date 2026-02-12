import 'package:freezed_annotation/freezed_annotation.dart';

part 'jackpot_models.freezed.dart';
part 'jackpot_models.g.dart';

@freezed
abstract class JackpotModel with _$JackpotModel {
  const factory JackpotModel({
    required String id,
    required String name,
    required double currentValue,
    double? seedValue,
    String? currency,
    String? lastWonBy,
    double? lastWonAmount,
    DateTime? lastWonAt,
  }) = _JackpotModel;

  factory JackpotModel.fromJson(Map<String, dynamic> json) =>
      _$JackpotModelFromJson(json);
}
