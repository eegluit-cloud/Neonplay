import { Globe, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TeamLogo } from '@/components/sports/TeamLogo';
import { OddsButton } from '@/components/sports/OddsButton';
import type { HighlightMatch } from '@/data/sportsData';

export function HighlightCard({ match }: { match: HighlightMatch }) {
  const matchName = `${match.teams[0].name} vs ${match.teams[1].name}`;

  return (
    <div className={cn(
      "flex-shrink-0 w-[280px] sm:w-[320px] md:w-[360px] rounded-xl sm:rounded-2xl overflow-hidden relative",
      "bg-gradient-to-br",
      match.bgGradient
    )}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-20 sm:w-24 h-20 sm:h-24 bg-black/20 rounded-full blur-2xl" />
      </div>

      <div className="relative p-3 sm:p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
            <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/70 flex-shrink-0" />
            <span className="text-[10px] sm:text-xs text-white/80 truncate">{match.league}</span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
            <span className="text-[10px] sm:text-xs text-white/80">{match.time}</span>
            {match.isLive && (
              <span className="flex items-center gap-1 text-red-400">
                <Wifi className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              </span>
            )}
          </div>
        </div>

        {/* Teams */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <TeamLogo
              teamName={match.teams[0].name}
              logoUrl={match.teams[0].logoUrl}
              size="md"
              className="bg-white/20 flex-shrink-0"
            />
            <span className="text-white font-medium text-xs sm:text-sm truncate">{match.teams[0].name}</span>
          </div>

          {match.teams[0].score !== undefined && (
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 mx-2">
              <span className="w-6 h-6 sm:w-8 sm:h-8 bg-black/30 rounded-md sm:rounded-lg flex items-center justify-center text-white font-bold text-sm sm:text-base">
                {match.teams[0].score}
              </span>
              <span className="w-6 h-6 sm:w-8 sm:h-8 bg-black/30 rounded-md sm:rounded-lg flex items-center justify-center text-white font-bold text-sm sm:text-base">
                {match.teams[1].score}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 justify-end">
            <span className="text-white font-medium text-xs sm:text-sm text-right truncate">{match.teams[1].name}</span>
            <TeamLogo
              teamName={match.teams[1].name}
              logoUrl={match.teams[1].logoUrl}
              size="md"
              className="bg-white/20 flex-shrink-0"
            />
          </div>
        </div>

        {/* Odds */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <OddsButton
            eventId={match.id}
            matchName={matchName}
            league={match.league}
            market="1"
            odds={match.odds.home}
            homeTeam={{ name: match.teams[0].name, logoUrl: match.teams[0].logoUrl }}
            awayTeam={{ name: match.teams[1].name, logoUrl: match.teams[1].logoUrl }}
            className="bg-black/30 hover:bg-black/40 border-transparent"
          />
          <OddsButton
            eventId={match.id}
            matchName={matchName}
            league={match.league}
            market="draw"
            odds={match.odds.draw}
            homeTeam={{ name: match.teams[0].name, logoUrl: match.teams[0].logoUrl }}
            awayTeam={{ name: match.teams[1].name, logoUrl: match.teams[1].logoUrl }}
            className="bg-black/30 hover:bg-black/40 border-transparent"
          />
          <OddsButton
            eventId={match.id}
            matchName={matchName}
            league={match.league}
            market="2"
            odds={match.odds.away}
            homeTeam={{ name: match.teams[0].name, logoUrl: match.teams[0].logoUrl }}
            awayTeam={{ name: match.teams[1].name, logoUrl: match.teams[1].logoUrl }}
            className="bg-black/30 hover:bg-black/40 border-transparent"
          />
        </div>
      </div>
    </div>
  );
}
