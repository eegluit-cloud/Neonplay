// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'promotion_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$PromotionModel {

 String get id;@JsonKey(name: 'name') String get title; String? get slug; String? get description; String? get imageUrl; String? get type; double? get bonusAmount;@JsonKey(name: 'percentageBonus') double? get bonusPercentage;@JsonKey(name: 'wageringRequirement') int? get wagerRequirement;@JsonKey(name: 'startsAt') String? get startDate;@JsonKey(name: 'endsAt') String? get endDate; bool get isActive; bool get isClaimed;
/// Create a copy of PromotionModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$PromotionModelCopyWith<PromotionModel> get copyWith => _$PromotionModelCopyWithImpl<PromotionModel>(this as PromotionModel, _$identity);

  /// Serializes this PromotionModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is PromotionModel&&(identical(other.id, id) || other.id == id)&&(identical(other.title, title) || other.title == title)&&(identical(other.slug, slug) || other.slug == slug)&&(identical(other.description, description) || other.description == description)&&(identical(other.imageUrl, imageUrl) || other.imageUrl == imageUrl)&&(identical(other.type, type) || other.type == type)&&(identical(other.bonusAmount, bonusAmount) || other.bonusAmount == bonusAmount)&&(identical(other.bonusPercentage, bonusPercentage) || other.bonusPercentage == bonusPercentage)&&(identical(other.wagerRequirement, wagerRequirement) || other.wagerRequirement == wagerRequirement)&&(identical(other.startDate, startDate) || other.startDate == startDate)&&(identical(other.endDate, endDate) || other.endDate == endDate)&&(identical(other.isActive, isActive) || other.isActive == isActive)&&(identical(other.isClaimed, isClaimed) || other.isClaimed == isClaimed));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,title,slug,description,imageUrl,type,bonusAmount,bonusPercentage,wagerRequirement,startDate,endDate,isActive,isClaimed);

@override
String toString() {
  return 'PromotionModel(id: $id, title: $title, slug: $slug, description: $description, imageUrl: $imageUrl, type: $type, bonusAmount: $bonusAmount, bonusPercentage: $bonusPercentage, wagerRequirement: $wagerRequirement, startDate: $startDate, endDate: $endDate, isActive: $isActive, isClaimed: $isClaimed)';
}


}

/// @nodoc
abstract mixin class $PromotionModelCopyWith<$Res>  {
  factory $PromotionModelCopyWith(PromotionModel value, $Res Function(PromotionModel) _then) = _$PromotionModelCopyWithImpl;
@useResult
$Res call({
 String id,@JsonKey(name: 'name') String title, String? slug, String? description, String? imageUrl, String? type, double? bonusAmount,@JsonKey(name: 'percentageBonus') double? bonusPercentage,@JsonKey(name: 'wageringRequirement') int? wagerRequirement,@JsonKey(name: 'startsAt') String? startDate,@JsonKey(name: 'endsAt') String? endDate, bool isActive, bool isClaimed
});




}
/// @nodoc
class _$PromotionModelCopyWithImpl<$Res>
    implements $PromotionModelCopyWith<$Res> {
  _$PromotionModelCopyWithImpl(this._self, this._then);

  final PromotionModel _self;
  final $Res Function(PromotionModel) _then;

/// Create a copy of PromotionModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? title = null,Object? slug = freezed,Object? description = freezed,Object? imageUrl = freezed,Object? type = freezed,Object? bonusAmount = freezed,Object? bonusPercentage = freezed,Object? wagerRequirement = freezed,Object? startDate = freezed,Object? endDate = freezed,Object? isActive = null,Object? isClaimed = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,slug: freezed == slug ? _self.slug : slug // ignore: cast_nullable_to_non_nullable
as String?,description: freezed == description ? _self.description : description // ignore: cast_nullable_to_non_nullable
as String?,imageUrl: freezed == imageUrl ? _self.imageUrl : imageUrl // ignore: cast_nullable_to_non_nullable
as String?,type: freezed == type ? _self.type : type // ignore: cast_nullable_to_non_nullable
as String?,bonusAmount: freezed == bonusAmount ? _self.bonusAmount : bonusAmount // ignore: cast_nullable_to_non_nullable
as double?,bonusPercentage: freezed == bonusPercentage ? _self.bonusPercentage : bonusPercentage // ignore: cast_nullable_to_non_nullable
as double?,wagerRequirement: freezed == wagerRequirement ? _self.wagerRequirement : wagerRequirement // ignore: cast_nullable_to_non_nullable
as int?,startDate: freezed == startDate ? _self.startDate : startDate // ignore: cast_nullable_to_non_nullable
as String?,endDate: freezed == endDate ? _self.endDate : endDate // ignore: cast_nullable_to_non_nullable
as String?,isActive: null == isActive ? _self.isActive : isActive // ignore: cast_nullable_to_non_nullable
as bool,isClaimed: null == isClaimed ? _self.isClaimed : isClaimed // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}

}


