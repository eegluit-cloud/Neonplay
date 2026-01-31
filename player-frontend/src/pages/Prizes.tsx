import { useState, useMemo } from "react";
import { useSidebar } from '@/hooks/useSidebar';
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { MobilePageHeader } from "@/components/MobilePageHeader";
import { Trophy, Gift, Crown, Medal, Award, Star, Loader2 } from "lucide-react";
import { usePrizeTiers } from "@/hooks/usePrizes";

// Import prize images (fallback for when API doesn't provide images)
import iphoneImg from "@/assets/prizes/iphone.png";
import macbookImg from "@/assets/prizes/macbook.png";
import ipadImg from "@/assets/prizes/ipad.png";
import appleWatchImg from "@/assets/prizes/apple-watch.png";
import airpodsImg from "@/assets/prizes/airpods.png";
import sonyHeadphonesImg from "@/assets/prizes/sony-headphones.png";
import nintendoSwitchImg from "@/assets/prizes/nintendo-switch.png";
import ps5Img from "@/assets/prizes/ps5.png";
import samsungPhoneImg from "@/assets/prizes/samsung-phone.png";
import giftCardImg from "@/assets/prizes/gift-card.png";
import bonusCreditsImg from "@/assets/prizes/bonus-credits.png";
import boseSpeakerImg from "@/assets/prizes/bose-speaker.png";
import fitbitImg from "@/assets/prizes/fitbit.png";

// Fallback images by prize name
const PRIZE_IMAGE_MAP: Record<string, string> = {
  'iPhone 15 Pro Max': iphoneImg,
  'MacBook Air M3': macbookImg,
  'iPad Pro 12.9': ipadImg,
  'Apple Watch Ultra': appleWatchImg,
  'AirPods Pro 2': airpodsImg,
  'Sony WH-1000XM5': sonyHeadphonesImg,
  'Nintendo Switch': nintendoSwitchImg,
  'PlayStation 5': ps5Img,
  'Samsung Galaxy S24': samsungPhoneImg,
  'Bose Speaker': boseSpeakerImg,
  'Fitbit Charge 6': fitbitImg,
};

// Position styling
const POSITION_STYLES: Record<number, { color: string; borderColor: string; icon: typeof Crown }> = {
  1: { color: "from-yellow-400 to-amber-500", borderColor: "border-yellow-400", icon: Crown },
  2: { color: "from-gray-300 to-gray-400", borderColor: "border-gray-400", icon: Medal },
  3: { color: "from-orange-400 to-orange-500", borderColor: "border-orange-400", icon: Award },
  4: { color: "from-cyan-500 to-blue-400", borderColor: "border-blue-400", icon: Star },
  5: { color: "from-cyan-400 to-cyan-500", borderColor: "border-cyan-400", icon: Gift },
};

// Fallback prizes for when API is not available
const fallbackMonthlyPrizes = [
  { position: 1, prize: "iPhone 15 Pro Max", image: iphoneImg, value: "$1,199" },
  { position: 2, prize: "MacBook Air M3", image: macbookImg, value: "$999" },
  { position: 3, prize: "iPad Pro 12.9", image: ipadImg, value: "$799" },
  { position: 4, prize: "Apple Watch Ultra", image: appleWatchImg, value: "$499" },
  { position: 5, prize: "AirPods Pro 2", image: airpodsImg, value: "$249" },
];

const fallbackDailyPrizes = [
  { position: 1, prize: "Sony WH-1000XM5", image: sonyHeadphonesImg, value: "$349" },
  { position: 2, prize: "Nintendo Switch", image: nintendoSwitchImg, value: "$299" },
  { position: 3, prize: "Amazon Echo Show", image: giftCardImg, value: "$199" },
  { position: 4, prize: "$100 Gift Card", image: giftCardImg, value: "$100" },
  { position: 5, prize: "$50 Bonus Credits", image: bonusCreditsImg, value: "$50" },
];

const fallbackWeeklyPrizes = [
  { position: 1, prize: "PlayStation 5", image: ps5Img, value: "$499" },
  { position: 2, prize: "Samsung Galaxy S24", image: samsungPhoneImg, value: "$399" },
  { position: 3, prize: "Bose Speaker", image: boseSpeakerImg, value: "$299" },
  { position: 4, prize: "Fitbit Charge 6", image: fitbitImg, value: "$159" },
  { position: 5, prize: "$75 Bonus Credits", image: bonusCreditsImg, value: "$75" },
];

const PrizesPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [activePeriod, setActivePeriod] = useState<"daily" | "weekly" | "monthly">("monthly");

  // Fetch prize tiers from API
  const { tiers, isLoading } = usePrizeTiers();

  // Process API data into prize format
  const processedPrizes = useMemo(() => {
    const periodTiers = tiers.filter(t => t.leaderboardPeriod.toLowerCase() === activePeriod);

    if (periodTiers.length === 0) {
      // Fallback to static data
      switch (activePeriod) {
        case "daily": return fallbackDailyPrizes;
        case "weekly": return fallbackWeeklyPrizes;
        case "monthly": return fallbackMonthlyPrizes;
      }
    }

    return periodTiers
      .sort((a, b) => a.position - b.position)
      .map(tier => {
        const prizeName = tier.prize?.name || `$${tier.usdAmount?.toLocaleString() || tier.gcAmount?.toLocaleString() || '0'} Bonus`;
        const prizeValue = tier.prize?.valueUsd ? `$${tier.prize.valueUsd.toLocaleString()}` : `$${tier.usdAmount?.toLocaleString() || tier.gcAmount?.toLocaleString() || '0'}`;
        const prizeImage = tier.prize?.imageUrl || PRIZE_IMAGE_MAP[tier.prize?.name || ''] || bonusCreditsImg;

        return {
          position: tier.position,
          prize: prizeName,
          image: prizeImage,
          value: prizeValue,
        };
      });
  }, [tiers, activePeriod]);

  // Add styling to prizes
  const prizes = useMemo(() => {
    return processedPrizes.map(prize => ({
      ...prize,
      ...POSITION_STYLES[prize.position] || POSITION_STYLES[5],
    }));
  }, [processedPrizes]);

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background">
      <Header
        onOpenSignIn={() => {}}
        onOpenSignUp={() => {}}
        onToggleSidebar={toggleSidebar}
      />
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        onOpenSpinGift={() => {}}
      />

      <div className={`transition-all duration-300 pt-14 md:pt-16 pb-20 md:pb-0 ${sidebarOpen ? 'md:ml-56' : 'md:ml-16'}`}>
        <main className="page-content page-spacing overflow-x-hidden page-transition-enter max-w-full">
          {/* Mobile Header with Back Button */}
          <MobilePageHeader title="Prizes" />

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
            </div>
          )}

          {!isLoading && (
            <>
          
          {/* Hero Section */}
          <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-blue-900/80 via-blue-950 to-background p-4 sm:p-6 lg:p-10 text-center hero-gradient-section">
            {/* Subtle grid pattern */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }} />
            {/* Radial glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(59,130,246,0.25),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_80%,rgba(59,130,246,0.1),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)]" />
            {/* Decorative shapes */}
            <div className="absolute top-0 left-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-32 sm:w-40 h-32 sm:h-40 bg-gradient-to-tl from-blue-500/10 to-transparent rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <div className="flex justify-center mb-3 sm:mb-5">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/40 animate-pulse">
                  <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-black" />
                </div>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 drop-shadow-lg">Leaderboard Prizes</h1>
              <p className="text-gray-300 max-w-2xl mx-auto text-xs sm:text-sm md:text-base">
                Compete for amazing prizes! Top players win exclusive rewards every day, week, and month.
              </p>
            </div>
          </div>

          {/* Period Tabs */}
          <div className="flex justify-center overflow-x-auto scrollbar-hide">
            <div className="bg-[#1a1a1a] rounded-full p-1 flex items-center border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.08)] h-12">
              <button 
                onClick={() => setActivePeriod("daily")}
                className={`flex items-center justify-center px-4 sm:px-6 h-10 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap tap-feedback ${
                  activePeriod === "daily" 
                    ? "bg-[#2a2a2a] border border-[#3a3a3a] text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Daily Prizes
              </button>
              <button 
                onClick={() => setActivePeriod("weekly")}
                className={`flex items-center justify-center px-4 sm:px-6 h-10 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap tap-feedback ${
                  activePeriod === "weekly" 
                    ? "bg-[#2a2a2a] border border-[#3a3a3a] text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Weekly Prizes
              </button>
              <button 
                onClick={() => setActivePeriod("monthly")}
                className={`flex items-center justify-center px-4 sm:px-6 h-10 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap tap-feedback ${
                  activePeriod === "monthly" 
                    ? "bg-[#2a2a2a] border border-[#3a3a3a] text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly Prizes
              </button>
            </div>
          </div>

          {/* Grand Prize (1st Place) */}
          <div className="max-w-3xl mx-auto">
            {/* Grand Prize Badge - Above the card */}
            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-400 text-black px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-yellow-500/40">
                <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> GRAND PRIZE <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            
            <div className="relative bg-gradient-to-br from-yellow-500/10 via-amber-900/20 to-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border-2 border-yellow-400/40 overflow-hidden shadow-2xl shadow-yellow-500/10">
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.15),transparent_50%)]" />
              <div className="absolute top-0 right-0 w-40 sm:w-60 h-40 sm:h-60 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 sm:w-40 h-32 sm:h-40 bg-gradient-to-tr from-amber-500/10 to-transparent rounded-full blur-2xl" />
              
              <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                {/* Image with golden ring directly on image */}
                <div className="relative">
                  <div className="absolute inset-0 bg-yellow-400/30 rounded-full blur-2xl scale-150" />
                  <img 
                    src={prizes[0].image} 
                    alt={prizes[0].prize} 
                    className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 object-contain drop-shadow-2xl rounded-xl sm:rounded-2xl ring-2 sm:ring-4 ring-yellow-400"
                    style={{ boxShadow: '0 0 30px rgba(251,191,36,0.5)' }}
                  />
                </div>
                
                <div className="text-center sm:text-left flex-1 space-y-2 sm:space-y-3">
                  <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-yellow-400/20 backdrop-blur-sm px-2.5 sm:px-4 py-1 rounded-full border border-yellow-400/30">
                    <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                    <span className="text-yellow-400 text-[10px] sm:text-xs font-semibold tracking-wide uppercase">1st Place Winner</span>
                  </div>
                  <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight">{prizes[0].prize}</h2>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="text-muted-foreground text-xs sm:text-sm">Value:</span>
                    <span className="text-yellow-400 text-xl sm:text-2xl md:text-3xl font-black">{prizes[0].value}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Other Prizes Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {prizes.slice(1).map((prize) => {
              const IconComponent = prize.icon;
              const colorClass = prize.borderColor.replace('border-', 'text-');
              const bgColorClass = prize.color;
              
              return (
                <div 
                  key={prize.position}
                  className="relative bg-gradient-to-br from-card via-card to-muted/30 rounded-xl p-3 sm:p-4 md:p-5 border border-border/50 hover:border-opacity-100 transition-all duration-300 hover:scale-[1.02] overflow-hidden group"
                >
                  {/* Background glow */}
                  <div className={`absolute top-0 right-0 w-20 sm:w-28 h-20 sm:h-28 bg-gradient-to-br ${bgColorClass} opacity-5 rounded-full blur-3xl group-hover:opacity-15 transition-all duration-500`} />
                  
                  {/* Position Badge */}
                  <div className={`absolute top-2 right-2 sm:top-3 sm:right-3 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br ${bgColorClass} rounded-full flex items-center justify-center shadow-lg`}>
                    <span className="text-black font-bold text-[10px] sm:text-xs">{prize.position}</span>
                  </div>

                  <div className="relative z-10 text-center flex flex-col items-center">
                    {/* Image centered */}
                    <div className="relative mb-2.5 sm:mb-4 flex items-center justify-center">
                      <div className={`absolute inset-0 bg-gradient-to-br ${bgColorClass} opacity-20 rounded-full blur-xl scale-125`} />
                      <img 
                        src={prize.image} 
                        alt={prize.prize} 
                        className={`relative w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 object-contain drop-shadow-lg rounded-lg sm:rounded-xl ${prize.borderColor} ring-1 sm:ring-2 ring-offset-1 sm:ring-offset-2 ring-offset-transparent`}
                        style={{ 
                          boxShadow: `0 0 20px ${prize.position === 2 ? 'rgba(156,163,175,0.3)' : prize.position === 3 ? 'rgba(251,146,60,0.3)' : prize.position === 4 ? 'rgba(52,211,153,0.3)' : 'rgba(34,211,238,0.3)'}` 
                        }}
                      />
                    </div>
                    
                    {/* Position label */}
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/50 mb-1.5 sm:mb-2`}>
                      <IconComponent className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${colorClass}`} />
                      <span className={`text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider ${colorClass}`}>
                        {prize.position === 2 ? '2nd' : prize.position === 3 ? '3rd' : `${prize.position}th`} Place
                      </span>
                    </div>
                    
                    {/* Prize name */}
                    <h3 className="text-xs sm:text-sm font-bold text-foreground mb-0.5 leading-tight line-clamp-1">{prize.prize}</h3>
                    
                    {/* Value */}
                    <p className={`text-sm sm:text-base md:text-lg font-black ${colorClass}`}>{prize.value}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* How to Win Section */}
          <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border">
            <h2 className="text-base sm:text-xl font-bold text-foreground text-center mb-3 sm:mb-5">How to Win</h2>
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div className="text-center">
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <span className="text-base sm:text-xl font-bold text-blue-400">1</span>
                </div>
                <h3 className="font-semibold text-foreground mb-0.5 sm:mb-1 text-[11px] sm:text-sm">Play Games</h3>
                <p className="text-muted-foreground text-[9px] sm:text-xs hidden sm:block">Play your favorite casino games and earn wager points</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <span className="text-base sm:text-xl font-bold text-blue-400">2</span>
                </div>
                <h3 className="font-semibold text-foreground mb-0.5 sm:mb-1 text-[11px] sm:text-sm">Climb Up</h3>
                <p className="text-muted-foreground text-[9px] sm:text-xs hidden sm:block">Higher wagers mean better positions on the leaderboard</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <span className="text-base sm:text-xl font-bold text-blue-400">3</span>
                </div>
                <h3 className="font-semibold text-foreground mb-0.5 sm:mb-1 text-[11px] sm:text-sm">Win Prizes</h3>
                <p className="text-muted-foreground text-[9px] sm:text-xs hidden sm:block">Top 5 players at the end of each period win amazing prizes!</p>
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="text-center text-muted-foreground text-[10px] sm:text-xs">
            <p>* Prizes are subject to availability. Winners will be contacted via email.</p>
            <p>* Standard terms and conditions apply. Must be 18+ to participate.</p>
          </div>
          </>
          )}
        </main>
        <Footer />
      </div>
      
      <MobileBottomNav onMenuClick={toggleSidebar} />
    </div>
  );
};

export default PrizesPage;
