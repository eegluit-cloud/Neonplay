import { useState, useEffect, useCallback } from 'react';
import { spinWheelApi } from '../lib/api';

export interface SpinWheelSegment {
  id: string;
  label: string;
  gcAmount: number;
  scAmount: number;
  probability: number;
  color: string;
  sortOrder: number;
}

export interface SpinWheelConfig {
  segments: SpinWheelSegment[];
  spinsRemaining: number;
  nextFreeSpinAt?: string;
  cooldownMinutes: number;
}

export interface SpinResult {
  segment: SpinWheelSegment;
  gcWon: number;
  scWon: number;
  spinsRemaining: number;
}

export const useSpinWheelConfig = () => {
  const [config, setConfig] = useState<SpinWheelConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await spinWheelApi.getConfig();
      setConfig(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch spin wheel config');
      setConfig(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return { config, isLoading, error, refetch: fetchConfig };
};

export const useSpinWheel = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<SpinResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const spin = useCallback(async () => {
    setIsSpinning(true);
    setError(null);
    setResult(null);
    try {
      const response = await spinWheelApi.spin();
      setResult(response.data);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to spin the wheel';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsSpinning(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { spin, isSpinning, result, error, reset };
};
