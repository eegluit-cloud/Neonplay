import { useState, useEffect, useCallback } from 'react';
import { walletApi } from '../lib/api';

export interface CoinPackage {
  id: string;
  name: string;
  gcAmount: number;
  scBonusAmount: number;
  priceUsd: number;
  discountPercent?: number;
  isPopular?: boolean;
  isBestValue?: boolean;
  sortOrder: number;
}

export interface PaymentMethod {
  id: string;
  type: string;
  name: string;
  iconUrl?: string;
  minAmount: number;
  maxAmount: number;
  processingTime: string;
  isActive: boolean;
}

export interface CryptoOption {
  id: string;
  currency: string;
  name: string;
  iconUrl?: string;
  networks: { network: string; address: string }[];
  minAmount: number;
  confirmationsRequired: number;
  isActive: boolean;
}

export const useCoinPackages = () => {
  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackages = async () => {
      setIsLoading(true);
      try {
        const response = await walletApi.getPackages();
        setPackages(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch coin packages');
        setPackages([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackages();
  }, []);

  return { packages, isLoading, error };
};

export const usePaymentMethods = () => {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMethods = async () => {
      setIsLoading(true);
      try {
        const response = await walletApi.getPaymentMethods();
        setMethods(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch payment methods');
        setMethods([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMethods();
  }, []);

  return { methods, isLoading, error };
};

export const useCryptoOptions = () => {
  const [options, setOptions] = useState<CryptoOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOptions = async () => {
      setIsLoading(true);
      try {
        const response = await walletApi.getCryptoOptions();
        setOptions(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch crypto options');
        setOptions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOptions();
  }, []);

  return { options, isLoading, error };
};

export const usePurchase = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const purchase = useCallback(async (packageId: string, paymentMethod: string) => {
    setIsProcessing(true);
    setError(null);
    try {
      const response = await walletApi.purchase({ packageId, paymentMethod });
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Purchase failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return { purchase, isProcessing, error };
};
