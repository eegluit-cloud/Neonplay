// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'leaderboard_models.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$LeaderboardEntry {

 int get rank;@JsonKey(name: 'userId') String get id; String get username; double get score;@JsonKey(name: 'avatarUrl') String? get avatar; double? get prizeAmount;
/// Create a copy of LeaderboardEntry
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$LeaderboardEntryCopyWith<LeaderboardEntry> get copyWith => _$LeaderboardEntryCopyWithImpl<LeaderboardEntry>(this as LeaderboardEntry, _$identity);

  /// Serializes this LeaderboardEntry to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is LeaderboardEntry&&(identical(other.rank, rank) || other.rank == rank)&&(identical(other.id, id) || other.id == id)&&(identical(other.username, username) || other.username == username)&&(identical(other.score, score) || other.score == score)&&(identical(other.avatar, avatar) || other.avatar == avatar)&&(identical(other.prizeAmount, prizeAmount) || other.prizeAmount == prizeAmount));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,rank,id,username,score,avatar,prizeAmount);

@override
String toString() {
  return 'LeaderboardEntry(rank: $rank, id: $id, username: $username, score: $score, avatar: $avatar, prizeAmount: $prizeAmount)';
}


}

/// @nodoc
abstract mixin class $LeaderboardEntryCopyWith<$Res>  {
  factory $LeaderboardEntryCopyWith(LeaderboardEntry value, $Res Function(LeaderboardEntry) _then) = _$LeaderboardEntryCopyWithImpl;
@useResult
$Res call({
 int rank,@JsonKey(name: 'userId') String id, String username, double score,@JsonKey(name: 'avatarUrl') String? avatar, double? prizeAmount
});




}
/// @nodoc
class _$LeaderboardEntryCopyWithImpl<$Res>
    implements $LeaderboardEntryCopyWith<$Res> {
  _$LeaderboardEntryCopyWithImpl(this._self, this._then);

  final LeaderboardEntry _self;
  final $Res Function(LeaderboardEntry) _then;

/// Create a copy of LeaderboardEntry
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? rank = null,Object? id = null,Object? username = null,Object? score = null,Object? avatar = freezed,Object? prizeAmount = freezed,}) {
  return _then(_self.copyWith(
rank: null == rank ? _self.rank : rank // ignore: cast_nullable_to_non_nullable
as int,id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,username: null == username ? _self.username : username // ignore: cast_nullable_to_non_nullable
as String,score: null == score ? _self.score : score // ignore: cast_nullable_to_non_nullable
as double,avatar: freezed == avatar ? _self.avatar : avatar // ignore: cast_nullable_to_non_nullable
as String?,prizeAmount: freezed == prizeAmount ? _self.prizeAmount : prizeAmount // ignore: cast_nullable_to_non_nullable
as double?,
  ));
}

}


