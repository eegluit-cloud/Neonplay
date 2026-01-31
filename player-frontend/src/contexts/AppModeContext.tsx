import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AuthContext from './AuthContext';

// Supported currencies
export type FiatCurrency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';
export type CryptoCurrency = 'USDC' | 'USDT' | 'BTC' | 'ETH' | 'SOL' | 'DOGE';
export type Currency = FiatCurrency | CryptoCurrency;

export interface WalletActivity {
  id: string;
  type: 'deposit' | 'withdrawal' | 'stake' | 'win' | 'bonus' | 'transfer' | 'conversion';
  currency: Currency;
  amount: number;
  usdcAmount: number; // USDC equivalent for unified tracking
  timestamp: Date;
  referenceId?: string;
  status: 'pending' | 'confirming' | 'completed' | 'failed';
  description?: string;
  txHash?: string;
}

export interface WalletBalances {
  USD: number;
  EUR: number;
  GBP: number;
  CAD: number;
  AUD: number;
  USDC: number;
  USDT: number;
  BTC: number;
  ETH: number;
  SOL: number;
  DOGE: number;
}

interface Wallet {
  balances: WalletBalances;
  primaryCurrency: Currency;
  activity: WalletActivity[];
  lifetimeStats: {
    deposited: number;
    withdrawn: number;
    wagered: number;
    won: number;
    bonuses: number;
  };
}

interface WalletContextType {
  wallet: Wallet;
  balances: WalletBalances;
  primaryCurrency: Currency;
  isDemo: boolean;
  updateBalance: (currency: Currency, amount: number) => void;
  setPrimaryCurrency: (currency: Currency) => void;
  addActivity: (activity: Omit<WalletActivity, 'id' | 'timestamp'>) => void;
  refreshWallet: () => void;
  formatCurrency: (amount: number, currency: Currency) => string;
  getUsdcEquivalent: (amount: number, currency: Currency) => number;
}

const AppModeContext = createContext<WalletContextType | undefined>(undefined);

const WALLET_STORAGE_KEY = 'wallet_data_v2';

// Currency display configuration
const CURRENCY_CONFIG: Record<Currency, { symbol: string; decimals: number }> = {
  USD: { symbol: '$', decimals: 2 },
  EUR: { symbol: '€', decimals: 2 },
  GBP: { symbol: '£', decimals: 2 },
  CAD: { symbol: 'C$', decimals: 2 },
  AUD: { symbol: 'A$', decimals: 2 },
  USDC: { symbol: '', decimals: 2 },
  USDT: { symbol: '', decimals: 2 },
  BTC: { symbol: '₿', decimals: 8 },
  ETH: { symbol: 'Ξ', decimals: 6 },
  SOL: { symbol: '', decimals: 4 },
  DOGE: { symbol: 'Ð', decimals: 4 },
};

// Approximate exchange rates to USDC (in production, fetch from API)
const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.27,
  CAD: 0.74,
  AUD: 0.65,
  USDC: 1,
  USDT: 1,
  BTC: 43000,
  ETH: 2200,
  SOL: 100,
  DOGE: 0.08,
};

// Demo wallet for unauthenticated users
const DEMO_WALLET: Wallet = {
  balances: {
    USD: 1000,
    EUR: 0,
    GBP: 0,
    CAD: 0,
    AUD: 0,
    USDC: 500,
    USDT: 0,
    BTC: 0.01,
    ETH: 0.5,
    SOL: 10,
    DOGE: 1000,
  },
  primaryCurrency: 'USD',
  activity: [],
  lifetimeStats: {
    deposited: 0,
    withdrawn: 0,
    wagered: 0,
    won: 0,
    bonuses: 0,
  },
};

