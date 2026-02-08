import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSidebar } from '@/hooks/useSidebar';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { LoginModal } from '@/components/LoginModal';
import { RegisterModal } from '@/components/RegisterModal';
import { SpinGiftModal } from '@/components/SpinGiftModal';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { MobilePageHeader } from '@/components/MobilePageHeader';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Clock, Coins, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { promotionsApi } from '@/lib/api';
import { Promotion } from '@/types/promotion';
import { DynamicPromotionCard } from '@/components/DynamicPromotionCard';
import { Loader2 } from 'lucide-react';

// Import promo images
import spinWheelImg from '@/assets/spin-wheel-new.png';
import coinBagImg from '@/assets/coin-bag.png';
import treasureChestImg from '@/assets/treasure-chest-coins.png';
import stadiumBg from '@/assets/stadium-bg.jpg';
import monthlyTreasureChest from '@/assets/monthly-treasure-chest.png';
import vipCrownImg from '@/assets/vip-crown-gold.png';

const useDailyCountdown = () => {
  const [seconds, setSeconds] = useState(12 * 3600); // 12 hours

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => (prev > 0 ? prev - 1 : 12 * 3600));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return { hours, minutes, secs };
};

const useSpinCountdown = () => {
  const [seconds, setSeconds] = useState(24 * 3600); // 24 hours

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => (prev > 0 ? prev - 1 : 24 * 3600));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return { hours, minutes, secs };
};

const useWeeklyCountdown = () => {
  const [seconds, setSeconds] = useState(72 * 3600); // 72 hours = 3 days

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => (prev > 0 ? prev - 1 : 72 * 3600));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return { days, hours, minutes, secs };
};

const useMonthlyCountdown = () => {
  const [seconds, setSeconds] = useState(14 * 86400); // 14 days

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => (prev > 0 ? prev - 1 : 14 * 86400));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return { days, hours, minutes, secs };
};

