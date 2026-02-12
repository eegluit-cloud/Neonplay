// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'activity_models.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$RecentWin {

 String get id; String get username; String get game; double get amount; String get currency; String? get avatar; String? get gameImage; DateTime? get timestamp;
/// Create a copy of RecentWin
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$RecentWinCopyWith<RecentWin> get copyWith => _$RecentWinCopyWithImpl<RecentWin>(this as RecentWin, _$identity);

  /// Serializes this RecentWin to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is RecentWin&&(identical(other.id, id) || other.id == id)&&(identical(other.username, username) || other.username == username)&&(identical(other.game, game) || other.game == game)&&(identical(other.amount, amount) || other.amount == amount)&&(identical(other.currency, currency) || other.currency == currency)&&(identical(other.avatar, avatar) || other.avatar == avatar)&&(identical(other.gameImage, gameImage) || other.gameImage == gameImage)&&(identical(other.timestamp, timestamp) || other.timestamp == timestamp));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,username,game,amount,currency,avatar,gameImage,timestamp);

@override
String toString() {
  return 'RecentWin(id: $id, username: $username, game: $game, amount: $amount, currency: $currency, avatar: $avatar, gameImage: $gameImage, timestamp: $timestamp)';
}


}

/// @nodoc
abstract mixin class $RecentWinCopyWith<$Res>  {
  factory $RecentWinCopyWith(RecentWin value, $Res Function(RecentWin) _then) = _$RecentWinCopyWithImpl;
@useResult
$Res call({
 String id, String username, String game, double amount, String currency, String? avatar, String? gameImage, DateTime? timestamp
});




}
/// @nodoc
class _$RecentWinCopyWithImpl<$Res>
    implements $RecentWinCopyWith<$Res> {
  _$RecentWinCopyWithImpl(this._self, this._then);

  final RecentWin _self;
  final $Res Function(RecentWin) _then;

/// Create a copy of RecentWin
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? username = null,Object? game = null,Object? amount = null,Object? currency = null,Object? avatar = freezed,Object? gameImage = freezed,Object? timestamp = freezed,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,username: null == username ? _self.username : username // ignore: cast_nullable_to_non_nullable
as String,game: null == game ? _self.game : game // ignore: cast_nullable_to_non_nullable
as String,amount: null == amount ? _self.amount : amount // ignore: cast_nullable_to_non_nullable
as double,currency: null == currency ? _self.currency : currency // ignore: cast_nullable_to_non_nullable
as String,avatar: freezed == avatar ? _self.avatar : avatar // ignore: cast_nullable_to_non_nullable
as String?,gameImage: freezed == gameImage ? _self.gameImage : gameImage // ignore: cast_nullable_to_non_nullable
as String?,timestamp: freezed == timestamp ? _self.timestamp : timestamp // ignore: cast_nullable_to_non_nullable
as DateTime?,
  ));
}

}


/// Adds pattern-matching-related methods to [RecentWin].
extension RecentWinPatterns on RecentWin {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _RecentWin value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _RecentWin() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _RecentWin value)  $default,){
final _that = this;
switch (_that) {
case _RecentWin():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _RecentWin value)?  $default,){
final _that = this;
switch (_that) {
case _RecentWin() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String username,  String game,  double amount,  String currency,  String? avatar,  String? gameImage,  DateTime? timestamp)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _RecentWin() when $default != null:
return $default(_that.id,_that.username,_that.game,_that.amount,_that.currency,_that.avatar,_that.gameImage,_that.timestamp);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String username,  String game,  double amount,  String currency,  String? avatar,  String? gameImage,  DateTime? timestamp)  $default,) {final _that = this;
switch (_that) {
case _RecentWin():
return $default(_that.id,_that.username,_that.game,_that.amount,_that.currency,_that.avatar,_that.gameImage,_that.timestamp);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String username,  String game,  double amount,  String currency,  String? avatar,  String? gameImage,  DateTime? timestamp)?  $default,) {final _that = this;
switch (_that) {
case _RecentWin() when $default != null:
return $default(_that.id,_that.username,_that.game,_that.amount,_that.currency,_that.avatar,_that.gameImage,_that.timestamp);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _RecentWin implements RecentWin {
  const _RecentWin({required this.id, required this.username, required this.game, required this.amount, this.currency = 'USD', this.avatar, this.gameImage, this.timestamp});
  factory _RecentWin.fromJson(Map<String, dynamic> json) => _$RecentWinFromJson(json);

@override final  String id;
@override final  String username;
@override final  String game;
@override final  double amount;
@override@JsonKey() final  String currency;
@override final  String? avatar;
@override final  String? gameImage;
@override final  DateTime? timestamp;

/// Create a copy of RecentWin
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$RecentWinCopyWith<_RecentWin> get copyWith => __$RecentWinCopyWithImpl<_RecentWin>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$RecentWinToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _RecentWin&&(identical(other.id, id) || other.id == id)&&(identical(other.username, username) || other.username == username)&&(identical(other.game, game) || other.game == game)&&(identical(other.amount, amount) || other.amount == amount)&&(identical(other.currency, currency) || other.currency == currency)&&(identical(other.avatar, avatar) || other.avatar == avatar)&&(identical(other.gameImage, gameImage) || other.gameImage == gameImage)&&(identical(other.timestamp, timestamp) || other.timestamp == timestamp));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,username,game,amount,currency,avatar,gameImage,timestamp);

@override
String toString() {
  return 'RecentWin(id: $id, username: $username, game: $game, amount: $amount, currency: $currency, avatar: $avatar, gameImage: $gameImage, timestamp: $timestamp)';
}


}

/// @nodoc
abstract mixin class _$RecentWinCopyWith<$Res> implements $RecentWinCopyWith<$Res> {
  factory _$RecentWinCopyWith(_RecentWin value, $Res Function(_RecentWin) _then) = __$RecentWinCopyWithImpl;
@override @useResult
$Res call({
 String id, String username, String game, double amount, String currency, String? avatar, String? gameImage, DateTime? timestamp
});




}
/// @nodoc
class __$RecentWinCopyWithImpl<$Res>
    implements _$RecentWinCopyWith<$Res> {
  __$RecentWinCopyWithImpl(this._self, this._then);

  final _RecentWin _self;
  final $Res Function(_RecentWin) _then;

/// Create a copy of RecentWin
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? username = null,Object? game = null,Object? amount = null,Object? currency = null,Object? avatar = freezed,Object? gameImage = freezed,Object? timestamp = freezed,}) {
  return _then(_RecentWin(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,username: null == username ? _self.username : username // ignore: cast_nullable_to_non_nullable
as String,game: null == game ? _self.game : game // ignore: cast_nullable_to_non_nullable
as String,amount: null == amount ? _self.amount : amount // ignore: cast_nullable_to_non_nullable
as double,currency: null == currency ? _self.currency : currency // ignore: cast_nullable_to_non_nullable
as String,avatar: freezed == avatar ? _self.avatar : avatar // ignore: cast_nullable_to_non_nullable
as String?,gameImage: freezed == gameImage ? _self.gameImage : gameImage // ignore: cast_nullable_to_non_nullable
as String?,timestamp: freezed == timestamp ? _self.timestamp : timestamp // ignore: cast_nullable_to_non_nullable
as DateTime?,
  ));
}


}

// dart format on
