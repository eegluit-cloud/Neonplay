import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_gradients.dart';
import '../../games/models/game_models.dart';
import '../../games/providers/games_provider.dart';
import '../../games/widgets/games_section.dart';
import '../../sports/models/sports_models.dart';
import '../../sports/providers/sports_provider.dart';
import '../../sports/screens/widgets/team_logo.dart';
import '../providers/lobby_provider.dart';
import 'widgets/hero_banner.dart';
import 'widgets/leaderboard_widget.dart';
import 'widgets/lobby_mode_switcher.dart';
import 'widgets/providers_carousel.dart';
import 'widgets/recent_wins_ticker.dart';

/// Main lobby / home screen assembling all sections.
class LobbyScreen extends ConsumerWidget {
  const LobbyScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final mode = ref.watch(lobbyModeProvider);
    final showCasino = mode == 'all' || mode == 'casino';
    final showSports = mode == 'all' || mode == 'sports';

    return RefreshIndicator(
      color: AppColors.primary,
      backgroundColor: AppColors.card,
      onRefresh: () async {
        // Invalidate providers to force refresh
        ref.invalidate(bannersProvider);
        if (showCasino) {
          ref.invalidate(allGamesProvider);
          ref.invalidate(gameProvidersProvider);
        }
        if (showSports) {
          ref.invalidate(featuredMatchesProvider);
        }
      },
      child: ListView(
        children: [
          const SizedBox(height: 12),

          // Hero banner carousel
          const HeroBanner(),
          const SizedBox(height: 20),

          // Mode switcher: All / Casino / Sports
          const LobbyModeSwitcher(),
          const SizedBox(height: 20),

          // Recent wins ticker (casino mode)
          if (showCasino) ...[
            const RecentWinsTicker(),
            const SizedBox(height: 24),
          ],

          // Sports highlights (sports mode)
          if (showSports) ...[
            _LiveSportsHighlights(),
            const SizedBox(height: 24),
          ],

          // Hot games section
          if (showCasino) ...[
            _GamesSectionFromProvider(
              title: 'Hot Games',
              provider: hotGamesProvider,
              seeAllRoute: '/hot-games',
              icon: Icons.local_fire_department,
              iconColor: AppColors.casinoOrange,
            ).animate().fadeIn(duration: 400.ms, delay: 100.ms).slideY(begin: 0.03, end: 0, duration: 400.ms, delay: 100.ms),
            const SizedBox(height: 24),
          ],

          // New releases section
          if (showCasino) ...[
            _GamesSectionFromProvider(
              title: 'New Releases',
              provider: newGamesProvider,
              seeAllRoute: '/new-releases',
              icon: Icons.new_releases,
              iconColor: AppColors.primary,
            ).animate().fadeIn(duration: 400.ms, delay: 200.ms).slideY(begin: 0.03, end: 0, duration: 400.ms, delay: 200.ms),
            const SizedBox(height: 24),
          ],

          // Featured games section
          if (showCasino) ...[
            _GamesSectionFromProvider(
              title: 'Featured',
              provider: featuredGamesProvider,
              seeAllRoute: '/featured',
              icon: Icons.star,
              iconColor: AppColors.accent,
            ).animate().fadeIn(duration: 400.ms, delay: 300.ms).slideY(begin: 0.03, end: 0, duration: 400.ms, delay: 300.ms),
            const SizedBox(height: 24),
          ],

          // Providers carousel
          if (showCasino) ...[
            const ProvidersCarousel()
                .animate()
                .fadeIn(duration: 400.ms, delay: 400.ms),
            const SizedBox(height: 24),
          ],

          // Leaderboard
          const LeaderboardWidget()
              .animate()
              .fadeIn(duration: 400.ms, delay: 500.ms)
              .slideY(begin: 0.03, end: 0, duration: 400.ms, delay: 500.ms),
          const SizedBox(height: 32),
        ],
      ),
    );
  }

}

/// Helper widget that loads games from a FutureProvider and renders a GamesSection.
class _GamesSectionFromProvider extends ConsumerWidget {
  final String title;
  final FutureProvider<List<GameModel>> provider;
  final String? seeAllRoute;
  final IconData icon;
  final Color iconColor;

