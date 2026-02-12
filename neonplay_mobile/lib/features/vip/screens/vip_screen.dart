import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_gradients.dart';
import '../models/vip_models.dart';
import '../providers/vip_provider.dart';

/// Tier-specific color scheme matching VIP.tsx LEVEL_STYLE_MAP.
class _TierColors {
  final Color banner;
  final Color accent;
  final Color border;

  const _TierColors({
    required this.banner,
    required this.accent,
    required this.border,
  });
}

const _tierColorMap = <String, _TierColors>{
  'Starter': _TierColors(
    banner: Color(0xFF6B7280),
    accent: Color(0xFF9CA3AF),
    border: Color(0xFF4B5563),
  ),
  'Bronze': _TierColors(
    banner: Color(0xFFD97706),
    accent: Color(0xFFFBBF24),
    border: Color(0xFFB45309),
  ),
  'Silver': _TierColors(
    banner: Color(0xFF6B7280),
    accent: Color(0xFFD1D5DB),
    border: Color(0xFF9CA3AF),
  ),
  'Gold': _TierColors(
    banner: Color(0xFFCA8A04),
    accent: Color(0xFFFACC15),
    border: Color(0xFFA16207),
  ),
  'Platinum': _TierColors(
    banner: Color(0xFF475569),
    accent: Color(0xFFCBD5E1),
    border: Color(0xFF64748B),
  ),
  'Diamond': _TierColors(
    banner: Color(0xFF0891B2),
    accent: Color(0xFF22D3EE),
    border: Color(0xFF0E7490),
  ),
};

/// VIP levels and status screen.
class VipScreen extends ConsumerWidget {
  const VipScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statusAsync = ref.watch(vipStatusProvider);
    final levelsAsync = ref.watch(vipLevelsProvider);

