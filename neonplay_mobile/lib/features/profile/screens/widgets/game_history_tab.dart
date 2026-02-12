import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../sports/models/sports_models.dart';
import '../../../sports/providers/sports_provider.dart';

/// Game History tab showing sports + casino bet history.
class GameHistoryTab extends ConsumerWidget {
  const GameHistoryTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final betsAsync = ref.watch(myBetsProvider);

    return betsAsync.when(
      data: (result) {
        if (result.data.isEmpty) {
          return const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.history, size: 48, color: AppColors.mutedForeground),
                SizedBox(height: 12),
                Text(
                  'No game history yet',
                  style: TextStyle(color: AppColors.mutedForeground),
                ),
              ],
            ),
          );
        }
        return ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: result.data.length,
          separatorBuilder: (_, _) => const SizedBox(height: 8),
          itemBuilder: (_, index) => _BetHistoryCard(bet: result.data[index]),
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (_, _) => const Center(
        child: Text('Failed to load history',
            style: TextStyle(color: AppColors.mutedForeground)),
      ),
    );
  }
}

class _BetHistoryCard extends StatelessWidget {
  final BetModel bet;

  const _BetHistoryCard({required this.bet});

  @override
  Widget build(BuildContext context) {
    final statusColor = switch (bet.status) {
      'won' => AppColors.success,
      'lost' => AppColors.destructive,
      'pending' => AppColors.warning,
      _ => AppColors.mutedForeground,
    };

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${bet.type.toUpperCase()} - ${bet.currency}',
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: AppColors.foreground,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Stake: \$${bet.stake.toStringAsFixed(2)} | Odds: ${bet.totalOdds.toStringAsFixed(2)}',
                  style: const TextStyle(
                    fontSize: 11,
                    color: AppColors.mutedForeground,
                  ),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  bet.status.toUpperCase(),
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: statusColor,
                  ),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                '\$${bet.potentialWin.toStringAsFixed(2)}',
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: AppColors.accent,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