/// Adds pattern-matching-related methods to [LeaderboardEntry].
extension LeaderboardEntryPatterns on LeaderboardEntry {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _LeaderboardEntry value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _LeaderboardEntry() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _LeaderboardEntry value)  $default,){
final _that = this;
switch (_that) {
case _LeaderboardEntry():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _LeaderboardEntry value)?  $default,){
final _that = this;
switch (_that) {
case _LeaderboardEntry() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( int rank, @JsonKey(name: 'userId')  String id,  String username,  double score, @JsonKey(name: 'avatarUrl')  String? avatar,  double? prizeAmount)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _LeaderboardEntry() when $default != null:
return $default(_that.rank,_that.id,_that.username,_that.score,_that.avatar,_that.prizeAmount);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( int rank, @JsonKey(name: 'userId')  String id,  String username,  double score, @JsonKey(name: 'avatarUrl')  String? avatar,  double? prizeAmount)  $default,) {final _that = this;
switch (_that) {
case _LeaderboardEntry():
return $default(_that.rank,_that.id,_that.username,_that.score,_that.avatar,_that.prizeAmount);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( int rank, @JsonKey(name: 'userId')  String id,  String username,  double score, @JsonKey(name: 'avatarUrl')  String? avatar,  double? prizeAmount)?  $default,) {final _that = this;
switch (_that) {
case _LeaderboardEntry() when $default != null:
return $default(_that.rank,_that.id,_that.username,_that.score,_that.avatar,_that.prizeAmount);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _LeaderboardEntry implements LeaderboardEntry {
  const _LeaderboardEntry({this.rank = 0, @JsonKey(name: 'userId') this.id = '', this.username = '', this.score = 0, @JsonKey(name: 'avatarUrl') this.avatar, this.prizeAmount});
  factory _LeaderboardEntry.fromJson(Map<String, dynamic> json) => _$LeaderboardEntryFromJson(json);

@override@JsonKey() final  int rank;
@override@JsonKey(name: 'userId') final  String id;
@override@JsonKey() final  String username;
@override@JsonKey() final  double score;
@override@JsonKey(name: 'avatarUrl') final  String? avatar;
@override final  double? prizeAmount;

/// Create a copy of LeaderboardEntry
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$LeaderboardEntryCopyWith<_LeaderboardEntry> get copyWith => __$LeaderboardEntryCopyWithImpl<_LeaderboardEntry>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$LeaderboardEntryToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _LeaderboardEntry&&(identical(other.rank, rank) || other.rank == rank)&&(identical(other.id, id) || other.id == id)&&(identical(other.username, username) || other.username == username)&&(identical(other.score, score) || other.score == score)&&(identical(other.avatar, avatar) || other.avatar == avatar)&&(identical(other.prizeAmount, prizeAmount) || other.prizeAmount == prizeAmount));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,rank,id,username,score,avatar,prizeAmount);

@override
String toString() {
  return 'LeaderboardEntry(rank: $rank, id: $id, username: $username, score: $score, avatar: $avatar, prizeAmount: $prizeAmount)';
}


}

/// @nodoc
abstract mixin class _$LeaderboardEntryCopyWith<$Res> implements $LeaderboardEntryCopyWith<$Res> {
  factory _$LeaderboardEntryCopyWith(_LeaderboardEntry value, $Res Function(_LeaderboardEntry) _then) = __$LeaderboardEntryCopyWithImpl;
@override @useResult
$Res call({
 int rank,@JsonKey(name: 'userId') String id, String username, double score,@JsonKey(name: 'avatarUrl') String? avatar, double? prizeAmount
});




}
/// @nodoc
class __$LeaderboardEntryCopyWithImpl<$Res>
    implements _$LeaderboardEntryCopyWith<$Res> {
  __$LeaderboardEntryCopyWithImpl(this._self, this._then);

  final _LeaderboardEntry _self;
  final $Res Function(_LeaderboardEntry) _then;

/// Create a copy of LeaderboardEntry
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? rank = null,Object? id = null,Object? username = null,Object? score = null,Object? avatar = freezed,Object? prizeAmount = freezed,}) {
  return _then(_LeaderboardEntry(
rank: null == rank ? _self.rank : rank // ignore: cast_nullable_to_non_nullable
as int,id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,username: null == username ? _self.username : username // ignore: cast_nullable_to_non_nullable
as String,score: null == score ? _self.score : score // ignore: cast_nullable_to_non_nullable
as double,avatar: freezed == avatar ? _self.avatar : avatar // ignore: cast_nullable_to_non_nullable
as String?,prizeAmount: freezed == prizeAmount ? _self.prizeAmount : prizeAmount // ignore: cast_nullable_to_non_nullable
as double?,
  ));
}


}


/// @nodoc
mixin _$LeaderboardData {

 String get id; String get type; String get period; List<LeaderboardEntry> get entries; int get totalEntries; double get prizePoolUsdc; String? get status;
/// Create a copy of LeaderboardData
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$LeaderboardDataCopyWith<LeaderboardData> get copyWith => _$LeaderboardDataCopyWithImpl<LeaderboardData>(this as LeaderboardData, _$identity);

  /// Serializes this LeaderboardData to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is LeaderboardData&&(identical(other.id, id) || other.id == id)&&(identical(other.type, type) || other.type == type)&&(identical(other.period, period) || other.period == period)&&const DeepCollectionEquality().equals(other.entries, entries)&&(identical(other.totalEntries, totalEntries) || other.totalEntries == totalEntries)&&(identical(other.prizePoolUsdc, prizePoolUsdc) || other.prizePoolUsdc == prizePoolUsdc)&&(identical(other.status, status) || other.status == status));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,type,period,const DeepCollectionEquality().hash(entries),totalEntries,prizePoolUsdc,status);

@override
String toString() {
  return 'LeaderboardData(id: $id, type: $type, period: $period, entries: $entries, totalEntries: $totalEntries, prizePoolUsdc: $prizePoolUsdc, status: $status)';
}


}

