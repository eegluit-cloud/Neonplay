import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { tokenManager } from './tokenManager';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

// CSRF token cookie name (must match backend)
const CSRF_COOKIE_NAME = 'XSRF-TOKEN';
const CSRF_HEADER_NAME = 'X-CSRF-Token';

/**
 * Get CSRF token from cookie
 */
function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(^| )${CSRF_COOKIE_NAME}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

// Migrate tokens from old localStorage on module load
tokenManager.migrateFromLocalStorage();

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Required for cookies to be sent
});

// Token refresh mutex - prevents concurrent refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor to add auth token and CSRF token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add authorization token
    const token = tokenManager.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add CSRF token for state-changing requests
    const method = config.method?.toUpperCase();
    if (method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const csrfToken = getCsrfToken();
      if (csrfToken && config.headers) {
        config.headers[CSRF_HEADER_NAME] = csrfToken;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh (with mutex to prevent concurrent refreshes)
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        }).catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = tokenManager.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        }, { withCredentials: true });

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        tokenManager.setTokens(accessToken, newRefreshToken);

        // Process all queued requests with the new token
        processQueue(null, accessToken);
        isRefreshing = false;

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        tokenManager.clearTokens();
        try {
          const { toast } = await import('sonner');
          toast.error('Session expired', { description: 'Please log in again.' });
        } catch {
          // toast not available
        }
        setTimeout(() => { window.location.href = '/'; }, 1500);
        return new Promise(() => {});
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (data: {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    countryCode?: string;
    referralCode?: string;
  }) => api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  logout: () => api.post('/auth/logout'),

  getProfile: () => api.get('/auth/me'),

  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
};

// Games API
export const gamesApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    provider?: string;
    search?: string;
  }) => api.get('/games', { params }),

  getBySlug: (slug: string) => api.get(`/games/${slug}`),

  getCategories: () => api.get('/games/categories'),

  getProviders: () => api.get('/providers'),

  getFeatured: () => api.get('/games', { params: { featured: true, limit: 10 } }),

  getNew: () => api.get('/games', { params: { new: true, limit: 10 } }),

  getHot: () => api.get('/games', { params: { hot: true, limit: 10 } }),

  launchGame: (slug: string, currency?: string) =>
    api.post(`/games/${slug}/launch`, { currency }),
};

// Wallet API
export const walletApi = {
  getBalance: () => api.get('/wallet'),
  updateCurrency: (currency: string) => api.patch('/wallet/currency', { currency }),

  getTransactions: (params?: { page?: number; limit?: number; type?: string }) =>
    api.get('/wallet/transactions', { params }),

  purchase: (data: { packageId: string; paymentMethod: string }) =>
    api.post('/wallet/purchase', data),

  getPackages: () => api.get('/wallet/packages'),

  getPaymentMethods: () => api.get('/wallet/payment-methods'),

  getCryptoOptions: () => api.get('/wallet/crypto-options'),
};

// Pay247 Payment Gateway API
export const pay247Api = {
  createDeposit: (data: {
    amount: number;
    currency: string;
    paymentMethod: string;
    returnUrl?: string;
    theme?: 'link' | 'custom';
  }) => api.post('/payment/pay247/deposit/create', data),

  createWithdrawal: (data: {
    amount: number;
    currency: string;
    paymentMethod: string;
    accountDetails: any;
  }) => api.post('/payment/pay247/withdrawal/create', data),

  getDepositStatus: (orderId: string) =>
    api.get(`/payment/pay247/deposit/${orderId}/status`),

  getWithdrawalStatus: (orderId: string) =>
    api.get(`/payment/pay247/withdrawal/${orderId}/status`),
};

// Leaderboard API
export const leaderboardApi = {
  get: (period: 'daily' | 'weekly' | 'monthly' = 'daily', limit = 25) =>
    api.get('/leaderboard', { params: { period, limit } }),

  getMyRank: (period: 'daily' | 'weekly' | 'monthly' = 'daily') =>
    api.get('/leaderboard/me', { params: { period } }),
};

// Promotions API
export const promotionsApi = {
  getAll: () => api.get('/promotions'),

  getBySlug: (slug: string) => api.get(`/promotions/${slug}`),

  claim: (slug: string) => api.post(`/promotions/${slug}/claim`),

  claimDaily: () => api.post('/promotions/daily/claim'),
};

// VIP API
export const vipApi = {
  getLevels: () => api.get('/vip/levels'),

  getMyStatus: () => api.get('/vip/status'),

  getBenefits: () => api.get('/vip/benefits'),

  claimCashback: () => api.post('/vip/cashback/claim'),
};

/**
 * Proactively refresh the access token using the stored refresh token.
 * Returns true if successful, false otherwise.
 * Uses bare axios (not the api instance) to avoid interceptor loops.
 */
export async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = tokenManager.getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refreshToken,
    }, { withCredentials: true });
    const { accessToken, refreshToken: newRefreshToken } = response.data;
    tokenManager.setTokens(accessToken, newRefreshToken);
    return true;
  } catch {
    tokenManager.clearTokens();
    return false;
  }
}

