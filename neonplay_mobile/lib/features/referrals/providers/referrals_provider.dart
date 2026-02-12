import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/providers/auth_provider.dart';
import '../repositories/referrals_repository.dart';

final referralsRepositoryProvider = Provider<ReferralsRepository>((ref) {
  return ReferralsRepository(ref.read(dioClientProvider));
});

/// Referral code – falls back to simulated code matching ReferFriend.tsx.
final referralCodeProvider = FutureProvider<String>((ref) async {
  try {
    final code = await ref.read(referralsRepositoryProvider).getReferralCode();
    if (code.isNotEmpty) return code;
  } catch (_) {}
  return '625372';
});

/// Referral stats – falls back to simulated data matching ReferFriend.tsx.
final referralStatsProvider =
    FutureProvider<Map<String, dynamic>>((ref) async {
  try {
    final stats = await ref.read(referralsRepositoryProvider).getStats();
    if (stats.isNotEmpty) return stats;
  } catch (_) {}
  return {
    'totalReferrals': 4,
    'totalEarnings': 400.00,
    'referralReward': 100,
    'refereeReward': 100,
    'referrals': [
      {'username': 'Tony Stark', 'wagered': 2450.0, 'vipLevel': 1},
      {'username': 'Pepper Pots', 'wagered': 1830.0, 'vipLevel': 2},
      {'username': 'Steve', 'wagered': 975.0, 'vipLevel': 3},
      {'username': 'Robert', 'wagered': 540.0, 'vipLevel': 4},
    ],
  };
});
