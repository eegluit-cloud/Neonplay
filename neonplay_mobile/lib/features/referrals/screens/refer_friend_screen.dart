import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_gradients.dart';
import '../providers/referrals_provider.dart';

/// Refer a friend screen matching ReferFriend.tsx layout.
class ReferFriendScreen extends ConsumerWidget {
  const ReferFriendScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final codeAsync = ref.watch(referralCodeProvider);
    final statsAsync = ref.watch(referralStatsProvider);

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Hero banner with character and reward badges
        _buildHeroBanner(),
        const SizedBox(height: 20),

        // Referral code section
        _buildSectionTitle('Generate Your Unique Referral Link'),
        const SizedBox(height: 10),
        codeAsync.when(
          data: (code) => _buildCodeCard(context, code),
          loading: () => const SizedBox(
            height: 56,
            child: Center(child: CircularProgressIndicator()),
          ),
          error: (_, _) => const Text('Failed to load code',
              style: TextStyle(color: AppColors.mutedForeground)),
        ),
        const SizedBox(height: 24),

        // Benefits grid
        _buildSectionTitle('Earn Rewards Instantly'),
        const SizedBox(height: 12),
        _buildBenefitsGrid(),
        const SizedBox(height: 24),

        // Stats bar
        statsAsync.when(
          data: (stats) => _buildStatsBar(stats),
          loading: () => const SizedBox(
            height: 80,
            child: Center(child: CircularProgressIndicator()),
          ),
          error: (_, _) => const SizedBox.shrink(),
        ),
        const SizedBox(height: 24),

