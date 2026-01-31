import { Home, Flame, Sparkles, Tv, Heart, TrendingUp, Package, Clapperboard, Spade, CircleDot, Layers, Rocket, Zap, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const categoryTabs = [
  { id: 'lobby', label: 'Lobby', icon: Home, path: '/' },
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

interface GameCategoryNavProps {
  activeTab?: string;
}

export function GameCategoryNav({ activeTab = 'lobby' }: GameCategoryNavProps) {
  const navigate = useNavigate();

  const handleTabClick = (e: React.MouseEvent, tab: typeof categoryTabs[0]) => {
    e.preventDefault();
    e.stopPropagation();
    if (tab.id !== activeTab) {
      navigate(tab.path);
    }
  };

  return (
    <div
      className="w-full max-w-full overflow-x-auto scrollbar-hide pb-2 touch-pan-x"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <div className="inline-flex items-center bg-card border border-border rounded-full p-1 h-12 min-w-max">
        {categoryTabs.map((tab) => {
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
              <tab.icon className={cn("w-4 h-4", isActive && "text-cyan-500")} />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { categoryTabs };
