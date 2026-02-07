import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, CreditCard, Building2, ChevronRight, ArrowLeft, ChevronDown, Keyboard, CheckCircle2, Loader2, Copy, AlertCircle, Gift, HelpCircle, X, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AppleIcon, GooglePayColorIcon, VisaIcon, MastercardIcon, BitcoinIcon, EthereumIcon, TetherIcon } from '@/components/icons/PaymentIcons';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import confetti from 'canvas-confetti';
import { pay247Api } from '@/lib/api';
import {
  Pay247Currency,
  Pay247DepositMethod,
  Pay247WithdrawalMethod,
  PAY247_LIMITS,
  PAY247_METHOD_NAMES,
  PAY247_METHODS_BY_CURRENCY,
  type Pay247AccountDetails,
  type UpiAccountDetails,
  type BankAccountDetails,
  type CryptoAccountDetails,
  type GCashAccountDetails,
} from '@/types/pay247';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDepositSuccess?: (amount: number) => void;
  onWithdrawSuccess?: (amount: number) => void;
  defaultTab?: 'deposit' | 'withdraw';
}

type PaymentMethod = 'credit-card' | 'apple-pay' | 'google-pay' | 'bank-transfer' | 'crypto' | 'pay247' | null;
type Step = 'amount' | 'payment' | 'card-details' | 'crypto-deposit' | 'pay247-details' | 'processing' | 'success';
type CryptoCurrency = 'ETH' | 'BTC' | 'USDT' | 'USDC' | 'SOL' | 'DOGE';
type CryptoNetwork = 'ERC20' | 'TRC20' | 'BEP20' | 'Polygon' | 'Arbitrum' | 'Optimism' | 'Solana';

const cryptoAddresses: Record<CryptoCurrency, Partial<Record<CryptoNetwork, string>>> = {
  ETH: {
    ERC20: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD91',
    BEP20: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD91',
    Arbitrum: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD91',
    Optimism: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD91',
    Polygon: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD91',
  },
  BTC: {
    ERC20: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    BEP20: '3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5',
  },
  USDT: {
    ERC20: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD91',
    TRC20: 'TFRtvTCGGjG1ZqNtTxNncPQXvTaxVXvj91',
    BEP20: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD91',
    Polygon: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD91',
    Arbitrum: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD91',
  },
  USDC: {
    ERC20: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD91',
    TRC20: 'TFRtvTCGGjG1ZqNtTxNncPQXvTaxVXvj91',
    BEP20: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD91',
    Polygon: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD91',
    Solana: '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV',
  },
  SOL: {
    Solana: '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV',
  },
  DOGE: {
    BEP20: 'DRSqEwcnJX3GZWM9Ktgh7HAFnvoMpup2zi',
  },
};

const networkLabels: Record<CryptoNetwork, string> = {
  TRC20: 'Tron (TRC20)',
  BEP20: 'BNB Smart Chain (BEP20)',
  ERC20: 'Ethereum (ERC20)',
  Solana: 'Solana',
  Polygon: 'Polygon POS',
  Arbitrum: 'Arbitrum One',
  Optimism: 'OP Mainnet',
};

const paymentMethods = [
  {
    id: 'pay247' as const,
    name: 'Pay247',
    icon: Wallet,
    description: 'USDT, INR, PHP, UPI, GCash',
  },
  {
    id: 'credit-card' as const,
    name: 'Credit Card',
    icon: CreditCard,
    description: 'Visa, Mastercard, Amex',
  },
  {
    id: 'apple-pay' as const,
    name: 'Apple Pay',
    icon: AppleIcon,
    description: 'Fast & Secure',
  },
  {
    id: 'google-pay' as const,
    name: 'Google Pay',
    icon: GooglePayColorIcon,
    description: 'Quick Payment',
  },
  {
    id: 'bank-transfer' as const,
    name: 'Bank Transfer',
    icon: Building2,
    description: 'Direct Transfer',
  },
  {
    id: 'crypto' as const,
    name: 'Crypto',
    icon: BitcoinIcon,
    description: 'BTC, ETH, USDT',
  },
];

