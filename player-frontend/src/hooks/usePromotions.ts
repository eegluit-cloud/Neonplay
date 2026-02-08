import { useState, useEffect, useCallback } from 'react';
import { promotionsApi } from '../lib/api';

export interface Promotion {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: 'welcome' | 'deposit' | 'daily' | 'weekly' | 'monthly' | 'special';
  gcAmount?: string;
  scAmount?: string;
  percentageBonus?: number;
  maxBonus?: string;
  wageringRequirement?: number;
  minDeposit?: string;
  imageUrl?: string;
  terms?: string;
  startsAt?: string;
  endsAt?: string;
}

export const usePromotions = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPromotions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await promotionsApi.getAll();
      setPromotions(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch promotions');
      setPromotions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  const claimPromotion = async (slug: string) => {
    try {
      await promotionsApi.claim(slug);
      await fetchPromotions();
      return true;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to claim promotion');
    }
  };

  const claimDaily = async () => {
    try {
      const response = await promotionsApi.claimDaily();
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to claim daily bonus');
    }
  };

  return { promotions, isLoading, error, claimPromotion, claimDaily, refetch: fetchPromotions };
};

export const usePromotion = (slug: string) => {
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPromotion = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await promotionsApi.getBySlug(slug);
        setPromotion(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch promotion');
        setPromotion(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchPromotion();
    }
  }, [slug]);

  return { promotion, isLoading, error };
};
