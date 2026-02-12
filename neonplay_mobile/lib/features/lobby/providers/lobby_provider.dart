import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/providers/auth_provider.dart';
import '../models/banner_model.dart';
import '../repositories/lobby_repository.dart';

final lobbyRepositoryProvider = Provider<LobbyRepository>((ref) {
  return LobbyRepository(ref.read(dioClientProvider));
});

/// Hero banners from CMS – falls back to curated promo banners (matches web).
final bannersProvider = FutureProvider<List<BannerModel>>((ref) async {
  try {
    final list = await ref.read(lobbyRepositoryProvider).getBanners();
    if (list.isNotEmpty) return list;
  } catch (_) {}
  return _simulatedBanners;
});

const _simulatedBanners = <BannerModel>[
  BannerModel(
    id: 'promo-1',
    title: 'Build Your\nBrand',
    subtitle: 'START YOUR JOURNEY',
    videoUrl: 'assets/videos/hero-video.mp4',
    imageUrl: 'assets/images/banners/casino-hero-bg-v2.png',
    linkUrl: '/casino',
  ),
  BannerModel(
    id: 'promo-2',
    title: 'Payments &\nProviders',
    subtitle: 'READY TO LAUNCH',
    videoUrl: 'assets/videos/banner-second.mp4',
    imageUrl: 'assets/images/banners/deposit-banner.png',
    linkUrl: '/deposit',
  ),
  BannerModel(
    id: 'promo-3',
    title: 'Create Your\nLeaderboard',
    subtitle: 'BOOST ENGAGEMENT',
    videoUrl: 'assets/videos/banner-third.mp4',
    imageUrl: 'assets/images/banners/leaderboard-bg.png',
    linkUrl: '/leaderboard',
  ),
];

/// Lobby mode: all, casino, sports.
class LobbyModeNotifier extends Notifier<String> {
  @override
  String build() => 'casino';

  void setMode(String mode) => state = mode;
}

final lobbyModeProvider = NotifierProvider<LobbyModeNotifier, String>(
  LobbyModeNotifier.new,
);
