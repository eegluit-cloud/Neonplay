import 'package:freezed_annotation/freezed_annotation.dart';

part 'user_model.freezed.dart';
part 'user_model.g.dart';

@freezed
abstract class UserModel with _$UserModel {
  const factory UserModel({
    required String id,
    required String email,
    required String username,
    String? phone,
    String? firstName,
    String? lastName,
    String? dateOfBirth,
    String? countryCode,
    String? stateCode,
    @JsonKey(name: 'avatarUrl') String? avatar,
    DateTime? emailVerifiedAt,
    DateTime? phoneVerifiedAt,
    DateTime? identityVerifiedAt,
    @Default(true) bool isActive,
    @Default(false) bool isSuspended,
    @Default(false) bool twoFactorEnabled,
    DateTime? lastLoginAt,
    DateTime? createdAt,
  }) = _UserModel;

  factory UserModel.fromJson(Map<String, dynamic> json) =>
      _$UserModelFromJson(json);
}
