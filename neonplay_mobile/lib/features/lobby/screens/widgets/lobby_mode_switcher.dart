import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_gradients.dart';
import '../../providers/lobby_provider.dart';

/// Toggle between All / Casino / Sports modes.
class LobbyModeSwitcher extends ConsumerWidget {
  const LobbyModeSwitcher({super.key});

  static const _modes = ['all', 'casino', 'sports'];
  static const _labels = ['All', 'Casino', 'Sports'];
  static const _icons = [Icons.grid_view, Icons.casino, Icons.sports_soccer];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final current = ref.watch(lobbyModeProvider);

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: List.generate(_modes.length, (i) {
          final isSelected = current == _modes[i];
          return Expanded(
            child: GestureDetector(
              onTap: () =>
                  ref.read(lobbyModeProvider.notifier).setMode(_modes[i]),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding: const EdgeInsets.symmetric(vertical: 10),
                decoration: BoxDecoration(
                  gradient: isSelected ? AppGradients.primary : null,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      _icons[i],
                      size: 16,
                      color:
                          isSelected ? Colors.white : AppColors.mutedForeground,
                    ),
                    const SizedBox(width: 6),
                    Text(
                      _labels[i],
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight:
                            isSelected ? FontWeight.w700 : FontWeight.w500,
                        color: isSelected
                            ? Colors.white
                            : AppColors.mutedForeground,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        }),
      ),
    );
  }
}
