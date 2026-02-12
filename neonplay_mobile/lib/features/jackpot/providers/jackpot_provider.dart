import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/providers/auth_provider.dart';
import '../models/jackpot_models.dart';
import '../repositories/jackpot_repository.dart';

final jackpotRepositoryProvider = Provider<JackpotRepository>((ref) {
  return JackpotRepository(ref.read(dioClientProvider));
});

final currentJackpotProvider = FutureProvider<JackpotModel>((ref) async {
  return ref.read(jackpotRepositoryProvider).getCurrent();
});

final allJackpotsProvider = FutureProvider<List<JackpotModel>>((ref) async {
  return ref.read(jackpotRepositoryProvider).getAll();
});
