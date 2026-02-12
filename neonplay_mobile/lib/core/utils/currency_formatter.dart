import 'package:intl/intl.dart';

/// Formats amounts for all 16 supported currencies.
/// Mirrors AppModeContext.formatCurrency() from the React app.
class CurrencyFormatter {
  static final _currencyConfig = <String, _CurrencyConfig>{
    'USD': _CurrencyConfig('\$', 2),
    'EUR': _CurrencyConfig('€', 2),
    'GBP': _CurrencyConfig('£', 2),
    'CAD': _CurrencyConfig('C\$', 2),
    'AUD': _CurrencyConfig('A\$', 2),
    'PHP': _CurrencyConfig('₱', 2),
    'INR': _CurrencyConfig('₹', 2),
    'THB': _CurrencyConfig('฿', 2),
    'CNY': _CurrencyConfig('¥', 2),
    'JPY': _CurrencyConfig('¥', 0),
    'USDC': _CurrencyConfig('\$', 2),
    'USDT': _CurrencyConfig('\$', 2),
    'BTC': _CurrencyConfig('₿', 8),
    'ETH': _CurrencyConfig('Ξ', 6),
    'SOL': _CurrencyConfig('', 4, suffix: ' SOL'),
    'DOGE': _CurrencyConfig('', 4, suffix: ' DOGE'),
  };

  static String format(double amount, String currency) {
    final config = _currencyConfig[currency.toUpperCase()];
    if (config == null) return '$amount $currency';

    final formatter = NumberFormat.currency(
      symbol: config.symbol,
      decimalDigits: config.decimals,
    );

    final formatted = formatter.format(amount);
    if (config.suffix != null) {
      return '$formatted${config.suffix}';
    }
    return formatted;
  }

  static String symbol(String currency) {
    return _currencyConfig[currency.toUpperCase()]?.symbol ?? currency;
  }

  static int decimals(String currency) {
    return _currencyConfig[currency.toUpperCase()]?.decimals ?? 2;
  }

  /// Compact format for large numbers (e.g., 1.2K, 3.4M)
  static String formatCompact(double amount, String currency) {
    final config = _currencyConfig[currency.toUpperCase()];
    final symbol = config?.symbol ?? '';
    final compact = NumberFormat.compact().format(amount);
    return '$symbol$compact';
  }
}

class _CurrencyConfig {
  final String symbol;
  final int decimals;
  final String? suffix;

  const _CurrencyConfig(this.symbol, this.decimals, {this.suffix});
}
