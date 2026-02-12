import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../models/game_models.dart';
import 'game_card.dart';

/// Horizontal scroll row of games with title and "See All" button.
class GamesSection extends StatelessWidget {
  final String title;
  final List<GameModel> games;
  final String? seeAllRoute;

  const GamesSection({
    super.key,
    required this.title,
    required this.games,
    this.seeAllRoute,
  });

  @override
  Widget build(BuildContext context) {
    if (games.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Header
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: AppColors.foreground,
                ),
              ),
              if (seeAllRoute != null)
                GestureDetector(
                  onTap: () => context.go(seeAllRoute!),
                  child: Text(
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
        const SizedBox(height: 12),

        // Horizontal scroll
        SizedBox(
          height: 140,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: games.length,
            separatorBuilder: (_, _) => const SizedBox(width: 12),
            itemBuilder: (_, index) => SizedBox(
              width: 180,
              child: GameCard(game: games[index]),
            ),
          ),
        ),
      ],
    );
  }
}
