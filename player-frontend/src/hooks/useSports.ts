import { useState, useEffect, useCallback } from 'react';
import { sportsApi } from '../lib/api';

export interface Sport {
  id: string;
  name: string;
  slug: string;
  iconKey: string;
  isActive: boolean;
  sortOrder: number;
}

export interface League {
  id: string;
  name: string;
  slug: string;
  sportId: string;
  sport?: Sport;
  country?: string;
  countryFlag?: string;
  logoUrl?: string;
  isActive: boolean;
}

export interface Team {
  id: string;
  name: string;
  slug: string;
  leagueId: string;
  logoUrl?: string;
  abbreviation?: string;
}

export interface Odd {
  id: string;
  selection: string;
  odds: number;
  isActive: boolean;
}

export interface Market {
  id: string;
  name: string;
  type: string;
  status: string;
  odds: Odd[];
}

export interface Match {
  id: string;
  leagueId: string;
  league?: League;
  homeTeam: Team;
  awayTeam: Team;
  startTime: string;
  status: 'scheduled' | 'live' | 'finished' | 'cancelled' | 'postponed';
  homeScore?: number;
  awayScore?: number;
  markets?: Market[];
}

export interface Bet {
  id: string;
  matchId: string;
  match: Match;
  oddId: string;
  selection: string;
  odds: number;
  amount: number;
  coinType: 'gc' | 'sc';
  status: 'pending' | 'won' | 'lost' | 'void' | 'cashed_out';
  potentialWin: number;
  createdAt: string;
}

export const useSports = () => {
  const [sports, setSports] = useState<Sport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSports = async () => {
      setIsLoading(true);
      try {
        const response = await sportsApi.getSports();
        setSports(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch sports');
        setSports([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSports();
  }, []);

  return { sports, isLoading, error };
};

export const useLeagues = (sportId?: string) => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeagues = async () => {
      setIsLoading(true);
      try {
        const response = await sportsApi.getLeagues(sportId);
        setLeagues(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch leagues');
        setLeagues([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeagues();
  }, [sportId]);

  return { leagues, isLoading, error };
};

export const useMatches = (params?: { leagueId?: string; status?: string; limit?: number }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await sportsApi.getMatches(params);
      setMatches(response.data.items || response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch matches');
      setMatches([]);
    } finally {
      setIsLoading(false);
    }
  }, [params?.leagueId, params?.status, params?.limit]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  return { matches, isLoading, error, refetch: fetchMatches };
};

export const useLiveMatches = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await sportsApi.getLiveMatches();
      setMatches(response.data.items || response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch live matches');
      setMatches([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
    // Refresh every 30 seconds for live matches
    const interval = setInterval(fetchMatches, 30000);
    return () => clearInterval(interval);
  }, [fetchMatches]);

  return { matches, isLoading, error, refetch: fetchMatches };
};

export const useUpcomingMatches = (limit = 10) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      setIsLoading(true);
      try {
        const response = await sportsApi.getUpcomingMatches(limit);
        setMatches(response.data.items || response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch upcoming matches');
        setMatches([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, [limit]);

  return { matches, isLoading, error };
};

export const useMyBets = () => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBets = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await sportsApi.getMyBets();
      setBets(response.data.items || response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch bets');
      setBets([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBets();
  }, [fetchBets]);

  const placeBet = async (matchId: string, oddId: string, amount: number, coinType: 'gc' | 'sc') => {
    try {
      const response = await sportsApi.placeBet({ matchId, oddId, amount, coinType });
      await fetchBets();
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to place bet');
    }
  };

  return { bets, isLoading, error, placeBet, refetch: fetchBets };
};
