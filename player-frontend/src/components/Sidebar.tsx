import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Gift, Star, Users, Gamepad2, Tv, Trophy, TrendingUp,
  MessageCircle, Home, Heart, LogOut, ChevronDown, Globe,
  Package, ChevronLeft, Crown, Percent, Target, Share2, Scale,
  ShieldCheck, Headphones, FileText, LucideIcon, Send, Phone, Volleyball, Wallet
} from 'lucide-react';
import { cn } from '@/lib/utils';
import crownImg from '@/assets/crown.png';
import freeCoinsImg from '@/assets/claim-new.png';
import levelUpImg from '@/assets/level-up.png';
import { NeonPlayLogo } from '@/components/NeonPlayLogo';
import { useLeaderboardData, formatAmount } from '@/hooks/useLeaderboardData';
import { useUserVIP } from '@/hooks/useUserVIP';
import { useAuth } from '@/contexts/AuthContext';
import { prefetchRoute } from '@/hooks/useRoutePrefetch';


// ============================================
// TYPES & INTERFACES
// ============================================

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: string;
  highlight?: boolean;
  children?: NavItem[];
}

interface NavSection {
  id: string;
  title?: string;
  collapsible?: boolean;
  icon?: LucideIcon;
  items: NavItem[];
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onOpenSpinGift: () => void;
  onOpenBonusClaimed?: () => void;
}

// ============================================
// NAVIGATION CONFIG
// ============================================

const navigationConfig: NavSection[] = [
  {
    id: 'lobby-standalone',
    items: [
      { id: 'lobby', label: 'Lobby', icon: Home, href: '/lobby' },
    ],
  },
  {
    id: 'sports',
    title: 'Sports',
    collapsible: true,
    icon: Volleyball,
    items: [
      { id: 'sports-home', label: 'Sports Home', icon: Volleyball, href: '/sports' },
      { id: 'live-sports', label: 'Live', icon: Globe, href: '/sports?filter=live' },
      { id: 'soccer', label: 'Soccer', icon: Target, href: '/sports?filter=soccer' },
      { id: 'basketball', label: 'Basketball', icon: Trophy, href: '/sports?filter=basketball' },
      { id: 'tennis', label: 'Tennis', icon: Target, href: '/sports?filter=tennis' },
      { id: 'esports', label: 'Esports', icon: Gamepad2, href: '/sports?filter=esports' },
    ],
  },
  {
    id: 'casino',
    title: 'Casino',
    collapsible: true,
    icon: Gamepad2,
    items: [
      { id: 'casino-home', label: 'All Games', icon: Gamepad2, href: '/casino' },
      { id: 'favorites', label: 'Favorites', icon: Heart, href: '/favorites' },
      { id: 'hot-games', label: 'Hot Games', icon: TrendingUp, href: '/hot-games' },
      { id: 'slots', label: 'Slots', icon: Gamepad2, href: '/slots' },
      { id: 'crash-games', label: 'Crash Games', icon: Star, href: '/crash-games' },
      { id: 'live-casino', label: 'Live Casino', icon: Tv, href: '/live-casino' },
      { id: 'providers', label: 'Providers', icon: Package, href: '/providers' },
    ],
  },
  {
    id: 'promotions',
    title: 'Promotions',
    collapsible: true,
    icon: Gift,
    items: [
      { id: 'all-promotions', label: 'All Promotions', icon: Gift, href: '/promotions' },
      { id: 'vip-club', label: 'VIP Club', icon: Crown, href: '/vip' },
      { id: 'refer-friend', label: 'Refer a Friend', icon: Share2, href: '/refer-friend' },
      { id: 'prizes-promo', label: 'Prizes', icon: Trophy, href: '/prizes' },
      { id: 'leaderboard', label: 'Leaderboard', icon: TrendingUp, href: '/leaderboard' },
    ],
  },
  {
    id: 'account',
    title: 'Account',
    collapsible: true,
    icon: Users,
    items: [
      { id: 'profile', label: 'Profile', icon: Users, href: '/profile' },
      { id: 'wallet', label: 'Wallet', icon: Wallet, href: '/profile?tab=transactions' },
    ],
  },
  {
    id: 'support',
    title: 'Support & Info',
    collapsible: true,
    icon: Headphones,
    items: [
      { id: 'live-chat', label: 'Live Chat', icon: MessageCircle, href: '/faq' },
      { id: 'telegram', label: 'Telegram', icon: Send, href: 'https://t.me/phibet' },
      { id: 'whatsapp', label: 'WhatsApp', icon: Phone, href: 'https://wa.me/phibet' },
      { id: 'provably-fair', label: 'Provably Fair', icon: Scale, href: '/provably-fair' },
      { id: 'responsible', label: 'Responsible Gambling', icon: ShieldCheck, href: '/responsible-gambling' },
    ],
  },
  {
    id: 'legal',
    title: 'Legal',
    collapsible: true,
    icon: FileText,
    items: [
      { id: 'terms', label: 'Terms & Conditions', icon: FileText, href: '/terms' },
      { id: 'privacy', label: 'Privacy Policy', icon: FileText, href: '/privacy' },
    ],
  },
  {
    id: 'logout-standalone',
    items: [
      { id: 'logout', label: 'Log Out', icon: LogOut, href: '#logout' },
    ],
  },
];

