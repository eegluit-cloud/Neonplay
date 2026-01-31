import { useState, useMemo } from 'react';
import {
  Home, Star, Zap, RotateCcw, Target, Flame, Globe, Swords,
  Trophy, TrendingUp, Percent, Ticket, Search, Menu, Headphones,
  ChevronDown, Wifi, ClipboardList, BarChart3, Crown, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Header } from '@/components/Header';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { Sidebar } from '@/components/Sidebar';
import { BetslipProvider } from '@/contexts/BetslipContext';
import { BetslipBar } from '@/components/sports/BetslipBar';
import { BetslipPanel } from '@/components/sports/BetslipPanel';
import { OddsButton } from '@/components/sports/OddsButton';
import { TeamLogo } from '@/components/sports/TeamLogo';
import {
  SPORT_ICONS,
  SportIcon,
  type SportIconKey,
  SoccerIcon
} from '@/components/icons/SportIcons';
import { getTeamLogoUrl } from '@/data/teamLogos';
import { useSports, useMatches, useLiveMatches } from '@/hooks/useSports';

// ============================================
// DATA MODELS
// ============================================

interface Sport {
  id: SportIconKey;
  name: string;
}

interface Team {
  name: string;
  logoUrl?: string;
  score?: number;
}

interface HighlightMatch {
  id: string;
  league: string;
  time: string;
  isLive?: boolean;
  liveMinute?: string;
  teams: [Team, Team];
  odds: { home: number; away: number };
  bgGradient: string;
  sport: SportIconKey;
}

interface EventMatch {
  id: string;
  sport: SportIconKey;
  league: string;
  country: string;
  time: string;
  isLive?: boolean;
  liveMinute?: string;
  liveHalf?: string;
  teams: [Team, Team];
  odds: { home: number; draw: number; away: number };
}

// ============================================
// MOCK DATA
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

// Sport chips with icon keys (no emojis)
const sportChips: Sport[] = [
  { id: 'soccer', name: 'Soccer' },
  { id: 'csgo', name: 'Counter-Strike' },
  { id: 'basketball', name: 'Basketball' },
  { id: 'tennis', name: 'Tennis' },
  { id: 'dota', name: 'Dota 2' },
  { id: 'hockey', name: 'Ice Hockey' },
  { id: 'tabletennis', name: 'Table Tennis' },
  { id: 'americanfootball', name: 'American Football' },
  { id: 'handball', name: 'Handball' },
  { id: 'darts', name: 'Darts' },
];

const highlightMatches: HighlightMatch[] = [
  {
    id: '1',
    league: 'International Champions League',
    time: "8' 1st half",
    isLive: true,
    sport: 'soccer',
    teams: [
      { name: 'FC Barcelona', logoUrl: getTeamLogoUrl('FC Barcelona'), score: 0 },
      { name: 'Manchester City', logoUrl: getTeamLogoUrl('Manchester City'), score: 0 }
    ],
    odds: { home: 3.05, away: 2.1 },
    bgGradient: 'from-blue-600 via-purple-600 to-pink-500'
  },
  {
    id: '2',
    league: 'England • FA Cup',
    time: 'Started',
    isLive: true,
    sport: 'soccer',
    teams: [
      { name: 'Arsenal FC', logoUrl: getTeamLogoUrl('Arsenal FC'), score: 0 },
      { name: 'Chelsea FC', logoUrl: getTeamLogoUrl('Chelsea FC'), score: 0 }
    ],
    odds: { home: 2.25, away: 3.25 },
    bgGradient: 'from-red-600 via-blue-600 to-blue-800'
  },
  {
    id: '3',
    league: 'USA • NBA',
    time: 'Today, 19:00',
    sport: 'basketball',
    teams: [
      { name: 'Memphis Grizzlies', logoUrl: getTeamLogoUrl('Memphis Grizzlies'), score: undefined },
      { name: 'Orlando Magic', logoUrl: getTeamLogoUrl('Orlando Magic'), score: undefined }
    ],
    odds: { home: 2.38, away: 1.58 },
    bgGradient: 'from-indigo-700 via-purple-700 to-indigo-900'
  },
  {
    id: '4',
    league: 'USA • NBA',
    time: 'Today, 21:00',
    sport: 'basketball',
    teams: [
      { name: 'Houston Rockets', logoUrl: getTeamLogoUrl('Houston Rockets'), score: undefined },
      { name: 'LA Lakers', logoUrl: getTeamLogoUrl('LA Lakers'), score: undefined }
    ],
    odds: { home: 1.95, away: 1.85 },
    bgGradient: 'from-red-700 via-yellow-600 to-purple-700'
  },
];

