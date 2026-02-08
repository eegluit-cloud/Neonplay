import { memo, useRef, useCallback } from 'react';
import { Flame, Loader2 } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SectionHeaderRow } from './SectionHeaderRow';
import { ApiGameCard } from './ApiGameCard';
import { useGames } from '@/hooks/useGames';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';

export const HotGamesSection = memo(function HotGamesSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    gsap.from(sectionRef.current, {
      opacity: 0, y: 20, duration: 0.4, ease: 'power2.out',
      immediateRender: false,
      scrollTrigger: { trigger: sectionRef.current, start: 'top 88%', once: true },
    });

    const cards = sectionRef.current.querySelectorAll('.hot-card-item');
    if (cards.length === 0) return;

    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        const cardArray = Array.from(cards) as HTMLElement[];
        const viewportWidth = window.innerWidth;
        const visible = cardArray.filter(el => el.getBoundingClientRect().left < viewportWidth + 100);

        if (visible.length > 0) {
          gsap.fromTo(visible,
            { opacity: 0, y: 25, scale: 0.93 },
            { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.06, delay: 0.2, ease: 'power2.out' },
          );
        }
      },
    });
  }, { scope: sectionRef });

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
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      </section>
    );
  }

  if (hotGames.length === 0) {
    return null;
  }

  return (
    <section ref={sectionRef}>
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
            className="hot-card-item flex-shrink-0 w-[28vw] md:w-[calc((100%-24px)/4.5)] lg:w-[calc((100%-56px)/8)]"
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
