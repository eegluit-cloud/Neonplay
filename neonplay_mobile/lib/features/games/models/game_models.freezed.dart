// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'game_models.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$GameModel {

 String get id; String get name; String get slug; String? get description; String? get thumbnailUrl; String? get bannerUrl; List<String> get tags; double? get rtp; String? get volatility; double? get minBet; double? get maxBet; List<String> get features; bool get isFeatured; bool get isNew; bool get isHot; int get playCount; GameCategoryModel? get category; GameProviderModel? get provider;
/// Create a copy of GameModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$GameModelCopyWith<GameModel> get copyWith => _$GameModelCopyWithImpl<GameModel>(this as GameModel, _$identity);

  /// Serializes this GameModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is GameModel&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.slug, slug) || other.slug == slug)&&(identical(other.description, description) || other.description == description)&&(identical(other.thumbnailUrl, thumbnailUrl) || other.thumbnailUrl == thumbnailUrl)&&(identical(other.bannerUrl, bannerUrl) || other.bannerUrl == bannerUrl)&&const DeepCollectionEquality().equals(other.tags, tags)&&(identical(other.rtp, rtp) || other.rtp == rtp)&&(identical(other.volatility, volatility) || other.volatility == volatility)&&(identical(other.minBet, minBet) || other.minBet == minBet)&&(identical(other.maxBet, maxBet) || other.maxBet == maxBet)&&const DeepCollectionEquality().equals(other.features, features)&&(identical(other.isFeatured, isFeatured) || other.isFeatured == isFeatured)&&(identical(other.isNew, isNew) || other.isNew == isNew)&&(identical(other.isHot, isHot) || other.isHot == isHot)&&(identical(other.playCount, playCount) || other.playCount == playCount)&&(identical(other.category, category) || other.category == category)&&(identical(other.provider, provider) || other.provider == provider));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,slug,description,thumbnailUrl,bannerUrl,const DeepCollectionEquality().hash(tags),rtp,volatility,minBet,maxBet,const DeepCollectionEquality().hash(features),isFeatured,isNew,isHot,playCount,category,provider);

@override
String toString() {
  return 'GameModel(id: $id, name: $name, slug: $slug, description: $description, thumbnailUrl: $thumbnailUrl, bannerUrl: $bannerUrl, tags: $tags, rtp: $rtp, volatility: $volatility, minBet: $minBet, maxBet: $maxBet, features: $features, isFeatured: $isFeatured, isNew: $isNew, isHot: $isHot, playCount: $playCount, category: $category, provider: $provider)';
}


}

