import { useState } from 'react';
import { ChevronLeft, ChevronRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useIsMobile } from '@/hooks/use-mobile';

interface OTPVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber?: string;
  onChangeNumber?: () => void;
  onResendOTP?: () => void;
  onVerifySuccess?: () => void;
}

export function OTPVerificationModal({ 
  isOpen, 
  onClose, 
  phoneNumber = 'XXX-XXX-XXXX',
  onChangeNumber,
  onResendOTP,
  onVerifySuccess
}: OTPVerificationModalProps) {
  const [otp, setOtp] = useState('');
  const isMobile = useIsMobile();

  if (!isOpen) return null;

  const handleVerify = () => {
    console.log('Verifying OTP:', otp);
    if (onVerifySuccess) {
      onVerifySuccess();
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
                onClick={onChangeNumber || onClose}
                className="w-8 h-8 flex items-center justify-center bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-muted-foreground" />
              </button>
              <h2 className="text-lg font-bold text-foreground">Enter OTP</h2>
            </div>

            {/* Title Badge */}
            <div className="flex bg-secondary/50 rounded-full p-1 mb-6 w-fit">
              <div className="px-6 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-amber-500 to-blue-400 text-white shadow">
                Verification
              </div>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-secondary/50 rounded-xl mb-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-foreground font-medium mb-1">Enter 6-Digit Code</p>
                  <p className="text-xs text-muted-foreground">
                    We sent a verification code to {phoneNumber}
                  </p>
                </div>
              </div>
            </div>

            {/* OTP Input */}
            <div className="flex justify-center mb-6">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
                className="gap-2"
              >
                <InputOTPGroup className="gap-2">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <InputOTPSlot
                      key={index}
                      index={index}
                      className="w-12 h-14 bg-secondary/80 border-border text-foreground text-xl font-bold rounded-lg"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            <div className="flex gap-4 mb-6">
              <Button
                type="button"
                variant="outline"
                onClick={onChangeNumber}
                className="flex-1 h-14 bg-secondary/50 border-border hover:bg-secondary text-foreground font-semibold"
              >
                Change Number
              </Button>
              <Button
                onClick={handleVerify}
                disabled={otp.length !== 6}
                className="flex-1 h-14 bg-gradient-to-r from-amber-500 to-blue-400 hover:from-amber-600 hover:to-blue-500 text-white font-semibold shadow-lg disabled:opacity-50"
              >
                Verify
              </Button>
            </div>

            {/* Resend */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Didn't receive the code?{' '}
                <button 
                  onClick={onResendOTP}
                  className="text-primary hover:underline font-medium"
                >
                  Resend OTP
                </button>
              </p>
            </div>
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
      
      <div className="relative w-full max-w-xl bg-card rounded-2xl overflow-hidden shadow-2xl border border-border">
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-7 h-7 flex items-center justify-center rounded-lg bg-secondary border border-border hover:bg-secondary/80 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>

          <div className="p-8">
            <div className="relative">
              <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-b from-white/20 via-white/5 to-transparent" />
              <div className="relative bg-gradient-to-br from-[#1a1f26] to-[#12161c] rounded-xl p-8 text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Please enter your 6 Digit OTP
                </h2>
                <p className="text-muted-foreground text-sm mb-6">
                  {phoneNumber}
                </p>

                <div className="flex justify-center mb-6">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={setOtp}
                    className="gap-3"
                  >
                    <InputOTPGroup className="gap-3">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                          className="w-14 h-14 bg-[#2a3038] border-[#3a4048] text-white text-xl font-bold rounded-lg focus:border-amber-400 focus:ring-cyan-400"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <Button 
                  onClick={handleVerify}
                  className="w-full h-12 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-black font-semibold mb-5"
                >
                  Verify OTP
                </Button>

                <div className="flex items-center justify-center gap-4">
                  <button 
                    onClick={onChangeNumber}
                    className="text-muted-foreground text-sm hover:text-white transition-colors underline"
                  >
                    Change the Number
                  </button>
                  <Button
                    variant="outline"
                    onClick={onResendOTP}
                    className="h-10 bg-transparent border-[#3a4048] text-white hover:bg-[#2a3038] text-sm"
                  >
                    Didn't receive the OTP?
                  </Button>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}