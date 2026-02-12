import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/providers/auth_provider.dart';
import '../models/vip_models.dart';
import '../repositories/vip_repository.dart';

final vipRepositoryProvider = Provider<VipRepository>((ref) {
  return VipRepository(ref.read(dioClientProvider));
});

final vipLevelsProvider = FutureProvider<List<VipLevel>>((ref) async {
  try {
    final list = await ref.read(vipRepositoryProvider).getLevels();
    if (list.isNotEmpty) return list;
  } catch (_) {}
  return _simulatedLevels;
});

final vipStatusProvider = FutureProvider<VipStatus>((ref) async {
  try {
    return await ref.read(vipRepositoryProvider).getStatus();
  } catch (_) {}
  return const VipStatus(
    currentLevel: 2,
    levelName: 'Silver',
    currentXp: 2450,
    nextLevelXp: 5000,
    cashbackAvailable: 12.50,
  );
});

// ---------------------------------------------------------------------------
// Simulated VIP tiers – matches VIP.tsx level data.
// ---------------------------------------------------------------------------
const _simulatedLevels = <VipLevel>[
  VipLevel(
    id: 'v1',
    name: 'Starter',
    level: 1,
    xpRequired: 0,
    iconUrl: 'assets/images/badges/starter.png',
    cashbackPercentage: 0.5,
    benefits: ['Basic support', 'Daily free spins'],
  ),
  VipLevel(
    id: 'v2',
    name: 'Bronze',
    level: 2,
    xpRequired: 1000,
    iconUrl: 'assets/images/badges/bronze.png',
    cashbackPercentage: 1.0,
    benefits: ['Priority support', 'Weekly bonuses', '1% cashback'],
  ),
  VipLevel(
    id: 'v3',
    name: 'Silver',
    level: 3,
    xpRequired: 5000,
    iconUrl: 'assets/images/badges/silver.png',
    cashbackPercentage: 2.0,
    benefits: ['Dedicated account manager', 'Exclusive promotions', '2% cashback'],
  ),
  VipLevel(
    id: 'v4',
    name: 'Gold',
    level: 4,
    xpRequired: 25000,
    iconUrl: 'assets/images/badges/gold.png',
    cashbackPercentage: 3.5,
    benefits: ['VIP events access', 'Higher withdrawal limits', '3.5% cashback'],
  ),
  VipLevel(
    id: 'v5',
    name: 'Platinum',
    level: 5,
    xpRequired: 100000,
    iconUrl: 'assets/images/badges/platinum.png',
    cashbackPercentage: 5.0,
    benefits: ['Personal concierge', 'Custom bonuses', '5% cashback'],
  ),
  VipLevel(
    id: 'v6',
    name: 'Diamond',
    level: 6,
    xpRequired: 500000,
    iconUrl: 'assets/images/badges/diamond.png',
    cashbackPercentage: 7.5,
    benefits: ['Luxury gifts', 'Invite-only tournaments', '7.5% cashback'],
  ),
];
