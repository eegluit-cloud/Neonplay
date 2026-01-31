import { memo, useRef, useState, useCallback, useMemo } from 'react';
import { Coins } from 'lucide-react';
import { BetSlipModal } from './BetSlipModal';
import { useAppMode } from '@/contexts/AppModeContext';
import { DiamondIcon } from './icons/DiamondIcon';
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
  { id: 1, user: 'Marcus C.', game: 'Big Bass Splash', amount: 71280, coinType: 'SC' as const, avatar: 'https://randomuser.me/api/portraits/men/32.jpg', isRealPhoto: true, image: bigBassSplash },
  { id: 2, user: 'Elena R.', game: 'Video Poker', amount: 205000, coinType: 'GC' as const, avatar: 'https://randomuser.me/api/portraits/women/44.jpg', isRealPhoto: true, image: videoPoker },
  { id: 3, user: 'CryptoKing', game: 'Power Pops', amount: 62830, coinType: 'SC' as const, avatar: 'crypto', isRealPhoto: false, image: powerPops },
  { id: 4, user: 'Jake T.', game: 'Fire in the Hole', amount: 583600, coinType: 'GC' as const, avatar: 'https://randomuser.me/api/portraits/men/67.jpg', isRealPhoto: true, image: thorHammerTime },
  { id: 5, user: 'LuckyDragon', game: 'Bonanza Trillion', amount: 53790, coinType: 'SC' as const, avatar: 'dragon', isRealPhoto: false, image: bonanzaTrillion },
  { id: 6, user: 'Sofia M.', game: 'Crazy Time', amount: 482000, coinType: 'GC' as const, avatar: 'https://randomuser.me/api/portraits/women/28.jpg', isRealPhoto: true, image: crazyTime },
  { id: 7, user: 'DiamondQ', game: 'Candy Bonanza', amount: 45600, coinType: 'SC' as const, avatar: 'diamond', isRealPhoto: false, image: candyBonanza },
  { id: 8, user: 'Alex T.', game: 'Striking Hot 5', amount: 421000, coinType: 'GC' as const, avatar: 'https://randomuser.me/api/portraits/men/22.jpg', isRealPhoto: true, image: strikingHot },
  { id: 9, user: 'MegaWin', game: 'Poison Eve', amount: 39800, coinType: 'SC' as const, avatar: 'mega', isRealPhoto: false, image: poisonEve },
  { id: 10, user: 'Isabella C.', game: 'Dragon Pearls', amount: 375000, coinType: 'GC' as const, avatar: 'https://randomuser.me/api/portraits/women/33.jpg', isRealPhoto: true, image: dragonPearls },
  { id: 11, user: 'HighRoller', game: 'Aztec Twist', amount: 35200, coinType: 'SC' as const, avatar: 'roller', isRealPhoto: false, image: aztecTwist },
  { id: 12, user: 'Ryan M.', game: 'Fortune Rabbit', amount: 329000, coinType: 'GC' as const, avatar: 'https://randomuser.me/api/portraits/men/41.jpg', isRealPhoto: true, image: fortuneRabbit },
  { id: 13, user: 'GoldenAce', game: 'Gonzos Quest', amount: 30600, coinType: 'SC' as const, avatar: 'golden', isRealPhoto: false, image: gonzosQuest },
  { id: 14, user: 'Emma D.', game: 'Mammoth Peak', amount: 283000, coinType: 'GC' as const, avatar: 'https://randomuser.me/api/portraits/women/52.jpg', isRealPhoto: true, image: mammothPeak },
  { id: 15, user: 'ProGambler', game: 'Pirate Bonanza', amount: 26000, coinType: 'SC' as const, avatar: 'pro', isRealPhoto: false, image: pirateBonanza },
  { id: 16, user: 'Olivia B.', game: 'Thor Hammer', amount: 237000, coinType: 'GC' as const, avatar: 'https://randomuser.me/api/portraits/women/61.jpg', isRealPhoto: true, image: thorHammerTime },
  { id: 17, user: 'BetMaster', game: 'Book of Fallen', amount: 21400, coinType: 'SC' as const, avatar: 'bet', isRealPhoto: false, image: bookOfFallen },
  { id: 18, user: 'Noah W.', game: 'Sun of Egypt', amount: 191000, coinType: 'GC' as const, avatar: 'https://randomuser.me/api/portraits/men/55.jpg', isRealPhoto: true, image: sunOfEgypt },
  { id: 19, user: 'RichPlayer', game: 'Rhino Robbery', amount: 16800, coinType: 'SC' as const, avatar: 'rich', isRealPhoto: false, image: rhinoRobbery },
  { id: 20, user: 'Mia J.', game: 'Grab the Gold', amount: 145000, coinType: 'GC' as const, avatar: 'https://randomuser.me/api/portraits/women/17.jpg', isRealPhoto: true, image: grabTheGold },
  { id: 21, user: 'WinStreak', game: 'Immortal Fruits', amount: 12200, coinType: 'SC' as const, avatar: 'streak', isRealPhoto: false, image: immortalFruits },
];

