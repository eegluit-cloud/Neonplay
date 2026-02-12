// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'wallet_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_WalletBalances _$WalletBalancesFromJson(Map<String, dynamic> json) =>
    _WalletBalances(
      usd: (json['USD'] as num?)?.toDouble() ?? 0,
      eur: (json['EUR'] as num?)?.toDouble() ?? 0,
      gbp: (json['GBP'] as num?)?.toDouble() ?? 0,
      cad: (json['CAD'] as num?)?.toDouble() ?? 0,
      aud: (json['AUD'] as num?)?.toDouble() ?? 0,
      php: (json['PHP'] as num?)?.toDouble() ?? 0,
      inr: (json['INR'] as num?)?.toDouble() ?? 0,
      thb: (json['THB'] as num?)?.toDouble() ?? 0,
      cny: (json['CNY'] as num?)?.toDouble() ?? 0,
      jpy: (json['JPY'] as num?)?.toDouble() ?? 0,
      usdc: (json['USDC'] as num?)?.toDouble() ?? 0,
      usdt: (json['USDT'] as num?)?.toDouble() ?? 0,
      btc: (json['BTC'] as num?)?.toDouble() ?? 0,
      eth: (json['ETH'] as num?)?.toDouble() ?? 0,
      sol: (json['SOL'] as num?)?.toDouble() ?? 0,
      doge: (json['DOGE'] as num?)?.toDouble() ?? 0,
    );

Map<String, dynamic> _$WalletBalancesToJson(_WalletBalances instance) =>
    <String, dynamic>{
      'USD': instance.usd,
      'EUR': instance.eur,
      'GBP': instance.gbp,
      'CAD': instance.cad,
      'AUD': instance.aud,
      'PHP': instance.php,
      'INR': instance.inr,
      'THB': instance.thb,
      'CNY': instance.cny,
      'JPY': instance.jpy,
      'USDC': instance.usdc,
      'USDT': instance.usdt,
      'BTC': instance.btc,
      'ETH': instance.eth,
      'SOL': instance.sol,
      'DOGE': instance.doge,
    };

_LifetimeStats _$LifetimeStatsFromJson(Map<String, dynamic> json) =>
    _LifetimeStats(
      deposited: (json['deposited'] as num?)?.toDouble() ?? 0,
      withdrawn: (json['withdrawn'] as num?)?.toDouble() ?? 0,
      wagered: (json['wagered'] as num?)?.toDouble() ?? 0,
      won: (json['won'] as num?)?.toDouble() ?? 0,
      bonuses: (json['bonuses'] as num?)?.toDouble() ?? 0,
    );

Map<String, dynamic> _$LifetimeStatsToJson(_LifetimeStats instance) =>
    <String, dynamic>{
      'deposited': instance.deposited,
      'withdrawn': instance.withdrawn,
      'wagered': instance.wagered,
      'won': instance.won,
      'bonuses': instance.bonuses,
    };

_WalletModel _$WalletModelFromJson(Map<String, dynamic> json) => _WalletModel(
  balances: WalletBalances.fromJson(json['balances'] as Map<String, dynamic>),
  primaryCurrency: json['primaryCurrency'] as String? ?? 'USD',
  lifetimeStats: json['lifetimeStats'] == null
      ? null
      : LifetimeStats.fromJson(json['lifetimeStats'] as Map<String, dynamic>),
);

Map<String, dynamic> _$WalletModelToJson(_WalletModel instance) =>
    <String, dynamic>{
      'balances': instance.balances,
      'primaryCurrency': instance.primaryCurrency,
      'lifetimeStats': instance.lifetimeStats,
    };
