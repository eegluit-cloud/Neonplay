import { useState, useEffect, useCallback } from 'react';
import { prizesApi } from '../lib/api';

export interface Prize {
  id: string;
  name: string;
  description?: string;
  valueUsd: number;
  scCost: number;
  category: string;
  prizeType: string;
  imageUrl?: string;
  isPopular?: boolean;
  isAvailable: boolean;
  stock?: number;
  sortOrder: number;
}

export interface PrizeCategory {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export interface PrizeTier {
  id: string;
  leaderboardPeriod: string;
  position: number;
  gcAmount: number;
  scAmount: number;
  prizeId?: string;
  prize?: Prize;
}

export interface PrizeRedemption {
  id: string;
  prizeId: string;
  prize: Prize;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  scCost: number;
  createdAt: string;
  shippedAt?: string;
  trackingNumber?: string;
}

export const usePrizes = (params?: { category?: string; limit?: number }) => {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrizes = async () => {
      setIsLoading(true);
      try {
        const response = await prizesApi.getStore(params);
        setPrizes(response.data.items || response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch prizes');
        setPrizes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrizes();
  }, [params?.category, params?.limit]);

  return { prizes, isLoading, error };
};

export const usePrizeCategories = () => {
  const [categories, setCategories] = useState<PrizeCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const response = await prizesApi.getCategories();
        setCategories(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch prize categories');
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, isLoading, error };
};

export const usePrizeTiers = () => {
  const [tiers, setTiers] = useState<PrizeTier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTiers = async () => {
      setIsLoading(true);
      try {
        const response = await prizesApi.getTiers();
        setTiers(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch prize tiers');
        setTiers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTiers();
  }, []);

  return { tiers, isLoading, error };
};

export const usePrizeRedemptions = () => {
  const [redemptions, setRedemptions] = useState<PrizeRedemption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRedemptions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await prizesApi.getRedemptions();
      setRedemptions(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch redemptions');
      setRedemptions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRedemptions();
  }, [fetchRedemptions]);

  const redeemPrize = async (prizeId: string, shippingAddress?: Record<string, string>) => {
    try {
      await prizesApi.redeem(prizeId, shippingAddress);
      await fetchRedemptions();
      return true;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to redeem prize');
    }
  };

  return { redemptions, isLoading, error, redeemPrize, refetch: fetchRedemptions };
};
