import { X } from 'lucide-react';
import { BetSelection, useBetslip } from '@/contexts/BetslipContext';
import { TeamLogo } from './TeamLogo';

interface BetslipSelectionItemProps {
  selection: BetSelection;
}

export function BetslipSelectionItem({ selection }: BetslipSelectionItemProps) {
  const { removeSelection } = useBetslip();

  const getMarketLabel = (market: string) => {
    switch (market) {
      case '1': return 'Home Win';
      case 'draw': return 'Draw';
      case '2': return 'Away Win';
      default: return market;
    }
  };

  return (
    <div className="bg-[#1e1e32] rounded-lg sm:rounded-xl p-2.5 sm:p-3 relative group">
      {/* Remove button */}
      <button
        onClick={() => removeSelection(selection.id)}
        className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 w-5 h-5 sm:w-6 sm:h-6 bg-white/10 hover:bg-red-500/20 rounded-full flex items-center justify-center transition-colors"
      >
        <X className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-400 group-hover:text-red-400" />
      </button>

      {/* Market label */}
      <div className="text-amber-400 font-semibold text-xs sm:text-sm mb-0.5 sm:mb-1">
        {getMarketLabel(selection.market)}
      </div>

      {/* Teams with logos */}
      {(selection.homeTeam || selection.awayTeam) && (
        <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1 pr-5 sm:pr-6">
          {selection.homeTeam && (
            <div className="flex items-center gap-1 sm:gap-1.5">
              <TeamLogo 
                teamName={selection.homeTeam.name} 
                logoUrl={selection.homeTeam.logoUrl}
                size="xs"
              />
              <span className="text-white text-[10px] sm:text-xs truncate max-w-[50px] sm:max-w-[60px]">
                {selection.homeTeam.name.split(' ').slice(-1)[0]}
              </span>
            </div>
          )}
          <span className="text-gray-500 text-[10px] sm:text-xs">vs</span>
          {selection.awayTeam && (
            <div className="flex items-center gap-1 sm:gap-1.5">
              <TeamLogo 
                teamName={selection.awayTeam.name} 
                logoUrl={selection.awayTeam.logoUrl}
                size="xs"
              />
              <span className="text-white text-[10px] sm:text-xs truncate max-w-[50px] sm:max-w-[60px]">
                {selection.awayTeam.name.split(' ').slice(-1)[0]}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Match name fallback if no team data */}
      {!selection.homeTeam && !selection.awayTeam && (
        <div className="text-white text-[10px] sm:text-xs mb-0.5 sm:mb-1 pr-5 sm:pr-6 truncate">
          {selection.matchName}
        </div>
      )}

      {/* Market type and odds */}
      <div className="flex items-center justify-between mt-1.5 sm:mt-2">
        <span className="text-gray-500 text-[10px] sm:text-xs">{selection.marketType}</span>
        <span className="text-white font-bold text-xs sm:text-sm font-mono">
          {selection.odds.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
