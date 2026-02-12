import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/providers/auth_provider.dart';
import '../repositories/spin_wheel_repository.dart';

final spinWheelRepositoryProvider = Provider<SpinWheelRepository>((ref) {
  return SpinWheelRepository(ref.read(dioClientProvider));
});

final spinWheelConfigProvider =
    FutureProvider<Map<String, dynamic>>((ref) async {
  return ref.read(spinWheelRepositoryProvider).getConfig();
});

/// Spin wheel state: isSpinning, result, cooldown.
class SpinWheelState {
  final bool isSpinning;
  final Map<String, dynamic>? result;

  const SpinWheelState({this.isSpinning = false, this.result});

  SpinWheelState copyWith({bool? isSpinning, Map<String, dynamic>? result}) {
    return SpinWheelState(
      isSpinning: isSpinning ?? this.isSpinning,
      result: result ?? this.result,
    );
  }
}

class SpinWheelNotifier extends Notifier<SpinWheelState> {
  @override
  SpinWheelState build() => const SpinWheelState();

  Future<void> spin() async {
    if (state.isSpinning) return;
    state = state.copyWith(isSpinning: true);
    try {
      final repo = ref.read(spinWheelRepositoryProvider);
      final result = await repo.spin();
      state = SpinWheelState(isSpinning: false, result: result);
    } catch (_) {
      state = state.copyWith(isSpinning: false);
    }
  }
}

final spinWheelProvider =
    NotifierProvider<SpinWheelNotifier, SpinWheelState>(
  SpinWheelNotifier.new,
);
