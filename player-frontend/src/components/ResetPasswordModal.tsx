import { useState } from 'react';
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import pokerDealer from '@/assets/poker-dealer.png';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ResetPasswordModal({ isOpen, onClose, onSuccess }: ResetPasswordModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const isMobile = useIsMobile();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords are identical",
        variant: "destructive",
      });
      return;
    }

    console.log('Reset Password:', { newPassword });
    
    toast({
      title: "Password updated",
      description: "Your password has been successfully updated",
    });
    
    if (onSuccess) {
      onSuccess();
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
              <h2 className="text-lg font-bold text-foreground">Reset Password</h2>
            </div>

            {/* Title Badge */}
            <div className="flex bg-secondary/50 rounded-full p-1 mb-6 w-fit">
              <div className="px-6 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-cyan-500 to-blue-400 text-white shadow">
                New Password
              </div>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-secondary/50 rounded-xl mb-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-foreground font-medium mb-1">Create New Password</p>
                  <p className="text-xs text-muted-foreground">
                    Enter your new password below. Make sure it's at least 8 characters.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              <Input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-14 bg-secondary/80 border-border text-foreground placeholder:text-muted-foreground"
              />
              <Input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                  disabled={!newPassword || !confirmPassword}
                  className="flex-1 h-14 bg-gradient-to-r from-cyan-500 to-blue-400 hover:from-cyan-600 hover:to-blue-500 text-white font-semibold shadow-lg disabled:opacity-50"
                >
                  Update
                </Button>
              </div>
            </form>
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
            <div className="relative overflow-hidden min-h-[280px] flex items-center justify-center">
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
            <div className="relative p-6 flex items-center">
              <div className="relative w-full">
                <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-b from-white/20 via-white/5 to-transparent" />
                <div className="relative bg-gradient-to-br from-[#1a1f26] to-[#12161c] rounded-xl p-6">
                  <h2 className="text-2xl font-bold text-white mb-5">Reset Password</h2>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                      type="password"
                      placeholder="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="h-11 bg-[#2a3038] border-[#3a4048] text-white placeholder:text-muted-foreground focus:border-cyan-400 text-sm"
                    />
                    <Input
                      type="password"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-11 bg-[#2a3038] border-[#3a4048] text-white placeholder:text-muted-foreground focus:border-cyan-400 text-sm"
                    />

                    <Button 
                      type="submit"
                      className="w-full h-11 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-600 hover:to-cyan-500 text-black font-semibold text-sm"
                    >
                      Update
                    </Button>
                  </form>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}