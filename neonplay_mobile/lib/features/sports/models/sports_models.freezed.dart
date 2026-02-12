// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'sports_models.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$SportModel {

 String get id; String get name; String get slug; String? get iconKey; bool get isActive; int get sortOrder;
/// Create a copy of SportModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$SportModelCopyWith<SportModel> get copyWith => _$SportModelCopyWithImpl<SportModel>(this as SportModel, _$identity);

  /// Serializes this SportModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is SportModel&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.slug, slug) || other.slug == slug)&&(identical(other.iconKey, iconKey) || other.iconKey == iconKey)&&(identical(other.isActive, isActive) || other.isActive == isActive)&&(identical(other.sortOrder, sortOrder) || other.sortOrder == sortOrder));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,slug,iconKey,isActive,sortOrder);

@override
String toString() {
  return 'SportModel(id: $id, name: $name, slug: $slug, iconKey: $iconKey, isActive: $isActive, sortOrder: $sortOrder)';
}


}

/// @nodoc
abstract mixin class $SportModelCopyWith<$Res>  {
  factory $SportModelCopyWith(SportModel value, $Res Function(SportModel) _then) = _$SportModelCopyWithImpl;
@useResult
$Res call({
 String id, String name, String slug, String? iconKey, bool isActive, int sortOrder
});




}
/// @nodoc
class _$SportModelCopyWithImpl<$Res>
    implements $SportModelCopyWith<$Res> {
  _$SportModelCopyWithImpl(this._self, this._then);

  final SportModel _self;
  final $Res Function(SportModel) _then;

/// Create a copy of SportModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? name = null,Object? slug = null,Object? iconKey = freezed,Object? isActive = null,Object? sortOrder = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,slug: null == slug ? _self.slug : slug // ignore: cast_nullable_to_non_nullable
as String,iconKey: freezed == iconKey ? _self.iconKey : iconKey // ignore: cast_nullable_to_non_nullable
as String?,isActive: null == isActive ? _self.isActive : isActive // ignore: cast_nullable_to_non_nullable
as bool,sortOrder: null == sortOrder ? _self.sortOrder : sortOrder // ignore: cast_nullable_to_non_nullable
as int,
  ));
}

}


