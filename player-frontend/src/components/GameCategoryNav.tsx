import { useMemo, useRef } from 'react';
import { Home, Flame, Sparkles, Tv, Heart, TrendingUp, Package, Clapperboard, Spade, CircleDot, Layers, Rocket, Zap, Star, Volleyball, Wifi, Gamepad2, Trophy, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';
import type { LobbyMode } from './LobbyModeSwitcher';

const casinoCategoryTabs = [
  { id: 'lobby', label: 'Lobby', icon: Home, path: '/lobby' },
  { id: 'favorites', label: 'Favorites', icon: Heart, path: '/favorites' },
  { id: 'hot', label: 'Hot Games', icon: Flame, path: '/hot-games' },
  { id: 'slots', label: 'Slots', icon: Sparkles, path: '/slots' },
  { id: 'crash', label: 'Crash Games', icon: TrendingUp, path: '/crash-games' },
  { id: 'live', label: 'Live Casino', icon: Tv, path: '/live-casino' },
  { id: 'game-shows', label: 'Game Shows', icon: Clapperboard, path: '/game-shows' },
  { id: 'table-games', label: 'Table Games', icon: Layers, path: '/table-games' },
  { id: 'blackjack', label: 'Blackjack', icon: Spade, path: '/blackjack' },
  { id: 'roulette', label: 'Roulette', icon: CircleDot, path: '/roulette' },
  { id: 'new-releases', label: 'New Releases', icon: Rocket, path: '/new-releases' },
  { id: 'burst-games', label: 'Burst Games', icon: Zap, path: '/burst-games' },
  { id: 'featured', label: 'Featured', icon: Star, path: '/featured' },
  { id: 'providers', label: 'Providers', icon: Package, path: '/providers' },
];

const sportsCategoryTabs = [
  { id: 'sports-home', label: 'Sports Home', icon: Volleyball, path: '/sports' },
  { id: 'live-sports', label: 'Live', icon: Wifi, path: '/sports?filter=live' },
  { id: 'soccer', label: 'Soccer', icon: Target, path: '/sports?filter=soccer' },
  { id: 'basketball', label: 'Basketball', icon: Trophy, path: '/sports?filter=basketball' },
  { id: 'tennis', label: 'Tennis', icon: Target, path: '/sports?filter=tennis' },
  { id: 'esports', label: 'Esports', icon: Gamepad2, path: '/sports?filter=esports' },
  { id: 'hockey', label: 'Ice Hockey', icon: Target, path: '/sports?filter=hockey' },
  { id: 'american-football', label: 'American Football', icon: Trophy, path: '/sports?filter=american-football' },
];

interface GameCategoryNavProps {
  activeTab?: string;
  mode?: LobbyMode;
}

export function GameCategoryNav({ activeTab = 'lobby', mode = 'all' }: GameCategoryNavProps) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current || !pillRef.current) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Container fade
    gsap.from(containerRef.current, {
      opacity: 0,
      duration: 0.3,
      immediateRender: false,
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 90%',
        once: true,
      },
    });

    // Domino tab reveal — only first 8 tabs
    const buttons = pillRef.current.querySelectorAll('button');
    const maxAnimate = Math.min(buttons.length, 8);
    const toAnimate = Array.from(buttons).slice(0, maxAnimate);
    const rest = Array.from(buttons).slice(maxAnimate);

    gsap.from(toAnimate, {
      opacity: 0,
      x: -10,
      duration: 0.3,
      stagger: 0.04,
      ease: 'power2.out',
      immediateRender: false,
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 90%',
        once: true,
      },
    });

    if (rest.length > 0) {
      gsap.set(rest, { opacity: 1 });
    }
  }, { scope: containerRef, dependencies: [mode] });

  const tabs = useMemo(() => {
    switch (mode) {
      case 'casino':
        return casinoCategoryTabs;
      case 'sports':
        return sportsCategoryTabs;
      case 'all':
      default:
        return [
          casinoCategoryTabs[0], // Lobby
          ...sportsCategoryTabs.slice(0, 4), // Sports Home, Live, Soccer, Basketball
          ...casinoCategoryTabs.slice(1), // Everything after Lobby
        ];
    }
  }, [mode]);

  const handleTabClick = (e: React.MouseEvent, tab: typeof casinoCategoryTabs[0]) => {
    e.preventDefault();
    e.stopPropagation();
    if (tab.id !== activeTab) {
      navigate(tab.path);
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full max-w-full overflow-x-auto scrollbar-hide pb-2 touch-pan-x"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <div ref={pillRef} className="inline-flex items-center bg-card border border-border rounded-full p-1 h-12 min-w-max">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={(e) => handleTabClick(e, tab)}
              className={cn(
                "flex items-center gap-2 px-4 h-10 rounded-full text-sm font-medium transition-all whitespace-nowrap tap-feedback flex-shrink-0",
                isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className={cn("w-4 h-4", isActive && "text-amber-500")} />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { casinoCategoryTabs as categoryTabs };
