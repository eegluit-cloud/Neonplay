import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Trophy, Gift, Coins, Check, ChevronRight, Loader2, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppMode, useWallet } from '@/contexts/AppModeContext';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';

interface RedeemPrizesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (prizeType: string, scAmount: number) => void;
}

type Step = 'select-prize' | 'confirm' | 'processing' | 'success';

interface Prize {
  id: string;
  name: string;
  description: string;
  scCost: number;
  category: 'gift-cards' | 'electronics' | 'experiences' | 'merchandise';
  image: string;
  popular?: boolean;
}

const prizes: Prize[] = [
  { id: 'gc-25', name: '$25 Gift Card', description: 'Amazon, Visa, or Target', scCost: 2500, category: 'gift-cards', image: '🎁', popular: true },
  { id: 'gc-50', name: '$50 Gift Card', description: 'Amazon, Visa, or Target', scCost: 5000, category: 'gift-cards', image: '🎁' },
  { id: 'gc-100', name: '$100 Gift Card', description: 'Amazon, Visa, or Target', scCost: 10000, category: 'gift-cards', image: '🎁', popular: true },
  { id: 'gc-250', name: '$250 Gift Card', description: 'Amazon, Visa, or Target', scCost: 25000, category: 'gift-cards', image: '🎁' },
  { id: 'gc-500', name: '$500 Gift Card', description: 'Amazon, Visa, or Target', scCost: 50000, category: 'gift-cards', image: '🎁' },
  { id: 'airpods', name: 'AirPods Pro', description: 'Apple AirPods Pro 2nd Gen', scCost: 25000, category: 'electronics', image: '🎧' },
  { id: 'switch', name: 'Nintendo Switch', description: 'OLED Model', scCost: 35000, category: 'electronics', image: '🎮' },
  { id: 'ipad', name: 'iPad 10th Gen', description: '64GB WiFi', scCost: 45000, category: 'electronics', image: '📱', popular: true },
  { id: 'ps5', name: 'PlayStation 5', description: 'Digital Edition', scCost: 50000, category: 'electronics', image: '🎮' },
  { id: 'merch-hat', name: 'Premium Hat', description: 'Exclusive branded cap', scCost: 1000, category: 'merchandise', image: '🧢' },
  { id: 'merch-hoodie', name: 'Premium Hoodie', description: 'Exclusive branded hoodie', scCost: 3500, category: 'merchandise', image: '👕' },
  { id: 'exp-vip', name: 'VIP Experience', description: 'Exclusive VIP event access', scCost: 75000, category: 'experiences', image: '⭐' },
];

const categories = [
  { id: 'all', label: 'All Prizes' },
  { id: 'gift-cards', label: 'Gift Cards' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'merchandise', label: 'Merchandise' },
  { id: 'experiences', label: 'Experiences' },
];