/// Adds pattern-matching-related methods to [SportModel].
extension SportModelPatterns on SportModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _SportModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _SportModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _SportModel value)  $default,){
final _that = this;
switch (_that) {
case _SportModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _SportModel value)?  $default,){
final _that = this;
switch (_that) {
case _SportModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String name,  String slug,  String? iconKey,  bool isActive,  int sortOrder)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _SportModel() when $default != null:
return $default(_that.id,_that.name,_that.slug,_that.iconKey,_that.isActive,_that.sortOrder);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String name,  String slug,  String? iconKey,  bool isActive,  int sortOrder)  $default,) {final _that = this;
switch (_that) {
case _SportModel():
return $default(_that.id,_that.name,_that.slug,_that.iconKey,_that.isActive,_that.sortOrder);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String name,  String slug,  String? iconKey,  bool isActive,  int sortOrder)?  $default,) {final _that = this;
switch (_that) {
case _SportModel() when $default != null:
return $default(_that.id,_that.name,_that.slug,_that.iconKey,_that.isActive,_that.sortOrder);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _SportModel implements SportModel {
  const _SportModel({required this.id, required this.name, required this.slug, this.iconKey, this.isActive = true, this.sortOrder = 0});
  factory _SportModel.fromJson(Map<String, dynamic> json) => _$SportModelFromJson(json);

@override final  String id;
@override final  String name;
@override final  String slug;
@override final  String? iconKey;
@override@JsonKey() final  bool isActive;
@override@JsonKey() final  int sortOrder;

/// Create a copy of SportModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$SportModelCopyWith<_SportModel> get copyWith => __$SportModelCopyWithImpl<_SportModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$SportModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _SportModel&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.slug, slug) || other.slug == slug)&&(identical(other.iconKey, iconKey) || other.iconKey == iconKey)&&(identical(other.isActive, isActive) || other.isActive == isActive)&&(identical(other.sortOrder, sortOrder) || other.sortOrder == sortOrder));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,slug,iconKey,isActive,sortOrder);

@override
String toString() {
  return 'SportModel(id: $id, name: $name, slug: $slug, iconKey: $iconKey, isActive: $isActive, sortOrder: $sortOrder)';
}


}

/// @nodoc
abstract mixin class _$SportModelCopyWith<$Res> implements $SportModelCopyWith<$Res> {
  factory _$SportModelCopyWith(_SportModel value, $Res Function(_SportModel) _then) = __$SportModelCopyWithImpl;
@override @useResult
$Res call({
 String id, String name, String slug, String? iconKey, bool isActive, int sortOrder
});




}
/// @nodoc
class __$SportModelCopyWithImpl<$Res>
    implements _$SportModelCopyWith<$Res> {
  __$SportModelCopyWithImpl(this._self, this._then);

  final _SportModel _self;
  final $Res Function(_SportModel) _then;

/// Create a copy of SportModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? name = null,Object? slug = null,Object? iconKey = freezed,Object? isActive = null,Object? sortOrder = null,}) {
  return _then(_SportModel(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,slug: null == slug ? _self.slug : slug // ignore: cast_nullable_to_non_nullable
as String,iconKey: freezed == iconKey ? _self.iconKey : iconKey // ignore: cast_nullable_to_non_nullable
as String?,isActive: null == isActive ? _self.isActive : isActive // ignore: cast_nullable_to_non_nullable
as bool,sortOrder: null == sortOrder ? _self.sortOrder : sortOrder // ignore: cast_nullable_to_non_nullable
as int,
  ));
}


}


/// @nodoc
mixin _$LeagueModel {

 String get id; String get name; String get slug; String? get sportId; String? get country; String? get countryFlag; String? get logoUrl; bool get isActive;
/// Create a copy of LeagueModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$LeagueModelCopyWith<LeagueModel> get copyWith => _$LeagueModelCopyWithImpl<LeagueModel>(this as LeagueModel, _$identity);

  /// Serializes this LeagueModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is LeagueModel&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.slug, slug) || other.slug == slug)&&(identical(other.sportId, sportId) || other.sportId == sportId)&&(identical(other.country, country) || other.country == country)&&(identical(other.countryFlag, countryFlag) || other.countryFlag == countryFlag)&&(identical(other.logoUrl, logoUrl) || other.logoUrl == logoUrl)&&(identical(other.isActive, isActive) || other.isActive == isActive));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,slug,sportId,country,countryFlag,logoUrl,isActive);

@override
String toString() {
  return 'LeagueModel(id: $id, name: $name, slug: $slug, sportId: $sportId, country: $country, countryFlag: $countryFlag, logoUrl: $logoUrl, isActive: $isActive)';
}


}

/// @nodoc
abstract mixin class $LeagueModelCopyWith<$Res>  {
  factory $LeagueModelCopyWith(LeagueModel value, $Res Function(LeagueModel) _then) = _$LeagueModelCopyWithImpl;
@useResult
$Res call({
 String id, String name, String slug, String? sportId, String? country, String? countryFlag, String? logoUrl, bool isActive
});




}
/// @nodoc
class _$LeagueModelCopyWithImpl<$Res>
    implements $LeagueModelCopyWith<$Res> {
  _$LeagueModelCopyWithImpl(this._self, this._then);

  final LeagueModel _self;
  final $Res Function(LeagueModel) _then;

/// Create a copy of LeagueModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? name = null,Object? slug = null,Object? sportId = freezed,Object? country = freezed,Object? countryFlag = freezed,Object? logoUrl = freezed,Object? isActive = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,slug: null == slug ? _self.slug : slug // ignore: cast_nullable_to_non_nullable
as String,sportId: freezed == sportId ? _self.sportId : sportId // ignore: cast_nullable_to_non_nullable
as String?,country: freezed == country ? _self.country : country // ignore: cast_nullable_to_non_nullable
as String?,countryFlag: freezed == countryFlag ? _self.countryFlag : countryFlag // ignore: cast_nullable_to_non_nullable
as String?,logoUrl: freezed == logoUrl ? _self.logoUrl : logoUrl // ignore: cast_nullable_to_non_nullable
as String?,isActive: null == isActive ? _self.isActive : isActive // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}

}


/// Adds pattern-matching-related methods to [LeagueModel].
extension LeagueModelPatterns on LeagueModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _LeagueModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _LeagueModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _LeagueModel value)  $default,){
final _that = this;
switch (_that) {
case _LeagueModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _LeagueModel value)?  $default,){
final _that = this;
switch (_that) {
case _LeagueModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String name,  String slug,  String? sportId,  String? country,  String? countryFlag,  String? logoUrl,  bool isActive)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _LeagueModel() when $default != null:
return $default(_that.id,_that.name,_that.slug,_that.sportId,_that.country,_that.countryFlag,_that.logoUrl,_that.isActive);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String name,  String slug,  String? sportId,  String? country,  String? countryFlag,  String? logoUrl,  bool isActive)  $default,) {final _that = this;
switch (_that) {
case _LeagueModel():
return $default(_that.id,_that.name,_that.slug,_that.sportId,_that.country,_that.countryFlag,_that.logoUrl,_that.isActive);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String name,  String slug,  String? sportId,  String? country,  String? countryFlag,  String? logoUrl,  bool isActive)?  $default,) {final _that = this;
switch (_that) {
case _LeagueModel() when $default != null:
return $default(_that.id,_that.name,_that.slug,_that.sportId,_that.country,_that.countryFlag,_that.logoUrl,_that.isActive);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _LeagueModel implements LeagueModel {
  const _LeagueModel({required this.id, required this.name, required this.slug, this.sportId, this.country, this.countryFlag, this.logoUrl, this.isActive = true});
  factory _LeagueModel.fromJson(Map<String, dynamic> json) => _$LeagueModelFromJson(json);

@override final  String id;
@override final  String name;
@override final  String slug;
@override final  String? sportId;
@override final  String? country;
@override final  String? countryFlag;
@override final  String? logoUrl;
@override@JsonKey() final  bool isActive;

/// Create a copy of LeagueModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$LeagueModelCopyWith<_LeagueModel> get copyWith => __$LeagueModelCopyWithImpl<_LeagueModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$LeagueModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _LeagueModel&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.slug, slug) || other.slug == slug)&&(identical(other.sportId, sportId) || other.sportId == sportId)&&(identical(other.country, country) || other.country == country)&&(identical(other.countryFlag, countryFlag) || other.countryFlag == countryFlag)&&(identical(other.logoUrl, logoUrl) || other.logoUrl == logoUrl)&&(identical(other.isActive, isActive) || other.isActive == isActive));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,slug,sportId,country,countryFlag,logoUrl,isActive);

@override
String toString() {
  return 'LeagueModel(id: $id, name: $name, slug: $slug, sportId: $sportId, country: $country, countryFlag: $countryFlag, logoUrl: $logoUrl, isActive: $isActive)';
}


}

/// @nodoc
abstract mixin class _$LeagueModelCopyWith<$Res> implements $LeagueModelCopyWith<$Res> {
  factory _$LeagueModelCopyWith(_LeagueModel value, $Res Function(_LeagueModel) _then) = __$LeagueModelCopyWithImpl;
@override @useResult
$Res call({
 String id, String name, String slug, String? sportId, String? country, String? countryFlag, String? logoUrl, bool isActive
});




}
/// @nodoc
class __$LeagueModelCopyWithImpl<$Res>
    implements _$LeagueModelCopyWith<$Res> {
  __$LeagueModelCopyWithImpl(this._self, this._then);

  final _LeagueModel _self;
  final $Res Function(_LeagueModel) _then;

/// Create a copy of LeagueModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? name = null,Object? slug = null,Object? sportId = freezed,Object? country = freezed,Object? countryFlag = freezed,Object? logoUrl = freezed,Object? isActive = null,}) {
  return _then(_LeagueModel(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,slug: null == slug ? _self.slug : slug // ignore: cast_nullable_to_non_nullable
as String,sportId: freezed == sportId ? _self.sportId : sportId // ignore: cast_nullable_to_non_nullable
as String?,country: freezed == country ? _self.country : country // ignore: cast_nullable_to_non_nullable
as String?,countryFlag: freezed == countryFlag ? _self.countryFlag : countryFlag // ignore: cast_nullable_to_non_nullable
as String?,logoUrl: freezed == logoUrl ? _self.logoUrl : logoUrl // ignore: cast_nullable_to_non_nullable
as String?,isActive: null == isActive ? _self.isActive : isActive // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}


}


/// @nodoc
mixin _$TeamModel {

 String get id; String get name; String? get shortName; String? get slug; String? get logoUrl;
/// Create a copy of TeamModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$TeamModelCopyWith<TeamModel> get copyWith => _$TeamModelCopyWithImpl<TeamModel>(this as TeamModel, _$identity);

  /// Serializes this TeamModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is TeamModel&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.shortName, shortName) || other.shortName == shortName)&&(identical(other.slug, slug) || other.slug == slug)&&(identical(other.logoUrl, logoUrl) || other.logoUrl == logoUrl));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,shortName,slug,logoUrl);

@override
String toString() {
  return 'TeamModel(id: $id, name: $name, shortName: $shortName, slug: $slug, logoUrl: $logoUrl)';
}


}

/// @nodoc
abstract mixin class $TeamModelCopyWith<$Res>  {
  factory $TeamModelCopyWith(TeamModel value, $Res Function(TeamModel) _then) = _$TeamModelCopyWithImpl;
@useResult
$Res call({
 String id, String name, String? shortName, String? slug, String? logoUrl
});




}
/// @nodoc
class _$TeamModelCopyWithImpl<$Res>
    implements $TeamModelCopyWith<$Res> {
  _$TeamModelCopyWithImpl(this._self, this._then);

  final TeamModel _self;
  final $Res Function(TeamModel) _then;

/// Create a copy of TeamModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? name = null,Object? shortName = freezed,Object? slug = freezed,Object? logoUrl = freezed,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,shortName: freezed == shortName ? _self.shortName : shortName // ignore: cast_nullable_to_non_nullable
as String?,slug: freezed == slug ? _self.slug : slug // ignore: cast_nullable_to_non_nullable
as String?,logoUrl: freezed == logoUrl ? _self.logoUrl : logoUrl // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}

}


/// Adds pattern-matching-related methods to [TeamModel].
extension TeamModelPatterns on TeamModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _TeamModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _TeamModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _TeamModel value)  $default,){
final _that = this;
switch (_that) {
case _TeamModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _TeamModel value)?  $default,){
final _that = this;
switch (_that) {
case _TeamModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String name,  String? shortName,  String? slug,  String? logoUrl)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _TeamModel() when $default != null:
return $default(_that.id,_that.name,_that.shortName,_that.slug,_that.logoUrl);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String name,  String? shortName,  String? slug,  String? logoUrl)  $default,) {final _that = this;
switch (_that) {
case _TeamModel():
return $default(_that.id,_that.name,_that.shortName,_that.slug,_that.logoUrl);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String name,  String? shortName,  String? slug,  String? logoUrl)?  $default,) {final _that = this;
switch (_that) {
case _TeamModel() when $default != null:
return $default(_that.id,_that.name,_that.shortName,_that.slug,_that.logoUrl);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _TeamModel implements TeamModel {
  const _TeamModel({required this.id, required this.name, this.shortName, this.slug, this.logoUrl});
  factory _TeamModel.fromJson(Map<String, dynamic> json) => _$TeamModelFromJson(json);

@override final  String id;
@override final  String name;
@override final  String? shortName;
@override final  String? slug;
@override final  String? logoUrl;

/// Create a copy of TeamModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$TeamModelCopyWith<_TeamModel> get copyWith => __$TeamModelCopyWithImpl<_TeamModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$TeamModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _TeamModel&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.shortName, shortName) || other.shortName == shortName)&&(identical(other.slug, slug) || other.slug == slug)&&(identical(other.logoUrl, logoUrl) || other.logoUrl == logoUrl));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,shortName,slug,logoUrl);

@override
String toString() {
  return 'TeamModel(id: $id, name: $name, shortName: $shortName, slug: $slug, logoUrl: $logoUrl)';
}


}

/// @nodoc
abstract mixin class _$TeamModelCopyWith<$Res> implements $TeamModelCopyWith<$Res> {
  factory _$TeamModelCopyWith(_TeamModel value, $Res Function(_TeamModel) _then) = __$TeamModelCopyWithImpl;
@override @useResult
$Res call({
 String id, String name, String? shortName, String? slug, String? logoUrl
});




}
/// @nodoc
class __$TeamModelCopyWithImpl<$Res>
    implements _$TeamModelCopyWith<$Res> {
  __$TeamModelCopyWithImpl(this._self, this._then);

  final _TeamModel _self;
  final $Res Function(_TeamModel) _then;

/// Create a copy of TeamModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? name = null,Object? shortName = freezed,Object? slug = freezed,Object? logoUrl = freezed,}) {
  return _then(_TeamModel(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,shortName: freezed == shortName ? _self.shortName : shortName // ignore: cast_nullable_to_non_nullable
as String?,slug: freezed == slug ? _self.slug : slug // ignore: cast_nullable_to_non_nullable
as String?,logoUrl: freezed == logoUrl ? _self.logoUrl : logoUrl // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}


}


/// @nodoc
mixin _$OddModel {

 String get id; String get selection; double get value; bool get isActive;
/// Create a copy of OddModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$OddModelCopyWith<OddModel> get copyWith => _$OddModelCopyWithImpl<OddModel>(this as OddModel, _$identity);

  /// Serializes this OddModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is OddModel&&(identical(other.id, id) || other.id == id)&&(identical(other.selection, selection) || other.selection == selection)&&(identical(other.value, value) || other.value == value)&&(identical(other.isActive, isActive) || other.isActive == isActive));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,selection,value,isActive);

@override
String toString() {
  return 'OddModel(id: $id, selection: $selection, value: $value, isActive: $isActive)';
}


}

/// @nodoc
abstract mixin class $OddModelCopyWith<$Res>  {
  factory $OddModelCopyWith(OddModel value, $Res Function(OddModel) _then) = _$OddModelCopyWithImpl;
@useResult
$Res call({
 String id, String selection, double value, bool isActive
});




}
/// @nodoc
class _$OddModelCopyWithImpl<$Res>
    implements $OddModelCopyWith<$Res> {
  _$OddModelCopyWithImpl(this._self, this._then);

  final OddModel _self;
  final $Res Function(OddModel) _then;

/// Create a copy of OddModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? selection = null,Object? value = null,Object? isActive = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,selection: null == selection ? _self.selection : selection // ignore: cast_nullable_to_non_nullable
as String,value: null == value ? _self.value : value // ignore: cast_nullable_to_non_nullable
as double,isActive: null == isActive ? _self.isActive : isActive // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}

}


/// Adds pattern-matching-related methods to [OddModel].
extension OddModelPatterns on OddModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _OddModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _OddModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _OddModel value)  $default,){
final _that = this;
switch (_that) {
case _OddModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _OddModel value)?  $default,){
final _that = this;
switch (_that) {
case _OddModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String selection,  double value,  bool isActive)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _OddModel() when $default != null:
return $default(_that.id,_that.selection,_that.value,_that.isActive);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String selection,  double value,  bool isActive)  $default,) {final _that = this;
switch (_that) {
case _OddModel():
return $default(_that.id,_that.selection,_that.value,_that.isActive);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String selection,  double value,  bool isActive)?  $default,) {final _that = this;
switch (_that) {
case _OddModel() when $default != null:
return $default(_that.id,_that.selection,_that.value,_that.isActive);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _OddModel implements OddModel {
  const _OddModel({required this.id, required this.selection, required this.value, this.isActive = true});
  factory _OddModel.fromJson(Map<String, dynamic> json) => _$OddModelFromJson(json);

@override final  String id;
@override final  String selection;
@override final  double value;
@override@JsonKey() final  bool isActive;

/// Create a copy of OddModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$OddModelCopyWith<_OddModel> get copyWith => __$OddModelCopyWithImpl<_OddModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$OddModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _OddModel&&(identical(other.id, id) || other.id == id)&&(identical(other.selection, selection) || other.selection == selection)&&(identical(other.value, value) || other.value == value)&&(identical(other.isActive, isActive) || other.isActive == isActive));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,selection,value,isActive);

@override
String toString() {
  return 'OddModel(id: $id, selection: $selection, value: $value, isActive: $isActive)';
}


}

/// @nodoc
abstract mixin class _$OddModelCopyWith<$Res> implements $OddModelCopyWith<$Res> {
  factory _$OddModelCopyWith(_OddModel value, $Res Function(_OddModel) _then) = __$OddModelCopyWithImpl;
@override @useResult
$Res call({
 String id, String selection, double value, bool isActive
});




}
/// @nodoc
class __$OddModelCopyWithImpl<$Res>
    implements _$OddModelCopyWith<$Res> {
  __$OddModelCopyWithImpl(this._self, this._then);

  final _OddModel _self;
  final $Res Function(_OddModel) _then;

/// Create a copy of OddModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? selection = null,Object? value = null,Object? isActive = null,}) {
  return _then(_OddModel(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,selection: null == selection ? _self.selection : selection // ignore: cast_nullable_to_non_nullable
as String,value: null == value ? _self.value : value // ignore: cast_nullable_to_non_nullable
as double,isActive: null == isActive ? _self.isActive : isActive // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}


}


/// @nodoc
mixin _$MarketModel {

 String get id; String get type; String get name; double? get line; bool get isActive; bool get isSuspended; List<OddModel> get odds;
/// Create a copy of MarketModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$MarketModelCopyWith<MarketModel> get copyWith => _$MarketModelCopyWithImpl<MarketModel>(this as MarketModel, _$identity);

  /// Serializes this MarketModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is MarketModel&&(identical(other.id, id) || other.id == id)&&(identical(other.type, type) || other.type == type)&&(identical(other.name, name) || other.name == name)&&(identical(other.line, line) || other.line == line)&&(identical(other.isActive, isActive) || other.isActive == isActive)&&(identical(other.isSuspended, isSuspended) || other.isSuspended == isSuspended)&&const DeepCollectionEquality().equals(other.odds, odds));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,type,name,line,isActive,isSuspended,const DeepCollectionEquality().hash(odds));

@override
String toString() {
  return 'MarketModel(id: $id, type: $type, name: $name, line: $line, isActive: $isActive, isSuspended: $isSuspended, odds: $odds)';
}


}

/// @nodoc
abstract mixin class $MarketModelCopyWith<$Res>  {
  factory $MarketModelCopyWith(MarketModel value, $Res Function(MarketModel) _then) = _$MarketModelCopyWithImpl;
@useResult
$Res call({
 String id, String type, String name, double? line, bool isActive, bool isSuspended, List<OddModel> odds
});




}
/// @nodoc
class _$MarketModelCopyWithImpl<$Res>
    implements $MarketModelCopyWith<$Res> {
  _$MarketModelCopyWithImpl(this._self, this._then);

  final MarketModel _self;
  final $Res Function(MarketModel) _then;

/// Create a copy of MarketModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? type = null,Object? name = null,Object? line = freezed,Object? isActive = null,Object? isSuspended = null,Object? odds = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,type: null == type ? _self.type : type // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,line: freezed == line ? _self.line : line // ignore: cast_nullable_to_non_nullable
as double?,isActive: null == isActive ? _self.isActive : isActive // ignore: cast_nullable_to_non_nullable
as bool,isSuspended: null == isSuspended ? _self.isSuspended : isSuspended // ignore: cast_nullable_to_non_nullable
as bool,odds: null == odds ? _self.odds : odds // ignore: cast_nullable_to_non_nullable
as List<OddModel>,
  ));
}

}


/// Adds pattern-matching-related methods to [MarketModel].
extension MarketModelPatterns on MarketModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _MarketModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _MarketModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _MarketModel value)  $default,){
final _that = this;
switch (_that) {
case _MarketModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _MarketModel value)?  $default,){
final _that = this;
switch (_that) {
case _MarketModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String type,  String name,  double? line,  bool isActive,  bool isSuspended,  List<OddModel> odds)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _MarketModel() when $default != null:
return $default(_that.id,_that.type,_that.name,_that.line,_that.isActive,_that.isSuspended,_that.odds);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String type,  String name,  double? line,  bool isActive,  bool isSuspended,  List<OddModel> odds)  $default,) {final _that = this;
switch (_that) {
case _MarketModel():
return $default(_that.id,_that.type,_that.name,_that.line,_that.isActive,_that.isSuspended,_that.odds);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String type,  String name,  double? line,  bool isActive,  bool isSuspended,  List<OddModel> odds)?  $default,) {final _that = this;
switch (_that) {
case _MarketModel() when $default != null:
return $default(_that.id,_that.type,_that.name,_that.line,_that.isActive,_that.isSuspended,_that.odds);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _MarketModel implements MarketModel {
  const _MarketModel({required this.id, required this.type, required this.name, this.line, this.isActive = true, this.isSuspended = false, final  List<OddModel> odds = const []}): _odds = odds;
  factory _MarketModel.fromJson(Map<String, dynamic> json) => _$MarketModelFromJson(json);

@override final  String id;
@override final  String type;
@override final  String name;
@override final  double? line;
@override@JsonKey() final  bool isActive;
@override@JsonKey() final  bool isSuspended;
 final  List<OddModel> _odds;
@override@JsonKey() List<OddModel> get odds {
  if (_odds is EqualUnmodifiableListView) return _odds;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_odds);
}


/// Create a copy of MarketModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$MarketModelCopyWith<_MarketModel> get copyWith => __$MarketModelCopyWithImpl<_MarketModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$MarketModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _MarketModel&&(identical(other.id, id) || other.id == id)&&(identical(other.type, type) || other.type == type)&&(identical(other.name, name) || other.name == name)&&(identical(other.line, line) || other.line == line)&&(identical(other.isActive, isActive) || other.isActive == isActive)&&(identical(other.isSuspended, isSuspended) || other.isSuspended == isSuspended)&&const DeepCollectionEquality().equals(other._odds, _odds));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,type,name,line,isActive,isSuspended,const DeepCollectionEquality().hash(_odds));

@override
String toString() {
  return 'MarketModel(id: $id, type: $type, name: $name, line: $line, isActive: $isActive, isSuspended: $isSuspended, odds: $odds)';
}


}

/// @nodoc
abstract mixin class _$MarketModelCopyWith<$Res> implements $MarketModelCopyWith<$Res> {
  factory _$MarketModelCopyWith(_MarketModel value, $Res Function(_MarketModel) _then) = __$MarketModelCopyWithImpl;
@override @useResult
$Res call({
 String id, String type, String name, double? line, bool isActive, bool isSuspended, List<OddModel> odds
});




}
/// @nodoc
class __$MarketModelCopyWithImpl<$Res>
    implements _$MarketModelCopyWith<$Res> {
  __$MarketModelCopyWithImpl(this._self, this._then);

  final _MarketModel _self;
  final $Res Function(_MarketModel) _then;

/// Create a copy of MarketModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? type = null,Object? name = null,Object? line = freezed,Object? isActive = null,Object? isSuspended = null,Object? odds = null,}) {
  return _then(_MarketModel(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,type: null == type ? _self.type : type // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,line: freezed == line ? _self.line : line // ignore: cast_nullable_to_non_nullable
as double?,isActive: null == isActive ? _self.isActive : isActive // ignore: cast_nullable_to_non_nullable
as bool,isSuspended: null == isSuspended ? _self.isSuspended : isSuspended // ignore: cast_nullable_to_non_nullable
as bool,odds: null == odds ? _self._odds : odds // ignore: cast_nullable_to_non_nullable
as List<OddModel>,
  ));
}


}


