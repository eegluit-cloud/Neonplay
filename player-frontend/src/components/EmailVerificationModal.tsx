import { useState } from 'react';
import { ChevronLeft, ChevronRight, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';
import casinoDealer from '@/assets/casino-dealer.png';

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerifyByMobile?: () => void;
  email?: string;
}

export function EmailVerificationModal({ isOpen, onClose, onVerifyByMobile, email: initialEmail }: EmailVerificationModalProps) {
  const [email, setEmail] = useState(initialEmail || '');
  const [isSent, setIsSent] = useState(false);
  const isMobile = useIsMobile();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Verify email:', email);
    setIsSent(true);
  };

  const handleResend = () => {
    console.log('Resend verification to:', email);
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
              <h2 className="text-lg font-bold text-foreground">Email Verification</h2>
            </div>

            {/* Title Badge */}
            <div className="flex bg-secondary/50 rounded-full p-1 mb-6 w-fit">
              <div className="px-6 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-amber-500 to-blue-400 text-white shadow">
                Verify Account
              </div>
            </div>

            {!isSent ? (
              <>
                {/* Info Box */}
                <div className="p-4 bg-secondary/50 rounded-xl mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-foreground font-medium mb-1">Verify Your Email</p>
                      <p className="text-xs text-muted-foreground">
                        To ensure the security of your account and unlock all features, please verify your email address.
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                  <Input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 bg-secondary/80 border-border text-foreground placeholder:text-muted-foreground"
                  />

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      className="flex-1 h-14 bg-secondary/50 border-border hover:bg-secondary text-foreground font-semibold"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={!email.trim()}
                      className="flex-1 h-14 bg-gradient-to-r from-amber-500 to-blue-400 hover:from-amber-600 hover:to-blue-500 text-white font-semibold shadow-lg disabled:opacity-50"
                    >
                      Send Link
                    </Button>
                  </div>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-muted-foreground text-xs">Or</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Mobile verification option */}
                <Button
                  variant="outline"
                  onClick={onVerifyByMobile}
                  className="w-full h-14 bg-secondary/50 border-border hover:bg-secondary text-foreground font-semibold"
                >
                  Verify by Mobile Number
                </Button>
              </>
            ) : (
              <>
                {/* Success State */}
                <div className="p-6 bg-secondary/50 rounded-xl mb-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Check Your Email</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    We've sent a verification link to:
                  </p>
                  <p className="text-sm font-medium text-primary">{email}</p>
                </div>

                <div className="space-y-4">
                  <Button
                    onClick={onClose}
                    className="w-full h-14 bg-gradient-to-r from-amber-500 to-blue-400 hover:from-amber-600 hover:to-blue-500 text-white font-semibold shadow-lg"
                  >
                    Done
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">
                    Didn't receive the email?{' '}
                    <button 
                      onClick={handleResend}
                      className="text-primary hover:underline font-medium"
                    >
                      Resend
                    </button>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Desktop version - original design with dealer image
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

          <div className="grid grid-cols-1 md:grid-cols-2 min-h-[380px]">
            {/* Left Side - Character */}
            <div className="relative flex items-center justify-center p-6 order-1">
              <img
                src={casinoDealer}
                alt="Casino Dealer"
                className="w-full max-w-[280px] h-auto object-contain select-none pointer-events-none"
                loading="eager"
              />
            </div>

            {/* Right Side - Content */}
            <div className="relative p-6 flex items-center order-2">
              <div className="relative w-full">
                <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-b from-white/20 via-white/5 to-transparent" />
                <div className="relative bg-gradient-to-br from-[#1a1f26] to-[#12161c] rounded-xl p-6 text-center">
                  {!isSent ? (
                    <>
                      <h2 className="text-2xl font-bold text-white mb-3">
                        Verify Your Email to Start Playing!
                      </h2>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                        It looks like your email is not verified. To ensure the security of your account and unlock the game, please verify your email address.
                      </p>

                      <form onSubmit={handleSubmit} className="space-y-3">
                        <Input
                          type="email"
                          placeholder="Enter Email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-11 bg-[#2a3038] border-[#3a4048] text-white placeholder:text-muted-foreground focus:border-amber-400 text-sm"
                        />
                        <Button 
                          type="submit"
                          className="w-full h-11 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-black font-semibold text-sm"
                        >
                          Verify
                        </Button>
                      </form>

                      <button 
                        onClick={onVerifyByMobile}
                        className="mt-4 text-muted-foreground text-xs hover:text-white transition-colors underline"
                      >
                        Or verify by Your Mobile No
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-8 h-8 text-primary" />
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-3">Check Your Email</h2>
                      <p className="text-muted-foreground text-sm mb-2">
                        We've sent a verification link to:
                      </p>
                      <p className="text-primary font-medium mb-5">{email}</p>

                      <Button 
                        onClick={onClose}
                        className="w-full h-11 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-black font-semibold text-sm"
                      >
                        Done
                      </Button>

                      <p className="mt-4 text-muted-foreground text-xs">
                        Didn't receive the email?{' '}
                        <button 
                          onClick={handleResend}
                          className="text-amber-400 hover:text-amber-300 underline"
                        >
                          Resend
                        </button>
                      </p>
                    </>
                  )}
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}