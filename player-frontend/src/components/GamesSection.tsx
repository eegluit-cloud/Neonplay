import { useState, useRef, useEffect, memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Heart, ChevronRight, ChevronLeft, Grid3X3, X, Sparkles, Tv, Search, User, LayoutGrid, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ApiGameCard } from './ApiGameCard';
import { useGames, useGameProviders, Game } from '@/hooks/useGames';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';

// Fallback image
import placeholderImg from '@/assets/games/thor-hammer-time.png';

const filters = ['Slots', 'Crash Games', 'Live Casino', 'Table Games', 'Instant Win'];
const volatilityOptions = [
  { id: 'all', label: 'All Volatility' },
  { id: 'low', label: 'Low' },
  { id: 'medium', label: 'Medium' },
  { id: 'high', label: 'High' }
];

interface GameSectionRowProps {
  title: string;
  icon?: React.ReactNode;
  games: Game[];
  scrollRef: React.RefObject<HTMLDivElement>;
  favoriteIds?: Set<string>;
  onToggleFavorite?: (gameId: string) => void;
  isAuthenticated?: boolean;
}

const GameSectionRow = memo(function GameSectionRow({
  title,
  icon,
  games,
  scrollRef,
  favoriteIds,
  onToggleFavorite,
  isAuthenticated
}: GameSectionRowProps) {
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  if (games.length === 0) return null;

  return (
    <div>
      <div className="mt-1 sm:mt-2 md:mt-4 h-6 sm:h-7 md:h-8 flex items-center justify-between mb-1.5 sm:mb-2 md:mb-4 min-h-0">
        <h2 className="text-sm sm:text-base font-semibold flex items-center gap-1 sm:gap-1.5 md:gap-2">
          {icon}
          {title}
        </h2>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button className="h-7 px-2.5 rounded-lg bg-card border border-border text-xs hover:bg-card-hover transition-colors">
            All
          </button>
          <button onClick={scrollLeft} className="w-7 h-7 rounded-lg border border-border flex items-center justify-center hover:bg-amber-500/10 hover:border-amber-500/50 transition-colors">
            <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button onClick={scrollRight} className="w-7 h-7 rounded-lg border border-amber-500 bg-transparent flex items-center justify-center hover:bg-amber-500/10 transition-colors">
            <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
        {games.map((game, index) => (
          <div key={game.id} className="flex-shrink-0 w-[28vw] md:w-[calc((100%-24px)/4.5)] lg:w-[calc((100%-56px)/8)]">
            <ApiGameCard
              game={game}
              priority={index < 4}
              isFavorite={favoriteIds?.has(game.id)}
              onToggleFavorite={isAuthenticated ? onToggleFavorite : undefined}
            />
          </div>
        ))}
      </div>
    </div>
  );
});

