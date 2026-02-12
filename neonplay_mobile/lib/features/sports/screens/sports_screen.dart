import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_gradients.dart';
import '../models/sports_models.dart';
import '../providers/betslip_provider.dart';
import '../providers/sports_provider.dart';
import 'widgets/betslip_panel.dart';
import 'widgets/event_card.dart';

/// Main sports betting screen.
class SportsScreen extends ConsumerWidget {
  const SportsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final activeSport = ref.watch(activeSportProvider);
    final sportsAsync = ref.watch(sportsListProvider);
    final matchesAsync = ref.watch(matchesProvider);
    final highlightsAsync = ref.watch(featuredMatchesProvider);
    final betslip = ref.watch(betslipProvider);

    return Stack(
      children: [
        RefreshIndicator(
          color: AppColors.primary,
          backgroundColor: AppColors.card,
          onRefresh: () async {
            ref.invalidate(matchesProvider);
            ref.invalidate(liveMatchesProvider);
            ref.invalidate(featuredMatchesProvider);
            ref.invalidate(sportsListProvider);
          },
          child: CustomScrollView(
            slivers: [
              // Sport filter chips
              SliverToBoxAdapter(
                child: SizedBox(
                  height: 48,
                  child: sportsAsync.when(
                    data: (sports) => ListView.separated(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 8),
                      itemCount: sports.length + 1, // +1 for "All"
                      separatorBuilder: (_, _) => const SizedBox(width: 8),
                      itemBuilder: (_, index) {
                        if (index == 0) {
                          return _SportChip(
                            label: 'All',
                            icon: Icons.sports,
                            isActive: activeSport == null,
                            onTap: () => ref
                                .read(activeSportProvider.notifier)
                                .setSport(null),
                          );
                        }
                        final sport = sports[index - 1];
                        return _SportChip(
                          label: sport.name,
                          icon: _sportIcon(sport.slug),
                          isActive: activeSport == sport.slug,
                          onTap: () => ref
                              .read(activeSportProvider.notifier)
                              .setSport(sport.slug),
                        );
                      },
                    ),
                    loading: () => const SizedBox.shrink(),
                    error: (_, _) => const SizedBox.shrink(),
                  ),
                ),
              ),

              // Highlights carousel
              highlightsAsync.when(
                data: (highlights) {
                  if (highlights.isEmpty) {
                    return const SliverToBoxAdapter(child: SizedBox.shrink());
                  }
                  return SliverToBoxAdapter(
                    child: _HighlightsCarousel(matches: highlights),
                  );
                },
                loading: () =>
                    const SliverToBoxAdapter(child: SizedBox.shrink()),
                error: (_, _) =>
                    const SliverToBoxAdapter(child: SizedBox.shrink()),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 12)),

              // Section header
              const SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.symmetric(horizontal: 16),
                  child: Text(
                    'Events',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: AppColors.foreground,
                    ),
                  ),
                ),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 8)),

              // Matches
              matchesAsync.when(
                data: (result) {
                  if (result.data.isEmpty) {
                    return const SliverFillRemaining(
                      child: Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.sports,
                                size: 48, color: AppColors.mutedForeground),
                            SizedBox(height: 12),
                            Text(
                              'No matches available',
                              style: TextStyle(
                                  color: AppColors.mutedForeground,
                                  fontSize: 16),
                            ),
                          ],
                        ),
                      ),
                    );
                  }
                  return _buildMatchesList(result.data);
                },
                loading: () => const SliverFillRemaining(
                  child: Center(child: CircularProgressIndicator()),
                ),
                error: (_, _) => SliverFillRemaining(
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.error_outline,
                            size: 48, color: AppColors.destructive),
                        const SizedBox(height: 12),
                        const Text('Failed to load matches',
                            style:
                                TextStyle(color: AppColors.mutedForeground)),
                        const SizedBox(height: 12),
                        TextButton(
                          onPressed: () => ref.invalidate(matchesProvider),
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  ),
                ),
              ),

              // Bottom padding for betslip bar
              const SliverToBoxAdapter(child: SizedBox(height: 80)),
            ],
          ),
        ),

        // Floating betslip bar
        if (betslip.selections.isNotEmpty)
          Positioned(
            bottom: 0,
            left: 16,
            right: 16,
            child: _BetslipBar(
              count: betslip.selections.length,
              potentialWin: betslip.potentialWin,
              onTap: () => _openBetslip(context),
            ),
          ),
      ],
    );
  }

  SliverPadding _buildMatchesList(List<MatchModel> matches) {
    return SliverPadding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      sliver: SliverList.separated(
        itemCount: matches.length,
        separatorBuilder: (_, _) => const SizedBox(height: 10),
        itemBuilder: (_, index) => EventCard(match: matches[index]),
      ),
    );
  }

  void _openBetslip(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const BetslipPanel(),
    );
  }

  static IconData _sportIcon(String slug) {
    return switch (slug) {
      'soccer' => Icons.sports_soccer,
      'basketball' => Icons.sports_basketball,
      'tennis' => Icons.sports_tennis,
      'csgo' || 'dota' => Icons.sports_esports,
      'hockey' || 'ice-hockey' => Icons.sports_hockey,
      'tabletennis' => Icons.sports_tennis,
      'americanfootball' => Icons.sports_football,
      'handball' => Icons.sports_handball,
      'darts' => Icons.gps_fixed,
      _ => Icons.sports,
    };
  }
}

