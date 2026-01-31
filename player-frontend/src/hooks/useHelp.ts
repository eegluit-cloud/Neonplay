import { useState, useEffect, useCallback } from 'react';
import { helpApi } from '../lib/api';

export interface FaqCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  faqCount?: number;
  sortOrder: number;
}

export interface Faq {
  id: string;
  categoryId: string;
  category?: FaqCategory;
  question: string;
  answer: string;
  isFeatured: boolean;
  sortOrder: number;
}

export interface SupportTicket {
  id: string;
  subject: string;
  category?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  messages: SupportMessage[];
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  message: string;
  isFromSupport: boolean;
  createdAt: string;
}

export const useFaqCategories = () => {
  const [categories, setCategories] = useState<FaqCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const response = await helpApi.getFaqCategories();
        setCategories(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch FAQ categories');
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, isLoading, error };
};

export const useFaqs = (categorySlug?: string) => {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      setIsLoading(true);
      try {
        const response = await helpApi.getFaqs(categorySlug);
        setFaqs(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch FAQs');
        setFaqs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFaqs();
  }, [categorySlug]);

  return { faqs, isLoading, error };
};

export const useFeaturedFaqs = () => {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      setIsLoading(true);
      try {
        const response = await helpApi.getFeaturedFaqs();
        setFaqs(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch featured FAQs');
        setFaqs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFaqs();
  }, []);

  return { faqs, isLoading, error };
};

export const useSupportTickets = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await helpApi.getTickets();
      setTickets(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tickets');
      setTickets([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const submitTicket = async (subject: string, message: string, category?: string) => {
    try {
      const response = await helpApi.submitTicket({ subject, message, category });
      await fetchTickets();
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to submit ticket');
    }
  };

  return { tickets, isLoading, error, submitTicket, refetch: fetchTickets };
};
