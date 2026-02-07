import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSidebar } from '@/hooks/useSidebar';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { LoginModal } from '@/components/LoginModal';
import { RegisterModal } from '@/components/RegisterModal';
import { SpinGiftModal } from '@/components/SpinGiftModal';
import { WalletModal } from '@/components/WalletModal';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { MobilePageHeader } from '@/components/MobilePageHeader';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown, Copy, ChevronRight as ChevronRightIcon, History, User, Lock, ShieldCheck, Receipt, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { useUserAvatar } from '@/hooks/useUserAvatar';
import { useUserVIP } from '@/hooks/useUserVIP';
import { useDragScroll } from '@/hooks/useDragScroll';
import { useAppMode, useWallet } from '@/contexts/AppModeContext';
import { CoinBalancePill } from '@/components/CoinBalancePill';

// Mock betting history data (sports + casino)
const gameHistoryData = [{
  id: '#24563156',
  date: '10/08/2025',
  gameName: 'Real Madrid vs Barcelona',
  amount: 1200,
  currency: 'USD' as const,
  status: 'WIN',
  type: 'sports',
  betType: 'Moneyline',
  pick: 'Real Madrid',
  odds: '+150',
  result: '3-1',
  sport: 'Soccer'
}, {
  id: '#24563157',
  date: '10/08/2025',
  gameName: 'Blackjack VIP',
  amount: 800,
  currency: 'USD' as const,
  status: 'WIN',
  type: 'casino',
  provider: 'Evolution',
  multiplier: 'x2.0',
  roundId: '#R8847621'
}, {
  id: '#24563158',
  date: '10/08/2025',
  gameName: 'Lakers vs Warriors',
  amount: 0.025,
  currency: 'BTC' as const,
  status: 'WIN',
  type: 'sports',
  betType: 'Spread',
  pick: 'Lakers -4.5',
  odds: '-110',
  result: '118-112',
  sport: 'Basketball'
}, {
  id: '#24563159',
  date: '10/08/2025',
  gameName: 'Book of Dead',
  amount: 500,
  currency: 'USD' as const,
  status: 'LOSS',
  type: 'casino',
  provider: 'Play\'n GO',
  multiplier: 'x0',
  roundId: '#R9912445'
}, {
  id: '#24563160',
  date: '10/08/2025',
  gameName: 'Man United vs Liverpool',
  amount: 0.03,
  currency: 'BTC' as const,
  status: 'LOSS',
  type: 'sports',
  betType: 'Over/Under',
  pick: 'Over 2.5',
  odds: '-105',
  result: '1-1',
  sport: 'Soccer'
}, {
  id: '#24563161',
  date: '10/08/2025',
  gameName: 'Lightning Roulette',
  amount: 2000,
  currency: 'USD' as const,
  status: 'WIN',
  type: 'casino',
  provider: 'Evolution',
  multiplier: 'x5.0',
  roundId: '#R7654321'
}, {
  id: '#24563162',
  date: '10/08/2025',
  gameName: 'Chiefs vs Eagles',
  amount: 1200,
  currency: 'USD' as const,
  status: 'WIN',
  type: 'sports',
  betType: 'Spread',
  pick: 'Chiefs -3',
  odds: '-115',
  result: '31-24',
  sport: 'Football'
}, {
  id: '#24563163',
  date: '10/08/2025',
  gameName: 'Crazy Time',
  amount: 0.005,
  currency: 'BTC' as const,
  status: 'WIN',
  type: 'casino',
  provider: 'Evolution',
  multiplier: 'x8.5',
  roundId: '#R5544332'
}];
const Profile = () => {
  const navigate = useNavigate();
  const {
    sidebarOpen,
    toggleSidebar
  } = useSidebar();
  const [signInOpen, setSignInOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);
  const [spinGiftOpen, setSpinGiftOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [walletDefaultTab, setWalletDefaultTab] = useState<'deposit' | 'withdraw'>('deposit');
  
  const { usdBalance, btcBalance } = useWallet();
  const [activeTab, setActiveTab] = useState('game-history');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [expandAll, setExpandAll] = useState(false);
  const [dateFilter, setDateFilter] = useState('7days');
  const [fromDate, setFromDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  });
  const [toDate, setToDate] = useState<Date>(new Date());
  const [tempFromDate, setTempFromDate] = useState<Date | undefined>(undefined);
  const [tempToDate, setTempToDate] = useState<Date | undefined>(undefined);
  const [fromCalendarOpen, setFromCalendarOpen] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(undefined);
  const [dobCalendarOpenMobile, setDobCalendarOpenMobile] = useState(false);
  const [dobCalendarOpenDesktop, setDobCalendarOpenDesktop] = useState(false);
  const [toCalendarOpen, setToCalendarOpen] = useState(false);
  const [txFromDate, setTxFromDate] = useState<Date>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date;
  });
  const [txToDate, setTxToDate] = useState<Date>(new Date());
  const [txFromCalendarOpen, setTxFromCalendarOpen] = useState(false);
  const [txToCalendarOpen, setTxToCalendarOpen] = useState(false);
  const {
    avatar: currentAvatar,
    updateAvatar
  } = useUserAvatar();

  const mobileTabsDrag = useDragScroll<HTMLDivElement>();
  const mobileFiltersDrag = useDragScroll<HTMLDivElement>();
  const vip = useUserVIP();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Upload triggered', event.target.files);
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name, file.size);
      updateAvatar(file);
    }
  };
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Update dates when filter changes
  const handleFilterChange = (filter: string) => {
    setDateFilter(filter);
    const today = new Date();
    let startDate = new Date();
    switch (filter) {
      case '24hours':
        startDate.setDate(today.getDate() - 1);
        break;
      case '7days':
        startDate.setDate(today.getDate() - 7);
        break;
      case '2weeks':
        startDate.setDate(today.getDate() - 14);
        break;
      case 'month':
        startDate.setMonth(today.getMonth() - 1);
        break;
      default:
        startDate.setDate(today.getDate() - 7);
    }
    setFromDate(startDate);
    setToDate(today);
  };
  const formatDisplayDate = (date: Date) => {
    return format(date, 'dd/MM/yyyy');
  };
  const toggleRowExpand = (index: number) => {
    setExpandedRows(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
  };

  // Handle expand all toggle
  const handleExpandAllToggle = (checked: boolean) => {
    setExpandAll(checked);
    if (checked) {
      setExpandedRows(gameHistoryData.map((_, index) => index));
    } else {
      setExpandedRows([]);
    }
  };
  return <div className="min-h-screen min-h-[100dvh] bg-background">
      <Header onOpenSignIn={() => setSignInOpen(true)} onOpenSignUp={() => setSignUpOpen(true)} onToggleSidebar={toggleSidebar} />
      
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} onOpenSpinGift={() => setSpinGiftOpen(true)} />
      
      {/* Main content - tablet sidebar support */}
      <div className={`transition-all duration-300 pt-14 md:pt-16 pb-20 md:pb-0 ${sidebarOpen ? 'md:ml-56' : 'md:ml-16'}`}>
        <main className="p-3 md:p-4 lg:p-6 space-y-4 md:space-y-6 overflow-x-hidden page-transition-enter max-w-full">
          
          {/* Mobile Header with Back Button */}
          <MobilePageHeader title="Profile" />

          {/* Profile Header Card - Tablet & Desktop */}
          <div className="hidden md:block bg-card rounded-xl p-4 lg:p-6 border border-border">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              {/* Avatar with online indicator and upload */}
              <div className="relative flex-shrink-0">
                <img src={currentAvatar} alt="Profile" className="w-16 lg:w-20 h-16 lg:h-20 rounded-full object-cover border-2 border-border" />
                <div className="absolute bottom-1 right-1 w-5 lg:w-6 h-5 lg:h-6 bg-cyan-500 rounded-full border-2 border-card flex items-center justify-center">
                  <Camera className="w-2.5 lg:w-3 h-2.5 lg:h-3 text-white" />
                </div>
              </div>
              
              {/* User Info */}
              <div className="flex flex-col gap-2 lg:gap-3 flex-1">
                <h1 className="text-xl lg:text-2xl font-bold text-foreground">Hello, Dennis Callis</h1>
                <div className="flex flex-wrap items-center gap-2 lg:gap-3">
                  {/* Balance Pill - Toggle Style */}
                  <CoinBalancePill size="md" />
                </div>
                
                {/* VIP Level - matching sidebar style */}
                <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 mt-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground text-base lg:text-lg leading-tight">{vip.tierLabel}</span>
                    <span className={`px-2 py-0.5 ${vip.tierBadgeClass} text-[10px] font-semibold rounded uppercase`}>
                      {vip.tierName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 lg:gap-3 flex-1 max-w-xs">
                    <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full relative"
                        style={{ width: `${vip.progressPercent}%` }}
                      >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-cyan-400 rounded-full border-2 border-card" />
                      </div>
                    </div>
                    <span className="text-[10px] lg:text-xs text-muted-foreground whitespace-nowrap">{vip.xpToNext} XP to <span className="text-foreground font-medium">{vip.nextLevelLabel}</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Header Card - Mobile */}
          <div className="md:hidden space-y-2">
            {/* User Row */}
            <div className="bg-card rounded-xl p-3 border border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <img src={currentAvatar} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-cyan-500 rounded-full border-2 border-card flex items-center justify-center">
                      <Camera className="w-2.5 h-2.5 text-white" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <h1 className="text-sm font-bold text-foreground">Dennis Callis</h1>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span>ID: 32924801</span>
                      <button className="hover:text-foreground">
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
                <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            {/* VIP Row */}
            <div className="bg-card rounded-xl p-3 border border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-foreground">{vip.tierLabel}</span>
                  <span className={`px-1.5 py-0.5 ${vip.tierBadgeClass} text-[10px] font-bold rounded`}>{vip.tierName.toUpperCase()}</span>
                </div>
                <button className="flex items-center gap-0.5 text-xs text-cyan-400 hover:text-cyan-300">
                  VIP Club
                  <ChevronRightIcon className="w-3 h-3" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full"
                    style={{ width: `${vip.progressPercent}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">{vip.xpToNext} XP to <span className="text-foreground font-medium">{vip.nextLevelLabel}</span></span>
              </div>
            </div>

            {/* Balance Row - Toggle Style */}
            <div className="bg-card rounded-xl p-3 border border-border">
              <CoinBalancePill size="sm" className="w-full justify-between" />
            </div>
          </div>

          {/* Tabs Section */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Mobile Tabs - Horizontal Scroll */}
              <div
                ref={mobileTabsDrag.ref}
                onPointerDown={mobileTabsDrag.onPointerDown}
                onPointerMove={mobileTabsDrag.onPointerMove}
                onPointerUp={mobileTabsDrag.onPointerUp}
                onPointerCancel={mobileTabsDrag.onPointerCancel}
                onClickCapture={mobileTabsDrag.onClickCapture}
                onWheel={mobileTabsDrag.onWheel}
                className="md:hidden w-full overflow-x-auto scrollbar-hide"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                <TabsList className="bg-card border border-border rounded-full h-auto p-1 inline-flex gap-0 min-w-max">
                  <TabsTrigger value="game-history" className="border border-transparent data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:border-cyan-500/50 data-[state=inactive]:text-muted-foreground px-4 py-2.5 text-xs rounded-full whitespace-nowrap flex items-center gap-1.5 transition-all flex-shrink-0">
                    <History className="w-3.5 h-3.5" />
                    Game History
                  </TabsTrigger>
                  <TabsTrigger value="user-profile" className="border border-transparent data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:border-cyan-500/50 data-[state=inactive]:text-muted-foreground px-4 py-2.5 text-xs rounded-full whitespace-nowrap flex items-center gap-1.5 transition-all flex-shrink-0">
                    <User className="w-3.5 h-3.5" />
                    User Profile
                  </TabsTrigger>
                  <TabsTrigger value="password" className="border border-transparent data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:border-cyan-500/50 data-[state=inactive]:text-muted-foreground px-4 py-2.5 text-xs rounded-full whitespace-nowrap flex items-center gap-1.5 transition-all flex-shrink-0">
                    <Lock className="w-3.5 h-3.5" />
                    Password
                  </TabsTrigger>
                  <TabsTrigger value="kyc" className="border border-transparent data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:border-cyan-500/50 data-[state=inactive]:text-muted-foreground px-4 py-2.5 text-xs rounded-full whitespace-nowrap flex items-center gap-1.5 transition-all flex-shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    KYC
                  </TabsTrigger>
                  <TabsTrigger value="transactions" className="border border-transparent data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:border-cyan-500/50 data-[state=inactive]:text-muted-foreground px-4 py-2.5 text-xs rounded-full whitespace-nowrap flex items-center gap-1.5 transition-all flex-shrink-0">
                    <Receipt className="w-3.5 h-3.5" />
                    Transactions
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Desktop Tabs */}
              <TabsList className="hidden md:flex bg-card border border-border h-auto p-1 w-fit">
                <TabsTrigger value="game-history" className="data-[state=active]:bg-muted data-[state=active]:text-foreground px-4 py-2 text-sm">
                  Game History
                </TabsTrigger>
                <TabsTrigger value="user-profile" className="data-[state=active]:bg-muted data-[state=active]:text-foreground px-4 py-2 text-sm">
                  User Profile
                </TabsTrigger>
                <TabsTrigger value="password" className="data-[state=active]:bg-muted data-[state=active]:text-foreground px-4 py-2 text-sm">
                  Password
                </TabsTrigger>
                <TabsTrigger value="kyc" className="data-[state=active]:bg-muted data-[state=active]:text-foreground px-4 py-2 text-sm">
                  KYC
                </TabsTrigger>
                <TabsTrigger value="transactions" className="data-[state=active]:bg-muted data-[state=active]:text-foreground px-4 py-2 text-sm">
                  Transactions
                </TabsTrigger>
              </TabsList>

              {/* Filters - only show on game history tab */}
              {activeTab === 'game-history' && (
                <div
                  ref={mobileFiltersDrag.ref}
                  onPointerDown={mobileFiltersDrag.onPointerDown}
                  onPointerMove={mobileFiltersDrag.onPointerMove}
                  onPointerUp={mobileFiltersDrag.onPointerUp}
                  onPointerCancel={mobileFiltersDrag.onPointerCancel}
                  onClickCapture={mobileFiltersDrag.onClickCapture}
                  onWheel={mobileFiltersDrag.onWheel}
                  className="w-full overflow-x-auto scrollbar-hide md:overflow-visible"
                  style={{ WebkitOverflowScrolling: 'touch' }}
                >
                  <div className="flex items-center gap-2 md:gap-3 min-w-max">
                    {/* Date From */}
                    <Popover open={fromCalendarOpen} onOpenChange={open => {
                      setFromCalendarOpen(open);
                      if (open) setTempFromDate(fromDate);
                    }}>
                      <PopoverTrigger asChild>
                        <button className="flex items-center gap-1.5 md:gap-2 bg-card border border-border rounded-xl px-3 md:px-3 h-9 md:h-10 hover:bg-muted/50 transition-colors cursor-pointer flex-shrink-0">
                          <span className="text-xs md:text-sm text-foreground whitespace-nowrap">{formatDisplayDate(fromDate)}</span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-[100]" align="start">
                        <Calendar mode="single" selected={tempFromDate} onSelect={setTempFromDate} initialFocus className="pointer-events-auto" />
                        <div className="flex gap-2 p-3 border-t border-border">
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => setFromCalendarOpen(false)}>
                            Cancel
                          </Button>
                          <Button size="sm" className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white" onClick={() => {
                            if (tempFromDate) setFromDate(tempFromDate);
                            setFromCalendarOpen(false);
                          }}>
                            Confirm
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                    
                    {/* Date To */}
                    <Popover open={toCalendarOpen} onOpenChange={open => {
                      setToCalendarOpen(open);
                      if (open) setTempToDate(toDate);
                    }}>
                      <PopoverTrigger asChild>
                        <button className="flex items-center gap-1.5 md:gap-2 bg-card border border-border rounded-xl px-3 md:px-3 h-9 md:h-10 hover:bg-muted/50 transition-colors cursor-pointer flex-shrink-0">
                          <span className="text-xs md:text-sm text-foreground whitespace-nowrap">{formatDisplayDate(toDate)}</span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-[100]" align="start">
                        <Calendar mode="single" selected={tempToDate} onSelect={setTempToDate} initialFocus className="pointer-events-auto" />
                        <div className="flex gap-2 p-3 border-t border-border">
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => setToCalendarOpen(false)}>
                            Cancel
                          </Button>
                          <Button size="sm" className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white" onClick={() => {
                            if (tempToDate) setToDate(tempToDate);
                            setToCalendarOpen(false);
                          }}>
                            Confirm
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                    
                    {/* Period Filter */}
                    <Select value={dateFilter} onValueChange={handleFilterChange}>
                      <SelectTrigger className="w-auto bg-card border-border rounded-xl h-9 md:h-10 px-3 text-xs md:text-sm flex-shrink-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24hours">24 Hours</SelectItem>
                        <SelectItem value="7days">7 Days</SelectItem>
                        <SelectItem value="2weeks">2 Weeks</SelectItem>
                        <SelectItem value="month">Month</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Expand All Switch */}
                    <div 
                      className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 h-9 md:h-10 flex-shrink-0"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Switch id="expand-all" checked={expandAll} onCheckedChange={handleExpandAllToggle} className="data-[state=checked]:bg-cyan-500" />
                      <Label htmlFor="expand-all" className="text-xs md:text-sm text-muted-foreground cursor-pointer whitespace-nowrap">
                        Details
                      </Label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Game History Tab Content */}
            <TabsContent value="game-history" className="mt-6">
              {/* Table - Desktop */}
              <div className="hidden md:block bg-card rounded-xl border border-border overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left pl-6 pr-2 py-4 text-sm font-medium text-foreground">Game ID</th>
                      <th className="text-left px-4 py-4 text-sm font-medium text-foreground">Date & time</th>
                      <th className="text-left px-4 py-4 text-sm font-medium text-foreground">Game Name</th>
                      <th className="text-right px-4 py-4 text-sm font-medium text-foreground">Amount</th>
                      <th className="text-right px-4 pr-6 py-4 text-sm font-medium text-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gameHistoryData
                      .map((game, index) => <>
                        <tr key={`desktop-row-${index}`} className={`cursor-pointer hover:bg-muted/20 transition-colors ${index !== gameHistoryData.length - 1 && !expandedRows.includes(index) ? 'border-b border-border/50' : ''}`} onClick={() => toggleRowExpand(index)}>
                          <td className="pl-6 pr-2 py-2 text-sm text-muted-foreground">{game.id}</td>
                          <td className="px-4 py-2 text-sm text-muted-foreground">{game.date}</td>
                          <td className="px-4 py-2 text-sm text-foreground font-medium">{game.gameName}</td>
                          <td className={`px-4 py-2 text-sm text-right font-medium ${game.status === 'WIN' ? 'text-cyan-400' : 'text-red-400'}`}>{game.currency === 'USD' ? '$' : ''}{game.amount.toLocaleString()} {game.currency === 'BTC' ? 'BTC' : ''}</td>
                          <td className="px-4 pr-6 py-2 text-sm text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${game.status === 'WIN' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-red-500/20 text-red-400'}`}>
                                {game.status}
                              </span>
                              <div className={`p-1 rounded-md border transition-all ${expandedRows.includes(index) ? 'bg-cyan-500/30 border-cyan-500/50' : 'bg-cyan-500/10 border-cyan-500/30 hover:bg-cyan-500/20'}`}>
                                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expandedRows.includes(index) ? 'rotate-180 text-cyan-400' : 'text-cyan-400'}`} />
                              </div>
                            </div>
                          </td>
                        </tr>
                        {expandedRows.includes(index) && <tr key={`desktop-details-${index}`} className={index !== gameHistoryData.length - 1 ? 'border-b border-border/50' : ''}>
                            <td colSpan={5} className="pl-6 pr-6 py-0.5 bg-muted/10">
                              <div className="flex items-center gap-6 text-xs">
                                {game.type === 'sports' ? <>
                                    <span><span className="text-muted-foreground">Sport:</span> <span className="text-foreground">{game.sport}</span></span>
                                    <span><span className="text-muted-foreground">Bet Type:</span> <span className="text-foreground">{game.betType}</span></span>
                                    <span><span className="text-muted-foreground">Pick:</span> <span className="text-foreground">{game.pick}</span></span>
                                    <span><span className="text-muted-foreground">Odds:</span> <span className="text-foreground">{game.odds}</span></span>
                                    <span><span className="text-muted-foreground">Result:</span> <span className="text-foreground">{game.result}</span></span>
                                  </> : <>
                                    <span><span className="text-muted-foreground">Provider:</span> <span className="text-foreground">{game.provider}</span></span>
                                    <span><span className="text-muted-foreground">Round ID:</span> <span className="text-foreground">{game.roundId}</span></span>
                                    <span><span className="text-muted-foreground">Multiplier:</span> <span className="text-foreground">{game.multiplier}</span></span>
                                  </>}
                              </div>
                            </td>
                          </tr>}
                      </>)}
                  </tbody>
                </table>
              </div>

              {/* Table - Mobile */}
              <div className="md:hidden bg-card rounded-xl border border-border overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left pl-3 pr-2 py-2.5 text-xs font-medium text-foreground w-[22%]">Date & ID</th>
                      <th className="text-left px-2 py-2.5 text-xs font-medium text-foreground w-[30%]">Game</th>
                      <th className="text-right px-2 py-2.5 text-xs font-medium text-foreground w-[20%]">Amount</th>
                      <th className="text-right pr-3 pl-2 py-2.5 text-xs font-medium text-foreground w-[28%]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gameHistoryData
                      .map((game, index) => <>
                        <tr key={index} className={`cursor-pointer hover:bg-muted/20 ${index !== gameHistoryData.length - 1 && !expandedRows.includes(index) ? 'border-b border-border/50' : ''}`} onClick={() => toggleRowExpand(index)}>
                          <td className="pl-3 pr-2 py-2">
                            <div className="text-xs text-muted-foreground leading-tight">{game.id.replace('#', '')}</div>
                            <div className="text-xs text-muted-foreground leading-tight">10 Aug 2025</div>
                          </td>
                          <td className="px-2 py-2">
                            <span className="text-xs text-foreground font-medium">{game.gameName}</span>
                          </td>
                          <td className={`px-2 py-2 text-xs text-right font-medium ${game.status === 'WIN' ? 'text-cyan-400' : 'text-red-400'}`}>{game.currency === 'USD' ? '$' : ''}{game.amount.toLocaleString()} {game.currency === 'BTC' ? 'BTC' : ''}</td>
                          <td className="pr-3 pl-2 py-2 text-xs text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <span className={game.status === 'WIN' ? 'text-cyan-400 font-medium' : 'text-red-500 font-medium'}>
                                {game.status}
                              </span>
                              <div className={`p-0.5 rounded border transition-all ${expandedRows.includes(index) ? 'bg-cyan-500/30 border-cyan-500/50' : 'bg-cyan-500/10 border-cyan-500/30'}`}>
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedRows.includes(index) ? 'rotate-180 text-cyan-400' : 'text-cyan-400'}`} />
                              </div>
                            </div>
                          </td>
                        </tr>
                        {expandedRows.includes(index) && <tr key={`${index}-details`} className={index !== gameHistoryData.length - 1 ? 'border-b border-border/50' : ''}>
                            <td colSpan={4} className="px-3 py-0.5 bg-muted/10">
                              <div className="flex flex-wrap gap-x-3 text-[10px]">
                                {game.type === 'sports' ? <>
                                    <span><span className="text-muted-foreground">Sport:</span> <span className="text-foreground">{game.sport}</span></span>
                                    <span><span className="text-muted-foreground">Pick:</span> <span className="text-foreground">{game.pick}</span></span>
                                    <span><span className="text-muted-foreground">Odds:</span> <span className="text-foreground">{game.odds}</span></span>
                                    <span><span className="text-muted-foreground">Result:</span> <span className="text-foreground">{game.result}</span></span>
                                  </> : <>
                                    <span><span className="text-muted-foreground">Provider:</span> <span className="text-foreground">{game.provider}</span></span>
                                    <span><span className="text-muted-foreground">Round:</span> <span className="text-foreground">{game.roundId}</span></span>
                                    <span><span className="text-muted-foreground">Multi:</span> <span className="text-foreground">{game.multiplier}</span></span>
                                  </>}
                              </div>
                            </td>
                          </tr>}
                      </>)}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-center gap-2 mt-6">
                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-card border border-border text-muted-foreground hover:bg-cyan-500/10 hover:border-cyan-500/50 transition-colors" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}>
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {[1, 2, 3].map(page => (
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
                
                <button className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium bg-card border border-border text-muted-foreground hover:text-foreground hover:border-cyan-500/50 transition-all" onClick={() => setCurrentPage(8)}>
                  8
                </button>
                
                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-card border border-border text-muted-foreground hover:bg-cyan-500/10 hover:border-cyan-500/50 transition-colors" onClick={() => setCurrentPage(Math.min(8, currentPage + 1))}>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </TabsContent>

            {/* User Profile Tab Content */}
            <TabsContent value="user-profile" className="mt-4 md:mt-6">
              <div className="space-y-4 md:space-y-6">
                <h2 className="text-lg font-bold text-foreground">Profile</h2>
                
                {/* Mobile Layout - Single Column */}
                <div className="md:hidden space-y-3">
                  <input type="text" placeholder="First Name" className="w-full bg-card border border-border rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
                  <input type="text" placeholder="Last Name" className="w-full bg-card border border-border rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
                  <input type="text" placeholder="Username" className="w-full bg-card border border-border rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
                  <input type="email" placeholder="Email Address" className="w-full bg-card border border-border rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
                  
                  <div className="pt-2">
                    <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Date of Birth</label>
                    <Popover open={dobCalendarOpenMobile} onOpenChange={setDobCalendarOpenMobile}>
                      <PopoverTrigger asChild>
                        <button className="w-full bg-card border border-border rounded-xl px-4 py-3.5 text-sm text-left flex items-center justify-between focus:outline-none focus:border-primary">
                          <span className={dateOfBirth ? "text-foreground" : "text-muted-foreground"}>
                            {dateOfBirth ? format(dateOfBirth, "dd/MM/yyyy") : "DD/MM/YYYY"}
                          </span>
                          <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-[100]" align="start" sideOffset={4}>
                        <Calendar mode="single" selected={dateOfBirth} onSelect={date => {
                        setDateOfBirth(date);
                        setDobCalendarOpenMobile(false);
                      }} disabled={date => date > new Date() || date < new Date("1900-01-01")} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <Select>
                    <SelectTrigger className="w-full bg-card border-border rounded-xl h-12">
                      <SelectValue placeholder="Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="pt-2">
                    <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Contact Number</label>
                    <div className="flex items-center gap-2">
                      <Select defaultValue="+91">
                        <SelectTrigger className="w-20 bg-card border-border rounded-xl h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="+91">+91</SelectItem>
                          <SelectItem value="+1">+1</SelectItem>
                          <SelectItem value="+44">+44</SelectItem>
                          <SelectItem value="+972">+972</SelectItem>
                        </SelectContent>
                      </Select>
                      <input type="tel" placeholder="Phone Number" className="flex-1 bg-card border border-border rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
                    </div>
                  </div>
                  
                  <input type="text" placeholder="Address Line 1" className="w-full bg-card border border-border rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
                  
                  <Select>
                    <SelectTrigger className="w-full bg-card border-border rounded-xl h-12">
                      <SelectValue placeholder="State" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ca">California</SelectItem>
                      <SelectItem value="ny">New York</SelectItem>
                      <SelectItem value="tx">Texas</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select>
                    <SelectTrigger className="w-full bg-card border-border rounded-xl h-12">
                      <SelectValue placeholder="City" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="la">Los Angeles</SelectItem>
                      <SelectItem value="sf">San Francisco</SelectItem>
                      <SelectItem value="sd">San Diego</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <input type="text" placeholder="Zip Code" className="w-full bg-card border border-border rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
                  
                  {/* Mobile Buttons */}
                  <div className="flex flex-col gap-3 pt-4">
                    <Button className="w-full h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-400 hover:from-cyan-600 hover:to-blue-500 text-black font-bold text-base">
                      Save & Continue
                    </Button>
                    <Button variant="outline" className="w-full h-12 rounded-xl border-border text-foreground font-medium text-base">
                      Cancel
                    </Button>
                  </div>
                </div>
                
                {/* Tablet & Desktop Layout - Responsive Grid */}
                <div className="hidden md:block space-y-4 lg:space-y-6">
                  {/* Row 1 - 2 cols on tablet, 4 cols on desktop */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground uppercase tracking-wider">First Name</label>
                      <input type="text" placeholder="Enter First Name" className="w-full bg-card border border-border rounded-lg px-3 lg:px-4 py-2.5 lg:py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground uppercase tracking-wider">Last Name</label>
                      <input type="text" placeholder="Enter Last Name" className="w-full bg-card border border-border rounded-lg px-3 lg:px-4 py-2.5 lg:py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground uppercase tracking-wider">Username</label>
                      <input type="text" placeholder="Enter Username" className="w-full bg-card border border-border rounded-lg px-3 lg:px-4 py-2.5 lg:py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground uppercase tracking-wider">Email Address</label>
                      <input type="email" placeholder="Enter Mail Address" className="w-full bg-card border border-border rounded-lg px-3 lg:px-4 py-2.5 lg:py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
                    </div>
                  </div>

                  {/* Row 2 - 2 cols on tablet, 4 cols on desktop */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground uppercase tracking-wider">Date of Birth</label>
                      <Popover open={dobCalendarOpenDesktop} onOpenChange={setDobCalendarOpenDesktop}>
                        <PopoverTrigger asChild>
                          <button className="w-full bg-card border border-border rounded-lg px-3 lg:px-4 py-2.5 lg:py-3 text-sm text-left flex items-center justify-between focus:outline-none focus:border-primary h-10 lg:h-11">
                            <span className={dateOfBirth ? "text-foreground" : "text-muted-foreground"}>
                              {dateOfBirth ? format(dateOfBirth, "dd/MM/yyyy") : "DD/MM/YYYY"}
                            </span>
                            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 z-[100]" align="start" sideOffset={4}>
                          <Calendar mode="single" selected={dateOfBirth} onSelect={date => {
                          setDateOfBirth(date);
                          setDobCalendarOpenDesktop(false);
                        }} disabled={date => date > new Date() || date < new Date("1900-01-01")} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground uppercase tracking-wider">Gender</label>
                      <Select>
                        <SelectTrigger className="w-full bg-card border-border h-10 lg:h-11">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground uppercase tracking-wider">Address Line 1</label>
                      <input type="text" placeholder="Address Line 1" className="w-full bg-card border border-border rounded-lg px-3 lg:px-4 py-2.5 lg:py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground uppercase tracking-wider">Address Line 2</label>
                      <Select>
                        <SelectTrigger className="w-full bg-card border-border h-10 lg:h-11">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="apt">Apartment</SelectItem>
                          <SelectItem value="suite">Suite</SelectItem>
                          <SelectItem value="floor">Floor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Row 3 - 2 cols on tablet, 4 cols on desktop */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground uppercase tracking-wider">Contact Number</label>
                      <input type="text" placeholder="+91" className="w-full bg-card border border-border rounded-lg px-3 lg:px-4 py-2.5 lg:py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground uppercase tracking-wider">State</label>
                      <Select>
                        <SelectTrigger className="w-full bg-card border-border h-10 lg:h-11">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ca">California</SelectItem>
                          <SelectItem value="ny">New York</SelectItem>
                          <SelectItem value="tx">Texas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground uppercase tracking-wider">City</label>
                      <Select>
                        <SelectTrigger className="w-full bg-card border-border h-10 lg:h-11">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="la">Los Angeles</SelectItem>
                          <SelectItem value="sf">San Francisco</SelectItem>
                          <SelectItem value="sd">San Diego</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground uppercase tracking-wider">Zip Code</label>
                      <input type="text" placeholder="Code" className="w-full bg-card border border-border rounded-lg px-3 lg:px-4 py-2.5 lg:py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
                    </div>
                  </div>

                  {/* Desktop Buttons */}
                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" className="px-6">
                      Cancel
                    </Button>
                    <Button className="px-6 bg-gradient-to-r from-cyan-500 to-blue-400 hover:from-cyan-600 hover:to-blue-500 text-white font-bold">
                      Save & Continue
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Password Tab Content */}
            <TabsContent value="password" className="mt-4 md:mt-6">
              <div className="space-y-4 md:space-y-6">
                <h2 className="text-lg font-bold text-foreground">Password Change</h2>
                
                {/* Password fields - responsive grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground uppercase tracking-wider">Old Password</label>
                    <input type="password" placeholder="Enter Old Password" className="w-full bg-card border border-border rounded-lg px-3 lg:px-4 py-2.5 lg:py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
                  </div>
                </div>

                {/* New Password & Confirm Password */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground uppercase tracking-wider">New Password</label>
                    <input type="password" placeholder="Enter New Password" className="w-full bg-card border border-border rounded-lg px-3 lg:px-4 py-2.5 lg:py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground uppercase tracking-wider">Confirm Password</label>
                    <input type="password" placeholder="Enter Confirm Password" className="w-full bg-card border border-border rounded-lg px-3 lg:px-4 py-2.5 lg:py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
                  </div>
                </div>

                {/* Buttons - responsive */}
                <div className="flex flex-col md:flex-row md:justify-end gap-3 pt-4">
                  <Button variant="outline" className="px-6 w-full md:w-auto order-2 md:order-1">
                    Cancel
                  </Button>
                  <Button className="px-6 w-full md:w-auto bg-gradient-to-r from-cyan-500 to-blue-400 hover:from-cyan-600 hover:to-blue-500 text-white font-bold order-1 md:order-2">
                    Save & Continue
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* KYC Tab Content */}
            <TabsContent value="kyc" className="mt-6">
              <div className="bg-card rounded-xl border border-border p-6">
                <p className="text-muted-foreground">KYC verification coming soon...</p>
              </div>
            </TabsContent>

            {/* Transactions Tab Content */}
            <TabsContent value="transactions" className="mt-6">
              <div className="space-y-6">
                {/* Filters */}
                <div className="flex justify-end items-center gap-3">
                  {/* Date From */}
                  <Popover open={txFromCalendarOpen} onOpenChange={setTxFromCalendarOpen}>
                    <PopoverTrigger asChild>
                      <button className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 hover:border-primary transition-colors">
                        <span className="text-sm text-foreground">{format(txFromDate, "dd/MM/yyyy")}</span>
                        <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[100]" align="start" sideOffset={4}>
                      <Calendar mode="single" selected={txFromDate} onSelect={date => {
                      if (date) setTxFromDate(date);
                      setTxFromCalendarOpen(false);
                    }} disabled={date => date > txToDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                  
                  {/* Date To */}
                  <Popover open={txToCalendarOpen} onOpenChange={setTxToCalendarOpen}>
                    <PopoverTrigger asChild>
                      <button className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 hover:border-primary transition-colors">
                        <span className="text-sm text-foreground">{format(txToDate, "dd/MM/yyyy")}</span>
                        <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[100]" align="start" sideOffset={4}>
                      <Calendar mode="single" selected={txToDate} onSelect={date => {
                      if (date) setTxToDate(date);
                      setTxToCalendarOpen(false);
                    }} disabled={date => date < txFromDate || date > new Date()} initialFocus />
                    </PopoverContent>
                  </Popover>
                  
                  {/* Currency Selector */}
                  <Select defaultValue="usd">
                    <SelectTrigger className="w-[140px] bg-card border-border">
                      <SelectValue placeholder="USD" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD</SelectItem>
                      <SelectItem value="btc">BTC</SelectItem>
                      <SelectItem value="eth">ETH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Table */}
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left px-6 py-4 text-sm font-medium text-foreground">Transaction ID</th>
                        <th className="text-left px-6 py-4 text-sm font-medium text-foreground">Date & time</th>
                        <th className="text-center px-6 py-4 text-sm font-medium text-foreground">Coins</th>
                        <th className="text-center px-6 py-4 text-sm font-medium text-foreground">Status</th>
                        <th className="text-center px-6 py-4 text-sm font-medium text-foreground">Amount</th>
                        <th className="text-center px-6 py-4 text-sm font-medium text-foreground">Method</th>
                        <th className="text-center px-6 py-4 text-sm font-medium text-foreground">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Empty state - no transactions */}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-card border border-border text-muted-foreground hover:bg-[#2a2a2a] transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  {[1, 2, 3].map(page => (
                    <button 
                      key={page} 
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                        page === 1 
                          ? 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white' 
                          : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-foreground/50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <span className="text-muted-foreground px-1">...</span>
                  
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium bg-card border border-border text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-all">
                    8
                  </button>
                  
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-card border border-border text-muted-foreground hover:bg-[#2a2a2a] transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </TabsContent>
          </Tabs>
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
      
      <WalletModal 
        isOpen={walletOpen} 
        onClose={() => setWalletOpen(false)} 
        defaultTab={walletDefaultTab}
      />
      
      
      <MobileBottomNav onMenuClick={toggleSidebar} />
    </div>;
};
export default Profile;