// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'user_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$UserModel {

 String get id; String get email; String get username; String? get phone; String? get firstName; String? get lastName; String? get dateOfBirth; String? get countryCode; String? get stateCode;@JsonKey(name: 'avatarUrl') String? get avatar; DateTime? get emailVerifiedAt; DateTime? get phoneVerifiedAt; DateTime? get identityVerifiedAt; bool get isActive; bool get isSuspended; bool get twoFactorEnabled; DateTime? get lastLoginAt; DateTime? get createdAt;
/// Create a copy of UserModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$UserModelCopyWith<UserModel> get copyWith => _$UserModelCopyWithImpl<UserModel>(this as UserModel, _$identity);

  /// Serializes this UserModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is UserModel&&(identical(other.id, id) || other.id == id)&&(identical(other.email, email) || other.email == email)&&(identical(other.username, username) || other.username == username)&&(identical(other.phone, phone) || other.phone == phone)&&(identical(other.firstName, firstName) || other.firstName == firstName)&&(identical(other.lastName, lastName) || other.lastName == lastName)&&(identical(other.dateOfBirth, dateOfBirth) || other.dateOfBirth == dateOfBirth)&&(identical(other.countryCode, countryCode) || other.countryCode == countryCode)&&(identical(other.stateCode, stateCode) || other.stateCode == stateCode)&&(identical(other.avatar, avatar) || other.avatar == avatar)&&(identical(other.emailVerifiedAt, emailVerifiedAt) || other.emailVerifiedAt == emailVerifiedAt)&&(identical(other.phoneVerifiedAt, phoneVerifiedAt) || other.phoneVerifiedAt == phoneVerifiedAt)&&(identical(other.identityVerifiedAt, identityVerifiedAt) || other.identityVerifiedAt == identityVerifiedAt)&&(identical(other.isActive, isActive) || other.isActive == isActive)&&(identical(other.isSuspended, isSuspended) || other.isSuspended == isSuspended)&&(identical(other.twoFactorEnabled, twoFactorEnabled) || other.twoFactorEnabled == twoFactorEnabled)&&(identical(other.lastLoginAt, lastLoginAt) || other.lastLoginAt == lastLoginAt)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,email,username,phone,firstName,lastName,dateOfBirth,countryCode,stateCode,avatar,emailVerifiedAt,phoneVerifiedAt,identityVerifiedAt,isActive,isSuspended,twoFactorEnabled,lastLoginAt,createdAt);

@override
String toString() {
  return 'UserModel(id: $id, email: $email, username: $username, phone: $phone, firstName: $firstName, lastName: $lastName, dateOfBirth: $dateOfBirth, countryCode: $countryCode, stateCode: $stateCode, avatar: $avatar, emailVerifiedAt: $emailVerifiedAt, phoneVerifiedAt: $phoneVerifiedAt, identityVerifiedAt: $identityVerifiedAt, isActive: $isActive, isSuspended: $isSuspended, twoFactorEnabled: $twoFactorEnabled, lastLoginAt: $lastLoginAt, createdAt: $createdAt)';
}


}

