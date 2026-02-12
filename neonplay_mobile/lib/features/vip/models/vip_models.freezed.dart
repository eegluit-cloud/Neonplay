// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'vip_models.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$VipLevel {

 String get id; String get name; int get level; double get xpRequired; String? get iconUrl; double? get cashbackPercentage; List<String> get benefits;
/// Create a copy of VipLevel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$VipLevelCopyWith<VipLevel> get copyWith => _$VipLevelCopyWithImpl<VipLevel>(this as VipLevel, _$identity);

  /// Serializes this VipLevel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is VipLevel&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.level, level) || other.level == level)&&(identical(other.xpRequired, xpRequired) || other.xpRequired == xpRequired)&&(identical(other.iconUrl, iconUrl) || other.iconUrl == iconUrl)&&(identical(other.cashbackPercentage, cashbackPercentage) || other.cashbackPercentage == cashbackPercentage)&&const DeepCollectionEquality().equals(other.benefits, benefits));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,level,xpRequired,iconUrl,cashbackPercentage,const DeepCollectionEquality().hash(benefits));

@override
String toString() {
  return 'VipLevel(id: $id, name: $name, level: $level, xpRequired: $xpRequired, iconUrl: $iconUrl, cashbackPercentage: $cashbackPercentage, benefits: $benefits)';
}


}

/// @nodoc
abstract mixin class $VipLevelCopyWith<$Res>  {
  factory $VipLevelCopyWith(VipLevel value, $Res Function(VipLevel) _then) = _$VipLevelCopyWithImpl;
@useResult
$Res call({
 String id, String name, int level, double xpRequired, String? iconUrl, double? cashbackPercentage, List<String> benefits
});




}
/// @nodoc
class _$VipLevelCopyWithImpl<$Res>
    implements $VipLevelCopyWith<$Res> {
  _$VipLevelCopyWithImpl(this._self, this._then);

  final VipLevel _self;
  final $Res Function(VipLevel) _then;

/// Create a copy of VipLevel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? name = null,Object? level = null,Object? xpRequired = null,Object? iconUrl = freezed,Object? cashbackPercentage = freezed,Object? benefits = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,level: null == level ? _self.level : level // ignore: cast_nullable_to_non_nullable
as int,xpRequired: null == xpRequired ? _self.xpRequired : xpRequired // ignore: cast_nullable_to_non_nullable
as double,iconUrl: freezed == iconUrl ? _self.iconUrl : iconUrl // ignore: cast_nullable_to_non_nullable
as String?,cashbackPercentage: freezed == cashbackPercentage ? _self.cashbackPercentage : cashbackPercentage // ignore: cast_nullable_to_non_nullable
as double?,benefits: null == benefits ? _self.benefits : benefits // ignore: cast_nullable_to_non_nullable
as List<String>,
  ));
}

}


