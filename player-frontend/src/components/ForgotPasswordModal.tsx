import { useState } from 'react';
import { ChevronLeft, ChevronRight, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';
import pokerDealer from '@/assets/poker-dealer.png';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToLogin?: () => void;
  onSendSuccess?: (email: string) => void;
}

export function ForgotPasswordModal({ isOpen, onClose, onBackToLogin, onSendSuccess }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const isMobile = useIsMobile();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Forgot Password:', { email });
    setIsSent(true);
    if (onSendSuccess) {
      onSendSuccess(email);
    }
  };

  const handleBack = () => {
    if (onBackToLogin) {
      onBackToLogin();
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
                onClick={handleBack}
                className="w-8 h-8 flex items-center justify-center bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-muted-foreground" />
              </button>
              <h2 className="text-lg font-bold text-foreground">Forgot Password</h2>
            </div>

            {/* Title Badge */}
            <div className="flex bg-secondary/50 rounded-full p-1 mb-6 w-fit">
              <div className="px-6 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-amber-500 to-blue-400 text-white shadow">
                Reset Password
              </div>
            </div>

            {!isSent ? (
              <>
                {/* Info Box */}
                <div className="p-4 bg-secondary/50 rounded-xl mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <KeyRound className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-foreground font-medium mb-1">Reset Your Password</p>
                      <p className="text-xs text-muted-foreground">
                        Enter your email address and we'll send you a link to reset your password.
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
                      onClick={handleBack}
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
              </>
            ) : (
              <>
                {/* Success State */}
                <div className="p-6 bg-secondary/50 rounded-xl mb-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <KeyRound className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Check Your Email</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    We've sent a password reset link to:
                  </p>
                  <p className="text-sm font-medium text-primary">{email}</p>
                </div>

                <Button
                  onClick={handleBack}
                  className="w-full h-14 bg-gradient-to-r from-amber-500 to-blue-400 hover:from-amber-600 hover:to-blue-500 text-white font-semibold shadow-lg"
                >
                  Back to Login
                </Button>
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

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left Side - Character */}
            <div className="relative overflow-hidden min-h-[280px] flex items-center justify-center order-1">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0f1520] via-[#0a1018] to-[#060a10]" />
              <div className="relative z-10 w-full max-w-[280px]">
                <img
                  src={pokerDealer}
                  alt="Poker Dealer"
                  className="w-full h-auto object-contain select-none pointer-events-none"
                  loading="eager"
                />
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="relative p-6 flex items-center order-2">
              <div className="relative w-full">
                <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-b from-white/20 via-white/5 to-transparent" />
                <div className="relative bg-gradient-to-br from-[#1a1f26] to-[#12161c] rounded-xl p-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Forgot Password</h2>
                  <p className="text-muted-foreground text-sm mb-5">Enter your email to reset your password</p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                      type="email"
                      placeholder="Enter Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 bg-[#2a3038] border-[#3a4048] text-white placeholder:text-muted-foreground focus:border-amber-400 text-sm"
                    />

                    <div className="flex gap-3">
                      <Button 
                        type="button"
                        onClick={handleBack}
                        variant="outline"
                        className="flex-1 h-11 bg-transparent border-[#3a4048] text-white hover:bg-[#2a3038] font-semibold text-sm"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        className="flex-1 h-11 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-black font-semibold text-sm"
                      >
                        Verify
                      </Button>
                    </div>
                  </form>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}