/// @nodoc
abstract mixin class $GameModelCopyWith<$Res>  {
  factory $GameModelCopyWith(GameModel value, $Res Function(GameModel) _then) = _$GameModelCopyWithImpl;
@useResult
$Res call({
 String id, String name, String slug, String? description, String? thumbnailUrl, String? bannerUrl, List<String> tags, double? rtp, String? volatility, double? minBet, double? maxBet, List<String> features, bool isFeatured, bool isNew, bool isHot, int playCount, GameCategoryModel? category, GameProviderModel? provider
});


$GameCategoryModelCopyWith<$Res>? get category;$GameProviderModelCopyWith<$Res>? get provider;

}
/// @nodoc
class _$GameModelCopyWithImpl<$Res>
    implements $GameModelCopyWith<$Res> {
  _$GameModelCopyWithImpl(this._self, this._then);

  final GameModel _self;
  final $Res Function(GameModel) _then;

/// Create a copy of GameModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? name = null,Object? slug = null,Object? description = freezed,Object? thumbnailUrl = freezed,Object? bannerUrl = freezed,Object? tags = null,Object? rtp = freezed,Object? volatility = freezed,Object? minBet = freezed,Object? maxBet = freezed,Object? features = null,Object? isFeatured = null,Object? isNew = null,Object? isHot = null,Object? playCount = null,Object? category = freezed,Object? provider = freezed,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,slug: null == slug ? _self.slug : slug // ignore: cast_nullable_to_non_nullable
as String,description: freezed == description ? _self.description : description // ignore: cast_nullable_to_non_nullable
as String?,thumbnailUrl: freezed == thumbnailUrl ? _self.thumbnailUrl : thumbnailUrl // ignore: cast_nullable_to_non_nullable
as String?,bannerUrl: freezed == bannerUrl ? _self.bannerUrl : bannerUrl // ignore: cast_nullable_to_non_nullable
as String?,tags: null == tags ? _self.tags : tags // ignore: cast_nullable_to_non_nullable
as List<String>,rtp: freezed == rtp ? _self.rtp : rtp // ignore: cast_nullable_to_non_nullable
as double?,volatility: freezed == volatility ? _self.volatility : volatility // ignore: cast_nullable_to_non_nullable
as String?,minBet: freezed == minBet ? _self.minBet : minBet // ignore: cast_nullable_to_non_nullable
as double?,maxBet: freezed == maxBet ? _self.maxBet : maxBet // ignore: cast_nullable_to_non_nullable
as double?,features: null == features ? _self.features : features // ignore: cast_nullable_to_non_nullable
as List<String>,isFeatured: null == isFeatured ? _self.isFeatured : isFeatured // ignore: cast_nullable_to_non_nullable
as bool,isNew: null == isNew ? _self.isNew : isNew // ignore: cast_nullable_to_non_nullable
as bool,isHot: null == isHot ? _self.isHot : isHot // ignore: cast_nullable_to_non_nullable
as bool,playCount: null == playCount ? _self.playCount : playCount // ignore: cast_nullable_to_non_nullable
as int,category: freezed == category ? _self.category : category // ignore: cast_nullable_to_non_nullable
as GameCategoryModel?,provider: freezed == provider ? _self.provider : provider // ignore: cast_nullable_to_non_nullable
as GameProviderModel?,
  ));
}
/// Create a copy of GameModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$GameCategoryModelCopyWith<$Res>? get category {
    if (_self.category == null) {
    return null;
  }

  return $GameCategoryModelCopyWith<$Res>(_self.category!, (value) {
    return _then(_self.copyWith(category: value));
  });
}/// Create a copy of GameModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$GameProviderModelCopyWith<$Res>? get provider {
    if (_self.provider == null) {
    return null;
  }

  return $GameProviderModelCopyWith<$Res>(_self.provider!, (value) {
    return _then(_self.copyWith(provider: value));
  });
}
}


