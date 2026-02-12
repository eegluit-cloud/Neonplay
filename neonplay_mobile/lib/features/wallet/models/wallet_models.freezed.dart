// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'wallet_models.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$TransactionModel {

 String get id; String get type; double get amount; String get currency; String get status; String? get method; String? get txHash; DateTime? get createdAt;
/// Create a copy of TransactionModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$TransactionModelCopyWith<TransactionModel> get copyWith => _$TransactionModelCopyWithImpl<TransactionModel>(this as TransactionModel, _$identity);

  /// Serializes this TransactionModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is TransactionModel&&(identical(other.id, id) || other.id == id)&&(identical(other.type, type) || other.type == type)&&(identical(other.amount, amount) || other.amount == amount)&&(identical(other.currency, currency) || other.currency == currency)&&(identical(other.status, status) || other.status == status)&&(identical(other.method, method) || other.method == method)&&(identical(other.txHash, txHash) || other.txHash == txHash)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,type,amount,currency,status,method,txHash,createdAt);

@override
String toString() {
  return 'TransactionModel(id: $id, type: $type, amount: $amount, currency: $currency, status: $status, method: $method, txHash: $txHash, createdAt: $createdAt)';
}


}

/// @nodoc
abstract mixin class $TransactionModelCopyWith<$Res>  {
  factory $TransactionModelCopyWith(TransactionModel value, $Res Function(TransactionModel) _then) = _$TransactionModelCopyWithImpl;
@useResult
$Res call({
 String id, String type, double amount, String currency, String status, String? method, String? txHash, DateTime? createdAt
});




}
/// @nodoc
class _$TransactionModelCopyWithImpl<$Res>
    implements $TransactionModelCopyWith<$Res> {
  _$TransactionModelCopyWithImpl(this._self, this._then);

  final TransactionModel _self;
  final $Res Function(TransactionModel) _then;

/// Create a copy of TransactionModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? type = null,Object? amount = null,Object? currency = null,Object? status = null,Object? method = freezed,Object? txHash = freezed,Object? createdAt = freezed,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,type: null == type ? _self.type : type // ignore: cast_nullable_to_non_nullable
as String,amount: null == amount ? _self.amount : amount // ignore: cast_nullable_to_non_nullable
as double,currency: null == currency ? _self.currency : currency // ignore: cast_nullable_to_non_nullable
as String,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,method: freezed == method ? _self.method : method // ignore: cast_nullable_to_non_nullable
as String?,txHash: freezed == txHash ? _self.txHash : txHash // ignore: cast_nullable_to_non_nullable
as String?,createdAt: freezed == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime?,
  ));
}

}