export function AppModeProvider({ children }: { children: ReactNode }) {
  const authContext = useContext(AuthContext);

  const [localWallet, setLocalWallet] = useState<Wallet>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(WALLET_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          return {
            balances: parsed.balances || DEMO_WALLET.balances,
            primaryCurrency: parsed.primaryCurrency || 'USD',
            activity: parsed.activity?.map((a: WalletActivity & { timestamp: string }) => ({
              ...a,
              timestamp: new Date(a.timestamp)
            })) || [],
            lifetimeStats: parsed.lifetimeStats || DEMO_WALLET.lifetimeStats,
          };
        } catch {
          // Fall through to default
        }
      }
    }
    return DEMO_WALLET;
  });

  // Use real wallet data if authenticated, otherwise use local/mock wallet
  const wallet: Wallet = authContext?.wallet
    ? {
        balances: authContext.wallet.balances || DEMO_WALLET.balances,
        primaryCurrency: authContext.wallet.primaryCurrency || 'USD',
        activity: localWallet.activity,
        lifetimeStats: authContext.wallet.lifetimeStats || DEMO_WALLET.lifetimeStats,
      }
    : localWallet;

  // Persist local wallet to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && !authContext?.isAuthenticated) {
      localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(localWallet));
    }
  }, [localWallet, authContext?.isAuthenticated]);

  const updateBalance = (currency: Currency, amount: number) => {
    if (authContext?.isAuthenticated) {
      authContext.refreshWallet();
    } else {
      setLocalWallet(prev => ({
        ...prev,
        balances: {
          ...prev.balances,
          [currency]: Math.max(0, prev.balances[currency] + amount)
        }
      }));
    }
  };

  const setPrimaryCurrency = (currency: Currency) => {
    if (authContext?.isAuthenticated) {
      // API call would go here
      authContext.refreshWallet();
    } else {
      setLocalWallet(prev => ({
        ...prev,
        primaryCurrency: currency
      }));
    }
  };

  const addActivity = (activity: Omit<WalletActivity, 'id' | 'timestamp'>) => {
    const newActivity: WalletActivity = {
      ...activity,
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };
    setLocalWallet(prev => ({
      ...prev,
      activity: [newActivity, ...prev.activity].slice(0, 100)
    }));
  };

  const refreshWallet = () => {
    if (authContext?.isAuthenticated) {
      authContext.refreshWallet();
    } else {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(WALLET_STORAGE_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setLocalWallet({
              balances: parsed.balances || DEMO_WALLET.balances,
              primaryCurrency: parsed.primaryCurrency || 'USD',
              activity: parsed.activity?.map((a: WalletActivity & { timestamp: string }) => ({
                ...a,
                timestamp: new Date(a.timestamp)
              })) || [],
              lifetimeStats: parsed.lifetimeStats || DEMO_WALLET.lifetimeStats,
            });
          } catch {
            // Ignore
          }
        }
      }
    }
  };

  const formatCurrency = (amount: number, currency: Currency): string => {
    const config = CURRENCY_CONFIG[currency];
    const formatted = amount.toLocaleString('en-US', {
      minimumFractionDigits: Math.min(config.decimals, 2),
      maximumFractionDigits: config.decimals
    });

    // For crypto with no symbol, append currency code
    if (!config.symbol) {
      return `${formatted} ${currency}`;
    }
    return `${config.symbol}${formatted}`;
  };

  const getUsdcEquivalent = (amount: number, currency: Currency): number => {
    return amount * EXCHANGE_RATES[currency];
  };

  const isDemo = !authContext?.isAuthenticated;

  return (
    <AppModeContext.Provider
      value={{
        wallet,
        balances: wallet.balances,
        primaryCurrency: wallet.primaryCurrency,
        isDemo,
        updateBalance,
        setPrimaryCurrency,
        addActivity,
        refreshWallet,
        formatCurrency,
        getUsdcEquivalent,
      }}
    >
      {children}
    </AppModeContext.Provider>
  );
}

export function useAppMode() {
  const context = useContext(AppModeContext);
  if (context === undefined) {
    throw new Error('useAppMode must be used within an AppModeProvider');
  }
  return context;
}

export function useWallet() {
  const context = useContext(AppModeContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within an AppModeProvider');
  }
  return {
    balances: context.balances,
    primaryCurrency: context.primaryCurrency,
    activity: context.wallet.activity,
    lifetimeStats: context.wallet.lifetimeStats,
    isDemo: context.isDemo,
    updateBalance: context.updateBalance,
    setPrimaryCurrency: context.setPrimaryCurrency,
    addActivity: context.addActivity,
    refresh: context.refreshWallet,
    formatCurrency: context.formatCurrency,
    getUsdcEquivalent: context.getUsdcEquivalent,
    // Helper to get balance for specific currency
    getBalance: (currency: Currency) => context.balances[currency],
    // Get total balance in USDC equivalent
    getTotalUsdcValue: () => {
      return Object.entries(context.balances).reduce((total, [currency, amount]) => {
        return total + context.getUsdcEquivalent(amount, currency as Currency);
      }, 0);
    },
  };
}
