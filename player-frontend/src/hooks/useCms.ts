import { useState, useEffect } from 'react';
import { cmsApi } from '../lib/api';

export interface SiteSettings {
  siteName: string;
  tagline?: string;
  supportEmail: string;
  socialLinks: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    discord?: string;
    telegram?: string;
    youtube?: string;
  };
  footerLinks?: Record<string, { label: string; url: string }[]>;
}

export interface HeroBanner {
  id: string;
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  imageUrl?: string;
  backgroundGradient?: string;
  targetAudience: string;
  isActive: boolean;
  sortOrder: number;
}

export interface StaticPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isActive: boolean;
  startsAt?: string;
  endsAt?: string;
}

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const response = await cmsApi.getSiteSettings();
        setSettings(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch site settings');
        setSettings(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return { settings, isLoading, error };
};

export const useHeroBanners = () => {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBanners = async () => {
      setIsLoading(true);
      try {
        const response = await cmsApi.getHeroBanners();
        setBanners(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch hero banners');
        setBanners([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanners();
  }, []);

  return { banners, isLoading, error };
};

export const useStaticPage = (slug: string) => {
  const [page, setPage] = useState<StaticPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchPage = async () => {
      setIsLoading(true);
      try {
        const response = await cmsApi.getStaticPage(slug);
        setPage(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch page');
        setPage(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  return { page, isLoading, error };
};

export const useAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setIsLoading(true);
      try {
        const response = await cmsApi.getAnnouncements();
        setAnnouncements(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch announcements');
        setAnnouncements([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  return { announcements, isLoading, error };
};
