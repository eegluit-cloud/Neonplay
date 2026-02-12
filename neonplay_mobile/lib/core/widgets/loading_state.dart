import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

import '../theme/app_colors.dart';

/// Reusable shimmer loading placeholder.
///
/// Can display as a full-screen centered spinner or shimmer skeleton rows.
class LoadingState extends StatelessWidget {
  final bool useShimmer;
  final int shimmerRows;

  const LoadingState({
    super.key,
    this.useShimmer = true,
    this.shimmerRows = 6,
  });

  @override
  Widget build(BuildContext context) {
    if (!useShimmer) {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.primary),
      );
    }

    return Shimmer.fromColors(
      baseColor: AppColors.card,
      highlightColor: AppColors.cardHover,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: List.generate(shimmerRows, (index) {
            // Alternate between wide and narrow rows for variety
            final isWide = index.isEven;
            return Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: Container(
                height: isWide ? 20 : 14,
                width: isWide
                    ? double.infinity
                    : MediaQuery.of(context).size.width * 0.6,
                decoration: BoxDecoration(
                  color: AppColors.card,
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
            );
          }),
        ),
      ),
    );
  }
}

/// Shimmer grid placeholder for game cards.
class ShimmerGameGrid extends StatelessWidget {
  final int itemCount;
  final int crossAxisCount;

  const ShimmerGameGrid({
    super.key,
    this.itemCount = 6,
    this.crossAxisCount = 2,
  });

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: AppColors.card,
      highlightColor: AppColors.cardHover,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: crossAxisCount,
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
            childAspectRatio: 4 / 3,
          ),
          itemCount: itemCount,
          itemBuilder: (_, _) => Container(
            decoration: BoxDecoration(
              color: AppColors.card,
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
      ),
    );
  }
}

/// Sliver variant of shimmer loading for use inside CustomScrollView.
class SliverLoadingState extends StatelessWidget {
  final bool useShimmer;

  const SliverLoadingState({super.key, this.useShimmer = false});

  @override
  Widget build(BuildContext context) {
    if (useShimmer) {
      return SliverToBoxAdapter(child: ShimmerGameGrid());
    }
    return const SliverFillRemaining(
      child: Center(
        child: CircularProgressIndicator(color: AppColors.primary),
      ),
    );
  }
}