export function WalletModal({ isOpen, onClose, onDepositSuccess, onWithdrawSuccess, defaultTab = 'deposit' }: WalletModalProps) {
  const [activeTab, setActiveTab] = useState<'withdraw' | 'deposit'>(defaultTab);
  const [step, setStep] = useState<Step>('amount');
  const [amount, setAmount] = useState('100');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(null);
  
  // Card details state
  const [cardNumber, setCardNumber] = useState('4532 1234 5678 9012');
  const [cardMonth, setCardMonth] = useState('12');
  const [cardYear, setCardYear] = useState('28');
  const [cardCvv, setCardCvv] = useState('123');
  const [cardName, setCardName] = useState('ivontx AI');
  const [cardAddress, setCardAddress] = useState('123 Main Street, New York');
  const [confirmCvv, setConfirmCvv] = useState('123');
  
  // Crypto deposit state
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoCurrency>('USDT');
  const [selectedNetwork, setSelectedNetwork] = useState<CryptoNetwork>('TRC20');
  const [addressCopied, setAddressCopied] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Pay247 state
  const [pay247Currency, setPay247Currency] = useState<Pay247Currency>(Pay247Currency.USDT);
  const [pay247DepositMethod, setPay247DepositMethod] = useState<Pay247DepositMethod>(Pay247DepositMethod.TRC20);
  const [pay247WithdrawalMethod, setPay247WithdrawalMethod] = useState<Pay247WithdrawalMethod>(Pay247WithdrawalMethod.TRC20);
  const [pay247AccountDetails, setPay247AccountDetails] = useState<Pay247AccountDetails | null>(null);
  const [pay247Processing, setPay247Processing] = useState(false);
  const [pay247Error, setPay247Error] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [depositedAmount, setDepositedAmount] = useState<string | null>(null);
  const [depositedCurrency, setDepositedCurrency] = useState<string | null>(null);

  // Pay247 withdrawal account detail fields
  const [upiId, setUpiId] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  // Sync activeTab with defaultTab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  if (!isOpen && !showHelpModal) return null;

  const serviceFee = amount ? (parseFloat(amount) * 0.05).toFixed(2) : '0.00';
  const total = amount ? (parseFloat(amount) + parseFloat(serviceFee)).toFixed(2) : '0.00';

  const handleContinue = () => {
    if (step === 'amount' && amount) {
      setStep('payment');
    }
  };

  const handleBack = () => {
    if (step === 'card-details' || step === 'crypto-deposit' || step === 'pay247-details') {
      setStep('payment');
    } else {
      setStep('amount');
    }
    setSelectedPayment(null);
  };

  const handlePaymentSelect = (methodId: PaymentMethod) => {
    setSelectedPayment(methodId);
    if (methodId === 'credit-card') {
      setStep('card-details');
    } else if (methodId === 'crypto') {
      setStep('crypto-deposit');
    } else if (methodId === 'pay247') {
      setStep('pay247-details');
      setPay247Error(null);
    } else {
      // Handle other payment methods
      console.log({ activeTab, amount, paymentMethod: methodId });
      onClose();
      resetState();
    }
  };

  const copyAddress = () => {
    const address = cryptoAddresses[selectedCrypto]?.[selectedNetwork];
    if (address) {
      navigator.clipboard.writeText(address);
      setAddressCopied(true);
      setTimeout(() => setAddressCopied(false), 2000);
    }
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
        colors: ['#22d3ee', '#06b6d4', '#0891b2', '#fbbf24', '#f59e0b']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ['#22d3ee', '#06b6d4', '#0891b2', '#fbbf24', '#f59e0b']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const handleConfirmPurchase = () => {
    setStep('processing');
    setDepositedAmount(amount);
    setDepositedCurrency('USD');

    setTimeout(() => {
      setStep('success');
      triggerConfetti();
      // Update balance based on transaction type
      const totalAmount = parseFloat(total);
      if (!isNaN(totalAmount)) {
        if (activeTab === 'deposit' && onDepositSuccess) {
          onDepositSuccess(totalAmount);
        } else if (activeTab === 'withdraw' && onWithdrawSuccess) {
          onWithdrawSuccess(parseFloat(amount)); // Withdraw the base amount, not including fees
        }
      }
    }, 2000);
  };

  const handleSuccessClose = () => {
    onClose();
    resetState();
    // Refresh page to update wallet balance
    window.location.reload();
  };

  const handlePay247Deposit = async () => {
    setPay247Processing(true);
    setPay247Error(null);

    try {
      const response = await pay247Api.createDeposit({
        amount: parseFloat(amount),
        currency: pay247Currency,
        paymentMethod: pay247DepositMethod,
      });

      // Store transaction data from response
      const { merchantOrderId, depositId } = response.data;
      setTransactionId(merchantOrderId || depositId || null);
      setDepositedAmount(amount);
      setDepositedCurrency(pay247Currency);

      // Redirect to Pay247 payment URL
      if (response.data.paymentUrl) {
        window.open(response.data.paymentUrl, '_blank');
        setStep('processing');

        // Poll for transaction status
        setTimeout(() => {
          setStep('success');
          triggerConfetti();
          const totalAmount = parseFloat(total);
          if (!isNaN(totalAmount) && onDepositSuccess) {
            onDepositSuccess(totalAmount);
          }
        }, 2000);
      }
    } catch (error: any) {
      setPay247Error(error.response?.data?.message || 'Failed to create deposit. Please try again.');
      console.error('Pay247 deposit error:', error);
    } finally {
      setPay247Processing(false);
    }
  };

  const handlePay247Withdrawal = async () => {
    setPay247Processing(true);
    setPay247Error(null);

    try {
      // Build account details based on payment method
      let accountDetails: Pay247AccountDetails;

      if (pay247WithdrawalMethod === Pay247WithdrawalMethod.UPI) {
        accountDetails = { upiId } as UpiAccountDetails;
      } else if (pay247WithdrawalMethod === Pay247WithdrawalMethod.BANK_TRANSFER) {
        accountDetails = {
          accountHolder,
          accountNumber,
          ifscCode,
          bankName,
        } as BankAccountDetails;
      } else if (
        pay247WithdrawalMethod === Pay247WithdrawalMethod.TRC20 ||
        pay247WithdrawalMethod === Pay247WithdrawalMethod.ERC20 ||
        pay247WithdrawalMethod === Pay247WithdrawalMethod.BEP20
      ) {
        accountDetails = {
          walletAddress,
          network: pay247WithdrawalMethod,
        } as CryptoAccountDetails;
      } else if (
        pay247WithdrawalMethod === Pay247WithdrawalMethod.GCASH ||
        pay247WithdrawalMethod === Pay247WithdrawalMethod.MAYA
      ) {
        accountDetails = {
          mobileNumber,
          accountName,
        } as GCashAccountDetails;
      } else {
        setPay247Error('Invalid withdrawal method selected');
        setPay247Processing(false);
        return;
      }

      const response = await pay247Api.createWithdrawal({
        amount: parseFloat(amount),
        currency: pay247Currency,
        paymentMethod: pay247WithdrawalMethod,
        accountDetails,
      });

      // Withdrawal initiated successfully
      setStep('processing');
      setTimeout(() => {
        setStep('success');
        triggerConfetti();
        const withdrawAmount = parseFloat(amount);
        if (!isNaN(withdrawAmount) && onWithdrawSuccess) {
          onWithdrawSuccess(withdrawAmount);
        }
      }, 2000);
    } catch (error: any) {
      setPay247Error(error.response?.data?.message || 'Failed to create withdrawal. Please try again.');
      console.error('Pay247 withdrawal error:', error);
    } finally {
      setPay247Processing(false);
    }
  };

  const resetState = () => {
    setStep('amount');
    setAmount('100');
    setSelectedPayment(null);
    setCardNumber('4532 1234 5678 9012');
    setCardMonth('12');
    setCardYear('28');
    setCardCvv('123');
    setCardName('ivontx AI');
    setCardAddress('123 Main Street, New York');
    setConfirmCvv('123');
    // Reset Pay247 state
    setPay247Currency(Pay247Currency.USDT);
    setPay247DepositMethod(Pay247DepositMethod.TRC20);
    setPay247WithdrawalMethod(Pay247WithdrawalMethod.TRC20);
    setPay247AccountDetails(null);
    setPay247Processing(false);
    setPay247Error(null);
    setUpiId('');
    setAccountHolder('');
    setAccountNumber('');
    setIfscCode('');
    setBankName('');
    setWalletAddress('');
    setMobileNumber('');
    setAccountName('');
    setTransactionId(null);
    setDepositedAmount(null);
    setDepositedCurrency(null);
  };

  const handleClose = () => {
    onClose();
    resetState();
  };

  return (
    <>
    {createPortal(
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal - Full width on mobile, slides up from bottom */}
      <div className="relative w-full sm:max-w-xl sm:mx-4 bg-gradient-to-b from-card to-background border-t-2 sm:border-2 border-primary/50 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] sm:max-h-[85vh] overflow-y-auto scrollbar-themed animate-slide-up sm:animate-scale-in">
        {/* Content */}
        <div className="p-4 sm:p-6 md:p-8 relative overflow-hidden">
          {/* Amount Step */}
          <div 
            className={`transition-all duration-300 ease-out ${
              step === 'amount' 
                ? 'opacity-100 translate-x-0' 
                : 'opacity-0 -translate-x-full absolute inset-0 p-8 pointer-events-none'
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-muted-foreground" />
              </button>
              <h2 className="text-base sm:text-lg font-bold text-foreground">Wallet</h2>
            </div>

            {/* Deposit/Withdraw Tabs */}
            <div className="flex bg-secondary/50 rounded-full p-1 mb-6">
              <button
                onClick={() => setActiveTab('deposit')}
                className={`flex-1 px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === 'deposit'
                    ? 'bg-gradient-to-r from-amber-500 to-blue-400 text-white shadow'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Deposit
              </button>
              <button
                onClick={() => setActiveTab('withdraw')}
                className={`flex-1 px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === 'withdraw'
                    ? 'bg-gradient-to-r from-amber-500 to-blue-400 text-white shadow'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Withdraw
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 mb-6">
              <Input
                type="number"
                placeholder="Enter Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-14 bg-secondary/80 border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 mb-6">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1 h-14 bg-secondary/50 border-border hover:bg-secondary text-foreground font-semibold"
              >
                Cancel
              </Button>
              <Button
                onClick={handleContinue}
                disabled={!amount}
                className="flex-1 h-14 bg-gradient-to-r from-amber-500 to-blue-400 hover:from-amber-600 hover:to-blue-500 text-white font-semibold shadow-lg disabled:opacity-50"
              >
                {activeTab === 'deposit' ? 'Continue' : 'Withdraw'}
              </Button>
            </div>

            {/* Security Notice */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">
                Improve your account security with Two-Factor-Authentication
              </p>
              <a href="#" className="text-sm text-primary hover:underline">
                LEARN MORE ABOUT COIN WALLET
              </a>
            </div>
          </div>

          {/* Payment Step */}
          <div 
            className={`transition-all duration-300 ease-out ${
              step === 'payment' 
                ? 'opacity-100 translate-x-0' 
                : step === 'amount' 
                  ? 'opacity-0 translate-x-full absolute inset-0 p-8 pointer-events-none'
                  : 'opacity-0 -translate-x-full absolute inset-0 p-8 pointer-events-none'
            }`}
          >
            {/* Back Button & Title */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={handleBack}
                className="w-8 h-8 rounded-lg bg-[#2a2a2a] flex items-center justify-center hover:bg-[#3a3a3a] transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-muted-foreground" />
              </button>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">{activeTab === 'withdraw' ? 'Select Withdrawal Method' : 'Select Payment Provider'}</h2>
            </div>

            {/* Amount Display */}
            <div className="mb-6 p-4 bg-secondary/50 rounded-xl">
              <p className="text-sm text-muted-foreground">{activeTab === 'withdraw' ? 'Amount to withdraw' : 'Amount to deposit'}</p>
              <p className="text-2xl font-bold text-primary">${amount}</p>
            </div>

            {/* Payment Methods */}
            <div className="space-y-3">
              {/* Pay247 */}
              <button
                onClick={() => handlePaymentSelect('pay247')}
                className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-amber-500/10 to-blue-400/10 hover:from-amber-500/20 hover:to-blue-400/20 border-2 border-amber-500/50 rounded-xl transition-all group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-blue-400 rounded-lg flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-foreground flex items-center gap-2">
                    Pay247
                    <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">Recommended</span>
                  </p>
                  <p className="text-sm text-muted-foreground">USDT, INR, PHP, UPI, GCash & more</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>

              {/* Credit Card */}
              <button
                onClick={() => handlePaymentSelect('credit-card')}
                className="w-full flex items-center gap-4 p-4 bg-secondary/80 hover:bg-secondary border border-border rounded-xl transition-all group"
              >
                <div className="flex items-center gap-2">
                  <VisaIcon className="w-12 h-8" />
                  <MastercardIcon className="w-12 h-8" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-foreground">Credit Card</p>
                  <p className="text-sm text-muted-foreground">Visa, Mastercard, Amex</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>

              {/* Apple Pay & Google Pay */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handlePaymentSelect('apple-pay')}
                  className="flex items-center gap-3 p-4 bg-secondary/80 hover:bg-secondary border border-border rounded-xl transition-all group"
                >
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                    <AppleIcon className="w-6 h-6 text-black" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-foreground text-sm">Apple Pay</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </button>
                <button
                  onClick={() => handlePaymentSelect('google-pay')}
                  className="flex items-center gap-3 p-4 bg-secondary/80 hover:bg-secondary border border-border rounded-xl transition-all group"
                >
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1.5">
                    <GooglePayColorIcon className="w-full h-full" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-foreground text-sm">Google Pay</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </button>
              </div>

              {/* Bank Transfer */}
              <button
                onClick={() => handlePaymentSelect('bank-transfer')}
                className="w-full flex items-center gap-4 p-4 bg-secondary/80 hover:bg-secondary border border-border rounded-xl transition-all group"
              >
                <div className="w-12 h-12 bg-card rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-foreground" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-foreground">Bank Transfer</p>
                  <p className="text-sm text-muted-foreground">Direct bank transfer</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>

              {/* Crypto */}
              <button
                onClick={() => handlePaymentSelect('crypto')}
                className="w-full flex items-center gap-4 p-4 bg-secondary/80 hover:bg-secondary border border-border rounded-xl transition-all group"
              >
                <div className="flex items-center gap-1">
                  <BitcoinIcon className="w-8 h-8" />
                  <EthereumIcon className="w-8 h-8" />
                  <TetherIcon className="w-8 h-8" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-foreground">Crypto</p>
                  <p className="text-sm text-muted-foreground">BTC, ETH, USDT & more</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
            </div>
          </div>

          {/* Card Details Step */}
          <div 
            className={`transition-all duration-300 ease-out ${
              step === 'card-details' 
                ? 'opacity-100 translate-x-0' 
                : 'opacity-0 translate-x-full absolute inset-0 p-8 pointer-events-none'
            }`}
          >
            {/* Credit Card Selector */}
            <div className="flex items-center justify-between p-4 bg-secondary/80 border border-border rounded-xl mb-6">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium text-foreground">Credit Card</span>
              </div>
              <div className="flex items-center gap-2">
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                <button 
                  onClick={handleBack}
                  className="text-primary hover:underline text-sm font-medium"
                >
                  Change
                </button>
              </div>
            </div>

            {/* Card Information */}
            <div className="space-y-4">
              {/* Card Number with Icons */}
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
                  className="h-14 bg-transparent border-0 text-foreground placeholder:text-muted-foreground tracking-widest flex-1"
                />
                <div className="flex items-center gap-2 pr-4">
                  <MastercardIcon className="w-8 h-5" />
                  <VisaIcon className="w-8 h-5" />
                </div>
              </div>

              {/* MM/YY and CVV */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center bg-secondary/80 border border-border rounded-xl overflow-hidden">
                  <Input
                    type="text"
                    placeholder="MM"
                    maxLength={2}
                    value={cardMonth}
                    onChange={(e) => setCardMonth(e.target.value.replace(/\D/g, ''))}
                    className="h-14 bg-transparent border-0 text-center text-foreground placeholder:text-muted-foreground flex-1"
                  />
                  <span className="text-muted-foreground">/</span>
                  <Input
                    type="text"
                    placeholder="YY"
                    maxLength={2}
                    value={cardYear}
                    onChange={(e) => setCardYear(e.target.value.replace(/\D/g, ''))}
                    className="h-14 bg-transparent border-0 text-center text-foreground placeholder:text-muted-foreground flex-1"
                  />
                </div>
                <div className="relative">
                  <Input
                    type="password"
                    placeholder="CVV"
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                    className="h-14 bg-secondary/80 border-border text-foreground placeholder:text-muted-foreground pr-12"
                  />
                  <Keyboard className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                </div>
              </div>

              {/* Name On Card */}
              <Input
                type="text"
                placeholder="Name On Card"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="h-14 bg-secondary/80 border-border text-foreground placeholder:text-muted-foreground"
              />

              {/* Address */}
              <Input
                type="text"
                placeholder="Address"
                value={cardAddress}
                onChange={(e) => setCardAddress(e.target.value)}
                className="h-14 bg-secondary/80 border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Price Breakdown */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>${amount || '0.00'}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Service Fees</span>
                <span>${serviceFee}</span>
              </div>
              <div className="flex justify-between text-foreground font-semibold text-lg pt-2 border-t border-border">
                <span>Total</span>
                <span>${total}</span>
              </div>
            </div>

            {/* Confirm CVV */}
            <div className="flex items-center justify-between mt-6 gap-4">
              <span className="text-foreground font-medium">Confirm CVV To Pay</span>
              <div className="relative w-32">
                <Input
                  type="password"
                  placeholder="CVV"
                  maxLength={4}
                  value={confirmCvv}
                  onChange={(e) => setConfirmCvv(e.target.value.replace(/\D/g, ''))}
                  className="h-12 bg-secondary/80 border-border text-foreground placeholder:text-muted-foreground pr-10"
                />
                <Keyboard className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            {/* Confirm Button */}
            <Button
              onClick={handleConfirmPurchase}
              disabled={!cardMonth || !cardYear || !cardCvv || !cardName || !confirmCvv}
              className="w-full h-14 mt-6 bg-gradient-to-r from-amber-500 to-blue-400 hover:from-amber-600 hover:to-blue-500 text-white font-semibold text-lg shadow-lg disabled:opacity-50"
            >
              {activeTab === 'withdraw' ? `Confirm Withdrawal Of $${total}` : `Confirm Purchase Of $${total}`}
            </Button>

            {/* Statement Notice */}
            {activeTab === 'deposit' && (
              <p className="text-center text-sm text-muted-foreground mt-4">
                This Payment Will Appear On Your Statement As{' '}
                <span className="text-primary font-medium">COINFLOW</span>
              </p>
            )}
          </div>

          {/* Crypto Deposit Step */}
          <div 
            className={`transition-all duration-300 ease-out ${
              step === 'crypto-deposit' 
                ? 'opacity-100 translate-x-0' 
                : 'opacity-0 translate-x-full absolute inset-0 p-8 pointer-events-none'
            }`}
          >
            {/* Back Button */}
            <button 
              onClick={handleBack}
              className="w-8 h-8 rounded-lg bg-[#2a2a2a] flex items-center justify-center hover:bg-[#3a3a3a] transition-colors mb-4"
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* Crypto Currency Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {(['ETH', 'BTC', 'USDT', 'USDC', 'SOL', 'DOGE'] as CryptoCurrency[]).map((crypto) => (
                <button
                  key={crypto}
                  onClick={() => {
                    setSelectedCrypto(crypto);
                    // Set first available network for this crypto
                    const availableNetworks = Object.keys(cryptoAddresses[crypto]) as CryptoNetwork[];
                    if (availableNetworks.length > 0 && !cryptoAddresses[crypto][selectedNetwork]) {
                      setSelectedNetwork(availableNetworks[0]);
                    }
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    selectedCrypto === crypto
                      ? 'bg-amber-500/20 border border-amber-500 text-amber-400'
                      : 'bg-secondary/50 border border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {crypto === 'ETH' && <EthereumIcon className="w-5 h-5" />}
                  {crypto === 'BTC' && <BitcoinIcon className="w-5 h-5" />}
                  {crypto === 'USDT' && <TetherIcon className="w-5 h-5" />}
                  {crypto === 'USDC' && <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">$</div>}
                  {crypto === 'SOL' && <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-teal-400 rounded-full" />}
                  {crypto === 'DOGE' && <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">Ð</div>}
                  {crypto}
                </button>
              ))}
            </div>

            {/* Dropdowns Row */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Deposit Currency</label>
                <div className="flex items-center justify-between p-3 h-[46px] bg-secondary/80 border border-border rounded-xl">
                  <div className="flex items-center gap-2">
                    {selectedCrypto === 'USDT' && <TetherIcon className="w-5 h-5" />}
                    {selectedCrypto === 'ETH' && <EthereumIcon className="w-5 h-5" />}
                    {selectedCrypto === 'BTC' && <BitcoinIcon className="w-5 h-5" />}
                    {selectedCrypto === 'USDC' && <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">$</div>}
                    {selectedCrypto === 'SOL' && <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-teal-400 rounded-full" />}
                    {selectedCrypto === 'DOGE' && <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">Ð</div>}
                    <span className="text-foreground text-sm">{selectedCrypto}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Choose Network</label>
                <Select value={selectedNetwork} onValueChange={(value) => setSelectedNetwork(value as CryptoNetwork)}>
                  <SelectTrigger className="w-full p-3 h-[46px] bg-secondary/80 border border-border rounded-xl text-foreground text-sm">
                    <SelectValue placeholder="Select network">
                      {networkLabels[selectedNetwork]}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-[#2a2a2a] border border-border rounded-2xl z-[100] p-2 min-w-[280px]">
                    {(Object.keys(cryptoAddresses[selectedCrypto]) as CryptoNetwork[]).map((network) => (
                      <SelectItem 
                        key={network}
                        value={network}
                        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-secondary/50 focus:bg-secondary/50 rounded-xl transition-colors text-foreground"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium">{networkLabels[network]}</span>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ml-4 ${
                            selectedNetwork === network 
                              ? 'border-amber-500 bg-amber-500' 
                              : 'border-gray-500'
                          }`}>
                            {selectedNetwork === network && (
                              <div className="w-2 h-2 bg-white rounded-full" />
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* How to deposit link */}
            <div className="flex justify-end mb-4">
              <button 
                onClick={() => setShowHelpModal(true)}
                className="flex items-center gap-1 text-sm text-amber-400 hover:underline"
              >
                <span>📖</span> How to deposit crypto?
              </button>
            </div>

            {/* Bonus Banner */}
            <div className="flex items-center gap-3 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-xl mb-6">
              <Gift className="w-8 h-8 text-yellow-400" />
              <p className="text-sm text-foreground">
                Get extra <span className="text-yellow-400 font-bold">180%</span> bonus on minimum of <span className="text-amber-400 font-bold">5 {selectedCrypto}</span> deposit
              </p>
            </div>

            {/* QR Code and Address */}
            <div className="flex gap-4 mb-4">
              {/* QR Code */}
              <div className="relative bg-white p-3 rounded-xl flex-shrink-0 shadow-lg shadow-emerald-500/10">
                {/* QR Pattern - Stylized grid */}
                <div className="w-28 h-28 relative">
                  <div className="absolute inset-0 grid grid-cols-7 grid-rows-7 gap-[2px] p-1">
                    {/* Static QR-like pattern */}
                    {[1,1,0,1,0,1,1, 1,0,1,0,1,0,1, 0,1,1,0,1,1,0, 1,0,0,0,0,0,1, 0,1,1,0,1,1,0, 1,0,1,0,1,0,1, 1,1,0,1,0,1,1].map((fill, i) => (
                      <div 
                        key={i} 
                        className={`rounded-[2px] ${fill ? 'bg-gray-900' : 'bg-transparent'}`}
                      />
                    ))}
                  </div>
                  {/* Center icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-cyan-600 rounded-lg flex items-center justify-center shadow-md">
                      {selectedCrypto === 'USDT' && <TetherIcon className="w-6 h-6" />}
                      {selectedCrypto === 'ETH' && <EthereumIcon className="w-6 h-6" />}
                      {selectedCrypto === 'BTC' && <BitcoinIcon className="w-6 h-6" />}
                      {selectedCrypto === 'USDC' && <span className="text-white text-sm font-bold">$</span>}
                      {selectedCrypto === 'SOL' && <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-blue-300 rounded-full" />}
                      {selectedCrypto === 'DOGE' && <span className="text-white text-sm font-bold">Ð</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Info */}
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Deposit address</p>
                  <div className="flex items-center gap-2 p-2 bg-secondary/50 rounded-lg">
                    <p className="text-xs text-amber-400 font-mono truncate flex-1">
                      {cryptoAddresses[selectedCrypto]?.[selectedNetwork] || 'Address not available'}
                    </p>
                    <button 
                      onClick={copyAddress}
                      className="p-1.5 hover:bg-secondary rounded transition-colors"
                    >
                      <Copy className={`w-4 h-4 ${addressCopied ? 'text-amber-400' : 'text-muted-foreground'}`} />
                    </button>
                  </div>
                </div>

                {/* Warning */}
                <div className="flex items-start gap-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    Send only <span className="text-foreground">{selectedCrypto}</span> to this deposit address. Transfers below 1 {selectedCrypto} will not be credited.
                  </p>
                </div>
              </div>
            </div>

            {/* Deposit from Wallet */}
            <div className="flex items-center justify-between p-4 bg-secondary/30 border border-border rounded-xl">
              <span className="text-foreground text-sm font-bold">Deposit Directly From Your Wallet</span>
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 bg-yellow-500 rounded-full" />
                <div className="w-6 h-6 bg-blue-500 rounded-full -ml-2" />
                <div className="w-6 h-6 bg-purple-500 rounded-full -ml-2" />
                <span className="text-muted-foreground text-sm ml-1">+300</span>
              </div>
            </div>
          </div>

          {/* Pay247 Details Step */}
          <div
            className={`transition-all duration-300 ease-out ${
              step === 'pay247-details'
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 translate-x-full absolute inset-0 p-8 pointer-events-none'
            }`}
          >
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="w-8 h-8 rounded-lg bg-[#2a2a2a] flex items-center justify-center hover:bg-[#3a3a3a] transition-colors mb-4"
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>

            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">
              {activeTab === 'withdraw' ? 'Withdraw with Pay247' : 'Deposit with Pay247'}
            </h2>

            {/* Amount Display */}
            <div className="mb-6 p-4 bg-secondary/50 rounded-xl">
              <p className="text-sm text-muted-foreground">{activeTab === 'withdraw' ? 'Amount to withdraw' : 'Amount to deposit'}</p>
              <p className="text-2xl font-bold text-primary">${amount}</p>
            </div>

            {/* Error Message */}
            {pay247Error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{pay247Error}</p>
              </div>
            )}

            {/* Currency Selection */}
            <div className="mb-4">
              <label className="text-sm text-muted-foreground mb-2 block font-medium">Select Currency</label>
              <div className="grid grid-cols-3 gap-3">
                {Object.values(Pay247Currency).map((currency) => (
                  <button
                    key={currency}
                    onClick={() => {
                      setPay247Currency(currency);
                      // Reset method to first available for this currency
                      const availableMethods = PAY247_METHODS_BY_CURRENCY[currency];
                      if (availableMethods.length > 0) {
                        setPay247DepositMethod(availableMethods[0]);
                        setPay247WithdrawalMethod(availableMethods[0] as Pay247WithdrawalMethod);
                      }
                    }}
                    className={`p-3 rounded-xl border-2 transition-all font-semibold ${
                      pay247Currency === currency
                        ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                        : 'border-border bg-secondary/50 text-muted-foreground hover:border-amber-500/50'
                    }`}
                  >
                    {currency}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Limits: ${PAY247_LIMITS[pay247Currency].min} - ${PAY247_LIMITS[pay247Currency].max}
              </p>
            </div>

            {/* Payment Method Selection */}
            <div className="mb-4">
              <label className="text-sm text-muted-foreground mb-2 block font-medium">Select Payment Method</label>
              <div className="grid grid-cols-1 gap-2">
                {PAY247_METHODS_BY_CURRENCY[pay247Currency].map((method) => (
                  <button
                    key={method}
                    onClick={() => {
                      if (activeTab === 'deposit') {
                        setPay247DepositMethod(method);
                      } else {
                        setPay247WithdrawalMethod(method as Pay247WithdrawalMethod);
                      }
                    }}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      (activeTab === 'deposit' ? pay247DepositMethod : pay247WithdrawalMethod) === method
                        ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                        : 'border-border bg-secondary/50 text-foreground hover:border-amber-500/50'
                    }`}
                  >
                    <span className="font-medium">{PAY247_METHOD_NAMES[method]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Withdrawal Account Details */}
            {activeTab === 'withdraw' && (
              <div className="mb-4 space-y-3">
                <label className="text-sm text-muted-foreground block font-medium">Account Details</label>

                {/* UPI */}
                {pay247WithdrawalMethod === Pay247WithdrawalMethod.UPI && (
                  <Input
                    type="text"
                    placeholder="UPI ID (e.g., username@upi)"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="h-12 bg-secondary/80 border-border text-foreground placeholder:text-muted-foreground"
                  />
                )}

                {/* Bank Transfer */}
                {pay247WithdrawalMethod === Pay247WithdrawalMethod.BANK_TRANSFER && (
                  <>
                    <Input
                      type="text"
                      placeholder="Account Holder Name"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      className="h-12 bg-secondary/80 border-border text-foreground placeholder:text-muted-foreground"
                    />
                    <Input
                      type="text"
                      placeholder="Account Number"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="h-12 bg-secondary/80 border-border text-foreground placeholder:text-muted-foreground"
                    />
                    {pay247Currency === Pay247Currency.INR && (
                      <Input
                        type="text"
                        placeholder="IFSC Code"
                        value={ifscCode}
                        onChange={(e) => setIfscCode(e.target.value)}
                        className="h-12 bg-secondary/80 border-border text-foreground placeholder:text-muted-foreground"
                      />
                    )}
                    <Input
                      type="text"
                      placeholder="Bank Name (optional)"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="h-12 bg-secondary/80 border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </>
                )}

                {/* Crypto (TRC20/ERC20/BEP20) */}
                {(pay247WithdrawalMethod === Pay247WithdrawalMethod.TRC20 ||
                  pay247WithdrawalMethod === Pay247WithdrawalMethod.ERC20 ||
                  pay247WithdrawalMethod === Pay247WithdrawalMethod.BEP20) && (
                  <Input
                    type="text"
                    placeholder={`${pay247WithdrawalMethod} Wallet Address`}
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    className="h-12 bg-secondary/80 border-border text-foreground placeholder:text-muted-foreground font-mono"
                  />
                )}

                {/* GCash / Maya */}
                {(pay247WithdrawalMethod === Pay247WithdrawalMethod.GCASH ||
                  pay247WithdrawalMethod === Pay247WithdrawalMethod.MAYA) && (
                  <>
                    <Input
                      type="text"
                      placeholder="Mobile Number"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      className="h-12 bg-secondary/80 border-border text-foreground placeholder:text-muted-foreground"
                    />
                    <Input
                      type="text"
                      placeholder="Account Name"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className="h-12 bg-secondary/80 border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </>
                )}
              </div>
            )}

            {/* Info Box */}
            <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-foreground">
                {activeTab === 'deposit' ? (
                  <p>You will be redirected to Pay247 to complete the payment securely.</p>
                ) : (
                  <p>Withdrawal will be processed within 24 hours to your provided account details.</p>
                )}
              </div>
            </div>

            {/* Confirm Button */}
            <Button
              onClick={activeTab === 'deposit' ? handlePay247Deposit : handlePay247Withdrawal}
              disabled={
                pay247Processing ||
                (activeTab === 'withdraw' && (
                  (pay247WithdrawalMethod === Pay247WithdrawalMethod.UPI && !upiId) ||
                  (pay247WithdrawalMethod === Pay247WithdrawalMethod.BANK_TRANSFER && (!accountHolder || !accountNumber || (pay247Currency === Pay247Currency.INR && !ifscCode))) ||
                  ((pay247WithdrawalMethod === Pay247WithdrawalMethod.TRC20 || pay247WithdrawalMethod === Pay247WithdrawalMethod.ERC20 || pay247WithdrawalMethod === Pay247WithdrawalMethod.BEP20) && !walletAddress) ||
                  ((pay247WithdrawalMethod === Pay247WithdrawalMethod.GCASH || pay247WithdrawalMethod === Pay247WithdrawalMethod.MAYA) && (!mobileNumber || !accountName))
                ))
              }
              className="w-full h-14 bg-gradient-to-r from-amber-500 to-blue-400 hover:from-amber-600 hover:to-blue-500 text-white font-semibold text-lg shadow-lg disabled:opacity-50"
            >
              {pay247Processing ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </span>
              ) : activeTab === 'withdraw' ? (
                `Withdraw $${amount} via Pay247`
              ) : (
                `Deposit $${amount} via Pay247`
              )}
            </Button>
          </div>

          {/* Processing Step */}
          <div
            className={`transition-all duration-300 ease-out ${
              step === 'processing'
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-95 absolute inset-0 p-8 pointer-events-none'
            }`}
          >
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mt-6">{activeTab === 'withdraw' ? 'Processing Withdrawal' : 'Processing Payment'}</h3>
              <p className="text-muted-foreground mt-2">{activeTab === 'withdraw' ? 'Please wait while we process your withdrawal...' : 'Please wait while we verify your transaction...'}</p>
              <div className="flex items-center gap-2 mt-6">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>

          {/* Success Step */}
          <div 
            className={`transition-all duration-300 ease-out ${
              step === 'success' 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-95 absolute inset-0 p-8 pointer-events-none'
            }`}
          >
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-blue-400 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/30 animate-scale-in">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mt-6">{activeTab === 'withdraw' ? 'Withdrawal Successful!' : 'Payment Successful!'}</h3>
              <p className="text-muted-foreground mt-2 text-center">
                Your {activeTab === 'withdraw' ? 'withdrawal' : 'deposit'} of <span className="text-primary font-semibold">{depositedAmount || total} {depositedCurrency || 'USD'}</span> has been processed successfully.
              </p>
              <div className="bg-secondary/50 rounded-xl p-4 mt-6 w-full max-w-xs">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <span className="text-foreground font-mono text-xs break-all ml-2">{transactionId || `TXN${Date.now().toString().slice(-8)}`}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="text-amber-400 font-semibold">{depositedAmount || total} {depositedCurrency || 'USD'}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-muted-foreground">Currency</span>
                  <span className="text-foreground font-semibold">{depositedCurrency || 'USD'}</span>
                </div>
              </div>
              <Button
                onClick={handleSuccessClose}
                className="w-full max-w-xs h-14 mt-6 bg-gradient-to-r from-amber-500 to-blue-400 hover:from-amber-600 hover:to-blue-500 text-white font-semibold shadow-lg"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )}
  
  {showHelpModal && createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={() => setShowHelpModal(false)} />
      <div className="relative bg-background border border-border rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto scrollbar-themed">
        <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-foreground">How to Deposit Crypto</h2>
          <button onClick={() => setShowHelpModal(false)} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="p-4 space-y-6">
          <div>
            <h3 className="text-base font-bold text-foreground mb-2">Step 1: Select a Cryptocurrency</h3>
            <p className="text-sm text-muted-foreground mb-3">In the deposit pop-up window, choose the crypto you want to deposit (e.g., BTC, ETH, USDT).</p>
            <div className="bg-secondary/50 border border-border rounded-xl p-3">
              <div className="flex gap-2 flex-wrap">
                {['ETH', 'BTC', 'USDT', 'USDC'].map((crypto) => (
                  <div key={crypto} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border text-sm">
                    {crypto === 'USDT' && <TetherIcon className="w-4 h-4" />}
                    {crypto === 'ETH' && <EthereumIcon className="w-4 h-4" />}
                    {crypto === 'BTC' && <BitcoinIcon className="w-4 h-4" />}
                    {crypto === 'USDC' && <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-[8px] font-bold">$</div>}
                    {crypto}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground mb-2">Step 2: Choose the Network</h3>
            <p className="text-sm text-muted-foreground mb-2">For tokens like USDT, you'll need to select the correct network (e.g., ERC20, TRC20, BEP20).</p>
            <p className="text-sm text-amber-400 mb-3">Note: Make sure the network you choose matches the one used in your external wallet or exchange.</p>
            <div className="bg-secondary/50 border border-border rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between p-2 bg-secondary rounded-lg border border-amber-500/30">
                <span className="text-sm">Tron (TRC20)</span>
                <div className="w-4 h-4 rounded-full bg-amber-500" />
              </div>
              <div className="flex items-center justify-between p-2 bg-secondary rounded-lg">
                <span className="text-sm text-muted-foreground">BNB Smart Chain (BEP20)</span>
                <div className="w-4 h-4 rounded-full border border-muted-foreground" />
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground mb-2">Step 3: Copy the Deposit Address or Scan the QR Code</h3>
            <p className="text-sm text-muted-foreground mb-3">You'll see a unique deposit address generated for your account. Click "Copy Address" or scan the QR code with your wallet app.</p>
            <div className="bg-secondary/50 border border-border rounded-xl p-3 flex gap-3">
              <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                <div className="w-16 h-16 grid grid-cols-5 grid-rows-5 gap-[1px]">
                  {[1,1,1,1,1,1,0,0,0,1,1,0,1,0,1,1,0,0,0,1,1,1,1,1,1].map((fill, i) => (
                    <div key={i} className={`${fill ? 'bg-gray-900' : 'bg-white'}`} />
                  ))}
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-xs text-muted-foreground">Deposit address</p>
                <p className="text-xs text-emerald-400 font-mono break-all">TRAv84MJ8yL9tWVDo4Vs24chSpBaf...</p>
                <button className="w-full py-2 bg-secondary border border-border rounded-lg text-sm flex items-center justify-center gap-2">
                  <Copy className="w-3 h-3" />
                  Copy Address
                </button>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground mb-2">Step 4: Send Crypto from Your External Wallet</h3>
            <p className="text-sm text-muted-foreground">Choose the same network you selected when copying the "Deposit address", and paste the copied address into your external wallet when sending or withdrawing cryptos there.</p>
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground mb-2">Step 5: Wait for Blockchain Confirmation</h3>
            <p className="text-sm text-muted-foreground mb-2">Deposits will be credited after the required number of blockchain confirmations.</p>
            <p className="text-sm text-emerald-400">Note: Most transactions are processed within a few minutes, but this can vary.</p>
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground mb-2">Step 6: Check Your Wallet Balance</h3>
            <p className="text-sm text-muted-foreground">Once the transaction succeeded, the funds will appear in your wallet automatically — ready to play!</p>
          </div>
        </div>
        <div className="sticky bottom-0 bg-background border-t border-border p-4">
          <Button onClick={() => setShowHelpModal(false)} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3">
            Got it!
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )}
  </>
  );
}
