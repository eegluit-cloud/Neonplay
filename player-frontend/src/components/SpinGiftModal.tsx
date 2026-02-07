import { useState, useMemo } from 'react';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import spinWheelImage from '@/assets/spin-wheel-colorful.png';
import { useSpinSounds } from '@/hooks/useSpinSounds';
import { useSpinWheelConfig, useSpinWheel } from '@/hooks/useSpinWheel';
import { useAuth } from '@/contexts/AuthContext';

interface SpinGiftModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Default wheel segments as fallback
const defaultWheelSegments = [
  { value: 100 },
  { value: 5 },
  { value: 10 },
  { value: 5 },
  { value: 1 },
  { value: 5 },
  { value: 5 },
  { value: 1 },
  { value: 5 },
  { value: 10 },
  { value: 5 },
  { value: 1 },
  { value: 100 },
  { value: 5 },
  { value: 10 },
  { value: 5 },
];

export function SpinGiftModal({ isOpen, onClose }: SpinGiftModalProps) {
  const { isAuthenticated } = useAuth();
  const { config, isLoading: configLoading, refetch: refetchConfig } = useSpinWheelConfig();
  const { spin: apiSpin, isSpinning: apiSpinning, error: spinError, reset: resetSpinError } = useSpinWheel();

  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winAmount, setWinAmount] = useState<number | null>(null);
  const { startSpinTicks, playWinSound } = useSpinSounds();

  // Use API segments or fallback to default
  const wheelSegments = useMemo(() => {
    if (config?.segments && config.segments.length > 0) {
      return config.segments.sort((a, b) => a.sortOrder - b.sortOrder).map(s => ({
        value: s.usdAmount || (s.gcAmount + s.scAmount) / 100, // Convert to USD or use usdAmount
        label: s.label,
      }));
    }
    return defaultWheelSegments;
  }, [config]);

  const handleSpin = async () => {
    if (isSpinning || apiSpinning) return;
    setIsSpinning(true);
    setWinAmount(null);
    resetSpinError();

    // Start spinning sounds
    startSpinTicks(4000);

    const segmentAngle = 360 / wheelSegments.length;

    // If authenticated, call API for result
    if (isAuthenticated) {
      try {
        const result = await apiSpin();

        // Find the segment index from the result
        const segmentIndex = config?.segments?.findIndex(s => s.id === result.segment.id) || 0;

        // Calculate rotation to land on the correct segment
        const spins = 5 + Math.random() * 3;
        const newRotation = rotation + (spins * 360) + (segmentIndex * segmentAngle);
        setRotation(newRotation);

        setTimeout(() => {
          setIsSpinning(false);
          setWinAmount(result.usdWon || (result.gcWon + result.scWon) / 100); // Convert to USD
          playWinSound();
          // Refetch config to update spins remaining
          refetchConfig();
        }, 4000);
      } catch {
        setIsSpinning(false);
        // Error is handled by the hook
      }
    } else {
      // Guest mode - random spin (demo only)
      const spins = 5 + Math.random() * 5;
      const randomSegment = Math.floor(Math.random() * wheelSegments.length);
      const newRotation = rotation + (spins * 360) + (randomSegment * segmentAngle);

      setRotation(newRotation);

      setTimeout(() => {
        setIsSpinning(false);
        const normalizedRotation = newRotation % 360;
        const segmentIndex = Math.floor((360 - normalizedRotation) / segmentAngle) % wheelSegments.length;
        const wonAmount = wheelSegments[segmentIndex].value;
        setWinAmount(wonAmount);
        playWinSound();
      }, 4000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      {/* Floating coins background - fewer on mobile */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float text-2xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          >
            🪙
          </div>
        ))}
      </div>
      
      <div className="relative w-full sm:max-w-lg bg-gradient-to-b from-[#1a1a2e] to-[#16213e] rounded-t-2xl sm:rounded-2xl p-4 sm:p-6 animate-slide-up sm:animate-scale-in border-t sm:border border-casino-gold/30 max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg transition-colors">
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-casino-gold glow-text">MEGA SPIN!</h2>
        </div>

        <div className="text-center">
          {/* Wheel container - smaller on mobile */}
          <div className="relative mx-auto w-56 h-56 sm:w-72 sm:h-72 mb-4 sm:mb-6">
            {/* The spinning wheel image */}
            <div
              className="absolute inset-0 transition-transform"
              style={{
                transform: `rotate(${rotation}deg)`,
                transitionDuration: isSpinning ? '4s' : '0s',
                transitionTimingFunction: 'cubic-bezier(0.17, 0.67, 0.12, 0.99)',
              }}
            >
              <img 
                src={spinWheelImage} 
                alt="Spin Wheel" 
                className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(255,215,0,0.4)]"
              />
            </div>
            
            {/* Center button */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-gradient-to-b from-[#f4d03f] to-[#c9a227] border-4 border-[#fff8dc] shadow-lg flex flex-col items-center justify-center">
                <span className="text-[#1a1a2e] font-bold text-xs leading-none">MEGA</span>
                <span className="text-[#1a1a2e] font-bold text-sm leading-none">SPIN!</span>
              </div>
            </div>
            
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
              <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[24px] border-l-transparent border-r-transparent border-t-casino-gold drop-shadow-lg" />
            </div>
          </div>

          {/* Spins remaining indicator */}
          {isAuthenticated && config && (
            <div className="mb-4 text-center">
              <p className="text-sm text-muted-foreground">
                Spins Remaining: <span className="text-casino-gold font-bold">{config.spinsRemaining}</span>
              </p>
              {config.spinsRemaining === 0 && config.nextFreeSpinAt && (
                <p className="text-xs text-muted-foreground mt-1">
                  Next free spin available soon
                </p>
              )}
            </div>
          )}

          <Button
            onClick={handleSpin}
            disabled={isSpinning || apiSpinning || (isAuthenticated && config?.spinsRemaining === 0)}
            variant="gold"
            size="xl"
            className="w-full mb-4 text-lg font-bold"
          >
            {isSpinning || apiSpinning ? 'Spinning...' :
             (isAuthenticated && config?.spinsRemaining === 0) ? 'No Spins Available' : 'SPIN NOW!'}
          </Button>

          {/* Error message */}
          {spinError && (
            <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/50 mb-4">
              <p className="text-sm text-red-400">{spinError}</p>
            </div>
          )}

          {winAmount !== null && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-casino-gold/20 to-yellow-500/20 border border-casino-gold/50 animate-scale-in mb-4">
              <p className="text-sm text-muted-foreground">🎉 Congratulations!</p>
              <p className="text-3xl font-bold text-casino-gold glow-text">${winAmount.toFixed(2)}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-secondary/50 border border-border">
              <p className="text-xs text-muted-foreground">Spin bonus total</p>
              <p className="text-xl font-bold text-foreground">$12,830,083</p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/50 border border-border">
              <p className="text-xs text-muted-foreground">👤 Hidden</p>
              <p className="text-xl font-bold">
                Win: <span className="text-amber-400">${winAmount?.toFixed(2) || '0.00'}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
