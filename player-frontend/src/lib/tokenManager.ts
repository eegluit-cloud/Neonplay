/**
 * Token Manager - Secure token storage
 *
 * Access tokens are stored in memory only (cleared on page refresh)
 * Refresh tokens are stored in sessionStorage (cleared when browser closes)
 * or localStorage (persists across sessions) based on "Remember Me" setting
 *
 * For production, consider:
 * - Using httpOnly cookies for refresh tokens (requires backend changes)
 * - Implementing token rotation
 * - Adding token fingerprinting
 */

// In-memory storage for access token (not persisted to disk)
let accessToken: string | null = null;

// Session storage key for refresh token (cleared when browser closes)
const REFRESH_TOKEN_KEY = 'rt_session';

// Whether to use localStorage (remember me) vs sessionStorage
// Initialized from where the existing token is found
let useLocalStorage = typeof window !== 'undefined' && localStorage.getItem('rt_session') !== null;

export const tokenManager = {
  /**
   * Set remember me mode -- determines whether refresh token
   * persists across browser sessions (localStorage) or not (sessionStorage)
   */
  setRememberMe(remember: boolean): void {
    useLocalStorage = remember;
    const existing = this.getRefreshToken();
    if (remember && existing) {
      localStorage.setItem(REFRESH_TOKEN_KEY, existing);
      sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    } else if (!remember && existing) {
      sessionStorage.setItem(REFRESH_TOKEN_KEY, existing);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  },

  /**
   * Get the current access token from memory
   */
  getAccessToken(): string | null {
    return accessToken;
  },

  /**
   * Set the access token in memory
   */
  setAccessToken(token: string | null): void {
    accessToken = token;
  },

  /**
   * Get the refresh token from storage (checks both locations)
   */
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY)
      || sessionStorage.getItem(REFRESH_TOKEN_KEY);
  },

  /**
   * Set the refresh token in the appropriate storage
   */
  setRefreshToken(token: string | null): void {
    if (typeof window === 'undefined') return;
    if (token) {
      if (useLocalStorage) {
        localStorage.setItem(REFRESH_TOKEN_KEY, token);
        sessionStorage.removeItem(REFRESH_TOKEN_KEY);
      } else {
        sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      }
    } else {
      sessionStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  },

  /**
   * Set both tokens at once (convenience method)
   */
  setTokens(access: string, refresh: string): void {
    this.setAccessToken(access);
    this.setRefreshToken(refresh);
  },

  /**
   * Clear all tokens
   */
  clearTokens(): void {
    accessToken = null;
    useLocalStorage = false;
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  },

  /**
   * Check if user has a valid session (has refresh token)
   */
  hasSession(): boolean {
    return this.getRefreshToken() !== null;
  },

  /**
   * Migrate tokens from old localStorage storage (one-time migration)
   */
  migrateFromLocalStorage(): void {
    if (typeof window === 'undefined') return;

    const oldAccessToken = localStorage.getItem('accessToken');
    const oldRefreshToken = localStorage.getItem('refreshToken');

    if (oldAccessToken || oldRefreshToken) {
      // Migrate tokens
      if (oldAccessToken) {
        this.setAccessToken(oldAccessToken);
      }
      if (oldRefreshToken) {
        this.setRefreshToken(oldRefreshToken);
      }

      // Clear old storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }
};

export default tokenManager;
