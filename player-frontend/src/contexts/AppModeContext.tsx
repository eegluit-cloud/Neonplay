import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AuthContext from './AuthContext';

export type CurrencyType = 'USD' | 'BTC' | 'ETH' | 'USDT';

export interface WalletActivity {
  id: string;
  type: 'deposit' | 'withdrawal' | 'stake' | 'win' | 'bonus';
  currency: CurrencyType;
  amount: number;
  timestamp: Date;
  referenceId?: string;
  status: 'pending' | 'completed' | 'failed';
  description?: string;
}

interface Wallet {
  usdBalance: number;
  btcBalance: number;
  activity: WalletActivity[];
}

interface WalletContextType {
  wallet: Wallet;
  isDemo: boolean;
  updateUSDBalance: (amount: number) => void;
  updateBTCBalance: (amount: number) => void;
  addActivity: (activity: Omit<WalletActivity, 'id' | 'timestamp'>) => void;
  refreshWallet: () => void;
  formatCurrency: (amount: number, currency: CurrencyType) => string;
  // Legacy exports for backward compatibility during migration
  gcBalance: number;
  scBalance: number;
}

const AppModeContext = createContext<WalletContextType | undefined>(undefined);

const WALLET_STORAGE_KEY = 'wallet_data';

// Demo wallet for unauthenticated users (for UI preview only)
const DEMO_WALLET: Wallet = {
  usdBalance: 1250.00,
  btcBalance: 0.0125,
  activity: []
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
            usdBalance: parsed.usdBalance ?? parsed.gcBalance ?? DEMO_WALLET.usdBalance,
            btcBalance: parsed.btcBalance ?? (parsed.scBalance ? parsed.scBalance / 10000 : DEMO_WALLET.btcBalance),
            activity: parsed.activity?.map((a: WalletActivity & { timestamp: string }) => ({
              ...a,
              timestamp: new Date(a.timestamp)
            })) || []
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
        usdBalance: authContext.wallet.gcBalance, // Map gcBalance to USD for now
        btcBalance: authContext.wallet.scBalance / 10000, // Map scBalance to BTC
        activity: localWallet.activity
      }
    : localWallet;

  // Persist local wallet to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && !authContext?.isAuthenticated) {
      localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(localWallet));
    }
  }, [localWallet, authContext?.isAuthenticated]);

  const updateUSDBalance = (amount: number) => {
    if (authContext?.isAuthenticated) {
      authContext.refreshWallet();
    } else {
      setLocalWallet(prev => ({
        ...prev,
        usdBalance: Math.max(0, prev.usdBalance + amount)
      }));
    }
  };

  const updateBTCBalance = (amount: number) => {
    if (authContext?.isAuthenticated) {
      authContext.refreshWallet();
    } else {
      setLocalWallet(prev => ({
        ...prev,
        btcBalance: Math.max(0, prev.btcBalance + amount)
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
              usdBalance: parsed.usdBalance ?? DEMO_WALLET.usdBalance,
              btcBalance: parsed.btcBalance ?? DEMO_WALLET.btcBalance,
              activity: parsed.activity?.map((a: WalletActivity & { timestamp: string }) => ({
                ...a,
                timestamp: new Date(a.timestamp)
              })) || []
            });
          } catch {
            // Ignore
          }
        }
      }
    }
  };

  const formatCurrency = (amount: number, currency: CurrencyType): string => {
    switch (currency) {
      case 'USD':
      case 'USDT':
        return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case 'BTC':
        return `${amount.toFixed(6)} BTC`;
      case 'ETH':
        return `${amount.toFixed(4)} ETH`;
      default:
        return amount.toString();
    }
  };

  const isDemo = !authContext?.isAuthenticated;

  return (
    <AppModeContext.Provider
      value={{
        wallet,
        isDemo,
        updateUSDBalance,
        updateBTCBalance,
        addActivity,
        refreshWallet,
        formatCurrency,
        // Legacy compatibility
        gcBalance: wallet.usdBalance,
        scBalance: wallet.btcBalance * 10000
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
  // Return a compatibility object for components still using mode
  return {
    ...context,
    mode: 'casino' as const,
    setMode: () => {}
  };
}

export function useWallet() {
  const context = useContext(AppModeContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within an AppModeProvider');
  }
  return {
    usdBalance: context.wallet.usdBalance,
    btcBalance: context.wallet.btcBalance,
    activity: context.wallet.activity,
    isDemo: context.isDemo,
    updateUSDBalance: context.updateUSDBalance,
    updateBTCBalance: context.updateBTCBalance,
    addActivity: context.addActivity,
    refresh: context.refreshWallet,
    formatCurrency: context.formatCurrency,
    // Legacy compatibility for GC/SC references
    gcBalance: context.gcBalance,
    scBalance: context.scBalance,
    updateGCBalance: context.updateUSDBalance,
    updateSCBalance: context.updateBTCBalance,
    formatCoins: (amount: number, type: 'GC' | 'SC') =>
      type === 'GC' ? context.formatCurrency(amount, 'USD') : context.formatCurrency(amount / 10000, 'BTC')
  };
}