/// @nodoc
mixin _$MatchModel {

 String get id; String? get sportId; String? get leagueId; TeamModel get homeTeam; TeamModel get awayTeam; LeagueModel? get league; SportModel? get sport; String get scheduledAt; String? get startedAt; String get status; int? get homeScore; int? get awayScore; int? get liveMinute; String? get livePeriod; bool get isFeatured; List<MarketModel> get markets;
/// Create a copy of MatchModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$MatchModelCopyWith<MatchModel> get copyWith => _$MatchModelCopyWithImpl<MatchModel>(this as MatchModel, _$identity);

  /// Serializes this MatchModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is MatchModel&&(identical(other.id, id) || other.id == id)&&(identical(other.sportId, sportId) || other.sportId == sportId)&&(identical(other.leagueId, leagueId) || other.leagueId == leagueId)&&(identical(other.homeTeam, homeTeam) || other.homeTeam == homeTeam)&&(identical(other.awayTeam, awayTeam) || other.awayTeam == awayTeam)&&(identical(other.league, league) || other.league == league)&&(identical(other.sport, sport) || other.sport == sport)&&(identical(other.scheduledAt, scheduledAt) || other.scheduledAt == scheduledAt)&&(identical(other.startedAt, startedAt) || other.startedAt == startedAt)&&(identical(other.status, status) || other.status == status)&&(identical(other.homeScore, homeScore) || other.homeScore == homeScore)&&(identical(other.awayScore, awayScore) || other.awayScore == awayScore)&&(identical(other.liveMinute, liveMinute) || other.liveMinute == liveMinute)&&(identical(other.livePeriod, livePeriod) || other.livePeriod == livePeriod)&&(identical(other.isFeatured, isFeatured) || other.isFeatured == isFeatured)&&const DeepCollectionEquality().equals(other.markets, markets));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,sportId,leagueId,homeTeam,awayTeam,league,sport,scheduledAt,startedAt,status,homeScore,awayScore,liveMinute,livePeriod,isFeatured,const DeepCollectionEquality().hash(markets));

@override
String toString() {
  return 'MatchModel(id: $id, sportId: $sportId, leagueId: $leagueId, homeTeam: $homeTeam, awayTeam: $awayTeam, league: $league, sport: $sport, scheduledAt: $scheduledAt, startedAt: $startedAt, status: $status, homeScore: $homeScore, awayScore: $awayScore, liveMinute: $liveMinute, livePeriod: $livePeriod, isFeatured: $isFeatured, markets: $markets)';
}


}

