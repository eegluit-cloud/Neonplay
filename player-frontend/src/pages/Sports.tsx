import { useState, useMemo, useEffect } from 'react';
import {
  Home, Star, Zap, RotateCcw, Target, Flame, Globe, Swords,
  Trophy, TrendingUp, Percent, Ticket, Search, ClipboardList, BarChart3, Crown, Loader2
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Header } from '@/components/Header';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { Sidebar } from '@/components/Sidebar';
import { BetslipProvider } from '@/contexts/BetslipContext';
import { BetslipBar } from '@/components/sports/BetslipBar';
import { BetslipPanel } from '@/components/sports/BetslipPanel';
import { HighlightCard } from '@/components/sports/HighlightCard';
import { EventCard } from '@/components/sports/EventCard';
import {
  SportIcon,
  type SportIconKey,
} from '@/components/icons/SportIcons';
import { getTeamLogoUrl } from '@/data/teamLogos';
import { highlightMatches, eventMatches, sportChips } from '@/data/sportsData';
import type { Team } from '@/data/sportsData';
import { useSports, useMatches, useLiveMatches } from '@/hooks/useSports';

// ============================================
// SPORTS-PAGE-SPECIFIC DATA
// ============================================

const sportIcons = [
  { id: 'home', icon: Home, active: true },
  { id: 'live', label: 'LIVE', active: false },
  { id: 'favorites', icon: Star, active: false },
  { id: 'flash', icon: Zap, active: false },
  { id: 'refresh', icon: RotateCcw, active: false },
  { id: 'soccer', icon: Target, active: false },
  { id: 'flame', icon: Flame, active: false, badge: true },
  { id: 'globe', icon: Globe, active: false },
  { id: 'esports', icon: Swords, active: false },
  { id: 'trophy', icon: Trophy, active: false },
  { id: 'trending', icon: TrendingUp, active: false },
  { id: 'percent', icon: Percent, active: false },
  { id: 'ticket', icon: Ticket, active: false },
];

// ============================================
// SPORTS-PAGE-SPECIFIC SUB-COMPONENTS
// ============================================

const TopIconNav = () => {
  return (
    <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2 sm:py-3 px-3 sm:px-4 border-b border-white/10">
      {sportIcons.map((item) => (
        <button
          key={item.id}
          className={cn(
            "flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-all relative",
            item.active
              ? "bg-cyan-500 text-white"
              : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
          )}
        >
          {item.label ? (
            <span className="text-[9px] sm:text-[10px] font-bold">{item.label}</span>
          ) : item.icon ? (
            <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : null}
          {item.badge && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-red-500 rounded-full text-[9px] sm:text-[10px] flex items-center justify-center text-white font-bold">
              6
            </span>
          )}
        </button>
      ))}
      <div className="flex-shrink-0 w-px h-5 sm:h-6 bg-white/20 mx-1.5 sm:mx-2" />
      <button className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all">
        <Search className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </div>
  );
};

const SecondaryTabs = ({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) => {
  const tabs = [
    { id: 'highlights', label: 'HIGHLIGHTS', mobileLabel: 'HIGHLIGHTS', Icon: Zap },
    { id: 'eventbuilder', label: 'EVENT BUILDER', mobileLabel: 'BUILDER', Icon: ClipboardList },
    { id: 'betsfeed', label: 'BETS FEED', mobileLabel: 'FEED', Icon: BarChart3 },
  ];

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 overflow-x-auto scrollbar-hide">
      {tabs.map((tab) => {
        const TabIcon = tab.Icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex-shrink-0 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 sm:gap-2",
              activeTab === tab.id
                ? "bg-white/10 text-white border border-white/20"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            )}
          >
            <TabIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-[18px] md:h-[18px]" aria-hidden="true" />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.mobileLabel}</span>
          </button>
        );
      })}
    </div>
  );
};

const HighlightsCarousel = () => {
  return (
    <div className="overflow-x-auto scrollbar-hide px-3 sm:px-4">
      <div className="flex gap-2.5 sm:gap-4 pb-3 sm:pb-4">
        {highlightMatches.map((match) => (
          <HighlightCard key={match.id} match={match} />
        ))}
      </div>
    </div>
  );
};

