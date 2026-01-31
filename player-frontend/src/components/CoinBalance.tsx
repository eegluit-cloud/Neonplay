import { useWallet } from '@/contexts/AppModeContext';
import { cn } from '@/lib/utils';
import { DollarSign, Bitcoin, Wallet } from 'lucide-react';
import { useRef, useState } from 'react';

// Currency configuration
const CURRENCIES = {
  USD: { symbol: '$', icon: DollarSign, color: 'text-green-400', bgColor: 'bg-green-500/20', decimals: 2 },
  EUR: { symbol: '€', icon: DollarSign, color: 'text-blue-400', bgColor: 'bg-blue-500/20', decimals: 2 },
  GBP: { symbol: '£', icon: DollarSign, color: 'text-purple-400', bgColor: 'bg-purple-500/20', decimals: 2 },
  CAD: { symbol: 'C$', icon: DollarSign, color: 'text-red-400', bgColor: 'bg-red-500/20', decimals: 2 },
  AUD: { symbol: 'A$', icon: DollarSign, color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', decimals: 2 },
  USDC: { symbol: 'USDC', icon: DollarSign, color: 'text-blue-400', bgColor: 'bg-blue-500/20', decimals: 2 },
  USDT: { symbol: 'USDT', icon: DollarSign, color: 'text-emerald-400', bgColor: 'bg-emerald-500/20', decimals: 2 },
  BTC: { symbol: '₿', icon: Bitcoin, color: 'text-orange-400', bgColor: 'bg-orange-500/20', decimals: 8 },
  ETH: { symbol: 'Ξ', icon: Wallet, color: 'text-indigo-400', bgColor: 'bg-indigo-500/20', decimals: 6 },
  SOL: { symbol: 'SOL', icon: Wallet, color: 'text-purple-400', bgColor: 'bg-purple-500/20', decimals: 4 },
  DOGE: { symbol: 'Ð', icon: Wallet, color: 'text-amber-400', bgColor: 'bg-amber-500/20', decimals: 4 },
} as const;

type CurrencyCode = keyof typeof CURRENCIES;

interface CoinBalanceProps {
  variant?: 'header' | 'compact' | 'full';
  showDropdown?: boolean;
  className?: string;
  onFlash?: boolean;
}

export function CoinBalance({ variant = 'header', className, onFlash }: CoinBalanceProps) {
  const { balances, primaryCurrency, setPrimaryCurrency } = useWallet();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentCurrency = (primaryCurrency || 'USD') as CurrencyCode;
  const currencyConfig = CURRENCIES[currentCurrency];
  const currentBalance = balances?.[currentCurrency] || 0;
  const Icon = currencyConfig.icon;

  const formatBalance = (balance: number, currency: CurrencyCode) => {
    const config = CURRENCIES[currency];
    if (balance >= 1000000) {
      return `${(balance / 1000000).toFixed(2)}M`;
    }
    if (balance >= 1000) {
      return `${(balance / 1000).toFixed(2)}K`;
    }
    return balance.toLocaleString('en-US', {
      minimumFractionDigits: Math.min(config.decimals, 2),
      maximumFractionDigits: Math.min(config.decimals, 4)
    });
  };

  const handleCurrencyChange = (currency: CurrencyCode) => {
    setPrimaryCurrency(currency);
    setIsDropdownOpen(false);
  };

  // Get non-zero balances for display
  const nonZeroBalances = Object.entries(balances || {})
    .filter(([_, balance]) => (balance as number) > 0)
    .map(([currency, balance]) => ({ currency: currency as CurrencyCode, balance: balance as number }));

  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <div className={cn("flex items-center gap-1 px-2 py-1 rounded-lg", currencyConfig.bgColor)}>
          <Icon className={cn("w-3 h-3", currencyConfig.color)} />
          <span className={cn(
            "text-xs font-bold tabular-nums transition-all",
            currencyConfig.color,
            onFlash && "scale-110"
          )}>
            {formatBalance(currentBalance, currentCurrency)}
          </span>
          <span className={cn("text-xs font-medium", currencyConfig.color)}>
            {currentCurrency}
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={cn("space-y-3", className)}>
        {/* Primary Currency Balance */}
        <div className={cn(
          "flex items-center justify-between p-3 border rounded-xl",
          currencyConfig.bgColor,
          "border-current/30"
        )}>
          <div className="flex items-center gap-2">
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", currencyConfig.bgColor.replace('/20', ''))}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{currentCurrency} Balance</p>
              <p className={cn("text-lg font-bold tabular-nums", currencyConfig.color)}>
                {currencyConfig.symbol} {formatBalance(currentBalance, currentCurrency)}
              </p>
            </div>
          </div>
        </div>

        {/* Other Non-Zero Balances */}
        {nonZeroBalances
          .filter(({ currency }) => currency !== currentCurrency)
          .slice(0, 3)
          .map(({ currency, balance }) => {
            const config = CURRENCIES[currency];
            const CurrencyIcon = config.icon;
            return (
              <div
                key={currency}
                className={cn(
                  "flex items-center justify-between p-3 border rounded-xl cursor-pointer hover:opacity-80 transition-opacity",
                  config.bgColor,
                  "border-current/30"
                )}
                onClick={() => handleCurrencyChange(currency)}
              >
                <div className="flex items-center gap-2">
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", config.bgColor.replace('/20', ''))}>
                    <CurrencyIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{currency} Balance</p>
                    <p className={cn("text-lg font-bold tabular-nums", config.color)}>
                      {config.symbol} {formatBalance(balance, currency)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    );
  }

  // Header variant - Dropdown style with currency selection
  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center h-9 rounded-full border border-border/40 bg-[#2a2a2a] overflow-hidden px-3 gap-2 hover:bg-[#3a3a3a] transition-colors"
      >
        {/* Currency Icon */}
        <div className={cn("w-6 h-6 rounded-full flex items-center justify-center", currencyConfig.bgColor)}>
          <Icon className={cn("w-3 h-3", currencyConfig.color)} />
        </div>

        {/* Balance Amount */}
        <div className="flex items-center gap-1.5">
          <span className={cn(
            "font-semibold text-base tabular-nums leading-none transition-all text-foreground",
            onFlash && "scale-110"
          )}>
            {formatBalance(currentBalance, currentCurrency)}
          </span>
          <span className={cn("text-sm font-semibold", currencyConfig.color)}>
            {currentCurrency}
          </span>
        </div>

        {/* Dropdown Arrow */}
        <svg
          className={cn(
            "w-3 h-3 text-muted-foreground transition-transform",
            isDropdownOpen && "rotate-180"
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-[#2a2a2a] border border-border/40 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="p-2 space-y-1">
            <p className="px-2 py-1 text-xs text-muted-foreground uppercase tracking-wider">
              Select Currency
            </p>

            {/* Fiat Currencies */}
            <div className="border-b border-border/20 pb-2 mb-2">
              <p className="px-2 py-1 text-xs text-muted-foreground">Fiat</p>
              {(['USD', 'EUR', 'GBP', 'CAD', 'AUD'] as CurrencyCode[]).map((currency) => {
                const config = CURRENCIES[currency];
                const balance = balances?.[currency] || 0;
                const CurrencyIcon = config.icon;
                return (
                  <button
                    key={currency}
                    onClick={() => handleCurrencyChange(currency)}
                    className={cn(
                      "w-full flex items-center justify-between px-2 py-2 rounded-lg hover:bg-white/5 transition-colors",
                      currentCurrency === currency && "bg-white/10"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn("w-6 h-6 rounded-full flex items-center justify-center", config.bgColor)}>
                        <CurrencyIcon className={cn("w-3 h-3", config.color)} />
                      </div>
                      <span className="text-sm font-medium">{currency}</span>
                    </div>
                    <span className={cn("text-sm tabular-nums", config.color)}>
                      {formatBalance(balance, currency)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Crypto Currencies */}
            <div>
              <p className="px-2 py-1 text-xs text-muted-foreground">Crypto</p>
              {(['USDC', 'USDT', 'BTC', 'ETH', 'SOL', 'DOGE'] as CurrencyCode[]).map((currency) => {
                const config = CURRENCIES[currency];
                const balance = balances?.[currency] || 0;
                const CurrencyIcon = config.icon;
                return (
                  <button
                    key={currency}
                    onClick={() => handleCurrencyChange(currency)}
                    className={cn(
                      "w-full flex items-center justify-between px-2 py-2 rounded-lg hover:bg-white/5 transition-colors",
                      currentCurrency === currency && "bg-white/10"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn("w-6 h-6 rounded-full flex items-center justify-center", config.bgColor)}>
                        <CurrencyIcon className={cn("w-3 h-3", config.color)} />
                      </div>
                      <span className="text-sm font-medium">{currency}</span>
                    </div>
                    <span className={cn("text-sm tabular-nums", config.color)}>
                      {formatBalance(balance, currency)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