/// @nodoc
abstract mixin class $MatchModelCopyWith<$Res>  {
  factory $MatchModelCopyWith(MatchModel value, $Res Function(MatchModel) _then) = _$MatchModelCopyWithImpl;
@useResult
$Res call({
 String id, String? sportId, String? leagueId, TeamModel homeTeam, TeamModel awayTeam, LeagueModel? league, SportModel? sport, String scheduledAt, String? startedAt, String status, int? homeScore, int? awayScore, int? liveMinute, String? livePeriod, bool isFeatured, List<MarketModel> markets
});


$TeamModelCopyWith<$Res> get homeTeam;$TeamModelCopyWith<$Res> get awayTeam;$LeagueModelCopyWith<$Res>? get league;$SportModelCopyWith<$Res>? get sport;

}
/// @nodoc
class _$MatchModelCopyWithImpl<$Res>
    implements $MatchModelCopyWith<$Res> {
  _$MatchModelCopyWithImpl(this._self, this._then);

  final MatchModel _self;
  final $Res Function(MatchModel) _then;

/// Create a copy of MatchModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? sportId = freezed,Object? leagueId = freezed,Object? homeTeam = null,Object? awayTeam = null,Object? league = freezed,Object? sport = freezed,Object? scheduledAt = null,Object? startedAt = freezed,Object? status = null,Object? homeScore = freezed,Object? awayScore = freezed,Object? liveMinute = freezed,Object? livePeriod = freezed,Object? isFeatured = null,Object? markets = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,sportId: freezed == sportId ? _self.sportId : sportId // ignore: cast_nullable_to_non_nullable
as String?,leagueId: freezed == leagueId ? _self.leagueId : leagueId // ignore: cast_nullable_to_non_nullable
as String?,homeTeam: null == homeTeam ? _self.homeTeam : homeTeam // ignore: cast_nullable_to_non_nullable
as TeamModel,awayTeam: null == awayTeam ? _self.awayTeam : awayTeam // ignore: cast_nullable_to_non_nullable
as TeamModel,league: freezed == league ? _self.league : league // ignore: cast_nullable_to_non_nullable
as LeagueModel?,sport: freezed == sport ? _self.sport : sport // ignore: cast_nullable_to_non_nullable
as SportModel?,scheduledAt: null == scheduledAt ? _self.scheduledAt : scheduledAt // ignore: cast_nullable_to_non_nullable
as String,startedAt: freezed == startedAt ? _self.startedAt : startedAt // ignore: cast_nullable_to_non_nullable
as String?,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,homeScore: freezed == homeScore ? _self.homeScore : homeScore // ignore: cast_nullable_to_non_nullable
as int?,awayScore: freezed == awayScore ? _self.awayScore : awayScore // ignore: cast_nullable_to_non_nullable
as int?,liveMinute: freezed == liveMinute ? _self.liveMinute : liveMinute // ignore: cast_nullable_to_non_nullable
as int?,livePeriod: freezed == livePeriod ? _self.livePeriod : livePeriod // ignore: cast_nullable_to_non_nullable
as String?,isFeatured: null == isFeatured ? _self.isFeatured : isFeatured // ignore: cast_nullable_to_non_nullable
as bool,markets: null == markets ? _self.markets : markets // ignore: cast_nullable_to_non_nullable
as List<MarketModel>,
  ));
}
/// Create a copy of MatchModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$TeamModelCopyWith<$Res> get homeTeam {
  
  return $TeamModelCopyWith<$Res>(_self.homeTeam, (value) {
    return _then(_self.copyWith(homeTeam: value));
  });
}/// Create a copy of MatchModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$TeamModelCopyWith<$Res> get awayTeam {
  
  return $TeamModelCopyWith<$Res>(_self.awayTeam, (value) {
    return _then(_self.copyWith(awayTeam: value));
  });
}/// Create a copy of MatchModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$LeagueModelCopyWith<$Res>? get league {
    if (_self.league == null) {
    return null;
  }

  return $LeagueModelCopyWith<$Res>(_self.league!, (value) {
    return _then(_self.copyWith(league: value));
  });
}/// Create a copy of MatchModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$SportModelCopyWith<$Res>? get sport {
    if (_self.sport == null) {
    return null;
  }

  return $SportModelCopyWith<$Res>(_self.sport!, (value) {
    return _then(_self.copyWith(sport: value));
  });
}
}