const eventMatches: EventMatch[] = [
  {
    id: 'e1',
    sport: 'soccer',
    league: 'LaLiga',
    country: 'Spain',
    time: 'Today, 22:00',
    teams: [
      { name: 'Real Sociedad', logoUrl: getTeamLogoUrl('Real Sociedad') },
      { name: 'FC Barcelona', logoUrl: getTeamLogoUrl('FC Barcelona') }
    ],
    odds: { home: 4.7, draw: 4.4, away: 1.61 }
  },
  {
    id: 'e2',
    sport: 'soccer',
    league: 'Serie A',
    country: 'Italy',
    time: 'Today, 21:45',
    teams: [
      { name: 'AC Milan', logoUrl: getTeamLogoUrl('AC Milan') },
      { name: 'US Lecce', logoUrl: getTeamLogoUrl('US Lecce') }
    ],
    odds: { home: 1.28, draw: 5.2, away: 11.0 }
  },
  {
    id: 'e3',
    sport: 'soccer',
    league: 'LaLiga',
    country: 'Spain',
    time: "49' 2nd half",
    isLive: true,
    liveMinute: '49',
    liveHalf: '2nd half',
    teams: [
      { name: 'Atletico Madrid', logoUrl: getTeamLogoUrl('Atletico Madrid'), score: 1 },
      { name: 'Deportivo Alaves', logoUrl: getTeamLogoUrl('Deportivo Alaves'), score: 0 }
    ],
    odds: { home: 1.07, draw: 8.25, away: 50.0 }
  },
  {
    id: 'e4',
    sport: 'soccer',
    league: 'Ligue 1',
    country: 'France',
    time: 'Today, 21:45',
    teams: [
      { name: 'Paris Saint-Germain', logoUrl: getTeamLogoUrl('Paris Saint-Germain') },
      { name: 'Olympique Lyon', logoUrl: getTeamLogoUrl('Olympique Lyon') }
    ],
    odds: { home: 1.45, draw: 4.8, away: 6.5 }
  },
  {
    id: 'e5',
    sport: 'soccer',
    league: 'Serie A',
    country: 'Italy',
    time: 'Today, 19:00',
    teams: [
      { name: 'Juventus FC', logoUrl: getTeamLogoUrl('Juventus FC') },
      { name: 'Inter Milan', logoUrl: getTeamLogoUrl('Inter Milan') }
    ],
    odds: { home: 2.8, draw: 3.2, away: 2.5 }
  },
  {
    id: 'e6',
    sport: 'soccer',
    league: 'Premier League',
    country: 'England',
    time: 'Tomorrow, 15:00',
    teams: [
      { name: 'Liverpool FC', logoUrl: getTeamLogoUrl('Liverpool FC') },
      { name: 'Manchester United', logoUrl: getTeamLogoUrl('Manchester United') }
    ],
    odds: { home: 1.65, draw: 4.0, away: 5.0 }
  },
  {
    id: 'e7',
    sport: 'basketball',
    league: 'NBA',
    country: 'USA',
    time: 'Today, 02:00',
    teams: [
      { name: 'Golden State Warriors', logoUrl: getTeamLogoUrl('Golden State Warriors') },
      { name: 'Boston Celtics', logoUrl: getTeamLogoUrl('Boston Celtics') }
    ],
    odds: { home: 2.1, draw: 0, away: 1.75 }
  },
  {
    id: 'e8',
    sport: 'tennis',
    league: 'ATP Tour',
    country: 'Australia',
    time: 'Tomorrow, 08:00',
    teams: [
      { name: 'Novak Djokovic', logoUrl: getTeamLogoUrl('Novak Djokovic') },
      { name: 'Carlos Alcaraz', logoUrl: getTeamLogoUrl('Carlos Alcaraz') }
    ],
    odds: { home: 1.85, draw: 0, away: 1.95 }
  },
];

// ============================================
// SUB-COMPONENTS
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

