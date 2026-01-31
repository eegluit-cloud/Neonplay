/**
 * Team Logo Data System
 * 
 * Central source of truth for all team logos in the Sports UI.
 * Uses reliable CDN sources for team crests.
 */

// ============================================
// TYPES
// ============================================

export interface TeamInfo {
  id: string;
  name: string;
  shortName?: string;
  logoUrl: string;
  sport: 'soccer' | 'basketball' | 'tennis' | 'hockey' | 'americanfootball' | 'esports';
  country?: string;
  league?: string;
}

// ============================================
// TEAM LOGO DATABASE
// Using logos.dev API for high-quality logos
// Format: https://img.logoipsum.com/xxx.svg for fallbacks
// Using reliable sports logo CDNs
// ============================================

// Soccer/Football Teams
const soccerTeams: Record<string, TeamInfo> = {
  'fc-barcelona': {
    id: 'fc-barcelona',
    name: 'FC Barcelona',
    shortName: 'Barcelona',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/100px-FC_Barcelona_%28crest%29.svg.png',
    sport: 'soccer',
    country: 'Spain',
    league: 'LaLiga',
  },
  'manchester-city': {
    id: 'manchester-city',
    name: 'Manchester City',
    shortName: 'Man City',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/100px-Manchester_City_FC_badge.svg.png',
    sport: 'soccer',
    country: 'England',
    league: 'Premier League',
  },
  'arsenal-fc': {
    id: 'arsenal-fc',
    name: 'Arsenal FC',
    shortName: 'Arsenal',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/100px-Arsenal_FC.svg.png',
    sport: 'soccer',
    country: 'England',
    league: 'Premier League',
  },
  'chelsea-fc': {
    id: 'chelsea-fc',
    name: 'Chelsea FC',
    shortName: 'Chelsea',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/cc/Chelsea_FC.svg/100px-Chelsea_FC.svg.png',
    sport: 'soccer',
    country: 'England',
    league: 'Premier League',
  },
  'real-sociedad': {
    id: 'real-sociedad',
    name: 'Real Sociedad',
    shortName: 'R. Sociedad',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f1/Real_Sociedad_logo.svg/100px-Real_Sociedad_logo.svg.png',
    sport: 'soccer',
    country: 'Spain',
    league: 'LaLiga',
  },
  'ac-milan': {
    id: 'ac-milan',
    name: 'AC Milan',
    shortName: 'Milan',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Logo_of_AC_Milan.svg/100px-Logo_of_AC_Milan.svg.png',
    sport: 'soccer',
    country: 'Italy',
    league: 'Serie A',
  },
  'us-lecce': {
    id: 'us-lecce',
    name: 'US Lecce',
    shortName: 'Lecce',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/45/US_Lecce.svg/100px-US_Lecce.svg.png',
    sport: 'soccer',
    country: 'Italy',
    league: 'Serie A',
  },
  'atletico-madrid': {
    id: 'atletico-madrid',
    name: 'Atletico Madrid',
    shortName: 'Atletico',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f4/Atletico_Madrid_2017_logo.svg/100px-Atletico_Madrid_2017_logo.svg.png',
    sport: 'soccer',
    country: 'Spain',
    league: 'LaLiga',
  },
  'deportivo-alaves': {
    id: 'deportivo-alaves',
    name: 'Deportivo Alaves',
    shortName: 'Alaves',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f8/Deportivo_Alav%C3%A9s_logo_%282020%29.svg/100px-Deportivo_Alav%C3%A9s_logo_%282020%29.svg.png',
    sport: 'soccer',
    country: 'Spain',
    league: 'LaLiga',
  },
  'paris-saint-germain': {
    id: 'paris-saint-germain',
    name: 'Paris Saint-Germain',
    shortName: 'PSG',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Paris_Saint-Germain_F.C..svg/100px-Paris_Saint-Germain_F.C..svg.png',
    sport: 'soccer',
    country: 'France',
    league: 'Ligue 1',
  },
  'olympique-lyon': {
    id: 'olympique-lyon',
    name: 'Olympique Lyon',
    shortName: 'Lyon',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a3/Olympique_Lyonnais.svg/100px-Olympique_Lyonnais.svg.png',
    sport: 'soccer',
    country: 'France',
    league: 'Ligue 1',
  },
  'juventus-fc': {
    id: 'juventus-fc',
    name: 'Juventus FC',
    shortName: 'Juventus',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Juventus_FC_2017_icon_%28black%29.svg/100px-Juventus_FC_2017_icon_%28black%29.svg.png',
    sport: 'soccer',
    country: 'Italy',
    league: 'Serie A',
  },
  'inter-milan': {
    id: 'inter-milan',
    name: 'Inter Milan',
    shortName: 'Inter',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/FC_Internazionale_Milano_2021.svg/100px-FC_Internazionale_Milano_2021.svg.png',
    sport: 'soccer',
    country: 'Italy',
    league: 'Serie A',
  },
  'liverpool-fc': {
    id: 'liverpool-fc',
    name: 'Liverpool FC',
    shortName: 'Liverpool',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Liverpool_FC.svg/100px-Liverpool_FC.svg.png',
    sport: 'soccer',
    country: 'England',
    league: 'Premier League',
  },
  'manchester-united': {
    id: 'manchester-united',
    name: 'Manchester United',
    shortName: 'Man United',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7a/Manchester_United_FC_crest.svg/100px-Manchester_United_FC_crest.svg.png',
    sport: 'soccer',
    country: 'England',
    league: 'Premier League',
  },
  'real-madrid': {
    id: 'real-madrid',
    name: 'Real Madrid',
    shortName: 'R. Madrid',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/100px-Real_Madrid_CF.svg.png',
    sport: 'soccer',
    country: 'Spain',
    league: 'LaLiga',
  },
  'bayern-munich': {
    id: 'bayern-munich',
    name: 'Bayern Munich',
    shortName: 'Bayern',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg/100px-FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg.png',
    sport: 'soccer',
    country: 'Germany',
    league: 'Bundesliga',
  },
};