/// Adds pattern-matching-related methods to [GameModel].
extension GameModelPatterns on GameModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _GameModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _GameModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _GameModel value)  $default,){
final _that = this;
switch (_that) {
case _GameModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _GameModel value)?  $default,){
final _that = this;
switch (_that) {
case _GameModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String name,  String slug,  String? description,  String? thumbnailUrl,  String? bannerUrl,  List<String> tags,  double? rtp,  String? volatility,  double? minBet,  double? maxBet,  List<String> features,  bool isFeatured,  bool isNew,  bool isHot,  int playCount,  GameCategoryModel? category,  GameProviderModel? provider)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _GameModel() when $default != null:
return $default(_that.id,_that.name,_that.slug,_that.description,_that.thumbnailUrl,_that.bannerUrl,_that.tags,_that.rtp,_that.volatility,_that.minBet,_that.maxBet,_that.features,_that.isFeatured,_that.isNew,_that.isHot,_that.playCount,_that.category,_that.provider);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String name,  String slug,  String? description,  String? thumbnailUrl,  String? bannerUrl,  List<String> tags,  double? rtp,  String? volatility,  double? minBet,  double? maxBet,  List<String> features,  bool isFeatured,  bool isNew,  bool isHot,  int playCount,  GameCategoryModel? category,  GameProviderModel? provider)  $default,) {final _that = this;
switch (_that) {
case _GameModel():
return $default(_that.id,_that.name,_that.slug,_that.description,_that.thumbnailUrl,_that.bannerUrl,_that.tags,_that.rtp,_that.volatility,_that.minBet,_that.maxBet,_that.features,_that.isFeatured,_that.isNew,_that.isHot,_that.playCount,_that.category,_that.provider);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String name,  String slug,  String? description,  String? thumbnailUrl,  String? bannerUrl,  List<String> tags,  double? rtp,  String? volatility,  double? minBet,  double? maxBet,  List<String> features,  bool isFeatured,  bool isNew,  bool isHot,  int playCount,  GameCategoryModel? category,  GameProviderModel? provider)?  $default,) {final _that = this;
switch (_that) {
case _GameModel() when $default != null:
return $default(_that.id,_that.name,_that.slug,_that.description,_that.thumbnailUrl,_that.bannerUrl,_that.tags,_that.rtp,_that.volatility,_that.minBet,_that.maxBet,_that.features,_that.isFeatured,_that.isNew,_that.isHot,_that.playCount,_that.category,_that.provider);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _GameModel implements GameModel {
  const _GameModel({required this.id, required this.name, required this.slug, this.description, this.thumbnailUrl, this.bannerUrl, final  List<String> tags = const [], this.rtp, this.volatility, this.minBet, this.maxBet, final  List<String> features = const [], this.isFeatured = false, this.isNew = false, this.isHot = false, this.playCount = 0, this.category, this.provider}): _tags = tags,_features = features;
  factory _GameModel.fromJson(Map<String, dynamic> json) => _$GameModelFromJson(json);

@override final  String id;
@override final  String name;
@override final  String slug;
@override final  String? description;
@override final  String? thumbnailUrl;
@override final  String? bannerUrl;
 final  List<String> _tags;
@override@JsonKey() List<String> get tags {
  if (_tags is EqualUnmodifiableListView) return _tags;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_tags);
}

@override final  double? rtp;
@override final  String? volatility;
@override final  double? minBet;
@override final  double? maxBet;
 final  List<String> _features;
@override@JsonKey() List<String> get features {
  if (_features is EqualUnmodifiableListView) return _features;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_features);
}

@override@JsonKey() final  bool isFeatured;
@override@JsonKey() final  bool isNew;
@override@JsonKey() final  bool isHot;
@override@JsonKey() final  int playCount;
@override final  GameCategoryModel? category;
@override final  GameProviderModel? provider;

/// Create a copy of GameModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$GameModelCopyWith<_GameModel> get copyWith => __$GameModelCopyWithImpl<_GameModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$GameModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _GameModel&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.slug, slug) || other.slug == slug)&&(identical(other.description, description) || other.description == description)&&(identical(other.thumbnailUrl, thumbnailUrl) || other.thumbnailUrl == thumbnailUrl)&&(identical(other.bannerUrl, bannerUrl) || other.bannerUrl == bannerUrl)&&const DeepCollectionEquality().equals(other._tags, _tags)&&(identical(other.rtp, rtp) || other.rtp == rtp)&&(identical(other.volatility, volatility) || other.volatility == volatility)&&(identical(other.minBet, minBet) || other.minBet == minBet)&&(identical(other.maxBet, maxBet) || other.maxBet == maxBet)&&const DeepCollectionEquality().equals(other._features, _features)&&(identical(other.isFeatured, isFeatured) || other.isFeatured == isFeatured)&&(identical(other.isNew, isNew) || other.isNew == isNew)&&(identical(other.isHot, isHot) || other.isHot == isHot)&&(identical(other.playCount, playCount) || other.playCount == playCount)&&(identical(other.category, category) || other.category == category)&&(identical(other.provider, provider) || other.provider == provider));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,slug,description,thumbnailUrl,bannerUrl,const DeepCollectionEquality().hash(_tags),rtp,volatility,minBet,maxBet,const DeepCollectionEquality().hash(_features),isFeatured,isNew,isHot,playCount,category,provider);

@override
String toString() {
  return 'GameModel(id: $id, name: $name, slug: $slug, description: $description, thumbnailUrl: $thumbnailUrl, bannerUrl: $bannerUrl, tags: $tags, rtp: $rtp, volatility: $volatility, minBet: $minBet, maxBet: $maxBet, features: $features, isFeatured: $isFeatured, isNew: $isNew, isHot: $isHot, playCount: $playCount, category: $category, provider: $provider)';
}


}

