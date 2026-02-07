import { Wifi } from 'lucide-react';
import { SectionHeaderRow } from './SectionHeaderRow';
import { EventCard } from '@/components/sports/EventCard';
import { eventMatches } from '@/data/sportsData';

export function UpcomingEventsSection() {
  // Show 6 events in a responsive grid
  const events = eventMatches.slice(0, 6);

  return (
    <div>
      <SectionHeaderRow
        title={
          <>
            <Wifi className="w-4 h-4 md:w-5 md:h-5 text-cyan-500" />
            Upcoming Matches
          </>
        }
        linkTo="/sports"
        linkText="View All"
        showNavigation={true}
        showAllButton={true}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