        // Referrals table
        statsAsync.when(
          data: (stats) {
            final referrals =
                (stats['referrals'] as List<dynamic>?) ?? [];
            if (referrals.isEmpty) return const SizedBox.shrink();
            return _buildReferralsTable(referrals);
          },
          loading: () => const SizedBox.shrink(),
          error: (_, _) => const SizedBox.shrink(),
        ),
      ],
    );
  }

  Widget _buildHeroBanner() {
    return Container(
      height: 200,
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Stack(
        children: [
          // Background image
          Positioned.fill(
            child: Image.asset(
              'assets/images/banners/refer-banner-bg.jpg',
              fit: BoxFit.cover,
              errorBuilder: (_, _, _) => Container(
                decoration: const BoxDecoration(gradient: AppGradients.primary),
              ),
            ),
          ),
          // Gradient overlay
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.centerLeft,
                  end: Alignment.centerRight,
                  colors: [
                    Colors.black.withValues(alpha: 0.80),
                    Colors.black.withValues(alpha: 0.40),
                  ],
                ),
              ),
            ),
          ),
          // Character image on right
          Positioned(
            right: -10,
            bottom: 0,
            child: Image.asset(
              'assets/images/characters/refer-hero.png',
              height: 190,
              errorBuilder: (_, _, _) => const SizedBox.shrink(),
            ),
          ),
          // Left content: title + reward badges
          Positioned(
            left: 16,
            top: 20,
            bottom: 20,
            right: 120,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text(
                  'Refer a Friend',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Share your code and earn rewards!',
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.white.withValues(alpha: 0.8),
                  ),
                ),
                const SizedBox(height: 16),
                // Reward badges
                Row(
                  children: [
                    _buildRewardBadge('\$100', 'You Earn'),
                    const SizedBox(width: 10),
                    _buildRewardBadge('\$100', 'They Earn'),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRewardBadge(String amount, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        gradient: AppGradients.gold,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        children: [
          Text(
            amount,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: Colors.white,
            ),
          ),
          Text(
            label,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w600,
              color: Colors.white.withValues(alpha: 0.9),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.w700,
        color: AppColors.foreground,
      ),
    );
  }

  Widget _buildCodeCard(BuildContext context, String code) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Expanded(
            child: Text(
              code,
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w800,
                color: AppColors.primary,
                letterSpacing: 2,
              ),
            ),
          ),
          Container(
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: IconButton(
              icon: const Icon(Icons.copy, color: AppColors.primary, size: 20),
              onPressed: () {
                Clipboard.setData(ClipboardData(text: code));
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Code copied!')),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBenefitsGrid() {
    const items = [
      ('Share Link', 'Send your unique referral link to friends', Icons.share),
      ('Friends Join', 'They sign up using your referral code', Icons.person_add),
      ('Both Earn', 'You both receive \$100 in bonus credits', Icons.card_giftcard),
      ('Level Up', 'More referrals unlock bigger VIP rewards', Icons.emoji_events),
    ];

    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 10,
      mainAxisSpacing: 10,
      childAspectRatio: 1.5,
      children: items.map((item) => Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.card,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(item.$3, color: AppColors.primary, size: 22),
                const SizedBox(height: 8),
                Text(
                  item.$1,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: AppColors.foreground,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  item.$2,
                  style: const TextStyle(
                    fontSize: 10,
                    color: AppColors.mutedForeground,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          )).toList(),
    );
  }

  Widget _buildStatsBar(Map<String, dynamic> stats) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          _buildStatItem(
            'Total Referrals',
            '${stats['totalReferrals'] ?? 0}',
            Icons.people,
          ),
          Container(
            width: 1,
            height: 40,
            color: AppColors.border,
            margin: const EdgeInsets.symmetric(horizontal: 16),
          ),
          _buildStatItem(
            'Total Earnings',
            '\$${(stats['totalEarnings'] as num?)?.toStringAsFixed(0) ?? '0'}',
            Icons.attach_money,
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, String value, IconData icon) {
    return Expanded(
      child: Row(
        children: [
          Icon(icon, color: AppColors.primary, size: 20),
          const SizedBox(width: 10),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                value,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: AppColors.foreground,
                ),
              ),
              Text(
                label,
                style: const TextStyle(
                  fontSize: 11,
                  color: AppColors.mutedForeground,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildReferralsTable(List<dynamic> referrals) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionTitle('Your Referrals'),
        const SizedBox(height: 12),
        Container(
          decoration: BoxDecoration(
            color: AppColors.card,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            children: [
              // Header
              Padding(
                padding: const EdgeInsets.symmetric(
                    horizontal: 14, vertical: 12),
                child: Row(
                  children: const [
                    Expanded(
                      flex: 3,
                      child: Text('Player',
                          style: TextStyle(
                              fontSize: 12,
                              color: AppColors.mutedForeground,
                              fontWeight: FontWeight.w600)),
                    ),
                    Expanded(
                      flex: 2,
                      child: Text('Wagered',
                          textAlign: TextAlign.right,
                          style: TextStyle(
                              fontSize: 12,
                              color: AppColors.mutedForeground,
                              fontWeight: FontWeight.w600)),
                    ),
                    SizedBox(
                      width: 50,
                      child: Text('VIP',
                          textAlign: TextAlign.right,
                          style: TextStyle(
                              fontSize: 12,
                              color: AppColors.mutedForeground,
                              fontWeight: FontWeight.w600)),
                    ),
                  ],
                ),
              ),
              const Divider(height: 1, color: AppColors.border),
              ...referrals.map((r) {
                final username = (r as Map)['username'] ?? 'Unknown';
                final wagered = (r['wagered'] as num?)?.toDouble() ?? 0;
                final vipLevel = r['vipLevel'] ?? 0;
                return Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 14, vertical: 12),
                  decoration: BoxDecoration(
                    border: Border(
                      bottom: BorderSide(
                        color: AppColors.border.withValues(alpha: 0.5),
                      ),
                    ),
                  ),
                  child: Row(
                    children: [
                      // Avatar
                      Container(
                        width: 28,
                        height: 28,
                        decoration: const BoxDecoration(
                          color: AppColors.muted,
                          shape: BoxShape.circle,
                        ),
                        child: Center(
                          child: Text(
                            (username as String).substring(0, 1).toUpperCase(),
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: AppColors.foreground,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        flex: 3,
                        child: Text(
                          username,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                            color: AppColors.foreground,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      Expanded(
                        flex: 2,
                        child: Text(
                          '\$${wagered.toStringAsFixed(0)}',
                          textAlign: TextAlign.right,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primary,
                          ),
                        ),
                      ),
                      SizedBox(
                        width: 50,
                        child: Text(
                          'Lv.$vipLevel',
                          textAlign: TextAlign.right,
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppColors.mutedForeground,
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              }),
            ],
          ),
        ),
      ],
    );
  }
}
