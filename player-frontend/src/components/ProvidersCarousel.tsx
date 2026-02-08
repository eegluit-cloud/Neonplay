import { memo, useRef, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefetchRoute } from '@/hooks/useRoutePrefetch';

// Provider logos
import croco from '@/assets/providers/croco.png';
import jili from '@/assets/providers/jili.png';
import moka from '@/assets/providers/moka.png';
import amigo from '@/assets/providers/amigo.png';
import platipus from '@/assets/providers/platipus.png';
import jdb from '@/assets/providers/jdb.png';
import inout from '@/assets/providers/inout.png';
import nownow from '@/assets/providers/nownow.png';
import redTiger from '@/assets/providers/red-tiger.png';

const providers = [
  { id: 1, name: 'Croco Gaming', logo: croco, slug: 'croco-gaming' },
  { id: 2, name: 'JILI', logo: jili, slug: 'jili' },
  { id: 3, name: 'Moka', logo: moka, slug: 'moka' },
  { id: 4, name: 'Amigo', logo: amigo, slug: 'amigo' },
  { id: 5, name: 'Platipus', logo: platipus, slug: 'platipus' },
  { id: 6, name: 'JDB', logo: jdb, slug: 'jdb' },
  { id: 7, name: 'InOut', logo: inout, slug: 'inout' },
  { id: 8, name: 'NowNow', logo: nownow, slug: 'nownow' },
  { id: 9, name: 'Red Tiger', logo: redTiger, slug: 'red-tiger' },
];

// Memoized provider item to prevent unnecessary re-renders
const ProviderItem = memo(function ProviderItem({
  provider,
  onClick,
}: {
  provider: typeof providers[0];
  onClick: (slug: string) => void;
}) {
  const handleClick = useCallback(() => {
    onClick(provider.slug);
  }, [onClick, provider.slug]);

  const handlePrefetch = useCallback(() => {
    prefetchRoute(`/providers/${provider.slug}`);
  }, [provider.slug]);

  return (
    <div
      onClick={handleClick}
      onMouseEnter={handlePrefetch}
      className="flex-shrink-0 px-4 md:px-6 cursor-pointer hover:opacity-80 transition-opacity"
      role="button"
      aria-label={`View ${provider.name} games`}
    >
      <img
        src={provider.logo}
        alt={provider.name}
        loading="lazy"
        decoding="async"
        className="h-6 md:h-8 lg:h-10 w-auto object-contain"
        style={{ minWidth: '60px' }}
      />
    </div>
  );
});

export const ProvidersCarousel = memo(function ProvidersCarousel() {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const logoRowRef = useRef<HTMLDivElement>(null);
  const [scrollStarted, setScrollStarted] = useState(false);

  const handleProviderClick = useCallback((providerSlug: string) => {
    navigate(`/providers/${providerSlug}`);
  }, [navigate]);

  // Scroll-triggered animations
  useGSAP(() => {
    if (!sectionRef.current) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setScrollStarted(true);
      return;
    }

    // Title fadeUp
    if (titleRef.current) {
      gsap.from(titleRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
          once: true,
        },
      });
    }

    // Logo row fade + start auto-scroll
    if (logoRowRef.current) {
      gsap.from(logoRowRef.current, {
        opacity: 0,
        duration: 0.4,
        delay: 0.3,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
          once: true,
        },
        onComplete: () => setScrollStarted(true),
      });
    }

    // Subtle parallax on desktop
    const isMobile = window.innerWidth < 768;
    if (!isMobile && logoRowRef.current) {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.5,
        animation: gsap.to(logoRowRef.current, { y: -20, ease: 'none' }),
      });
    }
  }, { scope: sectionRef });

  // Duplicate providers for seamless loop - memoized
  const duplicatedProviders = useMemo(() => [...providers, ...providers], []);

  return (
    <section ref={sectionRef} className="py-4 md:py-6 overflow-hidden">
      <h2 ref={titleRef} className="text-lg md:text-xl font-bold mb-4 px-1">Providers</h2>

      <div ref={logoRowRef} className="relative overflow-hidden">
        <div
          ref={scrollRef}
          className="flex items-center animate-scroll-providers"
          style={{
            width: 'max-content',
            animationPlayState: scrollStarted ? 'running' : 'paused',
          }}
        >
          {duplicatedProviders.map((provider, index) => (
            <ProviderItem
              key={`${provider.id}-${index}`}
              provider={provider}
              onClick={handleProviderClick}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scroll-providers {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-scroll-providers {
          animation: scroll-providers 30s linear infinite;
          will-change: transform;
        }
        .animate-scroll-providers:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
});

export default ProvidersCarousel;