/// @nodoc
abstract mixin class $UserModelCopyWith<$Res>  {
  factory $UserModelCopyWith(UserModel value, $Res Function(UserModel) _then) = _$UserModelCopyWithImpl;
@useResult
$Res call({
 String id, String email, String username, String? phone, String? firstName, String? lastName, String? dateOfBirth, String? countryCode, String? stateCode,@JsonKey(name: 'avatarUrl') String? avatar, DateTime? emailVerifiedAt, DateTime? phoneVerifiedAt, DateTime? identityVerifiedAt, bool isActive, bool isSuspended, bool twoFactorEnabled, DateTime? lastLoginAt, DateTime? createdAt
});




}
/// @nodoc
class _$UserModelCopyWithImpl<$Res>
    implements $UserModelCopyWith<$Res> {
  _$UserModelCopyWithImpl(this._self, this._then);

  final UserModel _self;
  final $Res Function(UserModel) _then;

/// Create a copy of UserModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? email = null,Object? username = null,Object? phone = freezed,Object? firstName = freezed,Object? lastName = freezed,Object? dateOfBirth = freezed,Object? countryCode = freezed,Object? stateCode = freezed,Object? avatar = freezed,Object? emailVerifiedAt = freezed,Object? phoneVerifiedAt = freezed,Object? identityVerifiedAt = freezed,Object? isActive = null,Object? isSuspended = null,Object? twoFactorEnabled = null,Object? lastLoginAt = freezed,Object? createdAt = freezed,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,email: null == email ? _self.email : email // ignore: cast_nullable_to_non_nullable
as String,username: null == username ? _self.username : username // ignore: cast_nullable_to_non_nullable
as String,phone: freezed == phone ? _self.phone : phone // ignore: cast_nullable_to_non_nullable
as String?,firstName: freezed == firstName ? _self.firstName : firstName // ignore: cast_nullable_to_non_nullable
as String?,lastName: freezed == lastName ? _self.lastName : lastName // ignore: cast_nullable_to_non_nullable
as String?,dateOfBirth: freezed == dateOfBirth ? _self.dateOfBirth : dateOfBirth // ignore: cast_nullable_to_non_nullable
as String?,countryCode: freezed == countryCode ? _self.countryCode : countryCode // ignore: cast_nullable_to_non_nullable
as String?,stateCode: freezed == stateCode ? _self.stateCode : stateCode // ignore: cast_nullable_to_non_nullable
as String?,avatar: freezed == avatar ? _self.avatar : avatar // ignore: cast_nullable_to_non_nullable
as String?,emailVerifiedAt: freezed == emailVerifiedAt ? _self.emailVerifiedAt : emailVerifiedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,phoneVerifiedAt: freezed == phoneVerifiedAt ? _self.phoneVerifiedAt : phoneVerifiedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,identityVerifiedAt: freezed == identityVerifiedAt ? _self.identityVerifiedAt : identityVerifiedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,isActive: null == isActive ? _self.isActive : isActive // ignore: cast_nullable_to_non_nullable
as bool,isSuspended: null == isSuspended ? _self.isSuspended : isSuspended // ignore: cast_nullable_to_non_nullable
as bool,twoFactorEnabled: null == twoFactorEnabled ? _self.twoFactorEnabled : twoFactorEnabled // ignore: cast_nullable_to_non_nullable
as bool,lastLoginAt: freezed == lastLoginAt ? _self.lastLoginAt : lastLoginAt // ignore: cast_nullable_to_non_nullable
as DateTime?,createdAt: freezed == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime?,
  ));
}

}


