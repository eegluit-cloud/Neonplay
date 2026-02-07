import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import locationCharacter from '@/assets/location-character.png';
import { NeonPlayLogo } from '@/components/NeonPlayLogo';

interface LocationIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LocationIssueModal({ isOpen, onClose }: LocationIssueModalProps) {
  const isMobile = useIsMobile();

  if (!isOpen) return null;

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
              <h2 className="text-lg font-bold text-foreground">Location Issue</h2>
            </div>

            {/* Title Badge */}
            <div className="flex bg-secondary/50 rounded-full p-1 mb-6 w-fit">
              <div className="px-6 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-red-500 to-orange-400 text-white shadow">
                Unavailable
              </div>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-secondary/50 rounded-xl mb-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-foreground font-medium mb-1">We're not available in your area</p>
                  <p className="text-xs text-muted-foreground">
                    Your device's location data indicates you are not in a permitted area. Please make sure that you are within a permitted area, then try again.
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={onClose}
              className="w-full h-14 bg-gradient-to-r from-amber-500 to-blue-400 hover:from-amber-600 hover:to-blue-500 text-white font-semibold shadow-lg"
            >
              I Understand
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop version - original design with character
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

          <div className="grid grid-cols-1 md:grid-cols-2 min-h-[350px]">
            {/* Left Side - Character */}
            <div className="relative flex items-center justify-center p-6">
              <img
                src={locationCharacter}
                alt="Location Character"
                className="w-full max-w-[260px] h-auto object-contain select-none pointer-events-none"
                loading="eager"
              />
            </div>

            {/* Right Side - Content */}
            <div className="relative p-6 flex items-center">
              <div className="relative w-full">
                <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-b from-white/20 via-white/5 to-transparent" />
                <div className="relative bg-gradient-to-br from-[#1a1f26] to-[#12161c] rounded-xl p-6 text-center">
                  <div className="flex justify-center mb-5">
                    <NeonPlayLogo size="lg" />
                  </div>

                  <h2 className="text-2xl font-bold text-white mb-3 leading-tight">
                    Uh Oh! We are not currently serving in your area
                  </h2>

                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Your Device's Location Data Indicates You Are Not In A Permitted Area. Please Make Sure That You Are Within A Permitted Area, Then Try Again.
                  </p>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}