/// Individual sport filter chip.
class _SportChip extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool isActive;
  final VoidCallback onTap;

  const _SportChip({
    required this.label,
    required this.icon,
    required this.isActive,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14),
        decoration: BoxDecoration(
          color: isActive ? AppColors.primary : AppColors.card,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isActive ? AppColors.primary : AppColors.border,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon,
                size: 16,
                color: isActive
                    ? AppColors.primaryForeground
                    : AppColors.mutedForeground),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: isActive
                    ? AppColors.primaryForeground
                    : AppColors.mutedForeground,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Horizontal carousel of highlight/featured matches.
class _HighlightsCarousel extends StatelessWidget {
  final List<MatchModel> matches;

  const _HighlightsCarousel({required this.matches});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 12),
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 16),
          child: Text(
            'Highlights',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: AppColors.foreground,
            ),
          ),
        ),
        const SizedBox(height: 8),
        SizedBox(
          height: 160,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: matches.length,
            separatorBuilder: (_, _) => const SizedBox(width: 12),
            itemBuilder: (_, index) =>
                _HighlightCard(match: matches[index]),
          ),
        ),
      ],
    );
  }
}

/// A single highlight match card with gradient background.
class _HighlightCard extends StatelessWidget {
  final MatchModel match;

  const _HighlightCard({required this.match});

  @override
  Widget build(BuildContext context) {
    final isLive = match.status == 'live';
    final odds = match.markets.isNotEmpty ? match.markets.first.odds : <OddModel>[];

    return Container(
      width: 260,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        gradient: AppGradients.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isLive
              ? AppColors.primary.withValues(alpha: 0.5)
              : AppColors.border,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // League + live badge
          Row(
            children: [
              if (isLive) ...[
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.destructive,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: const Text(
                    'LIVE',
                    style: TextStyle(
                      fontSize: 9,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                    ),
                  ),
                ),
                const SizedBox(width: 6),
              ],
              Expanded(
                child: Text(
                  match.league?.name ?? '',
                  style: const TextStyle(
                    fontSize: 10,
                    color: AppColors.mutedForeground,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              if (isLive && match.liveMinute != null)
                Text(
                  "${match.liveMinute}' ${match.livePeriod ?? ''}",
                  style: const TextStyle(
                    fontSize: 10,
                    color: AppColors.primary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
            ],
          ),
          const Spacer(),
          // Teams + score
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      match.homeTeam.shortName ?? match.homeTeam.name,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: AppColors.foreground,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      match.awayTeam.shortName ?? match.awayTeam.name,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: AppColors.foreground,
                      ),
                    ),
                  ],
                ),
              ),
              if (isLive) ...[
                Column(
                  children: [
                    Text(
                      '${match.homeScore ?? 0}',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        color: AppColors.foreground,
                      ),
                    ),
                    Text(
                      '${match.awayScore ?? 0}',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        color: AppColors.foreground,
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
          const Spacer(),
          // Odds row
          if (odds.length >= 3)
            Row(
              children: [
                _OddChip(label: '1', value: odds[0].value),
                const SizedBox(width: 6),
                _OddChip(label: 'X', value: odds[1].value),
                const SizedBox(width: 6),
                _OddChip(label: '2', value: odds[2].value),
              ],
            ),
        ],
      ),
    );
  }
}

/// Small odds chip for highlight cards.
class _OddChip extends StatelessWidget {
  final String label;
  final double value;

  const _OddChip({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 6),
        decoration: BoxDecoration(
          color: AppColors.muted,
          borderRadius: BorderRadius.circular(6),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              label,
              style: const TextStyle(
                fontSize: 9,
                color: AppColors.mutedForeground,
                fontWeight: FontWeight.w600,
              ),
            ),
            Text(
              value.toStringAsFixed(2),
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: AppColors.foreground,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _BetslipBar extends StatelessWidget {
  final int count;
  final double potentialWin;
  final VoidCallback onTap;

  const _BetslipBar({
    required this.count,
    required this.potentialWin,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: AppColors.primary,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withValues(alpha: 0.3),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                '$count',
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                ),
              ),
            ),
            const SizedBox(width: 12),
            const Expanded(
              child: Text(
                'Betslip',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
              ),
            ),
            Text(
              '\$${potentialWin.toStringAsFixed(2)}',
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
            const SizedBox(width: 4),
            const Icon(Icons.keyboard_arrow_up, color: Colors.white, size: 20),
          ],
        ),
      ),
    );
  }
}
