import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_gradients.dart';
import '../models/leaderboard_models.dart';
import '../providers/leaderboard_provider.dart';

/// Full leaderboard screen with hero banner, podium, period tabs and table.
class LeaderboardScreen extends ConsumerWidget {
  const LeaderboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final period = ref.watch(leaderboardPeriodProvider);
    final leaderboardAsync = ref.watch(leaderboardProvider(period));
    final myRankAsync = ref.watch(myRankProvider(period));

    return RefreshIndicator(
      color: AppColors.primary,
      backgroundColor: AppColors.card,
      onRefresh: () async {
        ref.invalidate(allLeaderboardsProvider);
        ref.invalidate(myRankProvider(period));
      },
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Hero banner
          _buildHeroBanner(context),
          const SizedBox(height: 20),

          // Period tabs
          _buildPeriodTabs(ref, period),
          const SizedBox(height: 16),

          // Top 3 podium
          leaderboardAsync.when(
            data: (entries) =>
                entries.length >= 3 ? _buildPodium(entries) : const SizedBox.shrink(),
            loading: () => const SizedBox.shrink(),
            error: (_, _) => const SizedBox.shrink(),
          ),
          const SizedBox(height: 16),

          // My rank card
          myRankAsync.when(
            data: (rank) => _buildMyRank(rank),
            loading: () => const SizedBox.shrink(),
            error: (_, _) => const SizedBox.shrink(),
          ),
          const SizedBox(height: 16),

          // Leaderboard table
          leaderboardAsync.when(
            data: (entries) => _buildTable(entries),
            loading: () => const SizedBox(
              height: 200,
              child: Center(child: CircularProgressIndicator()),
            ),
            error: (_, _) => const Center(
              child: Text('Failed to load leaderboard',
                  style: TextStyle(color: AppColors.mutedForeground)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeroBanner(BuildContext context) {
    return Container(
      height: 150,
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Stack(
        children: [
          Positioned.fill(
            child: Image.asset(
              'assets/images/banners/leaderboard-bg-depth.png',
              fit: BoxFit.cover,
              errorBuilder: (_, _, _) => Container(
                decoration: const BoxDecoration(gradient: AppGradients.accent),
              ),
            ),
          ),
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.centerLeft,
                  end: Alignment.centerRight,
                  colors: [
                    Colors.black.withValues(alpha: 0.80),
                    Colors.black.withValues(alpha: 0.35),
                  ],
                ),
              ),
            ),
          ),
          Positioned(
            left: 16,
            top: 0,
            bottom: 0,
            right: 80,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Image.asset(
                  'assets/images/ui/crown-first-place.png',
                  width: 32,
                  height: 32,
                  errorBuilder: (_, _, _) => const Icon(
                      Icons.emoji_events,
                      color: Color(0xFFFACC15),
                      size: 32),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Leaderboard',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Compete, climb the ranks & win prizes',
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.white.withValues(alpha: 0.8),
                  ),
                ),
              ],
            ),
          ),
          // Prizes button
          Positioned(
            right: 12,
            bottom: 12,
            child: GestureDetector(
              onTap: () => context.go('/prizes'),
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  gradient: AppGradients.gold,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.emoji_events, color: Colors.white, size: 16),
                    SizedBox(width: 4),
                    Text(
                      'Prizes',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPeriodTabs(WidgetRef ref, String period) {
    return Row(
      children: ['daily', 'weekly', 'monthly'].map((p) {
        final isSelected = period == p;
        return Expanded(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: GestureDetector(
              onTap: () =>
                  ref.read(leaderboardPeriodProvider.notifier).setPeriod(p),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 10),
                decoration: BoxDecoration(
                  gradient: isSelected ? AppGradients.accent : null,
                  color: isSelected ? null : AppColors.card,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color:
                        isSelected ? AppColors.primary : AppColors.border,
                  ),
                ),
                child: Center(
                  child: Text(
                    p[0].toUpperCase() + p.substring(1),
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: isSelected
                          ? Colors.white
                          : AppColors.mutedForeground,
                    ),
                  ),
                ),
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildPodium(List<LeaderboardEntry> entries) {
    final first = entries[0];
    final second = entries[1];
    final third = entries[2];

    return SizedBox(
      height: 200,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          // 2nd place
          Expanded(
            child: _buildPodiumItem(second, 2, 140, Colors.grey.shade400),
          ),
          const SizedBox(width: 8),
          // 1st place
          Expanded(
            child: _buildPodiumItem(
                first, 1, 180, const Color(0xFFFACC15)),
          ),
          const SizedBox(width: 8),
          // 3rd place
          Expanded(
            child: _buildPodiumItem(
                third, 3, 120, const Color(0xFFFB923C)),
          ),
        ],
      ),
    );
  }

  Widget _buildPodiumItem(
      LeaderboardEntry entry, int rank, double height, Color accentColor) {
    return Container(
      height: height,
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
        border: Border.all(color: accentColor.withValues(alpha: 0.35)),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          if (rank == 1)
            Image.asset(
              'assets/images/ui/crown-first-place.png',
              width: 28,
              height: 28,
              errorBuilder: (_, _, _) =>
                  Icon(Icons.emoji_events, color: accentColor, size: 28),
            )
          else
            Icon(Icons.emoji_events, color: accentColor, size: 24),
          const SizedBox(height: 6),
          // Avatar circle
          Container(
            width: rank == 1 ? 44 : 36,
            height: rank == 1 ? 44 : 36,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: accentColor.withValues(alpha: 0.15),
              border: Border.all(color: accentColor, width: 2),
            ),
            child: Center(
              child: Text(
                entry.username.substring(0, 1).toUpperCase(),
                style: TextStyle(
                  fontSize: rank == 1 ? 18 : 14,
                  fontWeight: FontWeight.w800,
                  color: accentColor,
                ),
              ),
            ),
          ),
          const SizedBox(height: 6),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: Text(
              entry.username,
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: AppColors.foreground,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            '\$${_formatScore(entry.score)}',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: accentColor,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMyRank(MyRank rank) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.accent.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(12),
        border:
            Border.all(color: AppColors.accent.withValues(alpha: 0.3)),
      ),
      child: Row(
        children: [
          const Icon(Icons.person, color: AppColors.accent),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Your Position',
                  style: TextStyle(
                    fontSize: 12,
                    color: AppColors.mutedForeground,
                  ),
                ),
                Text(
                  '#${rank.position}',
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    color: AppColors.accent,
                  ),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              const Text(
                'Wagered',
                style: TextStyle(
                  fontSize: 12,
                  color: AppColors.mutedForeground,
                ),
              ),
              Text(
                '\$${rank.score.toStringAsFixed(0)}',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: AppColors.foreground,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTable(List<LeaderboardEntry> entries) {
    if (entries.isEmpty) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(32),
          child: Text('No data yet',
              style: TextStyle(color: AppColors.mutedForeground)),
        ),
      );
    }

    return Container(
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          // Header
          Padding(
            padding:
                const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            child: Row(
              children: const [
                SizedBox(
                    width: 36,
                    child: Text('#',
                        style: TextStyle(
                            fontSize: 12,
                            color: AppColors.mutedForeground,
                            fontWeight: FontWeight.w600))),
                Expanded(
                    child: Text('Player',
                        style: TextStyle(
                            fontSize: 12,
                            color: AppColors.mutedForeground,
                            fontWeight: FontWeight.w600))),
                SizedBox(
                    width: 90,
                    child: Text('Wagered',
                        textAlign: TextAlign.right,
                        style: TextStyle(
                            fontSize: 12,
                            color: AppColors.mutedForeground,
                            fontWeight: FontWeight.w600))),
              ],
            ),
          ),
          const Divider(height: 1, color: AppColors.border),
          ...entries.asMap().entries.map((entry) {
            final rank = entry.key + 1;
            final player = entry.value;
            return _buildRow(rank, player);
          }),
        ],
      ),
    );
  }

  Widget _buildRow(int rank, LeaderboardEntry player) {
    final Color? rankColor = rank == 1
        ? const Color(0xFFFACC15)
        : rank == 2
            ? Colors.grey[400]
            : rank == 3
                ? const Color(0xFFCD7F32)
                : null;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: rank <= 3
            ? rankColor?.withValues(alpha: 0.04)
            : null,
        border: Border(
          bottom: BorderSide(
            color: AppColors.border.withValues(alpha: 0.5),
          ),
        ),
      ),
      child: Row(
        children: [
          SizedBox(
            width: 36,
            child: rank <= 3
                ? Icon(
                    Icons.emoji_events,
                    size: 20,
                    color: rankColor,
                  )
                : Text(
                    '$rank',
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppColors.foreground,
                    ),
                  ),
          ),
          Expanded(
            child: Text(
              player.username,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: AppColors.foreground,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          SizedBox(
            width: 90,
            child: Text(
              '\$${_formatScore(player.score)}',
              textAlign: TextAlign.right,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: rankColor ?? AppColors.primary,
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _formatScore(double score) {
    if (score >= 1000000) {
      return '${(score / 1000000).toStringAsFixed(1)}M';
    }
    if (score >= 1000) {
      return '${(score / 1000).toStringAsFixed(1)}K';
    }
    return score.toStringAsFixed(0);
  }
}