/// Adds pattern-matching-related methods to [TransactionModel].
extension TransactionModelPatterns on TransactionModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _TransactionModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _TransactionModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _TransactionModel value)  $default,){
final _that = this;
switch (_that) {
case _TransactionModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _TransactionModel value)?  $default,){
final _that = this;
switch (_that) {
case _TransactionModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String type,  double amount,  String currency,  String status,  String? method,  String? txHash,  DateTime? createdAt)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _TransactionModel() when $default != null:
return $default(_that.id,_that.type,_that.amount,_that.currency,_that.status,_that.method,_that.txHash,_that.createdAt);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String type,  double amount,  String currency,  String status,  String? method,  String? txHash,  DateTime? createdAt)  $default,) {final _that = this;
switch (_that) {
case _TransactionModel():
return $default(_that.id,_that.type,_that.amount,_that.currency,_that.status,_that.method,_that.txHash,_that.createdAt);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String type,  double amount,  String currency,  String status,  String? method,  String? txHash,  DateTime? createdAt)?  $default,) {final _that = this;
switch (_that) {
case _TransactionModel() when $default != null:
return $default(_that.id,_that.type,_that.amount,_that.currency,_that.status,_that.method,_that.txHash,_that.createdAt);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _TransactionModel implements TransactionModel {
  const _TransactionModel({required this.id, required this.type, required this.amount, required this.currency, required this.status, this.method, this.txHash, this.createdAt});
  factory _TransactionModel.fromJson(Map<String, dynamic> json) => _$TransactionModelFromJson(json);

@override final  String id;
@override final  String type;
@override final  double amount;
@override final  String currency;
@override final  String status;
@override final  String? method;
@override final  String? txHash;
@override final  DateTime? createdAt;

/// Create a copy of TransactionModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$TransactionModelCopyWith<_TransactionModel> get copyWith => __$TransactionModelCopyWithImpl<_TransactionModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$TransactionModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _TransactionModel&&(identical(other.id, id) || other.id == id)&&(identical(other.type, type) || other.type == type)&&(identical(other.amount, amount) || other.amount == amount)&&(identical(other.currency, currency) || other.currency == currency)&&(identical(other.status, status) || other.status == status)&&(identical(other.method, method) || other.method == method)&&(identical(other.txHash, txHash) || other.txHash == txHash)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,type,amount,currency,status,method,txHash,createdAt);

@override
String toString() {
  return 'TransactionModel(id: $id, type: $type, amount: $amount, currency: $currency, status: $status, method: $method, txHash: $txHash, createdAt: $createdAt)';
}


}

/// @nodoc
abstract mixin class _$TransactionModelCopyWith<$Res> implements $TransactionModelCopyWith<$Res> {
  factory _$TransactionModelCopyWith(_TransactionModel value, $Res Function(_TransactionModel) _then) = __$TransactionModelCopyWithImpl;
@override @useResult
$Res call({
 String id, String type, double amount, String currency, String status, String? method, String? txHash, DateTime? createdAt
});




}
/// @nodoc
class __$TransactionModelCopyWithImpl<$Res>
    implements _$TransactionModelCopyWith<$Res> {
  __$TransactionModelCopyWithImpl(this._self, this._then);

  final _TransactionModel _self;
  final $Res Function(_TransactionModel) _then;

/// Create a copy of TransactionModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? type = null,Object? amount = null,Object? currency = null,Object? status = null,Object? method = freezed,Object? txHash = freezed,Object? createdAt = freezed,}) {
  return _then(_TransactionModel(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,type: null == type ? _self.type : type // ignore: cast_nullable_to_non_nullable
as String,amount: null == amount ? _self.amount : amount // ignore: cast_nullable_to_non_nullable
as double,currency: null == currency ? _self.currency : currency // ignore: cast_nullable_to_non_nullable
as String,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,method: freezed == method ? _self.method : method // ignore: cast_nullable_to_non_nullable
as String?,txHash: freezed == txHash ? _self.txHash : txHash // ignore: cast_nullable_to_non_nullable
as String?,createdAt: freezed == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime?,
  ));
}


}


/// @nodoc
mixin _$CoinPackage {

 String get id; String get name; double get amount; double get price; String get currency; double? get bonus; bool? get isBestValue;
/// Create a copy of CoinPackage
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$CoinPackageCopyWith<CoinPackage> get copyWith => _$CoinPackageCopyWithImpl<CoinPackage>(this as CoinPackage, _$identity);

  /// Serializes this CoinPackage to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is CoinPackage&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.amount, amount) || other.amount == amount)&&(identical(other.price, price) || other.price == price)&&(identical(other.currency, currency) || other.currency == currency)&&(identical(other.bonus, bonus) || other.bonus == bonus)&&(identical(other.isBestValue, isBestValue) || other.isBestValue == isBestValue));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,amount,price,currency,bonus,isBestValue);

@override
String toString() {
  return 'CoinPackage(id: $id, name: $name, amount: $amount, price: $price, currency: $currency, bonus: $bonus, isBestValue: $isBestValue)';
}


}

/// @nodoc
abstract mixin class $CoinPackageCopyWith<$Res>  {
  factory $CoinPackageCopyWith(CoinPackage value, $Res Function(CoinPackage) _then) = _$CoinPackageCopyWithImpl;
@useResult
$Res call({
 String id, String name, double amount, double price, String currency, double? bonus, bool? isBestValue
});




}
/// @nodoc
class _$CoinPackageCopyWithImpl<$Res>
    implements $CoinPackageCopyWith<$Res> {
  _$CoinPackageCopyWithImpl(this._self, this._then);

  final CoinPackage _self;
  final $Res Function(CoinPackage) _then;

/// Create a copy of CoinPackage
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? name = null,Object? amount = null,Object? price = null,Object? currency = null,Object? bonus = freezed,Object? isBestValue = freezed,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,amount: null == amount ? _self.amount : amount // ignore: cast_nullable_to_non_nullable
as double,price: null == price ? _self.price : price // ignore: cast_nullable_to_non_nullable
as double,currency: null == currency ? _self.currency : currency // ignore: cast_nullable_to_non_nullable
as String,bonus: freezed == bonus ? _self.bonus : bonus // ignore: cast_nullable_to_non_nullable
as double?,isBestValue: freezed == isBestValue ? _self.isBestValue : isBestValue // ignore: cast_nullable_to_non_nullable
as bool?,
  ));
}

}


