import 'package:freezed_annotation/freezed_annotation.dart';

part 'wallet_models.freezed.dart';
part 'wallet_models.g.dart';

@freezed
abstract class TransactionModel with _$TransactionModel {
  const factory TransactionModel({
    required String id,
    required String type,
    required double amount,
    required String currency,
    required String status,
    String? method,
    String? txHash,
    DateTime? createdAt,
  }) = _TransactionModel;

  factory TransactionModel.fromJson(Map<String, dynamic> json) =>
      _$TransactionModelFromJson(json);
}

@freezed
abstract class CoinPackage with _$CoinPackage {
  const factory CoinPackage({
    required String id,
    required String name,
    required double amount,
    required double price,
    required String currency,
    double? bonus,
    bool? isBestValue,
  }) = _CoinPackage;

  factory CoinPackage.fromJson(Map<String, dynamic> json) =>
      _$CoinPackageFromJson(json);
}

@freezed
abstract class DepositRequest with _$DepositRequest {
  const factory DepositRequest({
    required double amount,
    required String currency,
    required String method,
  }) = _DepositRequest;

  factory DepositRequest.fromJson(Map<String, dynamic> json) =>
      _$DepositRequestFromJson(json);
}

@freezed
abstract class WithdrawRequest with _$WithdrawRequest {
  const factory WithdrawRequest({
    required double amount,
    required String currency,
    required String method,
    String? address,
    String? accountNumber,
    String? upiId,
  }) = _WithdrawRequest;

  factory WithdrawRequest.fromJson(Map<String, dynamic> json) =>
      _$WithdrawRequestFromJson(json);
}
