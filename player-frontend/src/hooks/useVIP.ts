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
      const data = response.data;

      // Transform backend response to match VipStatus interface
      // Backend returns: { tier, xpCurrent, xpLifetime, nextTier, progress, cashbackAvailable, isGuest }
      // Frontend expects: { currentLevel, nextLevel, currentXp, xpToNextLevel, progressPercent, totalWagered, lifetimeRewards }
      if (data.isGuest) {
        setStatus(null);
      } else {
        const transformed: VipStatus = {
          currentLevel: data.tier ? {
            id: data.tier.id,
            level: data.tier.level,
            name: data.tier.name,
            requiredXp: parseInt(data.tier.minXp) || 0,
            gcMultiplier: 1,
            scMultiplier: 1,
            benefits: data.tier.benefits || [],
            iconUrl: data.tier.iconUrl,
            color: data.tier.color,
          } : { id: '', level: 1, name: 'Bronze', requiredXp: 0, gcMultiplier: 1, scMultiplier: 1, benefits: [] },
          nextLevel: data.nextTier ? {
            id: data.nextTier.id,
            level: data.nextTier.level,
            name: data.nextTier.name,
            requiredXp: parseInt(data.nextTier.minXp) || 0,
            gcMultiplier: 1,
            scMultiplier: 1,
            benefits: [],
          } : undefined,
          currentXp: parseInt(data.xpCurrent) || 0,
          xpToNextLevel: data.progress?.xpToNextTier ? parseInt(data.progress.xpToNextTier) : 0,
          progressPercent: data.progress?.percent ?? 0,
          totalWagered: parseInt(data.xpLifetime) || 0,
          lifetimeRewards: 0,
        };
        setStatus(transformed);
      }
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
  const [cashbackAvailable, setCashbackAvailable] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRewards = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await vipApi.getBenefits();
      const data = response.data;

      // Transform backend benefits into VipReward-like structure
      // Backend returns: { tierName, tierLevel, benefits, cashbackPercent, redemptionBonusPercent, exclusivePromotions, cashbackAvailable }
      const benefitRewards: VipReward[] = [];

      // Add cashback as a claimable reward if available
      const cashback = parseFloat(data.cashbackAvailable || '0');
      setCashbackAvailable(data.cashbackAvailable || '0');
      if (cashback > 0) {
        benefitRewards.push({
          id: 'cashback',
          name: `${data.tierName} Cashback`,
          description: `${data.cashbackPercent}% cashback reward`,
          gcAmount: cashback,
          isClaimed: false,
        });
      }

      setRewards(benefitRewards);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch VIP benefits');
      setRewards([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRewards();
  }, [fetchRewards]);

  const claimReward = async (_rewardId: string) => {
    try {
      await vipApi.claimCashback();
      await fetchRewards();
      return true;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to claim cashback');
    }
  };

  return { rewards, isLoading, error, claimReward, cashbackAvailable, refetch: fetchRewards };
};