/// Adds pattern-matching-related methods to [MatchModel].
extension MatchModelPatterns on MatchModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _MatchModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _MatchModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _MatchModel value)  $default,){
final _that = this;
switch (_that) {
case _MatchModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _MatchModel value)?  $default,){
final _that = this;
switch (_that) {
case _MatchModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String? sportId,  String? leagueId,  TeamModel homeTeam,  TeamModel awayTeam,  LeagueModel? league,  SportModel? sport,  String scheduledAt,  String? startedAt,  String status,  int? homeScore,  int? awayScore,  int? liveMinute,  String? livePeriod,  bool isFeatured,  List<MarketModel> markets)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _MatchModel() when $default != null:
return $default(_that.id,_that.sportId,_that.leagueId,_that.homeTeam,_that.awayTeam,_that.league,_that.sport,_that.scheduledAt,_that.startedAt,_that.status,_that.homeScore,_that.awayScore,_that.liveMinute,_that.livePeriod,_that.isFeatured,_that.markets);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String? sportId,  String? leagueId,  TeamModel homeTeam,  TeamModel awayTeam,  LeagueModel? league,  SportModel? sport,  String scheduledAt,  String? startedAt,  String status,  int? homeScore,  int? awayScore,  int? liveMinute,  String? livePeriod,  bool isFeatured,  List<MarketModel> markets)  $default,) {final _that = this;
switch (_that) {
case _MatchModel():
return $default(_that.id,_that.sportId,_that.leagueId,_that.homeTeam,_that.awayTeam,_that.league,_that.sport,_that.scheduledAt,_that.startedAt,_that.status,_that.homeScore,_that.awayScore,_that.liveMinute,_that.livePeriod,_that.isFeatured,_that.markets);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String? sportId,  String? leagueId,  TeamModel homeTeam,  TeamModel awayTeam,  LeagueModel? league,  SportModel? sport,  String scheduledAt,  String? startedAt,  String status,  int? homeScore,  int? awayScore,  int? liveMinute,  String? livePeriod,  bool isFeatured,  List<MarketModel> markets)?  $default,) {final _that = this;
switch (_that) {
case _MatchModel() when $default != null:
return $default(_that.id,_that.sportId,_that.leagueId,_that.homeTeam,_that.awayTeam,_that.league,_that.sport,_that.scheduledAt,_that.startedAt,_that.status,_that.homeScore,_that.awayScore,_that.liveMinute,_that.livePeriod,_that.isFeatured,_that.markets);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _MatchModel implements MatchModel {
  const _MatchModel({required this.id, this.sportId, this.leagueId, required this.homeTeam, required this.awayTeam, this.league, this.sport, required this.scheduledAt, this.startedAt, this.status = 'upcoming', this.homeScore, this.awayScore, this.liveMinute, this.livePeriod, this.isFeatured = false, final  List<MarketModel> markets = const []}): _markets = markets;
  factory _MatchModel.fromJson(Map<String, dynamic> json) => _$MatchModelFromJson(json);

@override final  String id;
@override final  String? sportId;
@override final  String? leagueId;
@override final  TeamModel homeTeam;
@override final  TeamModel awayTeam;
@override final  LeagueModel? league;
@override final  SportModel? sport;
@override final  String scheduledAt;
@override final  String? startedAt;
@override@JsonKey() final  String status;
@override final  int? homeScore;
@override final  int? awayScore;
@override final  int? liveMinute;
@override final  String? livePeriod;
@override@JsonKey() final  bool isFeatured;
 final  List<MarketModel> _markets;
@override@JsonKey() List<MarketModel> get markets {
  if (_markets is EqualUnmodifiableListView) return _markets;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_markets);
}


/// Create a copy of MatchModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$MatchModelCopyWith<_MatchModel> get copyWith => __$MatchModelCopyWithImpl<_MatchModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$MatchModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _MatchModel&&(identical(other.id, id) || other.id == id)&&(identical(other.sportId, sportId) || other.sportId == sportId)&&(identical(other.leagueId, leagueId) || other.leagueId == leagueId)&&(identical(other.homeTeam, homeTeam) || other.homeTeam == homeTeam)&&(identical(other.awayTeam, awayTeam) || other.awayTeam == awayTeam)&&(identical(other.league, league) || other.league == league)&&(identical(other.sport, sport) || other.sport == sport)&&(identical(other.scheduledAt, scheduledAt) || other.scheduledAt == scheduledAt)&&(identical(other.startedAt, startedAt) || other.startedAt == startedAt)&&(identical(other.status, status) || other.status == status)&&(identical(other.homeScore, homeScore) || other.homeScore == homeScore)&&(identical(other.awayScore, awayScore) || other.awayScore == awayScore)&&(identical(other.liveMinute, liveMinute) || other.liveMinute == liveMinute)&&(identical(other.livePeriod, livePeriod) || other.livePeriod == livePeriod)&&(identical(other.isFeatured, isFeatured) || other.isFeatured == isFeatured)&&const DeepCollectionEquality().equals(other._markets, _markets));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,sportId,leagueId,homeTeam,awayTeam,league,sport,scheduledAt,startedAt,status,homeScore,awayScore,liveMinute,livePeriod,isFeatured,const DeepCollectionEquality().hash(_markets));

@override
String toString() {
  return 'MatchModel(id: $id, sportId: $sportId, leagueId: $leagueId, homeTeam: $homeTeam, awayTeam: $awayTeam, league: $league, sport: $sport, scheduledAt: $scheduledAt, startedAt: $startedAt, status: $status, homeScore: $homeScore, awayScore: $awayScore, liveMinute: $liveMinute, livePeriod: $livePeriod, isFeatured: $isFeatured, markets: $markets)';
}


}

/// @nodoc
abstract mixin class _$MatchModelCopyWith<$Res> implements $MatchModelCopyWith<$Res> {
  factory _$MatchModelCopyWith(_MatchModel value, $Res Function(_MatchModel) _then) = __$MatchModelCopyWithImpl;
@override @useResult
$Res call({
 String id, String? sportId, String? leagueId, TeamModel homeTeam, TeamModel awayTeam, LeagueModel? league, SportModel? sport, String scheduledAt, String? startedAt, String status, int? homeScore, int? awayScore, int? liveMinute, String? livePeriod, bool isFeatured, List<MarketModel> markets
});


@override $TeamModelCopyWith<$Res> get homeTeam;@override $TeamModelCopyWith<$Res> get awayTeam;@override $LeagueModelCopyWith<$Res>? get league;@override $SportModelCopyWith<$Res>? get sport;

}
/// @nodoc
class __$MatchModelCopyWithImpl<$Res>
    implements _$MatchModelCopyWith<$Res> {
  __$MatchModelCopyWithImpl(this._self, this._then);

  final _MatchModel _self;
  final $Res Function(_MatchModel) _then;

/// Create a copy of MatchModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? sportId = freezed,Object? leagueId = freezed,Object? homeTeam = null,Object? awayTeam = null,Object? league = freezed,Object? sport = freezed,Object? scheduledAt = null,Object? startedAt = freezed,Object? status = null,Object? homeScore = freezed,Object? awayScore = freezed,Object? liveMinute = freezed,Object? livePeriod = freezed,Object? isFeatured = null,Object? markets = null,}) {
  return _then(_MatchModel(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,sportId: freezed == sportId ? _self.sportId : sportId // ignore: cast_nullable_to_non_nullable
as String?,leagueId: freezed == leagueId ? _self.leagueId : leagueId // ignore: cast_nullable_to_non_nullable
as String?,homeTeam: null == homeTeam ? _self.homeTeam : homeTeam // ignore: cast_nullable_to_non_nullable
as TeamModel,awayTeam: null == awayTeam ? _self.awayTeam : awayTeam // ignore: cast_nullable_to_non_nullable
as TeamModel,league: freezed == league ? _self.league : league // ignore: cast_nullable_to_non_nullable
as LeagueModel?,sport: freezed == sport ? _self.sport : sport // ignore: cast_nullable_to_non_nullable
as SportModel?,scheduledAt: null == scheduledAt ? _self.scheduledAt : scheduledAt // ignore: cast_nullable_to_non_nullable
as String,startedAt: freezed == startedAt ? _self.startedAt : startedAt // ignore: cast_nullable_to_non_nullable
as String?,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,homeScore: freezed == homeScore ? _self.homeScore : homeScore // ignore: cast_nullable_to_non_nullable
as int?,awayScore: freezed == awayScore ? _self.awayScore : awayScore // ignore: cast_nullable_to_non_nullable
as int?,liveMinute: freezed == liveMinute ? _self.liveMinute : liveMinute // ignore: cast_nullable_to_non_nullable
as int?,livePeriod: freezed == livePeriod ? _self.livePeriod : livePeriod // ignore: cast_nullable_to_non_nullable
as String?,isFeatured: null == isFeatured ? _self.isFeatured : isFeatured // ignore: cast_nullable_to_non_nullable
as bool,markets: null == markets ? _self._markets : markets // ignore: cast_nullable_to_non_nullable
as List<MarketModel>,
  ));
}

/// Create a copy of MatchModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$TeamModelCopyWith<$Res> get homeTeam {
  
  return $TeamModelCopyWith<$Res>(_self.homeTeam, (value) {
    return _then(_self.copyWith(homeTeam: value));
  });
}/// Create a copy of MatchModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$TeamModelCopyWith<$Res> get awayTeam {
  
  return $TeamModelCopyWith<$Res>(_self.awayTeam, (value) {
    return _then(_self.copyWith(awayTeam: value));
  });
}/// Create a copy of MatchModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$LeagueModelCopyWith<$Res>? get league {
    if (_self.league == null) {
    return null;
  }

  return $LeagueModelCopyWith<$Res>(_self.league!, (value) {
    return _then(_self.copyWith(league: value));
  });
}/// Create a copy of MatchModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$SportModelCopyWith<$Res>? get sport {
    if (_self.sport == null) {
    return null;
  }

  return $SportModelCopyWith<$Res>(_self.sport!, (value) {
    return _then(_self.copyWith(sport: value));
  });
}
}


/// @nodoc
mixin _$PaginatedMatches {

 List<MatchModel> get data; int get total; int get page; int get limit;
/// Create a copy of PaginatedMatches
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$PaginatedMatchesCopyWith<PaginatedMatches> get copyWith => _$PaginatedMatchesCopyWithImpl<PaginatedMatches>(this as PaginatedMatches, _$identity);

  /// Serializes this PaginatedMatches to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is PaginatedMatches&&const DeepCollectionEquality().equals(other.data, data)&&(identical(other.total, total) || other.total == total)&&(identical(other.page, page) || other.page == page)&&(identical(other.limit, limit) || other.limit == limit));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,const DeepCollectionEquality().hash(data),total,page,limit);

@override
String toString() {
  return 'PaginatedMatches(data: $data, total: $total, page: $page, limit: $limit)';
}


}

/// @nodoc
abstract mixin class $PaginatedMatchesCopyWith<$Res>  {
  factory $PaginatedMatchesCopyWith(PaginatedMatches value, $Res Function(PaginatedMatches) _then) = _$PaginatedMatchesCopyWithImpl;
@useResult
$Res call({
 List<MatchModel> data, int total, int page, int limit
});




}
/// @nodoc
class _$PaginatedMatchesCopyWithImpl<$Res>
    implements $PaginatedMatchesCopyWith<$Res> {
  _$PaginatedMatchesCopyWithImpl(this._self, this._then);

  final PaginatedMatches _self;
  final $Res Function(PaginatedMatches) _then;

/// Create a copy of PaginatedMatches
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? data = null,Object? total = null,Object? page = null,Object? limit = null,}) {
  return _then(_self.copyWith(
data: null == data ? _self.data : data // ignore: cast_nullable_to_non_nullable
as List<MatchModel>,total: null == total ? _self.total : total // ignore: cast_nullable_to_non_nullable
as int,page: null == page ? _self.page : page // ignore: cast_nullable_to_non_nullable
as int,limit: null == limit ? _self.limit : limit // ignore: cast_nullable_to_non_nullable
as int,
  ));
}

}