/// @nodoc
abstract mixin class _$GameModelCopyWith<$Res> implements $GameModelCopyWith<$Res> {
  factory _$GameModelCopyWith(_GameModel value, $Res Function(_GameModel) _then) = __$GameModelCopyWithImpl;
@override @useResult
$Res call({
 String id, String name, String slug, String? description, String? thumbnailUrl, String? bannerUrl, List<String> tags, double? rtp, String? volatility, double? minBet, double? maxBet, List<String> features, bool isFeatured, bool isNew, bool isHot, int playCount, GameCategoryModel? category, GameProviderModel? provider
});


@override $GameCategoryModelCopyWith<$Res>? get category;@override $GameProviderModelCopyWith<$Res>? get provider;

}
/// @nodoc
class __$GameModelCopyWithImpl<$Res>
    implements _$GameModelCopyWith<$Res> {
  __$GameModelCopyWithImpl(this._self, this._then);

  final _GameModel _self;
  final $Res Function(_GameModel) _then;

/// Create a copy of GameModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? name = null,Object? slug = null,Object? description = freezed,Object? thumbnailUrl = freezed,Object? bannerUrl = freezed,Object? tags = null,Object? rtp = freezed,Object? volatility = freezed,Object? minBet = freezed,Object? maxBet = freezed,Object? features = null,Object? isFeatured = null,Object? isNew = null,Object? isHot = null,Object? playCount = null,Object? category = freezed,Object? provider = freezed,}) {
  return _then(_GameModel(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,slug: null == slug ? _self.slug : slug // ignore: cast_nullable_to_non_nullable
as String,description: freezed == description ? _self.description : description // ignore: cast_nullable_to_non_nullable
as String?,thumbnailUrl: freezed == thumbnailUrl ? _self.thumbnailUrl : thumbnailUrl // ignore: cast_nullable_to_non_nullable
as String?,bannerUrl: freezed == bannerUrl ? _self.bannerUrl : bannerUrl // ignore: cast_nullable_to_non_nullable
as String?,tags: null == tags ? _self._tags : tags // ignore: cast_nullable_to_non_nullable
as List<String>,rtp: freezed == rtp ? _self.rtp : rtp // ignore: cast_nullable_to_non_nullable
as double?,volatility: freezed == volatility ? _self.volatility : volatility // ignore: cast_nullable_to_non_nullable
as String?,minBet: freezed == minBet ? _self.minBet : minBet // ignore: cast_nullable_to_non_nullable
as double?,maxBet: freezed == maxBet ? _self.maxBet : maxBet // ignore: cast_nullable_to_non_nullable
as double?,features: null == features ? _self._features : features // ignore: cast_nullable_to_non_nullable
as List<String>,isFeatured: null == isFeatured ? _self.isFeatured : isFeatured // ignore: cast_nullable_to_non_nullable
as bool,isNew: null == isNew ? _self.isNew : isNew // ignore: cast_nullable_to_non_nullable
as bool,isHot: null == isHot ? _self.isHot : isHot // ignore: cast_nullable_to_non_nullable
as bool,playCount: null == playCount ? _self.playCount : playCount // ignore: cast_nullable_to_non_nullable
as int,category: freezed == category ? _self.category : category // ignore: cast_nullable_to_non_nullable
as GameCategoryModel?,provider: freezed == provider ? _self.provider : provider // ignore: cast_nullable_to_non_nullable
as GameProviderModel?,
  ));
}

/// Create a copy of GameModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$GameCategoryModelCopyWith<$Res>? get category {
    if (_self.category == null) {
    return null;
  }

  return $GameCategoryModelCopyWith<$Res>(_self.category!, (value) {
    return _then(_self.copyWith(category: value));
  });
}/// Create a copy of GameModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$GameProviderModelCopyWith<$Res>? get provider {
    if (_self.provider == null) {
    return null;
  }

  return $GameProviderModelCopyWith<$Res>(_self.provider!, (value) {
    return _then(_self.copyWith(provider: value));
  });
}
}


/// @nodoc
mixin _$GameCategoryModel {

 String get id; String get name; String get slug;
/// Create a copy of GameCategoryModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$GameCategoryModelCopyWith<GameCategoryModel> get copyWith => _$GameCategoryModelCopyWithImpl<GameCategoryModel>(this as GameCategoryModel, _$identity);

  /// Serializes this GameCategoryModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is GameCategoryModel&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.slug, slug) || other.slug == slug));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,slug);

@override
String toString() {
  return 'GameCategoryModel(id: $id, name: $name, slug: $slug)';
}


}

