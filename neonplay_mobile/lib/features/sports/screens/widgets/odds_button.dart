import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/theme/app_colors.dart';
import '../../models/sports_models.dart';
import '../../providers/betslip_provider.dart';

/// Tappable odds button that adds/removes a selection to the betslip.
class OddsButton extends ConsumerWidget {
  final OddModel odd;
  final MatchModel match;
  final MarketModel market;

  const OddsButton({
    super.key,
    required this.odd,
    required this.match,
    required this.market,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final betslip = ref.watch(betslipProvider);
    final isSelected = betslip.selections.any(
      (s) => s.matchId == match.id && s.oddId == odd.id,
    );

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () {
          HapticFeedback.lightImpact();
          if (isSelected) {
            ref.read(betslipProvider.notifier).removeSelection(match.id);
          } else {
            final homeName = match.homeTeam.name;
            final awayName = match.awayTeam.name;
            ref.read(betslipProvider.notifier).addSelection(
                  BetSelectionModel(
                    matchId: match.id,
                    marketId: market.id,
                    oddId: odd.id,
                    selection: odd.selection,
                    oddsAtPlacement: odd.value,
                    matchName: '$homeName vs $awayName',
                    market: market.name,
                    league: match.league?.name,
                    homeTeam: match.homeTeam,
                    awayTeam: match.awayTeam,
                  ),
                );
          }
        },
        borderRadius: BorderRadius.circular(8),
        splashColor: AppColors.primary.withValues(alpha: 0.2),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.primary : AppColors.card,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: isSelected ? AppColors.primary : AppColors.border,
            ),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                odd.selection,
                style: TextStyle(
                  fontSize: 10,
                  color: isSelected
                      ? AppColors.primaryForeground
                      : AppColors.mutedForeground,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                odd.value.toStringAsFixed(2),
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: isSelected
                      ? AppColors.primaryForeground
                      : AppColors.foreground,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
