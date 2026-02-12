import 'dart:async';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:video_player/video_player.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_gradients.dart';
import '../../models/banner_model.dart';
import '../../providers/lobby_provider.dart';

/// Auto-advancing hero banner carousel with video backgrounds.
class HeroBanner extends ConsumerStatefulWidget {
  const HeroBanner({super.key});

  @override
  ConsumerState<HeroBanner> createState() => _HeroBannerState();
}

class _HeroBannerState extends ConsumerState<HeroBanner> {
  final PageController _pageController = PageController();
  Timer? _autoAdvanceTimer;
  int _currentPage = 0;

  /// Video controllers keyed by banner index.
  final Map<int, VideoPlayerController> _videoControllers = {};

  @override
  void dispose() {
    _autoAdvanceTimer?.cancel();
    _pageController.dispose();
    for (final c in _videoControllers.values) {
      c.dispose();
    }
    super.dispose();
  }

  void _startAutoAdvance(int pageCount) {
    _autoAdvanceTimer?.cancel();
    if (pageCount <= 1) return;
    _autoAdvanceTimer = Timer.periodic(const Duration(seconds: 7), (_) {
      if (!mounted) return;
      final next = (_currentPage + 1) % pageCount;
      _pageController.animateToPage(
        next,
        duration: const Duration(milliseconds: 500),
        curve: Curves.easeInOut,
      );
    });
  }

  /// Initialise a video controller for [index] if the banner has a video.
  void _ensureVideo(int index, BannerModel banner) {
    if (banner.videoUrl == null) return;
    if (_videoControllers.containsKey(index)) return;

    final isAsset = banner.videoUrl!.startsWith('assets/');
    final controller = isAsset
        ? VideoPlayerController.asset(banner.videoUrl!)
        : VideoPlayerController.networkUrl(Uri.parse(banner.videoUrl!));

    controller
      ..setLooping(true)
      ..setVolume(0)
      ..initialize().then((_) {
        if (mounted) {
          controller.play();
          setState(() {});
        }
      });

    _videoControllers[index] = controller;
  }

  @override
  Widget build(BuildContext context) {
    final bannersAsync = ref.watch(bannersProvider);

    return bannersAsync.when(
      data: (banners) {
        if (banners.isEmpty) return const SizedBox(height: 200);
        // Pre-init all video controllers.
        for (var i = 0; i < banners.length; i++) {
          _ensureVideo(i, banners[i]);
        }
        _startAutoAdvance(banners.length);
        return _buildCarousel(banners);
      },
      loading: () => const SizedBox(height: 200),
      error: (_, _) => const SizedBox(height: 200),
    );
  }

  Widget _buildCarousel(List<BannerModel> banners) {
    return SizedBox(
      height: 200,
      child: Stack(
        children: [
          PageView.builder(
            controller: _pageController,
            itemCount: banners.length,
            onPageChanged: (index) {
              setState(() => _currentPage = index);
            },
            itemBuilder: (_, index) =>
                _buildBannerSlide(banners[index], index),
          ),
          // Dots indicator
          if (banners.length > 1)
            Positioned(
              bottom: 12,
              left: 0,
              right: 0,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(
                  banners.length,
                  (i) => Container(
                    width: i == _currentPage ? 20 : 8,
                    height: 8,
                    margin: const EdgeInsets.symmetric(horizontal: 3),
                    decoration: BoxDecoration(
                      color: i == _currentPage
                          ? AppColors.primary
                          : AppColors.mutedForeground.withValues(alpha: 0.4),
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildBannerSlide(BannerModel banner, int index) {
    final hasVideo = _videoControllers.containsKey(index) &&
        _videoControllers[index]!.value.isInitialized;
    final isLocalImage =
        banner.imageUrl != null && banner.imageUrl!.startsWith('assets/');

    return GestureDetector(
      onTap: () {
        if (banner.linkUrl != null && banner.linkUrl!.startsWith('/')) {
          context.go(banner.linkUrl!);
        }
      },
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border),
        ),
        clipBehavior: Clip.antiAlias,
        child: Stack(
          fit: StackFit.expand,
          children: [
            // Background — video or image fallback
            if (hasVideo)
              _buildVideoBackground(_videoControllers[index]!)
            else if (banner.imageUrl != null)
              isLocalImage
                  ? Image.asset(
                      banner.imageUrl!,
                      fit: BoxFit.cover,
                      errorBuilder: (_, _, _) => Container(
                        decoration: const BoxDecoration(
                            gradient: AppGradients.hero),
                      ),
                    )
                  : CachedNetworkImage(
                      imageUrl: banner.imageUrl!,
                      fit: BoxFit.cover,
                      placeholder: (_, _) => Container(
                        decoration: const BoxDecoration(
                            gradient: AppGradients.hero),
                      ),
                      errorWidget: (_, _, _) => Container(
                        decoration: const BoxDecoration(
                            gradient: AppGradients.hero),
                      ),
                    )
            else
              Container(
                decoration: const BoxDecoration(gradient: AppGradients.hero),
              ),

            // Glass overlay — left-to-right dark gradient
            Positioned.fill(
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.centerLeft,
                    end: Alignment.centerRight,
                    colors: [
                      Colors.black.withValues(alpha: 0.65),
                      Colors.black.withValues(alpha: 0.20),
                    ],
                  ),
                ),
              ),
            ),

            // Text: amber subtitle + gold gradient title
            Positioned(
              bottom: 28,
              left: 16,
              right: 16,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (banner.subtitle != null) ...[
                    Text(
                      banner.subtitle!,
                      style: const TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFFFBBF24), // amber-400
                        letterSpacing: 2.0,
                      ),
                    ),
                    const SizedBox(height: 6),
                  ],
                  ShaderMask(
                    shaderCallback: (bounds) => const LinearGradient(
                      colors: [
                        Color(0xFFFBBF24), // amber-400
                        Color(0xFFFDE68A), // yellow-300
                        Color(0xFFFBBF24), // amber-400
                      ],
                    ).createShader(bounds),
                    child: Text(
                      banner.title,
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                        height: 1.15,
                      ),
                      maxLines: 2,
                    ),
                  ),
                  if (banner.ctaText != null) ...[
                    const SizedBox(height: 10),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        gradient: AppGradients.primary,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        banner.ctaText!,
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Fills the banner card with the video, cropped to cover.
  Widget _buildVideoBackground(VideoPlayerController controller) {
    final videoSize = controller.value.size;
    return SizedBox.expand(
      child: FittedBox(
        fit: BoxFit.cover,
        child: SizedBox(
          width: videoSize.width,
          height: videoSize.height,
          child: VideoPlayer(controller),
        ),
      ),
    );
  }
}
