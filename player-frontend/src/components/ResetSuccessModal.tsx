import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import successDealer from '@/assets/success-dealer.png';

interface ResetSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue?: () => void;
}

export function ResetSuccessModal({ isOpen, onClose, onContinue }: ResetSuccessModalProps) {
  const isMobile = useIsMobile();

  if (!isOpen) return null;

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    } else {
      onClose();
    }
  };

  // Mobile version - clean wallet-style design
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[100] flex items-end justify-center">
        <div 
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <div className="relative w-full bg-gradient-to-b from-card to-background border-t-2 border-primary/50 rounded-t-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto scrollbar-hide animate-slide-up">
          <div className="p-4 relative">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-muted-foreground" />
              </button>
              <h2 className="text-lg font-bold text-foreground">Success</h2>
            </div>

            {/* Success State */}
            <div className="p-6 bg-secondary/50 rounded-xl mb-6 text-center">
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Password Reset Successfully!</h3>
              <p className="text-sm text-muted-foreground">
                Your password has been reset successfully. You can now log in with your new password.
              </p>
            </div>

            <Button
              onClick={handleContinue}
              className="w-full h-14 bg-gradient-to-r from-cyan-500 to-blue-400 hover:from-cyan-600 hover:to-blue-500 text-white font-semibold shadow-lg"
            >
              Continue to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop version - original design
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-3xl bg-card rounded-2xl overflow-hidden shadow-2xl border border-border">
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-7 h-7 flex items-center justify-center rounded-lg bg-secondary border border-border hover:bg-secondary/80 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left Side - Character */}
            <div className="relative overflow-hidden min-h-[280px] flex items-center justify-center order-1">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0f1520] via-[#0a1018] to-[#060a10]" />
              <div className="relative z-10 w-full max-w-[280px]">
                <img
                  src={successDealer}
                  alt="Success"
                  className="w-full h-auto object-contain select-none pointer-events-none"
                  loading="eager"
                />
              </div>
            </div>

            {/* Right Side - Success Message */}
            <div className="relative p-6 flex items-center order-2">
              <div className="relative w-full">
                <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-b from-white/20 via-white/5 to-transparent" />
                <div className="relative bg-gradient-to-br from-[#1a1f26] to-[#12161c] rounded-xl p-6 text-center">
                  <h2 className="text-2xl font-bold text-white mb-3">Reset Successfully</h2>
                  <p className="text-muted-foreground text-sm mb-6">
                    Your Password Has Been Reset Successfully
                  </p>

                  <Button 
                    onClick={handleContinue}
                    className="w-full h-11 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-600 hover:to-cyan-500 text-black font-semibold text-sm"
                  >
                    Continue
                  </Button>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}