  const _GamesSectionFromProvider({
    required this.title,
    required this.provider,
    this.seeAllRoute,
    required this.icon,
    required this.iconColor,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final gamesAsync = ref.watch(provider);

    return gamesAsync.when(
      data: (games) => GamesSection(
        title: title,
        games: games,
        seeAllRoute: seeAllRoute,
      ),
      loading: () => _buildLoadingSkeleton(),
      error: (_, _) => const SizedBox.shrink(),
    );
  }

  Widget _buildLoadingSkeleton() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            children: [
              Icon(icon, size: 18, color: iconColor),
              const SizedBox(width: 8),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: AppColors.foreground,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 140,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: 4,
            separatorBuilder: (_, _) => const SizedBox(width: 12),
            itemBuilder: (_, _) => Container(
              width: 180,
              decoration: BoxDecoration(
                color: AppColors.muted,
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

/// Live sports highlights section for the lobby.
class _LiveSportsHighlights extends ConsumerWidget {
  const _LiveSportsHighlights();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final highlightsAsync = ref.watch(featuredMatchesProvider);

    return highlightsAsync.when(
      data: (highlights) {
        if (highlights.isEmpty) return const SizedBox.shrink();
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  const Icon(Icons.sports_soccer, size: 18, color: AppColors.primary),
                  const SizedBox(width: 8),
                  const Text(
                    'Live Sports',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: AppColors.foreground,
                    ),
                  ),
                  const Spacer(),
                  GestureDetector(
                    onTap: () => context.go('/sports'),
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
            SizedBox(
              height: 140,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: highlights.length,
                separatorBuilder: (_, _) => const SizedBox(width: 12),
                itemBuilder: (_, index) =>
                    _LobbyHighlightCard(match: highlights[index]),
              ),
            ),
          ],
        );
      },
      loading: () => const SizedBox(height: 140),
      error: (_, _) => const SizedBox.shrink(),
    );
  }
}

/// Compact highlight card for the lobby sports section.
class _LobbyHighlightCard extends StatelessWidget {
  final MatchModel match;

  const _LobbyHighlightCard({required this.match});

  @override
  Widget build(BuildContext context) {
    final isLive = match.status == 'live';
    final odds =
        match.markets.isNotEmpty ? match.markets.first.odds : <OddModel>[];

    return Container(
      width: 220,
      padding: const EdgeInsets.all(12),
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
                  padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                  decoration: BoxDecoration(
                    color: AppColors.destructive,
                    borderRadius: BorderRadius.circular(3),
                  ),
                  child: const Text(
                    'LIVE',
                    style: TextStyle(
                        fontSize: 8,
                        fontWeight: FontWeight.w800,
                        color: Colors.white),
                  ),
                ),
                const SizedBox(width: 6),
              ],
              Expanded(
                child: Text(
                  match.league?.name ?? '',
                  style: const TextStyle(
                      fontSize: 10, color: AppColors.mutedForeground),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const Spacer(),
          // Teams
          Row(
            children: [
              TeamLogo(
                teamName: match.homeTeam.name,
                logoUrl: match.homeTeam.logoUrl,
                size: 18,
              ),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  match.homeTeam.shortName ?? match.homeTeam.name,
                  style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: AppColors.foreground),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              if (isLive)
                Text(
                  '${match.homeScore ?? 0}',
                  style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                      color: AppColors.foreground),
                ),
            ],
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              TeamLogo(
                teamName: match.awayTeam.name,
                logoUrl: match.awayTeam.logoUrl,
                size: 18,
              ),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  match.awayTeam.shortName ?? match.awayTeam.name,
                  style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: AppColors.foreground),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              if (isLive)
                Text(
                  '${match.awayScore ?? 0}',
                  style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                      color: AppColors.foreground),
                ),
            ],
          ),
          const Spacer(),
          // Odds
          if (odds.length >= 3)
            Row(
              children: [
                _LobbyOddChip(label: '1', value: odds[0].value),
                const SizedBox(width: 4),
                _LobbyOddChip(label: 'X', value: odds[1].value),
                const SizedBox(width: 4),
                _LobbyOddChip(label: '2', value: odds[2].value),
              ],
            ),
        ],
      ),
    );
  }
}

class _LobbyOddChip extends StatelessWidget {
  final String label;
  final double value;

  const _LobbyOddChip({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 4),
        decoration: BoxDecoration(
          color: AppColors.muted,
          borderRadius: BorderRadius.circular(4),
        ),
        child: Text(
          value.toStringAsFixed(2),
          textAlign: TextAlign.center,
          style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: AppColors.foreground),
        ),
      ),
    );
  }
}
