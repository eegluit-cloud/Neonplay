import { Menu, Zap, ChevronUp } from 'lucide-react';
import { useBetslip } from '@/contexts/BetslipContext';
import { cn } from '@/lib/utils';

export function BetslipBar() {
  const { selections, quickBetEnabled, toggleQuickBet, toggleBetslip, isOpen } = useBetslip();
  const count = selections.length;

  return (
    <div 
      className={cn(
        "fixed z-50 transition-all duration-300",
        // Mobile: compact bottom bar
        "bottom-16 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4",
        // Tablet/Desktop: right side positioning
        "md:left-auto md:right-6 md:bottom-6 md:w-[380px]",
        // Hide when panel is open on mobile
        isOpen && "sm:opacity-100 opacity-0 pointer-events-none sm:pointer-events-auto"
      )}
    >
      <button
        onClick={toggleBetslip}
        className="w-full bg-cyan-600 hover:bg-cyan-700 transition-colors rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between shadow-2xl shadow-cyan-900/30"
      >
        {/* Left: Menu icon */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/10 rounded-md sm:rounded-lg flex items-center justify-center">
            <Menu className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          </div>
          
          {/* Center: Betslip + count */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-white font-bold text-sm sm:text-base">Betslip</span>
            {count > 0 && (
              <span className="min-w-[18px] sm:min-w-[20px] h-4.5 sm:h-5 bg-white text-cyan-600 text-[10px] sm:text-xs px-1 sm:px-1.5 rounded-full font-bold flex items-center justify-center">
                {count}
              </span>
            )}
            <ChevronUp className={cn(
              "w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/70 transition-transform",
              isOpen && "rotate-180"
            )} />
          </div>
        </div>

        {/* Right: Quick Bet toggle */}
        <div 
          className="flex items-center gap-1.5 sm:gap-2"
          onClick={(e) => {
            e.stopPropagation();
            toggleQuickBet();
          }}
        >
          <span className="text-white/80 text-[10px] sm:text-xs font-medium hidden sm:block">QUICK BET</span>
          <div className={cn(
            "w-10 sm:w-12 h-5 sm:h-6 rounded-full relative transition-colors flex items-center px-0.5 sm:px-1",
            quickBetEnabled ? "bg-white" : "bg-white/20"
          )}>
            <Zap className={cn(
              "w-2.5 h-2.5 sm:w-3 sm:h-3 absolute left-1 sm:left-1.5 transition-opacity",
              quickBetEnabled ? "text-cyan-600 opacity-100" : "text-white opacity-50"
            )} />
            <div className={cn(
              "w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full transition-all absolute",
              quickBetEnabled 
                ? "bg-cyan-600 right-0.5 sm:right-1" 
                : "bg-white right-5 sm:right-6"
            )} />
          </div>
        </div>
      </button>
    </div>
  );
}