// ============================================
// HOOKS
// ============================================

const useCountdown = (initialSeconds: number) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => (prev > 0 ? prev - 1 : initialSeconds));
    }, 1000);
    return () => clearInterval(interval);
  }, [initialSeconds]);

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return { hours, minutes, secs, formatted: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}` };
};

// ============================================
// WIDGET COMPONENTS
// ============================================

const ClaimableCoinsWidget = ({ onClaim }: { onClaim?: () => void }) => {
  const countdown = useCountdown(86400); // 24 hours = 86400 seconds

  const handleClaim = () => {
    // Save claim time and trigger modal
    localStorage.setItem('bonus_claim_time', Date.now().toString());
    onClaim?.();
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900/80 via-[#3a2a1a]/70 to-[#1a1a1a]/60" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-radial from-amber-500/20 via-yellow-500/10 to-transparent rounded-full blur-xl" />

      {/* Glass overlay left panel */}
      <div className="relative">
        <div className="backdrop-blur-md bg-black/30 border-r border-white/10 p-3">
          {/* Title */}
          <p className="text-amber-400/90 text-[10px] mb-0.5">Daily Bonus</p>
          <p className="text-lg font-bold mb-2">
            <span className="text-green-400">$</span>
            <span className="text-white">100</span>
          </p>

          {/* Timer */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center gap-1">
              <div className="bg-amber-500/20 backdrop-blur-sm border border-amber-500/30 rounded px-1.5 py-0.5">
                <span className="text-white font-bold text-[11px]">{String(countdown.hours).padStart(2, '0')}</span>
                <span className="text-amber-400 text-[8px] ml-0.5">h</span>
              </div>
              <span className="text-amber-400 text-xs">:</span>
              <div className="bg-amber-500/20 backdrop-blur-sm border border-amber-500/30 rounded px-1.5 py-0.5">
                <span className="text-white font-bold text-[11px]">{String(countdown.minutes).padStart(2, '0')}</span>
                <span className="text-amber-400 text-[8px] ml-0.5">m</span>
              </div>
              <span className="text-amber-400 text-xs">:</span>
              <div className="bg-amber-500/20 backdrop-blur-sm border border-amber-500/30 rounded px-1.5 py-0.5">
                <span className="text-white font-bold text-[11px]">{String(countdown.secs).padStart(2, '0')}</span>
                <span className="text-amber-400 text-[8px] ml-0.5">s</span>
              </div>
            </div>
          </div>

          {/* Claim button */}
          <button
            onClick={handleClaim}
            className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-white font-semibold rounded-lg text-xs transition-all shadow-lg shadow-amber-500/20"
          >
            Claim Now
          </button>
        </div>
      </div>
    </div>
  );
};

const DailyWinnersWidget = () => {
  const { winners, playerPosition } = useLeaderboardData();

  const getPositionStyle = (position: number) => {
    const styles: Record<number, string> = {
      1: "text-yellow-400",
      2: "text-gray-400",
      3: "text-orange-400",
      4: "text-amber-400",
      5: "text-amber-400",
    };
    return styles[position] || "text-purple-400";
  };

  return (
    <div className="sidebar-widget">
      <div className="flex items-center gap-3 mb-3">
        <img src={levelUpImg} alt="Level Up" className="w-14 h-14" />
        <div>
          <h3 className="font-bold text-base text-foreground">Daily Winners</h3>
          <p className="text-xs text-muted-foreground">View Leaderboard</p>
        </div>
      </div>

      <div className="bg-card/80 rounded-xl p-3 mb-3 sidebar-card">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-muted-foreground">{playerPosition}</span>
          <div>
            <p className="font-semibold text-sm text-foreground">Maryjones</p>
            <p className="text-xs text-muted-foreground">Player Position</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {winners.slice(0, 5).map((winner, i) => (
          <div key={`${winner.name}-${i}`} className="flex items-center gap-3">
            <span className={cn(
              "w-8 h-10 rounded-lg bg-card/80 border border-border/50 flex items-center justify-center text-sm font-bold sidebar-position-badge",
              getPositionStyle(i + 1)
            )}>
              {i + 1}
            </span>
            <div className="flex-1">
              <p className="font-medium text-sm text-foreground">{winner.name}</p>
              <span className="text-xs"><span className="text-green-400">$</span><span className="text-gray-300">{formatAmount(winner.amount)}</span></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const VIPStatusWidget = ({ onNavigate }: { onNavigate: (path: string) => void }) => {
  const vip = useUserVIP();

  return (
    <div className="p-3 bg-sidebar-accent rounded-xl shadow-[0_0_20px_rgba(251,191,36,0.15)]">
      {/* Top Row: VIP Badge + VIP Level + Badge + VIP Club Button */}
      <div className="flex items-center gap-2 mb-3">
        <img src={vip.tierBadge} alt={vip.tierName} className="w-10 h-10 flex-shrink-0 object-contain" />
        <div className="flex flex-col">
          <span className="font-bold text-foreground text-lg leading-tight">{vip.tierLabel}</span>
          <span className={`px-2 py-0.5 ${vip.tierBadgeClass} text-[10px] font-semibold rounded uppercase w-fit`}>
            {vip.tierName}
          </span>
        </div>
        <button
          onClick={() => onNavigate('/vip')}
          className="ml-auto text-amber-400 text-sm font-medium hover:text-amber-300 transition-colors flex items-center gap-1 flex-shrink-0"
        >
          VIP Club
          <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-background rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full relative"
          style={{ width: `${vip.progressPercent}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-amber-400 rounded-full border-2 border-sidebar-accent" />
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2 text-right">
        {vip.xpToNext} XP to <span className="text-foreground font-medium">{vip.nextLevelLabel}</span>
      </p>
    </div>
  );
};

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return !document.documentElement.classList.contains('light');
    }
    return true;
  });

  const toggleTheme = (dark: boolean) => {
    setIsDark(dark);
    document.documentElement.classList.toggle('light', !dark);
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    toggleTheme(savedTheme !== 'light');
  }, []); // intentionally empty - sync theme once on mount

  return (
    <div className="flex items-center bg-background rounded-full p-1">
      {['dark', 'light'].map((mode) => (
        <button
          key={mode}
          onClick={() => toggleTheme(mode === 'dark')}
          className={cn(
            "flex-1 px-4 py-2 text-xs font-semibold rounded-full transition-all duration-200 capitalize",
            (mode === 'dark' ? isDark : !isDark)
              ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-white"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {mode}
        </button>
      ))}
    </div>
  );
};

const SettingsWidget = () => (
  <div className="p-3 bg-sidebar-accent rounded-xl space-y-3">
    <div className="flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity">
      <div className="flex items-center gap-2">
        <Globe className="w-5 h-5 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">English</span>
      </div>
      <ChevronDown className="w-4 h-4 text-muted-foreground rotate-[-90deg]" />
    </div>
    <ThemeToggle />
  </div>
);

// ============================================
// NAVIGATION COMPONENTS
// ============================================

interface NavItemButtonProps {
  item: NavItem;
  isActive: boolean;
  isOpen: boolean;
  onClick: () => void;
}

const NavItemButton = ({ item, isActive, isOpen, onClick }: NavItemButtonProps) => {
  const Icon = item.icon;

  if (!isOpen) {
    return (
      <button
        onClick={onClick}
        aria-label={item.label}
        className={cn(
          "w-full flex items-center justify-center p-2 sm:p-3 rounded-xl transition-colors tap-feedback",
          isActive
            ? "bg-amber-500/20 text-amber-400"
            : "hover:bg-sidebar-accent active:bg-sidebar-accent text-muted-foreground hover:text-foreground"
        )}
      >
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => prefetchRoute(item.href)}
      onFocus={() => prefetchRoute(item.href)}
      className={cn(
        "w-full flex items-center gap-3 px-3 h-11 rounded-xl transition-colors tap-feedback",
        isActive ? "bg-amber-500/10 text-amber-400" : "hover:bg-sidebar-accent active:bg-sidebar-accent/80 text-foreground"
      )}
    >
      <Icon className={cn(
        "w-5 h-5 flex-shrink-0",
        item.highlight || isActive ? "text-amber-400" : "text-muted-foreground"
      )} />
      <span className="flex-1 text-left text-sm font-medium">
        {item.highlight ? (
          <>
            <span className="text-amber-400">{item.label.split(' ')[0]}</span>
            {item.label.includes(' ') && ` ${item.label.split(' ').slice(1).join(' ')}`}
          </>
        ) : item.label}
      </span>
      {item.badge && (
        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-semibold rounded-full">
          {item.badge}
        </span>
      )}
    </button>
  );
};


interface CollapsibleSectionProps {
  section: NavSection;
  isOpen: boolean;
  isActive: (href: string) => boolean;
  onNavigate: (href: string) => void;
}

const CollapsibleSection = ({ section, isOpen, isActive, onNavigate }: CollapsibleSectionProps) => {
  const location = useLocation();
  const Icon = section.icon!;

  // If section should act as a direct link
  const hasItems = section.items.length > 0;
  const directLink =
    section.id === 'casino'
      ? '/casino'
      : section.id === 'sports'
        ? '/sports'
        : null;

  // Check if any item in this section is currently active
  const hasActiveChild = section.items.some(item => isActive(item.href));

  // Check if the section itself is active (for sections with directLink)
  const isSectionActive = directLink ? location.pathname === directLink || location.pathname.startsWith(directLink + '/') : false;

  // Track manual toggle state: null = no manual override, true/false = user explicitly set
  const [manualExpanded, setManualExpanded] = useState<boolean | null>(null);
  // Manual override takes priority; otherwise auto-expand if a child is active
  const expanded = manualExpanded !== null ? manualExpanded : hasActiveChild;

  const handleClick = () => {
    // In collapsed mode, navigate to directLink if available, otherwise just expand sidebar
    if (directLink) {
      onNavigate(directLink);
      return;
    }
    setManualExpanded(prev => prev === null ? true : !prev);
  };

  // Collapsed view - show only icon
  if (!isOpen) {
    return (
      <div className="mb-0.5">
        <button
          onClick={handleClick}
          aria-label={section.title}
          className="w-full flex items-center justify-center p-2.5 bg-sidebar-accent hover:bg-sidebar-accent/80 rounded-xl transition-colors"
        >
          <Icon className="w-5 h-5 text-amber-400" />
        </button>
      </div>
    );
  }

  const toggleExpanded = () => setManualExpanded(prev => prev === null ? !hasActiveChild : !prev);

  return (
    <div className="mb-0.5">
      {/* Section header - clicking anywhere toggles the dropdown */}
      <button
        onClick={toggleExpanded}
        aria-expanded={expanded}
        className="w-full flex items-center bg-sidebar-accent rounded-xl transition-colors hover:bg-sidebar-accent/80"
      >
        <div className="flex-1 flex items-center gap-3 px-3 h-10">
          <Icon className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <span className="flex-1 text-left text-sm font-medium text-foreground">{section.title}</span>
        </div>
        {hasItems && (
          <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
            <div className="w-6 h-6 rounded-full bg-background flex items-center justify-center">
              <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform duration-200", expanded && "rotate-180")} />
            </div>
          </div>
        )}
      </button>

      {/* Dropdown items with smooth expand */}
      {hasItems && expanded && (
        <div className="mt-0.5 ml-2 space-y-0.5 animate-fade-in">
          {section.items.map(item => (
            <NavItemButton
              key={item.id}
              item={item}
              isActive={isActive(item.href)}
              isOpen={isOpen}
              onClick={() => onNavigate(item.href)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface StaticSectionProps {
  section: NavSection;
  isOpen: boolean;
  isActive: (href: string) => boolean;
  onNavigate: (href: string) => void;
}

const StaticSection = ({ section, isOpen, isActive, onNavigate }: StaticSectionProps) => {
  // Collapsed view - show only icons
  if (!isOpen) {
    return (
      <div className="mb-0.5 space-y-0.5">
        {section.items.map(item => (
          <NavItemButton
            key={item.id}
            item={item}
            isActive={isActive(item.href)}
            isOpen={isOpen}
            onClick={() => onNavigate(item.href)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="mb-0.5 bg-sidebar-accent rounded-xl overflow-hidden">
      {section.items.map(item => (
        <NavItemButton
          key={item.id}
          item={item}
          isActive={isActive(item.href)}
          isOpen={isOpen}
          onClick={() => onNavigate(item.href)}
        />
      ))}
    </div>
  );
};

// ============================================
// MAIN SIDEBAR COMPONENT
// ============================================

export function Sidebar({ isOpen, onToggle, onOpenSpinGift, onOpenBonusClaimed }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    if (href === '#') return false;
    if (href.startsWith('http')) return false;
    // Strip query params for pathname comparison
    const cleanHref = href.split('?')[0];
    return location.pathname.startsWith(cleanHref);
  };

  const handleNavigate = (href: string) => {
    // Handle logout - clear session then navigate to home page
    if (href === '#logout') {
      logout().then(() => {
        navigate('/', { replace: true });
      });
      return;
    }

    if (href === '#') return;

    // Handle external links
    if (href.startsWith('http')) {
      window.open(href, '_blank', 'noopener,noreferrer');
      return;
    }

    // Close sidebar on mobile only (not tablet/desktop)
    if (window.innerWidth < 768) {
      onToggle();
    }

    // Special case for home route - must be exact match
    const cleanHref = href.split('?')[0];
    const isAlreadyOnRoute = href === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(cleanHref) && !href.includes('?');

    if (isAlreadyOnRoute) {
      // Already on route - just scroll to top
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }

    // Handle hash links - navigate to home and scroll to section
    if (href.startsWith('#')) {
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'auto' });
          const element = document.querySelector(href);
          element?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const element = document.querySelector(href);
        element?.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    // Navigate to new route and scroll to top
    navigate(href);
    // Use setTimeout to ensure navigation completes before scrolling
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }, 0);
  };

  const collapsibleSections = useMemo(() =>
    navigationConfig.filter(s => s.collapsible), []);

  const staticSections = useMemo(() =>
    navigationConfig.filter(s => !s.collapsible), []);

  return (
    <>
      {/* Mobile Overlay - only on mobile, not tablet */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 md:hidden animate-fade-in"
          onClick={onToggle}
          aria-hidden="true"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Escape' && onToggle()}
        />
      )}

      {/* Sidebar - responsive for mobile, tablet, and desktop */}
      <aside
        className={cn(
          "fixed left-0 bg-sidebar z-40",
          "top-0 h-full",
          // Mobile: 2/3 width instead of full
          "w-2/3 max-w-[280px]",
          // Desktop & Tablet: below header, sidebar height
          "md:top-16 md:h-[calc(100%-4rem)] md:transition-all md:duration-300",
          // Width control: 2/3 on mobile when open, 56px/224px on tablet/desktop
          isOpen ? "md:w-56 drawer-enter" : "md:w-16",
          // Transform for slide animation
          "md:translate-x-0",
          !isOpen && "-translate-x-full md:translate-x-0"
        )}
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full overflow-hidden">

          {/* Mobile Header - hidden on tablet and desktop */}
          {isOpen && (
            <div className="md:hidden flex items-center justify-between px-4 py-4 border-b border-border/50 safe-top">
              <NeonPlayLogo size="sm" />
              <button
                onClick={onToggle}
                aria-label="Close sidebar"
                className="w-10 h-10 flex items-center justify-center bg-[#2a2a2a] hover:bg-[#3a3a3a] active:bg-[#1a1a1a] rounded-xl transition-colors tap-feedback"
              >
                <ChevronLeft className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          )}

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto scrollbar-themed-autohide scroll-smooth-mobile px-3 py-3 md:py-4 lg:py-6 space-y-1.5">

            {/* VIP Status */}
            {isOpen && <VIPStatusWidget onNavigate={handleNavigate} />}

            {/* Lobby Button - Always Visible */}
            {staticSections.filter(s => s.id === 'lobby-standalone').map(section => (
              <StaticSection
                key={section.id}
                section={section}
                isOpen={isOpen}
                isActive={isActive}
                onNavigate={handleNavigate}
              />
            ))}

            {/* All Collapsible Sections */}
            <nav className="space-y-1.5" aria-label="Main navigation">
              {collapsibleSections.map(section => (
                <CollapsibleSection
                  key={section.id}
                  section={section}
                  isOpen={isOpen}
                  isActive={isActive}
                  onNavigate={handleNavigate}
                />
              ))}
            </nav>

            {/* Log Out Button - Always Visible */}
            {staticSections.filter(s => s.id === 'logout-standalone').map(section => (
              <StaticSection
                key={section.id}
                section={section}
                isOpen={isOpen}
                isActive={isActive}
                onNavigate={handleNavigate}
              />
            ))}

            {/* Widgets */}
            {isOpen && (
              <div className="space-y-4 pt-2">
                <ClaimableCoinsWidget onClaim={onOpenBonusClaimed} />
                <DailyWinnersWidget />
                <SettingsWidget />
              </div>
            )}

            {/* Footer */}
            {isOpen && (
              <div className="flex flex-col items-center text-center py-4">
                <NeonPlayLogo size="lg" />
                <p className="text-xs text-muted-foreground">Your Game. Your Bet.</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
