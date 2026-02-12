// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'wallet_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_TransactionModel _$TransactionModelFromJson(Map<String, dynamic> json) =>
    _TransactionModel(
      id: json['id'] as String,
      type: json['type'] as String,
      amount: (json['amount'] as num).toDouble(),
      currency: json['currency'] as String,
      status: json['status'] as String,
      method: json['method'] as String?,
      txHash: json['txHash'] as String?,
      createdAt: json['createdAt'] == null
          ? null
          : DateTime.parse(json['createdAt'] as String),
    );

Map<String, dynamic> _$TransactionModelToJson(_TransactionModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'type': instance.type,
      'amount': instance.amount,
      'currency': instance.currency,
      'status': instance.status,
      'method': instance.method,
      'txHash': instance.txHash,
      'createdAt': instance.createdAt?.toIso8601String(),
    };

_CoinPackage _$CoinPackageFromJson(Map<String, dynamic> json) => _CoinPackage(
  id: json['id'] as String,
  name: json['name'] as String,
  amount: (json['amount'] as num).toDouble(),
  price: (json['price'] as num).toDouble(),
  currency: json['currency'] as String,
  bonus: (json['bonus'] as num?)?.toDouble(),
  isBestValue: json['isBestValue'] as bool?,
);

Map<String, dynamic> _$CoinPackageToJson(_CoinPackage instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'amount': instance.amount,
      'price': instance.price,
      'currency': instance.currency,
      'bonus': instance.bonus,
      'isBestValue': instance.isBestValue,
    };

_DepositRequest _$DepositRequestFromJson(Map<String, dynamic> json) =>
    _DepositRequest(
      amount: (json['amount'] as num).toDouble(),
      currency: json['currency'] as String,
      method: json['method'] as String,
    );

Map<String, dynamic> _$DepositRequestToJson(_DepositRequest instance) =>
    <String, dynamic>{
      'amount': instance.amount,
      'currency': instance.currency,
      'method': instance.method,
    };

_WithdrawRequest _$WithdrawRequestFromJson(Map<String, dynamic> json) =>
    _WithdrawRequest(
      amount: (json['amount'] as num).toDouble(),
      currency: json['currency'] as String,
      method: json['method'] as String,
      address: json['address'] as String?,
      accountNumber: json['accountNumber'] as String?,
      upiId: json['upiId'] as String?,
    );

Map<String, dynamic> _$WithdrawRequestToJson(_WithdrawRequest instance) =>
    <String, dynamic>{
      'amount': instance.amount,
      'currency': instance.currency,
      'method': instance.method,
      'address': instance.address,
      'accountNumber': instance.accountNumber,
      'upiId': instance.upiId,
    };
