import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSidebar } from '@/hooks/useSidebar';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { LoginModal } from '@/components/LoginModal';
import { RegisterModal } from '@/components/RegisterModal';
import { SpinGiftModal } from '@/components/SpinGiftModal';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { MobilePageHeader } from '@/components/MobilePageHeader';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { ApiGameGrid } from '@/components/ApiGameCard';
import { useGames, useGameProviders } from '@/hooks/useGames';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';

const ProviderGames = () => {
  const { providerId } = useParams<{ providerId: string }>();
  const navigate = useNavigate();
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [signInOpen, setSignInOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);
  const [spinGiftOpen, setSpinGiftOpen] = useState(false);

  const { isAuthenticated } = useAuth();
  const { favoriteIds, toggleFavorite } = useFavorites();

  // Fetch games by provider from API
  const { games, isLoading } = useGames({ provider: providerId, limit: 100 });
  const { providers } = useGameProviders();

  // Get provider name
  const provider = providers.find(p => p.slug === providerId);
  const providerName = provider?.name || providerId || 'Unknown Provider';

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

          {/* Mobile Header with Back Button */}
          <MobilePageHeader title={providerName} />

          {/* Desktop Title */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <h1 className="text-base font-bold text-foreground">{providerName} Games</h1>
          </div>

          {/* Games Grid */}
          <ApiGameGrid
            games={games}
            isLoading={isLoading}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
            emptyMessage="No games found for this provider."
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

export default ProviderGames;