const SportChipsRow = ({ activeSport, onSportChange }: { activeSport: string; onSportChange: (sport: string) => void }) => {
  return (
    <div className="px-3 sm:px-4 py-3 sm:py-4">
      <div className="flex items-center gap-1.5 sm:gap-2 mb-2.5 sm:mb-4">
        <Crown className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-yellow-500" aria-hidden="true" />
        <h2 className="text-white font-bold text-base sm:text-lg">Popular</h2>
      </div>
      <div className="overflow-x-auto scrollbar-hide -mx-3 sm:mx-0 px-3 sm:px-0">
        <div className="flex gap-1.5 sm:gap-2">
          {sportChips.map((sport) => (
            <button
              key={sport.id}
              onClick={() => onSportChange(sport.id)}
              aria-label={sport.name}
              className={cn(
                "flex-shrink-0 h-8 sm:h-9 px-2.5 sm:px-4 rounded-full flex items-center gap-1.5 sm:gap-2 transition-all text-xs sm:text-sm font-medium",
                activeSport === sport.id
                  ? "bg-cyan-500 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
              )}
            >
              <SportIcon
                sport={sport.id}
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-[18px] md:h-[18px]"
                aria-hidden="true"
              />
              <span>{sport.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

const Sports = () => {
  const [searchParams] = useSearchParams();
  const filterParam = searchParams.get('filter');
  const [activeTab, setActiveTab] = useState('highlights');
  const [activeSport, setActiveSport] = useState(filterParam || 'soccer');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync activeSport when filter query param changes
  useEffect(() => {
    if (filterParam) {
      setActiveSport(filterParam);
    }
  }, [filterParam]);

  // Fetch data from API
  const { sports: apiSports, isLoading: sportsLoading } = useSports();
  const { matches: apiMatches, isLoading: matchesLoading } = useMatches({ limit: 20 });
  const { matches: liveMatches } = useLiveMatches();

  // Convert API matches to EventMatch format or use fallback
  const allEventMatches = useMemo(() => {
    if (apiMatches.length > 0) {
      return apiMatches.map(match => {
        const sportSlug = match.league?.sport?.slug || 'soccer';
        const homeOdds = match.markets?.[0]?.odds.find(o => o.selection === 'home')?.odds || 2.0;
        const drawOdds = match.markets?.[0]?.odds.find(o => o.selection === 'draw')?.odds || 3.5;
        const awayOdds = match.markets?.[0]?.odds.find(o => o.selection === 'away')?.odds || 2.5;

        return {
          id: match.id,
          sport: sportSlug as SportIconKey,
          league: match.league?.name || 'Unknown League',
          country: match.league?.country || '',
          time: match.status === 'live' ? 'LIVE' : new Date(match.startTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          isLive: match.status === 'live',
          teams: [
            { name: match.homeTeam.name, logoUrl: match.homeTeam.logoUrl || getTeamLogoUrl(match.homeTeam.name), score: match.homeScore },
            { name: match.awayTeam.name, logoUrl: match.awayTeam.logoUrl || getTeamLogoUrl(match.awayTeam.name), score: match.awayScore }
          ] as [Team, Team],
          odds: { home: homeOdds, draw: drawOdds, away: awayOdds }
        };
      });
    }
    return eventMatches;
  }, [apiMatches]);

  const filteredEvents = allEventMatches.filter(
    (event) => activeSport === 'soccer' || event.sport === activeSport
  );

  const isLoading = sportsLoading || matchesLoading;

  return (
    <BetslipProvider>
      <div className="min-h-screen bg-background">
        <Header
          onOpenSignIn={() => {}}
          onOpenSignUp={() => {}}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          onOpenSpinGift={() => {}}
        />

        {/* Main content with sidebar offset on desktop */}
        <main className={cn(
          "pt-14 md:pt-16 pb-32 sm:pb-24 transition-all duration-300",
          sidebarOpen ? "md:ml-56" : "md:ml-16"
        )}>
          {/* Top Icon Navigation */}
          <TopIconNav />

          {/* Secondary Tabs */}
          <SecondaryTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Highlights Carousel */}
          {activeTab === 'highlights' && (
            <>
              <HighlightsCarousel />

              {/* Popular Section */}
              <SportChipsRow activeSport={activeSport} onSportChange={setActiveSport} />

              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                </div>
              )}

              {/* Events Grid */}
              {!isLoading && (
                <div className="px-3 sm:px-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
                    {filteredEvents.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'eventbuilder' && (
            <div className="px-4 py-8 text-center text-gray-400">
              <p>Event Builder coming soon...</p>
            </div>
          )}

          {activeTab === 'betsfeed' && (
            <div className="px-4 py-8 text-center text-gray-400">
              <p>Bets Feed coming soon...</p>
            </div>
          )}
        </main>

        {/* Betslip Components */}
        <BetslipBar />
        <BetslipPanel />

        <MobileBottomNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      </div>
    </BetslipProvider>
  );
};

export default Sports;
