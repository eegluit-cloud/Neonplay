import { type SportIconKey } from '@/components/icons/SportIcons';
import { getTeamLogoUrl } from '@/data/teamLogos';

// ============================================
// SHARED TYPES
// ============================================

export interface Team {
  name: string;
  logoUrl?: string;
  score?: number;
}

export interface HighlightMatch {
  id: string;
  league: string;
  time: string;
  isLive?: boolean;
  liveMinute?: string;
  teams: [Team, Team];
  odds: { home: number; draw: number; away: number };
  bgGradient: string;
  sport: SportIconKey;
}

export interface EventMatch {
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

export interface Sport {
  id: SportIconKey;
  name: string;
}

// ============================================
// MOCK DATA
// ============================================

export const highlightMatches: HighlightMatch[] = [
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
    odds: { home: 3.05, draw: 3.35, away: 2.10 },
    bgGradient: 'from-blue-600 via-purple-600 to-pink-500'
  },
  {
    id: '2',
    league: 'England \u2022 FA Cup',
    time: 'Started',
    isLive: true,
    sport: 'soccer',
    teams: [
      { name: 'Arsenal FC', logoUrl: getTeamLogoUrl('Arsenal FC'), score: 0 },
      { name: 'Chelsea FC', logoUrl: getTeamLogoUrl('Chelsea FC'), score: 0 }
    ],
    odds: { home: 2.25, draw: 3.35, away: 3.25 },
    bgGradient: 'from-red-600 via-blue-600 to-blue-800'
  },
  {
    id: '3',
    league: 'USA \u2022 NBA',
    time: 'Today, 19:00',
    sport: 'basketball',
    teams: [
      { name: 'Memphis Grizzlies', logoUrl: getTeamLogoUrl('Memphis Grizzlies'), score: undefined },
      { name: 'Orlando Magic', logoUrl: getTeamLogoUrl('Orlando Magic'), score: undefined }
    ],
    odds: { home: 2.38, draw: 3.35, away: 1.58 },
    bgGradient: 'from-indigo-700 via-purple-700 to-indigo-900'
  },
  {
    id: '4',
    league: 'USA \u2022 NBA',
    time: 'Today, 21:00',
    sport: 'basketball',
    teams: [
      { name: 'Houston Rockets', logoUrl: getTeamLogoUrl('Houston Rockets'), score: undefined },
      { name: 'LA Lakers', logoUrl: getTeamLogoUrl('LA Lakers'), score: undefined }
    ],
    odds: { home: 1.95, draw: 3.35, away: 1.85 },
    bgGradient: 'from-red-700 via-yellow-600 to-purple-700'
  },
];

export const eventMatches: EventMatch[] = [
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

export const sportChips: Sport[] = [
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
