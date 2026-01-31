/**
 * Token Manager - Secure token storage
 *
 * Access tokens are stored in memory only (cleared on page refresh)
 * Refresh tokens are stored in sessionStorage (cleared when browser closes)
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

export const tokenManager = {
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
   * Get the refresh token from session storage
   */
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(REFRESH_TOKEN_KEY);
  },

  /**
   * Set the refresh token in session storage
   */
  setRefreshToken(token: string | null): void {
    if (typeof window === 'undefined') return;
    if (token) {
      sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
    } else {
      sessionStorage.removeItem(REFRESH_TOKEN_KEY);
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
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(REFRESH_TOKEN_KEY);
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