/// Adds pattern-matching-related methods to [CoinPackage].
extension CoinPackagePatterns on CoinPackage {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _CoinPackage value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _CoinPackage() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _CoinPackage value)  $default,){
final _that = this;
switch (_that) {
case _CoinPackage():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _CoinPackage value)?  $default,){
final _that = this;
switch (_that) {
case _CoinPackage() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String name,  double amount,  double price,  String currency,  double? bonus,  bool? isBestValue)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _CoinPackage() when $default != null:
return $default(_that.id,_that.name,_that.amount,_that.price,_that.currency,_that.bonus,_that.isBestValue);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String name,  double amount,  double price,  String currency,  double? bonus,  bool? isBestValue)  $default,) {final _that = this;
switch (_that) {
case _CoinPackage():
return $default(_that.id,_that.name,_that.amount,_that.price,_that.currency,_that.bonus,_that.isBestValue);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String name,  double amount,  double price,  String currency,  double? bonus,  bool? isBestValue)?  $default,) {final _that = this;
switch (_that) {
case _CoinPackage() when $default != null:
return $default(_that.id,_that.name,_that.amount,_that.price,_that.currency,_that.bonus,_that.isBestValue);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _CoinPackage implements CoinPackage {
  const _CoinPackage({required this.id, required this.name, required this.amount, required this.price, required this.currency, this.bonus, this.isBestValue});
  factory _CoinPackage.fromJson(Map<String, dynamic> json) => _$CoinPackageFromJson(json);

@override final  String id;
@override final  String name;
@override final  double amount;
@override final  double price;
@override final  String currency;
@override final  double? bonus;
@override final  bool? isBestValue;

/// Create a copy of CoinPackage
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$CoinPackageCopyWith<_CoinPackage> get copyWith => __$CoinPackageCopyWithImpl<_CoinPackage>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$CoinPackageToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _CoinPackage&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.amount, amount) || other.amount == amount)&&(identical(other.price, price) || other.price == price)&&(identical(other.currency, currency) || other.currency == currency)&&(identical(other.bonus, bonus) || other.bonus == bonus)&&(identical(other.isBestValue, isBestValue) || other.isBestValue == isBestValue));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,amount,price,currency,bonus,isBestValue);

@override
String toString() {
  return 'CoinPackage(id: $id, name: $name, amount: $amount, price: $price, currency: $currency, bonus: $bonus, isBestValue: $isBestValue)';
}


}

