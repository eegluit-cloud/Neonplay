import { useState, useMemo } from "react";
import { useSidebar } from '@/hooks/useSidebar';
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { MobilePageHeader } from "@/components/MobilePageHeader";
import { Button } from "@/components/ui/button";
import { Lock, Gift, Check, Info, Star, Zap, Trophy, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import bronzeBadge from "@/assets/badges/bronze.png";
import silverBadge from "@/assets/badges/silver.png";
import goldBadge from "@/assets/badges/gold.png";
import platinumBadge from "@/assets/badges/platinum.png";
import diamondBadge from "@/assets/badges/diamond.png";
import starterBadge from "@/assets/badges/starter.png";
import silverNewBadge from "@/assets/badges/silver-new.png";
import { useUserVIP } from "@/hooks/useUserVIP";
import { useVipLevels, useVipRewards } from "@/hooks/useVIP";

// Badge and styling mappings for VIP levels (fallback when API doesn't have styling)
const LEVEL_STYLE_MAP: Record<string, {
  badge: string;
  color: string;
  badgeColor: string;
  bannerBg: string;
  bannerBorder: string;
  progressBar: string;
  progressDot: string;
  accentLine: string;
  benefitCard: string;
  benefitIcon: string;
}> = {
  'bronze': {
    badge: starterBadge,
    color: "from-[#8b6d5c] to-[#5c4033]",
    badgeColor: "from-[#c9a87c] via-[#b8956d] to-[#8b7355]",
    bannerBg: "from-[#3d2a1f] via-[#5a4030] to-[#6d5040]",
    bannerBorder: "border-amber-500/40",
    progressBar: "from-[#e8d5b5] to-[#d4c4a8]",
    progressDot: "bg-[#a67c52] border-[#d4c4a8]",
    accentLine: "via-amber-300",
    benefitCard: "from-[#4a4035] via-[#3d352a] to-[#302820] border-amber-600/30",
    benefitIcon: "bg-amber-500/20 text-amber-400"
  },
  'silver': {
    badge: silverNewBadge,
    color: "from-[#a0a0a0] to-[#707070]",
    badgeColor: "from-[#d1d5db] via-[#9ca3af] to-[#6b7280]",
    bannerBg: "from-[#2a2a30] via-[#404050] to-[#505060]",
    bannerBorder: "border-gray-400/40",
    progressBar: "from-[#d1d5db] to-[#9ca3af]",
    progressDot: "bg-[#6b7280] border-[#d1d5db]",
    accentLine: "via-gray-300",
    benefitCard: "from-[#35353a] via-[#2a2a30] to-[#202025] border-gray-500/30",
    benefitIcon: "bg-gray-400/20 text-gray-300"
  },
  'gold': {
    badge: goldBadge,
    color: "from-[#fbbf24] to-[#f59e0b]",
    badgeColor: "from-[#fcd34d] via-[#fbbf24] to-[#b8860b]",
    bannerBg: "from-[#3d3010] via-[#5a4820] to-[#6d5830]",
    bannerBorder: "border-yellow-500/40",
    progressBar: "from-[#fcd34d] to-[#fbbf24]",
    progressDot: "bg-[#b8860b] border-[#fcd34d]",
    accentLine: "via-yellow-300",
    benefitCard: "from-[#4a4020] via-[#3d3515] to-[#302a10] border-yellow-500/30",
    benefitIcon: "bg-yellow-500/20 text-yellow-400"
  },
  'platinum': {
    badge: silverBadge,
    color: "from-[#94a3b8] to-[#64748b]",
    badgeColor: "from-[#e2e8f0] via-[#94a3b8] to-[#475569]",
    bannerBg: "from-[#2a3040] via-[#405060] to-[#506070]",
    bannerBorder: "border-slate-400/40",
    progressBar: "from-[#e2e8f0] to-[#94a3b8]",
    progressDot: "bg-[#475569] border-[#e2e8f0]",
    accentLine: "via-slate-300",
    benefitCard: "from-[#353a45] via-[#2a3040] to-[#202530] border-slate-400/30",
    benefitIcon: "bg-slate-400/20 text-slate-300"
  },
  'diamond': {
    badge: diamondBadge,
    color: "from-[#d4a574] to-[#a67c52]",
    badgeColor: "from-[#67e8f9] via-[#22d3ee] to-[#0891b2]",
    bannerBg: "from-[#1a3545] via-[#2a5065] to-[#3a6580]",
    bannerBorder: "border-cyan-400/40",
    progressBar: "from-[#67e8f9] to-[#22d3ee]",
    progressDot: "bg-[#0891b2] border-[#67e8f9]",
    accentLine: "via-cyan-300",
    benefitCard: "from-[#253540] via-[#1a3040] to-[#102530] border-cyan-400/30",
    benefitIcon: "bg-cyan-400/20 text-cyan-400"
  }
};

const VIP = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Get VIP data from centralized hook
  const vip = useUserVIP();
  const { levels: apiLevels, isLoading: levelsLoading } = useVipLevels();
  const { rewards: apiRewards, isLoading: rewardsLoading, claimReward } = useVipRewards();

  const currentPoints = vip.currentPoints;
  const nextLevelPoints = vip.nextLevelPoints;
  const currentLevel = vip.level;
  const vipTier = vip.level;
  const progress = vip.progressPercent;

  // Build level details from API data with styling
  const levelDetails = useMemo(() => {
    if (apiLevels.length === 0) {
      // Fallback to default structure if API not loaded
      return Object.entries(LEVEL_STYLE_MAP).map(([name, style], idx) => ({
        level: idx + 1,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        benefits: [],
        ...style
      }));
    }

    return apiLevels.map(level => {
      const styleName = level.name.toLowerCase();
      const style = LEVEL_STYLE_MAP[styleName] || LEVEL_STYLE_MAP['bronze'];
      return {
        level: level.level,
        name: level.name,
        benefits: level.benefits || [],
        badge: level.iconUrl || style.badge,
        ...style
      };
    });
  }, [apiLevels]);

  // Build rewards from API data
  const rewards = useMemo(() => {
    if (apiRewards.length > 0) {
      return apiRewards.map(reward => ({
        id: reward.id,
        level: parseInt(reward.name.match(/\d+/)?.[0] || '1'),
        points: reward.usdAmount || reward.gcAmount || 0,
        claimed: reward.isClaimed,
        unlocked: true, // API rewards are always unlocked if visible
        claimable: !reward.isClaimed
      }));
    }

    // Fallback rewards based on level details
    return levelDetails.map((detail, idx) => ({
      level: detail.level,
      points: (idx + 1) * 2500,
      claimed: detail.level < currentLevel,
      unlocked: detail.level <= currentLevel,
      claimable: detail.level === currentLevel
    }));
  }, [apiRewards, levelDetails, currentLevel]);

  // Get current level details
  const currentLevelInfo = levelDetails.find(l => l.level === currentLevel) || levelDetails[0];

  const handleOpenDetails = (level: number) => {
    setSelectedLevel(level);
    setDetailsOpen(true);
  };

  const handleClaimReward = async (rewardId: string) => {
    try {
      await claimReward(rewardId);
    } catch (error) {
      console.error('Failed to claim reward:', error);
    }
  };

  const currentLevelDetails = selectedLevel ? levelDetails.find(l => l.level === selectedLevel) : null;

  const isLoading = levelsLoading || rewardsLoading || vip.isLoading;

  if (isLoading) {
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
          <main className="page-content page-spacing overflow-x-hidden page-transition-enter max-w-full flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
          </main>
        </div>
        <MobileBottomNav onMenuClick={toggleSidebar} />
      </div>
    );
  }

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
      
      {/* Main content - tablet sidebar support */}
      <div className={`transition-all duration-300 pt-14 md:pt-16 pb-20 md:pb-0 ${sidebarOpen ? 'md:ml-56' : 'md:ml-16'}`}>
        <main className="page-content page-spacing overflow-x-hidden !pt-2 lg:!pt-0 page-transition-enter max-w-full">
          {/* Mobile Header with Back Button */}
          <MobilePageHeader title="VIP Club" />
          <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-r ${currentLevelInfo.bannerBg} border ${currentLevelInfo.bannerBorder}`}>
            {/* Tech lines decoration - dynamic color based on level */}
            <div className="absolute inset-0 opacity-30">
              <div className={`absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent ${currentLevelInfo.accentLine} to-transparent`} />
              <div className={`absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent ${currentLevelInfo.accentLine} to-transparent`} />
              <div className={`absolute top-0 left-0 h-full w-px bg-gradient-to-b from-transparent ${currentLevelInfo.accentLine} to-transparent`} />
              <div className={`absolute top-0 right-0 h-full w-px bg-gradient-to-b from-transparent ${currentLevelInfo.accentLine} to-transparent`} />
            </div>
            
            <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
              {/* VIP Badge */}
              <div className="relative flex-shrink-0">
                <img 
                  src={currentLevelInfo.badge} 
                  alt={`Level ${currentLevel}`}
                  className="w-32 h-32 md:w-40 md:h-40 object-contain"
                />
              </div>
              
              {/* Progress Section */}
              <div className="flex-1 space-y-4 w-full">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">VIP {vipTier}</h2>
                  <Button 
                    variant="outline" 
                    onClick={() => handleOpenDetails(currentLevel)}
                    className="bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-500 hover:to-gray-400 text-white border-none font-semibold"
                  >
                    View Level Up Details
                  </Button>
                </div>
                
                <div className="bg-black/20 rounded-xl p-4">
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-white font-bold">{currentPoints.toLocaleString()} XP</span>
                    <span className="text-gray-300">{nextLevelPoints.toLocaleString()} XP</span>
                  </div>
                  <div className="relative h-3 bg-black/30 rounded-full">
                    <div 
                      className={`absolute inset-y-0 left-0 bg-gradient-to-r ${currentLevelInfo.progressBar} rounded-full transition-all duration-500`}
                      style={{ width: `${progress}%` }}
                    />
                    <div 
                      className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 ${currentLevelInfo.progressDot} rounded-full border-2 shadow-lg`}
                      style={{ left: `calc(${progress}% - 10px)` }}
                    />
                  </div>
                  <p className="text-gray-300 text-sm mt-3">
                    {(nextLevelPoints - currentPoints).toLocaleString()}XP until VIP {currentLevel + 1}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Exclusive VIP Bonus Section */}
          <div className="text-center space-y-3 sm:space-y-4">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
              <span className="text-foreground">Exclusive </span>
              <span className="text-lime-400">VIP Bonus</span>
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
              your progress is an accumulated sum through your wager, increase through tiers to earn bigger rewards
            </p>
          </div>

          {/* Rewards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {rewards.map((reward) => {
              const tierInfo = levelDetails.find(l => l.level === reward.level);
              // Get tier-specific dark colors
              const tierColors: Record<number, { card: string, badge: string }> = {
                1: { card: 'from-[#8b6850] via-[#5a4030] to-[#3d2a1f] border-amber-500/40 hover:border-amber-400/60', badge: 'from-[#6d5040] to-[#3d2a1f] border-amber-500/50' },
                2: { card: 'from-[#909aa8] via-[#6a7585] to-[#404550] border-gray-400/40 hover:border-gray-300/60', badge: 'from-[#5a6070] to-[#404550] border-gray-400/50' },
                3: { card: 'from-[#9a8040] via-[#6a5820] to-[#3d3010] border-yellow-400/40 hover:border-yellow-300/60', badge: 'from-[#6d5830] to-[#3d3010] border-yellow-400/50' },
                4: { card: 'from-[#7888a0] via-[#506070] to-[#2a3040] border-slate-300/40 hover:border-slate-200/60', badge: 'from-[#556070] to-[#2a3040] border-slate-300/50' },
                5: { card: 'from-[#5a8aa5] via-[#3a6075] to-[#1a3545] border-cyan-400/40 hover:border-cyan-300/60', badge: 'from-[#3a5a75] to-[#1a3545] border-cyan-400/50' },
              };
              const tierStyle = tierColors[reward.level] || tierColors[1];

              return (
                <div
                  key={reward.id || reward.level}
                  onClick={() => reward.claimable && reward.id && handleClaimReward(reward.id)}
                  className={`relative rounded-xl p-4 border transition-all bg-gradient-to-b ${tierStyle.card} ${!reward.unlocked ? 'opacity-80' : ''} ${reward.claimable ? 'cursor-pointer hover:scale-[1.02]' : ''} h-[220px] overflow-visible`}
                >
                  {/* Info icon */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDetails(reward.level);
                    }}
                    className="absolute top-2 right-2 z-20 w-7 h-7 rounded-full bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    <Info className="w-4 h-4" />
                  </button>

                  <div className="flex flex-col items-center text-center space-y-1 pt-2">
                    {/* Tier Name Badge */}
                    <div className={`px-3 py-1 rounded-md bg-gradient-to-b ${tierStyle.badge} border shadow-sm`}>
                      <span className="text-white font-bold text-[10px] uppercase tracking-wider">
                        {tierInfo?.name || `Level ${reward.level}`}
                      </span>
                    </div>

                    {/* Tier Badge Image - Always in center */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={tierInfo?.badge}
                        alt={tierInfo?.name || `Level ${reward.level}`}
                        className={`w-24 h-24 object-contain ${!reward.unlocked ? 'opacity-70 grayscale-[50%]' : ''}`}
                      />
                    </div>

                    <p className="text-white font-bold text-sm">{reward.points.toLocaleString()} pts</p>

                    {reward.claimed ? (
                      <div className="flex items-center gap-1 text-lime-400 text-xs">
                        <Check className="w-3 h-3" />
                        <span>Claimed</span>
                      </div>
                    ) : reward.claimable ? (
                      <button className="text-cyan-400 font-medium text-xs hover:text-cyan-300 transition-colors">
                        Tap to Claim
                      </button>
                    ) : (
                      <p className="text-muted-foreground text-xs">Locked</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* VIP Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className={`bg-gradient-to-b ${currentLevelInfo.benefitCard} rounded-xl p-6 text-center`}>
              <div className={`w-12 h-12 ${currentLevelInfo.benefitIcon} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <Gift className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-foreground mb-2">Exclusive Bonuses</h3>
              <p className="text-gray-400 text-xs sm:text-sm">Get special bonuses only available to VIP members</p>
            </div>
            
            <div className={`bg-gradient-to-b ${currentLevelInfo.benefitCard} rounded-xl p-6 text-center`}>
              <div className={`w-12 h-12 ${currentLevelInfo.benefitIcon} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <Star className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-foreground mb-2">Priority Support</h3>
              <p className="text-gray-400 text-xs sm:text-sm">Get faster response times and dedicated support</p>
            </div>
            
            <div className={`bg-gradient-to-b ${currentLevelInfo.benefitCard} rounded-xl p-6 text-center`}>
              <div className={`w-12 h-12 ${currentLevelInfo.benefitIcon} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-foreground mb-2">Higher Limits</h3>
              <p className="text-gray-400 text-xs sm:text-sm">Enjoy increased betting and withdrawal limits</p>
            </div>
          </div>
          
          <Footer />
        </main>
      </div>

      {/* Level Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className={`bg-gradient-to-b ${currentLevelDetails?.benefitCard || currentLevelInfo.benefitCard} max-w-md max-h-[90vh] overflow-y-auto scrollbar-hide`}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {currentLevelDetails && (
                <>
                  <img 
                    src={currentLevelDetails.badge} 
                    alt={currentLevelDetails.name}
                    className="w-16 h-16 object-contain"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-white">{currentLevelDetails.name}</h3>
                    <p className="text-sm text-gray-400">Level {currentLevelDetails.level}</p>
                  </div>
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {currentLevelDetails && (
            <div className="space-y-4 mt-4">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Benefits</h4>
                <div className="space-y-2">
                  {currentLevelDetails.benefits.map((benefit, idx) => (
                    <div key={idx} className={`flex items-center gap-3 p-3 bg-black/20 rounded-lg border ${currentLevelDetails.bannerBorder}`}>
                      <div className={`w-8 h-8 rounded-full ${currentLevelDetails.benefitIcon} flex items-center justify-center`}>
                        <Check className="w-4 h-4" />
                      </div>
                      <span className="text-white">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className={`pt-4 border-t ${currentLevelDetails.bannerBorder}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-400">XP Required</span>
                  <span className={`${currentLevelDetails.benefitIcon.split(' ')[1]} font-bold`}>{rewards.find(r => r.level === currentLevelDetails.level)?.points.toLocaleString()} XP</span>
                </div>
                
                {currentLevelDetails.level > currentLevel ? (
                  <Button 
                    className="w-full bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-500 hover:to-gray-400"
                    disabled
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Locked - Keep Playing to Unlock
                  </Button>
                ) : (
                  <Button 
                    className={`w-full bg-gradient-to-r ${currentLevelDetails.progressBar}`}
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    Level Unlocked!
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <MobileBottomNav onMenuClick={toggleSidebar} />
    </div>
  );
};

export default VIP;