    return RefreshIndicator(
      color: AppColors.primary,
      backgroundColor: AppColors.card,
      onRefresh: () async {
        ref.invalidate(vipStatusProvider);
        ref.invalidate(vipLevelsProvider);
      },
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Current status banner
          statusAsync.when(
            data: (status) => _buildStatusBanner(status),
            loading: () => const SizedBox(
              height: 180,
              child: Center(child: CircularProgressIndicator()),
            ),
            error: (_, _) => const SizedBox.shrink(),
          ),
          const SizedBox(height: 24),

          // Benefits section
          _buildBenefitsSection(),
          const SizedBox(height: 24),

          // VIP tiers
          const Text(
            'VIP Tiers',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: AppColors.foreground,
            ),
          ),
          const SizedBox(height: 12),
          levelsAsync.when(
            data: (levels) => Column(
              children: levels.map((l) => _buildTierCard(l)).toList(),
            ),
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (_, _) => const Text('Failed to load tiers',
                style: TextStyle(color: AppColors.mutedForeground)),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusBanner(VipStatus status) {
    final colors = _tierColorMap[status.levelName] ??
        const _TierColors(
          banner: Color(0xFF6B7280),
          accent: Color(0xFF9CA3AF),
          border: Color(0xFF4B5563),
        );
    final progress = status.nextLevelXp > 0
        ? (status.currentXp / status.nextLevelXp).clamp(0.0, 1.0)
        : 1.0;

    final badgeSlug = status.levelName.toLowerCase();
    final badgeAsset = 'assets/images/badges/$badgeSlug.png';

    return Container(
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: colors.border.withValues(alpha: 0.5)),
      ),
      child: Stack(
        children: [
          // Background image
          Positioned.fill(
            child: Image.asset(
              'assets/images/badges/vip-banner.jpg',
              fit: BoxFit.cover,
              errorBuilder: (_, _, _) => Container(
                decoration: const BoxDecoration(gradient: AppGradients.vip),
              ),
            ),
          ),
          // Dark overlay
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    colors.banner.withValues(alpha: 0.85),
                    Colors.black.withValues(alpha: 0.90),
                  ],
                ),
              ),
            ),
          ),
          // Content
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Image.asset(
                      badgeAsset,
                      width: 48,
                      height: 48,
                      errorBuilder: (_, _, _) => const Icon(
                        Icons.diamond,
                        color: Colors.white,
                        size: 48,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            status.levelName,
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.w800,
                              color: colors.accent,
                            ),
                          ),
                          Text(
                            'Level ${status.currentLevel}',
                            style: TextStyle(
                              fontSize: 13,
                              color: Colors.white.withValues(alpha: 0.7),
                            ),
                          ),
                        ],
                      ),
                    ),
                    if (status.cashbackAvailable != null &&
                        status.cashbackAvailable! > 0)
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: colors.accent.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                              color: colors.accent.withValues(alpha: 0.3)),
                        ),
                        child: Text(
                          '\$${status.cashbackAvailable!.toStringAsFixed(2)}',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: colors.accent,
                          ),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 18),
                // XP progress bar
                ClipRRect(
                  borderRadius: BorderRadius.circular(6),
                  child: Stack(
                    children: [
                      Container(
                        height: 10,
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(6),
                        ),
                      ),
                      FractionallySizedBox(
                        widthFactor: progress,
                        child: Container(
                          height: 10,
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [colors.accent, colors.border],
                            ),
                            borderRadius: BorderRadius.circular(6),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '${status.currentXp.toStringAsFixed(0)} / ${status.nextLevelXp.toStringAsFixed(0)} XP',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.white.withValues(alpha: 0.7),
                      ),
                    ),
                    Text(
                      '${(progress * 100).toStringAsFixed(0)}%',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: colors.accent,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBenefitsSection() {
    const benefits = [
      ('Exclusive Bonuses', 'Tiered rewards that grow with your level', Icons.card_giftcard),
      ('Priority Support', 'Dedicated VIP support team 24/7', Icons.support_agent),
      ('Higher Limits', 'Increased withdrawal and betting limits', Icons.trending_up),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'VIP Benefits',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: AppColors.foreground,
          ),
        ),
        const SizedBox(height: 12),
        ...benefits.map((b) => Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.card,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border),
              ),
              child: Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      gradient: AppGradients.vip,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(b.$3, color: Colors.white, size: 20),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          b.$1,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: AppColors.foreground,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          b.$2,
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppColors.mutedForeground,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            )),
      ],
    );
  }

  Widget _buildTierCard(VipLevel level) {
    final colors = _tierColorMap[level.name] ??
        const _TierColors(
          banner: Color(0xFF6B7280),
          accent: Color(0xFF9CA3AF),
          border: Color(0xFF4B5563),
        );

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: colors.border.withValues(alpha: 0.3)),
      ),
      child: Row(
        children: [
          if (level.iconUrl != null)
            Image.asset(
              level.iconUrl!,
              width: 44,
              height: 44,
              errorBuilder: (_, _, _) => _buildFallbackBadge(level, colors),
            )
          else
            _buildFallbackBadge(level, colors),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  level.name,
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: colors.accent,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  level.xpRequired > 0
                      ? '${_formatNumber(level.xpRequired)} XP required'
                      : 'Starting tier',
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.mutedForeground,
                  ),
                ),
                if (level.benefits.isNotEmpty) ...[
                  const SizedBox(height: 6),
                  Wrap(
                    spacing: 6,
                    runSpacing: 4,
                    children: level.benefits
                        .take(3)
                        .map((b) => Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: colors.accent.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                b,
                                style: TextStyle(
                                  fontSize: 10,
                                  color: colors.accent.withValues(alpha: 0.8),
                                ),
                              ),
                            ))
                        .toList(),
                  ),
                ],
              ],
            ),
          ),
          if (level.cashbackPercentage != null)
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: colors.accent.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                '${level.cashbackPercentage!.toStringAsFixed(1)}%',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: colors.accent,
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildFallbackBadge(VipLevel level, _TierColors colors) {
    return Container(
      width: 44,
      height: 44,
      decoration: BoxDecoration(
        color: colors.banner.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Center(
        child: Text(
          '${level.level}',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: colors.accent,
          ),
        ),
      ),
    );
  }

  String _formatNumber(double n) {
    if (n >= 1000000) return '${(n / 1000000).toStringAsFixed(0)}M';
    if (n >= 1000) return '${(n / 1000).toStringAsFixed(0)}K';
    return n.toStringAsFixed(0);
  }
}
