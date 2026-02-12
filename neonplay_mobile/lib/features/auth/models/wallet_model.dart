import 'package:freezed_annotation/freezed_annotation.dart';

part 'wallet_model.freezed.dart';
part 'wallet_model.g.dart';

@freezed
abstract class WalletBalances with _$WalletBalances {
  const factory WalletBalances({
    @JsonKey(name: 'USD') @Default(0) double usd,
    @JsonKey(name: 'EUR') @Default(0) double eur,
    @JsonKey(name: 'GBP') @Default(0) double gbp,
    @JsonKey(name: 'CAD') @Default(0) double cad,
    @JsonKey(name: 'AUD') @Default(0) double aud,
    @JsonKey(name: 'PHP') @Default(0) double php,
    @JsonKey(name: 'INR') @Default(0) double inr,
    @JsonKey(name: 'THB') @Default(0) double thb,
    @JsonKey(name: 'CNY') @Default(0) double cny,
    @JsonKey(name: 'JPY') @Default(0) double jpy,
    @JsonKey(name: 'USDC') @Default(0) double usdc,
    @JsonKey(name: 'USDT') @Default(0) double usdt,
    @JsonKey(name: 'BTC') @Default(0) double btc,
    @JsonKey(name: 'ETH') @Default(0) double eth,
    @JsonKey(name: 'SOL') @Default(0) double sol,
    @JsonKey(name: 'DOGE') @Default(0) double doge,
  }) = _WalletBalances;

  factory WalletBalances.fromJson(Map<String, dynamic> json) =>
      _$WalletBalancesFromJson(json);
}

@freezed
abstract class LifetimeStats with _$LifetimeStats {
  const factory LifetimeStats({
    @Default(0) double deposited,
    @Default(0) double withdrawn,
    @Default(0) double wagered,
    @Default(0) double won,
    @Default(0) double bonuses,
  }) = _LifetimeStats;

  factory LifetimeStats.fromJson(Map<String, dynamic> json) =>
      _$LifetimeStatsFromJson(json);
}

@freezed
abstract class WalletModel with _$WalletModel {
  const factory WalletModel({
    required WalletBalances balances,
    @Default('USD') String primaryCurrency,
    LifetimeStats? lifetimeStats,
  }) = _WalletModel;

  factory WalletModel.fromJson(Map<String, dynamic> json) =>
      _$WalletModelFromJson(json);
}
