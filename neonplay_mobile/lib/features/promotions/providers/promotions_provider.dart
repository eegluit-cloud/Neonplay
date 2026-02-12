import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/providers/auth_provider.dart';
import '../models/promotion_model.dart';
import '../repositories/promotions_repository.dart';

final promotionsRepositoryProvider = Provider<PromotionsRepository>((ref) {
  return PromotionsRepository(ref.read(dioClientProvider));
});

/// Promotions list – falls back to simulated data matching Promotions.tsx.
final promotionsProvider = FutureProvider<List<PromotionModel>>((ref) async {
  try {
    final list = await ref.read(promotionsRepositoryProvider).getAll();
    if (list.isNotEmpty) return list;
  } catch (_) {}
  return _simulatedPromotions;
});

// ---------------------------------------------------------------------------
// Simulated promotions – matches Promotions.tsx hardcoded cards.
// ---------------------------------------------------------------------------
final _simulatedPromotions = <PromotionModel>[
  PromotionModel(
    id: 'promo-daily-spin',
    title: 'Daily Spin',
    description:
        'Spin the wheel every 24 hours for a chance to win up to \$1,000! Free spins available daily.',
    type: 'daily',
    bonusAmount: 1000,
    isActive: true,
  ),
  PromotionModel(
    id: 'promo-mega-jackpot',
    title: 'Mega Jackpot',
    description:
        'The jackpot is growing! 142 winners so far. Last winner took home \$523,000. Play any eligible game to enter.',
    type: 'jackpot',
    bonusAmount: 1234567.89,
    isActive: true,
  ),
  PromotionModel(
    id: 'promo-welcome',
    title: 'Welcome Bonus',
    description:
        'New players get a 200% deposit bonus up to \$1,000 on their first deposit! Start winning big today.',
    type: 'welcome',
    bonusPercentage: 200,
    bonusAmount: 1000,
    isActive: true,
  ),
  PromotionModel(
    id: 'promo-daily-bonus',
    title: 'Daily Bonus',
    description:
        'Claim your \$10 daily bonus every 24 hours. 1x play requirement, expires in 7 days.',
    type: 'daily',
    bonusAmount: 10,
    isActive: true,
  ),
  PromotionModel(
    id: 'promo-weekly-spins',
    title: 'Weekly Spins Bonus',
    description:
        'Get 100 Free Spins this week! Each spin valued at \$0.10, total value \$10. Claim before the timer runs out.',
    type: 'weekly',
    bonusAmount: 10,
    isActive: true,
  ),
  PromotionModel(
    id: 'promo-monthly-spins',
    title: 'Monthly Spins Bonus',
    description:
        'Exclusive 200 Free Spins for the month! Each spin valued at \$0.10, total value \$20. Limited time offer.',
    type: 'monthly',
    bonusAmount: 20,
    isActive: true,
  ),
  PromotionModel(
    id: 'promo-vip',
    title: 'VIP Rewards Program',
    description:
        'Join our VIP program and earn cashback, exclusive bonuses, and priority withdrawals. 5 tiers of rewards await!',
    type: 'vip',
    isActive: true,
  ),
  PromotionModel(
    id: 'promo-sports',
    title: 'Weekly Sports Bonus',
    description:
        'Bet \$50+ on sports this week and get a 100% bonus up to \$100! Valid on all sports markets.',
    type: 'sports',
    bonusPercentage: 100,
    bonusAmount: 100,
    isActive: true,
  ),
];