/// Adds pattern-matching-related methods to [VipLevel].
extension VipLevelPatterns on VipLevel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _VipLevel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _VipLevel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _VipLevel value)  $default,){
final _that = this;
switch (_that) {
case _VipLevel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _VipLevel value)?  $default,){
final _that = this;
switch (_that) {
case _VipLevel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String name,  int level,  double xpRequired,  String? iconUrl,  double? cashbackPercentage,  List<String> benefits)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _VipLevel() when $default != null:
return $default(_that.id,_that.name,_that.level,_that.xpRequired,_that.iconUrl,_that.cashbackPercentage,_that.benefits);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String name,  int level,  double xpRequired,  String? iconUrl,  double? cashbackPercentage,  List<String> benefits)  $default,) {final _that = this;
switch (_that) {
case _VipLevel():
return $default(_that.id,_that.name,_that.level,_that.xpRequired,_that.iconUrl,_that.cashbackPercentage,_that.benefits);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String name,  int level,  double xpRequired,  String? iconUrl,  double? cashbackPercentage,  List<String> benefits)?  $default,) {final _that = this;
switch (_that) {
case _VipLevel() when $default != null:
return $default(_that.id,_that.name,_that.level,_that.xpRequired,_that.iconUrl,_that.cashbackPercentage,_that.benefits);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _VipLevel implements VipLevel {
  const _VipLevel({required this.id, required this.name, required this.level, required this.xpRequired, this.iconUrl, this.cashbackPercentage, final  List<String> benefits = const []}): _benefits = benefits;
  factory _VipLevel.fromJson(Map<String, dynamic> json) => _$VipLevelFromJson(json);

@override final  String id;
@override final  String name;
@override final  int level;
@override final  double xpRequired;
@override final  String? iconUrl;
@override final  double? cashbackPercentage;
 final  List<String> _benefits;
@override@JsonKey() List<String> get benefits {
  if (_benefits is EqualUnmodifiableListView) return _benefits;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_benefits);
}


/// Create a copy of VipLevel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$VipLevelCopyWith<_VipLevel> get copyWith => __$VipLevelCopyWithImpl<_VipLevel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$VipLevelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _VipLevel&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.level, level) || other.level == level)&&(identical(other.xpRequired, xpRequired) || other.xpRequired == xpRequired)&&(identical(other.iconUrl, iconUrl) || other.iconUrl == iconUrl)&&(identical(other.cashbackPercentage, cashbackPercentage) || other.cashbackPercentage == cashbackPercentage)&&const DeepCollectionEquality().equals(other._benefits, _benefits));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,level,xpRequired,iconUrl,cashbackPercentage,const DeepCollectionEquality().hash(_benefits));

@override
String toString() {
  return 'VipLevel(id: $id, name: $name, level: $level, xpRequired: $xpRequired, iconUrl: $iconUrl, cashbackPercentage: $cashbackPercentage, benefits: $benefits)';
}


}

/// @nodoc
abstract mixin class _$VipLevelCopyWith<$Res> implements $VipLevelCopyWith<$Res> {
  factory _$VipLevelCopyWith(_VipLevel value, $Res Function(_VipLevel) _then) = __$VipLevelCopyWithImpl;
@override @useResult
$Res call({
 String id, String name, int level, double xpRequired, String? iconUrl, double? cashbackPercentage, List<String> benefits
});




}
/// @nodoc
class __$VipLevelCopyWithImpl<$Res>
    implements _$VipLevelCopyWith<$Res> {
  __$VipLevelCopyWithImpl(this._self, this._then);

  final _VipLevel _self;
  final $Res Function(_VipLevel) _then;

/// Create a copy of VipLevel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? name = null,Object? level = null,Object? xpRequired = null,Object? iconUrl = freezed,Object? cashbackPercentage = freezed,Object? benefits = null,}) {
  return _then(_VipLevel(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,level: null == level ? _self.level : level // ignore: cast_nullable_to_non_nullable
as int,xpRequired: null == xpRequired ? _self.xpRequired : xpRequired // ignore: cast_nullable_to_non_nullable
as double,iconUrl: freezed == iconUrl ? _self.iconUrl : iconUrl // ignore: cast_nullable_to_non_nullable
as String?,cashbackPercentage: freezed == cashbackPercentage ? _self.cashbackPercentage : cashbackPercentage // ignore: cast_nullable_to_non_nullable
as double?,benefits: null == benefits ? _self._benefits : benefits // ignore: cast_nullable_to_non_nullable
as List<String>,
  ));
}


}


/// @nodoc
mixin _$VipStatus {

 int get currentLevel; String get levelName; double get currentXp; double get nextLevelXp; double? get cashbackAvailable;
/// Create a copy of VipStatus
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$VipStatusCopyWith<VipStatus> get copyWith => _$VipStatusCopyWithImpl<VipStatus>(this as VipStatus, _$identity);

  /// Serializes this VipStatus to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is VipStatus&&(identical(other.currentLevel, currentLevel) || other.currentLevel == currentLevel)&&(identical(other.levelName, levelName) || other.levelName == levelName)&&(identical(other.currentXp, currentXp) || other.currentXp == currentXp)&&(identical(other.nextLevelXp, nextLevelXp) || other.nextLevelXp == nextLevelXp)&&(identical(other.cashbackAvailable, cashbackAvailable) || other.cashbackAvailable == cashbackAvailable));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,currentLevel,levelName,currentXp,nextLevelXp,cashbackAvailable);

@override
String toString() {
  return 'VipStatus(currentLevel: $currentLevel, levelName: $levelName, currentXp: $currentXp, nextLevelXp: $nextLevelXp, cashbackAvailable: $cashbackAvailable)';
}


}

/// @nodoc
abstract mixin class $VipStatusCopyWith<$Res>  {
  factory $VipStatusCopyWith(VipStatus value, $Res Function(VipStatus) _then) = _$VipStatusCopyWithImpl;
@useResult
$Res call({
 int currentLevel, String levelName, double currentXp, double nextLevelXp, double? cashbackAvailable
});




}
/// @nodoc
class _$VipStatusCopyWithImpl<$Res>
    implements $VipStatusCopyWith<$Res> {
  _$VipStatusCopyWithImpl(this._self, this._then);

  final VipStatus _self;
  final $Res Function(VipStatus) _then;

/// Create a copy of VipStatus
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? currentLevel = null,Object? levelName = null,Object? currentXp = null,Object? nextLevelXp = null,Object? cashbackAvailable = freezed,}) {
  return _then(_self.copyWith(
currentLevel: null == currentLevel ? _self.currentLevel : currentLevel // ignore: cast_nullable_to_non_nullable
as int,levelName: null == levelName ? _self.levelName : levelName // ignore: cast_nullable_to_non_nullable
as String,currentXp: null == currentXp ? _self.currentXp : currentXp // ignore: cast_nullable_to_non_nullable
as double,nextLevelXp: null == nextLevelXp ? _self.nextLevelXp : nextLevelXp // ignore: cast_nullable_to_non_nullable
as double,cashbackAvailable: freezed == cashbackAvailable ? _self.cashbackAvailable : cashbackAvailable // ignore: cast_nullable_to_non_nullable
as double?,
  ));
}

}


