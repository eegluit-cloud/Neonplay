import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/providers/auth_provider.dart';
import '../repositories/settings_repository.dart';

final settingsRepositoryProvider = Provider<SettingsRepository>((ref) {
  return SettingsRepository(ref.read(dioClientProvider));
});

final settingsProvider =
    FutureProvider<Map<String, dynamic>>((ref) async {
  return ref.read(settingsRepositoryProvider).getSettings();
});
