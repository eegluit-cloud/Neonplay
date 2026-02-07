import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Gift, DollarSign, Bitcoin, Wallet } from 'lucide-react';
import { NotificationsPanel } from '@/components/NotificationsPanel';
import { CoinBalancePill } from '@/components/CoinBalancePill';
import { NeonPlayLogo } from '@/components/NeonPlayLogo';
import { WalletModal } from '@/components/WalletModal';
import { useUserAvatar } from '@/hooks/useUserAvatar';
import { useLeaderboardData } from '@/hooks/useLeaderboardData';
import { useWallet } from '@/contexts/AppModeContext';

interface HeaderProps {
  onOpenSignIn: () => void;
  onOpenSignUp: () => void;
  onToggleSidebar: () => void;
}

export function Header({
  onOpenSignIn,
  onOpenSignUp,
  onToggleSidebar
}: HeaderProps) {
  const { avatar: userAvatar } = useUserAvatar();
  const { playerPosition } = useLeaderboardData();
  const { balances, primaryCurrency, formatCurrency, refresh } = useWallet();
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [balanceDropdownOpen, setBalanceDropdownOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const balanceDropdownRef = useRef<HTMLDivElement>(null);
  const dropdownMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!balanceDropdownOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (balanceDropdownRef.current?.contains(target)) {
        return;
      }

      if (dropdownMenuRef.current?.contains(target)) {
        return;
      }

      setBalanceDropdownOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [balanceDropdownOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 header-bar border-b border-border" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div className="flex items-center justify-between h-14 md:h-16 px-3 md:px-4 lg:px-4">
        {/* Left Side - Hamburger + Logo on tablet/desktop, Logo only on mobile */}
        <div className="flex items-center gap-2 md:gap-2 lg:gap-3">
          {/* Logo - mobile only (before hamburger on mobile) */}
          <div
            className="cursor-pointer hover:opacity-80 transition-opacity md:hidden"
            onClick={() => navigate('/lobby')}
          >
            <NeonPlayLogo size="sm" showText={false} />
          </div>

          {/* Hamburger - visible on tablet and desktop (comes first on tablet/desktop) */}
          <button onClick={onToggleSidebar} className="hidden md:flex items-center justify-center w-10 h-10 lg:w-10 lg:h-10 bg-card hover:bg-secondary rounded-xl transition-colors border border-border shrink-0">
            <div className="flex items-center gap-0.5">
              <div className="flex flex-col gap-[3px]">
                <span className="w-4 h-[2px] bg-muted-foreground rounded-full" />
                <span className="w-3 h-[2px] bg-muted-foreground rounded-full" />
                <span className="w-4 h-[2px] bg-muted-foreground rounded-full" />
              </div>
              <svg width="8" height="10" viewBox="0 0 8 10" fill="none" className="ml-0.5">
                <path d="M1 1L6 5L1 9" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </button>

          {/* Logo - tablet version (after hamburger) */}
          <div
            className="hidden md:block lg:hidden cursor-pointer hover:opacity-80 transition-opacity shrink-0"
            onClick={() => navigate('/lobby')}
          >
            <NeonPlayLogo size="md" showText={false} />
          </div>

          {/* Logo - desktop only (after hamburger) */}
          <div
            className="hidden lg:block cursor-pointer hover:opacity-80 transition-opacity shrink-0"
            onClick={() => navigate('/lobby')}
          >
            <NeonPlayLogo size="md" />
          </div>
        </div>


        {/* Right Side - Mobile */}
        <div className="flex md:hidden items-center gap-1">
          {/* Balance Toggle Pill */}
          <CoinBalancePill size="sm" />

          {/* Combined Action Buttons - Pill Style */}
          <div className="flex items-center bg-card rounded-xl h-9 px-1 border border-border">
            {/* Wallet Icon */}
            <button
              onClick={() => {
                setBalanceDropdownOpen(false);
                setWalletModalOpen(true);
              }}
              className="relative w-7 h-7 flex items-center justify-center rounded-lg header-icon-btn"
            >
              <Wallet className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            </button>

            <div className="w-px h-5 bg-white/20 mx-0.5" />

            {/* League Position */}
            <button
              onClick={() => {
                setBalanceDropdownOpen(false);
                navigate('/leaderboard');
              }}
              className="relative w-7 h-7 flex items-center justify-center rounded-lg header-icon-btn"
            >
              <span className="text-sm font-semibold text-muted-foreground">{playerPosition}</span>
            </button>

            <div className="w-px h-5 bg-white/20 mx-0.5" />

            {/* Notification Bell */}
            <button
              onClick={() => {
                setBalanceDropdownOpen(false);
                setNotificationsOpen(true);
              }}
              className="relative w-7 h-7 flex items-center justify-center rounded-lg header-icon-btn"
            >
              <Bell className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-cyan-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white shadow-lg badge-pulse">1</span>
            </button>
          </div>

          {/* User Avatar */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setBalanceDropdownOpen(false);
              if (window.location.pathname === '/profile') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                navigate('/profile');
              }
            }}
            className="w-9 h-9 rounded-full overflow-hidden hover:opacity-80 transition-opacity relative z-[60]"
          >
            <img src={userAvatar} alt="User" className="w-full h-full object-cover pointer-events-none rounded-full" />
          </button>
        </div>

        {/* Right Side - Desktop & Tablet */}
        <div className="hidden md:flex items-center ml-auto h-11 gap-2">
          {/* Balance Toggle Pill - New Premium Design */}
          <CoinBalancePill size="md" />

          {/* Combined Action Buttons - Pill Style */}
          <div className="flex items-center bg-card rounded-full h-9 px-0.5 lg:px-1 border border-border shrink-0">
            {/* Wallet Icon */}
            <button
              onClick={() => setWalletModalOpen(true)}
              className="relative w-8 lg:w-9 h-8 lg:h-9 flex items-center justify-center rounded-full header-icon-btn"
            >
              <Wallet className="w-4 lg:w-5 h-4 lg:h-5 text-muted-foreground" strokeWidth={1.5} />
            </button>

            <div className="w-px h-5 lg:h-6 bg-white/20 mx-0.5 lg:mx-1" />

            {/* League Position */}
            <button
              onClick={() => navigate('/leaderboard')}
              className="relative w-8 lg:w-9 h-8 lg:h-9 flex items-center justify-center rounded-full header-icon-btn"
            >
              <span className="text-sm lg:text-base font-medium text-muted-foreground">{playerPosition}</span>
            </button>

            <div className="w-px h-5 lg:h-6 bg-white/20 mx-0.5 lg:mx-1" />

            {/* Gift Icon */}
            <button
              onClick={() => navigate('/promotions')}
              className="relative w-8 lg:w-9 h-8 lg:h-9 flex items-center justify-center rounded-full header-icon-btn"
            >
              <Gift className="w-4 lg:w-5 h-4 lg:h-5 text-muted-foreground" strokeWidth={1.5} />
              <span className="absolute -top-0.5 lg:-top-1 -right-0 lg:-right-0.5 min-w-4 lg:min-w-5 h-4 lg:h-5 px-0.5 lg:px-1 bg-cyan-500 rounded-full text-[10px] lg:text-xs font-bold flex items-center justify-center text-white shadow-lg badge-pulse">1</span>
            </button>

            <div className="w-px h-5 lg:h-6 bg-white/20 mx-0.5 lg:mx-1" />

            {/* Notification Bell */}
            <button
              onClick={() => setNotificationsOpen(true)}
              className="relative w-8 lg:w-9 h-8 lg:h-9 flex items-center justify-center rounded-full header-icon-btn"
            >
              <Bell className="w-4 lg:w-5 h-4 lg:h-5 text-muted-foreground" strokeWidth={1.5} />
              <span className="absolute -top-0.5 lg:-top-1 -right-0 lg:-right-0.5 min-w-4 lg:min-w-5 h-4 lg:h-5 px-0.5 lg:px-1 bg-red-500 rounded-full text-[10px] lg:text-xs font-bold flex items-center justify-center text-white shadow-lg badge-pulse">11</span>
            </button>
          </div>

          {/* User Avatar */}
          <button
            onClick={() => navigate('/profile')}
            className="w-9 lg:w-11 h-9 lg:h-11 rounded-full transition-all overflow-hidden shrink-0 ring-2 ring-transparent hover:ring-cyan-500/40 active:scale-95"
          >
            <img src={userAvatar} alt="User" className="w-full h-full rounded-full object-cover" />
          </button>
        </div>
      </div>

      {/* Balance Dropdown */}
      {balanceDropdownOpen && (
        <div ref={dropdownMenuRef} className="fixed top-14 md:top-16 left-2 right-auto w-56 md:left-auto md:right-4 md:w-80 bg-card rounded-xl border border-border shadow-xl overflow-hidden animate-fade-in z-50">
          <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="text-xs sm:text-sm text-muted-foreground">USD Balance</span>
              </div>
              <span className="font-bold text-sm sm:text-base text-green-400">{formatCurrency(balances.USD, 'USD')}</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bitcoin className="w-4 h-4 text-orange-400" />
                <span className="text-xs sm:text-sm text-muted-foreground">BTC Balance</span>
              </div>
              <span className="font-bold text-sm sm:text-base text-orange-400">{formatCurrency(balances.BTC, 'BTC')}</span>
            </div>
          </div>
        </div>
      )}

      <NotificationsPanel
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />

      <WalletModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        onDepositSuccess={(amount) => {
          refresh();
        }}
        onWithdrawSuccess={(amount) => {
          refresh();
        }}
      />
    </header>
  );
}
