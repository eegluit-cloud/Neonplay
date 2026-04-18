import { useMemo, useRef } from 'react';
import { Home, Flame, Sparkles, Tv, Heart, TrendingUp, Package, Clapperboard, Spade, CircleDot, Layers, Rocket, Zap, Star, Volleyball, Wifi, Gamepad2, Trophy, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import type { LobbyMode } from './LobbyModeSwitcher';

const buildCasinoCategoryTabs = (t: TFunction) => [
  { id: 'lobby', label: t('nav.lobby'), icon: Home, path: '/lobby' },
  { id: 'favorites', label: t('nav.favorites'), icon: Heart, path: '/favorites' },
  { id: 'hot', label: t('nav.hotGames'), icon: Flame, path: '/hot-games' },
  { id: 'slots', label: t('nav.slots'), icon: Sparkles, path: '/slots' },
  { id: 'crash', label: t('nav.crashGames'), icon: TrendingUp, path: '/crash-games' },
  { id: 'live', label: t('nav.liveCasino'), icon: Tv, path: '/live-casino' },
  { id: 'game-shows', label: t('nav.gameShows'), icon: Clapperboard, path: '/game-shows' },
  { id: 'table-games', label: t('nav.tableGames'), icon: Layers, path: '/table-games' },
  { id: 'blackjack', label: t('nav.blackjack'), icon: Spade, path: '/blackjack' },
  { id: 'roulette', label: t('nav.roulette'), icon: CircleDot, path: '/roulette' },
  { id: 'new-releases', label: t('nav.newReleases'), icon: Rocket, path: '/new-releases' },
  { id: 'burst-games', label: t('nav.burstGames'), icon: Zap, path: '/burst-games' },
  { id: 'featured', label: t('nav.featured'), icon: Star, path: '/featured' },
  { id: 'providers', label: t('nav.providers'), icon: Package, path: '/providers' },
];

const buildSportsCategoryTabs = (t: TFunction) => [
  { id: 'sports-home', label: t('nav.sportsHome'), icon: Volleyball, path: '/sports' },
  { id: 'live-sports', label: t('nav.live'), icon: Wifi, path: '/sports?filter=live' },
  { id: 'soccer', label: t('nav.soccer'), icon: Target, path: '/sports?filter=soccer' },
  { id: 'basketball', label: t('nav.basketball'), icon: Trophy, path: '/sports?filter=basketball' },
  { id: 'tennis', label: t('nav.tennis'), icon: Target, path: '/sports?filter=tennis' },
  { id: 'esports', label: t('nav.esports'), icon: Gamepad2, path: '/sports?filter=esports' },
  { id: 'hockey', label: t('nav.hockey'), icon: Target, path: '/sports?filter=hockey' },
  { id: 'american-football', label: t('nav.americanFootball'), icon: Trophy, path: '/sports?filter=american-football' },
];

interface GameCategoryNavProps {
  activeTab?: string;
  mode?: LobbyMode;
}

export function GameCategoryNav({ activeTab = 'lobby', mode = 'all' }: GameCategoryNavProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
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

  const casinoCategoryTabs = useMemo(() => buildCasinoCategoryTabs(t as TFunction), [t]);
  const sportsCategoryTabs = useMemo(() => buildSportsCategoryTabs(t as TFunction), [t]);

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
  }, [mode, casinoCategoryTabs, sportsCategoryTabs]);

  const handleTabClick = (e: React.MouseEvent, tab: ReturnType<typeof buildCasinoCategoryTabs>[0]) => {
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

export { buildCasinoCategoryTabs as categoryTabs };