/// @nodoc
abstract mixin class _$CoinPackageCopyWith<$Res> implements $CoinPackageCopyWith<$Res> {
  factory _$CoinPackageCopyWith(_CoinPackage value, $Res Function(_CoinPackage) _then) = __$CoinPackageCopyWithImpl;
@override @useResult
$Res call({
 String id, String name, double amount, double price, String currency, double? bonus, bool? isBestValue
});




}
/// @nodoc
class __$CoinPackageCopyWithImpl<$Res>
    implements _$CoinPackageCopyWith<$Res> {
  __$CoinPackageCopyWithImpl(this._self, this._then);

  final _CoinPackage _self;
  final $Res Function(_CoinPackage) _then;

/// Create a copy of CoinPackage
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? name = null,Object? amount = null,Object? price = null,Object? currency = null,Object? bonus = freezed,Object? isBestValue = freezed,}) {
  return _then(_CoinPackage(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,amount: null == amount ? _self.amount : amount // ignore: cast_nullable_to_non_nullable
as double,price: null == price ? _self.price : price // ignore: cast_nullable_to_non_nullable
as double,currency: null == currency ? _self.currency : currency // ignore: cast_nullable_to_non_nullable
as String,bonus: freezed == bonus ? _self.bonus : bonus // ignore: cast_nullable_to_non_nullable
as double?,isBestValue: freezed == isBestValue ? _self.isBestValue : isBestValue // ignore: cast_nullable_to_non_nullable
as bool?,
  ));
}


}


/// @nodoc
mixin _$DepositRequest {

 double get amount; String get currency; String get method;
/// Create a copy of DepositRequest
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$DepositRequestCopyWith<DepositRequest> get copyWith => _$DepositRequestCopyWithImpl<DepositRequest>(this as DepositRequest, _$identity);

  /// Serializes this DepositRequest to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is DepositRequest&&(identical(other.amount, amount) || other.amount == amount)&&(identical(other.currency, currency) || other.currency == currency)&&(identical(other.method, method) || other.method == method));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,amount,currency,method);

@override
String toString() {
  return 'DepositRequest(amount: $amount, currency: $currency, method: $method)';
}


}

/// @nodoc
abstract mixin class $DepositRequestCopyWith<$Res>  {
  factory $DepositRequestCopyWith(DepositRequest value, $Res Function(DepositRequest) _then) = _$DepositRequestCopyWithImpl;
@useResult
$Res call({
 double amount, String currency, String method
});




}
/// @nodoc
class _$DepositRequestCopyWithImpl<$Res>
    implements $DepositRequestCopyWith<$Res> {
  _$DepositRequestCopyWithImpl(this._self, this._then);

  final DepositRequest _self;
  final $Res Function(DepositRequest) _then;

/// Create a copy of DepositRequest
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? amount = null,Object? currency = null,Object? method = null,}) {
  return _then(_self.copyWith(
amount: null == amount ? _self.amount : amount // ignore: cast_nullable_to_non_nullable
as double,currency: null == currency ? _self.currency : currency // ignore: cast_nullable_to_non_nullable
as String,method: null == method ? _self.method : method // ignore: cast_nullable_to_non_nullable
as String,
  ));
}

}


