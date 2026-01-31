import { useState, useRef, useEffect } from 'react';
import { useSidebar } from '@/hooks/useSidebar';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { AuthModals } from '@/components/AuthModals';
import { SpinGiftModal } from '@/components/SpinGiftModal';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { MobilePageHeader } from '@/components/MobilePageHeader';
import { Search, LayoutGrid, User, ChevronLeft, ChevronRight, Heart, Flame, Sparkles, TrendingUp, Tv, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GameCategoryNav } from '@/components/GameCategoryNav';
import { HeroSection } from '@/components/HeroSection';
import { useNavigate } from 'react-router-dom';
import { useGames, useGameProviders, Game, GameProvider } from '@/hooks/useGames';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';

// Fallback images
import thorHammerTimeImg from '@/assets/games/thor-hammer-time.png';

interface GameCardProps {
  game: Game;
  isFavorite?: boolean;
  onToggleFavorite?: (gameId: string) => void;
}

const GameCard = ({ game, isFavorite, onToggleFavorite }: GameCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/game/${game.slug}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.(game.id);
  };

  return (
    <div
      className="relative rounded-lg md:rounded-xl overflow-hidden cursor-pointer group"
      onClick={handleClick}
    >
      {/* Player Count Badge */}
      <div className="absolute top-1.5 md:top-2 left-1.5 md:left-2 z-10 flex items-center gap-1 bg-black/70 rounded-full px-1.5 md:px-2 py-0.5 md:py-1">
        <span className="w-1.5 md:w-2 h-1.5 md:h-2 bg-cyan-400 rounded-full animate-slow-blink"></span>
        <span className="text-[10px] md:text-xs font-medium text-white">{game.playCount || Math.floor(Math.random() * 100) + 10}</span>
      </div>

      {/* Favorite Heart */}
      <button
        className="absolute top-1.5 md:top-2 right-1.5 md:right-2 z-10 w-6 md:w-7 h-6 md:h-7 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
        onClick={handleFavoriteClick}
      >
        <Heart className={`w-3 md:w-4 h-3 md:h-4 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-yellow-400'}`} />
      </button>

      {/* Game Image */}
      <img
        src={game.thumbnailUrl || thorHammerTimeImg}
        alt={game.name}
        className="w-full aspect-[3/4] object-cover rounded-lg md:rounded-xl transition-transform group-hover:scale-105"
        onError={(e) => {
          (e.target as HTMLImageElement).src = thorHammerTimeImg;
        }}
      />

      {/* Game Name Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
        <p className="text-xs text-white font-medium truncate">{game.name}</p>
        <p className="text-[10px] text-gray-300 truncate">{game.provider?.name}</p>
      </div>
    </div>
  );
};

interface GameSectionProps {
  title: string;
  icon?: React.ReactNode;
  games: Game[];
  viewAllPath?: string;
  isLoading?: boolean;
  favoriteIds?: Set<string>;
  onToggleFavorite?: (gameId: string) => void;
}

const GameSection = ({ title, icon, games, viewAllPath, isLoading, favoriteIds, onToggleFavorite }: GameSectionProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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

  return (
    <div>
      {/* Section Header */}
      <div className="mt-1 sm:mt-2 md:mt-4 h-6 sm:h-7 md:h-8 flex items-center justify-between mb-1.5 sm:mb-2 md:mb-4 min-h-0">
        <h2 className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-2">
          {icon}
          {title}
        </h2>
        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          {viewAllPath && (
            <button
              className="px-2 py-1 rounded-lg bg-card border border-border text-xs sm:text-sm hover:bg-card-hover transition-colors"
              onClick={() => navigate(viewAllPath)}
            >
              All
            </button>
          )}
          <button
            onClick={scrollLeft}
            className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 rounded-full border border-border flex items-center justify-center hover:bg-cyan-500/10 hover:border-cyan-500/50 transition-colors"
          >
            <ChevronLeft className="w-3 sm:w-3.5 md:w-4 h-3 sm:h-3.5 md:h-4 text-muted-foreground" />
          </button>
          <button
            onClick={scrollRight}
            className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 rounded-full border-2 border-cyan-500 bg-transparent flex items-center justify-center hover:bg-cyan-500/10 transition-colors"
          >
            <ChevronRight className="w-3 sm:w-3.5 md:w-4 h-3 sm:h-3.5 md:h-4 text-cyan-400" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
        </div>
      ) : games.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No games available</div>
      ) : (
        <div ref={scrollRef} className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {games.map((game) => (
            <div key={game.id} className="flex-shrink-0 w-[28vw] md:w-[calc((100%-24px)/4.5)] lg:w-[calc((100%-56px)/8)]">
              <GameCard
                game={game}
                isFavorite={favoriteIds?.has(game.id)}
                onToggleFavorite={onToggleFavorite}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ProviderCard = ({ provider }: { provider: GameProvider }) => {
  const navigate = useNavigate();

  return (
    <div
      className="flex-shrink-0 bg-card border border-border rounded-lg md:rounded-xl p-3 md:p-4 w-24 md:w-32 h-12 md:h-16 flex items-center justify-center hover:border-primary/50 transition-colors cursor-pointer"
      onClick={() => navigate(`/providers/${provider.slug}`)}
    >
      {provider.logoUrl ? (
        <img
          src={provider.logoUrl}
          alt={provider.name}
          className="max-h-6 md:max-h-8 max-w-full object-contain"
        />
      ) : (
        <span className="text-xs font-medium text-foreground">{provider.name}</span>
      )}
    </div>
  );
};

const Casino = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [signInOpen, setSignInOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);
  const [spinGiftOpen, setSpinGiftOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [selectedVolatility, setSelectedVolatility] = useState('all');
  const navigate = useNavigate();

  const { isAuthenticated } = useAuth();
  const { favoriteIds, toggleFavorite } = useFavorites();

  // Fetch games from API
  const { games: allGames, isLoading: gamesLoading } = useGames({ limit: 50 });
  const { providers, isLoading: providersLoading } = useGameProviders();

  // Filter games by category
  const hotGames = allGames.filter(g => g.isHot || g.isFeatured).slice(0, 10);
  const slotsGames = allGames.filter(g => g.category?.slug === 'slots').slice(0, 10);
  const liveGames = allGames.filter(g => g.category?.slug === 'live-casino' || g.category?.slug === 'table-games').slice(0, 10);
  const newGames = allGames.filter(g => g.isNew).slice(0, 10);

  // Search filter
  const filteredGames = searchTerm
    ? allGames.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : null;

  const handleToggleFavorite = async (gameId: string) => {
    if (!isAuthenticated) {
      setSignInOpen(true);
      return;
    }
    try {
      await toggleFavorite(gameId);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background">
      <Header
        onOpenSignIn={() => setSignInOpen(true)}
        onOpenSignUp={() => setSignUpOpen(true)}
        onToggleSidebar={toggleSidebar}
      />

      <Sidebar
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        onOpenSpinGift={() => setSpinGiftOpen(true)}
      />

      <div className={`transition-all duration-300 pt-14 md:pt-16 pb-20 md:pb-0 ${sidebarOpen ? 'md:ml-56' : 'md:ml-16'}`}>
        <main className="p-3 md:p-4 lg:p-6 space-y-4 md:space-y-6 overflow-x-hidden page-transition-enter max-w-full">

          <MobilePageHeader title="Casino" />

          <HeroSection onOpenSignUp={() => setSignUpOpen(true)} />

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search a game..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-9 md:h-12 pl-9 pr-3 rounded-lg md:rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Providers & Volatility Dropdowns */}
            <div className="hidden md:flex items-center gap-3">
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger className="h-12 w-[160px] bg-card border-border rounded-xl">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <SelectValue placeholder="Providers" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  {providers.map(p => (
                    <SelectItem key={p.id} value={p.slug}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedVolatility} onValueChange={setSelectedVolatility}>
                <SelectTrigger className="h-12 w-[160px] bg-card border-border rounded-xl">
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4" />
                    <SelectValue placeholder="Volatility" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Volatility</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category Tabs */}
          <GameCategoryNav activeTab="lobby" />

          {/* Search Results */}
          {filteredGames && (
            <GameSection
              title={`Search Results (${filteredGames.length})`}
              icon={<Search className="w-4 h-4 text-cyan-500" />}
              games={filteredGames}
              isLoading={gamesLoading}
              favoriteIds={favoriteIds}
              onToggleFavorite={handleToggleFavorite}
            />
          )}

          {/* Game Sections by Category */}
          {!filteredGames && (
            <>
              <GameSection
                title="Hot Games"
                icon={<Flame className="w-4 h-4 text-orange-500" />}
                games={hotGames}
                viewAllPath="/hot-games"
                isLoading={gamesLoading}
                favoriteIds={favoriteIds}
                onToggleFavorite={handleToggleFavorite}
              />
              <GameSection
                title="Slots"
                icon={<Sparkles className="w-4 h-4 text-purple-500" />}
                games={slotsGames}
                viewAllPath="/slots"
                isLoading={gamesLoading}
                favoriteIds={favoriteIds}
                onToggleFavorite={handleToggleFavorite}
              />
              <GameSection
                title="New Games"
                icon={<TrendingUp className="w-4 h-4 text-cyan-500" />}
                games={newGames}
                viewAllPath="/slots"
                isLoading={gamesLoading}
                favoriteIds={favoriteIds}
                onToggleFavorite={handleToggleFavorite}
              />
              <GameSection
                title="Live Casino"
                icon={<Tv className="w-4 h-4 text-red-500" />}
                games={liveGames}
                viewAllPath="/live-casino"
                isLoading={gamesLoading}
                favoriteIds={favoriteIds}
                onToggleFavorite={handleToggleFavorite}
              />
            </>
          )}

          {/* Providers Section */}
          <div>
            <div className="mt-1 sm:mt-2 md:mt-4 h-6 sm:h-7 md:h-8 flex items-center justify-between mb-1.5 sm:mb-2 md:mb-4 min-h-0">
              <h2 className="text-sm sm:text-base font-semibold text-foreground">Providers</h2>
              <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                <button
                  className="px-2 py-1 rounded-lg bg-card border border-border text-xs sm:text-sm hover:bg-card-hover transition-colors"
                  onClick={() => navigate('/providers')}
                >
                  All
                </button>
              </div>
            </div>

            {providersLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
              </div>
            ) : (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                {providers.map((provider) => (
                  <ProviderCard key={provider.id} provider={provider} />
                ))}
              </div>
            )}
          </div>

          <Footer />
        </main>
      </div>

      <AuthModals
        isSignInOpen={signInOpen}
        isSignUpOpen={signUpOpen}
        onCloseSignIn={() => setSignInOpen(false)}
        onCloseSignUp={() => setSignUpOpen(false)}
        onSwitchToSignUp={() => { setSignInOpen(false); setSignUpOpen(true); }}
        onSwitchToSignIn={() => { setSignUpOpen(false); setSignInOpen(true); }}
      />

      <SpinGiftModal isOpen={spinGiftOpen} onClose={() => setSpinGiftOpen(false)} />

      <MobileBottomNav onMenuClick={toggleSidebar} />
    </div>
  );
};

export default Casino;
