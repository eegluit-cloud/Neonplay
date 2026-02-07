import { Zap } from 'lucide-react';
import { SectionHeaderRow } from './SectionHeaderRow';
import { HighlightCard } from '@/components/sports/HighlightCard';
import { highlightMatches } from '@/data/sportsData';

export const LiveSportsHighlights = () => {
  return (
    <div>
      <SectionHeaderRow
        title={
          <>
            <Zap className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
            Live Sports
          </>
        }
        linkTo="/sports"
        linkText="View All"
        showNavigation={true}
        showAllButton={true}
      />
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-2.5 sm:gap-4">
          {highlightMatches.map((match) => (
            <HighlightCard key={match.id} match={match} />
          ))}
        </div>
      </div>
    </div>
  );
};