export function RedeemPrizesModal({ isOpen, onClose, onSuccess }: RedeemPrizesModalProps) {
  const { mode } = useAppMode();
  const { scBalance, updateSCBalance, addActivity } = useWallet();
  
  const [step, setStep] = useState<Step>('select-prize');
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [customAmount, setCustomAmount] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep('select-prize');
      setSelectedPrize(null);
      setActiveCategory('all');
      setCustomAmount('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Only available in sweepstakes mode
  if (mode !== 'sweepstakes') {
    return createPortal(
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-card rounded-2xl border border-border p-6 max-w-md w-full text-center">
          <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
          <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Sweepstakes Mode Required</h2>
          <p className="text-muted-foreground mb-4">
            Prize redemption is only available in Sweepstakes mode. Switch to Sweepstakes mode to redeem your SC for prizes.
          </p>
          <Button onClick={onClose} className="bg-primary hover:bg-primary/90">
            Got it
          </Button>
        </div>
      </div>,
      document.body
    );
  }

  const filteredPrizes = activeCategory === 'all' 
    ? prizes 
    : prizes.filter(p => p.category === activeCategory);

  const handlePrizeSelect = (prize: Prize) => {
    setSelectedPrize(prize);
    setStep('confirm');
  };

  const handleConfirmRedeem = () => {
    if (!selectedPrize || scBalance < selectedPrize.scCost) return;
    
    setStep('processing');
    
    setTimeout(() => {
      updateSCBalance(-selectedPrize.scCost);
      addActivity({
        type: 'redeem',
        coinType: 'SC',
        amount: selectedPrize.scCost,
        status: 'completed',
        description: `Redeemed: ${selectedPrize.name}`
      });
      
      setStep('success');
      triggerConfetti();
      onSuccess?.(selectedPrize.name, selectedPrize.scCost);
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

    fire(0.25, { spread: 26, startVelocity: 55, colors: ['#f59e0b', '#eab308', '#fbbf24'] });
    fire(0.2, { spread: 60, colors: ['#f59e0b', '#eab308'] });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: ['#fbbf24', '#f59e0b'] });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2, colors: ['#eab308'] });
    fire(0.1, { spread: 120, startVelocity: 45, colors: ['#fbbf24', '#f59e0b'] });
  };

  const handleBack = () => {
    if (step === 'confirm') {
      setStep('select-prize');
      setSelectedPrize(null);
    }
  };

  const formatSC = (amount: number) => `SC ${amount.toLocaleString()}`;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-card rounded-2xl border border-border w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-amber-500/10 to-orange-500/10">
          <div className="flex items-center gap-3">
            {step === 'confirm' && (
              <button onClick={handleBack} className="text-muted-foreground hover:text-foreground">
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
            )}
            <Trophy className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="text-lg font-bold text-foreground">Redeem Prizes</h2>
              <p className="text-xs text-muted-foreground">
                Your SC Balance: <span className="text-amber-400 font-semibold">{formatSC(scBalance)}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {step === 'select-prize' && (
            <div className="space-y-4">
              {/* Category Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                      activeCategory === cat.id
                        ? "bg-amber-500 text-white"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Prizes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredPrizes.map(prize => {
                  const canAfford = scBalance >= prize.scCost;
                  return (
                    <button
                      key={prize.id}
                      onClick={() => canAfford && handlePrizeSelect(prize)}
                      disabled={!canAfford}
                      className={cn(
                        "relative p-4 rounded-xl border text-left transition-all",
                        canAfford
                          ? "bg-muted/50 border-border hover:border-amber-500/50 hover:bg-muted"
                          : "bg-muted/20 border-border/50 opacity-60 cursor-not-allowed"
                      )}
                    >
                      {prize.popular && (
                        <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          Popular
                        </div>
                      )}
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{prize.image}</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">{prize.name}</h3>
                          <p className="text-xs text-muted-foreground truncate">{prize.description}</p>
                          <div className="flex items-center gap-1 mt-2">
                            <Coins className="w-4 h-4 text-amber-400" />
                            <span className={cn(
                              "font-bold text-sm",
                              canAfford ? "text-amber-400" : "text-muted-foreground"
                            )}>
                              {formatSC(prize.scCost)}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className={cn(
                          "w-5 h-5 flex-shrink-0",
                          canAfford ? "text-muted-foreground" : "text-muted-foreground/50"
                        )} />
                      </div>
                    </button>
                  );
                })}
              </div>

              {filteredPrizes.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No prizes available in this category.
                </div>
              )}
            </div>
          )}

          {step === 'confirm' && selectedPrize && (
            <div className="space-y-6">
              {/* Selected Prize Card */}
              <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl p-6 border border-amber-500/20 text-center">
                <div className="text-6xl mb-4">{selectedPrize.image}</div>
                <h3 className="text-xl font-bold text-foreground mb-1">{selectedPrize.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{selectedPrize.description}</p>
                <div className="inline-flex items-center gap-2 bg-card px-4 py-2 rounded-full border border-border">
                  <Coins className="w-5 h-5 text-amber-400" />
                  <span className="font-bold text-lg text-amber-400">{formatSC(selectedPrize.scCost)}</span>
                </div>
              </div>

              {/* Balance Summary */}
              <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current Balance</span>
                  <span className="font-semibold text-foreground">{formatSC(scBalance)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Prize Cost</span>
                  <span className="font-semibold text-red-400">-{formatSC(selectedPrize.scCost)}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="font-medium text-foreground">Remaining Balance</span>
                  <span className="font-bold text-foreground">{formatSC(scBalance - selectedPrize.scCost)}</span>
                </div>
              </div>

              {/* Terms */}
              <p className="text-xs text-muted-foreground text-center">
                By confirming, you agree to the prize redemption terms. Prizes are typically delivered within 3-5 business days. 
                Gift cards will be sent to your registered email.
              </p>

              {/* Confirm Button */}
              <Button 
                onClick={handleConfirmRedeem}
                className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold"
              >
                <Gift className="w-5 h-5 mr-2" />
                Confirm Redemption
              </Button>
            </div>
          )}

          {step === 'processing' && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-amber-400 animate-spin mb-4" />
              <p className="text-lg font-semibold text-foreground">Processing your redemption...</p>
              <p className="text-sm text-muted-foreground">Please wait while we confirm your prize.</p>
            </div>
          )}

          {step === 'success' && selectedPrize && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <Sparkles className="w-8 h-8 text-amber-400 mb-2" />
              <h3 className="text-2xl font-bold text-foreground mb-2">Prize Redeemed!</h3>
              <p className="text-muted-foreground mb-4 max-w-sm">
                Your <span className="text-foreground font-semibold">{selectedPrize.name}</span> redemption has been confirmed. 
                Check your email for delivery details.
              </p>
              <div className="bg-muted/50 rounded-xl p-4 w-full max-w-xs mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">SC Spent</span>
                  <span className="font-semibold text-foreground">{formatSC(selectedPrize.scCost)}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-muted-foreground">New Balance</span>
                  <span className="font-bold text-amber-400">{formatSC(scBalance)}</span>
                </div>
              </div>
              <Button onClick={onClose} className="bg-primary hover:bg-primary/90">
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
