import 'package:flutter_test/flutter_test.dart';
import 'package:neonplay_mobile/core/utils/currency_formatter.dart';

void main() {
  group('CurrencyFormatter', () {
    group('format', () {
      test('formats USD with dollar sign and 2 decimals', () {
        expect(CurrencyFormatter.format(100.00, 'USD'), contains('\$'));
        expect(CurrencyFormatter.format(100.00, 'USD'), contains('100.00'));
      });

      test('formats EUR with euro sign', () {
        expect(CurrencyFormatter.format(50.50, 'EUR'), contains('€'));
        expect(CurrencyFormatter.format(50.50, 'EUR'), contains('50.50'));
      });

      test('formats GBP with pound sign', () {
        expect(CurrencyFormatter.format(75.25, 'GBP'), contains('£'));
      });

      test('formats JPY with 0 decimals', () {
        final result = CurrencyFormatter.format(1000.0, 'JPY');
        expect(result, contains('¥'));
        // JPY should have no decimal places
        expect(result, contains('1,000'));
        expect(result.contains('.'), isFalse);
      });

      test('formats BTC with 8 decimals', () {
        final result = CurrencyFormatter.format(0.00123456, 'BTC');
        expect(result, contains('₿'));
        expect(result, contains('0.00123456'));
      });

      test('formats ETH with 6 decimals', () {
        final result = CurrencyFormatter.format(1.234567, 'ETH');
        expect(result, contains('Ξ'));
        expect(result, contains('1.234567'));
      });

      test('formats SOL with suffix', () {
        final result = CurrencyFormatter.format(42.1234, 'SOL');
        expect(result, contains('SOL'));
      });

      test('formats DOGE with suffix', () {
        final result = CurrencyFormatter.format(1000.5678, 'DOGE');
        expect(result, contains('DOGE'));
      });

      test('formats PHP with peso sign', () {
        expect(CurrencyFormatter.format(500.00, 'PHP'), contains('₱'));
      });

      test('formats INR with rupee sign', () {
        expect(CurrencyFormatter.format(1000.00, 'INR'), contains('₹'));
      });

      test('handles unknown currency gracefully', () {
        final result = CurrencyFormatter.format(100.0, 'XYZ');
        expect(result, contains('XYZ'));
        expect(result, contains('100'));
      });

      test('is case-insensitive', () {
        final upper = CurrencyFormatter.format(100.0, 'USD');
        final lower = CurrencyFormatter.format(100.0, 'usd');
        expect(upper, equals(lower));
      });

      test('formats zero correctly', () {
        final result = CurrencyFormatter.format(0.0, 'USD');
        expect(result, contains('0.00'));
      });

      test('formats large numbers with grouping', () {
        final result = CurrencyFormatter.format(1234567.89, 'USD');
        expect(result, contains('1,234,567.89'));
      });
    });

    group('symbol', () {
      test('returns correct symbol for known currencies', () {
        expect(CurrencyFormatter.symbol('USD'), '\$');
        expect(CurrencyFormatter.symbol('EUR'), '€');
        expect(CurrencyFormatter.symbol('GBP'), '£');
        expect(CurrencyFormatter.symbol('BTC'), '₿');
        expect(CurrencyFormatter.symbol('ETH'), 'Ξ');
      });

      test('returns currency code for unknown currencies', () {
        expect(CurrencyFormatter.symbol('XYZ'), 'XYZ');
      });
    });

    group('decimals', () {
      test('returns correct decimal places', () {
        expect(CurrencyFormatter.decimals('USD'), 2);
        expect(CurrencyFormatter.decimals('JPY'), 0);
        expect(CurrencyFormatter.decimals('BTC'), 8);
        expect(CurrencyFormatter.decimals('ETH'), 6);
        expect(CurrencyFormatter.decimals('SOL'), 4);
      });

      test('defaults to 2 for unknown currencies', () {
        expect(CurrencyFormatter.decimals('XYZ'), 2);
      });
    });

    group('formatCompact', () {
      test('formats large numbers compactly', () {
        final result = CurrencyFormatter.formatCompact(1500000.0, 'USD');
        expect(result, contains('\$'));
        expect(result, contains('M'));
      });

      test('formats thousands compactly', () {
        final result = CurrencyFormatter.formatCompact(5400.0, 'USD');
        expect(result, contains('\$'));
        expect(result, contains('K'));
      });
    });
  });
}
