import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../leaderboard/models/leaderboard_models.dart';
import '../../../leaderboard/providers/leaderboard_provider.dart';

/// Compact leaderboard preview for the lobby.
class LeaderboardWidget extends ConsumerWidget {
  const LeaderboardWidget({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final period = ref.watch(leaderboardPeriodProvider);
    final leaderboardAsync = ref.watch(leaderboardProvider(period));

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Header
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Icon(Icons.leaderboard, size: 20, color: AppColors.accent),
                  SizedBox(width: 8),
                  Text(
                    'Leaderboard',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: AppColors.foreground,
                    ),
                  ),
                ],
              ),
              GestureDetector(
                onTap: () => context.go('/leaderboard'),
                child: const Text(
                  'See All',
                  style: TextStyle(
                    fontSize: 13,
                    color: AppColors.primary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 10),

        // Period tabs
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            children: ['daily', 'weekly', 'monthly'].map((p) {
              final isSelected = period == p;
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: GestureDetector(
                  onTap: () =>
                      ref.read(leaderboardPeriodProvider.notifier).setPeriod(p),
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                    decoration: BoxDecoration(
                      color: isSelected ? AppColors.primary : AppColors.card,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color:
                            isSelected ? AppColors.primary : AppColors.border,
                      ),
                    ),
                    child: Text(
                      p[0].toUpperCase() + p.substring(1),
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: isSelected
                            ? AppColors.primaryForeground
                            : AppColors.mutedForeground,
                      ),
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ),
        const SizedBox(height: 12),

        // Leaderboard table
        leaderboardAsync.when(
          data: (entries) => _buildTable(entries.take(5).toList()),
          loading: () => const SizedBox(
            height: 200,
            child: Center(child: CircularProgressIndicator()),
          ),
          error: (_, _) => const SizedBox(
            height: 80,
            child: Center(
              child: Text(
                'Failed to load leaderboard',
                style: TextStyle(color: AppColors.mutedForeground),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildTable(List<LeaderboardEntry> entries) {
    if (entries.isEmpty) {
      return const SizedBox(
        height: 80,
        child: Center(
          child: Text(
            'No data yet',
            style: TextStyle(color: AppColors.mutedForeground),
          ),
        ),
      );
    }

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          // Table header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            child: Row(
              children: const [
                SizedBox(
                    width: 30,
                    child: Text('#',
                        style: TextStyle(
                            fontSize: 11,
                            color: AppColors.mutedForeground,
                            fontWeight: FontWeight.w600))),
                Expanded(
                    child: Text('Player',
                        style: TextStyle(
                            fontSize: 11,
                            color: AppColors.mutedForeground,
                            fontWeight: FontWeight.w600))),
                SizedBox(
                    width: 80,
                    child: Text('Wagered',
                        textAlign: TextAlign.right,
                        style: TextStyle(
                            fontSize: 11,
                            color: AppColors.mutedForeground,
                            fontWeight: FontWeight.w600))),
              ],
            ),
          ),
          const Divider(height: 1, color: AppColors.border),
          // Rows
          ...entries.asMap().entries.map((entry) {
            final index = entry.key;
            final player = entry.value;
            return _buildRow(index + 1, player);
          }),
        ],
      ),
    );
  }

  Widget _buildRow(int rank, LeaderboardEntry player) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      child: Row(
        children: [
          SizedBox(
            width: 30,
            child: rank <= 3
                ? Icon(
                    Icons.emoji_events,
                    size: 18,
                    color: rank == 1
                        ? AppColors.accent
                        : rank == 2
                            ? Colors.grey[400]
                            : const Color(0xFFCD7F32),
                  )
                : Text(
                    '$rank',
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppColors.foreground,
                    ),
                  ),
          ),
          Expanded(
            child: Text(
              player.username,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: AppColors.foreground,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          SizedBox(
            width: 80,
            child: Text(
              '\$${player.score.toStringAsFixed(0)}',
              textAlign: TextAlign.right,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: AppColors.primary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
