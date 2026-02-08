import { memo, useRef, useState, useCallback, useMemo } from 'react';
import { DollarSign } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BetSlipModal } from './BetSlipModal';
import { Skeleton } from './ui/skeleton';

// Game images
import bigBassSplash from '@/assets/games/big-bass-splash.png';
import videoPoker from '@/assets/games/2-hand-casino-holdem.png';
import crazyTime from '@/assets/games/crazy-time.png';
import candyBonanza from '@/assets/games/candy-bonanza.png';
import strikingHot from '@/assets/games/striking-hot-5.png';
import poisonEve from '@/assets/games/poison-eve.png';
import dragonPearls from '@/assets/games/dragon-pearls.png';
import aztecTwist from '@/assets/games/aztec-twist.png';
import bonanzaTrillion from '@/assets/games/bonanza-trillion.png';
import fortuneRabbit from '@/assets/games/fortune-rabbit.png';
import gonzosQuest from '@/assets/games/gonzos-quest.png';
import mammothPeak from '@/assets/games/mammoth-peak.png';
import pirateBonanza from '@/assets/games/pirate-bonanza.png';
import thorHammerTime from '@/assets/games/thor-hammer-time.png';
import bookOfFallen from '@/assets/games/book-of-fallen.png';
import sunOfEgypt from '@/assets/games/sun-of-egypt.png';
import powerPops from '@/assets/games/power-pops.png';
import immortalFruits from '@/assets/games/immortal-fruits.png';
import rhinoRobbery from '@/assets/games/rhino-robbery.png';
import grabTheGold from '@/assets/games/grab-the-gold.png';

const recentWins = [
  { id: 1, user: 'Marcus C.', game: 'Big Bass Splash', amount: 712.80, currency: 'USD' as const, avatar: 'https://randomuser.me/api/portraits/men/32.jpg', isRealPhoto: true, image: bigBassSplash },
  { id: 2, user: 'Elena R.', game: 'Video Poker', amount: 2050.00, currency: 'USD' as const, avatar: 'https://randomuser.me/api/portraits/women/44.jpg', isRealPhoto: true, image: videoPoker },
  { id: 3, user: 'CryptoKing', game: 'Power Pops', amount: 628.30, currency: 'USD' as const, avatar: 'crypto', isRealPhoto: false, image: powerPops },
  { id: 4, user: 'Jake T.', game: 'Fire in the Hole', amount: 5836.00, currency: 'USD' as const, avatar: 'https://randomuser.me/api/portraits/men/67.jpg', isRealPhoto: true, image: thorHammerTime },
  { id: 5, user: 'LuckyDragon', game: 'Bonanza Trillion', amount: 537.90, currency: 'USD' as const, avatar: 'dragon', isRealPhoto: false, image: bonanzaTrillion },
  { id: 6, user: 'Sofia M.', game: 'Crazy Time', amount: 4820.00, currency: 'USD' as const, avatar: 'https://randomuser.me/api/portraits/women/28.jpg', isRealPhoto: true, image: crazyTime },
  { id: 7, user: 'DiamondQ', game: 'Candy Bonanza', amount: 456.00, currency: 'USD' as const, avatar: 'diamond', isRealPhoto: false, image: candyBonanza },
  { id: 8, user: 'Alex T.', game: 'Striking Hot 5', amount: 4210.00, currency: 'USD' as const, avatar: 'https://randomuser.me/api/portraits/men/22.jpg', isRealPhoto: true, image: strikingHot },
  { id: 9, user: 'MegaWin', game: 'Poison Eve', amount: 398.00, currency: 'USD' as const, avatar: 'mega', isRealPhoto: false, image: poisonEve },
  { id: 10, user: 'Isabella C.', game: 'Dragon Pearls', amount: 3750.00, currency: 'USD' as const, avatar: 'https://randomuser.me/api/portraits/women/33.jpg', isRealPhoto: true, image: dragonPearls },
  { id: 11, user: 'HighRoller', game: 'Aztec Twist', amount: 352.00, currency: 'USD' as const, avatar: 'roller', isRealPhoto: false, image: aztecTwist },
  { id: 12, user: 'Ryan M.', game: 'Fortune Rabbit', amount: 3290.00, currency: 'USD' as const, avatar: 'https://randomuser.me/api/portraits/men/41.jpg', isRealPhoto: true, image: fortuneRabbit },
  { id: 13, user: 'GoldenAce', game: 'Gonzos Quest', amount: 306.00, currency: 'USD' as const, avatar: 'golden', isRealPhoto: false, image: gonzosQuest },
  { id: 14, user: 'Emma D.', game: 'Mammoth Peak', amount: 2830.00, currency: 'USD' as const, avatar: 'https://randomuser.me/api/portraits/women/52.jpg', isRealPhoto: true, image: mammothPeak },
  { id: 15, user: 'ProGambler', game: 'Pirate Bonanza', amount: 260.00, currency: 'USD' as const, avatar: 'pro', isRealPhoto: false, image: pirateBonanza },
  { id: 16, user: 'Olivia B.', game: 'Thor Hammer', amount: 2370.00, currency: 'USD' as const, avatar: 'https://randomuser.me/api/portraits/women/61.jpg', isRealPhoto: true, image: thorHammerTime },
  { id: 17, user: 'BetMaster', game: 'Book of Fallen', amount: 214.00, currency: 'USD' as const, avatar: 'bet', isRealPhoto: false, image: bookOfFallen },
  { id: 18, user: 'Noah W.', game: 'Sun of Egypt', amount: 1910.00, currency: 'USD' as const, avatar: 'https://randomuser.me/api/portraits/men/55.jpg', isRealPhoto: true, image: sunOfEgypt },
  { id: 19, user: 'RichPlayer', game: 'Rhino Robbery', amount: 168.00, currency: 'USD' as const, avatar: 'rich', isRealPhoto: false, image: rhinoRobbery },
  { id: 20, user: 'Mia J.', game: 'Grab the Gold', amount: 1450.00, currency: 'USD' as const, avatar: 'https://randomuser.me/api/portraits/women/17.jpg', isRealPhoto: true, image: grabTheGold },
  { id: 21, user: 'WinStreak', game: 'Immortal Fruits', amount: 122.00, currency: 'USD' as const, avatar: 'streak', isRealPhoto: false, image: immortalFruits },
];