/// @nodoc
abstract mixin class $LeaderboardDataCopyWith<$Res>  {
  factory $LeaderboardDataCopyWith(LeaderboardData value, $Res Function(LeaderboardData) _then) = _$LeaderboardDataCopyWithImpl;
@useResult
$Res call({
 String id, String type, String period, List<LeaderboardEntry> entries, int totalEntries, double prizePoolUsdc, String? status
});




}
/// @nodoc
class _$LeaderboardDataCopyWithImpl<$Res>
    implements $LeaderboardDataCopyWith<$Res> {
  _$LeaderboardDataCopyWithImpl(this._self, this._then);

  final LeaderboardData _self;
  final $Res Function(LeaderboardData) _then;

/// Create a copy of LeaderboardData
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? type = null,Object? period = null,Object? entries = null,Object? totalEntries = null,Object? prizePoolUsdc = null,Object? status = freezed,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,type: null == type ? _self.type : type // ignore: cast_nullable_to_non_nullable
as String,period: null == period ? _self.period : period // ignore: cast_nullable_to_non_nullable
as String,entries: null == entries ? _self.entries : entries // ignore: cast_nullable_to_non_nullable
as List<LeaderboardEntry>,totalEntries: null == totalEntries ? _self.totalEntries : totalEntries // ignore: cast_nullable_to_non_nullable
as int,prizePoolUsdc: null == prizePoolUsdc ? _self.prizePoolUsdc : prizePoolUsdc // ignore: cast_nullable_to_non_nullable
as double,status: freezed == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}

}


/// Adds pattern-matching-related methods to [LeaderboardData].
extension LeaderboardDataPatterns on LeaderboardData {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _LeaderboardData value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _LeaderboardData() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _LeaderboardData value)  $default,){
final _that = this;
switch (_that) {
case _LeaderboardData():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _LeaderboardData value)?  $default,){
final _that = this;
switch (_that) {
case _LeaderboardData() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String type,  String period,  List<LeaderboardEntry> entries,  int totalEntries,  double prizePoolUsdc,  String? status)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _LeaderboardData() when $default != null:
return $default(_that.id,_that.type,_that.period,_that.entries,_that.totalEntries,_that.prizePoolUsdc,_that.status);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String type,  String period,  List<LeaderboardEntry> entries,  int totalEntries,  double prizePoolUsdc,  String? status)  $default,) {final _that = this;
switch (_that) {
case _LeaderboardData():
return $default(_that.id,_that.type,_that.period,_that.entries,_that.totalEntries,_that.prizePoolUsdc,_that.status);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String type,  String period,  List<LeaderboardEntry> entries,  int totalEntries,  double prizePoolUsdc,  String? status)?  $default,) {final _that = this;
switch (_that) {
case _LeaderboardData() when $default != null:
return $default(_that.id,_that.type,_that.period,_that.entries,_that.totalEntries,_that.prizePoolUsdc,_that.status);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _LeaderboardData implements LeaderboardData {
  const _LeaderboardData({this.id = '', this.type = '', this.period = '', final  List<LeaderboardEntry> entries = const [], this.totalEntries = 0, this.prizePoolUsdc = 0, this.status}): _entries = entries;
  factory _LeaderboardData.fromJson(Map<String, dynamic> json) => _$LeaderboardDataFromJson(json);

@override@JsonKey() final  String id;
@override@JsonKey() final  String type;
@override@JsonKey() final  String period;
 final  List<LeaderboardEntry> _entries;
@override@JsonKey() List<LeaderboardEntry> get entries {
  if (_entries is EqualUnmodifiableListView) return _entries;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_entries);
}

@override@JsonKey() final  int totalEntries;
@override@JsonKey() final  double prizePoolUsdc;
@override final  String? status;

/// Create a copy of LeaderboardData
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$LeaderboardDataCopyWith<_LeaderboardData> get copyWith => __$LeaderboardDataCopyWithImpl<_LeaderboardData>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$LeaderboardDataToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _LeaderboardData&&(identical(other.id, id) || other.id == id)&&(identical(other.type, type) || other.type == type)&&(identical(other.period, period) || other.period == period)&&const DeepCollectionEquality().equals(other._entries, _entries)&&(identical(other.totalEntries, totalEntries) || other.totalEntries == totalEntries)&&(identical(other.prizePoolUsdc, prizePoolUsdc) || other.prizePoolUsdc == prizePoolUsdc)&&(identical(other.status, status) || other.status == status));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,type,period,const DeepCollectionEquality().hash(_entries),totalEntries,prizePoolUsdc,status);

