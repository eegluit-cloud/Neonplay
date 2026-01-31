import { useState, useEffect, useRef } from "react";
import { useSidebar } from '@/hooks/useSidebar';
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";
import { BonusClaimedModal } from "@/components/BonusClaimedModal";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { MobilePageHeader } from "@/components/MobilePageHeader";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronLeft, ChevronRight, Gift, Clock, Calendar, CalendarDays, CalendarRange, Trophy } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLeaderboardData, formatAmount } from "@/hooks/useLeaderboardData";
import { useUserAvatar } from "@/hooks/useUserAvatar";
import crownImage from "@/assets/crown-first-place.png";
import leaderboardBgDepth from "@/assets/leaderboard-bg-depth.png";

// Countdown hook for each period
const useCountdown = (targetHours: number, showDays: boolean = false) => {
  const [timeLeft, setTimeLeft] = useState(() => {
    const now = new Date();
    const target = new Date();
    target.setHours(target.getHours() + targetHours);
    return Math.floor((target.getTime() - now.getTime()) / 1000);
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const days = Math.floor(timeLeft / 86400);
  const hours = Math.floor((timeLeft % 86400) / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  if (showDays) {
    return `${days}d ${hours.toString().padStart(2, '0')}h`;
  }
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const getPositionStyle = (position: number) => {
  if (position === 1) return "text-yellow-400 border-yellow-400/50";
  if (position === 2) return "text-gray-400 border-gray-400/50";
  if (position === 3) return "text-orange-400 border-orange-400/50";
  if (position === 4) return "text-cyan-400 border-cyan-400/50";
  if (position === 5) return "text-cyan-400 border-cyan-400/50";
  return "text-purple-400 border-purple-400/50";
};

const myBetsData = [
  { id: 1, game: "Sweet Bonanza", stakeAmount: 500, multiplier: "2.5x", prize: 1250, time: "2 min ago", status: "win", currency: "USD" as const },
  { id: 2, game: "Gates of Olympus", stakeAmount: 100, multiplier: "0x", prize: 0, time: "5 min ago", status: "loss", currency: "USD" as const },
  { id: 3, game: "Big Bass Splash", stakeAmount: 250, multiplier: "4.2x", prize: 1050, time: "12 min ago", status: "win", currency: "USD" as const },
  { id: 4, game: "Crazy Time", stakeAmount: 200, multiplier: "1.8x", prize: 360, time: "18 min ago", status: "win", currency: "BTC" as const },
  { id: 5, game: "Live Roulette", stakeAmount: 750, multiplier: "0x", prize: 0, time: "25 min ago", status: "loss", currency: "USD" as const },
];

const latestBetsData = [
  { id: 1, player: "Alex K.", avatar: "alex", game: "Dragon Pearls", stakeAmount: 1500, multiplier: "3.2x", prize: 4800, time: "Just now" },
  { id: 2, player: "Maria S.", avatar: "maria", game: "Book of Fallen", stakeAmount: 800, multiplier: "5.0x", prize: 4000, time: "1 min ago" },
  { id: 3, player: "John D.", avatar: "john", game: "Lightning Baccarat", stakeAmount: 5000, multiplier: "1.5x", prize: 7500, time: "2 min ago" },
  { id: 4, player: "Sarah W.", avatar: "sarah", game: "Mammoth Peak", stakeAmount: 450, multiplier: "8.0x", prize: 3600, time: "3 min ago" },
  { id: 5, player: "Mike R.", avatar: "mike", game: "Thor Hammer Time", stakeAmount: 1200, multiplier: "2.1x", prize: 2520, time: "4 min ago" },
  { id: 6, player: "Emma L.", avatar: "emma", game: "Poison Eve", stakeAmount: 2000, multiplier: "0x", prize: 0, time: "5 min ago" },
];

const LeaderboardPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [bonusClaimedOpen, setBonusClaimedOpen] = useState(false);
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const [activeTab, setActiveTab] = useState("leaderboard");
  const [currentPage, setCurrentPage] = useState(1);
  const { winners, playerPosition, playerWager, changePeriod } = useLeaderboardData(period);
  const { avatar: userAvatarImage } = useUserAvatar();

  // Countdown timers
  const dailyCountdown = useCountdown(12, false); // 12 hours for daily - show hours:min:sec
  const weeklyCountdown = useCountdown(72, true); // 3 days for weekly - show days and hours
  const monthlyCountdown = useCountdown(336, true); // 14 days for monthly - show days and hours

  const tabs = [
    { id: "leaderboard", label: "Leaderboard" },
    { id: "myBets", label: "My Bets" },
  ];

  // Mock recent winners for the carousel - varied data with mixed avatars
  const recentWinners = [
    { name: "@CryptoKing", game: "Slots", amount: "$124,500", avatar: "https://randomuser.me/api/portraits/men/1.jpg", isReal: true },
    { name: "@LuckyDragon", game: "Live Casino", amount: "0.15 BTC", avatar: "dragon", isReal: false },
    { name: "@MaxBet99", game: "Card Games", amount: "$257,800", avatar: "https://randomuser.me/api/portraits/women/2.jpg", isReal: true },
    { name: "@WinnerTakes", game: "Originals", amount: "0.08 BTC", avatar: "winner", isReal: false },
    { name: "@HighRoller", game: "Roulette", amount: "$189,500", avatar: "https://randomuser.me/api/portraits/men/3.jpg", isReal: true },
    { name: "@GoldenAce", game: "Blackjack", amount: "0.18 BTC", avatar: "ace", isReal: false },
    { name: "@DiamondHands", game: "Poker", amount: "$321,000", avatar: "https://randomuser.me/api/portraits/women/4.jpg", isReal: true },
    { name: "@BetMaster", game: "Crash", amount: "0.12 BTC", avatar: "https://randomuser.me/api/portraits/men/5.jpg", isReal: true },
    { name: "@RichPlayer", game: "Slots", amount: "$142,300", avatar: "rich", isReal: false },
    { name: "@ProGambler", game: "Baccarat", amount: "0.35 BTC", avatar: "https://randomuser.me/api/portraits/women/6.jpg", isReal: true },
    { name: "@LuckyStrike", game: "Blackjack", amount: "$68,900", avatar: "https://randomuser.me/api/portraits/men/7.jpg", isReal: true },
    { name: "@MegaWin", game: "Slots", amount: "0.28 BTC", avatar: "mega", isReal: false },
  ];

  // Duplicate for seamless loop
  const duplicatedWinners = [...recentWinners, ...recentWinners];
  
  // Auto-scroll carousel
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const scrollContainer = carouselRef.current;
    if (!scrollContainer || isPaused) return;

    const scroll = () => {
      if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
        scrollContainer.scrollLeft = 0;
      } else {
        scrollContainer.scrollLeft += 1;
      }
    };

    const interval = setInterval(scroll, 30);
    return () => clearInterval(interval);
  }, [isPaused]);

  const top3 = winners.slice(0, 3);

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
        onOpenBonusClaimed={() => setBonusClaimedOpen(true)}
      />
      
      <div className={`transition-all duration-300 pt-14 md:pt-16 pb-20 md:pb-0 ${sidebarOpen ? 'md:ml-56' : 'md:ml-16'}`}>
        <main className="overflow-x-hidden page-transition-enter max-w-full">
          {/* Hero Banner with dark gradient background - Full width, no padding */}
          <div className="relative overflow-hidden min-h-[350px] sm:min-h-[450px] md:min-h-[500px]">
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${leaderboardBgDepth})` }}
            />
            {/* Overlay gradient for smooth blending */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
            
            {/* Mobile Header with Back Button - Inside hero */}
            <div className="relative z-10 p-3 md:p-4 lg:p-6">
              <MobilePageHeader title="Leaderboard" />
            </div>

            {/* Recent Winners Carousel - Auto-scrolling */}
            <div className="px-2 sm:px-4 pt-0">
              <div 
                ref={carouselRef}
                className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 sm:pb-3 scrollbar-hide"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={() => setIsPaused(true)}
                onTouchEnd={() => setIsPaused(false)}
              >
                {duplicatedWinners.map((winner, index) => (
                  <div 
                    key={index}
                    className="flex-shrink-0 bg-card/80 backdrop-blur-sm border border-border rounded-full px-2 sm:px-3 py-1 sm:py-1.5 flex items-center gap-1.5 sm:gap-2"
                  >
                    <div className="relative">
                      <img 
                        src={winner.isReal ? winner.avatar : `https://api.dicebear.com/7.x/avataaars/svg?seed=${winner.avatar}`} 
                        alt={winner.name} 
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover" 
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 bg-cyan-500 text-[7px] sm:text-[8px] text-white w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex items-center justify-center">
                        {Math.floor(Math.random() * 50) + 10}
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs font-semibold text-white">{winner.name}</p>
                      <p className="text-[8px] sm:text-[10px] text-muted-foreground">In {winner.game}</p>
                    </div>
                    <span className={`font-bold text-[10px] sm:text-xs ${winner.amount.includes('BTC') ? 'text-orange-400' : 'text-green-400'}`}>
                      {winner.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Period Tabs with Countdowns and Prizes Button */}
            <div className="flex justify-center items-center gap-2 sm:gap-3 mt-2 sm:mt-4 px-2 relative z-20">
              <div className="bg-background/90 backdrop-blur-sm rounded-xl p-1 flex gap-0.5 border border-border h-auto">
                <button 
                  onClick={() => setPeriod("daily")}
                  className={`flex flex-col items-center justify-center px-4 sm:px-8 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all tap-feedback min-h-[44px] ${
                    period === "daily" 
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white" 
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
                >
                  <span>Daily</span>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span className="text-[10px] sm:text-xs font-mono">{dailyCountdown}</span>
                  </div>
                </button>
                <button 
                  onClick={() => setPeriod("weekly")}
                  className={`flex flex-col items-center justify-center px-4 sm:px-8 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all tap-feedback min-h-[44px] ${
                    period === "weekly" 
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white" 
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
                >
                  <span>Weekly</span>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span className="text-[10px] sm:text-xs font-mono">{weeklyCountdown}</span>
                  </div>
                </button>
                <button 
                  onClick={() => setPeriod("monthly")}
                  className={`flex flex-col items-center justify-center px-4 sm:px-8 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all tap-feedback min-h-[44px] ${
                    period === "monthly" 
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white" 
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
                >
                  <span>Monthly</span>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span className="text-[10px] sm:text-xs font-mono">{monthlyCountdown}</span>
                  </div>
                </button>
              </div>
              
              {/* Prizes Button */}
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-semibold text-xs sm:text-sm px-4 h-10 sm:h-11 gap-2 rounded-xl tap-feedback"
                onClick={() => window.location.href = '/prizes'}
              >
                <Gift className="w-4 h-4" />
                Prizes
              </Button>
            </div>

            {/* Podium Section */}
            <div className="relative mt-8 sm:mt-14 px-2 sm:px-4">
              <div className="flex items-end justify-center gap-2 sm:gap-4 pt-6 sm:pt-10">
                {/* 2nd Place */}
                <div className="flex flex-col items-center">
                  <div className="relative mb-1 sm:mb-2">
                    <img 
                      src={top3[1]?.isRealPhoto ? top3[1]?.avatar : `https://api.dicebear.com/7.x/avataaars/svg?seed=${top3[1]?.avatar || 'silver'}`} 
                      alt={top3[1]?.name} 
                      className="w-10 h-10 sm:w-16 sm:h-16 rounded-full border-2 border-gray-400 object-cover"
                    />
                    <span className="absolute -bottom-1 -right-1 bg-cyan-500 text-[8px] sm:text-xs text-white w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-bold">2</span>
                  </div>
                  <p className="text-[10px] sm:text-sm font-semibold text-white truncate max-w-[60px] sm:max-w-none">@{top3[1]?.name?.split(' ')[0] || 'Player'}</p>
                  <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-sm">
                    <span className="text-green-400 font-bold flex items-center gap-0.5">${formatAmount((top3[1]?.amount || 0) * 100)}</span>
                  </div>
                  <div className="w-16 sm:w-32 h-24 sm:h-40 bg-gradient-to-t from-transparent via-cyan-950/40 to-cyan-800/50 rounded-xl mt-2 sm:mt-3 flex items-center justify-center border border-cyan-500/20">
                    <span className="text-2xl sm:text-4xl font-black text-white/30">2nd</span>
                  </div>
                </div>

                {/* 1st Place */}
                <div className="flex flex-col items-center -mt-4 sm:-mt-8">
                  {/* Crown positioned on top of avatar */}
                  <div className="relative">
                    <img src={crownImage} alt="Crown" className="w-10 h-10 sm:w-14 sm:h-14 object-contain absolute -top-8 sm:-top-12 left-1/2 -translate-x-1/2 z-10" />
                    <img 
                      src={top3[0]?.isRealPhoto ? top3[0]?.avatar : `https://api.dicebear.com/7.x/avataaars/svg?seed=${top3[0]?.avatar || 'gold'}`} 
                      alt={top3[0]?.name} 
                      className="w-12 h-12 sm:w-20 sm:h-20 rounded-full border-2 border-casino-gold object-cover"
                    />
                    <span className="absolute -bottom-1 -right-1 bg-cyan-500 text-[8px] sm:text-xs text-white w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-bold">1</span>
                  </div>
                  <p className="text-[10px] sm:text-sm font-semibold text-white truncate max-w-[60px] sm:max-w-none">@{top3[0]?.name?.split(' ')[0] || 'Player'}</p>
                  <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-sm">
                    <span className="text-green-400 font-bold flex items-center gap-0.5">${formatAmount((top3[0]?.amount || 0) * 100)}</span>
                  </div>
                  <div className="w-20 sm:w-40 h-32 sm:h-56 bg-gradient-to-t from-transparent via-cyan-950/40 to-cyan-800/50 rounded-xl mt-2 sm:mt-3 flex items-center justify-center border border-cyan-500/20">
                    <span className="text-3xl sm:text-5xl font-black text-white/30">1st</span>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="flex flex-col items-center">
                  <div className="relative mb-1 sm:mb-2">
                    <img 
                      src={top3[2]?.isRealPhoto ? top3[2]?.avatar : `https://api.dicebear.com/7.x/avataaars/svg?seed=${top3[2]?.avatar || 'bronze'}`} 
                      alt={top3[2]?.name} 
                      className="w-10 h-10 sm:w-16 sm:h-16 rounded-full border-2 border-orange-400 object-cover"
                    />
                    <span className="absolute -bottom-1 -right-1 bg-cyan-500 text-[8px] sm:text-xs text-white w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-bold">3</span>
                  </div>
                  <p className="text-[10px] sm:text-sm font-semibold text-white truncate max-w-[60px] sm:max-w-none">@{top3[2]?.name?.split(' ')[0] || 'Player'}</p>
                  <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-sm">
                    <span className="text-green-400 font-bold flex items-center gap-0.5">${formatAmount((top3[2]?.amount || 0) * 100)}</span>
                  </div>
                  <div className="w-16 sm:w-32 h-20 sm:h-32 bg-gradient-to-t from-transparent via-cyan-950/40 to-cyan-800/50 rounded-xl mt-2 sm:mt-3 flex items-center justify-center border border-cyan-500/20">
                    <span className="text-2xl sm:text-4xl font-black text-white/30">3rd</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Content with padding */}
          <div className="p-3 md:p-4 lg:p-6 space-y-4 md:space-y-6">
          
          {/* Leaderboard Section */}
          <div className="w-full bg-card rounded-xl p-3 sm:p-4 md:p-6 border border-border overflow-x-hidden">
            {/* Header with tabs and period selector */}
            <div className="flex items-center justify-between gap-2 sm:gap-4 mb-3 sm:mb-6">
              <div className="flex bg-[#1a1a1a] rounded-full p-1 border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.08)]">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? "bg-[#2a2a2a] border border-[#3a3a3a] text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex bg-[#1a1a1a] rounded-full p-1 border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.08)]">
                {[
                  { id: "daily", label: "Daily", icon: Calendar },
                  { id: "weekly", label: "Weekly", icon: CalendarDays },
                  { id: "monthly", label: "Monthly", icon: CalendarRange },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPeriod(p.id as "daily" | "weekly" | "monthly")}
                    className={`flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                      period === p.id
                        ? "bg-[#2a2a2a] border border-[#3a3a3a] text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <p.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* User Stats Bar */}
            <div className="bg-[#1a1a1a] rounded-xl p-2.5 mb-4 border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.08)]">
              <div className="flex items-center gap-2.5 md:gap-5">
                <div className="flex items-center gap-2">
                  <Avatar className="w-7 h-7">
                    <AvatarImage src={userAvatarImage} />
                    <AvatarFallback className="text-xs">ME</AvatarFallback>
                  </Avatar>
                  <span className="text-foreground font-medium text-sm">Peter Jack</span>
                </div>
                
                <div className="h-5 w-px bg-border" />
                
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-[10px]">My Position</span>
                  <span className="text-primary font-bold text-sm transition-all duration-300">{playerPosition}th</span>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-[10px]">To Reach Top 10</span>
                  <span className="text-primary font-bold text-sm transition-all duration-300">{formatAmount(Math.max(0, (winners[9]?.amount ?? 0) - playerWager))}</span>
                </div>
              </div>
            </div>

            {/* Tab Content */}
            <div className="overflow-x-auto md:overflow-visible">
              {activeTab === "leaderboard" && (
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground font-medium text-[10px] md:text-xs">Rank</TableHead>
                      <TableHead className="text-muted-foreground font-medium text-[10px] md:text-xs">Player</TableHead>
                      <TableHead className="text-muted-foreground font-medium hidden md:table-cell text-xs">Country</TableHead>
                      <TableHead className="text-muted-foreground font-medium hidden md:table-cell text-xs">Games</TableHead>
                      <TableHead className="text-muted-foreground font-medium text-[10px] md:text-xs">Amount</TableHead>
                      <TableHead className="text-muted-foreground font-medium hidden md:table-cell text-xs">VIP Level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {winners.slice(0, 10).map((player, index) => {
                      // Check if current user should be at this position
                      const isUserPosition = playerPosition === index + 1;
                      const displayPlayer = isUserPosition ? {
                        name: 'Peter Jack',
                        amount: playerWager,
                        country: 'IL',
                        countryFlag: '🇮🇱',
                        game: 'Sweet Bonanza',
                        level: 4,
                        avatar: userAvatarImage,
                        isRealPhoto: true
                      } : player;
                      
                      return (
                        <TableRow key={displayPlayer.name + index} className={`border-b border-border/50 hover:bg-secondary/50 h-7 ${isUserPosition ? 'bg-cyan-500/10' : ''}`}>
                          <TableCell className="py-1.5 px-2 md:px-4">
                            <span className={`inline-flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-lg bg-card/80 border text-[10px] md:text-xs font-bold ${getPositionStyle(index + 1)}`}>
                              {index + 1}
                            </span>
                          </TableCell>
                          <TableCell className="py-1.5 px-2 md:px-4">
                            <div className="flex items-center gap-1.5 md:gap-2">
                              <Avatar className="w-5 h-5 md:w-6 md:h-6">
                                <AvatarImage 
                                  src={isUserPosition ? userAvatarImage : (player.isRealPhoto ? player.avatar : `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.avatar}`)} 
                                  className="object-cover"
                                />
                                <AvatarFallback className="text-[8px]">{displayPlayer.name[0]}</AvatarFallback>
                              </Avatar>
                              <span className={`text-[10px] md:text-xs truncate max-w-[70px] md:max-w-none ${isUserPosition ? 'text-cyan-400 font-semibold' : 'text-foreground'}`}>
                                {displayPlayer.name} {isUserPosition && '(You)'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-1.5 hidden md:table-cell">
                            <span className="text-muted-foreground text-xs">{displayPlayer.country}</span>
                          </TableCell>
                          <TableCell className="py-1.5 hidden md:table-cell">
                            <span className="text-muted-foreground text-xs">{displayPlayer.game}</span>
                          </TableCell>
                          <TableCell className="py-1.5 px-2 md:px-4">
                            <span className="text-green-400 font-medium text-[10px] md:text-xs">
                              ${formatAmount(displayPlayer.amount * 100)}
                            </span>
                          </TableCell>
                          <TableCell className="py-1.5 hidden md:table-cell">
                            <span className="text-muted-foreground text-xs">VIP {displayPlayer.level}</span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}

              {activeTab === "myBets" && (
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground font-medium text-[10px] md:text-xs">Game</TableHead>
                      <TableHead className="text-muted-foreground font-medium text-[10px] md:text-xs hidden sm:table-cell">Bet</TableHead>
                      <TableHead className="text-muted-foreground font-medium text-[10px] md:text-xs hidden md:table-cell">Multiplier</TableHead>
                      <TableHead className="text-muted-foreground font-medium text-[10px] md:text-xs">Payout</TableHead>
                      <TableHead className="text-muted-foreground font-medium text-[10px] md:text-xs hidden md:table-cell">Time</TableHead>
                      <TableHead className="text-muted-foreground font-medium text-[10px] md:text-xs">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myBetsData.map((bet) => (
                      <TableRow key={bet.id} className="border-b border-border/50 hover:bg-secondary/50 h-7">
                        <TableCell className="py-1.5 px-2 md:px-4">
                          <span className="text-foreground text-[10px] md:text-xs truncate max-w-[80px] md:max-w-none">{bet.game}</span>
                        </TableCell>
                        <TableCell className="py-1.5 hidden sm:table-cell">
                          <span className="text-green-400 font-medium text-[10px] md:text-xs">
                            {bet.currency === 'BTC' ? `${bet.stakeAmount.toLocaleString()} BTC` : `$${bet.stakeAmount.toLocaleString()}`}
                          </span>
                        </TableCell>
                        <TableCell className="py-1.5 hidden md:table-cell">
                          <span className={`text-xs ${bet.status === "win" ? "text-primary" : "text-muted-foreground"}`}>{bet.multiplier}</span>
                        </TableCell>
                        <TableCell className="py-1.5 px-2 md:px-4">
                          <span className={`text-[10px] md:text-xs ${bet.status === "win" ? "text-green-400 font-medium" : "text-destructive"}`}>
                            {bet.status === "win"
                              ? (bet.currency === 'BTC' ? `${bet.prize.toLocaleString()} BTC` : `$${bet.prize.toLocaleString()}`)
                              : `$${bet.prize.toLocaleString()}`
                            }
                          </span>
                        </TableCell>
                        <TableCell className="py-1.5 hidden md:table-cell">
                          <span className="text-muted-foreground text-xs">{bet.time}</span>
                        </TableCell>
                        <TableCell className="py-1.5 px-2 md:px-4">
                          <span className={`px-1.5 md:px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium ${
                            bet.status === "win" ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"
                          }`}>
                            {bet.status === "win" ? "Win" : "Loss"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-6">
              <button className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-card border border-border text-muted-foreground hover:bg-cyan-500/10 hover:border-cyan-500/50 transition-colors">
                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              {[1, 2, 3].map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    currentPage === page
                      ? 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white'
                      : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-cyan-500/50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <span className="text-muted-foreground text-xs sm:text-sm px-1">...</span>
              <button className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg text-xs sm:text-sm font-medium bg-card border border-border text-muted-foreground hover:text-foreground hover:border-cyan-500/50 transition-all">
                8
              </button>
              <button className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-card border border-border text-muted-foreground hover:bg-cyan-500/10 hover:border-cyan-500/50 transition-colors">
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
          
          <Footer />
          </div>
        </main>
      </div>
      
      <MobileBottomNav onMenuClick={toggleSidebar} />
      
      <BonusClaimedModal isOpen={bonusClaimedOpen} onClose={() => setBonusClaimedOpen(false)} />
    </div>
  );
};

export default LeaderboardPage;
