import { useState, useEffect, useCallback } from 'react';
import { activityApi } from '../lib/api';

export interface RecentWin {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  gameId: string;
  gameName: string;
  gameThumbnail?: string;
  amount: number;
  coinType: 'gc' | 'sc';
  multiplier?: number;
  wonAt: string;
}

export interface PublicWin {
  id: string;
  username: string;
  avatar?: string;
  gameName: string;
  gameThumbnail?: string;
  amount: number;
  coinType: 'gc' | 'sc';
  multiplier?: number;
  isSynthetic: boolean;
  createdAt: string;
}

export interface LiveBet {
  id: string;
  username: string;
  avatar?: string;
  gameName: string;
  betAmount: number;
  coinType: 'gc' | 'sc';
  createdAt: string;
}

export const useRecentWins = (limit = 20) => {
  const [wins, setWins] = useState<RecentWin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWins = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await activityApi.getRecentWins(limit);
      setWins(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch recent wins');
      setWins([]);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchWins();
    // Refresh every 30 seconds
    const interval = setInterval(fetchWins, 30000);
    return () => clearInterval(interval);
  }, [fetchWins]);

  return { wins, isLoading, error, refetch: fetchWins };
};

export const usePublicWins = (limit = 50) => {
  const [wins, setWins] = useState<PublicWin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWins = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await activityApi.getPublicWins(limit);
      setWins(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch public wins');
      setWins([]);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchWins();
    // Refresh every minute
    const interval = setInterval(fetchWins, 60000);
    return () => clearInterval(interval);
  }, [fetchWins]);

  return { wins, isLoading, error, refetch: fetchWins };
};

export const useLiveBets = (limit = 20) => {
  const [bets, setBets] = useState<LiveBet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBets = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await activityApi.getLiveBets(limit);
      setBets(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch live bets');
      setBets([]);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchBets();
    // Refresh every 10 seconds for live data
    const interval = setInterval(fetchBets, 10000);
    return () => clearInterval(interval);
  }, [fetchBets]);

  return { bets, isLoading, error, refetch: fetchBets };
};

// Combined hook for activity feed
export const useActivityFeed = () => {
  const { wins: recentWins, isLoading: winsLoading, refetch: refetchWins } = useRecentWins(10);
  const { bets: liveBets, isLoading: betsLoading, refetch: refetchBets } = useLiveBets(10);

  const refetchAll = useCallback(() => {
    refetchWins();
    refetchBets();
  }, [refetchWins, refetchBets]);

  return {
    recentWins,
    liveBets,
    isLoading: winsLoading || betsLoading,
    refetch: refetchAll,
  };
};
