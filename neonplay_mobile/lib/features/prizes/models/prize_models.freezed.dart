// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'prize_models.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$PrizeModel {

 String get id; String get name; String? get description; String? get imageUrl; String? get category; String? get tier; int? get pointsCost; bool get isAvailable;
/// Create a copy of PrizeModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$PrizeModelCopyWith<PrizeModel> get copyWith => _$PrizeModelCopyWithImpl<PrizeModel>(this as PrizeModel, _$identity);

  /// Serializes this PrizeModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is PrizeModel&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.description, description) || other.description == description)&&(identical(other.imageUrl, imageUrl) || other.imageUrl == imageUrl)&&(identical(other.category, category) || other.category == category)&&(identical(other.tier, tier) || other.tier == tier)&&(identical(other.pointsCost, pointsCost) || other.pointsCost == pointsCost)&&(identical(other.isAvailable, isAvailable) || other.isAvailable == isAvailable));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,description,imageUrl,category,tier,pointsCost,isAvailable);

@override
String toString() {
  return 'PrizeModel(id: $id, name: $name, description: $description, imageUrl: $imageUrl, category: $category, tier: $tier, pointsCost: $pointsCost, isAvailable: $isAvailable)';
}


}

/// @nodoc
abstract mixin class $PrizeModelCopyWith<$Res>  {
  factory $PrizeModelCopyWith(PrizeModel value, $Res Function(PrizeModel) _then) = _$PrizeModelCopyWithImpl;
@useResult
$Res call({
 String id, String name, String? description, String? imageUrl, String? category, String? tier, int? pointsCost, bool isAvailable
});




}
/// @nodoc
class _$PrizeModelCopyWithImpl<$Res>
    implements $PrizeModelCopyWith<$Res> {
  _$PrizeModelCopyWithImpl(this._self, this._then);

  final PrizeModel _self;
  final $Res Function(PrizeModel) _then;

/// Create a copy of PrizeModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? name = null,Object? description = freezed,Object? imageUrl = freezed,Object? category = freezed,Object? tier = freezed,Object? pointsCost = freezed,Object? isAvailable = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,description: freezed == description ? _self.description : description // ignore: cast_nullable_to_non_nullable
as String?,imageUrl: freezed == imageUrl ? _self.imageUrl : imageUrl // ignore: cast_nullable_to_non_nullable
as String?,category: freezed == category ? _self.category : category // ignore: cast_nullable_to_non_nullable
as String?,tier: freezed == tier ? _self.tier : tier // ignore: cast_nullable_to_non_nullable
as String?,pointsCost: freezed == pointsCost ? _self.pointsCost : pointsCost // ignore: cast_nullable_to_non_nullable
as int?,isAvailable: null == isAvailable ? _self.isAvailable : isAvailable // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}

}


/// Adds pattern-matching-related methods to [PrizeModel].
extension PrizeModelPatterns on PrizeModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _PrizeModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _PrizeModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _PrizeModel value)  $default,){
final _that = this;
switch (_that) {
case _PrizeModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _PrizeModel value)?  $default,){
final _that = this;
switch (_that) {
case _PrizeModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String name,  String? description,  String? imageUrl,  String? category,  String? tier,  int? pointsCost,  bool isAvailable)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _PrizeModel() when $default != null:
return $default(_that.id,_that.name,_that.description,_that.imageUrl,_that.category,_that.tier,_that.pointsCost,_that.isAvailable);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String name,  String? description,  String? imageUrl,  String? category,  String? tier,  int? pointsCost,  bool isAvailable)  $default,) {final _that = this;
switch (_that) {
case _PrizeModel():
return $default(_that.id,_that.name,_that.description,_that.imageUrl,_that.category,_that.tier,_that.pointsCost,_that.isAvailable);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String name,  String? description,  String? imageUrl,  String? category,  String? tier,  int? pointsCost,  bool isAvailable)?  $default,) {final _that = this;
switch (_that) {
case _PrizeModel() when $default != null:
return $default(_that.id,_that.name,_that.description,_that.imageUrl,_that.category,_that.tier,_that.pointsCost,_that.isAvailable);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _PrizeModel implements PrizeModel {
  const _PrizeModel({required this.id, required this.name, this.description, this.imageUrl, this.category, this.tier, this.pointsCost, this.isAvailable = true});
  factory _PrizeModel.fromJson(Map<String, dynamic> json) => _$PrizeModelFromJson(json);

@override final  String id;
@override final  String name;
@override final  String? description;
@override final  String? imageUrl;
@override final  String? category;
@override final  String? tier;
@override final  int? pointsCost;
@override@JsonKey() final  bool isAvailable;

/// Create a copy of PrizeModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$PrizeModelCopyWith<_PrizeModel> get copyWith => __$PrizeModelCopyWithImpl<_PrizeModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$PrizeModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _PrizeModel&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.description, description) || other.description == description)&&(identical(other.imageUrl, imageUrl) || other.imageUrl == imageUrl)&&(identical(other.category, category) || other.category == category)&&(identical(other.tier, tier) || other.tier == tier)&&(identical(other.pointsCost, pointsCost) || other.pointsCost == pointsCost)&&(identical(other.isAvailable, isAvailable) || other.isAvailable == isAvailable));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,description,imageUrl,category,tier,pointsCost,isAvailable);

@override
String toString() {
  return 'PrizeModel(id: $id, name: $name, description: $description, imageUrl: $imageUrl, category: $category, tier: $tier, pointsCost: $pointsCost, isAvailable: $isAvailable)';
}


}

/// @nodoc
abstract mixin class _$PrizeModelCopyWith<$Res> implements $PrizeModelCopyWith<$Res> {
  factory _$PrizeModelCopyWith(_PrizeModel value, $Res Function(_PrizeModel) _then) = __$PrizeModelCopyWithImpl;
@override @useResult
$Res call({
 String id, String name, String? description, String? imageUrl, String? category, String? tier, int? pointsCost, bool isAvailable
});




}
/// @nodoc
class __$PrizeModelCopyWithImpl<$Res>
    implements _$PrizeModelCopyWith<$Res> {
  __$PrizeModelCopyWithImpl(this._self, this._then);

  final _PrizeModel _self;
  final $Res Function(_PrizeModel) _then;

/// Create a copy of PrizeModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? name = null,Object? description = freezed,Object? imageUrl = freezed,Object? category = freezed,Object? tier = freezed,Object? pointsCost = freezed,Object? isAvailable = null,}) {
  return _then(_PrizeModel(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,description: freezed == description ? _self.description : description // ignore: cast_nullable_to_non_nullable
as String?,imageUrl: freezed == imageUrl ? _self.imageUrl : imageUrl // ignore: cast_nullable_to_non_nullable
as String?,category: freezed == category ? _self.category : category // ignore: cast_nullable_to_non_nullable
as String?,tier: freezed == tier ? _self.tier : tier // ignore: cast_nullable_to_non_nullable
as String?,pointsCost: freezed == pointsCost ? _self.pointsCost : pointsCost // ignore: cast_nullable_to_non_nullable
as int?,isAvailable: null == isAvailable ? _self.isAvailable : isAvailable // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}


}

// dart format on
