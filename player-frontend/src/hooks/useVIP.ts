import { useState, useEffect, useCallback } from 'react';
import { vipApi } from '../lib/api';

export interface VipLevel {
  id: string;
  level: number;
  name: string;
  requiredXp: number;
  gcMultiplier: number;
  scMultiplier: number;
  benefits: string[];
  iconUrl?: string;
  color?: string;
}

export interface VipStatus {
  currentLevel: VipLevel;
  nextLevel?: VipLevel;
  currentXp: number;
  xpToNextLevel: number;
  progressPercent: number;
  totalWagered: number;
  lifetimeRewards: number;
}

export interface VipReward {
  id: string;
  name: string;
  description: string;
  gcAmount?: number;
  scAmount?: number;
  isClaimed: boolean;
  expiresAt?: string;
}

export const useVipLevels = () => {
  const [levels, setLevels] = useState<VipLevel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLevels = async () => {
      setIsLoading(true);
      try {
        const response = await vipApi.getLevels();
        setLevels(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch VIP levels');
        setLevels([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLevels();
  }, []);

  return { levels, isLoading, error };
};

export const useVipStatus = () => {
  const [status, setStatus] = useState<VipStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await vipApi.getMyStatus();
      setStatus(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch VIP status');
      setStatus(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return { status, isLoading, error, refetch: fetchStatus };
};

export const useVipRewards = () => {
  const [rewards, setRewards] = useState<VipReward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRewards = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await vipApi.getRewards();
      setRewards(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch VIP rewards');
      setRewards([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRewards();
  }, [fetchRewards]);

  const claimReward = async (rewardId: string) => {
    try {
      await vipApi.claimReward(rewardId);
      await fetchRewards();
      return true;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to claim reward');
    }
  };

  return { rewards, isLoading, error, claimReward, refetch: fetchRewards };
};
