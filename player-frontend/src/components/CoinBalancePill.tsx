import { useState } from 'react';
import { DollarSign, Bitcoin } from 'lucide-react';
import { useWallet } from '@/contexts/AppModeContext';
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
  const { usdBalance, btcBalance } = useWallet();
  const [activeWallet, setActiveWallet] = useState<0 | 1>(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Wallet data - USD with DollarSign (green), BTC with Bitcoin (orange)
  const wallets = [
    {
      balance: usdBalance,
      currency: "USD" as const,
      icon: DollarSign,
      gradient: "from-green-400 to-green-600",
      formatBalance: (bal: number) => `$${bal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    {
      balance: btcBalance,
      currency: "BTC" as const,
      icon: Bitcoin,
      gradient: "from-orange-400 to-orange-600",
      formatBalance: (bal: number) => `${bal.toFixed(6)} BTC`
    }
  ];

  const currentWallet = wallets[activeWallet];

  // Switch function
  const switchWallet = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setActiveWallet(prev => prev === 0 ? 1 : 0);
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
    <div
      className={cn(
        "flex items-center bg-white/5 backdrop-blur-xl rounded-full border border-white/10 shadow-lg shadow-black/20",
        config.container,
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {/* Toggle Switch */}
      <div className="flex items-center mr-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            switchWallet();
          }}
          className={cn(
            "relative w-12 h-6 bg-white/10 backdrop-blur-md rounded-full p-0.5 transition-all duration-300 hover:bg-white/15 border border-white/20",
            config.toggle
          )}
        >
          {/* Background Icons - Dollar on left, Bitcoin on right */}
          <div className="absolute inset-0.5 flex items-center justify-between pointer-events-none">
            <div className={cn(
              "rounded-full flex items-center justify-center transition-all duration-300",
              config.bgIcon,
              activeWallet === 0 ? 'opacity-0' : 'opacity-25'
            )}>
              <DollarSign className={cn("text-green-300", config.bgIconInner)} />
            </div>
            <div className={cn(
              "rounded-full flex items-center justify-center transition-all duration-300",
              config.bgIcon,
              activeWallet === 1 ? 'opacity-0' : 'opacity-25'
            )}>
              <Bitcoin className={cn("text-orange-300", config.bgIconInner)} />
            </div>
          </div>

          {/* Slider */}
          <div
            className={cn(
              `w-5 h-5 bg-gradient-to-br ${currentWallet.gradient} rounded-full shadow-md flex items-center justify-center transition-all duration-300 ease-out transform backdrop-blur-sm border border-white/30`,
              config.slider,
              activeWallet === 0 ? 'translate-x-0' : config.translateX,
              isAnimating ? 'scale-105' : 'scale-100'
            )}
          >
            <currentWallet.icon className={cn("text-white", config.sliderIcon)} />
          </div>
        </button>
      </div>

      {/* Balance Display - Fixed width to prevent layout shift */}
      <div className={cn(
        "min-w-[90px] md:min-w-[100px] text-right transition-opacity duration-300",
        isAnimating ? 'opacity-50' : 'opacity-100'
      )}>
        <span className={cn(
          "text-white font-bold tracking-tight tabular-nums",
          config.amount
        )}>
          {currentWallet.formatBalance(currentWallet.balance)}
        </span>
      </div>
    </div>
  );
}
