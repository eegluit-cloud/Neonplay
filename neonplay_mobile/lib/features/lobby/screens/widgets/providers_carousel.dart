import 'dart:async';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../games/models/game_models.dart';
import '../../../games/providers/games_provider.dart';

/// Horizontal auto-scrolling carousel of game provider logos.
class ProvidersCarousel extends ConsumerStatefulWidget {
  const ProvidersCarousel({super.key});

  @override
  ConsumerState<ProvidersCarousel> createState() => _ProvidersCarouselState();
}

class _ProvidersCarouselState extends ConsumerState<ProvidersCarousel> {
  final ScrollController _scrollController = ScrollController();
  Timer? _scrollTimer;

  @override
  void dispose() {
    _scrollTimer?.cancel();
    _scrollController.dispose();
    super.dispose();
  }

  void _startAutoScroll() {
    _scrollTimer?.cancel();
    _scrollTimer = Timer.periodic(const Duration(milliseconds: 40), (_) {
      if (!mounted || !_scrollController.hasClients) return;
      final maxScroll = _scrollController.position.maxScrollExtent;
      final current = _scrollController.offset;
      if (current >= maxScroll) {
        _scrollController.jumpTo(0);
      } else {
        _scrollController.jumpTo(current + 0.4);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final providers = ref.watch(carouselProvidersProvider);
    if (providers.isEmpty) return const SizedBox.shrink();
    final looped = [...providers, ...providers];
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _startAutoScroll();
    });
    return _buildCarousel(looped);
  }

  Widget _buildCarousel(List<GameProviderModel> providers) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Game Providers',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: AppColors.foreground,
                ),
              ),
              GestureDetector(
                onTap: () => context.go('/providers'),
                child: const Text(
                  'See All',
                  style: TextStyle(
                    fontSize: 13,
                    color: AppColors.primary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 60,
          child: ListView.separated(
            controller: _scrollController,
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: providers.length,
            separatorBuilder: (_, _) => const SizedBox(width: 12),
            itemBuilder: (_, index) =>
                _buildProviderChip(providers[index]),
          ),
        ),
      ],
    );
  }

  Widget _buildProviderChip(GameProviderModel provider) {
    return GestureDetector(
      onTap: () => context.go('/providers/${provider.slug}'),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: AppColors.card,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.border),
        ),
        child: Center(
          child: provider.logoUrl != null
              ? provider.logoUrl!.startsWith('assets/')
                  ? Image.asset(
                      provider.logoUrl!,
                      height: 28,
                      fit: BoxFit.contain,
                      errorBuilder: (_, _, _) => Text(
                        provider.name,
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: AppColors.foreground,
                        ),
                      ),
                    )
                  : CachedNetworkImage(
                      imageUrl: provider.logoUrl!,
                      height: 28,
                      fit: BoxFit.contain,
                      errorWidget: (_, _, _) => Text(
                        provider.name,
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: AppColors.foreground,
                        ),
                      ),
                    )
              : Text(
                  provider.name,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: AppColors.foreground,
                  ),
                ),
        ),
      ),
    );
  }
}
