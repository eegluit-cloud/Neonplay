import { useRef } from 'react';
import { Zap } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SectionHeaderRow } from './SectionHeaderRow';
import { HighlightCard } from '@/components/sports/HighlightCard';
import { highlightMatches } from '@/data/sportsData';

export const LiveSportsHighlights = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Section fadeUp
    gsap.from(containerRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.4,
      ease: 'power2.out',
      immediateRender: false,
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 85%',
        once: true,
      },
    });

    // Stagger highlight cards from left
    if (cardsRef.current) {
      const cards = cardsRef.current.children;
      gsap.from(cards, {
        opacity: 0,
        x: -30,
        scale: 0.95,
        duration: 0.45,
        stagger: 0.08,
        delay: 0.2,
        ease: 'power2.out',
        immediateRender: false,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 85%',
          once: true,
        },
      });
    }
  }, { scope: containerRef });

  return (
    <div ref={containerRef}>
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
        <div ref={cardsRef} className="flex gap-2.5 sm:gap-4">
          {highlightMatches.map((match) => (
            <HighlightCard key={match.id} match={match} />
          ))}
        </div>
      </div>
    </div>
  );
};
