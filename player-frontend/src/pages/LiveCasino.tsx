import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSidebar } from '@/hooks/useSidebar';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { AuthModals } from '@/components/AuthModals';
import { SpinGiftModal } from '@/components/SpinGiftModal';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { MobilePageHeader } from '@/components/MobilePageHeader';
import { Search, LayoutGrid, User, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GameCategoryNav } from '@/components/GameCategoryNav';
import { HeroSection } from '@/components/HeroSection';
import { ApiGameCard } from '@/components/ApiGameCard';
import { useGames, useGameProviders, Game, GameProvider } from '@/hooks/useGames';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';

interface GameSectionProps {
  title: string;
  games: Game[];
  isLoading?: boolean;
  favoriteIds?: Set<string>;
  onToggleFavorite?: (gameId: string) => void;
}

const GameSection = ({ title, games, isLoading, favoriteIds, onToggleFavorite }: GameSectionProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (games.length === 0) return null;

  return (
    <div>
      <div className="mt-1 sm:mt-2 md:mt-4 h-6 sm:h-7 md:h-8 flex items-center justify-between mb-1.5 sm:mb-2 md:mb-4 min-h-0">
        <h2 className="text-sm sm:text-base font-semibold text-foreground">{title}</h2>
        <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
          <button className="px-3 py-2 rounded-xl bg-card border border-border text-xs sm:text-sm hover:bg-card-hover transition-colors tap-feedback min-h-[36px] flex items-center">
            All
          </button>
          <button
            onClick={scrollLeft}
            className="w-9 sm:w-10 h-9 sm:h-10 rounded-xl border border-border flex items-center justify-center hover:bg-cyan-500/10 hover:border-cyan-500/50 transition-colors tap-feedback"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={scrollRight}
            className="w-9 sm:w-10 h-9 sm:h-10 rounded-xl border-2 border-cyan-500 bg-transparent flex items-center justify-center hover:bg-cyan-500/10 transition-colors tap-feedback"
          >
            <ChevronRight className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
        {games.map((game, index) => (
          <div key={game.id} className="flex-shrink-0 w-[28vw] md:w-[calc((100%-24px)/4.5)] lg:w-[calc((100%-56px)/8)]">
            <ApiGameCard
              game={game}
              isFavorite={favoriteIds?.has(game.id)}
              onToggleFavorite={onToggleFavorite}
              priority={index < 8}
            />
          </div>
        ))}
      </div>
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

const LiveCasino = () => {
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

  // Fetch live casino and table games from API
  const { games: liveGames, isLoading: liveLoading } = useGames({ category: 'live-casino', limit: 20 });
  const { games: tableGames, isLoading: tableLoading } = useGames({ category: 'table-games', limit: 20 });
  const { providers, isLoading: providersLoading } = useGameProviders();

  // Combine and filter games
  const allGames = [...liveGames, ...tableGames];
  const filteredGames = allGames.filter(game => {
    const matchesSearch = !searchTerm || game.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProvider = selectedProvider === 'all' || game.provider?.slug === selectedProvider;
    return matchesSearch && matchesProvider;
  });

  const isLoading = liveLoading || tableLoading;

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

          <MobilePageHeader title="Live Casino" />

          <HeroSection onOpenSignUp={() => setSignUpOpen(true)} />

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
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

          <GameCategoryNav activeTab="live" />

          {/* Game Sections */}
          <GameSection
            title="Live Casino"
            games={liveGames}
            isLoading={liveLoading}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
          />
          <GameSection
            title="Table Games"
            games={tableGames}
            isLoading={tableLoading}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
          />

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

export default LiveCasino;