/// Adds pattern-matching-related methods to [VipStatus].
extension VipStatusPatterns on VipStatus {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _VipStatus value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _VipStatus() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _VipStatus value)  $default,){
final _that = this;
switch (_that) {
case _VipStatus():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _VipStatus value)?  $default,){
final _that = this;
switch (_that) {
case _VipStatus() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( int currentLevel,  String levelName,  double currentXp,  double nextLevelXp,  double? cashbackAvailable)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _VipStatus() when $default != null:
return $default(_that.currentLevel,_that.levelName,_that.currentXp,_that.nextLevelXp,_that.cashbackAvailable);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( int currentLevel,  String levelName,  double currentXp,  double nextLevelXp,  double? cashbackAvailable)  $default,) {final _that = this;
switch (_that) {
case _VipStatus():
return $default(_that.currentLevel,_that.levelName,_that.currentXp,_that.nextLevelXp,_that.cashbackAvailable);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( int currentLevel,  String levelName,  double currentXp,  double nextLevelXp,  double? cashbackAvailable)?  $default,) {final _that = this;
switch (_that) {
case _VipStatus() when $default != null:
return $default(_that.currentLevel,_that.levelName,_that.currentXp,_that.nextLevelXp,_that.cashbackAvailable);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _VipStatus implements VipStatus {
  const _VipStatus({required this.currentLevel, required this.levelName, required this.currentXp, required this.nextLevelXp, this.cashbackAvailable});
  factory _VipStatus.fromJson(Map<String, dynamic> json) => _$VipStatusFromJson(json);

@override final  int currentLevel;
@override final  String levelName;
@override final  double currentXp;
@override final  double nextLevelXp;
@override final  double? cashbackAvailable;

/// Create a copy of VipStatus
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$VipStatusCopyWith<_VipStatus> get copyWith => __$VipStatusCopyWithImpl<_VipStatus>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$VipStatusToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _VipStatus&&(identical(other.currentLevel, currentLevel) || other.currentLevel == currentLevel)&&(identical(other.levelName, levelName) || other.levelName == levelName)&&(identical(other.currentXp, currentXp) || other.currentXp == currentXp)&&(identical(other.nextLevelXp, nextLevelXp) || other.nextLevelXp == nextLevelXp)&&(identical(other.cashbackAvailable, cashbackAvailable) || other.cashbackAvailable == cashbackAvailable));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,currentLevel,levelName,currentXp,nextLevelXp,cashbackAvailable);

@override
String toString() {
  return 'VipStatus(currentLevel: $currentLevel, levelName: $levelName, currentXp: $currentXp, nextLevelXp: $nextLevelXp, cashbackAvailable: $cashbackAvailable)';
}


}

/// @nodoc
abstract mixin class _$VipStatusCopyWith<$Res> implements $VipStatusCopyWith<$Res> {
  factory _$VipStatusCopyWith(_VipStatus value, $Res Function(_VipStatus) _then) = __$VipStatusCopyWithImpl;
@override @useResult
$Res call({
 int currentLevel, String levelName, double currentXp, double nextLevelXp, double? cashbackAvailable
});




}
/// @nodoc
class __$VipStatusCopyWithImpl<$Res>
    implements _$VipStatusCopyWith<$Res> {
  __$VipStatusCopyWithImpl(this._self, this._then);

  final _VipStatus _self;
  final $Res Function(_VipStatus) _then;

/// Create a copy of VipStatus
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? currentLevel = null,Object? levelName = null,Object? currentXp = null,Object? nextLevelXp = null,Object? cashbackAvailable = freezed,}) {
  return _then(_VipStatus(
currentLevel: null == currentLevel ? _self.currentLevel : currentLevel // ignore: cast_nullable_to_non_nullable
as int,levelName: null == levelName ? _self.levelName : levelName // ignore: cast_nullable_to_non_nullable
as String,currentXp: null == currentXp ? _self.currentXp : currentXp // ignore: cast_nullable_to_non_nullable
as double,nextLevelXp: null == nextLevelXp ? _self.nextLevelXp : nextLevelXp // ignore: cast_nullable_to_non_nullable
as double,cashbackAvailable: freezed == cashbackAvailable ? _self.cashbackAvailable : cashbackAvailable // ignore: cast_nullable_to_non_nullable
as double?,
  ));
}


}

// dart format on
