import { useState, useEffect, useCallback } from 'react';
import { gamesApi } from '../lib/api';

export interface Game {
  id: string;
  name: string;
  slug: string;
  description?: string;
  thumbnailUrl: string;
  bannerUrl?: string;
  tags?: string[];
  rtp: string;
  volatility: string;
  minBet: string;
  maxBet: string;
  features?: Record<string, boolean>;
  isFeatured: boolean;
  isNew: boolean;
  isHot: boolean;
  playCount: number;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  provider: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
  };
}

export interface GameCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  gameCount: number;
}

export interface GameProvider {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  gameCount: number;
}

interface UseGamesParams {
  page?: number;
  limit?: number;
  category?: string;
  provider?: string;
  search?: string;
}

export const useGames = (params?: UseGamesParams) => {
  const [games, setGames] = useState<Game[]>([]);
  const [meta, setMeta] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await gamesApi.getAll(params);
      setGames(response.data.items || response.data);
      setMeta(response.data.meta || null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch games');
      setGames([]);
    } finally {
      setIsLoading(false);
    }
  }, [params?.page, params?.limit, params?.category, params?.provider, params?.search]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  return { games, meta, isLoading, error, refetch: fetchGames };
};

export const useGame = (slug: string) => {
  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGame = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await gamesApi.getBySlug(slug);
        setGame(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch game');
        setGame(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchGame();
    }
  }, [slug]);

  return { game, isLoading, error };
};

export const useGameCategories = () => {
  const [categories, setCategories] = useState<GameCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await gamesApi.getCategories();
        setCategories(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch categories');
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, isLoading, error };
};

export const useGameProviders = () => {
  const [providers, setProviders] = useState<GameProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProviders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await gamesApi.getProviders();
        setProviders(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch providers');
        setProviders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProviders();
  }, []);

  return { providers, isLoading, error };
};

export const useFeaturedGames = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await gamesApi.getFeatured();
        setGames(response.data.items || response.data);
      } catch {
        setGames([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return { games, isLoading };
};

export const useNewGames = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNew = async () => {
      try {
        const response = await gamesApi.getNew();
        setGames(response.data.items || response.data);
      } catch {
        setGames([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNew();
  }, []);

  return { games, isLoading };
};

export const useHotGames = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHot = async () => {
      try {
        const response = await gamesApi.getHot();
        setGames(response.data.items || response.data);
      } catch {
        setGames([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHot();
  }, []);

  return { games, isLoading };
};
