import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/empty_state.dart';
import '../../../core/widgets/error_state.dart';
import '../../../core/widgets/loading_state.dart';
import '../providers/games_provider.dart';
import '../widgets/game_card.dart';

class FavoritesScreen extends ConsumerWidget {
  const FavoritesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final favoriteIds = ref.watch(favoritesProvider);
    final filter = const GamesFilter();
    final gamesAsync = ref.watch(gamesProvider(filter));

    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Text(
              'Favorites (${favoriteIds.length})',
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: AppColors.foreground,
              ),
            ),
          ),
        ),
        if (favoriteIds.isEmpty)
          const SliverEmptyState(
            icon: Icons.favorite_border,
            title: 'No favorites yet',
            subtitle: 'Tap the heart icon on any game to add it here',
          )
        else
          gamesAsync.when(
            data: (paginated) {
              final favGames = paginated.data
                  .where((g) => favoriteIds.contains(g.id))
                  .toList();
              return SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                sliver: SliverGrid(
                  gridDelegate:
                      const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    mainAxisSpacing: 12,
                    crossAxisSpacing: 12,
                    childAspectRatio: 4 / 3,
                  ),
                  delegate: SliverChildBuilderDelegate(
                    (_, index) => GameCard(game: favGames[index]),
                    childCount: favGames.length,
                  ),
                ),
              );
            },
            loading: () => const SliverLoadingState(useShimmer: true),
            error: (_, _) => SliverErrorState(
              message: 'Failed to load games',
              onRetry: () => ref.invalidate(gamesProvider(filter)),
            ),
          ),
      ],
    );
  }
}