@override
String toString() {
  return 'LeaderboardData(id: $id, type: $type, period: $period, entries: $entries, totalEntries: $totalEntries, prizePoolUsdc: $prizePoolUsdc, status: $status)';
}


}

/// @nodoc
abstract mixin class _$LeaderboardDataCopyWith<$Res> implements $LeaderboardDataCopyWith<$Res> {
  factory _$LeaderboardDataCopyWith(_LeaderboardData value, $Res Function(_LeaderboardData) _then) = __$LeaderboardDataCopyWithImpl;
@override @useResult
$Res call({
 String id, String type, String period, List<LeaderboardEntry> entries, int totalEntries, double prizePoolUsdc, String? status
});




}
/// @nodoc
class __$LeaderboardDataCopyWithImpl<$Res>
    implements _$LeaderboardDataCopyWith<$Res> {
  __$LeaderboardDataCopyWithImpl(this._self, this._then);

  final _LeaderboardData _self;
  final $Res Function(_LeaderboardData) _then;

/// Create a copy of LeaderboardData
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? type = null,Object? period = null,Object? entries = null,Object? totalEntries = null,Object? prizePoolUsdc = null,Object? status = freezed,}) {
  return _then(_LeaderboardData(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,type: null == type ? _self.type : type // ignore: cast_nullable_to_non_nullable
as String,period: null == period ? _self.period : period // ignore: cast_nullable_to_non_nullable
as String,entries: null == entries ? _self._entries : entries // ignore: cast_nullable_to_non_nullable
as List<LeaderboardEntry>,totalEntries: null == totalEntries ? _self.totalEntries : totalEntries // ignore: cast_nullable_to_non_nullable
as int,prizePoolUsdc: null == prizePoolUsdc ? _self.prizePoolUsdc : prizePoolUsdc // ignore: cast_nullable_to_non_nullable
as double,status: freezed == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}


}


/// @nodoc
mixin _$MyRank {

@JsonKey(name: 'rank') int get position; double get score; double? get prizeAmount; int get totalParticipants;
/// Create a copy of MyRank
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$MyRankCopyWith<MyRank> get copyWith => _$MyRankCopyWithImpl<MyRank>(this as MyRank, _$identity);

  /// Serializes this MyRank to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is MyRank&&(identical(other.position, position) || other.position == position)&&(identical(other.score, score) || other.score == score)&&(identical(other.prizeAmount, prizeAmount) || other.prizeAmount == prizeAmount)&&(identical(other.totalParticipants, totalParticipants) || other.totalParticipants == totalParticipants));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,position,score,prizeAmount,totalParticipants);

@override
String toString() {
  return 'MyRank(position: $position, score: $score, prizeAmount: $prizeAmount, totalParticipants: $totalParticipants)';
}


}

/// @nodoc
abstract mixin class $MyRankCopyWith<$Res>  {
  factory $MyRankCopyWith(MyRank value, $Res Function(MyRank) _then) = _$MyRankCopyWithImpl;
@useResult
$Res call({
@JsonKey(name: 'rank') int position, double score, double? prizeAmount, int totalParticipants
});




}
/// @nodoc
class _$MyRankCopyWithImpl<$Res>
    implements $MyRankCopyWith<$Res> {
  _$MyRankCopyWithImpl(this._self, this._then);

  final MyRank _self;
  final $Res Function(MyRank) _then;

/// Create a copy of MyRank
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? position = null,Object? score = null,Object? prizeAmount = freezed,Object? totalParticipants = null,}) {
  return _then(_self.copyWith(
position: null == position ? _self.position : position // ignore: cast_nullable_to_non_nullable
as int,score: null == score ? _self.score : score // ignore: cast_nullable_to_non_nullable
as double,prizeAmount: freezed == prizeAmount ? _self.prizeAmount : prizeAmount // ignore: cast_nullable_to_non_nullable
as double?,totalParticipants: null == totalParticipants ? _self.totalParticipants : totalParticipants // ignore: cast_nullable_to_non_nullable
as int,
  ));
}

}


