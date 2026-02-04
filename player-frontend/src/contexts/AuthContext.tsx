import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, walletApi } from '../lib/api';
import { tokenManager } from '../lib/tokenManager';

export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: string;
  isEmailVerified: boolean;
  createdAt: string;
}

// Multi-currency wallet balances
export interface WalletBalances {
  USD: number;
  EUR: number;
  GBP: number;
  CAD: number;
  AUD: number;
  PHP: number;
  INR: number;
  THB: number;
  CNY: number;
  JPY: number;
  USDC: number;
  USDT: number;
  BTC: number;
  ETH: number;
  SOL: number;
  DOGE: number;
}

export type Currency = keyof WalletBalances;

export interface Wallet {
  balances: WalletBalances;
  primaryCurrency: Currency;
  lifetimeStats: {
    deposited: number;
    withdrawn: number;
    wagered: number;
    won: number;
    bonuses: number;
  };
}

interface AuthContextType {
  user: User | null;
  wallet: Wallet | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshWallet: () => Promise<void>;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  countryCode?: string;
  referralCode?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const response = await authApi.getProfile();
      setUser(response.data);
    } catch (error) {
      setUser(null);
    }
  }, []);

  const refreshWallet = useCallback(async () => {
    try {
      const response = await walletApi.getBalance();
      setWallet(response.data);
    } catch (error) {
      setWallet(null);
    }
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      // Check if we have a refresh token but no access token (page was refreshed)
      const hasRefreshToken = tokenManager.hasSession();
      const hasAccessToken = tokenManager.getAccessToken() !== null;

      if (hasRefreshToken && !hasAccessToken) {
        try {
          // Proactively refresh the access token
          const refreshToken = tokenManager.getRefreshToken();
          if (refreshToken) {
            const response = await authApi.refreshToken(refreshToken);
            const { accessToken, refreshToken: newRefreshToken } = response.data;
            tokenManager.setTokens(accessToken, newRefreshToken);
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
          tokenManager.clearTokens();
    
    // Redirect to home page after logout
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
          setIsLoading(false);
          return;
        }
      }

      // Now fetch user profile if we have a session
      if (tokenManager.hasSession()) {
        try {
          await refreshUser();
          await refreshWallet();
        } catch (error) {
          console.error('Failed to load user profile:', error);
          tokenManager.clearTokens();
    
    // Redirect to home page after logout
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [refreshUser, refreshWallet]);

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    const { accessToken, refreshToken, user: userData } = response.data;

    tokenManager.setTokens(accessToken, refreshToken);
    setUser(userData);

    await refreshWallet();
  };

  const register = async (data: RegisterData) => {
    const response = await authApi.register(data);
    const { accessToken, refreshToken, user: userData } = response.data;

    tokenManager.setTokens(accessToken, refreshToken);
    setUser(userData);

    await refreshWallet();
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore errors on logout
    }
    tokenManager.clearTokens();
    
    // Redirect to home page after logout
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
    setUser(null);
    setWallet(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        wallet,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        refreshWallet,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
