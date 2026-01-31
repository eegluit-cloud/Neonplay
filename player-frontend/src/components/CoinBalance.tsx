import { useAppMode, useWallet } from '@/contexts/AppModeContext';
import { cn } from '@/lib/utils';
import { Coins, Trophy } from 'lucide-react';
import { useRef } from 'react';
import { DiamondIcon } from '@/components/icons/DiamondIcon';

interface CoinBalanceProps {
  variant?: 'header' | 'compact' | 'full';
  showDropdown?: boolean;
  className?: string;
  onFlash?: boolean;
}

export function CoinBalance({ variant = 'header', className, onFlash }: CoinBalanceProps) {
  const { mode, setMode } = useAppMode();
  const { gcBalance, scBalance } = useWallet();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleToggle = (newMode: 'social' | 'sweepstakes') => {
    setMode(newMode);
  };

  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        {mode === 'sweepstakes' ? (
          <>
            <div className="flex items-center gap-1 px-2 py-1 bg-cyan-500/20 rounded-lg">
              <Trophy className="w-3 h-3 text-cyan-400" />
              <span className={cn(
                "text-xs font-bold text-cyan-400 tabular-nums transition-all",
                onFlash && "scale-110"
              )}>
                {scBalance.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-amber-500/20 rounded-lg">
              <Coins className="w-3 h-3 text-amber-400" />
              <span className="text-xs font-bold text-amber-400 tabular-nums">
                {(gcBalance / 1000).toFixed(0)}K
              </span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-1 px-2 py-1 bg-amber-500/20 rounded-lg">
            <Coins className="w-3 h-3 text-amber-400" />
            <span className={cn(
              "text-xs font-bold text-amber-400 tabular-nums transition-all",
              onFlash && "scale-110"
            )}>
              {gcBalance.toLocaleString()}
            </span>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={cn("space-y-3", className)}>
        {mode === 'sweepstakes' && (
          <div className="flex items-center justify-between p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Social Coins</p>
                <p className="text-lg font-bold text-cyan-400 tabular-nums">
                  SC {scBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
              <Coins className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Gold Coins</p>
              <p className="text-lg font-bold text-amber-400 tabular-nums">
                GC {gcBalance.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Header variant - Toggle style with swipe animation (exact design from image)
  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <div className="flex items-center h-9 rounded-full border border-border/40 bg-[#2a2a2a] overflow-hidden pl-0.5 pr-4 gap-3">
        {/* Coin Type Toggle with Swipe */}
        <div className="relative flex items-center bg-[#3a3a3a] rounded-full p-0.5 gap-0">
          {/* Sliding Background */}
          <div 
            className={cn(
              "absolute w-7 h-7 rounded-full transition-all duration-300 ease-out",
              mode === 'social' ? "left-0.5 bg-amber-500" : "left-[30px] bg-transparent"
            )}
          />
          
          {/* GC Button - Gold coin with coin icon design */}
          <button
            onClick={() => handleToggle('social')}
            className="relative z-10 w-7 h-7 rounded-full flex items-center justify-center transition-all"
          >
            {/* Coin icon SVG - two circles like in the image */}
            <svg 
              className={cn(
                "w-4 h-4 transition-colors",
                mode === 'social' ? "text-black" : "text-muted-foreground"
              )}
              viewBox="0 0 24 24" 
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="9" cy="12" r="6" />
              <circle cx="15" cy="12" r="6" />
            </svg>
          </button>
          
          {/* SC Button - Diamond icon */}
          <button
            onClick={() => handleToggle('sweepstakes')}
            className="relative z-10 w-7 h-7 rounded-full flex items-center justify-center transition-all"
          >
            <DiamondIcon 
              className={cn(
                "transition-colors",
                mode === 'sweepstakes' ? "text-blue-400" : "text-muted-foreground"
              )}
              size="sm"
            />
          </button>
        </div>
        
        {/* Balance Amount */}
        <div className="flex items-center gap-1.5">
          <span className={cn(
            "font-semibold text-base tabular-nums leading-none transition-all text-foreground",
            onFlash && "scale-110"
          )}>
            {mode === 'sweepstakes' 
              ? scBalance.toLocaleString('en-US', { minimumFractionDigits: 0 })
              : gcBalance.toLocaleString('en-US', { minimumFractionDigits: 0 })
            }
          </span>
          <span className="text-sm font-semibold text-amber-500">
            {mode === 'sweepstakes' ? 'SC' : 'GC'}
          </span>
        </div>
      </div>
    </div>
  );
}
