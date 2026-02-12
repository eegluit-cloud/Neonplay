// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'jackpot_models.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$JackpotModel {

 String get id; String get name; double get currentValue; double? get seedValue; String? get currency; String? get lastWonBy; double? get lastWonAmount; DateTime? get lastWonAt;
/// Create a copy of JackpotModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$JackpotModelCopyWith<JackpotModel> get copyWith => _$JackpotModelCopyWithImpl<JackpotModel>(this as JackpotModel, _$identity);

  /// Serializes this JackpotModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is JackpotModel&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.currentValue, currentValue) || other.currentValue == currentValue)&&(identical(other.seedValue, seedValue) || other.seedValue == seedValue)&&(identical(other.currency, currency) || other.currency == currency)&&(identical(other.lastWonBy, lastWonBy) || other.lastWonBy == lastWonBy)&&(identical(other.lastWonAmount, lastWonAmount) || other.lastWonAmount == lastWonAmount)&&(identical(other.lastWonAt, lastWonAt) || other.lastWonAt == lastWonAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,currentValue,seedValue,currency,lastWonBy,lastWonAmount,lastWonAt);

@override
String toString() {
  return 'JackpotModel(id: $id, name: $name, currentValue: $currentValue, seedValue: $seedValue, currency: $currency, lastWonBy: $lastWonBy, lastWonAmount: $lastWonAmount, lastWonAt: $lastWonAt)';
}


}

/// @nodoc
abstract mixin class $JackpotModelCopyWith<$Res>  {
  factory $JackpotModelCopyWith(JackpotModel value, $Res Function(JackpotModel) _then) = _$JackpotModelCopyWithImpl;
@useResult
$Res call({
 String id, String name, double currentValue, double? seedValue, String? currency, String? lastWonBy, double? lastWonAmount, DateTime? lastWonAt
});




}
/// @nodoc
class _$JackpotModelCopyWithImpl<$Res>
    implements $JackpotModelCopyWith<$Res> {
  _$JackpotModelCopyWithImpl(this._self, this._then);

  final JackpotModel _self;
  final $Res Function(JackpotModel) _then;

/// Create a copy of JackpotModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? name = null,Object? currentValue = null,Object? seedValue = freezed,Object? currency = freezed,Object? lastWonBy = freezed,Object? lastWonAmount = freezed,Object? lastWonAt = freezed,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,currentValue: null == currentValue ? _self.currentValue : currentValue // ignore: cast_nullable_to_non_nullable
as double,seedValue: freezed == seedValue ? _self.seedValue : seedValue // ignore: cast_nullable_to_non_nullable
as double?,currency: freezed == currency ? _self.currency : currency // ignore: cast_nullable_to_non_nullable
as String?,lastWonBy: freezed == lastWonBy ? _self.lastWonBy : lastWonBy // ignore: cast_nullable_to_non_nullable
as String?,lastWonAmount: freezed == lastWonAmount ? _self.lastWonAmount : lastWonAmount // ignore: cast_nullable_to_non_nullable
as double?,lastWonAt: freezed == lastWonAt ? _self.lastWonAt : lastWonAt // ignore: cast_nullable_to_non_nullable
as DateTime?,
  ));
}

}


