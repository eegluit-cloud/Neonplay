import { memo, useRef, useCallback } from 'react';
import { Flame, Loader2 } from 'lucide-react';
import { SectionHeaderRow } from './SectionHeaderRow';
import { ApiGameCard } from './ApiGameCard';
import { useGames } from '@/hooks/useGames';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';

export const HotGamesSection = memo(function HotGamesSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { isAuthenticated } = useAuth();
  const { favoriteIds, toggleFavorite } = useFavorites();

  // Fetch hot games from API
  const { games: allGames, isLoading } = useGames({ limit: 20 });
  const hotGames = allGames.filter(g => g.isHot || g.isFeatured).slice(0, 10);

  const scrollLeft = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  }, []);

  const scrollRight = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  }, []);

  const handleToggleFavorite = useCallback(async (gameId: string) => {
    if (!isAuthenticated) return;
    try {
      await toggleFavorite(gameId);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  }, [isAuthenticated, toggleFavorite]);

  if (isLoading) {
    return (
      <section>
        <SectionHeaderRow
          title={
            <>
              <Flame className="w-4 md:w-5 h-4 md:h-5 text-orange-500" />
              Hot Games
              <span className="text-[10px] md:text-xs bg-orange-500/20 text-orange-400 px-1.5 md:px-2 py-0.5 rounded-full">Trending</span>
            </>
          }
          linkTo="/hot-games"
          onScrollLeft={scrollLeft}
          onScrollRight={scrollRight}
        />
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
        </div>
      </section>
    );
  }

  if (hotGames.length === 0) {
    return null;
  }

  return (
    <section>
      <SectionHeaderRow
        title={
          <>
            <Flame className="w-4 md:w-5 h-4 md:h-5 text-orange-500" />
            Hot Games
            <span className="text-[10px] md:text-xs bg-orange-500/20 text-orange-400 px-1.5 md:px-2 py-0.5 rounded-full">Trending</span>
          </>
        }
        linkTo="/hot-games"
        onScrollLeft={scrollLeft}
        onScrollRight={scrollRight}
      />

      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 will-change-scroll"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {hotGames.map((game, index) => (
          <div
            key={game.id}
            className="flex-shrink-0 w-[28vw] md:w-[calc((100%-24px)/4.5)] lg:w-[calc((100%-56px)/8)]"
          >
            <ApiGameCard
              game={game}
              priority={index < 4}
              isFavorite={favoriteIds?.has(game.id)}
              onToggleFavorite={isAuthenticated ? handleToggleFavorite : undefined}
            />
          </div>
        ))}
      </div>
    </section>
  );
});

export default HotGamesSection;
