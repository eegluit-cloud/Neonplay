import 'package:go_router/go_router.dart';

import '../../features/amoe/screens/amoe_screen.dart';
import 'page_transitions.dart';
import '../../features/auth/screens/register_screen.dart';
import '../../features/games/screens/casino_screen.dart';
import '../../features/games/screens/favorites_screen.dart';
import '../../features/games/screens/game_detail_screen.dart';
import '../../features/help/screens/faq_screen.dart';
import '../../features/leaderboard/screens/leaderboard_screen.dart';
import '../../features/lobby/screens/lobby_screen.dart';
import '../../features/prizes/screens/prizes_screen.dart';
import '../../features/profile/screens/profile_screen.dart';
import '../../features/promotions/screens/promotions_screen.dart';
import '../../features/referrals/screens/refer_friend_screen.dart';
import '../../features/sports/screens/sports_screen.dart';
import '../../features/vip/screens/vip_screen.dart';
import '../widgets/app_scaffold.dart';
import '../widgets/not_found_screen.dart';
import '../widgets/static_content_page.dart';

/// App router configuration.
/// Mirrors all routes from player-frontend/src/App.tsx.
GoRouter createAppRouter({required bool isAuthenticated}) {
  return GoRouter(
    initialLocation: isAuthenticated ? '/lobby' : '/',
    errorBuilder: (_, _) => const NotFoundScreen(),
    redirect: (context, state) {
      final isOnPublicRoute = _publicPaths.contains(state.matchedLocation);

      if (!isAuthenticated && !isOnPublicRoute) return '/';
      if (isAuthenticated && state.matchedLocation == '/') return '/lobby';
      return null;
    },
    routes: [
      // PUBLIC ROUTES
      GoRoute(
        path: '/',
        builder: (_, _) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/terms',
        builder: (_, _) => const StaticContentPage(
          slug: 'terms',
          fallbackTitle: 'Terms of Service',
        ),
      ),
      GoRoute(
        path: '/privacy',
        builder: (_, _) => const StaticContentPage(
          slug: 'privacy',
          fallbackTitle: 'Privacy Policy',
        ),
      ),
      GoRoute(
        path: '/responsible-gambling',
        builder: (_, _) => const StaticContentPage(
          slug: 'responsible-gambling',
          fallbackTitle: 'Responsible Gambling',
        ),
      ),
      GoRoute(
        path: '/faq',
        builder: (_, _) => const FaqScreen(),
      ),
      GoRoute(
        path: '/provably-fair',
        builder: (_, _) => const StaticContentPage(
          slug: 'provably-fair',
          fallbackTitle: 'Provably Fair',
        ),
      ),

      // PROTECTED ROUTES - wrapped with ShellRoute for persistent nav
      ShellRoute(
        builder: (_, _, child) => AppScaffold(child: child),
        routes: [
          GoRoute(
            path: '/lobby',
            builder: (_, _) => const LobbyScreen(),
          ),
          GoRoute(
            path: '/casino',
            builder: (_, _) => const CasinoScreen(),
          ),
          GoRoute(
            path: '/sports',
            builder: (_, _) => const SportsScreen(),
          ),
          GoRoute(
            path: '/profile',
            builder: (_, _) => const ProfileScreen(),
          ),
          GoRoute(
            path: '/search',
            builder: (_, _) => const CasinoScreen(),
          ),
          GoRoute(
            path: '/game/:gameId',
            pageBuilder: (_, state) => slideUpTransitionPage(
              state: state,
              child: GameDetailScreen(
                gameId: state.pathParameters['gameId']!,
              ),
            ),
          ),
          GoRoute(
            path: '/favorites',
            builder: (_, _) => const FavoritesScreen(),
          ),
          GoRoute(
            path: '/providers',
            builder: (_, _) => const CasinoScreen(),
          ),
          GoRoute(
            path: '/providers/:providerId',
            builder: (_, state) => CasinoScreen(
              initialProvider: state.pathParameters['providerId'],
            ),
          ),
          GoRoute(
            path: '/promotions',
            builder: (_, _) => const PromotionsScreen(),
          ),
          GoRoute(
            path: '/vip',
            builder: (_, _) => const VipScreen(),
          ),
          GoRoute(
            path: '/refer-friend',
            builder: (_, _) => const ReferFriendScreen(),
          ),
          GoRoute(
            path: '/prizes',
            builder: (_, _) => const PrizesScreen(),
          ),
          GoRoute(
            path: '/leaderboard',
            builder: (_, _) => const LeaderboardScreen(),
          ),
          GoRoute(
            path: '/amoe',
            builder: (_, _) => const AmoeScreen(),
          ),
          // Game categories - pass initialCategory to pre-filter
          GoRoute(
            path: '/slots',
            builder: (_, _) =>
                const CasinoScreen(initialCategory: 'slots'),
          ),
          GoRoute(
            path: '/hot-games',
            builder: (_, _) => const CasinoScreen(showHot: true),
          ),
          GoRoute(
            path: '/crash-games',
            builder: (_, _) =>
                const CasinoScreen(initialCategory: 'crash-games'),
          ),
          GoRoute(
            path: '/live-casino',
            builder: (_, _) =>
                const CasinoScreen(initialCategory: 'live-casino'),
          ),
          GoRoute(
            path: '/game-shows',
            builder: (_, _) =>
                const CasinoScreen(initialCategory: 'game-shows'),
          ),
          GoRoute(
            path: '/table-games',
            builder: (_, _) =>
                const CasinoScreen(initialCategory: 'table-games'),
          ),
          GoRoute(
            path: '/blackjack',
            builder: (_, _) =>
                const CasinoScreen(initialCategory: 'blackjack'),
          ),
          GoRoute(
            path: '/roulette',
            builder: (_, _) =>
                const CasinoScreen(initialCategory: 'roulette'),
          ),
          GoRoute(
            path: '/new-releases',
            builder: (_, _) => const CasinoScreen(showNew: true),
          ),
          GoRoute(
            path: '/burst-games',
            builder: (_, _) =>
                const CasinoScreen(initialCategory: 'burst-games'),
          ),
          GoRoute(
            path: '/featured',
            builder: (_, _) => const CasinoScreen(showFeatured: true),
          ),
        ],
      ),
    ],
  );
}

const _publicPaths = {
  '/',
  '/terms',
  '/privacy',
  '/responsible-gambling',
  '/faq',
  '/provably-fair',
};
