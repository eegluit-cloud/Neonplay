import { useState, useEffect, useCallback } from 'react';
import { usersApi } from '../lib/api';
import { Game } from './useGames';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Game[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await usersApi.getFavorites();
      const games = response.data || [];
      setFavorites(games);
      setFavoriteIds(new Set(games.map((g: Game) => g.id)));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch favorites');
      setFavorites([]);
      setFavoriteIds(new Set());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const addFavorite = async (gameId: string) => {
    try {
      await usersApi.addFavorite(gameId);
      setFavoriteIds((prev) => new Set([...prev, gameId]));
      await fetchFavorites();
      return true;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to add favorite');
    }
  };

  const removeFavorite = async (gameId: string) => {
    try {
      await usersApi.removeFavorite(gameId);
      setFavoriteIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(gameId);
        return newSet;
      });
      await fetchFavorites();
      return true;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to remove favorite');
    }
  };

  const toggleFavorite = async (gameId: string) => {
    if (favoriteIds.has(gameId)) {
      return removeFavorite(gameId);
    } else {
      return addFavorite(gameId);
    }
  };

  const isFavorite = (gameId: string) => favoriteIds.has(gameId);

  return {
    favorites,
    favoriteIds,
    isLoading,
    error,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    refetch: fetchFavorites,
  };
};