type WinItem = typeof recentWins[0];

const formatAmount = (amount: number) => {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  }
  return `$${amount.toLocaleString()}`;
};

// Memoized win card component
const WinCard = memo(function WinCard({
  win,
  index,
  onClick,
}: {
  win: WinItem;
  index: number;
  onClick: (win: WinItem) => void;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleClick = useCallback(() => {
    onClick(win);
  }, [onClick, win]);

  return (
    <div
      className="flex-shrink-0 w-14 md:w-14 cursor-pointer"
      onClick={handleClick}
    >
      {/* Game Card */}
      <div className="relative overflow-hidden rounded-lg group">
        {/* Game Image - 56x75 aspect ratio (3:4) */}
        <div className="relative aspect-[56/75] bg-muted rounded-lg overflow-hidden">
          {!isLoaded && (
            <Skeleton className="absolute inset-0 w-full h-full" />
          )}
          <img
            src={win.image}
            alt={win.game}
            loading="lazy"
            decoding="async"
            onLoad={() => setIsLoaded(true)}
            className={`absolute left-0 top-0 w-full h-full object-cover rounded-lg transition-all duration-200 group-hover:scale-105 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>
      </div>

      {/* User Info */}
      <div className="mt-0.5 text-center leading-tight">
        <span className="text-[9px] md:text-[10px] text-muted-foreground block truncate">
          {win.user}
        </span>
        <span className="text-[10px] font-extrabold tracking-wide flex items-center justify-center gap-0.5 text-green-400">
          <DollarSign className="w-2.5 h-2.5" />
          {formatAmount(win.amount).replace('$', '')}
        </span>
      </div>
    </div>
  );
});

export const RecentWins = memo(function RecentWins() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [scrollStarted, setScrollStarted] = useState(false);
  const [selectedBet, setSelectedBet] = useState<WinItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const animationRef = useRef<number>();

  // Scroll-triggered entrance animation
  useGSAP(() => {
    if (!sectionRef.current) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setScrollStarted(true);
      return;
    }

    // Header fadeUp
    if (headerRef.current) {
      gsap.from(headerRef.current, {
        opacity: 0,
        y: 15,
        duration: 0.5,
        ease: 'power2.out',
        immediateRender: false,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 88%',
          once: true,
        },
      });
    }

    // Carousel fade in + start auto-scroll
    if (carouselRef.current) {
      gsap.from(carouselRef.current, {
        opacity: 0,
        scale: 0.98,
        duration: 0.4,
        delay: 0.2,
        ease: 'power2.out',
        immediateRender: false,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 88%',
          once: true,
        },
        onComplete: () => {
          setScrollStarted(true);
        },
      });
    }
  }, { scope: sectionRef });

  const handleBetClick = useCallback((win: WinItem) => {
    setSelectedBet(win);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // Triple the wins for seamless infinite loop
  const duplicatedWins = useMemo(() => [...recentWins, ...recentWins, ...recentWins], []);

  return (
    <>
      <section ref={sectionRef} className="!mt-0 sm:!-mt-1 lg:!-mt-1 py-2 sm:py-3 md:py-4 px-3 md:px-6">
        {/* Header - compact on mobile */}
        <div ref={headerRef} className="h-8 flex items-center gap-2 mb-2 md:mb-4">
          <div className="relative flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <div className="absolute w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            <div className="absolute w-4 h-4 rounded-full bg-amber-500/30 animate-pulse" />
          </div>
          <h2 className="text-base font-bold text-foreground">Recent Big Wins</h2>
        </div>

        {/* Carousel with CSS animation for smooth scrolling */}
        <div ref={carouselRef} className="overflow-hidden">
          <div
            ref={scrollRef}
            className="flex gap-1.5 md:gap-2 animate-scroll-wins"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
            style={{
              animationPlayState: isPaused || !scrollStarted ? 'paused' : 'running',
            }}
          >
            {duplicatedWins.map((win, index) => (
              <WinCard
                key={`${win.id}-${index}`}
                win={win}
                index={index}
                onClick={handleBetClick}
              />
            ))}
          </div>
        </div>

        <style>{`
          @keyframes scroll-wins {
            0% { transform: translateX(0); }
            100% { transform: translateX(-33.333%); }
          }
          .animate-scroll-wins {
            animation: scroll-wins 40s linear infinite;
            will-change: transform;
          }
        `}</style>
      </section>

      <BetSlipModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        bet={
          selectedBet
            ? {
                ...selectedBet,
                amount: formatAmount(selectedBet.amount),
              }
            : null
        }
      />
    </>
  );
});

export default RecentWins;
