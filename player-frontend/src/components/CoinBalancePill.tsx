import { useState, useRef, useEffect } from 'react';
import { DollarSign, Bitcoin, Coins, Banknote, ChevronDown } from 'lucide-react';
import { useWallet, type Currency } from '@/contexts/AppModeContext';
import { cn } from '@/lib/utils';

interface CoinBalancePillProps {
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function CoinBalancePill({
  onClick,
  className,
  size = 'md'
}: CoinBalancePillProps) {
  const { balances } = useWallet();
  const [activeWalletIndex, setActiveWalletIndex] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  // All available wallets with their currencies
  const wallets = [
    {
      balance: balances.USD || 0,
      currency: "USD" as Currency,
      icon: DollarSign,
      gradient: "from-green-400 to-green-600",
      formatBalance: (bal: number) => `$${bal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    {
      balance: balances.EUR || 0,
      currency: "EUR" as Currency,
      icon: Banknote,
      gradient: "from-purple-400 to-purple-600",
      formatBalance: (bal: number) => `€${bal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    {
      balance: balances.GBP || 0,
      currency: "GBP" as Currency,
      icon: Banknote,
      gradient: "from-indigo-400 to-indigo-600",
      formatBalance: (bal: number) => `£${bal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    {
      balance: balances.CAD || 0,
      currency: "CAD" as Currency,
      icon: Banknote,
      gradient: "from-red-400 to-red-600",
      formatBalance: (bal: number) => `C$${bal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    {
      balance: balances.AUD || 0,
      currency: "AUD" as Currency,
      icon: Banknote,
      gradient: "from-yellow-400 to-yellow-600",
      formatBalance: (bal: number) => `A$${bal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    {
      balance: balances.PHP || 0,
      currency: "PHP" as Currency,
      icon: Banknote,
      gradient: "from-blue-400 to-blue-600",
      formatBalance: (bal: number) => `₱${bal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    {
      balance: balances.INR || 0,
      currency: "INR" as Currency,
      icon: Banknote,
      gradient: "from-orange-300 to-orange-500",
      formatBalance: (bal: number) => `₹${bal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    {
      balance: balances.THB || 0,
      currency: "THB" as Currency,
      icon: Banknote,
      gradient: "from-pink-400 to-pink-600",
      formatBalance: (bal: number) => `฿${bal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    {
      balance: balances.CNY || 0,
      currency: "CNY" as Currency,
      icon: Banknote,
      gradient: "from-red-500 to-red-700",
      formatBalance: (bal: number) => `¥${bal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    {
      balance: balances.JPY || 0,
      currency: "JPY" as Currency,
      icon: Banknote,
      gradient: "from-rose-400 to-rose-600",
      formatBalance: (bal: number) => `¥${bal.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    },
    {
      balance: balances.USDC || 0,
      currency: "USDC" as Currency,
      icon: Coins,
      gradient: "from-cyan-400 to-cyan-600",
      formatBalance: (bal: number) => `${bal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`
    },
    {
      balance: balances.USDT || 0,
      currency: "USDT" as Currency,
      icon: Coins,
      gradient: "from-teal-400 to-teal-600",
      formatBalance: (bal: number) => `${bal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`
    },
    {
      balance: balances.BTC || 0,
      currency: "BTC" as Currency,
      icon: Bitcoin,
      gradient: "from-orange-400 to-orange-600",
      formatBalance: (bal: number) => `${bal.toFixed(6)} BTC`
    },
    {
      balance: balances.ETH || 0,
      currency: "ETH" as Currency,
      icon: Coins,
      gradient: "from-slate-400 to-slate-600",
      formatBalance: (bal: number) => `${bal.toFixed(4)} ETH`
    },
    {
      balance: balances.SOL || 0,
      currency: "SOL" as Currency,
      icon: Coins,
      gradient: "from-violet-400 to-violet-600",
      formatBalance: (bal: number) => `${bal.toFixed(4)} SOL`
    },
    {
      balance: balances.DOGE || 0,
      currency: "DOGE" as Currency,
      icon: Coins,
      gradient: "from-amber-400 to-amber-600",
      formatBalance: (bal: number) => `${bal.toFixed(2)} DOGE`
    }
  ];

  const currentWallet = wallets[activeWalletIndex];

  // Switch function - cycles through all currencies
  const switchWallet = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setActiveWalletIndex(prev => (prev + 1) % wallets.length);
      setIsAnimating(false);
    }, 150);
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'px-1.5 py-0.5',
      toggle: 'w-[60px] h-8',
      slider: 'w-7 h-7',
      sliderIcon: 'w-3.5 h-3.5',
      bgIcon: 'w-6 h-6',
      bgIconInner: 'w-3 h-3',
      translateX: 'translate-x-[26px]',
      amount: 'text-sm',
      label: 'text-xs'
    },
    md: {
      container: 'px-1.5 py-0.5',
      toggle: 'w-14 h-8 lg:w-16 lg:h-9',
      slider: 'w-7 h-7 lg:w-8 lg:h-8',
      sliderIcon: 'w-3.5 h-3.5 lg:w-4 lg:h-4',
      bgIcon: 'w-6 h-6 lg:w-7 lg:h-7',
      bgIconInner: 'w-3 h-3 lg:w-3.5 lg:h-3.5',
      translateX: 'translate-x-6 lg:translate-x-7',
      amount: 'text-base md:text-lg',
      label: 'text-sm'
    },
    lg: {
      container: 'px-2 py-1',
      toggle: 'w-18 h-10',
      slider: 'w-9 h-9',
      sliderIcon: 'w-4 h-4',
      bgIcon: 'w-8 h-8',
      bgIconInner: 'w-4 h-4',
      translateX: 'translate-x-8',
      amount: 'text-lg md:text-xl',
      label: 'text-base'
    }
  };

  const config = sizeConfig[size];

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className={cn(
          "flex items-center bg-white/5 backdrop-blur-xl rounded-full border border-white/10 shadow-lg shadow-black/20 cursor-pointer",
          config.container,
          className
        )}
        onClick={(e) => {
          e.stopPropagation();
          setIsDropdownOpen(!isDropdownOpen);
          onClick?.();
        }}
      >
        {/* Currency Icon */}
        <div className="flex items-center mr-2">
          <div
            className={cn(
              `relative bg-gradient-to-br ${currentWallet.gradient} rounded-full shadow-md flex items-center justify-center transition-all duration-300 ease-out transform backdrop-blur-sm border border-white/30`,
              config.slider
            )}
          >
            <currentWallet.icon className={cn("text-white", config.sliderIcon)} />
          </div>
        </div>

        {/* Balance Display */}
        <div className={cn(
          "min-w-[90px] md:min-w-[120px] text-right transition-opacity duration-300",
          isAnimating ? 'opacity-50' : 'opacity-100'
        )}>
          <span className={cn(
            "text-white font-bold tracking-tight tabular-nums",
            config.amount
          )}>
            {currentWallet.formatBalance(currentWallet.balance)}
          </span>
        </div>

        {/* Dropdown Arrow */}
        <ChevronDown
          className={cn(
            "ml-2 text-white/70 transition-transform duration-200",
            isDropdownOpen && "rotate-180",
            size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'
          )}
        />
      </div>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute top-full mt-2 right-0 bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl overflow-hidden z-50 min-w-[280px]">
          <div className="p-2">
            <div className="text-xs text-muted-foreground font-semibold px-3 py-2 border-b border-border">
              All Currencies
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {wallets.map((wallet, index) => (
                <button
                  key={wallet.currency}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveWalletIndex(index);
                    setIsDropdownOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors hover:bg-accent/50",
                    activeWalletIndex === index && "bg-accent"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      `w-8 h-8 bg-gradient-to-br ${wallet.gradient} rounded-full flex items-center justify-center shadow-md`
                    )}>
                      <wallet.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-foreground">{wallet.currency}</span>
                  </div>
                  <span className="font-bold text-foreground tabular-nums">
                    {wallet.formatBalance(wallet.balance)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
