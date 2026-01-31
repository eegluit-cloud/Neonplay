import { useState, useEffect, useCallback } from 'react';
import { referralsApi } from '../lib/api';

export interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalEarned: number;
  pendingEarnings: number;
  referralCode: string;
  referralLink: string;
}

export interface Referral {
  id: string;
  username: string;
  avatar?: string;
  joinedAt: string;
  status: 'pending' | 'active' | 'inactive';
  earnings: number;
}

export const useReferralStats = () => {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await referralsApi.getStats();
      setStats(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch referral stats');
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error, refetch: fetchStats };
};

export const useReferrals = () => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReferrals = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await referralsApi.getReferrals();
      setReferrals(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch referrals');
      setReferrals([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  return { referrals, isLoading, error, refetch: fetchReferrals };
};

export const useReferralCode = () => {
  const [code, setCode] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCode = async () => {
      try {
        const response = await referralsApi.getCode();
        setCode(response.data.code);
        setLink(response.data.link);
      } catch {
        setCode(null);
        setLink(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCode();
  }, []);

  return { code, link, isLoading };
};
