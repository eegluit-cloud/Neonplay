import { useState, useMemo } from 'react';
import { Crown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SectionHeaderRow } from './SectionHeaderRow';
import { EventCard } from '@/components/sports/EventCard';
import {
  SportIcon,
  type SportIconKey,
} from '@/components/icons/SportIcons';
import { eventMatches, sportChips } from '@/data/sportsData';
import { useMatches } from '@/hooks/useSports';
import { getTeamLogoUrl } from '@/data/teamLogos';

export function PopularSportsEvents() {
  const [activeSport, setActiveSport] = useState<string>('all');

  const { matches: apiMatches, isLoading } = useMatches({ limit: 12 });

  // Convert API matches to EventMatch format, fall back to mock data
  const allEventMatches = useMemo(() => {
    if (apiMatches && apiMatches.length > 0) {
      return apiMatches.map((match) => ({
        id: match.id,
        sport: (match.league?.sport?.iconKey || 'soccer') as SportIconKey,
        league: match.league?.name || 'Unknown League',
        country: match.league?.country || '',
        time: match.status === 'live'
          ? 'LIVE'
          : new Date(match.startTime).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
        isLive: match.status === 'live',
        liveMinute: match.status === 'live' ? '' : undefined,
        liveHalf: undefined,
        teams: [
          {
            name: match.homeTeam.name,
            logoUrl: match.homeTeam.logoUrl || getTeamLogoUrl(match.homeTeam.name),
            score: match.homeScore,
          },
          {
            name: match.awayTeam.name,
            logoUrl: match.awayTeam.logoUrl || getTeamLogoUrl(match.awayTeam.name),
            score: match.awayScore,
          },
        ] as [{ name: string; logoUrl?: string; score?: number }, { name: string; logoUrl?: string; score?: number }],
        odds: match.markets?.[0]
          ? {
              home: match.markets[0].odds.find((o) => o.selection === 'home')?.odds || 0,
              draw: match.markets[0].odds.find((o) => o.selection === 'draw')?.odds || 0,
              away: match.markets[0].odds.find((o) => o.selection === 'away')?.odds || 0,
            }
          : { home: 0, draw: 0, away: 0 },
      }));
    }
    return eventMatches;
  }, [apiMatches]);

  const filteredEvents = useMemo(() => {
    const filtered = activeSport === 'all'
      ? allEventMatches
      : allEventMatches.filter((event) => event.sport === activeSport);
    return filtered.slice(0, 6);
  }, [allEventMatches, activeSport]);

  return (
    <div>
      <SectionHeaderRow
        title={
          <span className="flex items-center gap-1.5">
            <Crown className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
            Popular Sports
          </span>
        }
        linkTo="/sports"
        linkText="View All"
        showNavigation={true}
        showAllButton={true}
      />

      {/* Sport filter chips */}
      <div className="overflow-x-auto scrollbar-hide -mx-3 sm:mx-0 px-3 sm:px-0 mb-3 sm:mb-4">
        <div className="flex gap-1.5 sm:gap-2">
          <button
            onClick={() => setActiveSport('all')}
            className={cn(
              "flex-shrink-0 h-8 sm:h-9 px-2.5 sm:px-4 rounded-full flex items-center gap-1.5 sm:gap-2 transition-all text-xs sm:text-sm font-medium",
              activeSport === 'all'
                ? "bg-amber-500 text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
            )}
          >
            All Sports
          </button>
          {sportChips.map((sport) => (
            <button
              key={sport.id}
              onClick={() => setActiveSport(sport.id)}
              className={cn(
                "flex-shrink-0 h-8 sm:h-9 px-2.5 sm:px-4 rounded-full flex items-center gap-1.5 sm:gap-2 transition-all text-xs sm:text-sm font-medium",
                activeSport === sport.id
                  ? "bg-amber-500 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
              )}
            >
              <SportIcon sport={sport.id as SportIconKey} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{sport.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Events grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
          No events found for this sport
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
