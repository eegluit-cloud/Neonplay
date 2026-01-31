import { useState, useEffect } from 'react';
import { useSidebar } from '@/hooks/useSidebar';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { PromoBanners } from '@/components/PromoBanners';
import { RecentWins } from '@/components/RecentWins';
import { GamesSection } from '@/components/GamesSection';
import { ProvidersCarousel } from '@/components/ProvidersCarousel';
import { DepositBanner, RegisterBanner } from '@/components/DepositBanner';
import { LastBets } from '@/components/LastBets';
import { CrashGamesSection } from '@/components/CrashGamesSection';
import { HotGamesSection } from '@/components/HotGamesSection';
import Leaderboard from '@/components/Leaderboard';
import { Footer } from '@/components/Footer';
import { AuthModals } from '@/components/AuthModals';
import { SpinGiftModal } from '@/components/SpinGiftModal';
import { BonusClaimedModal } from '@/components/BonusClaimedModal';
import { LowCoinModal } from '@/components/LowCoinModal';
import { GetCoinsModal } from '@/components/GetCoinsModal';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { SupportButton } from '@/components/SupportButton';
import { GameCategoryNav } from '@/components/GameCategoryNav';
import { JackpotTicker } from '@/components/JackpotTicker';
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
  
  // Prefetch common routes after initial load for instant navigation
  usePrefetchCommonRoutes(['/casino', '/sports', '/promotions', '/profile', '/favorites']);
  return <div className="min-h-screen min-h-[100dvh] bg-background">
      <Header onOpenSignIn={() => setSignInOpen(true)} onOpenSignUp={() => setSignUpOpen(true)} onToggleSidebar={toggleSidebar} />
      
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} onOpenSpinGift={() => setSpinGiftOpen(true)} onOpenBonusClaimed={() => setBonusClaimedOpen(true)} />
      
      {/* Main content with responsive sidebar margin */}
      {/* Mobile: no margin, tablet: conditional margin, desktop: conditional margin */}
      <div className={`transition-all duration-300 pt-14 md:pt-16 pb-20 md:pb-0 ${sidebarOpen ? 'md:ml-56' : 'md:ml-16'}`}>
        <main className="overflow-x-hidden page-transition-enter max-w-full">
          <div className="p-3 md:p-4 lg:p-6 space-y-3 md:space-y-4 lg:space-y-6">
            <HeroSection onOpenSignUp={() => setSignUpOpen(true)} />
            <PromoBanners onOpenSpinGift={() => setSpinGiftOpen(true)} />
            <RecentWins />
            
            {/* Search and Filters */}
            
            <div className="!mt-1 sm:!mt-2">
              <GameCategoryNav activeTab="lobby" />
            </div>
            
            <div id="slots">
              <GamesSection />
            </div>
            <div id="crash-games">
              <CrashGamesSection />
            </div>
            <ProvidersCarousel />
            
            <Leaderboard />
            
            <div id="hot-games">
              <HotGamesSection />
            </div>
            
            <Footer />
          </div>
        </main>
      </div>
      
      {/* Mobile bottom nav - hidden on tablet and desktop */}
      <MobileBottomNav onMenuClick={toggleSidebar} />

      
      
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
      
      <SupportButton />
    </div>;
};
export default Index;