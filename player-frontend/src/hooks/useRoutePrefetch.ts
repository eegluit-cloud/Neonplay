import { useCallback, useEffect } from 'react';

// Route modules map for prefetching
const routeModules: Record<string, () => Promise<unknown>> = {
  '/': () => import('@/pages/Index'),
  '/profile': () => import('@/pages/Profile'),
  '/providers': () => import('@/pages/Providers'),
  '/favorites': () => import('@/pages/Favorites'),
  '/live-casino': () => import('@/pages/LiveCasino'),
  '/promotions': () => import('@/pages/Promotions'),
  '/refer-friend': () => import('@/pages/ReferFriend'),
  '/vip': () => import('@/pages/VIP'),
  '/leaderboard': () => import('@/pages/LeaderboardPage'),
  '/prizes': () => import('@/pages/Prizes'),
  '/search': () => import('@/pages/Search'),
  '/hot-games': () => import('@/pages/HotGames'),
  '/slots': () => import('@/pages/Slots'),
  '/crash-games': () => import('@/pages/CrashGames'),
  '/casino': () => import('@/pages/Casino'),
  '/sports': () => import('@/pages/Sports'),
  '/game-shows': () => import('@/pages/GameShows'),
  '/table-games': () => import('@/pages/TableGames'),
  '/blackjack': () => import('@/pages/Blackjack'),
  '/roulette': () => import('@/pages/Roulette'),
  '/new-releases': () => import('@/pages/NewReleases'),
  '/burst-games': () => import('@/pages/BurstGames'),
  '/featured': () => import('@/pages/Featured'),
  '/terms': () => import('@/pages/TermsOfService'),
  '/privacy': () => import('@/pages/PrivacyPolicy'),
  '/responsible-gambling': () => import('@/pages/ResponsibleGambling'),
  '/faq': () => import('@/pages/FAQ'),
  '/provably-fair': () => import('@/pages/ProvablyFair'),
};

// Cache of prefetched routes
const prefetchedRoutes = new Set<string>();

/**
 * Prefetch a route's code bundle
 */
export function prefetchRoute(path: string): void {
  // Normalize path
  const normalizedPath = path.split('?')[0].split('#')[0];
  
  // Skip if already prefetched
  if (prefetchedRoutes.has(normalizedPath)) return;
  
  // Check if we have a module for this route
  const moduleLoader = routeModules[normalizedPath];
  if (moduleLoader) {
    // Mark as prefetched immediately to avoid duplicate requests
    prefetchedRoutes.add(normalizedPath);
    
    // Prefetch with low priority using requestIdleCallback
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => moduleLoader(), { timeout: 2000 });
    } else {
      setTimeout(() => moduleLoader(), 100);
    }
  }
}

/**
 * Hook for prefetching routes on hover/focus
 */
export function useRoutePrefetch() {
  const handlePrefetch = useCallback((path: string) => {
    prefetchRoute(path);
  }, []);

  return { prefetchRoute: handlePrefetch };
}

/**
 * Hook to prefetch common routes on initial load
 */
export function usePrefetchCommonRoutes(routes: string[] = []) {
  useEffect(() => {
    // Delay prefetching to not block initial render
    const timer = setTimeout(() => {
      routes.forEach((route) => {
        prefetchRoute(route);
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [routes]);
}

/**
 * Prefetch on link hover - attach to onMouseEnter/onFocus
 */
export function createPrefetchHandler(path: string) {
  let prefetched = false;
  return () => {
    if (!prefetched) {
      prefetched = true;
      prefetchRoute(path);
    }
  };
}

export default useRoutePrefetch;
