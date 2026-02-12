import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/providers/auth_provider.dart';
import '../../wallet/models/wallet_models.dart';
import '../repositories/profile_repository.dart';

final profileRepositoryProvider = Provider<ProfileRepository>((ref) {
  return ProfileRepository(ref.read(dioClientProvider));
});

/// Transaction history for the profile Transactions tab.
final profileTransactionsProvider =
    FutureProvider<List<TransactionModel>>((ref) async {
  final repo = ref.read(profileRepositoryProvider);
  return repo.getTransactions();
});
