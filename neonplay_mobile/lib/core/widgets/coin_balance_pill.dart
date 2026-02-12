import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../features/auth/models/wallet_model.dart';
import '../../features/auth/providers/auth_provider.dart';
import '../theme/app_colors.dart';
import '../utils/currency_formatter.dart';

/// Primary currency displayed in the balance pill.
class PrimaryCurrencyNotifier extends Notifier<String> {
  @override
  String build() => 'USD';

  void setCurrency(String currency) => state = currency;
}

final primaryCurrencyProvider =
    NotifierProvider<PrimaryCurrencyNotifier, String>(
  PrimaryCurrencyNotifier.new,
);

class CoinBalancePill extends ConsumerWidget {
  const CoinBalancePill({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final wallet = ref.watch(currentWalletProvider);
    final currency = ref.watch(primaryCurrencyProvider);
    final balance = _getBalance(wallet, currency);

    return GestureDetector(
      onTap: () => _showCurrencyPicker(context, ref, wallet),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: AppColors.card,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppColors.border),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              CurrencyFormatter.symbol(currency),
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(width: 4),
            Text(
              CurrencyFormatter.format(balance, currency),
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.foreground,
              ),
            ),
            const SizedBox(width: 4),
            const Icon(Icons.keyboard_arrow_down,
                size: 14, color: AppColors.mutedForeground),
          ],
        ),
      ),
    );
  }

  void _showCurrencyPicker(
      BuildContext context, WidgetRef ref, WalletModel? wallet) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.card,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => _CurrencyPickerSheet(wallet: wallet, ref: ref),
    );
  }

  static double _getBalance(WalletModel? wallet, String currency) {
    if (wallet == null) return 0;
    final b = wallet.balances;
    return switch (currency) {
      'USD' => b.usd,
      'EUR' => b.eur,
      'GBP' => b.gbp,
      'CAD' => b.cad,
      'AUD' => b.aud,
      'PHP' => b.php,
      'INR' => b.inr,
      'THB' => b.thb,
      'CNY' => b.cny,
      'JPY' => b.jpy,
      'USDC' => b.usdc,
      'USDT' => b.usdt,
      'BTC' => b.btc,
      'ETH' => b.eth,
      'SOL' => b.sol,
      'DOGE' => b.doge,
      _ => b.usd,
    };
  }
}

class _CurrencyPickerSheet extends StatelessWidget {
  final WalletModel? wallet;
  final WidgetRef ref;

  const _CurrencyPickerSheet({required this.wallet, required this.ref});

  static const _fiatCurrencies = [
    'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'PHP', 'INR', 'THB', 'CNY', 'JPY',
  ];
  static const _cryptoCurrencies = [
    'USDC', 'USDT', 'BTC', 'ETH', 'SOL', 'DOGE',
  ];

  @override
  Widget build(BuildContext context) {
    final currentCurrency = ref.read(primaryCurrencyProvider);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Handle bar
          Center(
            child: Container(
              width: 40,
              height: 4,
              margin: const EdgeInsets.only(bottom: 16),
              decoration: BoxDecoration(
                color: AppColors.mutedForeground,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const Text(
            'Select Currency',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: AppColors.foreground,
            ),
          ),
          const SizedBox(height: 16),

          // Fiat currencies
          const Text(
            'Fiat',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: AppColors.mutedForeground,
            ),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _fiatCurrencies
                .map((c) => _CurrencyChip(
                      currency: c,
                      balance: CoinBalancePill._getBalance(wallet, c),
                      isSelected: c == currentCurrency,
                      onTap: () {
                        ref
                            .read(primaryCurrencyProvider.notifier)
                            .setCurrency(c);
                        Navigator.pop(context);
                      },
                    ))
                .toList(),
          ),
          const SizedBox(height: 16),

          // Crypto currencies
          const Text(
            'Crypto',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: AppColors.mutedForeground,
            ),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _cryptoCurrencies
                .map((c) => _CurrencyChip(
                      currency: c,
                      balance: CoinBalancePill._getBalance(wallet, c),
                      isSelected: c == currentCurrency,
                      onTap: () {
                        ref
                            .read(primaryCurrencyProvider.notifier)
                            .setCurrency(c);
                        Navigator.pop(context);
                      },
                    ))
                .toList(),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}

class _CurrencyChip extends StatelessWidget {
  final String currency;
  final double balance;
  final bool isSelected;
  final VoidCallback onTap;

  const _CurrencyChip({
    required this.currency,
    required this.balance,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primary.withValues(alpha: 0.1)
              : AppColors.secondary,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.border,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              currency,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: isSelected ? AppColors.primary : AppColors.foreground,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              CurrencyFormatter.format(balance, currency),
              style: const TextStyle(
                fontSize: 10,
                color: AppColors.mutedForeground,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
