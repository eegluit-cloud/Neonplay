import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, Wallet, AlertCircle, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppMode, useWallet } from '@/contexts/AppModeContext';
import confetti from 'canvas-confetti';

interface RedeemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'form' | 'processing' | 'success';

export function RedeemModal({ isOpen, onClose }: RedeemModalProps) {
  const { mode } = useAppMode();
  const { scBalance, updateSCBalance, addActivity } = useWallet();
  
  const [step, setStep] = useState<Step>('form');
  const [amount, setAmount] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setAmount('');
      setUtrNumber('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Only available in sweepstakes mode
  if (mode !== 'sweepstakes') {
    return createPortal(
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full sm:max-w-md sm:mx-4 bg-card border-t sm:border border-border rounded-t-2xl sm:rounded-2xl p-6 text-center">
          <button 
            onClick={onClose}
            className="absolute top-4 left-4 w-7 h-7 rounded-lg bg-secondary border border-border flex items-center justify-center"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4 mt-6" />
          <h2 className="text-xl font-bold text-foreground mb-2">Sweepstakes Mode Required</h2>
          <p className="text-muted-foreground mb-4">
            Redemption is only available in Sweepstakes mode.
          </p>
          <Button onClick={onClose}>Got it</Button>
        </div>
      </div>,
      document.body
    );
  }

  const handleAmountChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setAmount(numericValue);
    setError('');
  };

  const handleSubmit = () => {
    const amountNum = parseInt(amount);
    
    if (!amount || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (amountNum > scBalance) {
      setError('Insufficient SC balance');
      return;
    }
    
    if (amountNum < 100) {
      setError('Minimum redemption is 100 SC');
      return;
    }
    
    setStep('processing');
    
    setTimeout(() => {
      updateSCBalance(-amountNum);
      addActivity({
        type: 'redeem',
        coinType: 'SC',
        amount: amountNum,
        status: 'completed',
        description: `Redeemed ${amountNum.toLocaleString()} SC`,
        referenceId: utrNumber.trim() || undefined
      });
      
      setStep('success');
      triggerConfetti();
    }, 2000);
  };

  const triggerConfetti = () => {
    const count = 200;
    const defaults = { origin: { y: 0.7 }, zIndex: 9999 };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55, colors: ['#22d3ee', '#06b6d4', '#0891b2'] });
    fire(0.2, { spread: 60, colors: ['#22d3ee', '#06b6d4'] });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: ['#06b6d4', '#22d3ee'] });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2, colors: ['#0891b2'] });
    fire(0.1, { spread: 120, startVelocity: 45, colors: ['#22d3ee', '#06b6d4'] });
  };

  const handleClose = () => {
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />
      
      <div className="relative w-full sm:max-w-md sm:mx-4 bg-card border-t sm:border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto scrollbar-hide animate-slide-up sm:animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card border-b border-border">
          <div className="flex items-center gap-3 p-4">
            <button 
              onClick={handleClose}
              className="w-7 h-7 rounded-lg bg-secondary border border-border flex items-center justify-center hover:bg-secondary/80 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <h1 className="text-lg font-bold text-foreground">Redeem</h1>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {step === 'form' && (
            <div className="space-y-5">
              {/* Balance Card */}
              <div className="bg-gradient-to-r from-cyan-500/20 to-teal-500/20 rounded-xl p-4 border border-cyan-500/30">
                <p className="text-sm text-muted-foreground mb-1">Available for Redemption</p>
                <p className="text-2xl font-bold text-cyan-400">
                  {scBalance.toLocaleString()} <span className="text-base">SC</span>
                </p>
              </div>

              {/* Form */}
              <div className="space-y-4">
                {/* Amount Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Amount</label>
                  <div className="relative">
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      className="h-12 text-base pr-14 bg-secondary/50 border-border"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-400 font-semibold text-sm">
                      SC
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Minimum: 100 SC</p>
                </div>

                {/* UTR Number Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">UTR Number</label>
                  <Input
                    type="text"
                    placeholder="Enter your UTR number"
                    value={utrNumber}
                    onChange={(e) => {
                      setUtrNumber(e.target.value);
                      setError('');
                    }}
                    className="h-12 text-base bg-secondary/50 border-border"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  onClick={handleSubmit}
                  className="w-full h-12 text-base font-bold bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-600 hover:to-teal-500 text-white shadow-lg shadow-cyan-500/25"
                >
                  Redeem
                </Button>
              </div>

              {/* Info */}
              <p className="text-xs text-muted-foreground text-center">
                Redemptions are typically processed within 24-48 hours.
              </p>
            </div>
          )}

          {step === 'processing' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-14 h-14 rounded-full bg-gradient-to-r from-cyan-500 to-teal-400 flex items-center justify-center mb-5">
                <Loader2 className="w-7 h-7 text-white animate-spin" />
              </div>
              <h2 className="text-lg font-bold text-foreground mb-2">Processing...</h2>
              <p className="text-sm text-muted-foreground text-center">
                Please wait while we process your request.
              </p>
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-teal-400 flex items-center justify-center mb-5">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Redemption Successful!</h2>
              <p className="text-sm text-muted-foreground mb-5 max-w-xs">
                Your request for <span className="text-cyan-400 font-semibold">{parseInt(amount).toLocaleString()} SC</span> has been submitted.
              </p>
              
              <div className="bg-secondary/50 rounded-xl border border-border p-4 w-full max-w-xs mb-5 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-semibold text-foreground">{parseInt(amount).toLocaleString()} SC</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">UTR Number</span>
                  <span className="font-semibold text-foreground">{utrNumber}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-border pt-2">
                  <span className="text-muted-foreground">New Balance</span>
                  <span className="font-bold text-cyan-400">{scBalance.toLocaleString()} SC</span>
                </div>
              </div>

              <Button
                onClick={handleClose}
                className="bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-600 hover:to-teal-500"
              >
                Done
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