/// Adds pattern-matching-related methods to [JackpotModel].
extension JackpotModelPatterns on JackpotModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _JackpotModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _JackpotModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _JackpotModel value)  $default,){
final _that = this;
switch (_that) {
case _JackpotModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _JackpotModel value)?  $default,){
final _that = this;
switch (_that) {
case _JackpotModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String name,  double currentValue,  double? seedValue,  String? currency,  String? lastWonBy,  double? lastWonAmount,  DateTime? lastWonAt)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _JackpotModel() when $default != null:
return $default(_that.id,_that.name,_that.currentValue,_that.seedValue,_that.currency,_that.lastWonBy,_that.lastWonAmount,_that.lastWonAt);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String name,  double currentValue,  double? seedValue,  String? currency,  String? lastWonBy,  double? lastWonAmount,  DateTime? lastWonAt)  $default,) {final _that = this;
switch (_that) {
case _JackpotModel():
return $default(_that.id,_that.name,_that.currentValue,_that.seedValue,_that.currency,_that.lastWonBy,_that.lastWonAmount,_that.lastWonAt);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String name,  double currentValue,  double? seedValue,  String? currency,  String? lastWonBy,  double? lastWonAmount,  DateTime? lastWonAt)?  $default,) {final _that = this;
switch (_that) {
case _JackpotModel() when $default != null:
return $default(_that.id,_that.name,_that.currentValue,_that.seedValue,_that.currency,_that.lastWonBy,_that.lastWonAmount,_that.lastWonAt);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _JackpotModel implements JackpotModel {
  const _JackpotModel({required this.id, required this.name, required this.currentValue, this.seedValue, this.currency, this.lastWonBy, this.lastWonAmount, this.lastWonAt});
  factory _JackpotModel.fromJson(Map<String, dynamic> json) => _$JackpotModelFromJson(json);

@override final  String id;
@override final  String name;
@override final  double currentValue;
@override final  double? seedValue;
@override final  String? currency;
@override final  String? lastWonBy;
@override final  double? lastWonAmount;
@override final  DateTime? lastWonAt;

/// Create a copy of JackpotModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$JackpotModelCopyWith<_JackpotModel> get copyWith => __$JackpotModelCopyWithImpl<_JackpotModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$JackpotModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _JackpotModel&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.currentValue, currentValue) || other.currentValue == currentValue)&&(identical(other.seedValue, seedValue) || other.seedValue == seedValue)&&(identical(other.currency, currency) || other.currency == currency)&&(identical(other.lastWonBy, lastWonBy) || other.lastWonBy == lastWonBy)&&(identical(other.lastWonAmount, lastWonAmount) || other.lastWonAmount == lastWonAmount)&&(identical(other.lastWonAt, lastWonAt) || other.lastWonAt == lastWonAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,currentValue,seedValue,currency,lastWonBy,lastWonAmount,lastWonAt);

@override
String toString() {
  return 'JackpotModel(id: $id, name: $name, currentValue: $currentValue, seedValue: $seedValue, currency: $currency, lastWonBy: $lastWonBy, lastWonAmount: $lastWonAmount, lastWonAt: $lastWonAt)';
}


}

/// @nodoc
abstract mixin class _$JackpotModelCopyWith<$Res> implements $JackpotModelCopyWith<$Res> {
  factory _$JackpotModelCopyWith(_JackpotModel value, $Res Function(_JackpotModel) _then) = __$JackpotModelCopyWithImpl;
@override @useResult
$Res call({
 String id, String name, double currentValue, double? seedValue, String? currency, String? lastWonBy, double? lastWonAmount, DateTime? lastWonAt
});




}
/// @nodoc
class __$JackpotModelCopyWithImpl<$Res>
    implements _$JackpotModelCopyWith<$Res> {
  __$JackpotModelCopyWithImpl(this._self, this._then);

  final _JackpotModel _self;
  final $Res Function(_JackpotModel) _then;

/// Create a copy of JackpotModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? name = null,Object? currentValue = null,Object? seedValue = freezed,Object? currency = freezed,Object? lastWonBy = freezed,Object? lastWonAmount = freezed,Object? lastWonAt = freezed,}) {
  return _then(_JackpotModel(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,currentValue: null == currentValue ? _self.currentValue : currentValue // ignore: cast_nullable_to_non_nullable
as double,seedValue: freezed == seedValue ? _self.seedValue : seedValue // ignore: cast_nullable_to_non_nullable
as double?,currency: freezed == currency ? _self.currency : currency // ignore: cast_nullable_to_non_nullable
as String?,lastWonBy: freezed == lastWonBy ? _self.lastWonBy : lastWonBy // ignore: cast_nullable_to_non_nullable
as String?,lastWonAmount: freezed == lastWonAmount ? _self.lastWonAmount : lastWonAmount // ignore: cast_nullable_to_non_nullable
as double?,lastWonAt: freezed == lastWonAt ? _self.lastWonAt : lastWonAt // ignore: cast_nullable_to_non_nullable
as DateTime?,
  ));
}


}

// dart format on
