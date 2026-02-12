import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_gradients.dart';
import '../../../core/widgets/empty_state.dart';
import '../../../core/widgets/error_state.dart';
import '../../../core/widgets/loading_state.dart';
import '../../../core/widgets/pull_to_refresh.dart';
import '../models/promotion_model.dart';
import '../providers/promotions_provider.dart';

/// Promotions listing screen.
class PromotionsScreen extends ConsumerWidget {
  const PromotionsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final promosAsync = ref.watch(promotionsProvider);

    return PullToRefresh(
      onRefresh: () async => ref.invalidate(promotionsProvider),
      child: promosAsync.when(
        data: (promos) {
          if (promos.isEmpty) {
            return const EmptyState(
              icon: Icons.card_giftcard,
              title: 'No promotions available',
              subtitle: 'Check back later for exciting offers',
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: promos.length,
            separatorBuilder: (_, _) => const SizedBox(height: 12),
            itemBuilder: (_, index) => _PromoCard(promo: promos[index]),
          );
        },
        loading: () => const LoadingState(),
        error: (_, _) => ErrorState(
          message: 'Failed to load promotions',
          onRetry: () => ref.invalidate(promotionsProvider),
        ),
      ),
    );
  }
}

class _PromoCard extends StatelessWidget {
  final PromotionModel promo;

  const _PromoCard({required this.promo});

  @override
  Widget build(BuildContext context) {
    return Container(
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image banner
          if (promo.imageUrl != null)
            CachedNetworkImage(
              imageUrl: promo.imageUrl!,
              height: 140,
              width: double.infinity,
              fit: BoxFit.cover,
              errorWidget: (_, _, _) => Container(
                height: 140,
                decoration: const BoxDecoration(gradient: AppGradients.vip),
                child: const Center(
                  child: Icon(Icons.card_giftcard,
                      size: 40, color: Colors.white70),
                ),
              ),
            )
          else
            Container(
              height: 100,
              decoration: const BoxDecoration(gradient: AppGradients.vip),
              child: const Center(
                child:
                    Icon(Icons.card_giftcard, size: 40, color: Colors.white70),
              ),
            ),

          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  promo.title,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: AppColors.foreground,
                  ),
                ),
                if (promo.description != null) ...[
                  const SizedBox(height: 6),
                  Text(
                    promo.description!,
                    style: const TextStyle(
                      fontSize: 13,
                      color: AppColors.mutedForeground,
                      height: 1.4,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
                if (promo.bonusAmount != null || promo.bonusPercentage != null)
                  ...[
                  const SizedBox(height: 8),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.accent.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      promo.bonusPercentage != null
                          ? '${promo.bonusPercentage!.toStringAsFixed(0)}% Bonus'
                          : '\$${promo.bonusAmount!.toStringAsFixed(0)} Bonus',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: AppColors.accent,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}