const HighlightCard = ({ match }: { match: HighlightMatch }) => {
  return (
    <div className={cn(
      "flex-shrink-0 w-[280px] sm:w-[320px] md:w-[360px] rounded-xl sm:rounded-2xl overflow-hidden relative",
      "bg-gradient-to-br",
      match.bgGradient
    )}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-20 sm:w-24 h-20 sm:h-24 bg-black/20 rounded-full blur-2xl" />
      </div>
      
      <div className="relative p-3 sm:p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
            <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/70 flex-shrink-0" />
            <span className="text-[10px] sm:text-xs text-white/80 truncate">{match.league}</span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
            <span className="text-[10px] sm:text-xs text-white/80">{match.time}</span>
            {match.isLive && (
              <span className="flex items-center gap-1 text-red-400">
                <Wifi className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              </span>
            )}
          </div>
        </div>

        {/* Teams */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <TeamLogo 
              teamName={match.teams[0].name} 
              logoUrl={match.teams[0].logoUrl}
              size="md" 
              className="bg-white/20 flex-shrink-0"
            />
            <span className="text-white font-medium text-xs sm:text-sm truncate">{match.teams[0].name}</span>
          </div>
          
          {match.teams[0].score !== undefined && (
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 mx-2">
              <span className="w-6 h-6 sm:w-8 sm:h-8 bg-black/30 rounded-md sm:rounded-lg flex items-center justify-center text-white font-bold text-sm sm:text-base">
                {match.teams[0].score}
              </span>
              <span className="w-6 h-6 sm:w-8 sm:h-8 bg-black/30 rounded-md sm:rounded-lg flex items-center justify-center text-white font-bold text-sm sm:text-base">
                {match.teams[1].score}
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 justify-end">
            <span className="text-white font-medium text-xs sm:text-sm text-right truncate">{match.teams[1].name}</span>
            <TeamLogo 
              teamName={match.teams[1].name} 
              logoUrl={match.teams[1].logoUrl}
              size="md" 
              className="bg-white/20 flex-shrink-0"
            />
          </div>
        </div>

        {/* Odds */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button className="flex-1 bg-black/30 hover:bg-black/40 transition-all rounded-md sm:rounded-lg py-1.5 sm:py-2 px-2 sm:px-3 flex items-center justify-between min-w-0">
            <span className="text-white/70 text-xs sm:text-sm">1</span>
            <span className="text-white font-bold text-xs sm:text-sm">{match.odds.home.toFixed(2)}</span>
          </button>
          <button className="flex-1 bg-black/30 hover:bg-black/40 transition-all rounded-md sm:rounded-lg py-1.5 sm:py-2 px-2 sm:px-3 flex items-center justify-between min-w-0">
            <span className="text-white/70 text-xs sm:text-sm">X</span>
            <span className="text-white font-bold text-xs sm:text-sm">3.35</span>
          </button>
          <button className="flex-1 bg-black/30 hover:bg-black/40 transition-all rounded-md sm:rounded-lg py-1.5 sm:py-2 px-2 sm:px-3 flex items-center justify-between min-w-0">
            <span className="text-white/70 text-xs sm:text-sm">2</span>
            <span className="text-white font-bold text-xs sm:text-sm">{match.odds.away.toFixed(2)}</span>
          </button>
        </div>
      </div>
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

const EventCard = ({ event }: { event: EventMatch }) => {
  const matchName = `${event.teams[0].name} vs ${event.teams[1].name}`;
  const league = `${event.country} • ${event.league}`;

  return (
    <div className="bg-[#1a1a2e]/80 border border-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4">
      {/* Header */}
      <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
        <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
        <span className="text-gray-400 text-xs sm:text-sm truncate">{league}</span>
      </div>
      
      {/* Time/Status */}
      <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
        {event.isLive ? (
          <span className="text-cyan-400 text-xs sm:text-sm font-medium flex items-center gap-1">
            {event.liveMinute}' {event.liveHalf}
            <Wifi className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-400 ml-0.5 sm:ml-1" aria-hidden="true" />
          </span>
        ) : (
          <span className="text-gray-400 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
            {event.time}
            <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-500" aria-hidden="true" />
            <BarChart3 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-500" aria-hidden="true" />
          </span>
        )}
      </div>

      {/* Teams */}
      <div className="space-y-1.5 sm:space-y-2 mb-2.5 sm:mb-4">
        {event.teams.map((team, idx) => (
          <div key={idx} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <TeamLogo 
                teamName={team.name} 
                logoUrl={team.logoUrl}
                size="sm" 
                className="flex-shrink-0"
              />
              <span className="text-white text-xs sm:text-sm truncate">{team.name}</span>
            </div>
            {team.score !== undefined && (
              <span className="w-5 h-5 sm:w-6 sm:h-6 bg-white/10 rounded flex items-center justify-center text-white text-xs sm:text-sm font-medium flex-shrink-0">
                {team.score}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* 1x2 Label */}
      <div className="text-gray-500 text-[10px] sm:text-xs mb-1.5 sm:mb-2">1x2</div>

      {/* Odds */}
      <div className="flex items-center gap-1">
        <OddsButton
          eventId={event.id}
          matchName={matchName}
          league={league}
          market="1"
          odds={event.odds.home}
          homeTeam={{ name: event.teams[0].name, logoUrl: event.teams[0].logoUrl }}
          awayTeam={{ name: event.teams[1].name, logoUrl: event.teams[1].logoUrl }}
        />
        {event.odds.draw > 0 && (
          <OddsButton
            eventId={event.id}
            matchName={matchName}
            league={league}
            market="draw"
            odds={event.odds.draw}
            homeTeam={{ name: event.teams[0].name, logoUrl: event.teams[0].logoUrl }}
            awayTeam={{ name: event.teams[1].name, logoUrl: event.teams[1].logoUrl }}
          />
        )}
        <OddsButton
          eventId={event.id}
          matchName={matchName}
          league={league}
          market="2"
          odds={event.odds.away}
          homeTeam={{ name: event.teams[0].name, logoUrl: event.teams[0].logoUrl }}
          awayTeam={{ name: event.teams[1].name, logoUrl: event.teams[1].logoUrl }}
        />
        <button className="w-7 h-7 sm:w-8 sm:h-8 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md sm:rounded-lg flex items-center justify-center transition-all flex-shrink-0">
          <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
        </button>
      </div>
    </div>
  );
};


// ============================================
// MAIN COMPONENT
// ============================================

const Sports = () => {
  const [activeTab, setActiveTab] = useState('highlights');
  const [activeSport, setActiveSport] = useState('soccer');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
          // Desktop: offset for collapsed/expanded sidebar
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