// Basketball Teams (NBA)
const basketballTeams: Record<string, TeamInfo> = {
  'memphis-grizzlies': {
    id: 'memphis-grizzlies',
    name: 'Memphis Grizzlies',
    shortName: 'Grizzlies',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f1/Memphis_Grizzlies.svg/100px-Memphis_Grizzlies.svg.png',
    sport: 'basketball',
    country: 'USA',
    league: 'NBA',
  },
  'orlando-magic': {
    id: 'orlando-magic',
    name: 'Orlando Magic',
    shortName: 'Magic',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/10/Orlando_Magic_logo.svg/100px-Orlando_Magic_logo.svg.png',
    sport: 'basketball',
    country: 'USA',
    league: 'NBA',
  },
  'houston-rockets': {
    id: 'houston-rockets',
    name: 'Houston Rockets',
    shortName: 'Rockets',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/28/Houston_Rockets.svg/100px-Houston_Rockets.svg.png',
    sport: 'basketball',
    country: 'USA',
    league: 'NBA',
  },
  'la-lakers': {
    id: 'la-lakers',
    name: 'LA Lakers',
    shortName: 'Lakers',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Los_Angeles_Lakers_logo.svg/100px-Los_Angeles_Lakers_logo.svg.png',
    sport: 'basketball',
    country: 'USA',
    league: 'NBA',
  },
  'golden-state-warriors': {
    id: 'golden-state-warriors',
    name: 'Golden State Warriors',
    shortName: 'Warriors',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/01/Golden_State_Warriors_logo.svg/100px-Golden_State_Warriors_logo.svg.png',
    sport: 'basketball',
    country: 'USA',
    league: 'NBA',
  },
  'boston-celtics': {
    id: 'boston-celtics',
    name: 'Boston Celtics',
    shortName: 'Celtics',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8f/Boston_Celtics.svg/100px-Boston_Celtics.svg.png',
    sport: 'basketball',
    country: 'USA',
    league: 'NBA',
  },
};

// Tennis Players (as pseudo-teams)
const tennisPlayers: Record<string, TeamInfo> = {
  'novak-djokovic': {
    id: 'novak-djokovic',
    name: 'Novak Djokovic',
    shortName: 'Djokovic',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Flag_of_Serbia.svg/100px-Flag_of_Serbia.svg.png',
    sport: 'tennis',
    country: 'Serbia',
    league: 'ATP Tour',
  },
  'carlos-alcaraz': {
    id: 'carlos-alcaraz',
    name: 'Carlos Alcaraz',
    shortName: 'Alcaraz',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9a/Flag_of_Spain.svg/100px-Flag_of_Spain.svg.png',
    sport: 'tennis',
    country: 'Spain',
    league: 'ATP Tour',
  },
};

// ============================================
// COMBINED TEAM DATABASE
// ============================================

export const TEAM_DATABASE: Record<string, TeamInfo> = {
  ...soccerTeams,
  ...basketballTeams,
  ...tennisPlayers,
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Create a URL-friendly slug from team name
 */
export function createTeamSlug(teamName: string): string {
  return teamName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}

/**
 * Get team info by name
 */
export function getTeamByName(teamName: string): TeamInfo | undefined {
  const slug = createTeamSlug(teamName);
  return TEAM_DATABASE[slug];
}

/**
 * Get team logo URL by name with fallback
 */
export function getTeamLogoUrl(teamName: string): string {
  const team = getTeamByName(teamName);
  return team?.logoUrl || generateFallbackLogo(teamName);
}

/**
 * Generate a fallback logo using initials
 */
export function generateFallbackLogo(teamName: string): string {
  // Use UI Avatars API as fallback - generates initials-based images
  const initials = teamName
    .split(' ')
    .map(word => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=2a2a40&color=fff&size=100&bold=true&format=svg`;
}

/**
 * Get team info with fallback data
 */
export function getTeamInfo(teamName: string, sport: TeamInfo['sport'] = 'soccer'): TeamInfo {
  const existingTeam = getTeamByName(teamName);
  
  if (existingTeam) {
    return existingTeam;
  }
  
  // Return fallback team info
  return {
    id: createTeamSlug(teamName),
    name: teamName,
    logoUrl: generateFallbackLogo(teamName),
    sport,
  };
}

export default TEAM_DATABASE;
