// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_UserModel _$UserModelFromJson(Map<String, dynamic> json) => _UserModel(
  id: json['id'] as String,
  email: json['email'] as String,
  username: json['username'] as String,
  phone: json['phone'] as String?,
  firstName: json['firstName'] as String?,
  lastName: json['lastName'] as String?,
  dateOfBirth: json['dateOfBirth'] as String?,
  countryCode: json['countryCode'] as String?,
  stateCode: json['stateCode'] as String?,
  avatar: json['avatarUrl'] as String?,
  emailVerifiedAt: json['emailVerifiedAt'] == null
      ? null
      : DateTime.parse(json['emailVerifiedAt'] as String),
  phoneVerifiedAt: json['phoneVerifiedAt'] == null
      ? null
      : DateTime.parse(json['phoneVerifiedAt'] as String),
  identityVerifiedAt: json['identityVerifiedAt'] == null
      ? null
      : DateTime.parse(json['identityVerifiedAt'] as String),
  isActive: json['isActive'] as bool? ?? true,
  isSuspended: json['isSuspended'] as bool? ?? false,
  twoFactorEnabled: json['twoFactorEnabled'] as bool? ?? false,
  lastLoginAt: json['lastLoginAt'] == null
      ? null
      : DateTime.parse(json['lastLoginAt'] as String),
  createdAt: json['createdAt'] == null
      ? null
      : DateTime.parse(json['createdAt'] as String),
);

Map<String, dynamic> _$UserModelToJson(_UserModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'email': instance.email,
      'username': instance.username,
      'phone': instance.phone,
      'firstName': instance.firstName,
      'lastName': instance.lastName,
      'dateOfBirth': instance.dateOfBirth,
      'countryCode': instance.countryCode,
      'stateCode': instance.stateCode,
      'avatarUrl': instance.avatar,
      'emailVerifiedAt': instance.emailVerifiedAt?.toIso8601String(),
      'phoneVerifiedAt': instance.phoneVerifiedAt?.toIso8601String(),
      'identityVerifiedAt': instance.identityVerifiedAt?.toIso8601String(),
      'isActive': instance.isActive,
      'isSuspended': instance.isSuspended,
      'twoFactorEnabled': instance.twoFactorEnabled,
      'lastLoginAt': instance.lastLoginAt?.toIso8601String(),
      'createdAt': instance.createdAt?.toIso8601String(),
    };
