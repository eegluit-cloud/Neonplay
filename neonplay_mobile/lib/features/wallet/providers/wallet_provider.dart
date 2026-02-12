import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../auth/models/wallet_model.dart';
import '../../auth/providers/auth_provider.dart';
import '../models/wallet_models.dart';
import '../repository/wallet_repository.dart';

final walletRepositoryProvider = Provider<WalletRepository>((ref) {
  return WalletRepository(ref.read(dioClientProvider));
});

/// App mode: real or demo.
enum AppMode { real, demo }

class AppModeNotifier extends Notifier<AppMode> {
  @override
  AppMode build() {
    _loadMode();
    return AppMode.real;
  }

  Future<void> _loadMode() async {
    final prefs = await SharedPreferences.getInstance();
    final isDemo = prefs.getBool('demo_mode') ?? false;
    state = isDemo ? AppMode.demo : AppMode.real;
  }

  Future<void> toggle() async {
    final newMode =
        state == AppMode.real ? AppMode.demo : AppMode.real;
    state = newMode;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('demo_mode', newMode == AppMode.demo);
  }
}

final appModeProvider = NotifierProvider<AppModeNotifier, AppMode>(
  AppModeNotifier.new,
);

/// Demo wallet balances stored locally.
class DemoWalletNotifier extends Notifier<WalletBalances> {
  @override
  WalletBalances build() {
    return const WalletBalances(usd: 10000, btc: 0.5, eth: 5.0);
  }

  void addBalance(String currency, double amount) {
    state = _updateCurrency(state, currency, amount);
  }

  WalletBalances _updateCurrency(
      WalletBalances b, String currency, double amount) {
    return switch (currency) {
      'USD' => b.copyWith(usd: b.usd + amount),
      'EUR' => b.copyWith(eur: b.eur + amount),
      'GBP' => b.copyWith(gbp: b.gbp + amount),
      'BTC' => b.copyWith(btc: b.btc + amount),
      'ETH' => b.copyWith(eth: b.eth + amount),
      _ => b,
    };
  }
}

final demoWalletProvider =
    NotifierProvider<DemoWalletNotifier, WalletBalances>(
  DemoWalletNotifier.new,
);

/// Transactions list provider.
final transactionsProvider =
    FutureProvider.family<List<TransactionModel>, int>((ref, page) async {
  final repo = ref.read(walletRepositoryProvider);
  return repo.getTransactions(page: page);
});

/// Coin packages provider.
final coinPackagesProvider = FutureProvider<List<CoinPackage>>((ref) async {
  final repo = ref.read(walletRepositoryProvider);
  return repo.getCoinPackages();
});
