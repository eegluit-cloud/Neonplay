import { useState, useEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSidebar } from '@/hooks/useSidebar';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { RecentWins } from '@/components/RecentWins';
import { GamesSection } from '@/components/GamesSection';
import { ProvidersCarousel } from '@/components/ProvidersCarousel';
import { CrashGamesSection } from '@/components/CrashGamesSection';
import { HotGamesSection } from '@/components/HotGamesSection';
import Leaderboard from '@/components/Leaderboard';
import { Footer } from '@/components/Footer';
import { SpinGiftModal } from '@/components/SpinGiftModal';
import { BonusClaimedModal } from '@/components/BonusClaimedModal';
import { LowCoinModal } from '@/components/LowCoinModal';
import { GetCoinsModal } from '@/components/GetCoinsModal';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { SupportButton } from '@/components/SupportButton';
import { GameCategoryNav } from '@/components/GameCategoryNav';
import { LiveSportsHighlights } from '@/components/LiveSportsHighlights';
import { PopularSportsEvents } from '@/components/PopularSportsEvents';
import { LobbyModeSwitcher, type LobbyMode } from '@/components/LobbyModeSwitcher';
import { BetslipProvider } from '@/contexts/BetslipContext';
import { BetslipBar } from '@/components/sports/BetslipBar';
import { BetslipPanel } from '@/components/sports/BetslipPanel';
import { LoginModal } from '@/components/LoginModal';
import { RegisterModal } from '@/components/RegisterModal';
import { usePrefetchCommonRoutes } from '@/hooks/useRoutePrefetch';

const Index = () => {
  const {
    sidebarOpen,
    toggleSidebar
  } = useSidebar();
  const [signInOpen, setSignInOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);
  const [spinGiftOpen, setSpinGiftOpen] = useState(false);
  const [bonusClaimedOpen, setBonusClaimedOpen] = useState(false);
  const [lowCoinOpen, setLowCoinOpen] = useState(false);
  const [getCoinsOpen, setGetCoinsOpen] = useState(false);
  const [lobbyMode, setLobbyMode] = useState<LobbyMode>('all');

  // Prefetch common routes after initial load for instant navigation
  usePrefetchCommonRoutes(['/casino', '/sports', '/promotions', '/profile', '/favorites']);

  // Refresh ScrollTrigger after layout stabilizes to fix position calculations
  // This prevents sections from staying invisible when triggers fire too early
  useEffect(() => {
    const timer = setTimeout(() => ScrollTrigger.refresh(), 200);
    return () => clearTimeout(timer);
  }, []);

  const showCasino = lobbyMode === 'all' || lobbyMode === 'casino';
  const showSports = lobbyMode === 'all' || lobbyMode === 'sports';

  return (
    <BetslipProvider>
      <div className="min-h-screen min-h-[100dvh] bg-background">
        <Header onOpenSignIn={() => setSignInOpen(true)} onOpenSignUp={() => setSignUpOpen(true)} onToggleSidebar={toggleSidebar} />

        <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} onOpenSpinGift={() => setSpinGiftOpen(true)} onOpenBonusClaimed={() => setBonusClaimedOpen(true)} />

        {/* Main content with responsive sidebar margin */}
        <div className={`transition-all duration-300 pt-14 md:pt-16 pb-20 md:pb-0 ${sidebarOpen ? 'md:ml-56' : 'md:ml-16'}`}>
          <main className="overflow-x-hidden page-transition-enter max-w-full">
            <div className="p-3 md:p-4 lg:p-6 space-y-3 md:space-y-4 lg:space-y-6">
              <HeroSection onOpenSignUp={() => setSignUpOpen(true)} />

              {/* Mode Switcher - All | Casino | Sports */}
              <LobbyModeSwitcher activeMode={lobbyMode} onModeChange={setLobbyMode} />

              {/* Live Sports Highlights */}
              {showSports && <LiveSportsHighlights />}

              {/* Recent Wins */}
              {showCasino && <RecentWins />}

              {/* Category Nav - dynamic tabs based on mode */}
              <div className="!mt-1 sm:!mt-2">
                <GameCategoryNav activeTab="lobby" mode={lobbyMode} />
              </div>

              {/* Casino: Slots Section */}
              {showCasino && (
                <div id="slots">
                  <GamesSection />
                </div>
              )}

              {/* Sports: Popular Events with filtering */}
              {showSports && <PopularSportsEvents />}

              {/* Casino: Crash Games */}
              {showCasino && (
                <div id="crash-games">
                  <CrashGamesSection />
                </div>
              )}

              {/* Casino: Providers Carousel */}
              {showCasino && <ProvidersCarousel />}

              {/* Casino: Hot Games */}
              {showCasino && (
                <div id="hot-games">
                  <HotGamesSection />
                </div>
              )}

              {/* Leaderboard - always visible */}
              <Leaderboard />

              <Footer />
            </div>
          </main>
        </div>

        {/* Mobile bottom nav - hidden on tablet and desktop */}
        <MobileBottomNav onMenuClick={toggleSidebar} />

        {/* Betslip UI for sports odds on the lobby */}
        <BetslipBar />
        <BetslipPanel />

        <SpinGiftModal isOpen={spinGiftOpen} onClose={() => setSpinGiftOpen(false)} />

        <BonusClaimedModal isOpen={bonusClaimedOpen} onClose={() => setBonusClaimedOpen(false)} />

        <LowCoinModal
          isOpen={lowCoinOpen}
          onClose={() => setLowCoinOpen(false)}
          onBuyCoins={() => {
            setLowCoinOpen(false);
            setGetCoinsOpen(true);
          }}
        />

        <GetCoinsModal
          isOpen={getCoinsOpen}
          onClose={() => setGetCoinsOpen(false)}
        />

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

        <SupportButton />
      </div>
    </BetslipProvider>
  );
};
export default Index;