// Referrals API
export const referralsApi = {
  getStats: () => api.get('/referrals/stats'),

  getReferrals: () => api.get('/referrals'),

  getCode: () => api.get('/referrals/code'),
};

// Notifications API
export const notificationsApi = {
  getAll: (params?: { page?: number; limit?: number; unreadOnly?: boolean }) =>
    api.get('/notifications', { params }),

  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),

  markAllAsRead: () => api.patch('/notifications/read-all'),
};

// User API
export const usersApi = {
  getProfile: () => api.get('/users/profile'),

  updateProfile: (data: { firstName?: string; lastName?: string; avatar?: string }) =>
    api.patch('/users/profile', data),

  getFavorites: () => api.get('/games/favorites'),

  addFavorite: (gameId: string) => api.post(`/games/favorites/${gameId}`),

  removeFavorite: (gameId: string) => api.delete(`/games/favorites/${gameId}`),
};

// Settings API
export const settingsApi = {
  get: () => api.get('/settings'),

  update: (data: Record<string, unknown>) => api.patch('/settings', data),

  getPreferences: () => api.get('/settings/preferences'),

  updatePreferences: (data: Record<string, unknown>) =>
    api.patch('/settings/preferences', data),
};

// AMOE API
export const amoeApi = {
  getConfig: () => api.get('/amoe/config'),

  generateCode: () => api.post('/amoe/generate'),

  submitEntry: (data: { code: string; postalAddress: Record<string, string> }) =>
    api.post('/amoe/submit', data),

  getHistory: () => api.get('/amoe/history'),
};

// Content API
export const contentApi = {
  getVideos: (params?: { page?: number; limit?: number; category?: string; sortBy?: string }) =>
    api.get('/content/videos', { params }),

  getVideo: (id: string) => api.get(`/content/videos/${id}`),

  getFeatured: () => api.get('/content/videos/featured'),

  getLive: () => api.get('/content/videos/live'),

  getCategories: () => api.get('/content/categories'),

  trackView: (videoId: string, watchedSeconds: number, completed: boolean) =>
    api.post(`/content/videos/${videoId}/track`, { watchedSeconds, completed }),
};

// Prizes API
export const prizesApi = {
  getAll: (params?: { page?: number; limit?: number; category?: string }) =>
    api.get('/prizes', { params }),

  getStore: (params?: { page?: number; limit?: number; category?: string }) =>
    api.get('/prizes/store', { params }),

  getCategories: () => api.get('/prizes/categories'),

  getTiers: () => api.get('/prizes/tiers'),

  redeem: (prizeId: string, shippingAddress?: Record<string, string>) =>
    api.post(`/prizes/redeem/${prizeId}`, shippingAddress),

  getRedemptions: () => api.get('/prizes/user/redemptions'),
};

// Sports API
export const sportsApi = {
  getSports: () => api.get('/sports'),

  getLeagues: (sportId?: string) => api.get('/sports/leagues', { params: { sportId } }),

  getMatches: (params?: { leagueId?: string; status?: string; limit?: number }) =>
    api.get('/sports/matches', { params }),

  getMatch: (matchId: string) => api.get(`/sports/matches/${matchId}`),

  getLiveMatches: () => api.get('/sports/matches', { params: { status: 'live' } }),

  getUpcomingMatches: (limit = 10) =>
    api.get('/sports/matches', { params: { status: 'scheduled', limit } }),

  placeBet: (data: { matchId: string; oddId: string; amount: number; coinType: 'gc' | 'sc' }) =>
    api.post('/sports/bets', data),

  getMyBets: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get('/sports/bets', { params }),
};

// Spin Wheel API
export const spinWheelApi = {
  getConfig: () => api.get('/promotions/spin-wheel/config'),

  spin: () => api.post('/promotions/spin-wheel/spin'),
};

// CMS/Site Settings API
export const cmsApi = {
  getSiteSettings: () => api.get('/cms/settings'),

  getHeroBanners: () => api.get('/cms/banners'),

  getStaticPage: (slug: string) => api.get(`/cms/pages/${slug}`),

  getAnnouncements: () => api.get('/cms/announcements'),
};

// Help/FAQ API
export const helpApi = {
  getFaqCategories: () => api.get('/help/faq/categories'),

  getFaqs: (categorySlug?: string) => api.get('/help/faq', { params: { category: categorySlug } }),

  getFeaturedFaqs: () => api.get('/help/faq/featured'),

  submitTicket: (data: { subject: string; message: string; category?: string }) =>
    api.post('/help/tickets', data),

  getTickets: () => api.get('/help/tickets'),
};

// Jackpot API
export const jackpotApi = {
  getAll: () => api.get('/jackpot'),

  getCurrent: () => api.get('/jackpot/current'),

  getWinners: (params?: { page?: number; limit?: number }) =>
    api.get('/jackpot/winners', { params }),
};

// Activity/Social Proof API
export const activityApi = {
  getRecentWins: (limit = 20) => api.get('/activity/wins', { params: { limit } }),

  getPublicWins: (limit = 50) => api.get('/activity/public-wins', { params: { limit } }),

  getLiveBets: (limit = 20) => api.get('/activity/live-bets', { params: { limit } }),
};

// Health API
export const healthApi = {
  check: () => api.get('/health'),
};

export default api;