/// Adds pattern-matching-related methods to [PromotionModel].
extension PromotionModelPatterns on PromotionModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _PromotionModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _PromotionModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _PromotionModel value)  $default,){
final _that = this;
switch (_that) {
case _PromotionModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _PromotionModel value)?  $default,){
final _that = this;
switch (_that) {
case _PromotionModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id, @JsonKey(name: 'name')  String title,  String? slug,  String? description,  String? imageUrl,  String? type,  double? bonusAmount, @JsonKey(name: 'percentageBonus')  double? bonusPercentage, @JsonKey(name: 'wageringRequirement')  int? wagerRequirement, @JsonKey(name: 'startsAt')  String? startDate, @JsonKey(name: 'endsAt')  String? endDate,  bool isActive,  bool isClaimed)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _PromotionModel() when $default != null:
return $default(_that.id,_that.title,_that.slug,_that.description,_that.imageUrl,_that.type,_that.bonusAmount,_that.bonusPercentage,_that.wagerRequirement,_that.startDate,_that.endDate,_that.isActive,_that.isClaimed);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id, @JsonKey(name: 'name')  String title,  String? slug,  String? description,  String? imageUrl,  String? type,  double? bonusAmount, @JsonKey(name: 'percentageBonus')  double? bonusPercentage, @JsonKey(name: 'wageringRequirement')  int? wagerRequirement, @JsonKey(name: 'startsAt')  String? startDate, @JsonKey(name: 'endsAt')  String? endDate,  bool isActive,  bool isClaimed)  $default,) {final _that = this;
switch (_that) {
case _PromotionModel():
return $default(_that.id,_that.title,_that.slug,_that.description,_that.imageUrl,_that.type,_that.bonusAmount,_that.bonusPercentage,_that.wagerRequirement,_that.startDate,_that.endDate,_that.isActive,_that.isClaimed);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id, @JsonKey(name: 'name')  String title,  String? slug,  String? description,  String? imageUrl,  String? type,  double? bonusAmount, @JsonKey(name: 'percentageBonus')  double? bonusPercentage, @JsonKey(name: 'wageringRequirement')  int? wagerRequirement, @JsonKey(name: 'startsAt')  String? startDate, @JsonKey(name: 'endsAt')  String? endDate,  bool isActive,  bool isClaimed)?  $default,) {final _that = this;
switch (_that) {
case _PromotionModel() when $default != null:
return $default(_that.id,_that.title,_that.slug,_that.description,_that.imageUrl,_that.type,_that.bonusAmount,_that.bonusPercentage,_that.wagerRequirement,_that.startDate,_that.endDate,_that.isActive,_that.isClaimed);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _PromotionModel implements PromotionModel {
  const _PromotionModel({required this.id, @JsonKey(name: 'name') required this.title, this.slug, this.description, this.imageUrl, this.type, this.bonusAmount, @JsonKey(name: 'percentageBonus') this.bonusPercentage, @JsonKey(name: 'wageringRequirement') this.wagerRequirement, @JsonKey(name: 'startsAt') this.startDate, @JsonKey(name: 'endsAt') this.endDate, this.isActive = true, this.isClaimed = false});
  factory _PromotionModel.fromJson(Map<String, dynamic> json) => _$PromotionModelFromJson(json);

@override final  String id;
@override@JsonKey(name: 'name') final  String title;
@override final  String? slug;
@override final  String? description;
@override final  String? imageUrl;
@override final  String? type;
@override final  double? bonusAmount;
@override@JsonKey(name: 'percentageBonus') final  double? bonusPercentage;
@override@JsonKey(name: 'wageringRequirement') final  int? wagerRequirement;
@override@JsonKey(name: 'startsAt') final  String? startDate;
@override@JsonKey(name: 'endsAt') final  String? endDate;
@override@JsonKey() final  bool isActive;
@override@JsonKey() final  bool isClaimed;

/// Create a copy of PromotionModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$PromotionModelCopyWith<_PromotionModel> get copyWith => __$PromotionModelCopyWithImpl<_PromotionModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$PromotionModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _PromotionModel&&(identical(other.id, id) || other.id == id)&&(identical(other.title, title) || other.title == title)&&(identical(other.slug, slug) || other.slug == slug)&&(identical(other.description, description) || other.description == description)&&(identical(other.imageUrl, imageUrl) || other.imageUrl == imageUrl)&&(identical(other.type, type) || other.type == type)&&(identical(other.bonusAmount, bonusAmount) || other.bonusAmount == bonusAmount)&&(identical(other.bonusPercentage, bonusPercentage) || other.bonusPercentage == bonusPercentage)&&(identical(other.wagerRequirement, wagerRequirement) || other.wagerRequirement == wagerRequirement)&&(identical(other.startDate, startDate) || other.startDate == startDate)&&(identical(other.endDate, endDate) || other.endDate == endDate)&&(identical(other.isActive, isActive) || other.isActive == isActive)&&(identical(other.isClaimed, isClaimed) || other.isClaimed == isClaimed));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,title,slug,description,imageUrl,type,bonusAmount,bonusPercentage,wagerRequirement,startDate,endDate,isActive,isClaimed);

@override
String toString() {
  return 'PromotionModel(id: $id, title: $title, slug: $slug, description: $description, imageUrl: $imageUrl, type: $type, bonusAmount: $bonusAmount, bonusPercentage: $bonusPercentage, wagerRequirement: $wagerRequirement, startDate: $startDate, endDate: $endDate, isActive: $isActive, isClaimed: $isClaimed)';
}


}

/// @nodoc
abstract mixin class _$PromotionModelCopyWith<$Res> implements $PromotionModelCopyWith<$Res> {
  factory _$PromotionModelCopyWith(_PromotionModel value, $Res Function(_PromotionModel) _then) = __$PromotionModelCopyWithImpl;
@override @useResult
$Res call({
 String id,@JsonKey(name: 'name') String title, String? slug, String? description, String? imageUrl, String? type, double? bonusAmount,@JsonKey(name: 'percentageBonus') double? bonusPercentage,@JsonKey(name: 'wageringRequirement') int? wagerRequirement,@JsonKey(name: 'startsAt') String? startDate,@JsonKey(name: 'endsAt') String? endDate, bool isActive, bool isClaimed
});




}
/// @nodoc
class __$PromotionModelCopyWithImpl<$Res>
    implements _$PromotionModelCopyWith<$Res> {
  __$PromotionModelCopyWithImpl(this._self, this._then);

  final _PromotionModel _self;
  final $Res Function(_PromotionModel) _then;

/// Create a copy of PromotionModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? title = null,Object? slug = freezed,Object? description = freezed,Object? imageUrl = freezed,Object? type = freezed,Object? bonusAmount = freezed,Object? bonusPercentage = freezed,Object? wagerRequirement = freezed,Object? startDate = freezed,Object? endDate = freezed,Object? isActive = null,Object? isClaimed = null,}) {
  return _then(_PromotionModel(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,slug: freezed == slug ? _self.slug : slug // ignore: cast_nullable_to_non_nullable
as String?,description: freezed == description ? _self.description : description // ignore: cast_nullable_to_non_nullable
as String?,imageUrl: freezed == imageUrl ? _self.imageUrl : imageUrl // ignore: cast_nullable_to_non_nullable
as String?,type: freezed == type ? _self.type : type // ignore: cast_nullable_to_non_nullable
as String?,bonusAmount: freezed == bonusAmount ? _self.bonusAmount : bonusAmount // ignore: cast_nullable_to_non_nullable
as double?,bonusPercentage: freezed == bonusPercentage ? _self.bonusPercentage : bonusPercentage // ignore: cast_nullable_to_non_nullable
as double?,wagerRequirement: freezed == wagerRequirement ? _self.wagerRequirement : wagerRequirement // ignore: cast_nullable_to_non_nullable
as int?,startDate: freezed == startDate ? _self.startDate : startDate // ignore: cast_nullable_to_non_nullable
as String?,endDate: freezed == endDate ? _self.endDate : endDate // ignore: cast_nullable_to_non_nullable
as String?,isActive: null == isActive ? _self.isActive : isActive // ignore: cast_nullable_to_non_nullable
as bool,isClaimed: null == isClaimed ? _self.isClaimed : isClaimed // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}


}

// dart format on
