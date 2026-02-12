import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/providers/auth_provider.dart';
import '../repositories/amoe_repository.dart';

final amoeRepositoryProvider = Provider<AmoeRepository>((ref) {
  return AmoeRepository(ref.read(dioClientProvider));
});

final amoeConfigProvider =
    FutureProvider<Map<String, dynamic>>((ref) async {
  return ref.read(amoeRepositoryProvider).getConfig();
});

final amoeHistoryProvider =
    FutureProvider<List<Map<String, dynamic>>>((ref) async {
  return ref.read(amoeRepositoryProvider).getHistory();
});
