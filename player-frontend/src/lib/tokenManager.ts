/**
 * Token Manager - Secure token storage
 *
 * Access tokens are stored in localStorage for persistence across page refreshes
 * Refresh tokens are stored in localStorage for persistent sessions
 *
 * For production, consider:
 * - Using httpOnly cookies for tokens (requires backend changes)
 * - Implementing token rotation
 * - Adding token fingerprinting
 */

// localStorage keys
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const tokenManager = {
  /**
   * Get the current access token from localStorage
   */
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  /**
   * Set the access token in localStorage
   */
  setAccessToken(token: string | null): void {
    if (typeof window === 'undefined') return;
    if (token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  },

  /**
   * Get the refresh token from localStorage
   */
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  /**
   * Set the refresh token in localStorage
   */
  setRefreshToken(token: string | null): void {
    if (typeof window === 'undefined') return;
    if (token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } else {
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
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
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
   * Migrate tokens from old sessionStorage storage (one-time migration)
   */
  migrateFromLocalStorage(): void {
    if (typeof window === 'undefined') return;

    // Migrate from old sessionStorage keys
    const oldAccessToken = sessionStorage.getItem('accessToken');
    const oldRefreshToken = sessionStorage.getItem('rt_session');

    if (oldAccessToken || oldRefreshToken) {
      // Migrate tokens
      if (oldAccessToken) {
        this.setAccessToken(oldAccessToken);
      }
      if (oldRefreshToken) {
        this.setRefreshToken(oldRefreshToken);
      }

      // Clear old storage
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('rt_session');
    }
  }
};

export default tokenManager;