/// Adds pattern-matching-related methods to [PaginatedMatches].
extension PaginatedMatchesPatterns on PaginatedMatches {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _PaginatedMatches value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _PaginatedMatches() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _PaginatedMatches value)  $default,){
final _that = this;
switch (_that) {
case _PaginatedMatches():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _PaginatedMatches value)?  $default,){
final _that = this;
switch (_that) {
case _PaginatedMatches() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( List<MatchModel> data,  int total,  int page,  int limit)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _PaginatedMatches() when $default != null:
return $default(_that.data,_that.total,_that.page,_that.limit);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( List<MatchModel> data,  int total,  int page,  int limit)  $default,) {final _that = this;
switch (_that) {
case _PaginatedMatches():
return $default(_that.data,_that.total,_that.page,_that.limit);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( List<MatchModel> data,  int total,  int page,  int limit)?  $default,) {final _that = this;
switch (_that) {
case _PaginatedMatches() when $default != null:
return $default(_that.data,_that.total,_that.page,_that.limit);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _PaginatedMatches implements PaginatedMatches {
  const _PaginatedMatches({required final  List<MatchModel> data, this.total = 0, this.page = 1, this.limit = 20}): _data = data;
  factory _PaginatedMatches.fromJson(Map<String, dynamic> json) => _$PaginatedMatchesFromJson(json);

 final  List<MatchModel> _data;
@override List<MatchModel> get data {
  if (_data is EqualUnmodifiableListView) return _data;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_data);
}

@override@JsonKey() final  int total;
@override@JsonKey() final  int page;
@override@JsonKey() final  int limit;

/// Create a copy of PaginatedMatches
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$PaginatedMatchesCopyWith<_PaginatedMatches> get copyWith => __$PaginatedMatchesCopyWithImpl<_PaginatedMatches>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$PaginatedMatchesToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _PaginatedMatches&&const DeepCollectionEquality().equals(other._data, _data)&&(identical(other.total, total) || other.total == total)&&(identical(other.page, page) || other.page == page)&&(identical(other.limit, limit) || other.limit == limit));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,const DeepCollectionEquality().hash(_data),total,page,limit);

@override
String toString() {
  return 'PaginatedMatches(data: $data, total: $total, page: $page, limit: $limit)';
}


}

/// @nodoc
abstract mixin class _$PaginatedMatchesCopyWith<$Res> implements $PaginatedMatchesCopyWith<$Res> {
  factory _$PaginatedMatchesCopyWith(_PaginatedMatches value, $Res Function(_PaginatedMatches) _then) = __$PaginatedMatchesCopyWithImpl;
@override @useResult
$Res call({
 List<MatchModel> data, int total, int page, int limit
});




}
/// @nodoc
class __$PaginatedMatchesCopyWithImpl<$Res>
    implements _$PaginatedMatchesCopyWith<$Res> {
  __$PaginatedMatchesCopyWithImpl(this._self, this._then);

  final _PaginatedMatches _self;
  final $Res Function(_PaginatedMatches) _then;

/// Create a copy of PaginatedMatches
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? data = null,Object? total = null,Object? page = null,Object? limit = null,}) {
  return _then(_PaginatedMatches(
data: null == data ? _self._data : data // ignore: cast_nullable_to_non_nullable
as List<MatchModel>,total: null == total ? _self.total : total // ignore: cast_nullable_to_non_nullable
as int,page: null == page ? _self.page : page // ignore: cast_nullable_to_non_nullable
as int,limit: null == limit ? _self.limit : limit // ignore: cast_nullable_to_non_nullable
as int,
  ));
}


}


/// @nodoc
mixin _$BetSelectionModel {

 String get matchId; String get marketId; String get oddId; String get selection; double get oddsAtPlacement; String get matchName; String get market; String? get league; TeamModel? get homeTeam; TeamModel? get awayTeam;
/// Create a copy of BetSelectionModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$BetSelectionModelCopyWith<BetSelectionModel> get copyWith => _$BetSelectionModelCopyWithImpl<BetSelectionModel>(this as BetSelectionModel, _$identity);

  /// Serializes this BetSelectionModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is BetSelectionModel&&(identical(other.matchId, matchId) || other.matchId == matchId)&&(identical(other.marketId, marketId) || other.marketId == marketId)&&(identical(other.oddId, oddId) || other.oddId == oddId)&&(identical(other.selection, selection) || other.selection == selection)&&(identical(other.oddsAtPlacement, oddsAtPlacement) || other.oddsAtPlacement == oddsAtPlacement)&&(identical(other.matchName, matchName) || other.matchName == matchName)&&(identical(other.market, market) || other.market == market)&&(identical(other.league, league) || other.league == league)&&(identical(other.homeTeam, homeTeam) || other.homeTeam == homeTeam)&&(identical(other.awayTeam, awayTeam) || other.awayTeam == awayTeam));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,matchId,marketId,oddId,selection,oddsAtPlacement,matchName,market,league,homeTeam,awayTeam);

@override
String toString() {
  return 'BetSelectionModel(matchId: $matchId, marketId: $marketId, oddId: $oddId, selection: $selection, oddsAtPlacement: $oddsAtPlacement, matchName: $matchName, market: $market, league: $league, homeTeam: $homeTeam, awayTeam: $awayTeam)';
}


}

/// @nodoc
abstract mixin class $BetSelectionModelCopyWith<$Res>  {
  factory $BetSelectionModelCopyWith(BetSelectionModel value, $Res Function(BetSelectionModel) _then) = _$BetSelectionModelCopyWithImpl;
@useResult
$Res call({
 String matchId, String marketId, String oddId, String selection, double oddsAtPlacement, String matchName, String market, String? league, TeamModel? homeTeam, TeamModel? awayTeam
});


$TeamModelCopyWith<$Res>? get homeTeam;$TeamModelCopyWith<$Res>? get awayTeam;

}
/// @nodoc
class _$BetSelectionModelCopyWithImpl<$Res>
    implements $BetSelectionModelCopyWith<$Res> {
  _$BetSelectionModelCopyWithImpl(this._self, this._then);

  final BetSelectionModel _self;
  final $Res Function(BetSelectionModel) _then;

/// Create a copy of BetSelectionModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? matchId = null,Object? marketId = null,Object? oddId = null,Object? selection = null,Object? oddsAtPlacement = null,Object? matchName = null,Object? market = null,Object? league = freezed,Object? homeTeam = freezed,Object? awayTeam = freezed,}) {
  return _then(_self.copyWith(
matchId: null == matchId ? _self.matchId : matchId // ignore: cast_nullable_to_non_nullable
as String,marketId: null == marketId ? _self.marketId : marketId // ignore: cast_nullable_to_non_nullable
as String,oddId: null == oddId ? _self.oddId : oddId // ignore: cast_nullable_to_non_nullable
as String,selection: null == selection ? _self.selection : selection // ignore: cast_nullable_to_non_nullable
as String,oddsAtPlacement: null == oddsAtPlacement ? _self.oddsAtPlacement : oddsAtPlacement // ignore: cast_nullable_to_non_nullable
as double,matchName: null == matchName ? _self.matchName : matchName // ignore: cast_nullable_to_non_nullable
as String,market: null == market ? _self.market : market // ignore: cast_nullable_to_non_nullable
as String,league: freezed == league ? _self.league : league // ignore: cast_nullable_to_non_nullable
as String?,homeTeam: freezed == homeTeam ? _self.homeTeam : homeTeam // ignore: cast_nullable_to_non_nullable
as TeamModel?,awayTeam: freezed == awayTeam ? _self.awayTeam : awayTeam // ignore: cast_nullable_to_non_nullable
as TeamModel?,
  ));
}
/// Create a copy of BetSelectionModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$TeamModelCopyWith<$Res>? get homeTeam {
    if (_self.homeTeam == null) {
    return null;
  }

  return $TeamModelCopyWith<$Res>(_self.homeTeam!, (value) {
    return _then(_self.copyWith(homeTeam: value));
  });
}/// Create a copy of BetSelectionModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$TeamModelCopyWith<$Res>? get awayTeam {
    if (_self.awayTeam == null) {
    return null;
  }

  return $TeamModelCopyWith<$Res>(_self.awayTeam!, (value) {
    return _then(_self.copyWith(awayTeam: value));
  });
}
}


