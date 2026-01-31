import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Loader2, Copy, Coins, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AppleIcon, GooglePayColorIcon, VisaIcon, MastercardIcon, BitcoinIcon, EthereumIcon, TetherIcon } from '@/components/icons/PaymentIcons';
import { useAppMode, useWallet } from '@/contexts/AppModeContext';
import { DiamondIcon } from '@/components/icons/DiamondIcon';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';
import goldCoinsStack from '@/assets/gold-coins-stack.png';
import { useCoinPackages, useCryptoOptions, usePurchase } from '@/hooks/useWallet';

interface GetCoinsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (amount: number, coinType: 'GC' | 'SC') => void;
  defaultCoinType?: 'GC' | 'SC';
}

type Step = 'select-pack' | 'payment' | 'card-details' | 'crypto-deposit' | 'processing' | 'success';
type PaymentMethodType = 'credit-card' | 'apple-pay' | 'google-pay' | 'bank-transfer' | 'crypto' | null;

// Fallback coin packs if API not available
const defaultCoinPacks = [
  { id: 'pack1', gcAmount: 2000, scBonusAmount: 2, priceUsd: 2, name: 'Starter', isPopular: false, isBestValue: false, sortOrder: 1 },
  { id: 'pack2', gcAmount: 5000, scBonusAmount: 5, priceUsd: 5, name: 'Bronze', isPopular: false, isBestValue: false, sortOrder: 2 },
  { id: 'pack3', gcAmount: 10000, scBonusAmount: 10, priceUsd: 10, name: 'Silver', isPopular: true, isBestValue: false, sortOrder: 3 },
  { id: 'pack4', gcAmount: 20000, scBonusAmount: 20, priceUsd: 20, name: 'Gold', isPopular: false, isBestValue: false, sortOrder: 4 },
  { id: 'pack5', gcAmount: 35000, scBonusAmount: 35, priceUsd: 35, name: 'Platinum', isPopular: false, isBestValue: true, sortOrder: 5 },
  { id: 'pack6', gcAmount: 50000, scBonusAmount: 50, priceUsd: 50, name: 'Diamond', isPopular: false, isBestValue: false, sortOrder: 6 },
  { id: 'pack7', gcAmount: 100000, scBonusAmount: 100, priceUsd: 100, name: 'Elite', isPopular: false, isBestValue: false, sortOrder: 7 },
  { id: 'pack8', gcAmount: 200000, scBonusAmount: 200, priceUsd: 200, name: 'Legend', isPopular: false, isBestValue: false, sortOrder: 8 },
  { id: 'pack9', gcAmount: 350000, scBonusAmount: 350, priceUsd: 350, name: 'Champion', isPopular: false, isBestValue: false, sortOrder: 9 },
  { id: 'pack10', gcAmount: 500000, scBonusAmount: 500, priceUsd: 500, name: 'Ultimate', isPopular: false, isBestValue: false, sortOrder: 10 },
];

