import { useEffect, useCallback, useState } from 'react';
import { X, Trash2, Settings, ChevronDown, Menu, Zap, DollarSign, Bitcoin } from 'lucide-react';
import { useBetslip } from '@/contexts/BetslipContext';
import { BetslipSelectionItem } from './BetslipSelectionItem';
import { useWallet, type Currency } from '@/contexts/AppModeContext';
import { cn } from '@/lib/utils';

const QUICK_STAKES = [10, 50, 100, 500];

export function BetslipPanel() {
  const {
    selections,
    stake,
    quickBetEnabled,
    isOpen,
    activeTab,
    setStake,
    toggleQuickBet,
    closeBetslip,
    setActiveTab,
    clearSelections,
    potentialWin,
  } = useBetslip();

  const { balances, primaryCurrency, formatCurrency } = useWallet();
  const [stakeCurrency, setStakeCurrency] = useState<Currency>(primaryCurrency || 'USD');

  const count = selections.length;
  const totalStake = activeTab === 'single' ? stake * count : stake;

  // Update stake currency when primary currency changes
  useEffect(() => {
    if (primaryCurrency) {
      setStakeCurrency(primaryCurrency);
    }
  }, [primaryCurrency]);

  // Handle ESC key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeBetslip();
    }
  }, [closeBetslip]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const currentBalance = balances[stakeCurrency] || 0;
  const hasInsufficientBalance = totalStake > currentBalance;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 z-50 animate-fade-in"
        onClick={closeBetslip}
      />

      {/* Panel */}
      <div className={cn(
        "fixed z-50 bg-[#12121f] flex flex-col animate-slide-in-right",
        // Mobile: bottom sheet with safe area
        "bottom-0 left-0 right-0 max-h-[75vh] rounded-t-2xl sm:rounded-t-3xl pb-safe",
        // Tablet+: right side drawer
        "md:top-0 md:bottom-0 md:left-auto md:right-0 md:w-[400px] md:max-h-full md:rounded-none md:rounded-l-3xl md:pb-0"
      )}>
        {/* Cyan header */}
        <div className="bg-cyan-600 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between rounded-t-2xl sm:rounded-t-3xl md:rounded-tl-3xl md:rounded-tr-none flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/10 rounded-md sm:rounded-lg flex items-center justify-center">
              <Menu className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-white font-bold text-sm sm:text-base">Betslip</span>
              {count > 0 && (
                <span className="min-w-[18px] sm:min-w-[20px] h-4.5 sm:h-5 bg-white text-cyan-600 text-[10px] sm:text-xs px-1 sm:px-1.5 rounded-full font-bold flex items-center justify-center">
                  {count}
                </span>
              )}
              <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/70" />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Bet toggle */}
            <div 
              className="flex items-center gap-1.5 sm:gap-2 cursor-pointer"
              onClick={toggleQuickBet}
            >
              <span className="text-white/80 text-[10px] sm:text-xs font-medium hidden sm:block">QUICK BET</span>
              <div className={cn(
                "w-10 sm:w-12 h-5 sm:h-6 rounded-full relative transition-colors flex items-center px-0.5 sm:px-1",
                quickBetEnabled ? "bg-white" : "bg-white/20"
              )}>
                <Zap className={cn(
                  "w-2.5 h-2.5 sm:w-3 sm:h-3 absolute left-1 sm:left-1.5 transition-opacity",
                  quickBetEnabled ? "text-cyan-600 opacity-100" : "text-white opacity-50"
                )} />
                <div className={cn(
                  "w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full transition-all absolute",
                  quickBetEnabled ? "bg-cyan-600 right-0.5 sm:right-1" : "bg-white right-5 sm:right-6"
                )} />
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={closeBetslip}
              className="w-7 h-7 sm:w-8 sm:h-8 bg-white/10 rounded-md sm:rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 flex-shrink-0">
          {(['single', 'combo', 'system'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-colors relative",
                activeTab === tab 
                  ? "text-white" 
                  : "text-gray-500 hover:text-gray-300"
              )}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500" />
              )}
            </button>
          ))}
        </div>

        {/* Selections list */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3">
          {selections.length === 0 ? (
            <div className="text-center py-6 sm:py-8 text-gray-500">
              <p className="text-xs sm:text-sm">No selections yet</p>
              <p className="text-[10px] sm:text-xs mt-1">Click on odds to add bets</p>
            </div>
          ) : (
            selections.map((selection) => (
              <BetslipSelectionItem key={selection.id} selection={selection} />
            ))
          )}
        </div>

        {/* Stake section */}
        <div className="p-3 sm:p-4 border-t border-white/10 flex-shrink-0">
          {/* Currency Selection */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-gray-400 text-xs">Stake with:</span>
            <div className="flex bg-[#1e1e32] rounded-lg p-0.5">
              <button
                onClick={() => setStakeCurrency('USD')}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all",
                  stakeCurrency === 'USD'
                    ? "bg-green-500/20 text-green-400"
                    : "text-gray-500 hover:text-gray-300"
                )}
              >
                <DollarSign className="w-3 h-3" />
                USD
              </button>
              <button
                onClick={() => setStakeCurrency('USDC')}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all",
                  stakeCurrency === 'USDC'
                    ? "bg-blue-500/20 text-blue-400"
                    : "text-gray-500 hover:text-gray-300"
                )}
              >
                <DollarSign className="w-3 h-3" />
                USDC
              </button>
              <button
                onClick={() => setStakeCurrency('BTC')}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all",
                  stakeCurrency === 'BTC'
                    ? "bg-orange-500/20 text-orange-400"
                    : "text-gray-500 hover:text-gray-300"
                )}
              >
                <Bitcoin className="w-3 h-3" />
                BTC
              </button>
            </div>
          </div>

          {/* Stake input */}
          <div className="flex items-center justify-between mb-2.5 sm:mb-3">
            <span className="text-gray-400 text-xs sm:text-sm">Stake</span>
            <div className="flex items-center bg-[#1e1e32] rounded-md sm:rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2">
              <input
                type="number"
                value={stake}
                onChange={(e) => setStake(Number(e.target.value) || 0)}
                className="bg-transparent text-white text-right w-16 sm:w-20 font-mono font-bold outline-none text-sm sm:text-base"
              />
              <span className={cn(
                "ml-1 text-sm font-bold",
                stakeCurrency === 'USD' ? "text-green-400" : stakeCurrency === 'BTC' ? "text-orange-400" : "text-blue-400"
              )}>
                {stakeCurrency}
              </span>
            </div>
          </div>

          {/* Quick stake buttons */}
          <div className="flex gap-1.5 sm:gap-2 mb-3 sm:mb-4">
            {QUICK_STAKES.map((amount) => (
              <button
                key={amount}
                onClick={() => setStake(amount)}
                className={cn(
                  "flex-1 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-colors",
                  stake === amount
                    ? stakeCurrency === 'USD'
                      ? "bg-green-600 text-white"
                      : stakeCurrency === 'BTC'
                        ? "bg-orange-500 text-white"
                        : "bg-blue-600 text-white"
                    : "bg-[#1e1e32] text-gray-400 hover:bg-[#2a2a42] hover:text-white"
                )}
              >
                {amount}
              </button>
            ))}
          </div>

          {/* Summary */}
          <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-400">Total Stake</span>
              <span className={cn(
                "font-mono font-bold",
                stakeCurrency === 'USD' ? "text-green-400" : stakeCurrency === 'BTC' ? "text-orange-400" : "text-blue-400"
              )}>
                {formatCurrency(totalStake, stakeCurrency)}
              </span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-400">Potential Prize</span>
              <span className={cn(
                "font-mono font-bold",
                stakeCurrency === 'USD' ? "text-green-400" : stakeCurrency === 'BTC' ? "text-orange-400" : "text-blue-400"
              )}>
                {formatCurrency(potentialWin, stakeCurrency)}
              </span>
            </div>
            {hasInsufficientBalance && (
              <p className="text-xs text-red-400">
                Insufficient {stakeCurrency} balance
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 sm:gap-3">
            <button className="flex-1 py-2.5 sm:py-3 bg-[#1e1e32] hover:bg-[#2a2a42] text-white rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-colors">
              BOOK
            </button>
            <button
              className={cn(
                "flex-1 py-2.5 sm:py-3 text-white rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                stakeCurrency === 'USD'
                  ? "bg-green-600 hover:bg-green-700"
                  : stakeCurrency === 'BTC'
                    ? "bg-orange-500 hover:bg-orange-600"
                    : "bg-blue-600 hover:bg-blue-700"
              )}
              disabled={selections.length === 0 || hasInsufficientBalance}
            >
              PLACE STAKE
            </button>
          </div>
        </div>

        {/* Bottom mini-bar */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-t border-white/10 flex-shrink-0">
          <button
            onClick={clearSelections}
            className="w-9 h-9 sm:w-10 sm:h-10 bg-[#1e1e32] hover:bg-red-500/20 rounded-md sm:rounded-lg flex items-center justify-center transition-colors group"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 group-hover:text-red-400" />
          </button>
          <button className="w-9 h-9 sm:w-10 sm:h-10 bg-[#1e1e32] hover:bg-[#2a2a42] rounded-md sm:rounded-lg flex items-center justify-center transition-colors">
            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
          </button>
        </div>
      </div>
    </>
  );
}
