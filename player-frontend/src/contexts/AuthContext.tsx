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

export interface Wallet {
  gcBalance: number;
  scBalance: number;
  gcLifetimeEarned: number;
  scLifetimeEarned: number;
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
      // Check if we have a session (refresh token exists)
      if (tokenManager.hasSession()) {
        try {
          await refreshUser();
          await refreshWallet();
        } catch {
          tokenManager.clearTokens();
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