/// @nodoc
abstract mixin class $GameCategoryModelCopyWith<$Res>  {
  factory $GameCategoryModelCopyWith(GameCategoryModel value, $Res Function(GameCategoryModel) _then) = _$GameCategoryModelCopyWithImpl;
@useResult
$Res call({
 String id, String name, String slug
});




}
/// @nodoc
class _$GameCategoryModelCopyWithImpl<$Res>
    implements $GameCategoryModelCopyWith<$Res> {
  _$GameCategoryModelCopyWithImpl(this._self, this._then);

  final GameCategoryModel _self;
  final $Res Function(GameCategoryModel) _then;

/// Create a copy of GameCategoryModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? name = null,Object? slug = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,slug: null == slug ? _self.slug : slug // ignore: cast_nullable_to_non_nullable
as String,
  ));
}

}


/// Adds pattern-matching-related methods to [GameCategoryModel].
extension GameCategoryModelPatterns on GameCategoryModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _GameCategoryModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _GameCategoryModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _GameCategoryModel value)  $default,){
final _that = this;
switch (_that) {
case _GameCategoryModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _GameCategoryModel value)?  $default,){
final _that = this;
switch (_that) {
case _GameCategoryModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String name,  String slug)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _GameCategoryModel() when $default != null:
return $default(_that.id,_that.name,_that.slug);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String name,  String slug)  $default,) {final _that = this;
switch (_that) {
case _GameCategoryModel():
return $default(_that.id,_that.name,_that.slug);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String name,  String slug)?  $default,) {final _that = this;
switch (_that) {
case _GameCategoryModel() when $default != null:
return $default(_that.id,_that.name,_that.slug);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _GameCategoryModel implements GameCategoryModel {
  const _GameCategoryModel({required this.id, required this.name, required this.slug});
  factory _GameCategoryModel.fromJson(Map<String, dynamic> json) => _$GameCategoryModelFromJson(json);

@override final  String id;
@override final  String name;
@override final  String slug;

/// Create a copy of GameCategoryModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$GameCategoryModelCopyWith<_GameCategoryModel> get copyWith => __$GameCategoryModelCopyWithImpl<_GameCategoryModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$GameCategoryModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _GameCategoryModel&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.slug, slug) || other.slug == slug));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,slug);

@override
String toString() {
  return 'GameCategoryModel(id: $id, name: $name, slug: $slug)';
}


}

/// @nodoc
abstract mixin class _$GameCategoryModelCopyWith<$Res> implements $GameCategoryModelCopyWith<$Res> {
  factory _$GameCategoryModelCopyWith(_GameCategoryModel value, $Res Function(_GameCategoryModel) _then) = __$GameCategoryModelCopyWithImpl;
@override @useResult
$Res call({
 String id, String name, String slug
});




}
/// @nodoc
class __$GameCategoryModelCopyWithImpl<$Res>
    implements _$GameCategoryModelCopyWith<$Res> {
  __$GameCategoryModelCopyWithImpl(this._self, this._then);

  final _GameCategoryModel _self;
  final $Res Function(_GameCategoryModel) _then;

/// Create a copy of GameCategoryModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? name = null,Object? slug = null,}) {
  return _then(_GameCategoryModel(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,slug: null == slug ? _self.slug : slug // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}


/// @nodoc
mixin _$GameProviderModel {

 String get id; String get name; String get slug; String? get logoUrl;
/// Create a copy of GameProviderModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$GameProviderModelCopyWith<GameProviderModel> get copyWith => _$GameProviderModelCopyWithImpl<GameProviderModel>(this as GameProviderModel, _$identity);

  /// Serializes this GameProviderModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is GameProviderModel&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.slug, slug) || other.slug == slug)&&(identical(other.logoUrl, logoUrl) || other.logoUrl == logoUrl));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,slug,logoUrl);

@override
String toString() {
  return 'GameProviderModel(id: $id, name: $name, slug: $slug, logoUrl: $logoUrl)';
}


}

/// @nodoc
abstract mixin class $GameProviderModelCopyWith<$Res>  {
  factory $GameProviderModelCopyWith(GameProviderModel value, $Res Function(GameProviderModel) _then) = _$GameProviderModelCopyWithImpl;
@useResult
$Res call({
 String id, String name, String slug, String? logoUrl
});




}
/// @nodoc
class _$GameProviderModelCopyWithImpl<$Res>
    implements $GameProviderModelCopyWith<$Res> {
  _$GameProviderModelCopyWithImpl(this._self, this._then);

  final GameProviderModel _self;
  final $Res Function(GameProviderModel) _then;

/// Create a copy of GameProviderModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? name = null,Object? slug = null,Object? logoUrl = freezed,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,slug: null == slug ? _self.slug : slug // ignore: cast_nullable_to_non_nullable
as String,logoUrl: freezed == logoUrl ? _self.logoUrl : logoUrl // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}

}


/// Adds pattern-matching-related methods to [GameProviderModel].
extension GameProviderModelPatterns on GameProviderModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _GameProviderModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _GameProviderModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _GameProviderModel value)  $default,){
final _that = this;
switch (_that) {
case _GameProviderModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _GameProviderModel value)?  $default,){
final _that = this;
switch (_that) {
case _GameProviderModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String name,  String slug,  String? logoUrl)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _GameProviderModel() when $default != null:
return $default(_that.id,_that.name,_that.slug,_that.logoUrl);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String name,  String slug,  String? logoUrl)  $default,) {final _that = this;
switch (_that) {
case _GameProviderModel():
return $default(_that.id,_that.name,_that.slug,_that.logoUrl);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String name,  String slug,  String? logoUrl)?  $default,) {final _that = this;
switch (_that) {
case _GameProviderModel() when $default != null:
return $default(_that.id,_that.name,_that.slug,_that.logoUrl);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _GameProviderModel implements GameProviderModel {
  const _GameProviderModel({required this.id, required this.name, required this.slug, this.logoUrl});
  factory _GameProviderModel.fromJson(Map<String, dynamic> json) => _$GameProviderModelFromJson(json);

@override final  String id;
@override final  String name;
@override final  String slug;
@override final  String? logoUrl;

/// Create a copy of GameProviderModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$GameProviderModelCopyWith<_GameProviderModel> get copyWith => __$GameProviderModelCopyWithImpl<_GameProviderModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$GameProviderModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _GameProviderModel&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.slug, slug) || other.slug == slug)&&(identical(other.logoUrl, logoUrl) || other.logoUrl == logoUrl));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,slug,logoUrl);

@override
String toString() {
  return 'GameProviderModel(id: $id, name: $name, slug: $slug, logoUrl: $logoUrl)';
}


}

/// @nodoc
abstract mixin class _$GameProviderModelCopyWith<$Res> implements $GameProviderModelCopyWith<$Res> {
  factory _$GameProviderModelCopyWith(_GameProviderModel value, $Res Function(_GameProviderModel) _then) = __$GameProviderModelCopyWithImpl;
@override @useResult
$Res call({
 String id, String name, String slug, String? logoUrl
});




}
/// @nodoc
class __$GameProviderModelCopyWithImpl<$Res>
    implements _$GameProviderModelCopyWith<$Res> {
  __$GameProviderModelCopyWithImpl(this._self, this._then);

  final _GameProviderModel _self;
  final $Res Function(_GameProviderModel) _then;

/// Create a copy of GameProviderModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? name = null,Object? slug = null,Object? logoUrl = freezed,}) {
  return _then(_GameProviderModel(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,slug: null == slug ? _self.slug : slug // ignore: cast_nullable_to_non_nullable
as String,logoUrl: freezed == logoUrl ? _self.logoUrl : logoUrl // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}


}


/// @nodoc
mixin _$GameLaunchResponse {

 String get url; String? get sessionId;
/// Create a copy of GameLaunchResponse
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$GameLaunchResponseCopyWith<GameLaunchResponse> get copyWith => _$GameLaunchResponseCopyWithImpl<GameLaunchResponse>(this as GameLaunchResponse, _$identity);

  /// Serializes this GameLaunchResponse to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is GameLaunchResponse&&(identical(other.url, url) || other.url == url)&&(identical(other.sessionId, sessionId) || other.sessionId == sessionId));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,url,sessionId);

@override
String toString() {
  return 'GameLaunchResponse(url: $url, sessionId: $sessionId)';
}


}

/// @nodoc
abstract mixin class $GameLaunchResponseCopyWith<$Res>  {
  factory $GameLaunchResponseCopyWith(GameLaunchResponse value, $Res Function(GameLaunchResponse) _then) = _$GameLaunchResponseCopyWithImpl;
@useResult
$Res call({
 String url, String? sessionId
});




}
/// @nodoc
class _$GameLaunchResponseCopyWithImpl<$Res>
    implements $GameLaunchResponseCopyWith<$Res> {
  _$GameLaunchResponseCopyWithImpl(this._self, this._then);

  final GameLaunchResponse _self;
  final $Res Function(GameLaunchResponse) _then;

/// Create a copy of GameLaunchResponse
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? url = null,Object? sessionId = freezed,}) {
  return _then(_self.copyWith(
url: null == url ? _self.url : url // ignore: cast_nullable_to_non_nullable
as String,sessionId: freezed == sessionId ? _self.sessionId : sessionId // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}

}


/// Adds pattern-matching-related methods to [GameLaunchResponse].
extension GameLaunchResponsePatterns on GameLaunchResponse {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _GameLaunchResponse value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _GameLaunchResponse() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _GameLaunchResponse value)  $default,){
final _that = this;
switch (_that) {
case _GameLaunchResponse():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _GameLaunchResponse value)?  $default,){
final _that = this;
switch (_that) {
case _GameLaunchResponse() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String url,  String? sessionId)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _GameLaunchResponse() when $default != null:
return $default(_that.url,_that.sessionId);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String url,  String? sessionId)  $default,) {final _that = this;
switch (_that) {
case _GameLaunchResponse():
return $default(_that.url,_that.sessionId);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String url,  String? sessionId)?  $default,) {final _that = this;
switch (_that) {
case _GameLaunchResponse() when $default != null:
return $default(_that.url,_that.sessionId);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _GameLaunchResponse implements GameLaunchResponse {
  const _GameLaunchResponse({required this.url, this.sessionId});
  factory _GameLaunchResponse.fromJson(Map<String, dynamic> json) => _$GameLaunchResponseFromJson(json);

@override final  String url;
@override final  String? sessionId;

/// Create a copy of GameLaunchResponse
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$GameLaunchResponseCopyWith<_GameLaunchResponse> get copyWith => __$GameLaunchResponseCopyWithImpl<_GameLaunchResponse>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$GameLaunchResponseToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _GameLaunchResponse&&(identical(other.url, url) || other.url == url)&&(identical(other.sessionId, sessionId) || other.sessionId == sessionId));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,url,sessionId);

@override
String toString() {
  return 'GameLaunchResponse(url: $url, sessionId: $sessionId)';
}


}

/// @nodoc
abstract mixin class _$GameLaunchResponseCopyWith<$Res> implements $GameLaunchResponseCopyWith<$Res> {
  factory _$GameLaunchResponseCopyWith(_GameLaunchResponse value, $Res Function(_GameLaunchResponse) _then) = __$GameLaunchResponseCopyWithImpl;
@override @useResult
$Res call({
 String url, String? sessionId
});




}
/// @nodoc
class __$GameLaunchResponseCopyWithImpl<$Res>
    implements _$GameLaunchResponseCopyWith<$Res> {
  __$GameLaunchResponseCopyWithImpl(this._self, this._then);

  final _GameLaunchResponse _self;
  final $Res Function(_GameLaunchResponse) _then;

/// Create a copy of GameLaunchResponse
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? url = null,Object? sessionId = freezed,}) {
  return _then(_GameLaunchResponse(
url: null == url ? _self.url : url // ignore: cast_nullable_to_non_nullable
as String,sessionId: freezed == sessionId ? _self.sessionId : sessionId // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}


}


/// @nodoc
mixin _$PaginatedGames {

 List<GameModel> get data; int get total; int get page; int get limit;
/// Create a copy of PaginatedGames
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$PaginatedGamesCopyWith<PaginatedGames> get copyWith => _$PaginatedGamesCopyWithImpl<PaginatedGames>(this as PaginatedGames, _$identity);

  /// Serializes this PaginatedGames to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is PaginatedGames&&const DeepCollectionEquality().equals(other.data, data)&&(identical(other.total, total) || other.total == total)&&(identical(other.page, page) || other.page == page)&&(identical(other.limit, limit) || other.limit == limit));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,const DeepCollectionEquality().hash(data),total,page,limit);

@override
String toString() {
  return 'PaginatedGames(data: $data, total: $total, page: $page, limit: $limit)';
}


}

/// @nodoc
abstract mixin class $PaginatedGamesCopyWith<$Res>  {
  factory $PaginatedGamesCopyWith(PaginatedGames value, $Res Function(PaginatedGames) _then) = _$PaginatedGamesCopyWithImpl;
@useResult
$Res call({
 List<GameModel> data, int total, int page, int limit
});




}
/// @nodoc
class _$PaginatedGamesCopyWithImpl<$Res>
    implements $PaginatedGamesCopyWith<$Res> {
  _$PaginatedGamesCopyWithImpl(this._self, this._then);

  final PaginatedGames _self;
  final $Res Function(PaginatedGames) _then;

/// Create a copy of PaginatedGames
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? data = null,Object? total = null,Object? page = null,Object? limit = null,}) {
  return _then(_self.copyWith(
data: null == data ? _self.data : data // ignore: cast_nullable_to_non_nullable
as List<GameModel>,total: null == total ? _self.total : total // ignore: cast_nullable_to_non_nullable
as int,page: null == page ? _self.page : page // ignore: cast_nullable_to_non_nullable
as int,limit: null == limit ? _self.limit : limit // ignore: cast_nullable_to_non_nullable
as int,
  ));
}

}


/// Adds pattern-matching-related methods to [PaginatedGames].
extension PaginatedGamesPatterns on PaginatedGames {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _PaginatedGames value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _PaginatedGames() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _PaginatedGames value)  $default,){
final _that = this;
switch (_that) {
case _PaginatedGames():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _PaginatedGames value)?  $default,){
final _that = this;
switch (_that) {
case _PaginatedGames() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( List<GameModel> data,  int total,  int page,  int limit)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _PaginatedGames() when $default != null:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( List<GameModel> data,  int total,  int page,  int limit)  $default,) {final _that = this;
switch (_that) {
case _PaginatedGames():
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( List<GameModel> data,  int total,  int page,  int limit)?  $default,) {final _that = this;
switch (_that) {
case _PaginatedGames() when $default != null:
return $default(_that.data,_that.total,_that.page,_that.limit);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _PaginatedGames implements PaginatedGames {
  const _PaginatedGames({required final  List<GameModel> data, required this.total, required this.page, required this.limit}): _data = data;
  factory _PaginatedGames.fromJson(Map<String, dynamic> json) => _$PaginatedGamesFromJson(json);

 final  List<GameModel> _data;
@override List<GameModel> get data {
  if (_data is EqualUnmodifiableListView) return _data;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_data);
}

@override final  int total;
@override final  int page;
@override final  int limit;

/// Create a copy of PaginatedGames
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$PaginatedGamesCopyWith<_PaginatedGames> get copyWith => __$PaginatedGamesCopyWithImpl<_PaginatedGames>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$PaginatedGamesToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _PaginatedGames&&const DeepCollectionEquality().equals(other._data, _data)&&(identical(other.total, total) || other.total == total)&&(identical(other.page, page) || other.page == page)&&(identical(other.limit, limit) || other.limit == limit));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,const DeepCollectionEquality().hash(_data),total,page,limit);

@override
String toString() {
  return 'PaginatedGames(data: $data, total: $total, page: $page, limit: $limit)';
}


}

/// @nodoc
abstract mixin class _$PaginatedGamesCopyWith<$Res> implements $PaginatedGamesCopyWith<$Res> {
  factory _$PaginatedGamesCopyWith(_PaginatedGames value, $Res Function(_PaginatedGames) _then) = __$PaginatedGamesCopyWithImpl;
@override @useResult
$Res call({
 List<GameModel> data, int total, int page, int limit
});




}
/// @nodoc
class __$PaginatedGamesCopyWithImpl<$Res>
    implements _$PaginatedGamesCopyWith<$Res> {
  __$PaginatedGamesCopyWithImpl(this._self, this._then);

  final _PaginatedGames _self;
  final $Res Function(_PaginatedGames) _then;

/// Create a copy of PaginatedGames
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? data = null,Object? total = null,Object? page = null,Object? limit = null,}) {
  return _then(_PaginatedGames(
data: null == data ? _self._data : data // ignore: cast_nullable_to_non_nullable
as List<GameModel>,total: null == total ? _self.total : total // ignore: cast_nullable_to_non_nullable
as int,page: null == page ? _self.page : page // ignore: cast_nullable_to_non_nullable
as int,limit: null == limit ? _self.limit : limit // ignore: cast_nullable_to_non_nullable
as int,
  ));
}


}

// dart format on
