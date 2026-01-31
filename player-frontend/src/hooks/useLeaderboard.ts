import { useState, useEffect, useCallback } from 'react';
import { leaderboardApi } from '../lib/api';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar?: string;
  wagered: number;
  prize: number;
  country?: string;
}

export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly';

export const useLeaderboard = (initialPeriod: LeaderboardPeriod = 'daily') => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [period, setPeriod] = useState<LeaderboardPeriod>(initialPeriod);
  const [myRank, setMyRank] = useState<LeaderboardEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [leaderboardRes, myRankRes] = await Promise.allSettled([
        leaderboardApi.get(period, 25),
        leaderboardApi.getMyRank(period),
      ]);

      if (leaderboardRes.status === 'fulfilled') {
        setEntries(leaderboardRes.value.data || []);
      } else {
        setEntries([]);
      }

      if (myRankRes.status === 'fulfilled') {
        setMyRank(myRankRes.value.data);
      } else {
        setMyRank(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch leaderboard');
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const changePeriod = (newPeriod: LeaderboardPeriod) => {
    setPeriod(newPeriod);
  };

  return {
    entries,
    myRank,
    period,
    isLoading,
    error,
    changePeriod,
    refetch: fetchLeaderboard,
  };
};

// Helper function to format amounts
export const formatAmount = (amount: number) =>
  amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
