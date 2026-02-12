import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../models/game_models.dart';
import '../providers/games_provider.dart';

class GameCard extends ConsumerWidget {
  final GameModel game;

  const GameCard({super.key, required this.game});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isFav = ref.watch(favoritesProvider).contains(game.id);

    return Container(
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      clipBehavior: Clip.antiAlias,
      child: Stack(
        children: [
          // Thumbnail
          Positioned.fill(
            child: game.thumbnailUrl != null
                ? CachedNetworkImage(
                    imageUrl: game.thumbnailUrl!,
                    fit: BoxFit.cover,
                    placeholder: (_, _) => _buildPlaceholder(),
                    errorWidget: (_, _, _) => _buildPlaceholder(),
                  )
                : _buildPlaceholder(),
          ),

          // Gradient overlay
          Positioned.fill(
            child: DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.transparent,
                    Colors.black.withValues(alpha: 0.7),
                  ],
                  stops: const [0.4, 1.0],
                ),
              ),
            ),
          ),

          // Provider badge
          if (game.provider != null)
            Positioned(
              top: 4,
              left: 4,
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.black.withValues(alpha: 0.6),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  game.provider!.name,
                  style:
                      const TextStyle(fontSize: 8, color: Colors.white70),
                ),
              ),
            ),

          // HOT / NEW badges
          if (game.isHot || game.isNew)
            Positioned(
              top: 4,
              right: 28,
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                decoration: BoxDecoration(
                  color: game.isHot
                      ? AppColors.casinoOrange
                      : AppColors.primary,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  game.isHot ? 'HOT' : 'NEW',
                  style: const TextStyle(
                    fontSize: 8,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                  ),
                ),
              ),
            ),

          // Favorite button
          Positioned(
            top: 2,
            right: 2,
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: () {
                  HapticFeedback.lightImpact();
                  ref.read(favoritesProvider.notifier).toggle(game.id);
                },
                borderRadius: BorderRadius.circular(14),
                child: Padding(
                  padding: const EdgeInsets.all(4),
                  child: Icon(
                    isFav ? Icons.favorite : Icons.favorite_border,
                    color: isFav ? AppColors.destructive : Colors.white70,
                    size: 18,
                  ),
                ),
              ),
            ),
          ),

          // Name
          Positioned(
            bottom: 6,
            left: 6,
            right: 6,
            child: Text(
              game.name,
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),

          // Tap overlay with ripple
          Positioned.fill(
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: () => context.go('/game/${game.slug}'),
                splashColor: AppColors.primary.withValues(alpha: 0.15),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPlaceholder() {
    return Container(
      color: AppColors.muted,
      child: const Center(
        child:
            Icon(Icons.casino, color: AppColors.mutedForeground, size: 28),
      ),
    );
  }
}