type WinItem = typeof recentWins[0];

const formatCoinAmount = (amount: number, coinType: 'GC' | 'SC') => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }
  return amount.toLocaleString();
};

// Memoized win card component
const WinCard = memo(function WinCard({
  win,
  index,
  mode,
  onClick,
}: {
  win: WinItem;
  index: number;
  mode: 'social' | 'sweepstakes';
  onClick: (win: WinItem) => void;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  
  const displayCoinType = mode === 'social' ? 'GC' : win.coinType;
  const displayAmount = mode === 'social' && win.coinType === 'SC' ? win.amount * 10 : win.amount;

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
          {/* SC Badge for sweepstakes-eligible wins */}
          {mode === 'sweepstakes' && win.coinType === 'SC' && (
            <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
              <DiamondIcon className="w-2.5 h-2.5 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* User Info */}
      <div className="mt-0.5 text-center leading-tight">
        <span className="text-[9px] md:text-[10px] text-muted-foreground block truncate">
          {win.user}
        </span>
        <span
          className="text-[10px] font-extrabold tracking-wide flex items-center justify-center gap-0.5"
          style={{ color: displayCoinType === 'SC' ? '#3b82f6' : '#fbbf24' }}
        >
          {displayCoinType === 'SC' ? (
            <DiamondIcon className="w-2.5 h-2.5" />
          ) : (
            <Coins className="w-2.5 h-2.5" />
          )}
          {formatCoinAmount(displayAmount, displayCoinType)}
        </span>
      </div>
    </div>
  );
});

export const RecentWins = memo(function RecentWins() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedBet, setSelectedBet] = useState<WinItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { mode } = useAppMode();
  const animationRef = useRef<number>();

  const handleBetClick = useCallback((win: WinItem) => {
    setSelectedBet(win);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // Filter wins based on current mode, then triple for seamless infinite loop
  const filteredWins = useMemo(() => {
    return recentWins.filter(win => 
      mode === 'sweepstakes' ? win.coinType === 'SC' : win.coinType === 'GC'
    );
  }, [mode]);
  
  const duplicatedWins = useMemo(() => [...filteredWins, ...filteredWins, ...filteredWins], [filteredWins]);

  return (
    <>
      <section className="!mt-0 sm:!-mt-1 lg:!-mt-1 py-2 sm:py-3 md:py-4 px-3 md:px-6">
        {/* Header - compact on mobile */}
        <div className="h-8 flex items-center gap-2 mb-2 md:mb-4">
          <div className="relative flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
            <div className="absolute w-2.5 h-2.5 rounded-full bg-cyan-500 animate-ping" />
            <div className="absolute w-4 h-4 rounded-full bg-cyan-500/30 animate-pulse" />
          </div>
          <h2 className="text-base font-bold text-foreground">Recent Big Wins</h2>
        </div>

        {/* Carousel with CSS animation for smooth scrolling */}
        <div className="overflow-hidden">
          <div
            ref={scrollRef}
            className="flex gap-1.5 md:gap-2 animate-scroll-wins"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
            style={{
              animationPlayState: isPaused ? 'paused' : 'running',
            }}
          >
            {duplicatedWins.map((win, index) => (
              <WinCard
                key={`${win.id}-${index}`}
                win={win}
                index={index}
                mode={mode}
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
                amount: formatCoinAmount(selectedBet.amount, selectedBet.coinType),
              }
            : null
        }
      />
    </>
  );
});

export default RecentWins;