/// Adds pattern-matching-related methods to [UserModel].
extension UserModelPatterns on UserModel {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _UserModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _UserModel() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _UserModel value)  $default,){
final _that = this;
switch (_that) {
case _UserModel():
return $default(_that);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _UserModel value)?  $default,){
final _that = this;
switch (_that) {
case _UserModel() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String email,  String username,  String? phone,  String? firstName,  String? lastName,  String? dateOfBirth,  String? countryCode,  String? stateCode, @JsonKey(name: 'avatarUrl')  String? avatar,  DateTime? emailVerifiedAt,  DateTime? phoneVerifiedAt,  DateTime? identityVerifiedAt,  bool isActive,  bool isSuspended,  bool twoFactorEnabled,  DateTime? lastLoginAt,  DateTime? createdAt)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _UserModel() when $default != null:
return $default(_that.id,_that.email,_that.username,_that.phone,_that.firstName,_that.lastName,_that.dateOfBirth,_that.countryCode,_that.stateCode,_that.avatar,_that.emailVerifiedAt,_that.phoneVerifiedAt,_that.identityVerifiedAt,_that.isActive,_that.isSuspended,_that.twoFactorEnabled,_that.lastLoginAt,_that.createdAt);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String email,  String username,  String? phone,  String? firstName,  String? lastName,  String? dateOfBirth,  String? countryCode,  String? stateCode, @JsonKey(name: 'avatarUrl')  String? avatar,  DateTime? emailVerifiedAt,  DateTime? phoneVerifiedAt,  DateTime? identityVerifiedAt,  bool isActive,  bool isSuspended,  bool twoFactorEnabled,  DateTime? lastLoginAt,  DateTime? createdAt)  $default,) {final _that = this;
switch (_that) {
case _UserModel():
return $default(_that.id,_that.email,_that.username,_that.phone,_that.firstName,_that.lastName,_that.dateOfBirth,_that.countryCode,_that.stateCode,_that.avatar,_that.emailVerifiedAt,_that.phoneVerifiedAt,_that.identityVerifiedAt,_that.isActive,_that.isSuspended,_that.twoFactorEnabled,_that.lastLoginAt,_that.createdAt);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String email,  String username,  String? phone,  String? firstName,  String? lastName,  String? dateOfBirth,  String? countryCode,  String? stateCode, @JsonKey(name: 'avatarUrl')  String? avatar,  DateTime? emailVerifiedAt,  DateTime? phoneVerifiedAt,  DateTime? identityVerifiedAt,  bool isActive,  bool isSuspended,  bool twoFactorEnabled,  DateTime? lastLoginAt,  DateTime? createdAt)?  $default,) {final _that = this;
switch (_that) {
case _UserModel() when $default != null:
return $default(_that.id,_that.email,_that.username,_that.phone,_that.firstName,_that.lastName,_that.dateOfBirth,_that.countryCode,_that.stateCode,_that.avatar,_that.emailVerifiedAt,_that.phoneVerifiedAt,_that.identityVerifiedAt,_that.isActive,_that.isSuspended,_that.twoFactorEnabled,_that.lastLoginAt,_that.createdAt);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _UserModel implements UserModel {
  const _UserModel({required this.id, required this.email, required this.username, this.phone, this.firstName, this.lastName, this.dateOfBirth, this.countryCode, this.stateCode, @JsonKey(name: 'avatarUrl') this.avatar, this.emailVerifiedAt, this.phoneVerifiedAt, this.identityVerifiedAt, this.isActive = true, this.isSuspended = false, this.twoFactorEnabled = false, this.lastLoginAt, this.createdAt});
  factory _UserModel.fromJson(Map<String, dynamic> json) => _$UserModelFromJson(json);

@override final  String id;
@override final  String email;
@override final  String username;
@override final  String? phone;
@override final  String? firstName;
@override final  String? lastName;
@override final  String? dateOfBirth;
@override final  String? countryCode;
@override final  String? stateCode;
@override@JsonKey(name: 'avatarUrl') final  String? avatar;
@override final  DateTime? emailVerifiedAt;
@override final  DateTime? phoneVerifiedAt;
@override final  DateTime? identityVerifiedAt;
@override@JsonKey() final  bool isActive;
@override@JsonKey() final  bool isSuspended;
@override@JsonKey() final  bool twoFactorEnabled;
@override final  DateTime? lastLoginAt;
@override final  DateTime? createdAt;

/// Create a copy of UserModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$UserModelCopyWith<_UserModel> get copyWith => __$UserModelCopyWithImpl<_UserModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$UserModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _UserModel&&(identical(other.id, id) || other.id == id)&&(identical(other.email, email) || other.email == email)&&(identical(other.username, username) || other.username == username)&&(identical(other.phone, phone) || other.phone == phone)&&(identical(other.firstName, firstName) || other.firstName == firstName)&&(identical(other.lastName, lastName) || other.lastName == lastName)&&(identical(other.dateOfBirth, dateOfBirth) || other.dateOfBirth == dateOfBirth)&&(identical(other.countryCode, countryCode) || other.countryCode == countryCode)&&(identical(other.stateCode, stateCode) || other.stateCode == stateCode)&&(identical(other.avatar, avatar) || other.avatar == avatar)&&(identical(other.emailVerifiedAt, emailVerifiedAt) || other.emailVerifiedAt == emailVerifiedAt)&&(identical(other.phoneVerifiedAt, phoneVerifiedAt) || other.phoneVerifiedAt == phoneVerifiedAt)&&(identical(other.identityVerifiedAt, identityVerifiedAt) || other.identityVerifiedAt == identityVerifiedAt)&&(identical(other.isActive, isActive) || other.isActive == isActive)&&(identical(other.isSuspended, isSuspended) || other.isSuspended == isSuspended)&&(identical(other.twoFactorEnabled, twoFactorEnabled) || other.twoFactorEnabled == twoFactorEnabled)&&(identical(other.lastLoginAt, lastLoginAt) || other.lastLoginAt == lastLoginAt)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,email,username,phone,firstName,lastName,dateOfBirth,countryCode,stateCode,avatar,emailVerifiedAt,phoneVerifiedAt,identityVerifiedAt,isActive,isSuspended,twoFactorEnabled,lastLoginAt,createdAt);

@override
String toString() {
  return 'UserModel(id: $id, email: $email, username: $username, phone: $phone, firstName: $firstName, lastName: $lastName, dateOfBirth: $dateOfBirth, countryCode: $countryCode, stateCode: $stateCode, avatar: $avatar, emailVerifiedAt: $emailVerifiedAt, phoneVerifiedAt: $phoneVerifiedAt, identityVerifiedAt: $identityVerifiedAt, isActive: $isActive, isSuspended: $isSuspended, twoFactorEnabled: $twoFactorEnabled, lastLoginAt: $lastLoginAt, createdAt: $createdAt)';
}


}

/// @nodoc
abstract mixin class _$UserModelCopyWith<$Res> implements $UserModelCopyWith<$Res> {
  factory _$UserModelCopyWith(_UserModel value, $Res Function(_UserModel) _then) = __$UserModelCopyWithImpl;
@override @useResult
$Res call({
 String id, String email, String username, String? phone, String? firstName, String? lastName, String? dateOfBirth, String? countryCode, String? stateCode,@JsonKey(name: 'avatarUrl') String? avatar, DateTime? emailVerifiedAt, DateTime? phoneVerifiedAt, DateTime? identityVerifiedAt, bool isActive, bool isSuspended, bool twoFactorEnabled, DateTime? lastLoginAt, DateTime? createdAt
});




}
/// @nodoc
class __$UserModelCopyWithImpl<$Res>
    implements _$UserModelCopyWith<$Res> {
  __$UserModelCopyWithImpl(this._self, this._then);

  final _UserModel _self;
  final $Res Function(_UserModel) _then;

/// Create a copy of UserModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? email = null,Object? username = null,Object? phone = freezed,Object? firstName = freezed,Object? lastName = freezed,Object? dateOfBirth = freezed,Object? countryCode = freezed,Object? stateCode = freezed,Object? avatar = freezed,Object? emailVerifiedAt = freezed,Object? phoneVerifiedAt = freezed,Object? identityVerifiedAt = freezed,Object? isActive = null,Object? isSuspended = null,Object? twoFactorEnabled = null,Object? lastLoginAt = freezed,Object? createdAt = freezed,}) {
  return _then(_UserModel(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,email: null == email ? _self.email : email // ignore: cast_nullable_to_non_nullable
as String,username: null == username ? _self.username : username // ignore: cast_nullable_to_non_nullable
as String,phone: freezed == phone ? _self.phone : phone // ignore: cast_nullable_to_non_nullable
as String?,firstName: freezed == firstName ? _self.firstName : firstName // ignore: cast_nullable_to_non_nullable
as String?,lastName: freezed == lastName ? _self.lastName : lastName // ignore: cast_nullable_to_non_nullable
as String?,dateOfBirth: freezed == dateOfBirth ? _self.dateOfBirth : dateOfBirth // ignore: cast_nullable_to_non_nullable
as String?,countryCode: freezed == countryCode ? _self.countryCode : countryCode // ignore: cast_nullable_to_non_nullable
as String?,stateCode: freezed == stateCode ? _self.stateCode : stateCode // ignore: cast_nullable_to_non_nullable
as String?,avatar: freezed == avatar ? _self.avatar : avatar // ignore: cast_nullable_to_non_nullable
as String?,emailVerifiedAt: freezed == emailVerifiedAt ? _self.emailVerifiedAt : emailVerifiedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,phoneVerifiedAt: freezed == phoneVerifiedAt ? _self.phoneVerifiedAt : phoneVerifiedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,identityVerifiedAt: freezed == identityVerifiedAt ? _self.identityVerifiedAt : identityVerifiedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,isActive: null == isActive ? _self.isActive : isActive // ignore: cast_nullable_to_non_nullable
as bool,isSuspended: null == isSuspended ? _self.isSuspended : isSuspended // ignore: cast_nullable_to_non_nullable
as bool,twoFactorEnabled: null == twoFactorEnabled ? _self.twoFactorEnabled : twoFactorEnabled // ignore: cast_nullable_to_non_nullable
as bool,lastLoginAt: freezed == lastLoginAt ? _self.lastLoginAt : lastLoginAt // ignore: cast_nullable_to_non_nullable
as DateTime?,createdAt: freezed == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime?,
  ));
}


}

// dart format on
