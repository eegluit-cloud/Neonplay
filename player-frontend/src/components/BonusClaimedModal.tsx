import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import treasureChest from '@/assets/treasure-chest-coins.png';

interface BonusClaimedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BonusClaimedModal({ isOpen, onClose }: BonusClaimedModalProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });

  useEffect(() => {
    if (!isOpen) return;

    // Check if there's a saved claim time in localStorage
    const savedClaimTime = localStorage.getItem('bonus_claim_time');
    let claimTime: number;

    if (savedClaimTime) {
      claimTime = parseInt(savedClaimTime);
    } else {
      // Set new claim time (now)
      claimTime = Date.now();
      localStorage.setItem('bonus_claim_time', claimTime.toString());
    }

    const calculateTimeLeft = () => {
      const now = Date.now();
      const nextBonusTime = claimTime + (24 * 60 * 60 * 1000); // 24 hours from claim
      const diff = nextBonusTime - now;

      if (diff <= 0) {
        // Bonus is available again
        localStorage.removeItem('bonus_claim_time');
        return { hours: 0, minutes: 0, seconds: 0 };
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return { hours, minutes, seconds };
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTime = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Outer glowing container */}
      <div className="relative w-full max-w-xs">
        {/* Outer glow effect - all around */}
        <div className="absolute -inset-[2px] rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-400 opacity-60 blur-md" />
        <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-400" />
        
        {/* Modal content */}
        <div className="relative bg-[#0a0e14] rounded-xl overflow-hidden shadow-2xl">
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-2 right-2 z-20 w-7 h-7 flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          {/* Content */}
          <div className="p-4">
            <div className="relative">
              <div className="absolute -inset-[1px] rounded-lg bg-gradient-to-b from-white/20 via-white/5 to-transparent" />
              <div className="relative bg-gradient-to-br from-[#1a1f26] to-[#12161c] rounded-lg p-4 text-center">
                {/* Title */}
                <h2 className="text-lg font-bold text-white mb-2">
                  Bonus Claimed!
                </h2>

                {/* Character Image */}
                <div className="flex justify-center mb-3">
                  <img
                    src={treasureChest}
                    alt="Bonus Coins"
                    className="w-32 h-auto object-contain"
                  />
                </div>

                {/* Next Bonus Timer */}
                <p className="text-muted-foreground text-[10px] font-semibold mb-1 tracking-wider">
                  NEXT BONUS IN:
                </p>
                <p className="text-2xl font-bold text-white mb-3 font-mono tracking-wider">
                  {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
                </p>

                {/* Come Back Later Button */}
                <Button 
                  onClick={onClose}
                  className="w-full h-9 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-600 hover:to-cyan-500 text-black font-semibold text-sm mb-2"
                >
                  Come Back Later
                </Button>

                {/* Close link */}
                <button 
                  onClick={onClose}
                  className="text-muted-foreground text-xs hover:text-white transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
