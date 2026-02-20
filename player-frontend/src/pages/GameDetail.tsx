import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSidebar } from '@/hooks/useSidebar';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { LoginModal } from '@/components/LoginModal';
import { RegisterModal } from '@/components/RegisterModal';
import { SpinGiftModal } from '@/components/SpinGiftModal';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { useGame } from '@/hooks/useGames';
import { useWallet } from '@/contexts/AppModeContext';
import { gamesApi } from '@/lib/api';
import { ChevronLeft, Maximize, Minimize, Loader2, AlertCircle, Play } from 'lucide-react';

const GameDetail = () => {
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId: string }>();
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [signInOpen, setSignInOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);
  const [spinGiftOpen, setSpinGiftOpen] = useState(false);

  const { game, isLoading: gameLoading, error: gameError } = useGame(gameId || '');
  const { primaryCurrency } = useWallet();

  const [launchUrl, setLaunchUrl] = useState<string | null>(null);
  const [launching, setLaunching] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [prevCurrency, setPrevCurrency] = useState(primaryCurrency);

  useEffect(() => {
    if (primaryCurrency !== prevCurrency) {
      setLaunchUrl(null);
      setLaunchError(null);
      setPrevCurrency(primaryCurrency);
    }
  }, [primaryCurrency, prevCurrency]);

  const handleLaunchGame = useCallback(async () => {
    if (!gameId) return;
    setLaunching(true);
    setLaunchError(null);
    try {
      const response = await gamesApi.launchGame(gameId, primaryCurrency);
      setLaunchUrl(response.data.launchUrl);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to launch game';
      setLaunchError(msg);
    } finally {
      setLaunching(false);
    }
  }, [gameId, primaryCurrency]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  if (isFullscreen && launchUrl) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black">
        <iframe src={launchUrl} className="w-full h-full border-0" allow="autoplay; fullscreen; encrypted-media" allowFullScreen title={game?.name || 'Game'} />
        <button onClick={toggleFullscreen} className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/70 hover:bg-black/90 text-white transition-colors">
          <Minimize className="w-5 h-5" />
        </button>
      </div>
    );
  }

  const sidebarClass = sidebarOpen ? 'md:ml-56' : 'md:ml-16';

  return (
    <div className="min-h-screen bg-background">
      <Header onOpenSignIn={() => setSignInOpen(true)} onOpenSignUp={() => setSignUpOpen(true)} onToggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} onOpenSpinGift={() => setSpinGiftOpen(true)} />

      <div className={`transition-all duration-300 pt-14 md:pt-16 pb-20 md:pb-0 ${sidebarClass}`}>
        <main className="p-2 md:p-3 lg:p-4 space-y-2 md:space-y-3 overflow-x-hidden max-w-full">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-colors">
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <span className="font-semibold text-foreground">Back To Games</span>
          </div>

          {gameLoading && (
            <div className="flex items-center justify-center h-[60vh]">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            </div>
          )}

          {gameError && !gameLoading && (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
              <AlertCircle className="w-12 h-12 text-red-400" />
              <p className="text-muted-foreground">Failed to load game</p>
              <button onClick={() => navigate(-1)} className="px-4 py-2 rounded-lg bg-cyan-500 text-white text-sm hover:bg-cyan-600 transition-colors">Go Back</button>
            </div>
          )}

          {game && !gameLoading && (
            <div key={primaryCurrency}>
              <div className="relative rounded-2xl overflow-hidden bg-black">
                <div className="w-full aspect-video bg-black flex items-center justify-center relative">
                  {launchUrl ? (
                    <iframe src={launchUrl} className="w-full h-full border-0" allow="autoplay; fullscreen; encrypted-media" allowFullScreen title={game.name} />
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      {game.thumbnailUrl && <img src={game.thumbnailUrl} alt={game.name} className="absolute inset-0 w-full h-full object-cover opacity-30" />}
                      <button onClick={handleLaunchGame} disabled={launching} className="relative z-10 w-20 h-20 flex items-center justify-center rounded-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-500/50 transition-colors shadow-lg shadow-cyan-500/30">
                        {launching ? <Loader2 className="w-8 h-8 animate-spin text-white" /> : <Play className="w-8 h-8 text-white ml-1" />}
                      </button>
                      <p className="relative z-10 text-white/80 text-sm">{launching ? 'Loading game...' : 'Click to play (' + primaryCurrency + ')'}</p>
                      {launchError && <p className="relative z-10 text-red-400 text-sm max-w-md text-center">{launchError}</p>}
                    </div>
                  )}
                </div>
                {launchUrl && (
                  <div className="flex items-center justify-between px-4 py-3 bg-[#1a1a1a] border-t border-border/30">
                    <div className="text-sm text-muted-foreground truncate">{game.name} ({primaryCurrency})</div>
                    <button onClick={toggleFullscreen} className="w-8 h-8 rounded-lg bg-[#2a2a2a] hover:bg-[#3a3a3a] flex items-center justify-center transition-colors">
                      <Maximize className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                )}
              </div>
              <div className="bg-[#1a1a1a] rounded-xl px-4 py-3 mt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-base font-bold text-foreground">{game.name}</h1>
                    <p className="text-sm text-muted-foreground">By <span className="text-cyan-400">{game.provider?.name}</span></p>
                  </div>
                  {game.rtp && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">RTP</span>
                      <span className="text-sm font-bold text-cyan-400">{game.rtp}%</span>
                    </div>
                  )}
                </div>
              </div>
              <Footer />
            </div>
          )}
        </main>
      </div>

      <LoginModal isOpen={signInOpen} onClose={() => setSignInOpen(false)} onSwitchToRegister={() => { setSignInOpen(false); setSignUpOpen(true); }} />
      <RegisterModal isOpen={signUpOpen} onClose={() => setSignUpOpen(false)} onSwitchToLogin={() => { setSignUpOpen(false); setSignInOpen(true); }} />
      <SpinGiftModal isOpen={spinGiftOpen} onClose={() => setSpinGiftOpen(false)} />
      <MobileBottomNav onMenuClick={toggleSidebar} />
    </div>
  );
};

export default GameDetail;
