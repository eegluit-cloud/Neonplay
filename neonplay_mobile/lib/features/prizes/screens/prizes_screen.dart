import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_gradients.dart';
import '../../../core/widgets/empty_state.dart';
import '../../../core/widgets/error_state.dart';
import '../../../core/widgets/loading_state.dart';
import '../../../core/widgets/pull_to_refresh.dart';
import '../models/prize_models.dart';
import '../providers/prizes_provider.dart';

/// Position-specific accent colors matching Prizes.tsx.
const _positionColors = <int, Color>{
  1: Color(0xFFFACC15), // gold / yellow-400
  2: Color(0xFF9CA3AF), // silver / gray-400
  3: Color(0xFFFB923C), // bronze / orange-400
  4: Color(0xFF22D3EE), // cyan-400
  5: Color(0xFF22D3EE), // cyan-400
};

/// Prize store screen with period tabs and position-based cards.
class PrizesScreen extends ConsumerStatefulWidget {
  const PrizesScreen({super.key});

  @override
  ConsumerState<PrizesScreen> createState() => _PrizesScreenState();
}

class _PrizesScreenState extends ConsumerState<PrizesScreen> {
  String _selectedPeriod = 'monthly';

  @override
  Widget build(BuildContext context) {
    final prizesAsync = ref.watch(prizesProvider);

    return PullToRefresh(
      onRefresh: () async => ref.invalidate(prizesProvider),
      child: prizesAsync.when(
        data: (prizes) {
          if (prizes.isEmpty) {
            return const EmptyState(
              icon: Icons.redeem,
              title: 'No prizes available',
              subtitle: 'New prizes are added regularly',
            );
          }
          return _buildContent(prizes);
        },
        loading: () => const LoadingState(),
        error: (_, _) => ErrorState(
          message: 'Failed to load prizes',
          onRetry: () => ref.invalidate(prizesProvider),
        ),
      ),
    );
  }

  Widget _buildContent(List<PrizeModel> allPrizes) {
    final filtered = allPrizes
        .where((p) => p.category == _selectedPeriod)
        .toList();

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Hero banner
        _buildHeroBanner(),
        const SizedBox(height: 20),

        // Period tabs
        Row(
          children: ['daily', 'weekly', 'monthly'].map((p) {
            final isSelected = p == _selectedPeriod;
            return Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                child: GestureDetector(
                  onTap: () => setState(() => _selectedPeriod = p),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    decoration: BoxDecoration(
                      gradient: isSelected ? AppGradients.accent : null,
                      color: isSelected ? null : AppColors.card,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: isSelected
                            ? AppColors.primary
                            : AppColors.border,
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
        ),
        const SizedBox(height: 20),

        // Grand prize (1st place)
        if (filtered.isNotEmpty) ...[
          _buildGrandPrize(filtered.first),
          const SizedBox(height: 16),
        ],

        // Remaining prizes in a 2-col grid
        if (filtered.length > 1)
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              childAspectRatio: 0.72,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
            ),
            itemCount: filtered.length - 1,
            itemBuilder: (_, index) =>
                _buildPrizeCard(filtered[index + 1], index + 2),
          ),
      ],
    );
  }

  Widget _buildHeroBanner() {
    return Container(
      height: 140,
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Stack(
        children: [
          Positioned.fill(
            child: Image.asset(
              'assets/images/banners/winners-prizes-banner.png',
              fit: BoxFit.cover,
              errorBuilder: (_, _, _) => Container(
                decoration: const BoxDecoration(gradient: AppGradients.gold),
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
                    Colors.black.withValues(alpha: 0.75),
                    Colors.black.withValues(alpha: 0.30),
                  ],
                ),
              ),
            ),
          ),
          Positioned(
            left: 16,
            top: 0,
            bottom: 0,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.emoji_events,
                    color: Color(0xFFFACC15), size: 32),
                const SizedBox(height: 8),
                const Text(
                  'Leaderboard Prizes',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Compete and win amazing rewards',
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.white.withValues(alpha: 0.8),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGrandPrize(PrizeModel prize) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
            color: const Color(0xFFFACC15).withValues(alpha: 0.3)),
      ),
      child: Column(
        children: [
          // Crown + 1st place
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Image.asset(
                'assets/images/ui/crown-first-place.png',
                width: 28,
                height: 28,
                errorBuilder: (_, _, _) => const Icon(
                    Icons.emoji_events,
                    color: Color(0xFFFACC15),
                    size: 28),
              ),
              const SizedBox(width: 8),
              const Text(
                '1st Place - Grand Prize',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFFFACC15),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          // Prize image
          _buildPrizeImage(prize, size: 120),
          const SizedBox(height: 14),
          Text(
            prize.name,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: AppColors.foreground,
            ),
            textAlign: TextAlign.center,
          ),
          if (prize.description != null) ...[
            const SizedBox(height: 4),
            Text(
              prize.description!,
              style: const TextStyle(
                fontSize: 12,
                color: AppColors.mutedForeground,
              ),
              textAlign: TextAlign.center,
            ),
          ],
          if (prize.pointsCost != null) ...[
            const SizedBox(height: 10),
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
              decoration: BoxDecoration(
                color: const Color(0xFFFACC15).withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                '${prize.pointsCost} pts',
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFFFACC15),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildPrizeCard(PrizeModel prize, int position) {
    final accentColor = _positionColors[position] ?? AppColors.primary;

    return Container(
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: accentColor.withValues(alpha: 0.25)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Position badge
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 6),
            color: accentColor.withValues(alpha: 0.1),
            child: Text(
              prize.tier ?? '${position}th Place',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: accentColor,
              ),
            ),
          ),
          const SizedBox(height: 10),
          // Image
          _buildPrizeImage(prize, size: 70),
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8),
            child: Text(
              prize.name,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: AppColors.foreground,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
            ),
          ),
          const Spacer(),
          if (prize.pointsCost != null)
            Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Text(
                '${prize.pointsCost} pts',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: accentColor,
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildPrizeImage(PrizeModel prize, {required double size}) {
    if (prize.imageUrl != null && prize.imageUrl!.startsWith('assets/')) {
      return Image.asset(
        prize.imageUrl!,
        width: size,
        height: size,
        fit: BoxFit.contain,
        errorBuilder: (_, _, _) => _buildPlaceholderIcon(size),
      );
    }
    return _buildPlaceholderIcon(size);
  }

  Widget _buildPlaceholderIcon(double size) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: AppColors.muted,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Icon(Icons.redeem,
          color: AppColors.mutedForeground, size: size * 0.4),
    );
  }
}