/// Adds pattern-matching-related methods to [MyRank].
extension MyRankPatterns on MyRank {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _MyRank value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _MyRank() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _MyRank value)  $default,){
final _that = this;
switch (_that) {
case _MyRank():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _MyRank value)?  $default,){
final _that = this;
switch (_that) {
case _MyRank() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(name: 'rank')  int position,  double score,  double? prizeAmount,  int totalParticipants)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _MyRank() when $default != null:
return $default(_that.position,_that.score,_that.prizeAmount,_that.totalParticipants);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(name: 'rank')  int position,  double score,  double? prizeAmount,  int totalParticipants)  $default,) {final _that = this;
switch (_that) {
case _MyRank():
return $default(_that.position,_that.score,_that.prizeAmount,_that.totalParticipants);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(name: 'rank')  int position,  double score,  double? prizeAmount,  int totalParticipants)?  $default,) {final _that = this;
switch (_that) {
case _MyRank() when $default != null:
return $default(_that.position,_that.score,_that.prizeAmount,_that.totalParticipants);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _MyRank implements MyRank {
  const _MyRank({@JsonKey(name: 'rank') this.position = 0, this.score = 0, this.prizeAmount, this.totalParticipants = 0});
  factory _MyRank.fromJson(Map<String, dynamic> json) => _$MyRankFromJson(json);

@override@JsonKey(name: 'rank') final  int position;
@override@JsonKey() final  double score;
@override final  double? prizeAmount;
@override@JsonKey() final  int totalParticipants;

/// Create a copy of MyRank
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$MyRankCopyWith<_MyRank> get copyWith => __$MyRankCopyWithImpl<_MyRank>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$MyRankToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _MyRank&&(identical(other.position, position) || other.position == position)&&(identical(other.score, score) || other.score == score)&&(identical(other.prizeAmount, prizeAmount) || other.prizeAmount == prizeAmount)&&(identical(other.totalParticipants, totalParticipants) || other.totalParticipants == totalParticipants));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,position,score,prizeAmount,totalParticipants);

@override
String toString() {
  return 'MyRank(position: $position, score: $score, prizeAmount: $prizeAmount, totalParticipants: $totalParticipants)';
}


}

/// @nodoc
abstract mixin class _$MyRankCopyWith<$Res> implements $MyRankCopyWith<$Res> {
  factory _$MyRankCopyWith(_MyRank value, $Res Function(_MyRank) _then) = __$MyRankCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(name: 'rank') int position, double score, double? prizeAmount, int totalParticipants
});




}
/// @nodoc
class __$MyRankCopyWithImpl<$Res>
    implements _$MyRankCopyWith<$Res> {
  __$MyRankCopyWithImpl(this._self, this._then);

  final _MyRank _self;
  final $Res Function(_MyRank) _then;

/// Create a copy of MyRank
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? position = null,Object? score = null,Object? prizeAmount = freezed,Object? totalParticipants = null,}) {
  return _then(_MyRank(
position: null == position ? _self.position : position // ignore: cast_nullable_to_non_nullable
as int,score: null == score ? _self.score : score // ignore: cast_nullable_to_non_nullable
as double,prizeAmount: freezed == prizeAmount ? _self.prizeAmount : prizeAmount // ignore: cast_nullable_to_non_nullable
as double?,totalParticipants: null == totalParticipants ? _self.totalParticipants : totalParticipants // ignore: cast_nullable_to_non_nullable
as int,
  ));
}


}

// dart format on
