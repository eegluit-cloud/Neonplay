import { useState, useEffect, useCallback } from 'react';
import { contentApi } from '../lib/api';

export interface ContentCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  videoCount?: number;
  sortOrder: number;
}

export interface ContentVideo {
  id: string;
  title: string;
  description?: string;
  categoryId: string;
  category?: ContentCategory;
  thumbnailUrl?: string;
  videoUrl: string;
  duration: number;
  viewCount: number;
  isFeatured: boolean;
  isLive: boolean;
  createdAt: string;
}

export const useContentCategories = () => {
  const [categories, setCategories] = useState<ContentCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const response = await contentApi.getCategories();
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

export const useContentVideos = (params?: { category?: string; limit?: number; sortBy?: string }) => {
  const [videos, setVideos] = useState<ContentVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchVideos = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await contentApi.getVideos({ ...params, page });
      const data = response.data;
      if (page === 1) {
        setVideos(data.items || data);
      } else {
        setVideos(prev => [...prev, ...(data.items || data)]);
      }
      setHasMore(data.hasMore !== false && (data.items || data).length > 0);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch videos');
      if (page === 1) setVideos([]);
    } finally {
      setIsLoading(false);
    }
  }, [params?.category, params?.limit, params?.sortBy]);

  useEffect(() => {
    fetchVideos(1);
  }, [fetchVideos]);

  return { videos, isLoading, error, hasMore, loadMore: (page: number) => fetchVideos(page) };
};

export const useFeaturedVideos = () => {
  const [videos, setVideos] = useState<ContentVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoading(true);
      try {
        const response = await contentApi.getFeatured();
        setVideos(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch featured videos');
        setVideos([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, []);

  return { videos, isLoading, error };
};

export const useLiveVideos = () => {
  const [videos, setVideos] = useState<ContentVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await contentApi.getLive();
      setVideos(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch live videos');
      setVideos([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
    // Refresh live streams every minute
    const interval = setInterval(fetchVideos, 60000);
    return () => clearInterval(interval);
  }, [fetchVideos]);

  return { videos, isLoading, error, refetch: fetchVideos };
};

export const useVideo = (videoId: string) => {
  const [video, setVideo] = useState<ContentVideo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoId) return;

    const fetchVideo = async () => {
      setIsLoading(true);
      try {
        const response = await contentApi.getVideo(videoId);
        setVideo(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch video');
        setVideo(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideo();
  }, [videoId]);

  const trackView = async (watchedSeconds: number, completed: boolean) => {
    if (!videoId) return;
    try {
      await contentApi.trackView(videoId, watchedSeconds, completed);
    } catch (err) {
      console.error('Failed to track view:', err);
    }
  };

  return { video, isLoading, error, trackView };
};
