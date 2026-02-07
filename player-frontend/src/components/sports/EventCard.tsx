import { Globe, Wifi, Trophy, BarChart3, ChevronDown } from 'lucide-react';
import { TeamLogo } from '@/components/sports/TeamLogo';
import { OddsButton } from '@/components/sports/OddsButton';
import type { EventMatch } from '@/data/sportsData';

export function EventCard({ event }: { event: EventMatch }) {
  const matchName = `${event.teams[0].name} vs ${event.teams[1].name}`;
  const league = `${event.country} \u2022 ${event.league}`;

  return (
    <div className="bg-[#1a1a2e]/80 border border-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4">
      {/* Header */}
      <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
        <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
        <span className="text-gray-400 text-xs sm:text-sm truncate">{league}</span>
      </div>

      {/* Time/Status */}
      <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
        {event.isLive ? (
          <span className="text-cyan-400 text-xs sm:text-sm font-medium flex items-center gap-1">
            {event.liveMinute}' {event.liveHalf}
            <Wifi className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-400 ml-0.5 sm:ml-1" aria-hidden="true" />
          </span>
        ) : (
          <span className="text-gray-400 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
            {event.time}
            <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-500" aria-hidden="true" />
            <BarChart3 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-500" aria-hidden="true" />
          </span>
        )}
      </div>

      {/* Teams */}
      <div className="space-y-1.5 sm:space-y-2 mb-2.5 sm:mb-4">
        {event.teams.map((team, idx) => (
          <div key={idx} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <TeamLogo
                teamName={team.name}
                logoUrl={team.logoUrl}
                size="sm"
                className="flex-shrink-0"
              />
              <span className="text-white text-xs sm:text-sm truncate">{team.name}</span>
            </div>
            {team.score !== undefined && (
              <span className="w-5 h-5 sm:w-6 sm:h-6 bg-white/10 rounded flex items-center justify-center text-white text-xs sm:text-sm font-medium flex-shrink-0">
                {team.score}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* 1x2 Label */}
      <div className="text-gray-500 text-[10px] sm:text-xs mb-1.5 sm:mb-2">1x2</div>

      {/* Odds */}
      <div className="flex items-center gap-1">
        <OddsButton
          eventId={event.id}
          matchName={matchName}
          league={league}
          market="1"
          odds={event.odds.home}
          homeTeam={{ name: event.teams[0].name, logoUrl: event.teams[0].logoUrl }}
          awayTeam={{ name: event.teams[1].name, logoUrl: event.teams[1].logoUrl }}
        />
        {event.odds.draw > 0 && (
          <OddsButton
            eventId={event.id}
            matchName={matchName}
            league={league}
            market="draw"
            odds={event.odds.draw}
            homeTeam={{ name: event.teams[0].name, logoUrl: event.teams[0].logoUrl }}
            awayTeam={{ name: event.teams[1].name, logoUrl: event.teams[1].logoUrl }}
          />
        )}
        <OddsButton
          eventId={event.id}
          matchName={matchName}
          league={league}
          market="2"
          odds={event.odds.away}
          homeTeam={{ name: event.teams[0].name, logoUrl: event.teams[0].logoUrl }}
          awayTeam={{ name: event.teams[1].name, logoUrl: event.teams[1].logoUrl }}
        />
        <button className="w-7 h-7 sm:w-8 sm:h-8 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md sm:rounded-lg flex items-center justify-center transition-all flex-shrink-0">
          <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
        </button>
      </div>
    </div>
  );
}
