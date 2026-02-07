import { useBetslip, BetSelection } from '@/contexts/BetslipContext';
import { cn } from '@/lib/utils';

interface OddsButtonProps {
  eventId: string;
  matchName: string;
  league: string;
  market: '1' | 'draw' | '2';
  odds: number;
  className?: string;
  homeTeam?: { name: string; logoUrl?: string };
  awayTeam?: { name: string; logoUrl?: string };
}

export function OddsButton({ 
  eventId, 
  matchName, 
  league, 
  market, 
  odds, 
  className,
  homeTeam,
  awayTeam,
}: OddsButtonProps) {
  const { addSelection, selections, openBetslip, quickBetEnabled } = useBetslip();

  const isSelected = selections.some(
    (s) => s.eventId === eventId && s.market === market
  );

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const selection: BetSelection = {
      id: `${eventId}-${market}`,
      eventId,
      matchName,
      market,
      marketType: '1x2',
      odds,
      league,
      homeTeam,
      awayTeam,
    };

    addSelection(selection);

    if (!quickBetEnabled) {
      openBetslip();
    }
  };

  const getMarketLabel = () => {
    switch (market) {
      case '1': return '1';
      case 'draw': return 'draw';
      case '2': return '2';
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex-1 transition-all rounded-md sm:rounded-lg h-9 sm:h-10 px-1.5 sm:px-2 flex items-center justify-between min-w-0",
        isSelected
          ? "bg-amber-600 border border-amber-500"
          : "bg-white/5 hover:bg-white/10 border border-white/10",
        className
      )}
    >
      <span className={cn(
        "text-[10px] sm:text-xs",
        isSelected ? "text-white/80" : "text-gray-400"
      )}>
        {getMarketLabel()}
      </span>
      <span className={cn(
        "font-bold text-xs sm:text-sm font-mono",
        isSelected ? "text-white" : "text-white"
      )}>
        {odds.toFixed(2)}
      </span>
    </button>
  );
}
