import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, CalendarDays, CalendarRange, DollarSign } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLeaderboardData, formatAmount, LeaderboardPeriod } from "@/hooks/useLeaderboardData";
import { useUserAvatar } from "@/hooks/useUserAvatar";

const getPositionStyle = (position: number) => {
  if (position === 1) return "text-yellow-400 border-yellow-400/50";
  if (position === 2) return "text-gray-400 border-gray-400/50";
  if (position === 3) return "text-orange-400 border-orange-400/50";
  if (position === 4) return "text-cyan-400 border-cyan-400/50";
  if (position === 5) return "text-cyan-400 border-cyan-400/50";
  return "text-purple-400 border-purple-400/50";
};

const myBetsData = [
  { id: 1, game: "Sweet Bonanza", gameIcon: "🍬", stakeAmount: 50, multiplier: "2.5x", prize: 125, time: "2 min ago", status: "win" },
  { id: 2, game: "Gates of Olympus", gameIcon: "⚡", stakeAmount: 10, multiplier: "0x", prize: 0, time: "5 min ago", status: "loss" },
  { id: 3, game: "Big Bass Splash", gameIcon: "🐟", stakeAmount: 25, multiplier: "4.2x", prize: 105, time: "12 min ago", status: "win" },
  { id: 4, game: "Crazy Time", gameIcon: "🎡", stakeAmount: 20, multiplier: "1.8x", prize: 36, time: "18 min ago", status: "win" },
  { id: 5, game: "Live Roulette", gameIcon: "🎰", stakeAmount: 75, multiplier: "0x", prize: 0, time: "25 min ago", status: "loss" },
];

const Leaderboard = () => {
  const [period, setPeriod] = useState<LeaderboardPeriod>("daily");
  const { winners, playerPosition, playerWager, changePeriod } = useLeaderboardData(period);
  const { avatar: userAvatar } = useUserAvatar();
  const [activeTab, setActiveTab] = useState("leaderboard");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    changePeriod(period);
  }, [period, changePeriod]);

  const tabs = [
    { id: "leaderboard", label: "Leaderboard" },
    { id: "myBets", label: "My Bets" },
  ];

  const periods: { id: LeaderboardPeriod; label: string; icon: typeof Calendar }[] = [
    { id: "daily", label: "Daily", icon: Calendar },
    { id: "weekly", label: "Weekly", icon: CalendarDays },
    { id: "monthly", label: "Monthly", icon: CalendarRange },
  ];

  // Format USD display
  const formatUsdAmount = (amount: number) => {
    return `$${formatAmount(amount)}`;
  };

  return (
    <div className="w-full bg-card rounded-xl p-4 md:p-6 border border-border">
      {/* Header with tabs and period selector on same line */}
      <div className="flex items-center justify-between gap-2 sm:gap-4 mb-6">
        <div className="relative flex items-center bg-[#1a1a1a] rounded-full p-1 border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.08)] h-11">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center px-3 sm:px-5 h-9 rounded-full text-xs sm:text-sm font-medium transition-all tap-feedback whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-[#2a2a2a] border border-[#3a3a3a] text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Period selector */}
        <div className="flex items-center bg-[#1a1a1a] rounded-full p-1 border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.08)] h-11">
          {periods.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-4 h-9 rounded-full text-xs sm:text-sm font-medium transition-all tap-feedback ${
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

      {/* User Stats Bar - Mobile optimized */}
      <div className="bg-[#1a1a1a] rounded-xl p-2.5 mb-4 border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.08)]">
        <div className="flex items-center gap-2.5 md:gap-5">
          <div className="flex items-center gap-2">
            <Avatar className="w-7 h-7">
              <AvatarImage src={userAvatar} />
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
            <span className="text-green-400 font-bold text-sm transition-all duration-300 flex items-center gap-0.5">
              <DollarSign className="w-3 h-3" />
              {formatAmount(Math.max(0, (winners[9]?.amount ?? 0) - playerWager))}
            </span>
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
                <TableHead className="text-muted-foreground font-medium text-[10px] md:text-xs">Wagered</TableHead>
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
                  avatar: userAvatar,
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
                            src={isUserPosition ? userAvatar : (player.isRealPhoto ? player.avatar : `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.avatar}`)} 
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
                      <span className="text-green-400 font-medium text-[10px] md:text-xs flex items-center gap-0.5">
                        <DollarSign className="w-3 h-3" />
                        {formatAmount(displayPlayer.amount)}
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
                <TableHead className="text-muted-foreground font-medium text-xs md:text-sm">Game</TableHead>
                <TableHead className="text-muted-foreground font-medium text-xs md:text-sm hidden sm:table-cell">Stake</TableHead>
                <TableHead className="text-muted-foreground font-medium text-xs md:text-sm hidden md:table-cell">Multiplier</TableHead>
                <TableHead className="text-muted-foreground font-medium text-xs md:text-sm">Prize</TableHead>
                <TableHead className="text-muted-foreground font-medium text-xs md:text-sm hidden md:table-cell">Time</TableHead>
                <TableHead className="text-muted-foreground font-medium text-xs md:text-sm">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myBetsData.map((bet) => (
                <TableRow key={bet.id} className="border-b border-border/50 hover:bg-secondary/50 h-8">
                  <TableCell className="py-2 px-2 md:px-4">
                    <span className="text-foreground text-xs md:text-sm truncate max-w-[80px] md:max-w-none">{bet.game}</span>
                  </TableCell>
                  <TableCell className="py-2 hidden sm:table-cell">
                    <span className="font-medium text-xs md:text-sm flex items-center gap-0.5 text-green-400">
                      <DollarSign className="w-3 h-3" />
                      {bet.stakeAmount.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="py-2 hidden md:table-cell">
                    <span className={bet.status === "win" ? "text-primary" : "text-muted-foreground"}>{bet.multiplier}</span>
                  </TableCell>
                  <TableCell className="py-2 px-2 md:px-4">
                    <span className={`text-xs md:text-sm flex items-center gap-0.5 ${bet.status === "win" ? "text-green-400 font-medium" : "text-destructive"}`}>
                      {bet.status === "win" && <DollarSign className="w-3 h-3" />}
                      {bet.prize.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="py-2 hidden md:table-cell">
                    <span className="text-muted-foreground text-xs">{bet.time}</span>
                  </TableCell>
                  <TableCell className="py-2 px-2 md:px-4">
                    <span className={`px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-medium ${
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
      <div className="flex items-center justify-center gap-2 mt-6">
        <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-card border border-border text-muted-foreground hover:bg-cyan-500/10 hover:border-cyan-500/50 transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        {[1, 2, 3].map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
              currentPage === page
                ? 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-cyan-500/50'
            }`}
          >
            {page}
          </button>
        ))}
        <span className="text-muted-foreground px-1">...</span>
        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium bg-card border border-border text-muted-foreground hover:text-foreground hover:border-cyan-500/50 transition-all">
          8
        </button>
        <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-card border border-border text-muted-foreground hover:bg-cyan-500/10 hover:border-cyan-500/50 transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Leaderboard;