export function GetCoinsModal({ isOpen, onClose, onSuccess }: GetCoinsModalProps) {
  const { mode } = useAppMode();
  const { updateGCBalance, updateSCBalance, addActivity } = useWallet();

  // Fetch data from API
  const { packages: apiPackages, isLoading: packagesLoading } = useCoinPackages();
  const { options: cryptoOptions, isLoading: cryptoLoading } = useCryptoOptions();
  const { purchase: apiPurchase, isProcessing } = usePurchase();

  // Use API packages or fallback to defaults
  const coinPacks = useMemo(() => {
    if (apiPackages.length > 0) {
      return apiPackages.sort((a, b) => a.sortOrder - b.sortOrder);
    }
    return defaultCoinPacks;
  }, [apiPackages]);

  // Build crypto addresses from API data
  const cryptoAddresses = useMemo(() => {
    const addresses: Record<string, Record<string, string>> = {};
    cryptoOptions.forEach(option => {
      addresses[option.currency] = {};
      option.networks.forEach(net => {
        addresses[option.currency][net.network] = net.address;
      });
    });
    return addresses;
  }, [cryptoOptions]);

  const [step, setStep] = useState<Step>('select-pack');
  const [selectedPack, setSelectedPack] = useState<typeof coinPacks[0] | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethodType>(null);

  // Card details - empty by default for security
  const [cardNumber, setCardNumber] = useState('');
  const [cardMonth, setCardMonth] = useState('');
  const [cardYear, setCardYear] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [confirmCvv, setConfirmCvv] = useState('');

  // Crypto - dynamic based on available options
  const availableCryptos = useMemo(() => cryptoOptions.map(o => o.currency), [cryptoOptions]);
  const [selectedCrypto, setSelectedCrypto] = useState<string>(availableCryptos[0] || 'USDT');
  const [selectedNetwork, setSelectedNetwork] = useState<string>('ERC20');
  const [addressCopied, setAddressCopied] = useState(false);

  // Update selected crypto when options load
  useEffect(() => {
    if (availableCryptos.length > 0 && !availableCryptos.includes(selectedCrypto)) {
      setSelectedCrypto(availableCryptos[0]);
    }
  }, [availableCryptos, selectedCrypto]);

  // Get available networks for selected crypto
  const availableNetworks = useMemo(() => {
    const option = cryptoOptions.find(o => o.currency === selectedCrypto);
    return option?.networks.map(n => n.network) || ['ERC20'];
  }, [cryptoOptions, selectedCrypto]);

  useEffect(() => {
    if (isOpen) {
      setStep('select-pack');
      setSelectedPack(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `${Math.floor(amount / 1000)}K`;
    return amount.toString();
  };

  const getBadge = (pack: typeof coinPacks[0]) => {
    if (pack.isPopular) return 'Popular';
    if (pack.isBestValue) return 'Best Value';
    if (pack.name === 'Elite') return 'Featured';
    if (pack.name === 'Ultimate') return 'VIP';
    return null;
  };

  const handlePackSelect = (pack: typeof coinPacks[0]) => {
    setSelectedPack(pack);
    setStep('payment');
  };

  const handlePaymentSelect = (method: PaymentMethodType) => {
    setSelectedPayment(method);
    if (method === 'credit-card') {
      setStep('card-details');
    } else if (method === 'crypto') {
      setStep('crypto-deposit');
    } else {
      handleConfirmPurchase();
    }
  };

  const handleBack = () => {
    if (step === 'card-details' || step === 'crypto-deposit') {
      setStep('payment');
    } else if (step === 'payment') {
      setStep('select-pack');
      setSelectedPack(null);
    }
    setSelectedPayment(null);
  };

  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ['#22d3ee', '#06b6d4', '#fbbf24', '#f59e0b']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ['#22d3ee', '#06b6d4', '#fbbf24', '#f59e0b']
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  const handleConfirmPurchase = async () => {
    setStep('processing');

    try {
      if (selectedPack && selectedPayment) {
        // Try API purchase first
        try {
          await apiPurchase(selectedPack.id, selectedPayment);
        } catch {
          // Fallback to local update if API fails (demo mode)
        }

        // Add both GC and SC
        updateGCBalance(selectedPack.gcAmount);
        updateSCBalance(selectedPack.scBonusAmount);

        addActivity({
          type: 'purchase',
          coinType: 'GC',
          amount: selectedPack.gcAmount,
          status: 'completed',
          description: `Purchased ${selectedPack.name} Coin Pack`
        });

        onSuccess?.(selectedPack.gcAmount, 'GC');
      }

      setStep('success');
      triggerConfetti();
    } catch (error) {
      console.error('Purchase failed:', error);
      setStep('payment');
    }
  };

  const handleClose = () => {
    onClose();
    setStep('select-pack');
    setSelectedPack(null);
    setSelectedPayment(null);
  };

  const copyAddress = () => {
    const address = cryptoAddresses[selectedCrypto]?.[selectedNetwork];
    if (address) {
      navigator.clipboard.writeText(address);
      setAddressCopied(true);
      setTimeout(() => setAddressCopied(false), 2000);
    }
  };

  // Loading state
  if (packagesLoading && isOpen) {
    return createPortal(
      <div className="fixed inset-0 z-[80] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-card p-8 rounded-2xl">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
        </div>
      </div>,
      document.body
    );
  }

  // Coin Pack Card Component - Optimized for mobile
  const CoinPackCard = ({ pack }: { pack: typeof coinPacks[0] }) => {
    const badge = getBadge(pack);
    return (
      <button
        onClick={() => handlePackSelect(pack)}
        className="relative flex flex-col overflow-hidden rounded-xl border border-cyan-500/20 bg-gradient-to-b from-[#0a0a0a] to-[#0f1a1a] transition-all hover:scale-[1.02] hover:border-cyan-500/40 group"
      >
        {/* Badge */}
        {badge && (
          <span className={cn(
            "absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold rounded z-10",
            badge === 'Featured' ? "bg-amber-700 text-amber-100" :
            badge === 'Best Value' ? "bg-cyan-600 text-white" :
            "bg-cyan-700 text-cyan-100"
          )}>
            {badge}
          </span>
        )}

        {/* Top - Image with glow */}
        <div className="relative w-full h-28 sm:h-32 flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0a0a0a] to-[#111]">
          {/* Golden glow effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-amber-500/40 rounded-full blur-2xl" />
          </div>
          {/* Sparkles */}
          <Sparkles className="absolute top-2 left-3 w-2 h-2 text-white/60" />
          <Sparkles className="absolute top-4 right-3 w-2.5 h-2.5 text-amber-400/80" />
          {/* Coins image */}
          <img
            src={goldCoinsStack}
            alt="Gold Coins"
            className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-2xl"
          />
        </div>

        {/* Bottom - Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-3 border-t border-cyan-500/10">
          {/* Coin amounts */}
          <div className="flex items-center gap-1 mb-0.5">
            <span className="text-base sm:text-lg font-bold text-amber-400">{formatAmount(pack.gcAmount)}</span>
            <Coins className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500" />
            <span className="text-xs text-muted-foreground">+</span>
            <span className="text-base sm:text-lg font-bold text-cyan-400">{pack.scBonusAmount}</span>
            <DiamondIcon size={14} className="text-cyan-400" />
          </div>
          <p className="text-xs text-muted-foreground mb-2">Coins</p>

          {/* Price button */}
          <div className="w-full py-2 px-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-center">
            <span className="font-bold text-white text-sm sm:text-base">${pack.priceUsd}</span>
          </div>
        </div>
      </button>
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />
      
      <div className="relative w-full sm:max-w-2xl sm:mx-4 bg-gradient-to-b from-card to-background border-t-2 sm:border-2 border-primary/50 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] sm:max-h-[85vh] overflow-y-auto scrollbar-hide animate-slide-up sm:animate-scale-in">
        <div className="p-4 sm:p-6 relative">
          
          {/* Select Pack Step */}
          {step === 'select-pack' && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-4 sticky top-0 bg-card/95 backdrop-blur-sm z-10 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 -mt-4 sm:-mt-6">
                <button onClick={handleClose} className="w-7 h-7 flex items-center justify-center bg-secondary hover:bg-secondary/80 border border-border rounded-lg transition-colors">
                  <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                </button>
                <h2 className="text-base sm:text-lg font-bold text-foreground">Get Coins</h2>
              </div>

              {/* Scrollable Coin Packs Grid - 2 columns */}
              <div className="grid grid-cols-2 gap-3 mb-4 pb-2">
                {coinPacks.map((pack) => (
                  <CoinPackCard key={pack.id} pack={pack} />
                ))}
              </div>

              {/* Info text */}
              <p className="text-center text-xs text-muted-foreground pb-2">
                Each pack includes Gold Coins for social play and Sweepstakes Coins for prizes.
              </p>
            </div>
          )}

          {/* Payment Step */}
          {step === 'payment' && selectedPack && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <button onClick={handleBack} className="w-8 h-8 rounded-lg bg-[#2a2a2a] flex items-center justify-center hover:bg-[#3a3a3a] transition-colors">
                  <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                </button>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">Select Payment</h2>
              </div>

              <div className="mb-6 p-4 bg-secondary/50 rounded-xl">
                <p className="text-sm text-muted-foreground mb-2">Coin Pack</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="text-xl font-bold text-amber-400">{formatAmount(selectedPack.gcAmount)}</span>
                    <Coins className="w-5 h-5 text-amber-500" />
                  </div>
                  <span className="text-muted-foreground">+</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xl font-bold text-cyan-400">{selectedPack.scBonusAmount}</span>
                    <DiamondIcon size={18} className="text-cyan-400" />
                  </div>
                </div>
                <p className="text-lg font-semibold text-foreground mt-2">${selectedPack.priceUsd}</p>
              </div>

              <div className="space-y-3">
                <button onClick={() => handlePaymentSelect('credit-card')} className="w-full flex items-center gap-4 p-4 bg-secondary/80 hover:bg-secondary border border-border rounded-xl transition-all group">
                  <div className="flex items-center gap-2">
                    <VisaIcon className="w-12 h-8" />
                    <MastercardIcon className="w-12 h-8" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-foreground">Credit Card</p>
                    <p className="text-sm text-muted-foreground">Visa, Mastercard, Amex</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => handlePaymentSelect('apple-pay')} className="flex items-center gap-3 p-4 bg-secondary/80 hover:bg-secondary border border-border rounded-xl transition-all">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      <AppleIcon className="w-6 h-6 text-black" />
                    </div>
                    <p className="font-semibold text-foreground text-sm">Apple Pay</p>
                  </button>
                  <button onClick={() => handlePaymentSelect('google-pay')} className="flex items-center gap-3 p-4 bg-secondary/80 hover:bg-secondary border border-border rounded-xl transition-all">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1.5">
                      <GooglePayColorIcon className="w-full h-full" />
                    </div>
                    <p className="font-semibold text-foreground text-sm">Google Pay</p>
                  </button>
                </div>

                <button onClick={() => handlePaymentSelect('crypto')} className="w-full flex items-center gap-4 p-4 bg-secondary/80 hover:bg-secondary border border-border rounded-xl transition-all">
                  <div className="flex items-center gap-1">
                    <BitcoinIcon className="w-8 h-8" />
                    <EthereumIcon className="w-8 h-8" />
                    <TetherIcon className="w-8 h-8" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-foreground">Crypto</p>
                    <p className="text-sm text-muted-foreground">BTC, ETH, USDT & more</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>
          )}

          {/* Card Details Step */}
          {step === 'card-details' && selectedPack && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <button onClick={handleBack} className="w-8 h-8 rounded-lg bg-[#2a2a2a] flex items-center justify-center hover:bg-[#3a3a3a] transition-colors">
                  <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                </button>
                <h2 className="text-lg font-bold text-foreground">Card Details</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center bg-secondary/80 border border-border rounded-xl overflow-hidden">
                  <Input
                    type="text"
                    placeholder="Card Number"
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                      const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                      setCardNumber(formatted);
                    }}
                    className="h-14 bg-transparent border-0 text-foreground flex-1"
                  />
                  <div className="flex items-center gap-2 pr-4">
                    <MastercardIcon className="w-8 h-5" />
                    <VisaIcon className="w-8 h-5" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center bg-secondary/80 border border-border rounded-xl overflow-hidden">
                    <Input
                      type="text"
                      placeholder="MM"
                      maxLength={2}
                      value={cardMonth}
                      onChange={(e) => setCardMonth(e.target.value.replace(/\D/g, ''))}
                      className="h-14 bg-transparent border-0 text-center flex-1"
                    />
                    <span className="text-muted-foreground">/</span>
                    <Input
                      type="text"
                      placeholder="YY"
                      maxLength={2}
                      value={cardYear}
                      onChange={(e) => setCardYear(e.target.value.replace(/\D/g, ''))}
                      className="h-14 bg-transparent border-0 text-center flex-1"
                    />
                  </div>
                  <Input
                    type="password"
                    placeholder="CVV"
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                    className="h-14 bg-secondary/80 border-border"
                  />
                </div>

                <Input
                  type="text"
                  placeholder="Name On Card"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="h-14 bg-secondary/80 border-border"
                />
              </div>

              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-muted-foreground">
                  <span>Coin Pack</span>
                  <span>{formatAmount(selectedPack.gcAmount)} GC + {selectedPack.scBonusAmount} SC</span>
                </div>
                <div className="flex justify-between text-foreground font-semibold text-lg pt-2 border-t border-border">
                  <span>Total</span>
                  <span>${selectedPack.priceUsd}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 gap-4">
                <span className="text-foreground font-medium">Confirm CVV</span>
                <Input
                  type="password"
                  placeholder="CVV"
                  maxLength={4}
                  value={confirmCvv}
                  onChange={(e) => setConfirmCvv(e.target.value.replace(/\D/g, ''))}
                  className="h-12 w-32 bg-secondary/80 border-border"
                />
              </div>

              <Button
                onClick={handleConfirmPurchase}
                disabled={!cardMonth || !cardYear || !cardCvv || !cardName || !confirmCvv || isProcessing}
                className="w-full h-14 mt-6 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold text-lg shadow-lg"
              >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : `Confirm Purchase - $${selectedPack.priceUsd}`}
              </Button>
            </div>
          )}

          {/* Processing Step */}
          {step === 'processing' && (
            <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
              <h3 className="text-xl font-semibold text-foreground mt-6">Processing Purchase</h3>
              <p className="text-muted-foreground mt-2">Please wait while we add your coins...</p>
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && selectedPack && (
            <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mb-6">
                <Check className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Coins Added!</h3>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl font-bold text-amber-400">+{formatAmount(selectedPack.gcAmount)}</span>
                <Coins className="w-6 h-6 text-amber-500" />
              </div>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl font-bold text-cyan-400">+{selectedPack.scBonusAmount}</span>
                <DiamondIcon size={20} className="text-cyan-400" />
              </div>
              <p className="text-muted-foreground text-sm mb-8">
                Your coin balance has been updated.
              </p>
              <Button
                onClick={handleClose}
                className="w-full max-w-xs h-12 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold"
              >
                Continue Playing
              </Button>
            </div>
          )}

        </div>
      </div>
    </div>,
    document.body
  );
}