const useMegaJackpot = () => {
  const [amount, setAmount] = useState(1234567.89);

  useEffect(() => {
    const interval = setInterval(() => {
      setAmount(prev => prev + Math.random() * 0.03 + 0.01);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const Promotions = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [signInOpen, setSignInOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);
  const [spinGiftOpen, setSpinGiftOpen] = useState(false);
  const [bonusModalOpen, setBonusModalOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<{ title: string; subtitle: string; image?: string } | null>(null);

  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  const dailyCountdown = useDailyCountdown();
  const weeklyCountdown = useWeeklyCountdown();
  const monthlyCountdown = useMonthlyCountdown();
  const spinCountdown = useSpinCountdown();
  const megaJackpot = useMegaJackpot();

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const response = await promotionsApi.getAll();
        const data = response.data;
        const promoList = Array.isArray(data) ? data : (data.bonuses || []);
        setPromotions(promoList);
      } catch (error) {
        console.error('Failed to fetch promotions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPromotions();
  }, []);

  useEffect(() => {
    if (location.state?.bonusNotification) {
      const notif = location.state.bonusNotification;
      setSelectedPromotion({
        title: notif.title,
        subtitle: notif.message,
        image: notif.image
      });
      setBonusModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const openBonusModal = (title: string, subtitle: string, image?: string) => {
    setSelectedPromotion({ title, subtitle, image });
    setBonusModalOpen(true);
  };

  const renderSpecialCard = (slug: string) => {
    switch (slug) {
      case 'daily-spin':
      case 'spin-wheel':
        return (
          <div
            key="spin-wheel"
            className="relative w-full rounded-2xl overflow-hidden h-[200px] sm:h-[240px] cursor-pointer group"
            onClick={() => setSpinGiftOpen(true)}
          >
            <div className="absolute inset-0">
              <img src={stadiumBg} alt="" className="w-full h-full object-cover opacity-25 blur-[2px]" />
              <div className="absolute inset-0 bg-gradient-to-br from-red-900/80 via-[#3a1a1a]/70 to-[#1a1a1a]/60" />
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-48 h-48 sm:w-56 sm:h-56 bg-gradient-radial from-red-500/20 via-orange-500/10 to-transparent rounded-full blur-2xl" />
            <div className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-40 sm:w-48 h-40 sm:h-48">
              <img src={spinWheelImg} alt="" className="w-full h-full object-contain drop-shadow-2xl animate-spin" style={{ animationDuration: '3s' }} />
            </div>

            <div className="absolute left-0 top-0 bottom-0 w-[60%] sm:w-[55%] rounded-r-2xl overflow-hidden">
              <div className="absolute inset-0 backdrop-blur-xl bg-white/5 border-r border-white/20 shadow-[inset_0_0_30px_rgba(255,255,255,0.05)]" />
              <div className="relative h-full p-4 sm:p-5 flex flex-col justify-center">
                <p className="text-red-400/90 text-[10px] sm:text-xs mb-0.5">Daily Spin</p>
                <p className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">Free Spin!</p>

                <div className="flex items-center gap-1.5 mb-2 sm:mb-3">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                  <div className="flex items-center gap-1">
                    <div className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded px-1.5 py-0.5">
                      <span className="text-white font-bold text-xs sm:text-sm">{String(spinCountdown.hours).padStart(2, '0')}</span>
                      <span className="text-red-400 text-[8px] sm:text-[10px] ml-0.5">h</span>
                    </div>
                    <span className="text-red-400">:</span>
                    <div className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded px-1.5 py-0.5">
                      <span className="text-white font-bold text-xs sm:text-sm">{String(spinCountdown.minutes).padStart(2, '0')}</span>
                      <span className="text-red-400 text-[8px] sm:text-[10px] ml-0.5">m</span>
                    </div>
                    <span className="text-red-400">:</span>
                    <div className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded px-1.5 py-0.5">
                      <span className="text-white font-bold text-xs sm:text-sm">{String(spinCountdown.secs).padStart(2, '0')}</span>
                      <span className="text-red-400 text-[8px] sm:text-[10px] ml-0.5">s</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-2 gap-y-1 sm:gap-y-1.5 mb-2 sm:mb-3">
                  <div>
                    <p className="text-red-500/60 text-[8px] sm:text-[10px]">Status</p>
                    <p className="text-cyan-400 font-semibold text-xs sm:text-sm">Available</p>
                  </div>
                  <div>
                    <p className="text-red-500/60 text-[8px] sm:text-[10px]">Frequency</p>
                    <p className="text-white font-semibold text-xs sm:text-sm">Every 24h</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="px-3 sm:px-5 py-1.5 sm:py-2 bg-gradient-to-r from-red-500 to-orange-400 hover:from-red-600 hover:to-orange-500 text-white font-semibold rounded-lg text-[10px] sm:text-sm transition-all shadow-lg shadow-red-500/20">
                    Spin Now!
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'mega-jackpot':
        return (
          <div key="mega-jackpot" className="relative w-full rounded-2xl overflow-hidden h-[200px] sm:h-[240px]">
            <div className="absolute inset-0">
              <img src={stadiumBg} alt="" className="w-full h-full object-cover opacity-25 blur-[2px]" />
              <div className="absolute inset-0 bg-gradient-to-br from-rose-900/80 via-[#3a1a2a]/70 to-[#1a1a1a]/60" />
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-48 h-48 sm:w-56 sm:h-56 bg-gradient-radial from-rose-500/30 via-pink-500/15 to-transparent rounded-full blur-2xl animate-pulse" />
            <img src={monthlyTreasureChest} alt="" className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-40 sm:w-48 h-auto object-contain drop-shadow-2xl" />

            <div className="absolute left-0 top-0 bottom-0 w-[60%] sm:w-[55%] rounded-r-2xl overflow-hidden">
              <div className="absolute inset-0 backdrop-blur-xl bg-white/5 border-r border-white/20 shadow-[inset_0_0_30px_rgba(255,255,255,0.05)]" />
              <div className="relative h-full p-4 sm:p-5 flex flex-col justify-center">
                <p className="text-rose-400/90 text-[10px] sm:text-xs mb-0.5">Mega Jackpot</p>
                <p className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">
                  <span className="text-green-400">$</span>
                  <span className="text-white tabular-nums">{megaJackpot}</span>
                </p>

                <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4">Win the ultimate prize!</p>

                <div className="grid grid-cols-2 gap-x-2 gap-y-1 sm:gap-y-1.5 mb-2 sm:mb-3">
                  <div>
                    <p className="text-rose-500/60 text-[8px] sm:text-[10px]">Winners</p>
                    <p className="text-white font-semibold text-xs sm:text-sm">142</p>
                  </div>
                  <div>
                    <p className="text-rose-500/60 text-[8px] sm:text-[10px]">Last Winner</p>
                    <p className="text-white font-semibold text-xs sm:text-sm">$523,000</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => openBonusModal("Mega Jackpot", "Try your luck at the Mega Jackpot")} className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/10 rounded-lg text-gray-300 hover:text-white transition-colors text-[10px] sm:text-xs font-medium">
                    Details
                    <ChevronRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => { window.scrollTo(0, 0); navigate('/slots'); }}
                    className="px-3 sm:px-5 py-1.5 sm:py-2 bg-gradient-to-r from-rose-500 to-pink-400 hover:from-rose-600 hover:to-pink-500 text-white font-semibold rounded-lg text-[10px] sm:text-sm transition-all shadow-lg shadow-rose-500/20"
                  >
                    Play Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
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
        <main className="page-transition-enter max-w-full">
          <div className="p-3 md:p-4 lg:p-6 space-y-4 md:space-y-6">

          <MobilePageHeader title="" />

          <div className="-mb-0.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
                Promotions
              </span>
            </h1>
            <p className="text-gray-400 text-sm mt-0 mb-0">Claim your daily bonuses and rewards</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {promotions.map(promo => {
                if (promo.slug === 'spin-wheel' || promo.type === 'spin_wheel') {
                  return renderSpecialCard('spin-wheel');
                }
                if (promo.slug === 'mega-jackpot') {
                  return renderSpecialCard('mega-jackpot');
                }
                return <DynamicPromotionCard key={promo.id} promotion={promo} />;
              })}

              {promotions.length === 0 && (
                <>
                  <div
                    className="relative w-full rounded-2xl overflow-hidden h-[200px] sm:h-[240px] cursor-pointer group"
                    onClick={() => setSpinGiftOpen(true)}
                  >
                    <div className="absolute inset-0">
                      <img src={stadiumBg} alt="" className="w-full h-full object-cover opacity-25 blur-[2px]" />
                      <div className="absolute inset-0 bg-gradient-to-br from-red-900/80 via-[#3a1a1a]/70 to-[#1a1a1a]/60" />
                    </div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-48 h-48 sm:w-56 sm:h-56 bg-gradient-radial from-red-500/20 via-orange-500/10 to-transparent rounded-full blur-2xl" />
                    <div className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-40 sm:w-48 h-40 sm:h-48">
                      <img src={spinWheelImg} alt="" className="w-full h-full object-contain drop-shadow-2xl animate-spin" style={{ animationDuration: '3s' }} />
                    </div>

                    <div className="absolute left-0 top-0 bottom-0 w-[60%] sm:w-[55%] rounded-r-2xl overflow-hidden">
                      <div className="absolute inset-0 backdrop-blur-xl bg-white/5 border-r border-white/20 shadow-[inset_0_0_30px_rgba(255,255,255,0.05)]" />
                      <div className="relative h-full p-4 sm:p-5 flex flex-col justify-center">
                        <p className="text-red-400/90 text-[10px] sm:text-xs mb-0.5">Daily Spin</p>
                        <p className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">Free Spin!</p>

                        <div className="flex items-center gap-1.5 mb-2 sm:mb-3">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                          <div className="flex items-center gap-1">
                            <div className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded px-1.5 py-0.5">
                              <span className="text-white font-bold text-xs sm:text-sm">{String(spinCountdown.hours).padStart(2, '0')}</span>
                              <span className="text-red-400 text-[8px] sm:text-[10px] ml-0.5">h</span>
                            </div>
                            <span className="text-red-400">:</span>
                            <div className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded px-1.5 py-0.5">
                              <span className="text-white font-bold text-xs sm:text-sm">{String(spinCountdown.minutes).padStart(2, '0')}</span>
                              <span className="text-red-400 text-[8px] sm:text-[10px] ml-0.5">m</span>
                            </div>
                            <span className="text-red-400">:</span>
                            <div className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded px-1.5 py-0.5">
                              <span className="text-white font-bold text-xs sm:text-sm">{String(spinCountdown.secs).padStart(2, '0')}</span>
                              <span className="text-red-400 text-[8px] sm:text-[10px] ml-0.5">s</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 sm:gap-y-1.5 mb-2 sm:mb-3">
                          <div>
                            <p className="text-red-500/60 text-[8px] sm:text-[10px]">Status</p>
                            <p className="text-cyan-400 font-semibold text-xs sm:text-sm">Available</p>
                          </div>
                          <div>
                            <p className="text-red-500/60 text-[8px] sm:text-[10px]">Frequency</p>
                            <p className="text-white font-semibold text-xs sm:text-sm">Every 24h</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button className="px-3 sm:px-5 py-1.5 sm:py-2 bg-gradient-to-r from-red-500 to-orange-400 hover:from-red-600 hover:to-orange-500 text-white font-semibold rounded-lg text-[10px] sm:text-sm transition-all shadow-lg shadow-red-500/20">
                            Spin Now!
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative w-full rounded-2xl overflow-hidden h-[200px] sm:h-[240px]">
                    <div className="absolute inset-0">
                      <img src={stadiumBg} alt="" className="w-full h-full object-cover opacity-25 blur-[2px]" />
                      <div className="absolute inset-0 bg-gradient-to-br from-rose-900/80 via-[#3a1a2a]/70 to-[#1a1a1a]/60" />
                    </div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-48 h-48 sm:w-56 sm:h-56 bg-gradient-radial from-rose-500/30 via-pink-500/15 to-transparent rounded-full blur-2xl animate-pulse" />
                    <img src={monthlyTreasureChest} alt="" className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-40 sm:w-48 h-auto object-contain drop-shadow-2xl" />

                    <div className="absolute left-0 top-0 bottom-0 w-[60%] sm:w-[55%] rounded-r-2xl overflow-hidden">
                      <div className="absolute inset-0 backdrop-blur-xl bg-white/5 border-r border-white/20 shadow-[inset_0_0_30px_rgba(255,255,255,0.05)]" />
                      <div className="relative h-full p-4 sm:p-5 flex flex-col justify-center">
                        <p className="text-rose-400/90 text-[10px] sm:text-xs mb-0.5">Mega Jackpot</p>
                        <p className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">
                          <span className="text-green-400">$</span>
                          <span className="text-white tabular-nums">{megaJackpot}</span>
                        </p>

                        <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4">Win the ultimate prize!</p>

                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 sm:gap-y-1.5 mb-2 sm:mb-3">
                          <div>
                            <p className="text-rose-500/60 text-[8px] sm:text-[10px]">Winners</p>
                            <p className="text-white font-semibold text-xs sm:text-sm">142</p>
                          </div>
                          <div>
                            <p className="text-rose-500/60 text-[8px] sm:text-[10px]">Last Winner</p>
                            <p className="text-white font-semibold text-xs sm:text-sm">$523,000</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button onClick={() => openBonusModal("Mega Jackpot", "Try your luck at the Mega Jackpot")} className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/10 rounded-lg text-gray-300 hover:text-white transition-colors text-[10px] sm:text-xs font-medium">
                            Details
                            <ChevronRight className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => { window.scrollTo(0, 0); navigate('/slots'); }}
                            className="px-3 sm:px-5 py-1.5 sm:py-2 bg-gradient-to-r from-rose-500 to-pink-400 hover:from-rose-600 hover:to-pink-500 text-white font-semibold rounded-lg text-[10px] sm:text-sm transition-all shadow-lg shadow-rose-500/20"
                          >
                            Play Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative w-full rounded-2xl overflow-hidden h-[200px] sm:h-[240px]">
                    <div className="absolute inset-0">
                      <img src={stadiumBg} alt="" className="w-full h-full object-cover opacity-25 blur-[2px]" />
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-[#2a1a3a]/70 to-[#1a1a2a]/60" />
                    </div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-48 h-48 sm:w-56 sm:h-56 bg-gradient-radial from-purple-500/20 via-amber-500/10 to-transparent rounded-full blur-2xl" />
                    <img src={treasureChestImg} alt="" className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-40 sm:w-48 h-auto object-contain drop-shadow-2xl" />

                    <div className="absolute left-0 top-0 bottom-0 w-[60%] sm:w-[55%] rounded-r-2xl overflow-hidden">
                      <div className="absolute inset-0 backdrop-blur-xl bg-white/5 border-r border-white/20 shadow-[inset_0_0_30px_rgba(255,255,255,0.05)]" />
                      <div className="relative h-full p-4 sm:p-5 flex flex-col justify-center">
                        <p className="text-purple-400/90 text-[10px] sm:text-xs mb-0.5">Weekly Spins Bonus</p>
                        <p className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">100 Free Spins</p>

                        <div className="flex items-center gap-1.5 mb-2 sm:mb-3">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                          <div className="flex items-center gap-1">
                            <div className="bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 rounded px-1.5 py-0.5">
                              <span className="text-white font-bold text-xs sm:text-sm">{weeklyCountdown.days}</span>
                              <span className="text-purple-400 text-[8px] sm:text-[10px] ml-0.5">d</span>
                            </div>
                            <span className="text-purple-400">:</span>
                            <div className="bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 rounded px-1.5 py-0.5">
                              <span className="text-white font-bold text-xs sm:text-sm">{String(weeklyCountdown.hours).padStart(2, '0')}</span>
                              <span className="text-purple-400 text-[8px] sm:text-[10px] ml-0.5">h</span>
                            </div>
                            <span className="text-purple-400">:</span>
                            <div className="bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 rounded px-1.5 py-0.5">
                              <span className="text-white font-bold text-xs sm:text-sm">{String(weeklyCountdown.minutes).padStart(2, '0')}</span>
                              <span className="text-purple-400 text-[8px] sm:text-[10px] ml-0.5">m</span>
                            </div>
                            <span className="text-purple-400">:</span>
                            <div className="bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 rounded px-1.5 py-0.5">
                              <span className="text-white font-bold text-xs sm:text-sm">{String(weeklyCountdown.secs).padStart(2, '0')}</span>
                              <span className="text-purple-400 text-[8px] sm:text-[10px] ml-0.5">s</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 sm:gap-y-1.5 mb-2 sm:mb-3">
                          <div>
                            <p className="text-purple-500/60 text-[8px] sm:text-[10px]">Spins Value</p>
                            <p className="text-white font-semibold text-xs sm:text-sm">$0.10 each</p>
                          </div>
                          <div>
                            <p className="text-purple-500/60 text-[8px] sm:text-[10px]">Total Value</p>
                            <p className="text-white font-semibold text-xs sm:text-sm">$10</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button onClick={() => openBonusModal("Weekly Bonus", "View your weekly bonus details")} className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/10 rounded-lg text-gray-300 hover:text-white transition-colors text-[10px] sm:text-xs font-medium">
                            Details
                            <ChevronRight className="w-3 h-3" />
                          </button>
                          <button disabled className="px-3 sm:px-5 py-1.5 sm:py-2 bg-gray-600/50 text-gray-400 font-semibold rounded-lg text-[10px] sm:text-sm cursor-not-allowed opacity-70">
                            Claim
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative w-full rounded-2xl overflow-hidden h-[200px] sm:h-[240px]">
                    <div className="absolute inset-0">
                      <img src={stadiumBg} alt="" className="w-full h-full object-cover opacity-25 blur-[2px]" />
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-900/80 via-[#3a2a1a]/70 to-[#1a1a1a]/60" />
                    </div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-48 h-48 sm:w-56 sm:h-56 bg-gradient-radial from-amber-500/20 via-orange-500/10 to-transparent rounded-full blur-2xl" />
                    <img src={monthlyTreasureChest} alt="" className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-40 sm:w-48 h-auto object-contain drop-shadow-2xl" />

                    <div className="absolute left-0 top-0 bottom-0 w-[60%] sm:w-[55%] rounded-r-2xl overflow-hidden">
                      <div className="absolute inset-0 backdrop-blur-xl bg-white/5 border-r border-white/20 shadow-[inset_0_0_30px_rgba(255,255,255,0.05)]" />
                      <div className="relative h-full p-4 sm:p-5 flex flex-col justify-center">
                        <p className="text-amber-400/90 text-[10px] sm:text-xs mb-0.5">Monthly Spins Bonus</p>
                        <p className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">200 Free Spins</p>

                        <div className="flex items-center gap-1.5 mb-2 sm:mb-3">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400" />
                          <div className="flex items-center gap-1">
                            <div className="bg-amber-500/20 backdrop-blur-sm border border-amber-500/30 rounded px-1.5 py-0.5">
                              <span className="text-white font-bold text-xs sm:text-sm">{monthlyCountdown.days}</span>
                              <span className="text-amber-400 text-[8px] sm:text-[10px] ml-0.5">d</span>
                            </div>
                            <span className="text-amber-400">:</span>
                            <div className="bg-amber-500/20 backdrop-blur-sm border border-amber-500/30 rounded px-1.5 py-0.5">
                              <span className="text-white font-bold text-xs sm:text-sm">{String(monthlyCountdown.hours).padStart(2, '0')}</span>
                              <span className="text-amber-400 text-[8px] sm:text-[10px] ml-0.5">h</span>
                            </div>
                            <span className="text-amber-400">:</span>
                            <div className="bg-amber-500/20 backdrop-blur-sm border border-amber-500/30 rounded px-1.5 py-0.5">
                              <span className="text-white font-bold text-xs sm:text-sm">{String(monthlyCountdown.minutes).padStart(2, '0')}</span>
                              <span className="text-amber-400 text-[8px] sm:text-[10px] ml-0.5">m</span>
                            </div>
                            <span className="text-amber-400">:</span>
                            <div className="bg-amber-500/20 backdrop-blur-sm border border-amber-500/30 rounded px-1.5 py-0.5">
                              <span className="text-white font-bold text-xs sm:text-sm">{String(monthlyCountdown.secs).padStart(2, '0')}</span>
                              <span className="text-amber-400 text-[8px] sm:text-[10px] ml-0.5">s</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 sm:gap-y-1.5 mb-2 sm:mb-3">
                          <div>
                            <p className="text-amber-500/60 text-[8px] sm:text-[10px]">Spins Value</p>
                            <p className="text-white font-semibold text-xs sm:text-sm">$0.10 each</p>
                          </div>
                          <div>
                            <p className="text-amber-500/60 text-[8px] sm:text-[10px]">Total Value</p>
                            <p className="text-white font-semibold text-xs sm:text-sm">$20</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button onClick={() => openBonusModal("Monthly Bonus", "View your monthly bonus details")} className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/10 rounded-lg text-gray-300 hover:text-white transition-colors text-[10px] sm:text-xs font-medium">
                            Details
                            <ChevronRight className="w-3 h-3" />
                          </button>
                          <button disabled className="px-3 sm:px-5 py-1.5 sm:py-2 bg-gray-600/50 text-gray-400 font-semibold rounded-lg text-[10px] sm:text-sm cursor-not-allowed opacity-70">
                            Claim
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative w-full rounded-2xl overflow-hidden h-[200px] sm:h-[240px]">
                    <div className="absolute inset-0">
                      <img src={stadiumBg} alt="" className="w-full h-full object-cover opacity-25 blur-[2px]" />
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/80 via-[#3a2a1a]/70 to-[#1a1a1a]/60" />
                    </div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-48 h-48 sm:w-56 sm:h-56 bg-gradient-radial from-yellow-500/30 via-amber-500/15 to-transparent rounded-full blur-2xl animate-pulse" />
                    <img src={coinBagImg} alt="" className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-40 sm:w-48 h-auto object-contain drop-shadow-2xl" />

                    <div className="absolute left-0 top-0 bottom-0 w-[60%] sm:w-[55%] rounded-r-2xl overflow-hidden">
                      <div className="absolute inset-0 backdrop-blur-xl bg-white/5 border-r border-white/20 shadow-[inset_0_0_30px_rgba(255,255,255,0.05)]" />
                      <div className="relative h-full p-4 sm:p-5 flex flex-col justify-center">
                        <p className="text-yellow-400/90 text-[10px] sm:text-xs mb-0.5">Daily Bonus</p>
                        <p className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 mb-2 sm:mb-3">$10 Bonus</p>

                        <div className="flex items-center gap-1.5 mb-2 sm:mb-3">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                          <div className="flex items-center gap-1">
                            <div className="bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/30 rounded px-1.5 py-0.5">
                              <span className="text-white font-bold text-xs sm:text-sm">{String(dailyCountdown.hours).padStart(2, '0')}</span>
                              <span className="text-yellow-400 text-[8px] sm:text-[10px] ml-0.5">h</span>
                            </div>
                            <span className="text-yellow-400">:</span>
                            <div className="bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/30 rounded px-1.5 py-0.5">
                              <span className="text-white font-bold text-xs sm:text-sm">{String(dailyCountdown.minutes).padStart(2, '0')}</span>
                              <span className="text-yellow-400 text-[8px] sm:text-[10px] ml-0.5">m</span>
                            </div>
                            <span className="text-yellow-400">:</span>
                            <div className="bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/30 rounded px-1.5 py-0.5">
                              <span className="text-white font-bold text-xs sm:text-sm">{String(dailyCountdown.secs).padStart(2, '0')}</span>
                              <span className="text-yellow-400 text-[8px] sm:text-[10px] ml-0.5">s</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 sm:gap-y-1.5 mb-2 sm:mb-3">
                          <div>
                            <p className="text-yellow-500/60 text-[8px] sm:text-[10px]">Frequency</p>
                            <p className="text-white font-semibold text-xs sm:text-sm">Every 24h</p>
                          </div>
                          <div>
                            <p className="text-yellow-500/60 text-[8px] sm:text-[10px]">Status</p>
                            <p className="text-cyan-400 font-semibold text-xs sm:text-sm">Available</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button onClick={() => openBonusModal("Daily Bonus", "Claim your free $10 bonus every 24 hours!")} className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/10 rounded-lg text-gray-300 hover:text-white transition-colors text-[10px] sm:text-xs font-medium">
                            Details
                            <ChevronRight className="w-3 h-3" />
                          </button>
                          <button className="px-3 sm:px-5 py-1.5 sm:py-2 bg-gradient-to-r from-yellow-500 to-amber-400 hover:from-yellow-600 hover:to-amber-500 text-white font-semibold rounded-lg text-[10px] sm:text-sm transition-all shadow-lg shadow-yellow-500/20">
                            Claim Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="relative w-full rounded-2xl overflow-hidden h-[200px] sm:h-[240px] cursor-pointer group"
                    onClick={() => { window.scrollTo(0, 0); navigate('/vip'); }}
                  >
                    <div className="absolute inset-0">
                      <img src={stadiumBg} alt="" className="w-full h-full object-cover opacity-25 blur-[2px]" />
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/80 via-[#1a2a3a]/70 to-[#1a1a2a]/60" />
                    </div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-48 h-48 sm:w-56 sm:h-56 bg-gradient-radial from-cyan-500/30 via-blue-500/15 to-transparent rounded-full blur-2xl animate-pulse" />
                    <img src={vipCrownImg} alt="" className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-36 sm:w-44 h-auto object-contain drop-shadow-2xl" />

                    <div className="absolute left-0 top-0 bottom-0 w-[60%] sm:w-[55%] rounded-r-2xl overflow-hidden">
                      <div className="absolute inset-0 backdrop-blur-xl bg-white/5 border-r border-white/20 shadow-[inset_0_0_30px_rgba(255,255,255,0.05)]" />
                      <div className="relative h-full p-4 sm:p-5 flex flex-col justify-center">
                        <p className="text-cyan-400/90 text-[10px] sm:text-xs mb-0.5">VIP Club</p>
                        <p className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-500 mb-2 sm:mb-3">Exclusive Rewards</p>

                        <div className="mb-3 sm:mb-4">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-cyan-400 text-[10px] sm:text-xs font-medium">Bronze</span>
                            <span className="text-gray-400 text-[10px] sm:text-xs">Silver</span>
                          </div>
                          <div className="h-2 sm:h-2.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" style={{ width: '35%' }} />
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-white text-[9px] sm:text-[10px] font-medium">750 XP</span>
                            <span className="text-gray-400 text-[9px] sm:text-[10px]">1,250 XP to go</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 sm:gap-y-1.5 mb-2 sm:mb-3">
                          <div>
                            <p className="text-cyan-500/60 text-[8px] sm:text-[10px]">Weekly Bonus</p>
                            <p className="text-white font-semibold text-xs sm:text-sm">5%</p>
                          </div>
                          <div>
                            <p className="text-cyan-500/60 text-[8px] sm:text-[10px]">Next Bonus</p>
                            <p className="text-white font-semibold text-xs sm:text-sm">10%</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); openBonusModal("VIP Club", "Explore VIP benefits and rewards"); }}
                            className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/10 rounded-lg text-gray-300 hover:text-white transition-colors text-[10px] sm:text-xs font-medium"
                          >
                            Details
                            <ChevronRight className="w-3 h-3" />
                          </button>
                          <button
                            className="px-3 sm:px-5 py-1.5 sm:py-2 bg-gradient-to-r from-cyan-500 to-blue-400 hover:from-cyan-600 hover:to-blue-500 text-white font-semibold rounded-lg text-[10px] sm:text-sm transition-all shadow-lg shadow-cyan-500/20"
                          >
                            View VIP
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <Footer />
          </div>
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

      <Dialog open={bonusModalOpen} onOpenChange={setBonusModalOpen}>
        <DialogContent className="bg-card border-0 max-w-sm max-h-[95vh] overflow-hidden p-0">
          <div className="sticky top-0 z-10 bg-card flex items-center gap-3 min-h-12 px-4 border-b border-border">
            <button
              onClick={() => setBonusModalOpen(false)}
              className="w-8 h-8 rounded-lg bg-[#2a2a2a] flex items-center justify-center hover:bg-[#333] transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <span className="text-base font-bold text-foreground">
              {(selectedPromotion?.title || 'Bonus Details').replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '').trim()}
            </span>
          </div>

          <div className="overflow-y-auto scrollbar-hide p-4 space-y-4" style={{ maxHeight: 'calc(95vh - 56px)' }}>
            {selectedPromotion?.image && (
              <img
                src={selectedPromotion.image}
                alt={selectedPromotion.title}
                className="w-full h-40 sm:h-48 object-cover rounded-xl"
              />
            )}
            <p className="text-sm text-muted-foreground">
              {selectedPromotion?.subtitle}
            </p>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 space-y-3">
              <h4 className="text-sm font-semibold text-green-400 flex items-center gap-2">
                <Coins className="w-4 h-4" />
                Bonus Details
              </h4>
              <ul className="space-y-2.5 text-xs text-muted-foreground">
                <li className="flex justify-between items-center">
                  <span>Bonus Amount:</span>
                  <span className="text-foreground font-medium flex items-center gap-1">
                    <span className="text-green-400">$10</span>
                  </span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Claim Frequency:</span>
                  <span className="text-foreground font-medium">Every 24 Hours</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Play Requirement:</span>
                  <span className="text-foreground font-medium">1x</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Expires After:</span>
                  <span className="text-foreground font-medium">7 Days</span>
                </li>
              </ul>
            </div>

            <div className="bg-muted/30 border border-border rounded-xl p-4 space-y-3">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Info className="w-4 h-4 text-muted-foreground" />
                Terms & Conditions
              </h4>
              <ul className="space-y-1.5 text-[11px] text-muted-foreground list-disc list-inside">
                <li>This bonus is available once every 24 hours per registered user.</li>
                <li>Bonus must be played through 1x before claiming the next daily bonus.</li>
                <li>Unclaimed bonuses expire after 7 days.</li>
                <li>All games are eligible for bonus play.</li>
                <li>Winnings are added to your balance.</li>
                <li>Management reserves the right to modify or cancel this promotion.</li>
                <li>Standard terms and conditions apply.</li>
              </ul>
            </div>

            <button
              onClick={() => setBonusModalOpen(false)}
              className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-400 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-500 transition-all shadow-lg shadow-green-500/20 text-sm"
            >
              Claim $10 Bonus
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <MobileBottomNav onMenuClick={toggleSidebar} />
    </div>
  );
};

export default Promotions;
