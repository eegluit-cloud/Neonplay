import { useState } from 'react';
import { useSidebar } from '@/hooks/useSidebar';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { LoginModal } from '@/components/LoginModal';
import { RegisterModal } from '@/components/RegisterModal';
import { SpinGiftModal } from '@/components/SpinGiftModal';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { MobilePageHeader } from '@/components/MobilePageHeader';
import { Search, LayoutGrid, User } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HeroSection } from '@/components/HeroSection';
import { GameCategoryNav } from '@/components/GameCategoryNav';
import { ApiGameGrid } from '@/components/ApiGameCard';
import { useGames, useGameProviders } from '@/hooks/useGames';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';

const CrashGames = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [signInOpen, setSignInOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);
  const [spinGiftOpen, setSpinGiftOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [selectedVolatility, setSelectedVolatility] = useState('all');

  const { isAuthenticated } = useAuth();
  const { favoriteIds, toggleFavorite } = useFavorites();

  // Fetch crash games from API
  const { games, isLoading } = useGames({ category: 'crash', limit: 50 });
  const { providers } = useGameProviders();

  // Filter games based on search and provider
  const filteredGames = games.filter(game => {
    const matchesSearch = !searchTerm || game.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProvider = selectedProvider === 'all' || game.provider?.slug === selectedProvider;
    return matchesSearch && matchesProvider;
  });

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
    <div className="min-h-screen bg-background">
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
        <main className="p-3 md:p-4 lg:p-6 space-y-4 md:space-y-6 overflow-x-hidden max-w-full">

          <MobilePageHeader title="Crash Games" />

          <HeroSection onOpenSignUp={() => setSignUpOpen(true)} />

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
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

          <GameCategoryNav activeTab="crash" />

          {/* Games Grid */}
          <ApiGameGrid
            games={filteredGames}
            isLoading={isLoading}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
            emptyMessage="No crash games found"
          />

          <Footer />
        </main>
      </div>

      <LoginModal
        isOpen={signInOpen}
        onClose={() => setSignInOpen(false)}
        onSwitchToRegister={() => { setSignInOpen(false); setSignUpOpen(true); }}
      />
      <RegisterModal
        isOpen={signUpOpen}
        onClose={() => setSignUpOpen(false)}
        onSwitchToLogin={() => { setSignUpOpen(false); setSignInOpen(true); }}
      />

      <SpinGiftModal isOpen={spinGiftOpen} onClose={() => setSpinGiftOpen(false)} />
      <MobileBottomNav onMenuClick={toggleSidebar} />
    </div>
  );
};

export default CrashGames;
