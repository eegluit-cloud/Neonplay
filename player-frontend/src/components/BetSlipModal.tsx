import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Copy, Check, Share2, DollarSign } from 'lucide-react';
import { useState } from 'react';

interface BetSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  bet: {
    user: string;
    game: string;
    amount: string;
    avatar: string;
    image: string;
  } | null;
}

export function BetSlipModal({ isOpen, onClose, bet }: BetSlipModalProps) {
  const [copied, setCopied] = useState(false);

  if (!bet) return null;

  // Generate random bet details for demo (in USD)
  const stakeAmount = (Math.random() * 500 + 10).toFixed(2);
  const multiplier = (Math.random() * 5 + 1).toFixed(2);
  const prize = (parseFloat(stakeAmount) * parseFloat(multiplier)).toFixed(2);
  const betId = Math.floor(Math.random() * 9999999999999999999).toString();
  const date = new Date();
  const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}, ${date.toLocaleTimeString()}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(betId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent hideClose className="max-w-[90vw] sm:max-w-md p-0 bg-[#1a1a1a] border-none rounded-xl sm:rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 p-3 sm:p-4 border-b border-border/30">
          <button 
            onClick={onClose}
            aria-label="Back"
            className="w-8 h-8 grid place-items-center rounded-lg bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-colors flex-shrink-0"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <h2 className="text-sm sm:text-base font-bold text-foreground">Bet Slip</h2>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
          {/* Prize Card */}
          <div className="bg-[#252525] rounded-xl sm:rounded-2xl p-3 sm:p-5 relative">
            {/* Share Button */}
            <button className="absolute top-3 right-3 sm:top-4 sm:right-4 text-muted-foreground hover:text-foreground transition-colors">
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Prize */}
            <div className="text-center mb-3 sm:mb-4">
              <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">Prize Won</p>
              <div className="flex items-center justify-center gap-2">
                <DollarSign className="w-6 h-6 text-green-400" />
                <span className="text-xl sm:text-3xl font-bold text-green-400">
                  ${parseFloat(prize).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Stake Amount & Multiplier */}
            <div className="bg-[#1a1a1a] rounded-lg sm:rounded-xl p-3 sm:p-4 flex justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">Stake</p>
                <span className="text-xs sm:text-sm font-semibold text-green-400">
                  ${parseFloat(stakeAmount).toLocaleString()}
                </span>
              </div>
              <div className="text-right">
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">Multiplier</p>
                <span className="text-xs sm:text-sm font-semibold text-foreground">{multiplier}x</span>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-[#252525] rounded-xl sm:rounded-2xl p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3 border-b border-dashed border-border/50 pb-3 sm:pb-4 mb-3 sm:mb-4">
              {/* Avatar */}
              <img 
                src={bet.avatar} 
                alt={bet.user}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-amber-400 to-blue-500 flex items-center justify-center text-base sm:text-lg font-bold text-white hidden flex-shrink-0">
                {bet.user.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  <span className="font-semibold text-foreground">{bet.user}</span>
                  <span className="hidden sm:inline"> On {formattedDate}</span>
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground sm:hidden">{formattedDate}</p>
                <div className="flex items-center gap-1 sm:gap-1.5 mt-0.5 sm:mt-1">
                  <span className="text-[10px] sm:text-xs text-muted-foreground">ID:</span>
                  <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                    <Check className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />
                  </div>
                  <span className="text-[10px] sm:text-xs text-foreground font-mono truncate max-w-[80px] sm:max-w-[120px]">{betId.slice(0, 10)}...</span>
                  <button onClick={handleCopy} className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
                    {copied ? <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" /> : <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Game Info */}
            <div className="flex items-center gap-2 sm:gap-3">
              <img 
                src={bet.image} 
                alt={bet.game}
                className="w-12 h-16 sm:w-16 sm:h-20 rounded-lg sm:rounded-xl object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base font-semibold text-foreground truncate">{bet.game}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">NoLimitCity</p>
              </div>
              <button className="flex items-center gap-0.5 sm:gap-1 text-foreground hover:text-emerald-400 transition-colors flex-shrink-0">
                <span className="text-xs sm:text-sm font-medium">Play</span>
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
