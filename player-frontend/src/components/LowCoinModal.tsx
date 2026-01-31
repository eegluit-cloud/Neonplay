import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import lowCoinCharacter from '@/assets/low-coin-character.png';

interface LowCoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBuyCoins: () => void;
}

export function LowCoinModal({ isOpen, onClose, onBuyCoins }: LowCoinModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-8">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Outer glowing container */}
      <div className="relative w-full max-w-md">
        {/* Outer glow effect - cyan theme */}
        <div className="absolute -inset-[2px] rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-400 opacity-60 blur-md" />
        <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-400" />
        
        {/* Modal content */}
        <div className="relative bg-[#0a0e14] rounded-xl overflow-hidden shadow-2xl">
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-2 right-2 z-20 w-7 h-7 flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-white" />
          </button>

          {/* Content - Two column layout */}
          <div className="p-4">
            <div className="relative">
              <div className="absolute -inset-[1px] rounded-lg bg-gradient-to-b from-white/20 via-white/5 to-transparent" />
              <div className="relative bg-gradient-to-br from-[#1a1f26] to-[#12161c] rounded-lg p-4">
                <div className="flex items-center gap-4">
                  {/* Character Image - Left side */}
                  <div className="flex-shrink-0">
                    <img
                      src={lowCoinCharacter}
                      alt="Low Coin Alert"
                      className="w-28 sm:w-36 h-auto object-contain"
                    />
                  </div>

                  {/* Text and Actions - Right side */}
                  <div className="flex-1 min-w-0 text-left space-y-3">
                    {/* Title */}
                    <h2 className="text-xl font-bold text-white">
                      Low Balance
                    </h2>

                    {/* Description */}
                    <p className="text-muted-foreground text-xs">
                      Your balance is running low
                      <br />
                      Top up now to keep playing
                    </p>

                    {/* Progress bar - low indicator */}
                    <div className="flex gap-1">
                      {[...Array(10)].map((_, i) => (
                        <div 
                          key={i}
                          className={`w-4 h-2 rounded-sm ${
                            i < 2 
                              ? 'bg-gradient-to-r from-cyan-400 to-cyan-500' 
                              : 'bg-[#2a3038]'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Buttons */}
                    <div className="space-y-2">
                      {/* Deposit Button - Cyan gradient */}
                      <Button
                        onClick={onBuyCoins}
                        className="w-full h-10 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-600 hover:to-cyan-500 text-black font-semibold text-sm"
                      >
                        Deposit Now
                      </Button>

                      {/* Later Button - Outlined */}
                      <Button 
                        variant="outline"
                        onClick={onClose}
                        className="w-full h-10 border-[#3a4048] bg-transparent hover:bg-white/5 text-white font-medium text-sm"
                      >
                        Later
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