/// Adds pattern-matching-related methods to [BetSelectionModel].
extension BetSelectionModelPatterns on BetSelectionModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _BetSelectionModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _BetSelectionModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _BetSelectionModel value)  $default,){
final _that = this;
switch (_that) {
case _BetSelectionModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _BetSelectionModel value)?  $default,){
final _that = this;
switch (_that) {
case _BetSelectionModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String matchId,  String marketId,  String oddId,  String selection,  double oddsAtPlacement,  String matchName,  String market,  String? league,  TeamModel? homeTeam,  TeamModel? awayTeam)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _BetSelectionModel() when $default != null:
return $default(_that.matchId,_that.marketId,_that.oddId,_that.selection,_that.oddsAtPlacement,_that.matchName,_that.market,_that.league,_that.homeTeam,_that.awayTeam);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String matchId,  String marketId,  String oddId,  String selection,  double oddsAtPlacement,  String matchName,  String market,  String? league,  TeamModel? homeTeam,  TeamModel? awayTeam)  $default,) {final _that = this;
switch (_that) {
case _BetSelectionModel():
return $default(_that.matchId,_that.marketId,_that.oddId,_that.selection,_that.oddsAtPlacement,_that.matchName,_that.market,_that.league,_that.homeTeam,_that.awayTeam);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String matchId,  String marketId,  String oddId,  String selection,  double oddsAtPlacement,  String matchName,  String market,  String? league,  TeamModel? homeTeam,  TeamModel? awayTeam)?  $default,) {final _that = this;
switch (_that) {
case _BetSelectionModel() when $default != null:
return $default(_that.matchId,_that.marketId,_that.oddId,_that.selection,_that.oddsAtPlacement,_that.matchName,_that.market,_that.league,_that.homeTeam,_that.awayTeam);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _BetSelectionModel implements BetSelectionModel {
  const _BetSelectionModel({required this.matchId, required this.marketId, required this.oddId, required this.selection, required this.oddsAtPlacement, required this.matchName, required this.market, this.league, this.homeTeam, this.awayTeam});
  factory _BetSelectionModel.fromJson(Map<String, dynamic> json) => _$BetSelectionModelFromJson(json);

@override final  String matchId;
@override final  String marketId;
@override final  String oddId;
@override final  String selection;
@override final  double oddsAtPlacement;
@override final  String matchName;
@override final  String market;
@override final  String? league;
@override final  TeamModel? homeTeam;
@override final  TeamModel? awayTeam;

/// Create a copy of BetSelectionModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$BetSelectionModelCopyWith<_BetSelectionModel> get copyWith => __$BetSelectionModelCopyWithImpl<_BetSelectionModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$BetSelectionModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _BetSelectionModel&&(identical(other.matchId, matchId) || other.matchId == matchId)&&(identical(other.marketId, marketId) || other.marketId == marketId)&&(identical(other.oddId, oddId) || other.oddId == oddId)&&(identical(other.selection, selection) || other.selection == selection)&&(identical(other.oddsAtPlacement, oddsAtPlacement) || other.oddsAtPlacement == oddsAtPlacement)&&(identical(other.matchName, matchName) || other.matchName == matchName)&&(identical(other.market, market) || other.market == market)&&(identical(other.league, league) || other.league == league)&&(identical(other.homeTeam, homeTeam) || other.homeTeam == homeTeam)&&(identical(other.awayTeam, awayTeam) || other.awayTeam == awayTeam));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,matchId,marketId,oddId,selection,oddsAtPlacement,matchName,market,league,homeTeam,awayTeam);

@override
String toString() {
  return 'BetSelectionModel(matchId: $matchId, marketId: $marketId, oddId: $oddId, selection: $selection, oddsAtPlacement: $oddsAtPlacement, matchName: $matchName, market: $market, league: $league, homeTeam: $homeTeam, awayTeam: $awayTeam)';
}


}

/// @nodoc
abstract mixin class _$BetSelectionModelCopyWith<$Res> implements $BetSelectionModelCopyWith<$Res> {
  factory _$BetSelectionModelCopyWith(_BetSelectionModel value, $Res Function(_BetSelectionModel) _then) = __$BetSelectionModelCopyWithImpl;
@override @useResult
$Res call({
 String matchId, String marketId, String oddId, String selection, double oddsAtPlacement, String matchName, String market, String? league, TeamModel? homeTeam, TeamModel? awayTeam
});


@override $TeamModelCopyWith<$Res>? get homeTeam;@override $TeamModelCopyWith<$Res>? get awayTeam;

}
/// @nodoc
class __$BetSelectionModelCopyWithImpl<$Res>
    implements _$BetSelectionModelCopyWith<$Res> {
  __$BetSelectionModelCopyWithImpl(this._self, this._then);

  final _BetSelectionModel _self;
  final $Res Function(_BetSelectionModel) _then;

/// Create a copy of BetSelectionModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? matchId = null,Object? marketId = null,Object? oddId = null,Object? selection = null,Object? oddsAtPlacement = null,Object? matchName = null,Object? market = null,Object? league = freezed,Object? homeTeam = freezed,Object? awayTeam = freezed,}) {
  return _then(_BetSelectionModel(
matchId: null == matchId ? _self.matchId : matchId // ignore: cast_nullable_to_non_nullable
as String,marketId: null == marketId ? _self.marketId : marketId // ignore: cast_nullable_to_non_nullable
as String,oddId: null == oddId ? _self.oddId : oddId // ignore: cast_nullable_to_non_nullable
as String,selection: null == selection ? _self.selection : selection // ignore: cast_nullable_to_non_nullable
as String,oddsAtPlacement: null == oddsAtPlacement ? _self.oddsAtPlacement : oddsAtPlacement // ignore: cast_nullable_to_non_nullable
as double,matchName: null == matchName ? _self.matchName : matchName // ignore: cast_nullable_to_non_nullable
as String,market: null == market ? _self.market : market // ignore: cast_nullable_to_non_nullable
as String,league: freezed == league ? _self.league : league // ignore: cast_nullable_to_non_nullable
as String?,homeTeam: freezed == homeTeam ? _self.homeTeam : homeTeam // ignore: cast_nullable_to_non_nullable
as TeamModel?,awayTeam: freezed == awayTeam ? _self.awayTeam : awayTeam // ignore: cast_nullable_to_non_nullable
as TeamModel?,
  ));
}

/// Create a copy of BetSelectionModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$TeamModelCopyWith<$Res>? get homeTeam {
    if (_self.homeTeam == null) {
    return null;
  }

  return $TeamModelCopyWith<$Res>(_self.homeTeam!, (value) {
    return _then(_self.copyWith(homeTeam: value));
  });
}/// Create a copy of BetSelectionModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$TeamModelCopyWith<$Res>? get awayTeam {
    if (_self.awayTeam == null) {
    return null;
  }

  return $TeamModelCopyWith<$Res>(_self.awayTeam!, (value) {
    return _then(_self.copyWith(awayTeam: value));
  });
}
}


/// @nodoc
mixin _$BetModel {

 String get id; String get type; String get currency; double get stake; double get totalOdds; double get potentialWin; double? get actualWin; String get status; String get placedAt; String? get settledAt; List<BetSelectionModel> get selections;
/// Create a copy of BetModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$BetModelCopyWith<BetModel> get copyWith => _$BetModelCopyWithImpl<BetModel>(this as BetModel, _$identity);

  /// Serializes this BetModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is BetModel&&(identical(other.id, id) || other.id == id)&&(identical(other.type, type) || other.type == type)&&(identical(other.currency, currency) || other.currency == currency)&&(identical(other.stake, stake) || other.stake == stake)&&(identical(other.totalOdds, totalOdds) || other.totalOdds == totalOdds)&&(identical(other.potentialWin, potentialWin) || other.potentialWin == potentialWin)&&(identical(other.actualWin, actualWin) || other.actualWin == actualWin)&&(identical(other.status, status) || other.status == status)&&(identical(other.placedAt, placedAt) || other.placedAt == placedAt)&&(identical(other.settledAt, settledAt) || other.settledAt == settledAt)&&const DeepCollectionEquality().equals(other.selections, selections));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,type,currency,stake,totalOdds,potentialWin,actualWin,status,placedAt,settledAt,const DeepCollectionEquality().hash(selections));

@override
String toString() {
  return 'BetModel(id: $id, type: $type, currency: $currency, stake: $stake, totalOdds: $totalOdds, potentialWin: $potentialWin, actualWin: $actualWin, status: $status, placedAt: $placedAt, settledAt: $settledAt, selections: $selections)';
}


}

/// @nodoc
abstract mixin class $BetModelCopyWith<$Res>  {
  factory $BetModelCopyWith(BetModel value, $Res Function(BetModel) _then) = _$BetModelCopyWithImpl;
@useResult
$Res call({
 String id, String type, String currency, double stake, double totalOdds, double potentialWin, double? actualWin, String status, String placedAt, String? settledAt, List<BetSelectionModel> selections
});




}
/// @nodoc
class _$BetModelCopyWithImpl<$Res>
    implements $BetModelCopyWith<$Res> {
  _$BetModelCopyWithImpl(this._self, this._then);

  final BetModel _self;
  final $Res Function(BetModel) _then;

/// Create a copy of BetModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? type = null,Object? currency = null,Object? stake = null,Object? totalOdds = null,Object? potentialWin = null,Object? actualWin = freezed,Object? status = null,Object? placedAt = null,Object? settledAt = freezed,Object? selections = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,type: null == type ? _self.type : type // ignore: cast_nullable_to_non_nullable
as String,currency: null == currency ? _self.currency : currency // ignore: cast_nullable_to_non_nullable
as String,stake: null == stake ? _self.stake : stake // ignore: cast_nullable_to_non_nullable
as double,totalOdds: null == totalOdds ? _self.totalOdds : totalOdds // ignore: cast_nullable_to_non_nullable
as double,potentialWin: null == potentialWin ? _self.potentialWin : potentialWin // ignore: cast_nullable_to_non_nullable
as double,actualWin: freezed == actualWin ? _self.actualWin : actualWin // ignore: cast_nullable_to_non_nullable
as double?,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,placedAt: null == placedAt ? _self.placedAt : placedAt // ignore: cast_nullable_to_non_nullable
as String,settledAt: freezed == settledAt ? _self.settledAt : settledAt // ignore: cast_nullable_to_non_nullable
as String?,selections: null == selections ? _self.selections : selections // ignore: cast_nullable_to_non_nullable
as List<BetSelectionModel>,
  ));
}

}


