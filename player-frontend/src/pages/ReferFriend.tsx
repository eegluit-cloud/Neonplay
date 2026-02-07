import { useState } from "react";
import { useSidebar } from '@/hooks/useSidebar';
import { useUserAvatar } from '@/hooks/useUserAvatar';
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { MobilePageHeader } from "@/components/MobilePageHeader";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Copy, Check, Users, Trophy, Gift, Award, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import coinsImage from "@/assets/coins.png";
import crownImage from "@/assets/crown.png";
import treasureChestImage from "@/assets/treasure-chest.png";
import referCharacterImage from "@/assets/refer-character.png";
import referCharacter2Image from "@/assets/refer-character-2.png";
import trophyAwardImage from "@/assets/trophy-award.png";
import vipBadgeImage from "@/assets/vip-badge.png";
import megaphoneImage from "@/assets/megaphone.png";
import coinBagImage from "@/assets/coin-bag.png";
import referBannerBg from "@/assets/refer-banner-bg.jpg";
import casinoDealerImage from "@/assets/casino-dealer.png";

const ReferFriend = () => {
  const [copied, setCopied] = useState(false);
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const { avatar: userAvatar } = useUserAvatar();
  const referralLink = "www.phibet.io/referral/625372";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("הקישור הועתק!");
    setTimeout(() => setCopied(false), 2000);
  };

  const benefits = [
    {
      icon: Users,
      title: "Refer Friends",
      description: "Invite Friends And Earn Bonuses.",
      image: megaphoneImage,
    },
    {
      icon: Award,
      title: "Level Up",
      description: "Unlock VIP Perks And Get Bonus.",
      image: vipBadgeImage,
    },
    {
      icon: Trophy,
      title: "Play More & Win More",
      description: "Be On Top Of The League And Win Awards.",
      image: coinBagImage,
    },
    {
      icon: Gift,
      title: "Awards",
      description: "Daily, Weekly, Monthly And Seasonal.",
      image: trophyAwardImage,
    },
  ];

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
          <MobilePageHeader title="Refer a Friend" />
          
          {/* Hero Banner */}
          <div className="relative rounded-2xl overflow-hidden border border-blue-500/30 !mt-0">
            {/* Background image */}
            <img src={referBannerBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30" />
            
            
            <div className="relative z-10 p-6 md:py-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-4">
                <h1 className="text-xl sm:text-2xl md:text-4xl font-black text-white tracking-tight">
                  REFER A FRIEND
                </h1>
                
                <div className="flex gap-3">
                  <div className="bg-card/80 backdrop-blur-sm border border-green-500/30 rounded-xl px-6 py-2 flex items-center gap-3">
                    <p className="text-xs text-gray-400">You Earn</p>
                    <span className="text-green-400 font-bold text-xl">$100</span>
                  </div>
                  <div className="bg-card/80 backdrop-blur-sm border border-green-500/30 rounded-xl px-6 py-2 flex items-center gap-3">
                    <p className="text-xs text-gray-400">They Earn</p>
                    <span className="text-green-400 font-bold text-xl">$100</span>
                  </div>
                </div>
                
                <p className="text-gray-200 text-sm sm:text-base md:text-lg">
                  Everyone wins. Invite now and cash in together!
                </p>
              </div>
              
              <img 
                src={referCharacterImage} 
                alt="Refer Character" 
                className="w-40 h-40 md:w-72 md:h-72 md:-my-8 object-contain"
              />
            </div>
          </div>

          {/* Generate Referral Link Section */}
          <div className="flex flex-col md:flex-row items-center gap-8 bg-card/50 rounded-2xl p-6 md:p-10 border border-border">
            <img 
              src={referCharacter2Image} 
              alt="Character" 
              className="w-56 h-56 md:w-64 md:h-64 object-contain scale-125 origin-center"
            />
            
            <div className="flex-1 space-y-4 text-center md:text-left">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                Generate Your Unique Referral Link
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Click the button below to create your personal referral link.
              </p>
              
              <div className="space-y-2 flex flex-col items-center md:items-start">
                <label className="text-sm text-muted-foreground">Referral link</label>
                <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-4 h-12 w-full max-w-md">
                  <span className="flex-1 text-sm text-foreground truncate">{referralLink}</span>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={handleCopy}
                    className="hover:bg-casino-gold/20 w-10 h-10 rounded-xl tap-feedback"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-cyan-500" />
                    ) : (
                      <Copy className="w-5 h-5 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Earn Rewards Section */}
          <div className="text-center space-y-6">
            <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground mb-2">
              Earn Rewards Instantly
              </h2>
              <div className="w-16 h-1 bg-blue-500 mx-auto rounded-full" />
            </div>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
              Get bonuses or points every time your friend signs up and meets the requirements.
            </p>
          </div>

          {/* Benefits Grid - Desktop: 2 columns with dealer in center */}
          <div className="relative max-w-5xl mx-auto">
            {/* Mobile Layout */}
            <div className="md:hidden grid grid-cols-1 gap-3">
              {benefits.map((benefit, index) => (
                <div 
                  key={index}
                  className="relative bg-gradient-to-r from-[#0a1420] to-[#132033] rounded-xl p-2 pl-3 flex items-center justify-between overflow-hidden group transition-all border border-transparent"
                  style={{
                    boxShadow: '0 4px 20px rgba(59, 130, 246, 0.15), inset 0 -2px 0 0 rgba(59, 130, 246, 0.5)'
                  }}
                >
                  <div className="space-y-1 z-10 flex-1">
                    <h3 className="text-base font-black text-foreground">{benefit.title}</h3>
                    <p className="text-xs text-gray-400">{benefit.description}</p>
                  </div>
                  <img 
                    src={benefit.image} 
                    alt={benefit.title}
                    className="w-24 h-24 object-contain z-10 group-hover:scale-110 transition-transform"
                  />
                </div>
              ))}
            </div>
            
            {/* Desktop Layout - 3 columns with dealer in middle */}
            <div className="hidden md:grid md:grid-cols-3 gap-6 items-center">
              {/* Left Column - 2 boxes stacked */}
              <div className="flex flex-col gap-3">
                {[benefits[0], benefits[2]].map((benefit, index) => (
                  <div 
                    key={index}
                    className="relative bg-gradient-to-r from-[#0a1420] to-[#132033] rounded-xl p-2 pl-4 flex items-center justify-between overflow-visible group transition-all border border-transparent"
                    style={{
                      boxShadow: '0 4px 20px rgba(59, 130, 246, 0.15), inset 0 -2px 0 0 rgba(59, 130, 246, 0.5)'
                    }}
                  >
                    <div className="space-y-0.5 z-10 flex-1">
                      <h3 className="text-lg font-black text-foreground">{benefit.title}</h3>
                      <p className="text-xs text-gray-400 max-w-[120px]">{benefit.description}</p>
                    </div>
                    <img 
                      src={benefit.image} 
                      alt={benefit.title}
                      className="w-28 h-28 object-contain z-10 group-hover:scale-110 transition-transform -mr-2 -my-2"
                    />
                  </div>
                ))}
              </div>
              
              {/* Center - Dealer Image */}
              <div className="flex justify-center items-center">
                <img 
                  src={casinoDealerImage} 
                  alt="Casino Dealer" 
                  className="w-72 h-72 object-contain drop-shadow-2xl"
                />
              </div>
              
              {/* Right Column - 2 boxes stacked */}
              <div className="flex flex-col gap-3">
                {[benefits[1], benefits[3]].map((benefit, index) => (
                  <div 
                    key={index}
                    className="relative bg-gradient-to-r from-[#0a1420] to-[#132033] rounded-xl p-2 pl-4 flex items-center justify-between overflow-visible group transition-all border border-transparent"
                    style={{
                      boxShadow: '0 4px 20px rgba(59, 130, 246, 0.15), inset 0 -2px 0 0 rgba(59, 130, 246, 0.5)'
                    }}
                  >
                    <div className="space-y-0.5 z-10 flex-1">
                      <h3 className="text-lg font-black text-foreground">{benefit.title}</h3>
                      <p className="text-xs text-gray-400 max-w-[120px]">{benefit.description}</p>
                    </div>
                    <img 
                      src={benefit.image} 
                      alt={benefit.title}
                      className="w-28 h-28 object-contain z-10 group-hover:scale-110 transition-transform -mr-2 -my-2"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Referrals Section */}
          <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">Referrals</h2>
            
            {/* User Stats Bar - Leaderboard Style */}
            <div className="bg-[#1a1a1a] rounded-xl p-2.5 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.08)]">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Avatar className="w-7 h-7">
                    <AvatarImage src={userAvatar} />
                    <AvatarFallback className="text-xs">ME</AvatarFallback>
                  </Avatar>
                  <span className="text-foreground font-medium text-sm">My Name</span>
                </div>
                
                <div className="h-5 w-px bg-border" />
                
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-[10px]">Total Referrals</span>
                    <span className="text-primary font-bold text-sm">4</span>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-[10px]">Total Earned</span>
                    <span className="text-primary font-bold text-sm">$400</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Referrals Table - Leaderboard Style */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-2 md:px-4 text-muted-foreground font-medium text-xs md:text-sm">#</th>
                      <th className="text-left py-2 px-2 md:px-4 text-muted-foreground font-medium text-xs md:text-sm">User</th>
                      <th className="text-left py-2 px-2 md:px-4 text-muted-foreground font-medium text-xs md:text-sm">Balance</th>
                      <th className="text-left py-2 px-2 md:px-4 text-muted-foreground font-medium text-xs md:text-sm hidden sm:table-cell">VIP Level</th>
                      <th className="text-left py-2 px-2 md:px-4 text-muted-foreground font-medium text-xs md:text-sm hidden md:table-cell">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { position: 1, name: "Tony Stark", balance: 2450, level: 1, date: "Aug 24, 2013", color: "text-yellow-400 border-yellow-400/50" },
                      { position: 2, name: "Pepper Pots", balance: 1830, level: 2, date: "May 29, 2017", color: "text-gray-400 border-gray-400/50" },
                      { position: 3, name: "Steve", balance: 975, level: 3, date: "Nov 28, 2015", color: "text-orange-400 border-orange-400/50" },
                      { position: 4, name: "Robert", balance: 540, level: 4, date: "Oct 25, 2019", color: "text-cyan-400 border-cyan-400/50" },
                    ].map((referral) => (
                      <tr key={referral.position} className="border-b border-border/50 hover:bg-secondary/50 h-7">
                        <td className="py-1.5 px-2 md:px-4">
                          <span className={`inline-flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-lg bg-card/80 border text-[10px] md:text-xs font-bold ${referral.color}`}>
                            {referral.position}
                          </span>
                        </td>
                        <td className="py-1.5 px-2 md:px-4">
                          <div className="flex items-center gap-1.5 md:gap-2">
                            <Avatar className="w-5 h-5 md:w-6 md:h-6">
                              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${referral.name}`} />
                              <AvatarFallback className="text-[8px]">{referral.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-foreground text-[10px] md:text-xs">{referral.name}</span>
                          </div>
                        </td>
                        <td className="py-1.5 px-2 md:px-4">
                          <span className="text-green-400 font-medium text-[10px] md:text-xs">${referral.balance.toLocaleString()}</span>
                        </td>
                        <td className="py-1.5 px-2 md:px-4 hidden sm:table-cell">
                          <span className="text-muted-foreground text-xs">VIP {referral.level}</span>
                        </td>
                        <td className="py-1.5 px-2 md:px-4 hidden md:table-cell">
                          <span className="text-blue-400 text-xs">{referral.date}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination - Leaderboard Style */}
              <div className="flex items-center justify-center gap-2 py-4 border-t border-border/30">
                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-card border border-border text-muted-foreground hover:bg-cyan-500/10 hover:border-cyan-500/50 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {[1, 2, 3].map((page) => (
                  <button
                    key={page}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                      page === 1
                        ? 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white'
                        : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-cyan-500/50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <span className="text-muted-foreground text-sm px-1">...</span>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium bg-card border border-border text-muted-foreground hover:text-foreground hover:border-cyan-500/50 transition-all">
                  8
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-card border border-border text-muted-foreground hover:bg-cyan-500/10 hover:border-cyan-500/50 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        
        <Footer />
        </main>
      </div>
      
      <MobileBottomNav onMenuClick={toggleSidebar} />
    </div>
  );
};

export default ReferFriend;
