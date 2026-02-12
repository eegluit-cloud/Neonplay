import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../models/sports_models.dart';
import 'odds_button.dart';
import 'team_logo.dart';

/// Sports match card showing teams, score/time, and odds.
class EventCard extends StatelessWidget {
  final MatchModel match;

  const EventCard({super.key, required this.match});

  @override
  Widget build(BuildContext context) {
    final isLive = match.status == 'live';
    final market1x2 = match.markets.isEmpty
        ? null
        : match.markets.firstWhere(
            (m) => m.type == '1x2',
            orElse: () => match.markets.first,
          );

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isLive ? AppColors.success.withValues(alpha: 0.4) : AppColors.border,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // League + live badge
          Row(
            children: [
              if (match.league != null)
                Expanded(
                  child: Text(
                    match.league!.name,
                    style: const TextStyle(
                      fontSize: 11,
                      color: AppColors.mutedForeground,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              if (isLive)
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.success.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 6,
                        height: 6,
                        decoration: const BoxDecoration(
                          color: AppColors.success,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        match.liveMinute != null
                            ? "${match.liveMinute}'"
                            : 'LIVE',
                        style: const TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          color: AppColors.success,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
          const SizedBox(height: 10),

          // Teams
          Row(
            children: [
              Column(
                children: [
                  TeamLogo(
                    teamName: match.homeTeam.name,
                    logoUrl: match.homeTeam.logoUrl,
                    size: 28,
                  ),
                  const SizedBox(height: 4),
                  TeamLogo(
                    teamName: match.awayTeam.name,
                    logoUrl: match.awayTeam.logoUrl,
                    size: 28,
                  ),
                ],
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      match.homeTeam.name,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppColors.foreground,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      match.awayTeam.name,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppColors.foreground,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              if (isLive && match.homeScore != null && match.awayScore != null)
                Column(
                  children: [
                    Text(
                      '${match.homeScore}',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: AppColors.foreground,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${match.awayScore}',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: AppColors.foreground,
                      ),
                    ),
                  ],
                ),
            ],
          ),
          const SizedBox(height: 12),

          // Odds row
          if (market1x2 != null && market1x2.odds.isNotEmpty)
            Row(
              children: market1x2.odds
                  .take(3)
                  .map(
                    (odd) => Expanded(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 3),
                        child: OddsButton(
                          odd: odd,
                          match: match,
                          market: market1x2,
                        ),
                      ),
                    ),
                  )
                  .toList(),
            ),
        ],
      ),
    );
  }
}