/// Adds pattern-matching-related methods to [BetModel].
extension BetModelPatterns on BetModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _BetModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _BetModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _BetModel value)  $default,){
final _that = this;
switch (_that) {
case _BetModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _BetModel value)?  $default,){
final _that = this;
switch (_that) {
case _BetModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String type,  String currency,  double stake,  double totalOdds,  double potentialWin,  double? actualWin,  String status,  String placedAt,  String? settledAt,  List<BetSelectionModel> selections)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _BetModel() when $default != null:
return $default(_that.id,_that.type,_that.currency,_that.stake,_that.totalOdds,_that.potentialWin,_that.actualWin,_that.status,_that.placedAt,_that.settledAt,_that.selections);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String type,  String currency,  double stake,  double totalOdds,  double potentialWin,  double? actualWin,  String status,  String placedAt,  String? settledAt,  List<BetSelectionModel> selections)  $default,) {final _that = this;
switch (_that) {
case _BetModel():
return $default(_that.id,_that.type,_that.currency,_that.stake,_that.totalOdds,_that.potentialWin,_that.actualWin,_that.status,_that.placedAt,_that.settledAt,_that.selections);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String type,  String currency,  double stake,  double totalOdds,  double potentialWin,  double? actualWin,  String status,  String placedAt,  String? settledAt,  List<BetSelectionModel> selections)?  $default,) {final _that = this;
switch (_that) {
case _BetModel() when $default != null:
return $default(_that.id,_that.type,_that.currency,_that.stake,_that.totalOdds,_that.potentialWin,_that.actualWin,_that.status,_that.placedAt,_that.settledAt,_that.selections);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _BetModel implements BetModel {
  const _BetModel({required this.id, required this.type, required this.currency, required this.stake, required this.totalOdds, required this.potentialWin, this.actualWin, this.status = 'pending', required this.placedAt, this.settledAt, final  List<BetSelectionModel> selections = const []}): _selections = selections;
  factory _BetModel.fromJson(Map<String, dynamic> json) => _$BetModelFromJson(json);

@override final  String id;
@override final  String type;
@override final  String currency;
@override final  double stake;
@override final  double totalOdds;
@override final  double potentialWin;
@override final  double? actualWin;
@override@JsonKey() final  String status;
@override final  String placedAt;
@override final  String? settledAt;
 final  List<BetSelectionModel> _selections;
@override@JsonKey() List<BetSelectionModel> get selections {
  if (_selections is EqualUnmodifiableListView) return _selections;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_selections);
}


/// Create a copy of BetModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$BetModelCopyWith<_BetModel> get copyWith => __$BetModelCopyWithImpl<_BetModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$BetModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _BetModel&&(identical(other.id, id) || other.id == id)&&(identical(other.type, type) || other.type == type)&&(identical(other.currency, currency) || other.currency == currency)&&(identical(other.stake, stake) || other.stake == stake)&&(identical(other.totalOdds, totalOdds) || other.totalOdds == totalOdds)&&(identical(other.potentialWin, potentialWin) || other.potentialWin == potentialWin)&&(identical(other.actualWin, actualWin) || other.actualWin == actualWin)&&(identical(other.status, status) || other.status == status)&&(identical(other.placedAt, placedAt) || other.placedAt == placedAt)&&(identical(other.settledAt, settledAt) || other.settledAt == settledAt)&&const DeepCollectionEquality().equals(other._selections, _selections));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,type,currency,stake,totalOdds,potentialWin,actualWin,status,placedAt,settledAt,const DeepCollectionEquality().hash(_selections));

@override
String toString() {
  return 'BetModel(id: $id, type: $type, currency: $currency, stake: $stake, totalOdds: $totalOdds, potentialWin: $potentialWin, actualWin: $actualWin, status: $status, placedAt: $placedAt, settledAt: $settledAt, selections: $selections)';
}


}

/// @nodoc
abstract mixin class _$BetModelCopyWith<$Res> implements $BetModelCopyWith<$Res> {
  factory _$BetModelCopyWith(_BetModel value, $Res Function(_BetModel) _then) = __$BetModelCopyWithImpl;
@override @useResult
$Res call({
 String id, String type, String currency, double stake, double totalOdds, double potentialWin, double? actualWin, String status, String placedAt, String? settledAt, List<BetSelectionModel> selections
});




}
/// @nodoc
class __$BetModelCopyWithImpl<$Res>
    implements _$BetModelCopyWith<$Res> {
  __$BetModelCopyWithImpl(this._self, this._then);

  final _BetModel _self;
  final $Res Function(_BetModel) _then;

/// Create a copy of BetModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? type = null,Object? currency = null,Object? stake = null,Object? totalOdds = null,Object? potentialWin = null,Object? actualWin = freezed,Object? status = null,Object? placedAt = null,Object? settledAt = freezed,Object? selections = null,}) {
  return _then(_BetModel(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,type: null == type ? _self.type : type // ignore: cast_nullable_to_non_nullable
as String,currency: null == currency ? _self.currency : currency // ignore: cast_nullable_to_non_nullable
as String,stake: null == stake ? _self.stake : stake // ignore: cast_nullable_to_non_nullable
as double,totalOdds: null == totalOdds ? _self.totalOdds : totalOdds // ignore: cast_nullable_to_non_nullable
as double,potentialWin: null == potentialWin ? _self.potentialWin : potentialWin // ignore: cast_nullable_to_non_nullable
as double,actualWin: freezed == actualWin ? _self.actualWin : actualWin // ignore: cast_nullable_to_non_nullable
as double?,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,placedAt: null == placedAt ? _self.placedAt : placedAt // ignore: cast_nullable_to_non_nullable
as String,settledAt: freezed == settledAt ? _self.settledAt : settledAt // ignore: cast_nullable_to_non_nullable
as String?,selections: null == selections ? _self._selections : selections // ignore: cast_nullable_to_non_nullable
as List<BetSelectionModel>,
  ));
}


}


/// @nodoc
mixin _$PaginatedBets {

 List<BetModel> get data; int get total; int get page; int get limit;
/// Create a copy of PaginatedBets
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$PaginatedBetsCopyWith<PaginatedBets> get copyWith => _$PaginatedBetsCopyWithImpl<PaginatedBets>(this as PaginatedBets, _$identity);

  /// Serializes this PaginatedBets to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is PaginatedBets&&const DeepCollectionEquality().equals(other.data, data)&&(identical(other.total, total) || other.total == total)&&(identical(other.page, page) || other.page == page)&&(identical(other.limit, limit) || other.limit == limit));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,const DeepCollectionEquality().hash(data),total,page,limit);

@override
String toString() {
  return 'PaginatedBets(data: $data, total: $total, page: $page, limit: $limit)';
}


}

/// @nodoc
abstract mixin class $PaginatedBetsCopyWith<$Res>  {
  factory $PaginatedBetsCopyWith(PaginatedBets value, $Res Function(PaginatedBets) _then) = _$PaginatedBetsCopyWithImpl;
@useResult
$Res call({
 List<BetModel> data, int total, int page, int limit
});




}
/// @nodoc
class _$PaginatedBetsCopyWithImpl<$Res>
    implements $PaginatedBetsCopyWith<$Res> {
  _$PaginatedBetsCopyWithImpl(this._self, this._then);

  final PaginatedBets _self;
  final $Res Function(PaginatedBets) _then;

/// Create a copy of PaginatedBets
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? data = null,Object? total = null,Object? page = null,Object? limit = null,}) {
  return _then(_self.copyWith(
data: null == data ? _self.data : data // ignore: cast_nullable_to_non_nullable
as List<BetModel>,total: null == total ? _self.total : total // ignore: cast_nullable_to_non_nullable
as int,page: null == page ? _self.page : page // ignore: cast_nullable_to_non_nullable
as int,limit: null == limit ? _self.limit : limit // ignore: cast_nullable_to_non_nullable
as int,
  ));
}

}


/// Adds pattern-matching-related methods to [PaginatedBets].
extension PaginatedBetsPatterns on PaginatedBets {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _PaginatedBets value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _PaginatedBets() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _PaginatedBets value)  $default,){
final _that = this;
switch (_that) {
case _PaginatedBets():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _PaginatedBets value)?  $default,){
final _that = this;
switch (_that) {
case _PaginatedBets() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( List<BetModel> data,  int total,  int page,  int limit)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _PaginatedBets() when $default != null:
return $default(_that.data,_that.total,_that.page,_that.limit);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( List<BetModel> data,  int total,  int page,  int limit)  $default,) {final _that = this;
switch (_that) {
case _PaginatedBets():
return $default(_that.data,_that.total,_that.page,_that.limit);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( List<BetModel> data,  int total,  int page,  int limit)?  $default,) {final _that = this;
switch (_that) {
case _PaginatedBets() when $default != null:
return $default(_that.data,_that.total,_that.page,_that.limit);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _PaginatedBets implements PaginatedBets {
  const _PaginatedBets({required final  List<BetModel> data, this.total = 0, this.page = 1, this.limit = 20}): _data = data;
  factory _PaginatedBets.fromJson(Map<String, dynamic> json) => _$PaginatedBetsFromJson(json);

 final  List<BetModel> _data;
@override List<BetModel> get data {
  if (_data is EqualUnmodifiableListView) return _data;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_data);
}

@override@JsonKey() final  int total;
@override@JsonKey() final  int page;
@override@JsonKey() final  int limit;

/// Create a copy of PaginatedBets
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$PaginatedBetsCopyWith<_PaginatedBets> get copyWith => __$PaginatedBetsCopyWithImpl<_PaginatedBets>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$PaginatedBetsToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _PaginatedBets&&const DeepCollectionEquality().equals(other._data, _data)&&(identical(other.total, total) || other.total == total)&&(identical(other.page, page) || other.page == page)&&(identical(other.limit, limit) || other.limit == limit));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,const DeepCollectionEquality().hash(_data),total,page,limit);

@override
String toString() {
  return 'PaginatedBets(data: $data, total: $total, page: $page, limit: $limit)';
}


}

/// @nodoc
abstract mixin class _$PaginatedBetsCopyWith<$Res> implements $PaginatedBetsCopyWith<$Res> {
  factory _$PaginatedBetsCopyWith(_PaginatedBets value, $Res Function(_PaginatedBets) _then) = __$PaginatedBetsCopyWithImpl;
@override @useResult
$Res call({
 List<BetModel> data, int total, int page, int limit
});




}
/// @nodoc
class __$PaginatedBetsCopyWithImpl<$Res>
    implements _$PaginatedBetsCopyWith<$Res> {
  __$PaginatedBetsCopyWithImpl(this._self, this._then);

  final _PaginatedBets _self;
  final $Res Function(_PaginatedBets) _then;

/// Create a copy of PaginatedBets
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? data = null,Object? total = null,Object? page = null,Object? limit = null,}) {
  return _then(_PaginatedBets(
data: null == data ? _self._data : data // ignore: cast_nullable_to_non_nullable
as List<BetModel>,total: null == total ? _self.total : total // ignore: cast_nullable_to_non_nullable
as int,page: null == page ? _self.page : page // ignore: cast_nullable_to_non_nullable
as int,limit: null == limit ? _self.limit : limit // ignore: cast_nullable_to_non_nullable
as int,
  ));
}


}

// dart format on
