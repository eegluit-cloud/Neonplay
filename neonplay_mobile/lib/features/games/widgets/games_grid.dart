import 'package:flutter/material.dart';

import '../models/game_models.dart';
import 'game_card.dart';

class GamesGrid extends StatelessWidget {
  final List<GameModel> games;

  const GamesGrid({super.key, required this.games});

  @override
  Widget build(BuildContext context) {
    return SliverGrid(
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        mainAxisSpacing: 12,
        crossAxisSpacing: 12,
        childAspectRatio: 4 / 3,
      ),
      delegate: SliverChildBuilderDelegate(
        (context, index) => GameCard(game: games[index]),
        childCount: games.length,
      ),
    );
  }
}