export function GamesSection() {
  const navigate = useNavigate();
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('All Providers');
  const [selectedVolatility, setSelectedVolatility] = useState('all');
  const [providersOpen, setProvidersOpen] = useState(false);
  const [volatilityOpen, setVolatilityOpen] = useState(false);
  const providersRef = useRef<HTMLDivElement>(null);
  const volatilityRef = useRef<HTMLDivElement>(null);
  const slotsScrollRef = useRef<HTMLDivElement>(null);
  const newGamesScrollRef = useRef<HTMLDivElement>(null);
  const liveCasinoScrollRef = useRef<HTMLDivElement>(null);

  const { isAuthenticated } = useAuth();
  const { favoriteIds, toggleFavorite } = useFavorites();

  // Fetch games from API
  const { games: allGames, isLoading: gamesLoading } = useGames({ limit: 50 });
  const { providers: providersList } = useGameProviders();

  // Filter games by category
  const slotsGames = allGames.filter(g => g.category?.slug === 'slots').slice(0, 10);
  const newGames = allGames.filter(g => g.isNew).slice(0, 10);
  const liveGames = allGames.filter(g => g.category?.slug === 'live-casino' || g.category?.slug === 'table-games').slice(0, 10);

  // Search filter
  const searchFilteredGames = searchQuery
    ? allGames.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : null;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (providersRef.current && !providersRef.current.contains(event.target as Node)) {
        setProvidersOpen(false);
      }
      if (volatilityRef.current && !volatilityRef.current.contains(event.target as Node)) {
        setVolatilityOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleFilter = (filter: string) => {
    if (activeFilters.includes(filter)) {
      setActiveFilters(activeFilters.filter(f => f !== filter));
    } else {
      setActiveFilters([...activeFilters, filter]);
    }
  };

  const handleToggleFavorite = useCallback(async (gameId: string) => {
    if (!isAuthenticated) return;
    try {
      await toggleFavorite(gameId);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  }, [isAuthenticated, toggleFavorite]);

  return (
    <section className="space-y-4 !mt-0 sm:!-mt-1 lg:!-mt-1">
      {/* Search Bar Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search a game..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-9 md:h-12 pl-9 pr-3 rounded-lg md:rounded-xl bg-card border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Providers & Volatility Dropdowns */}
        <div className="hidden md:flex items-center gap-3">
          {/* Providers Dropdown */}
          <div className="relative" ref={providersRef}>
            <button
              onClick={() => {
                setProvidersOpen(!providersOpen);
                setVolatilityOpen(false);
              }}
              className={cn(
                "h-12 px-5 rounded-xl bg-card border text-sm flex items-center gap-2 hover:bg-secondary transition-colors whitespace-nowrap shadow-[0_0_15px_hsl(var(--primary)/0.15),0_0_5px_hsl(var(--primary)/0.1)]",
                selectedProvider !== 'All Providers' ? "border-primary" : "border-border"
              )}
            >
              <User className="w-4 h-4" />
              {selectedProvider === 'All Providers' ? 'Providers' : selectedProvider}
              <ChevronRight className={cn("w-4 h-4 transition-transform", providersOpen ? "rotate-[-90deg]" : "rotate-90")} />
            </button>

            {providersOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-card rounded-xl border border-border shadow-xl z-50 overflow-hidden animate-fade-in">
                <div className="max-h-72 overflow-y-auto py-2">
                  <button
                    onClick={() => {
                      setSelectedProvider('All Providers');
                      setProvidersOpen(false);
                    }}
                    className={cn(
                      "w-full px-4 py-2.5 text-sm text-left flex items-center justify-between hover:bg-secondary transition-colors",
                      selectedProvider === 'All Providers' ? "text-primary" : "text-foreground"
                    )}
                  >
                    All Providers
                    {selectedProvider === 'All Providers' && <Check className="w-4 h-4 text-primary" />}
                  </button>
                  {providersList.map(provider => (
                    <button
                      key={provider.id}
                      onClick={() => {
                        setSelectedProvider(provider.name);
                        setProvidersOpen(false);
                        navigate(`/providers/${provider.slug}`);
                      }}
                      className={cn(
                        "w-full px-4 py-2.5 text-sm text-left flex items-center justify-between hover:bg-secondary transition-colors",
                        selectedProvider === provider.name ? "text-primary" : "text-foreground"
                      )}
                    >
                      {provider.name}
                      {selectedProvider === provider.name && <Check className="w-4 h-4 text-primary" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Volatility Dropdown */}
          <div className="relative" ref={volatilityRef}>
            <button
              onClick={() => {
                setVolatilityOpen(!volatilityOpen);
                setProvidersOpen(false);
              }}
              className={cn(
                "h-12 px-5 rounded-xl bg-card border text-sm flex items-center gap-2 hover:bg-secondary transition-colors whitespace-nowrap shadow-[0_0_15px_hsl(var(--primary)/0.15),0_0_5px_hsl(var(--primary)/0.1)]",
                selectedVolatility !== 'all' ? "border-primary" : "border-border"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
              {selectedVolatility === 'all' ? 'Volatility' : volatilityOptions.find(v => v.id === selectedVolatility)?.label}
              <ChevronRight className={cn("w-4 h-4 transition-transform", volatilityOpen ? "rotate-[-90deg]" : "rotate-90")} />
            </button>

            {volatilityOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-card rounded-xl border border-border shadow-xl z-50 overflow-hidden animate-fade-in">
                <div className="py-2">
                  {volatilityOptions.map(option => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setSelectedVolatility(option.id);
                        setVolatilityOpen(false);
                      }}
                      className={cn(
                        "w-full px-4 py-2.5 text-sm text-left flex items-center justify-between hover:bg-secondary transition-colors",
                        selectedVolatility === option.id ? "text-primary" : "text-foreground"
                      )}
                    >
                      {option.label}
                      {selectedVolatility === option.id && <Check className="w-4 h-4 text-primary" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Categories - hidden for now */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 md:pb-0">
      </div>

      {/* Active Filters */}
      <div className="hidden md:flex items-center gap-2 flex-wrap">
        <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-blue-400 text-white text-sm font-medium flex items-center gap-2">
          <Grid3X3 className="w-4 h-4" />
          Category
        </button>

        {filters.map(filter => (
          <button
            key={filter}
            onClick={() => toggleFilter(filter)}
            className={cn(
              "px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors",
              activeFilters.includes(filter)
                ? "bg-card border border-primary/50 text-foreground"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {filter}
            {activeFilters.includes(filter) && <X className="w-3 h-3" />}
          </button>
        ))}

        {activeFilters.length > 0 && (
          <button
            onClick={() => setActiveFilters([])}
            className="px-3 py-2 rounded-lg bg-card border border-border text-sm hover:bg-card-hover transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Loading State */}
      {gamesLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      )}

      {/* Search Results */}
      {searchFilteredGames && !gamesLoading && (
        <GameSectionRow
          title={`Search Results (${searchFilteredGames.length})`}
          icon={<Search className="w-4 md:w-5 h-4 md:h-5 text-amber-500" />}
          games={searchFilteredGames}
          scrollRef={slotsScrollRef}
          favoriteIds={favoriteIds}
          onToggleFavorite={handleToggleFavorite}
          isAuthenticated={isAuthenticated}
        />
      )}

      {/* Game Sections */}
      {!searchFilteredGames && !gamesLoading && (
        <>
          <GameSectionRow
            title="Slots"
            icon={<Sparkles className="w-4 md:w-5 h-4 md:h-5 text-purple-500" />}
            games={slotsGames}
            scrollRef={slotsScrollRef}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
            isAuthenticated={isAuthenticated}
          />

          <GameSectionRow
            title="New Games"
            icon={<Sparkles className="w-4 md:w-5 h-4 md:h-5 text-yellow-400" />}
            games={newGames}
            scrollRef={newGamesScrollRef}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
            isAuthenticated={isAuthenticated}
          />

          <GameSectionRow
            title="Live Casino"
            icon={
              <>
                <Tv className="w-4 md:w-5 h-4 md:h-5 text-red-500" />
                <span className="w-1.5 md:w-2 h-1.5 md:h-2 bg-red-500 rounded-full animate-pulse"></span>
              </>
            }
            games={liveGames}
            scrollRef={liveCasinoScrollRef}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
            isAuthenticated={isAuthenticated}
          />
        </>
      )}

      {/* No results message */}
      {!gamesLoading && allGames.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No games found</p>
          <button
            onClick={() => {
              setActiveFilters([]);
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 bg-primary text-black rounded-lg font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}
    </section>
  );
}