/// Adds pattern-matching-related methods to [DepositRequest].
extension DepositRequestPatterns on DepositRequest {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _DepositRequest value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _DepositRequest() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _DepositRequest value)  $default,){
final _that = this;
switch (_that) {
case _DepositRequest():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _DepositRequest value)?  $default,){
final _that = this;
switch (_that) {
case _DepositRequest() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( double amount,  String currency,  String method)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _DepositRequest() when $default != null:
return $default(_that.amount,_that.currency,_that.method);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( double amount,  String currency,  String method)  $default,) {final _that = this;
switch (_that) {
case _DepositRequest():
return $default(_that.amount,_that.currency,_that.method);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( double amount,  String currency,  String method)?  $default,) {final _that = this;
switch (_that) {
case _DepositRequest() when $default != null:
return $default(_that.amount,_that.currency,_that.method);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _DepositRequest implements DepositRequest {
  const _DepositRequest({required this.amount, required this.currency, required this.method});
  factory _DepositRequest.fromJson(Map<String, dynamic> json) => _$DepositRequestFromJson(json);

@override final  double amount;
@override final  String currency;
@override final  String method;

/// Create a copy of DepositRequest
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$DepositRequestCopyWith<_DepositRequest> get copyWith => __$DepositRequestCopyWithImpl<_DepositRequest>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$DepositRequestToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _DepositRequest&&(identical(other.amount, amount) || other.amount == amount)&&(identical(other.currency, currency) || other.currency == currency)&&(identical(other.method, method) || other.method == method));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,amount,currency,method);

@override
String toString() {
  return 'DepositRequest(amount: $amount, currency: $currency, method: $method)';
}


}

/// @nodoc
abstract mixin class _$DepositRequestCopyWith<$Res> implements $DepositRequestCopyWith<$Res> {
  factory _$DepositRequestCopyWith(_DepositRequest value, $Res Function(_DepositRequest) _then) = __$DepositRequestCopyWithImpl;
@override @useResult
$Res call({
 double amount, String currency, String method
});




}
/// @nodoc
class __$DepositRequestCopyWithImpl<$Res>
    implements _$DepositRequestCopyWith<$Res> {
  __$DepositRequestCopyWithImpl(this._self, this._then);

  final _DepositRequest _self;
  final $Res Function(_DepositRequest) _then;

/// Create a copy of DepositRequest
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? amount = null,Object? currency = null,Object? method = null,}) {
  return _then(_DepositRequest(
amount: null == amount ? _self.amount : amount // ignore: cast_nullable_to_non_nullable
as double,currency: null == currency ? _self.currency : currency // ignore: cast_nullable_to_non_nullable
as String,method: null == method ? _self.method : method // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}


/// @nodoc
mixin _$WithdrawRequest {

 double get amount; String get currency; String get method; String? get address; String? get accountNumber; String? get upiId;
/// Create a copy of WithdrawRequest
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$WithdrawRequestCopyWith<WithdrawRequest> get copyWith => _$WithdrawRequestCopyWithImpl<WithdrawRequest>(this as WithdrawRequest, _$identity);

  /// Serializes this WithdrawRequest to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is WithdrawRequest&&(identical(other.amount, amount) || other.amount == amount)&&(identical(other.currency, currency) || other.currency == currency)&&(identical(other.method, method) || other.method == method)&&(identical(other.address, address) || other.address == address)&&(identical(other.accountNumber, accountNumber) || other.accountNumber == accountNumber)&&(identical(other.upiId, upiId) || other.upiId == upiId));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,amount,currency,method,address,accountNumber,upiId);

@override
String toString() {
  return 'WithdrawRequest(amount: $amount, currency: $currency, method: $method, address: $address, accountNumber: $accountNumber, upiId: $upiId)';
}


}

/// @nodoc
abstract mixin class $WithdrawRequestCopyWith<$Res>  {
  factory $WithdrawRequestCopyWith(WithdrawRequest value, $Res Function(WithdrawRequest) _then) = _$WithdrawRequestCopyWithImpl;
@useResult
$Res call({
 double amount, String currency, String method, String? address, String? accountNumber, String? upiId
});




}
/// @nodoc
class _$WithdrawRequestCopyWithImpl<$Res>
    implements $WithdrawRequestCopyWith<$Res> {
  _$WithdrawRequestCopyWithImpl(this._self, this._then);

  final WithdrawRequest _self;
  final $Res Function(WithdrawRequest) _then;

/// Create a copy of WithdrawRequest
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? amount = null,Object? currency = null,Object? method = null,Object? address = freezed,Object? accountNumber = freezed,Object? upiId = freezed,}) {
  return _then(_self.copyWith(
amount: null == amount ? _self.amount : amount // ignore: cast_nullable_to_non_nullable
as double,currency: null == currency ? _self.currency : currency // ignore: cast_nullable_to_non_nullable
as String,method: null == method ? _self.method : method // ignore: cast_nullable_to_non_nullable
as String,address: freezed == address ? _self.address : address // ignore: cast_nullable_to_non_nullable
as String?,accountNumber: freezed == accountNumber ? _self.accountNumber : accountNumber // ignore: cast_nullable_to_non_nullable
as String?,upiId: freezed == upiId ? _self.upiId : upiId // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}

}


/// Adds pattern-matching-related methods to [WithdrawRequest].
extension WithdrawRequestPatterns on WithdrawRequest {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _WithdrawRequest value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _WithdrawRequest() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _WithdrawRequest value)  $default,){
final _that = this;
switch (_that) {
case _WithdrawRequest():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _WithdrawRequest value)?  $default,){
final _that = this;
switch (_that) {
case _WithdrawRequest() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( double amount,  String currency,  String method,  String? address,  String? accountNumber,  String? upiId)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _WithdrawRequest() when $default != null:
return $default(_that.amount,_that.currency,_that.method,_that.address,_that.accountNumber,_that.upiId);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( double amount,  String currency,  String method,  String? address,  String? accountNumber,  String? upiId)  $default,) {final _that = this;
switch (_that) {
case _WithdrawRequest():
return $default(_that.amount,_that.currency,_that.method,_that.address,_that.accountNumber,_that.upiId);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( double amount,  String currency,  String method,  String? address,  String? accountNumber,  String? upiId)?  $default,) {final _that = this;
switch (_that) {
case _WithdrawRequest() when $default != null:
return $default(_that.amount,_that.currency,_that.method,_that.address,_that.accountNumber,_that.upiId);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _WithdrawRequest implements WithdrawRequest {
  const _WithdrawRequest({required this.amount, required this.currency, required this.method, this.address, this.accountNumber, this.upiId});
  factory _WithdrawRequest.fromJson(Map<String, dynamic> json) => _$WithdrawRequestFromJson(json);

@override final  double amount;
@override final  String currency;
@override final  String method;
@override final  String? address;
@override final  String? accountNumber;
@override final  String? upiId;

/// Create a copy of WithdrawRequest
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$WithdrawRequestCopyWith<_WithdrawRequest> get copyWith => __$WithdrawRequestCopyWithImpl<_WithdrawRequest>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$WithdrawRequestToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _WithdrawRequest&&(identical(other.amount, amount) || other.amount == amount)&&(identical(other.currency, currency) || other.currency == currency)&&(identical(other.method, method) || other.method == method)&&(identical(other.address, address) || other.address == address)&&(identical(other.accountNumber, accountNumber) || other.accountNumber == accountNumber)&&(identical(other.upiId, upiId) || other.upiId == upiId));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,amount,currency,method,address,accountNumber,upiId);

@override
String toString() {
  return 'WithdrawRequest(amount: $amount, currency: $currency, method: $method, address: $address, accountNumber: $accountNumber, upiId: $upiId)';
}


}

/// @nodoc
abstract mixin class _$WithdrawRequestCopyWith<$Res> implements $WithdrawRequestCopyWith<$Res> {
  factory _$WithdrawRequestCopyWith(_WithdrawRequest value, $Res Function(_WithdrawRequest) _then) = __$WithdrawRequestCopyWithImpl;
@override @useResult
$Res call({
 double amount, String currency, String method, String? address, String? accountNumber, String? upiId
});




}
/// @nodoc
class __$WithdrawRequestCopyWithImpl<$Res>
    implements _$WithdrawRequestCopyWith<$Res> {
  __$WithdrawRequestCopyWithImpl(this._self, this._then);

  final _WithdrawRequest _self;
  final $Res Function(_WithdrawRequest) _then;

/// Create a copy of WithdrawRequest
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? amount = null,Object? currency = null,Object? method = null,Object? address = freezed,Object? accountNumber = freezed,Object? upiId = freezed,}) {
  return _then(_WithdrawRequest(
amount: null == amount ? _self.amount : amount // ignore: cast_nullable_to_non_nullable
as double,currency: null == currency ? _self.currency : currency // ignore: cast_nullable_to_non_nullable
as String,method: null == method ? _self.method : method // ignore: cast_nullable_to_non_nullable
as String,address: freezed == address ? _self.address : address // ignore: cast_nullable_to_non_nullable
as String?,accountNumber: freezed == accountNumber ? _self.accountNumber : accountNumber // ignore: cast_nullable_to_non_nullable
as String?,upiId: freezed == upiId ? _self.upiId : upiId // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}


}

// dart format on
