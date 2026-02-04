import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { MessageCircle, Coins, Shield, Smartphone, Trophy, Gamepad2, Star, CheckCircle2, Dice5, ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DiamondIcon } from '@/components/icons/DiamondIcon';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Footer } from '@/components/Footer';
import { AuthModals } from '@/components/AuthModals';
import { RegisterModal } from '@/components/RegisterModal';
import { LoginModal } from '@/components/LoginModal';
import { ForgotPasswordModal } from '@/components/ForgotPasswordModal';
import { LocationIssueModal } from '@/components/LocationIssueModal';
import { EmailVerificationModal } from '@/components/EmailVerificationModal';
import { ResendVerificationModal } from '@/components/ResendVerificationModal';
import { PhoneVerificationModal } from '@/components/PhoneVerificationModal';
import { OTPVerificationModal } from '@/components/OTPVerificationModal';
import casinoHeroBg from '@/assets/casino-hero-bg-v2.png';
import lobbyBanner from '@/assets/lobby-banner.png';
import { NeonPlayLogo } from '@/components/NeonPlayLogo';
import rouletteWheel from '@/assets/roulette-wheel-new.png';
import spinWheel from '@/assets/spin-wheel-colorful.png';
import treasureChest from '@/assets/treasure-chest-coins.png';
import vipBadge from '@/assets/vip-badge.png';
import vipStarBadge from '@/assets/vip-star-badge.png';
import premiumGamesBadge from '@/assets/premium-games-badge.png';
import safeGamingBadge from '@/assets/safe-gaming-badge.png';
import gamesCollageBg from '@/assets/games-collage-bg.png';
import heroGradientBar from '@/assets/hero-gradient-bar.png';
import rouletteGradientBar from '@/assets/roulette-gradient-bar.png';

import fortuneRabbit from '@/assets/games/fortune-rabbit.png';
import bigBassSplash from '@/assets/games/big-bass-splash.png';
import candyBonanza from '@/assets/games/candy-bonanza.png';
import gonzosQuest from '@/assets/games/gonzos-quest.png';
import bookOfFallen from '@/assets/games/book-of-fallen.png';
import dragonPearls from '@/assets/games/dragon-pearls.png';
import sunOfEgypt from '@/assets/games/sun-of-egypt.png';
import mammothPeak from '@/assets/games/mammoth-peak.png';
import aztecTwist from '@/assets/games/aztec-twist.png';
import joinNowIcon from '@/assets/join-now-icon.png';
import getVerifiedIcon from '@/assets/get-verified-icon.png';
import startPlayingIcon from '@/assets/start-playing-icon.png';

// Provider imports
import crocoLogo from '@/assets/providers/croco.png';
import redTigerLogo from '@/assets/providers/red-tiger.png';
import jiliLogo from '@/assets/providers/jili.png';
import platipusLogo from '@/assets/providers/platipus.png';
import nownowLogo from '@/assets/providers/nownow.png';
import jdbLogo from '@/assets/providers/jdb.png';
import amigoLogo from '@/assets/providers/amigo.png';
import inoutLogo from '@/assets/providers/inout.png';
import threeOaksLogo from '@/assets/providers/3oaks.png';
import mokaLogo from '@/assets/providers/moka.png';


// Providers data
const providers = [
  { name: 'Croco Gaming', logo: crocoLogo },
  { name: 'Red Tiger', logo: redTigerLogo },
  { name: 'JILI', logo: jiliLogo },
  { name: 'Platipus', logo: platipusLogo },
  { name: 'NowNow', logo: nownowLogo },
  { name: 'JDB', logo: jdbLogo },
  { name: 'Amigo', logo: amigoLogo },
  { name: 'InOut', logo: inoutLogo },
  { name: '3 Oaks', logo: threeOaksLogo },
  { name: 'Moka', logo: mokaLogo },
];

// Featured games - expanded pool for slot machine
const allGames = [
  { name: 'Fortune Rabbit', image: fortuneRabbit },
  { name: 'Big Bass Splash', image: bigBassSplash },
  { name: 'Candy Bonanza', image: candyBonanza },
  { name: "Gonzo's Quest", image: gonzosQuest },
  { name: 'Book of Fallen', image: bookOfFallen },
  { name: 'Dragon Pearls', image: dragonPearls },
  { name: 'Sun of Egypt', image: sunOfEgypt },
  { name: 'Mammoth Peak', image: mammothPeak },
  { name: 'Aztec Twist', image: aztecTwist },
];

// FAQ data
const faqData = [
  {
    question: 'Do I keep all of my winnings?',
    answer: "Yes! You get 100% of your prize. We don't take a commission. For large jackpots, we guide you through the claims process directly with the lottery operator."
  },
  {
    question: 'Is playing online safe and legal?',
    answer: 'Yes, our platform operates under strict regulatory guidelines. We use industry-standard encryption to protect your data and ensure fair gaming practices.'
  },
  {
    question: 'What currencies do you support?',
    answer: 'Our platform supports both fiat currencies (USD) and cryptocurrencies (BTC, ETH). You can deposit and withdraw using your preferred method.'
  },
  {
    question: 'How do I contact customer support?',
    answer: 'You can reach our 24/7 customer support team via live chat, email at support@neonplay.com, or through our help center in the app.'
  },
  {
    question: 'What should I do if I forget my password?',
    answer: 'Click the "Forgot Password" link on the login page, enter your email address, and we\'ll send you a secure link to reset your password.'
  }
];

// Steps data
const stepsData = [
  {
    number: '1',
    icon: joinNowIcon,
    isImage: true,
    title: 'Join Now',
    description: "Ready for fun? Click the button below to create your account at our social casino online and start playing within moments. It's that simple!",
    color: 'text-green-400'
  },
  {
    number: '2',
    icon: getVerifiedIcon,
    isImage: true,
    title: 'Get Verified',
    description: 'Registering takes just a few steps. New players get an instant offer when they join! Verify your details to unlock all features and dive into exciting games.',
    color: 'text-blue-400'
  },
  {
    number: '3',
    icon: startPlayingIcon,
    isImage: true,
    title: 'Play & Enjoy!',
    description: 'Dive into nonstop fun! Our free sportsbook casino gives instant access to thrilling games and entertainment. Start today no cost, no hassle.',
    color: 'text-red-400'
  }
];

// Popup notifications data - expanded with unique entries
const popupNotifications = [
  { 
    id: 1, 
    name: 'Phoenix Baker', 
    action: 'just won',
    amount: 2500,
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  { 
    id: 2, 
    name: 'Wade Warren', 
    action: 'is now #1 on the league',
    amount: 4500,
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
  },
  { 
    id: 3, 
    name: 'Sarah Miller', 
    action: 'claimed a bonus of',
    amount: 1200,
    avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
  },
  { 
    id: 4, 
    name: 'Marcus Johnson', 
    action: 'hit the jackpot!',
    amount: 15000,
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
  },
  { 
    id: 5, 
    name: 'Emily Davis', 
    action: 'won big on slots',
    amount: 3200,
    avatar: 'https://randomuser.me/api/portraits/women/35.jpg',
  },
  { 
    id: 6, 
    name: 'Robert Chen', 
    action: 'leveled up to VIP',
    amount: 0,
    avatar: 'https://randomuser.me/api/portraits/men/36.jpg',
  },
  { 
    id: 7, 
    name: 'Jessica Lee', 
    action: 'won on roulette',
    amount: 8700,
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  { 
    id: 8, 
    name: 'David Kim', 
    action: 'earned rewards of',
    amount: 1800,
    avatar: 'https://randomuser.me/api/portraits/men/52.jpg',
  },
  { 
    id: 9, 
    name: 'Amanda Torres', 
    action: 'just cashed out',
    amount: 5600,
    avatar: 'https://randomuser.me/api/portraits/women/28.jpg',
  },
  { 
    id: 10, 
    name: 'Michael Scott', 
    action: 'unlocked platinum tier',
    amount: 0,
    avatar: 'https://randomuser.me/api/portraits/men/41.jpg',
  },
  { 
    id: 11, 
    name: 'Sophia Martinez', 
    action: 'won the daily prize of',
    amount: 2100,
    avatar: 'https://randomuser.me/api/portraits/women/17.jpg',
  },
  { 
    id: 12, 
    name: 'James Wilson', 
    action: 'hit a mega win!',
    amount: 22000,
    avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
  },
  { 
    id: 13, 
    name: 'Olivia Brown', 
    action: 'collected bonus of',
    amount: 950,
    avatar: 'https://randomuser.me/api/portraits/women/54.jpg',
  },
  { 
    id: 14, 
    name: 'Daniel Garcia', 
    action: 'scored big on blackjack',
    amount: 4200,
    avatar: 'https://randomuser.me/api/portraits/men/19.jpg',
  },
  { 
    id: 15, 
    name: 'Emma Thompson', 
    action: 'earned weekly bonus of',
    amount: 3500,
    avatar: 'https://randomuser.me/api/portraits/women/62.jpg',
  },
  { 
    id: 16, 
    name: 'Chris Anderson', 
    action: 'won spin prize of',
    amount: 1650,
    avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
  },
];

// All leaderboard players pool
const allPlayers = [
  { name: 'Kathy Pacheco', avatar: 'https://randomuser.me/api/portraits/women/1.jpg' },
  { name: 'Judith Rodriguez', avatar: 'https://randomuser.me/api/portraits/women/2.jpg' },
  { name: 'Jerry Helfer', avatar: 'https://randomuser.me/api/portraits/men/3.jpg' },
  { name: 'Chris Glasser', avatar: 'https://randomuser.me/api/portraits/men/4.jpg' },
  { name: 'Lorri Warf', avatar: 'https://randomuser.me/api/portraits/women/5.jpg' },
  { name: 'Lorna Wraith', avatar: 'https://randomuser.me/api/portraits/women/6.jpg' },
  { name: 'Lori Waverly', avatar: 'https://randomuser.me/api/portraits/women/7.jpg' },
  { name: 'Lydia Worden', avatar: 'https://randomuser.me/api/portraits/women/8.jpg' },
  { name: 'John Dukes', avatar: 'https://randomuser.me/api/portraits/men/11.jpg' },
  { name: 'David Elson', avatar: 'https://randomuser.me/api/portraits/men/12.jpg' },
  { name: 'Stephanie Nicol', avatar: 'https://randomuser.me/api/portraits/women/13.jpg' },
  { name: 'Dennis Callis', avatar: 'https://randomuser.me/api/portraits/men/14.jpg' },
  { name: 'Joshua Jones', avatar: 'https://randomuser.me/api/portraits/men/15.jpg' },
  { name: 'Andrew Taylor', avatar: 'https://randomuser.me/api/portraits/men/16.jpg' },
  { name: 'Brian Wilson', avatar: 'https://randomuser.me/api/portraits/men/17.jpg' },
  { name: 'David Brown', avatar: 'https://randomuser.me/api/portraits/men/18.jpg' },
  { name: 'Autumn Phillips', avatar: 'https://randomuser.me/api/portraits/women/21.jpg' },
  { name: 'Corina McCoy', avatar: 'https://randomuser.me/api/portraits/women/22.jpg' },
  { name: 'Frances Swann', avatar: 'https://randomuser.me/api/portraits/women/24.jpg' },
  { name: 'Dominic Hale', avatar: 'https://randomuser.me/api/portraits/men/25.jpg' },
  { name: 'Michael Harris', avatar: 'https://randomuser.me/api/portraits/men/26.jpg' },
  { name: 'David Hargrove', avatar: 'https://randomuser.me/api/portraits/men/27.jpg' },
  { name: 'Derek Henson', avatar: 'https://randomuser.me/api/portraits/men/28.jpg' },
  { name: 'Sarah Miller', avatar: 'https://randomuser.me/api/portraits/women/31.jpg' },
  { name: 'Robert Chen', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { name: 'Emily Davis', avatar: 'https://randomuser.me/api/portraits/women/33.jpg' },
  { name: 'James Wilson', avatar: 'https://randomuser.me/api/portraits/men/34.jpg' },
  { name: 'Lisa Anderson', avatar: 'https://randomuser.me/api/portraits/women/35.jpg' },
  { name: 'Mark Thompson', avatar: 'https://randomuser.me/api/portraits/men/36.jpg' },
];

const positions = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

// Perks data
const perks = [
  { 
    icon: Trophy, 
    title: 'Elite VIP Club', 
    description: 'Unlock elite perks & luxury rewards.',
    position: 'left-top'
  },
  { 
    icon: Gamepad2, 
    title: 'Premium Games', 
    description: 'Choose from hundreds of top-rated slots & more.',
    position: 'left-bottom'
  },
  { 
    icon: Smartphone, 
    title: 'Experience Our Mobile App', 
    description: 'Epic Gaming, Right in Your Pocket.',
    position: 'right-top'
  },
  { 
    icon: Shield, 
    title: 'Safe & Fair Gaming', 
    description: 'Licensed, encrypted & regularly audited',
    position: 'right-bottom'
  },
];

export default function Register() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to lobby if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/lobby");
    }
  }, [isAuthenticated, isLoading, navigate]);
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  
  // Slot machine state
  const [isSpinning, setIsSpinning] = useState(false);
  const [displayedGames, setDisplayedGames] = useState(() => allGames.slice(0, 4));
  const [selectedGame, setSelectedGame] = useState<typeof allGames[0] | null>(null);
  const [spinningIndex, setSpinningIndex] = useState<number | null>(null);
  const [reelOffsets, setReelOffsets] = useState([0, 0, 0, 0]);
  const [showWinEffect, setShowWinEffect] = useState(false);
  const slotContainerRef = useRef<HTMLDivElement>(null);
  
  // Auth modals state
  const [signInOpen, setSignInOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(true);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [locationIssueOpen, setLocationIssueOpen] = useState(false);
  const [emailVerificationOpen, setEmailVerificationOpen] = useState(false);
  const [resendVerificationOpen, setResendVerificationOpen] = useState(false);
  const [phoneVerificationOpen, setPhoneVerificationOpen] = useState(false);
  const [otpVerificationOpen, setOtpVerificationOpen] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  // Generate leaderboard data based on active tab
  const generateLeaderboardData = (tab: 'daily' | 'weekly' | 'monthly') => {
    // Use different seed for each tab to get different data
    const seed = tab === 'daily' ? 1 : tab === 'weekly' ? 2 : 3;
    const shuffled = [...allPlayers].sort((a, b) => {
      const hashA = a.name.charCodeAt(0) * seed;
      const hashB = b.name.charCodeAt(0) * seed;
      return hashA - hashB;
    });
    
    // Different score ranges for each tab
    const scoreMultiplier = tab === 'daily' ? 1 : tab === 'weekly' ? 5 : 20;
    const baseScore = tab === 'daily' ? 10000 : tab === 'weekly' ? 50000 : 200000;
    
    return [0, 1, 2].map((colIndex) => 
      positions.map((pos, i) => ({
        position: pos,
        name: shuffled[(colIndex * 8 + i) % shuffled.length].name,
        avatar: shuffled[(colIndex * 8 + i) % shuffled.length].avatar,
        score: Math.floor(Math.random() * baseScore + baseScore * scoreMultiplier / 10),
      }))
    );
  };

  // Initialize leaderboard data once with stable base scores (high numbers)
  const [leaderboardData, setLeaderboardData] = useState(() => generateLeaderboardData('daily'));

  // Update leaderboard when tab changes
  useEffect(() => {
    setLeaderboardData(generateLeaderboardData(activeTab));
  }, [activeTab]);

  // Gradually update individual scores to feel natural
  useEffect(() => {
    const interval = setInterval(() => {
      setLeaderboardData(prev => {
        const newData = prev.map(column => [...column.map(p => ({...p}))]);
        
        // Randomly pick 1-3 players to update their score
        const updateCount = Math.floor(Math.random() * 3) + 1;
        for (let u = 0; u < updateCount; u++) {
          const colIdx = Math.floor(Math.random() * 3);
          const rowIdx = Math.floor(Math.random() * 8);
          // Add increment (100-2000)
          newData[colIdx][rowIdx].score += Math.floor(Math.random() * 1900) + 100;
        }
        
        return newData;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Two notifications state - one for each side
  const [leftNotification, setLeftNotification] = useState<{id: number, index: number, visible: boolean, topPosition: number} | null>(null);
  const [rightNotification, setRightNotification] = useState<{id: number, index: number, visible: boolean, topPosition: number} | null>(null);
  const [usedIndices, setUsedIndices] = useState<Set<number>>(new Set());

  // Get unique random index that hasn't been used recently
  const getUniqueIndex = (used: Set<number>): number => {
    const available = popupNotifications.map((_, i) => i).filter(i => !used.has(i));
    if (available.length === 0) {
      // Reset if all used
      return Math.floor(Math.random() * popupNotifications.length);
    }
    return available[Math.floor(Math.random() * available.length)];
  };

  // Spawn notifications on both sides
  useEffect(() => {
    let notificationCounter = 0;
    let localUsed = new Set<number>();
    
    const spawnLeftNotification = () => {
      const index = getUniqueIndex(localUsed);
      localUsed.add(index);
      if (localUsed.size >= popupNotifications.length - 2) {
        localUsed = new Set();
      }
      
      const id = notificationCounter++;
      const topPosition = 80 + Math.floor(Math.random() * 250);
      
      setLeftNotification({ id, index, visible: true, topPosition });
      
      // Hide after 5 seconds
      setTimeout(() => {
        setLeftNotification(prev => prev && prev.id === id ? { ...prev, visible: false } : prev);
      }, 5000);
      
      // Remove after fade
      setTimeout(() => {
        setLeftNotification(prev => prev && prev.id === id ? null : prev);
      }, 8000);
    };
    
    const spawnRightNotification = () => {
      const index = getUniqueIndex(localUsed);
      localUsed.add(index);
      if (localUsed.size >= popupNotifications.length - 2) {
        localUsed = new Set();
      }
      
      const id = notificationCounter++;
      const topPosition = 80 + Math.floor(Math.random() * 250);
      
      setRightNotification({ id, index, visible: true, topPosition });
      
      // Hide after 5 seconds
      setTimeout(() => {
        setRightNotification(prev => prev && prev.id === id ? { ...prev, visible: false } : prev);
      }, 5000);
      
      // Remove after fade
      setTimeout(() => {
        setRightNotification(prev => prev && prev.id === id ? null : prev);
      }, 8000);
    };

    // Initial - spawn with offset
    setTimeout(() => spawnLeftNotification(), 800);
    setTimeout(() => spawnRightNotification(), 3500);
    
    // Continue spawning - different intervals for natural feel
    const leftInterval = setInterval(() => {
      spawnLeftNotification();
    }, 7000 + Math.random() * 2000); // 7-9 seconds
    
    const rightInterval = setInterval(() => {
      spawnRightNotification();
    }, 8000 + Math.random() * 2000); // 8-10 seconds
    
    return () => {
      clearInterval(leftInterval);
      clearInterval(rightInterval);
    };
  }, []);

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background flex flex-col overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between">
          {/* Mobile: Logo on left */}
          <Link to="/" className="sm:hidden">
            <NeonPlayLogo size="sm" />
          </Link>

          {/* Center - Logo (desktop only) */}
          <Link to="/" className="hidden sm:block absolute left-1/2 -translate-x-1/2">
            <NeonPlayLogo size="md" />
          </Link>

          {/* Right - Auth Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/lobby')}
              className="border-border hover:bg-secondary h-8 sm:h-9 px-2.5 sm:px-3 text-xs sm:text-sm"
            >
              Login
            </Button>
            <Button 
              size="sm"
              onClick={() => setRegisterModalOpen(true)}
              className="bg-primary hover:bg-primary/90 shadow-[0_0_15px_hsl(var(--primary)/0.4)] h-8 sm:h-9 px-2.5 sm:px-3 text-xs sm:text-sm"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="pt-14 sm:pt-16" />

      {/* Hero Section */}
      <section className="relative">
        {/* Background with casino image and dark overlay */}
        <div className="absolute inset-0 bg-black overflow-hidden">
          <img 
            src={casinoHeroBg} 
            alt="" 
            className="w-full h-full object-contain object-top"
            style={{ maskImage: 'linear-gradient(to bottom, black 10%, transparent 40%)', WebkitMaskImage: 'linear-gradient(to bottom, black 10%, transparent 40%)' }}
          />
          {/* Dark overlay on image */}
          <div className="absolute inset-0 bg-black/60" />
        </div>

        {/* Main Content */}
        <div className="relative z-10 container mx-auto px-3 sm:px-4 py-6 sm:py-12 flex flex-col items-center justify-center">
          {/* Left Notification - hidden on mobile */}
          {leftNotification && (
            <div 
              key={leftNotification.id}
              className="hidden md:block absolute z-50 left-[10%] transition-all duration-700 ease-out"
              style={{ 
                top: `${leftNotification.topPosition}px`,
                opacity: leftNotification.visible ? 1 : 0,
                transform: leftNotification.visible ? 'scale(1)' : 'scale(0.95)',
                transition: leftNotification.visible 
                  ? 'opacity 0.8s ease-out, transform 0.8s ease-out' 
                  : 'opacity 3s ease-out',
              }}
            >
              <div className="relative bg-[#0c0c0c] rounded-xl p-3 pr-4 shadow-2xl max-w-xs">
                <div className="absolute inset-0 rounded-xl pointer-events-none" style={{
                  background: 'linear-gradient(to bottom, hsl(var(--casino-cyan) / 0.1) 0%, hsl(var(--casino-cyan) / 0.3) 50%, hsl(var(--casino-cyan) / 0.5) 100%)',
                  mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  maskComposite: 'xor',
                  WebkitMaskComposite: 'xor',
                  padding: '1px'
                }} />
                <div className="flex items-center gap-3 relative z-10">
                  <img 
                    src={popupNotifications[leftNotification.index].avatar} 
                    alt={popupNotifications[leftNotification.index].name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-casino-cyan/50"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">
                      {popupNotifications[leftNotification.index].name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {popupNotifications[leftNotification.index].action}
                      {popupNotifications[leftNotification.index].amount > 0 && (
                        <span className="text-casino-cyan font-bold ml-1">
                          ${popupNotifications[leftNotification.index].amount.toLocaleString()}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Right Notification - hidden on mobile */}
          {rightNotification && (
            <div 
              key={rightNotification.id}
              className="hidden md:block absolute z-50 right-[10%] transition-all duration-700 ease-out"
              style={{ 
                top: `${rightNotification.topPosition}px`,
                opacity: rightNotification.visible ? 1 : 0,
                transform: rightNotification.visible ? 'scale(1)' : 'scale(0.95)',
                transition: rightNotification.visible 
                  ? 'opacity 0.8s ease-out, transform 0.8s ease-out' 
                  : 'opacity 3s ease-out',
              }}
            >
              <div className="relative bg-[#0c0c0c] rounded-xl p-3 pr-4 shadow-2xl max-w-xs">
                <div className="absolute inset-0 rounded-xl pointer-events-none" style={{
                  background: 'linear-gradient(to bottom, hsl(var(--casino-cyan) / 0.1) 0%, hsl(var(--casino-cyan) / 0.3) 50%, hsl(var(--casino-cyan) / 0.5) 100%)',
                  mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  maskComposite: 'xor',
                  WebkitMaskComposite: 'xor',
                  padding: '1px'
                }} />
                <div className="flex items-center gap-3 relative z-10">
                  <img 
                    src={popupNotifications[rightNotification.index].avatar} 
                    alt={popupNotifications[rightNotification.index].name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-casino-cyan/50"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">
                      {popupNotifications[rightNotification.index].name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {popupNotifications[rightNotification.index].action}
                      {popupNotifications[rightNotification.index].amount > 0 && (
                        <span className="text-casino-cyan font-bold ml-1">
                          ${popupNotifications[rightNotification.index].amount.toLocaleString()}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Center Content */}
          <div className="text-center max-w-2xl mx-auto mb-4 sm:mb-8">
            <div className="relative w-56 h-56 sm:w-72 sm:h-72 md:w-[28rem] md:h-[28rem] mx-auto mb-4 sm:mb-6">
              <img 
                src={rouletteWheel}
                alt="Roulette Wheel"
                className="w-full h-full object-contain animate-spin-slow relative z-0"
              />
              {/* Smooth CSS gradient overlay - starts from middle */}
              <div className="absolute inset-0 z-10 pointer-events-none" style={{
                background: 'linear-gradient(to bottom, transparent 0%, transparent 20%, rgba(0,0,0,0.2) 35%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.8) 65%, black 80%)'
              }} />
              {/* Side fade for seamless horizontal blending - very low on sides only */}
              <div className="absolute inset-0 z-10 pointer-events-none" style={{
                background: 'radial-gradient(ellipse 200% 8% at 50% 100%, black 0%, transparent 35%)'
              }} />
              {/* Extra bottom reinforcement */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[200%] h-40 z-10 pointer-events-none" style={{
                background: 'linear-gradient(to top, black 0%, black 50%, transparent 100%)'
              }} />
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-2 sm:mb-3 -mt-28 sm:-mt-8 md:-mt-12 relative z-20 px-2">
              Social Casino{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                #1 in America
              </span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base mb-4 sm:mb-6 relative z-20 px-4">
              Millions in prizes waiting your big win could be just one spin away.
            </p>

            <Button 
              onClick={() => navigate('/lobby')}
              className="relative z-20 bg-primary hover:bg-primary/90 shadow-[0_0_20px_hsl(var(--primary)/0.5)] px-6 py-3 text-sm font-medium rounded-full mt-2"
            >
              Play Now
            </Button>
            <p className="text-sm text-muted-foreground mt-2">No Purchase Necessary</p>
          </div>
        </div>

        {/* Features Section */}
        <div className="relative z-10 container mx-auto px-3 sm:px-4 pb-8 sm:pb-12 -mt-8 sm:-mt-12">
          <div className="relative bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 max-w-5xl mx-auto">
            {/* Gradient border */}
            <div className="absolute inset-0 rounded-xl sm:rounded-2xl pointer-events-none" style={{
              background: 'linear-gradient(to bottom, hsl(var(--casino-cyan) / 0.1) 0%, hsl(var(--casino-cyan) / 0.2) 50%, hsl(var(--casino-cyan) / 0.5) 100%)',
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'xor',
              WebkitMaskComposite: 'xor',
              padding: '1px'
            }} />
            <div className="grid grid-cols-2 gap-3 sm:gap-6 md:gap-8 items-center">
            {/* Phone image - Left side */}
            <div className="relative flex items-center justify-center py-2 sm:py-6 md:py-8 overflow-visible">
              {/* Floating game images - smaller on mobile */}
              <img 
                src={fortuneRabbit} 
                alt="Fortune Rabbit" 
                className="absolute top-[15%] left-[25%] -translate-x-1/2 -translate-y-1/2 w-8 h-10 sm:w-12 sm:h-16 md:w-18 md:h-22 object-cover rounded-lg sm:rounded-xl shadow-2xl z-20 border border-primary/50 sm:border-2 animate-pop-out"
                style={{ animationDelay: '0s' }}
              />
              <img 
                src={bigBassSplash} 
                alt="Big Bass Splash" 
                className="absolute top-[80%] left-[70%] -translate-x-1/2 -translate-y-1/2 w-7 h-9 sm:w-10 sm:h-14 md:w-16 md:h-20 object-cover rounded-lg sm:rounded-xl shadow-2xl z-20 border border-amber-500/50 sm:border-2 animate-pop-out"
                style={{ animationDelay: '1.5s' }}
              />
              <img 
                src={candyBonanza} 
                alt="Candy Bonanza" 
                className="absolute top-[35%] left-[75%] -translate-x-1/2 -translate-y-1/2 w-8 h-10 sm:w-12 sm:h-16 md:w-18 md:h-22 object-cover rounded-lg sm:rounded-xl shadow-2xl z-20 border border-pink-500/50 sm:border-2 animate-pop-out"
                style={{ animationDelay: '3s' }}
              />
              
              {/* Floating people avatars - smaller on mobile */}
              <div 
                className="absolute top-[25%] left-[65%] -translate-x-1/2 -translate-y-1/2 w-5 h-5 sm:w-8 sm:h-8 md:w-11 md:h-11 rounded-full overflow-hidden shadow-xl border border-green-500 sm:border-2 z-20 animate-pop-out" 
                style={{ animationDelay: '0.7s' }}
              >
                <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Winner" className="w-full h-full object-cover" />
              </div>
              <div 
                className="absolute top-[65%] left-[30%] -translate-x-1/2 -translate-y-1/2 w-5 h-5 sm:w-7 sm:h-7 md:w-10 md:h-10 rounded-full overflow-hidden shadow-xl border border-amber-500 sm:border-2 z-20 animate-pop-out" 
                style={{ animationDelay: '2.2s' }}
              >
                <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Winner" className="w-full h-full object-cover" />
              </div>
              <div 
                className="absolute top-[90%] left-[40%] -translate-x-1/2 -translate-y-1/2 w-5 h-5 sm:w-7 sm:h-7 md:w-10 md:h-10 rounded-full overflow-hidden shadow-xl border border-blue-500 sm:border-2 z-20 animate-pop-out" 
                style={{ animationDelay: '3.8s' }}
              >
                <img src="https://randomuser.me/api/portraits/men/67.jpg" alt="Winner" className="w-full h-full object-cover" />
              </div>
              <div 
                className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-6 h-6 sm:w-9 sm:h-9 md:w-12 md:h-12 rounded-full overflow-hidden shadow-xl border border-purple-500 sm:border-2 z-20 animate-pop-out" 
                style={{ animationDelay: '1s' }}
              >
                <img src="https://randomuser.me/api/portraits/women/22.jpg" alt="Winner" className="w-full h-full object-cover" />
              </div>
              
              {/* Glow effect behind phone */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 bg-casino-cyan/40 rounded-full blur-3xl z-0" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 sm:w-32 sm:h-32 md:w-48 md:h-48 lg:w-56 lg:h-56 bg-primary/50 rounded-full blur-2xl z-0" />
              
              {/* Main phone image */}
              <img 
                src={lobbyBanner} 
                alt="Game Lobby" 
                className="w-auto h-36 sm:h-56 md:h-72 lg:h-80 object-contain mx-auto relative z-10 drop-shadow-2xl"
              />
            </div>
            
            {/* Text - Right side */}
            <div className="text-left">
              <h2 className="text-base sm:text-xl md:text-2xl font-bold text-white mb-1.5 sm:mb-3">
                Exciting online Slots
                <span className="block text-primary">& Casino-style games</span>
              </h2>
              <p className="text-muted-foreground text-[11px] sm:text-sm leading-relaxed">
                With over 150 games to choose from, there is always something new to play.
              </p>
            </div>
          </div>
          </div>

          <div className="flex justify-center gap-2 mt-4 sm:mt-6">
            <div className="w-6 sm:w-8 h-1 sm:h-1.5 rounded-full bg-primary" />
            <div className="w-1.5 sm:w-2 h-1 sm:h-1.5 rounded-full bg-white/30" />
            <div className="w-1.5 sm:w-2 h-1 sm:h-1.5 rounded-full bg-white/30" />
            <div className="w-1.5 sm:w-2 h-1 sm:h-1.5 rounded-full bg-white/30" />
          </div>
        </div>
        
        {/* Bottom fade gradient to blur the transition */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent z-20 pointer-events-none" />
      </section>

      {/* Leaderboard & Rewards Section */}
      <section className="relative z-10 container mx-auto px-3 sm:px-4 py-6 sm:py-8 -mt-4 sm:-mt-8">
        <div className="grid lg:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto">
          {/* Leaderboard - 3 columns on desktop, full width on mobile */}
          <div className="lg:col-span-3 relative rounded-xl p-3 sm:p-4 bg-card/60 backdrop-blur-sm">
            {/* Gradient border overlay */}
            <div className="absolute inset-0 rounded-xl pointer-events-none" style={{
              background: 'linear-gradient(to bottom, hsl(var(--casino-cyan) / 0.1) 0%, hsl(var(--casino-cyan) / 0.2) 50%, hsl(var(--casino-cyan) / 0.5) 100%)',
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'xor',
              WebkitMaskComposite: 'xor',
              padding: '1px'
            }} />
            <div className="text-center mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-bold text-white mb-1">NeonPlay Champions Live Board</h2>
              <p className="text-muted-foreground text-[10px] sm:text-[11px]">Earn points, rise through the levels, and Get Your Rewards.</p>
            </div>

            {/* Tabs - Full width pill style */}
            <div className="mb-3 sm:mb-4">
              <div className="flex bg-[#0c0c0c] border border-[#1a1a1a] rounded-full p-0.5 sm:p-1 shadow-[0_0_15px_rgba(255,255,255,0.03)]">
                {(['daily', 'weekly', 'monthly'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium rounded-full transition-all min-h-[36px] ${
                      activeTab === tab 
                        ? 'bg-[#161616] border border-[#2a2a2a] text-white' 
                        : 'text-[#666] hover:text-[#888] border border-transparent'
                    }`}
                  >
                    <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span className="hidden xs:inline">{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                    <span className="xs:hidden">{tab.charAt(0).toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Leaderboard - Table style */}
            <div className="sm:hidden">
              {/* Header row */}
              <div className="grid grid-cols-[56px_1fr_90px] gap-1.5 px-3 py-2.5 border-b border-border">
                <span className="text-[11px] text-muted-foreground font-medium">Position</span>
                <span className="text-[11px] text-muted-foreground font-medium">Name</span>
                <span className="text-[11px] text-muted-foreground font-medium text-right">Profit</span>
              </div>
              {/* Player rows */}
              <div className="space-y-0">
                {leaderboardData[0].slice(0, 8).map((player, index) => (
                  <div 
                    key={index}
                    className="grid grid-cols-[56px_1fr_90px] gap-1.5 items-center px-2 py-2 bg-[#1a1a1a] border-b border-[#2a2a2a] last:border-b-0 last:rounded-b-lg min-h-[44px]"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-flex items-center justify-center w-5 h-5 rounded-md border text-[10px] font-bold ${
                        index === 0 ? 'text-yellow-400 border-yellow-400/50' :
                        index === 1 ? 'text-gray-400 border-gray-400/50' :
                        index === 2 ? 'text-orange-400 border-orange-400/50' :
                        'text-muted-foreground border-border'
                      }`}>
                        {index + 1}
                      </span>
                      <img 
                        src={player.avatar} 
                        alt={player.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    </div>
                    <span className="text-xs font-medium text-white truncate">{player.name}</span>
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-xs font-bold text-white tabular-nums">{player.score.toLocaleString()}</span>
                      <Coins className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop Leaderboard Grid - 3 columns */}
            <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
              {leaderboardData.map((column, colIndex) => (
                <div key={colIndex} className="space-y-1 sm:space-y-1.5">
                  {column.map((player, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-2 bg-[#1a1a1a] rounded-lg p-1.5 sm:p-2 hover:bg-[#222] transition-colors min-h-[44px]"
                    >
                      <img 
                        src={player.avatar} 
                        alt={player.name}
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[8px] sm:text-[9px] text-muted-foreground">{player.position}</p>
                        <p className="text-[10px] sm:text-xs font-medium text-white truncate">{player.name}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] sm:text-xs font-bold text-white">{player.score.toLocaleString()}</span>
                        <Coins className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400" />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="hidden sm:flex justify-center mt-3 sm:mt-4">
              <Button size="sm" variant="outline" className="border-casino-cyan/50 text-casino-cyan hover:bg-casino-cyan hover:text-black text-[10px] sm:text-xs px-4 sm:px-6 min-h-[44px]">
                View All
              </Button>
            </div>
          </div>

          {/* Rewards - Hidden on mobile */}
          <div className="hidden sm:block relative bg-card/60 backdrop-blur-sm rounded-xl p-3 sm:p-4">
            {/* Gradient border */}
            <div className="absolute inset-0 rounded-xl pointer-events-none" style={{
              background: 'linear-gradient(to bottom, hsl(var(--casino-cyan) / 0.1) 0%, hsl(var(--casino-cyan) / 0.2) 50%, hsl(var(--casino-cyan) / 0.5) 100%)',
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'xor',
              WebkitMaskComposite: 'xor',
              padding: '1px'
            }} />
            <h3 className="text-lg sm:text-xl font-bold text-white text-center mb-2 sm:mb-3">Rewards</h3>
            
            {/* Character with coins - smaller on mobile */}
            <div className="relative flex justify-center mb-3 sm:mb-4">
              <img 
                src={treasureChest} 
                alt="Rewards" 
                className="w-24 sm:w-36 h-auto mx-auto drop-shadow-[0_0_20px_rgba(255,180,0,0.3)]"
              />
            </div>

            <div className="space-y-2 sm:space-y-3">
              {/* Monthly */}
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-1 sm:mb-1.5">Monthly</p>
                <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-lg p-1.5 sm:p-2 hover:bg-[#222] transition-colors min-h-[40px]">
                  <img 
                    src="https://randomuser.me/api/portraits/men/32.jpg" 
                    alt="Winner"
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover"
                  />
                  <span className="text-xs sm:text-sm text-white flex-1 font-medium truncate">Phoenix Baker</span>
                  <div className="flex items-center gap-1">
                    <Coins className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400" />
                    <span className="font-bold text-white text-xs sm:text-sm">500</span>
                  </div>
                </div>
              </div>

              {/* Weekly */}
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-1 sm:mb-1.5">Weekly Rewards</p>
                <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-lg p-1.5 sm:p-2 hover:bg-[#222] transition-colors min-h-[40px]">
                  <img 
                    src="https://randomuser.me/api/portraits/women/44.jpg" 
                    alt="Winner"
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover"
                  />
                  <span className="text-xs sm:text-sm text-white flex-1 font-medium truncate">Sarah Mitchell</span>
                  <div className="flex items-center gap-1">
                    <Coins className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400" />
                    <span className="font-bold text-white text-xs sm:text-sm">100</span>
                  </div>
                </div>
              </div>

              {/* Daily */}
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-1 sm:mb-1.5">Daily Rewards</p>
                <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-lg p-1.5 sm:p-2 hover:bg-[#222] transition-colors min-h-[40px]">
                  <img 
                    src="https://randomuser.me/api/portraits/men/67.jpg" 
                    alt="Winner"
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover"
                  />
                  <span className="text-xs sm:text-sm text-white flex-1 font-medium truncate">James Wilson</span>
                  <div className="flex items-center gap-1">
                    <Coins className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400" />
                    <span className="font-bold text-white text-xs sm:text-sm">20</span>
                  </div>
                </div>
              </div>
            </div>

            <Button size="sm" className="w-full mt-3 sm:mt-4 bg-primary hover:bg-primary/90 text-xs sm:text-sm min-h-[44px]">
              See Prices
            </Button>
          </div>
        </div>
      </section>

      {/* Game-Changing Perks Section */}
      <section className="relative z-10 container mx-auto px-3 sm:px-4 py-8 sm:py-12">
        <div className="text-center mb-6 sm:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3">
            Game-Changing Perks, <span className="text-primary">Just for You</span>
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-lg mx-auto px-2">
            From thrilling games to instant rewards, we deliver nonstop excitement and real chances to win.
          </p>
        </div>

        <div className="relative">
          {/* Center Spin Wheel */}
          <div className="flex justify-center mb-4 sm:mb-8 md:mb-0">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 sm:w-56 sm:h-56 md:w-72 md:h-72 bg-primary/30 rounded-full blur-3xl" />
              <img 
                src={spinWheel} 
                alt="Spin Wheel" 
                className="w-40 h-40 sm:w-56 sm:h-56 md:w-72 md:h-72 object-contain relative z-10 animate-spin-slow drop-shadow-[0_0_30px_rgba(34,211,238,0.3)]"
              />
            </div>
          </div>
          
          {/* Full-width shadow overlay at bottom of wheel area - Desktop only */}
          <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-1/3 w-screen h-80 z-20 pointer-events-none" style={{
            background: 'linear-gradient(to top, hsl(var(--background)) 0%, hsl(var(--background)) 40%, hsl(var(--background) / 0.8) 60%, hsl(var(--background) / 0.3) 80%, transparent 100%)'
          }} />

          {/* Perks - Left Side (2 cards) - Desktop only */}
          <div className="hidden md:flex flex-col gap-4 absolute left-[calc(50%-320px)] lg:left-[calc(50%-380px)] top-1/2 -translate-y-1/2 z-30 pointer-events-auto">
            {perks.slice(0, 2).map((perk, index) => (
              <div 
                key={index}
                className="relative bg-card/90 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3 max-w-[220px] overflow-visible"
              >
                {/* Gradient border */}
                <div className="absolute inset-0 rounded-xl pointer-events-none" style={{
                  background: 'linear-gradient(to bottom, hsl(var(--casino-cyan) / 0.1) 0%, hsl(var(--casino-cyan) / 0.2) 50%, hsl(var(--casino-cyan) / 0.4) 100%)',
                  mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  maskComposite: 'xor',
                  WebkitMaskComposite: 'xor',
                  padding: '1px'
                }} />
                {/* Custom badges for perks */}
                {index === 0 ? (
                  <div className="relative w-11 h-11 flex-shrink-0 overflow-visible z-10">
                    <img 
                      src={vipStarBadge} 
                      alt="VIP Badge" 
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 max-w-none max-h-none object-contain drop-shadow-[0_0_10px_rgba(255,180,0,0.5)] z-10"
                    />
                  </div>
                ) : index === 1 ? (
                  <div className="relative w-11 h-11 flex-shrink-0 overflow-visible z-10">
                    <img 
                      src={premiumGamesBadge} 
                      alt="Premium Games" 
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 max-w-none max-h-none object-contain drop-shadow-[0_0_10px_rgba(255,180,0,0.5)] z-10"
                    />
                  </div>
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0">
                    <perk.icon className="w-5 h-5 text-white" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-white text-sm leading-tight mb-0.5">{perk.title}</h3>
                  <p className="text-xs text-muted-foreground leading-tight line-clamp-2">{perk.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Perks - Right Side (2 cards) */}
          <div className="hidden md:flex flex-col gap-4 absolute right-[calc(50%-320px)] lg:right-[calc(50%-380px)] top-1/2 -translate-y-1/2 z-30 pointer-events-auto">
            {perks.slice(2, 4).map((perk, index) => (
              <div 
                key={index}
                className="relative bg-card/90 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3 max-w-[220px]"
              >
                {/* Gradient border */}
                <div className="absolute inset-0 rounded-xl pointer-events-none" style={{
                  background: 'linear-gradient(to bottom, hsl(var(--casino-cyan) / 0.1) 0%, hsl(var(--casino-cyan) / 0.2) 50%, hsl(var(--casino-cyan) / 0.4) 100%)',
                  mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  maskComposite: 'xor',
                  WebkitMaskComposite: 'xor',
                  padding: '1px'
                }} />
                {/* Safe Gaming badge for index 1 (Safe & Fair Gaming) */}
                {index === 1 ? (
                  <div className="relative w-11 h-11 flex-shrink-0 overflow-visible z-10">
                    <img 
                      src={safeGamingBadge} 
                      alt="Safe Gaming" 
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 max-w-none max-h-none object-contain drop-shadow-[0_0_10px_rgba(255,180,0,0.5)] z-10"
                    />
                  </div>
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0">
                    <perk.icon className="w-5 h-5 text-white" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-white text-sm leading-tight mb-0.5">{perk.title}</h3>
                  <p className="text-xs text-muted-foreground leading-tight line-clamp-2">{perk.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Perks Grid - 2x2 with row-style cards */}
          <div className="grid grid-cols-2 gap-2 md:hidden -mt-8 relative z-30">
            {perks.map((perk, index) => (
              <div 
                key={index}
                className="relative bg-card/90 backdrop-blur-sm rounded-xl p-3 flex items-center gap-2.5 overflow-visible"
              >
                {/* Gradient border - same as desktop */}
                <div className="absolute inset-0 rounded-xl pointer-events-none" style={{
                  background: 'linear-gradient(to bottom, hsl(var(--casino-cyan) / 0.1) 0%, hsl(var(--casino-cyan) / 0.2) 50%, hsl(var(--casino-cyan) / 0.4) 100%)',
                  mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  maskComposite: 'xor',
                  WebkitMaskComposite: 'xor',
                  padding: '1px'
                }} />
                
                {/* Badge/Icon - same style as desktop */}
                {index === 0 ? (
                  <div className="relative w-10 h-10 flex-shrink-0 overflow-visible z-10">
                    <img 
                      src={vipStarBadge} 
                      alt="VIP Badge" 
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 max-w-none max-h-none object-contain drop-shadow-[0_0_10px_rgba(255,180,0,0.5)] z-10"
                    />
                  </div>
                ) : index === 1 ? (
                  <div className="relative w-10 h-10 flex-shrink-0 overflow-visible z-10">
                    <img 
                      src={premiumGamesBadge} 
                      alt="Premium Games" 
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 max-w-none max-h-none object-contain drop-shadow-[0_0_10px_rgba(255,180,0,0.5)] z-10"
                    />
                  </div>
                ) : index === 3 ? (
                  <div className="relative w-10 h-10 flex-shrink-0 overflow-visible z-10">
                    <img 
                      src={safeGamingBadge} 
                      alt="Safe Gaming" 
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 max-w-none max-h-none object-contain drop-shadow-[0_0_10px_rgba(255,180,0,0.5)] z-10"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0">
                    <perk.icon className="w-5 h-5 text-white" />
                  </div>
                )}
                
                {/* Text Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-xs leading-tight mb-0.5">{perk.title}</h3>
                  <p className="text-[10px] text-muted-foreground leading-tight line-clamp-2">{perk.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Slot Machine Games Section */}
      <section className="relative z-10 py-6 sm:py-16 overflow-hidden -mt-4 sm:mt-0">
        {/* Background with games collage image */}
        <div className="absolute inset-0">
          <img 
            src={gamesCollageBg} 
            alt="" 
            className="w-full h-full object-cover"
          />
          {/* Dark blur overlay */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          {/* Top fade to black */}
          <div className="absolute inset-x-0 top-0 h-20 sm:h-32 bg-gradient-to-b from-background to-transparent" />
          {/* Bottom fade to black */}
          <div className="absolute inset-x-0 bottom-0 h-20 sm:h-32 bg-gradient-to-t from-background to-transparent" />
        </div>
        
        <div className="relative container mx-auto px-3 sm:px-4">
          <div className="relative bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-sm sm:max-w-md mx-auto">
            {/* Gradient border */}
            <div className="absolute inset-0 rounded-xl sm:rounded-2xl pointer-events-none z-0" style={{
              background: 'linear-gradient(to bottom, hsl(var(--casino-cyan) / 0.1) 0%, hsl(var(--casino-cyan) / 0.2) 50%, hsl(var(--casino-cyan) / 0.5) 100%)',
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'xor',
              WebkitMaskComposite: 'xor',
              padding: '1px'
            }} />

            {/* Games Grid - Slot Machine Style */}
            <div ref={slotContainerRef} className="grid grid-cols-4 gap-1.5 sm:gap-2 mb-3 sm:mb-4">
              {[0, 1, 2, 3].map((slotIndex) => {
                const isSlotSpinning = isSpinning && (spinningIndex === null || spinningIndex >= slotIndex);
                const game = displayedGames[slotIndex];
                
                return (
                  <div 
                    key={`slot-${slotIndex}`}
                    className="aspect-[3/4] rounded-lg overflow-hidden border-2 relative bg-black shadow-lg"
                    style={{
                      borderColor: selectedGame?.name === game?.name && !isSpinning 
                        ? 'hsl(var(--primary))' 
                        : 'hsl(var(--primary) / 0.3)'
                    }}
                  >
                    {/* Slot machine reel container */}
                    <div 
                      className="absolute inset-0 flex flex-col-reverse transition-transform"
                      style={{
                        transform: isSlotSpinning 
                          ? `translateY(${reelOffsets[slotIndex]}%)` 
                          : 'translateY(0)',
                        transition: !isSlotSpinning ? 'transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1.5)' : 'none'
                      }}
                    >
                      {/* Show multiple games stacked for spinning effect */}
                      {isSlotSpinning ? (
                        <>
                          {[...allGames, ...allGames, ...allGames].map((g, i) => (
                            <img 
                              key={i}
                              src={g.image} 
                              alt={g.name}
                              className="w-full flex-shrink-0 object-cover"
                              style={{ height: '100%' }}
                            />
                          ))}
                        </>
                      ) : (
                        <img 
                          src={game?.image} 
                          alt={game?.name}
                          className="w-full h-full object-cover transition-all duration-300"
                        />
                      )}
                    </div>
                    
                    {/* Spinning blur overlay with motion lines */}
                    {isSlotSpinning && (
                      <div className="absolute inset-0 z-10">
                        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/70" />
                        {/* Motion blur lines */}
                        <div className="absolute inset-0 opacity-30" style={{
                          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)'
                        }} />
                      </div>
                    )}
                    
                    {/* Winner glow effect */}
                    {showWinEffect && !isSpinning && (
                      <div className="absolute inset-0 z-20">
                        <div className="absolute inset-0 bg-primary/40 animate-pulse" />
                        <div className="absolute inset-0 ring-2 ring-primary ring-offset-2 ring-offset-background animate-pulse" />
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 animate-shimmer" style={{
                          animation: 'shimmer 1.5s infinite',
                        }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <h3 className={`text-base sm:text-lg font-bold text-center mb-2 sm:mb-3 transition-all duration-300 ${showWinEffect ? 'text-primary scale-110 animate-pulse' : 'text-white'}`}>
              {isSpinning ? 'Spinning...' : selectedGame ? `${selectedGame.name}!` : 'Spin to Pick a Game!'}
            </h3>
            
            <div className="flex justify-center">
              <Button 
                onClick={() => {
                  // If we have a winning game, open sign up modal
                  if (showWinEffect && selectedGame) {
                    setSignUpOpen(true);
                    return;
                  }
                  
                  if (isSpinning) return;
                  
                  setIsSpinning(true);
                  setSelectedGame(null);
                  setSpinningIndex(null);
                  setShowWinEffect(false);
                  
                  // Pick the winning game upfront - all reels will show this same game
                  const winningGame = allGames[Math.floor(Math.random() * allGames.length)];
                  
                  // Start spinning animation with offsets
                  const spinInterval = setInterval(() => {
                    setReelOffsets(prev => prev.map((offset, i) => {
                      // Different speeds for each reel
                      const speed = 8 + i * 2;
                      return (offset + speed) % (100 * allGames.length);
                    }));
                  }, 50);
                  
                  // Staggered stop times for each reel (4 reels now)
                  const stopTimes = [1000, 1500, 2000, 2500];
                  
                  stopTimes.forEach((time, index) => {
                    setTimeout(() => {
                      // All reels stop on the SAME winning game
                      setDisplayedGames(prev => {
                        const newGames = [...prev];
                        newGames[index] = winningGame;
                        return newGames;
                      });
                      setSpinningIndex(index);
                      setReelOffsets(prev => {
                        const newOffsets = [...prev];
                        newOffsets[index] = 0;
                        return newOffsets;
                      });
                      
                      // If last slot, end spinning and trigger win effect
                      if (index === 3) {
                        clearInterval(spinInterval);
                        setTimeout(() => {
                          setSpinningIndex(null);
                          setIsSpinning(false);
                          setReelOffsets([0, 0, 0, 0]);
                          setSelectedGame(winningGame);
                          
                        }, 100);
                      }
                    }, time);
                  });
                }}
                disabled={isSpinning}
                className={`bg-primary hover:bg-primary/90 px-5 sm:px-6 min-h-[44px] text-sm sm:text-base ${isSpinning ? 'animate-pulse' : ''} ${showWinEffect ? 'shadow-[0_0_20px_hsl(var(--primary)/0.5)]' : ''}`}
              >
                {isSpinning ? 'Spinning...' : showWinEffect && selectedGame ? 'Go to Game' : 'Spin & Play'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - 3 Steps */}
      <section className="relative z-10 container mx-auto px-3 sm:px-4 py-10 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {stepsData.map((step, index) => (
            <div 
              key={index}
              className="relative bg-card rounded-xl sm:rounded-2xl p-5 sm:p-8 text-center overflow-hidden group"
            >
              {/* Gradient border */}
              <div className="absolute inset-0 rounded-xl sm:rounded-2xl pointer-events-none transition-all group-hover:opacity-100" style={{
                background: 'linear-gradient(to bottom, hsl(var(--casino-cyan) / 0.1) 0%, hsl(var(--casino-cyan) / 0.2) 50%, hsl(var(--casino-cyan) / 0.4) 100%)',
                mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                maskComposite: 'xor',
                WebkitMaskComposite: 'xor',
                padding: '1px'
              }} />
              {/* Step number background */}
              <div className={`absolute -top-2 sm:-top-4 -left-1 sm:-left-2 text-6xl sm:text-8xl font-black opacity-10 ${step.color}`}>
                {step.number}
              </div>
              
              {/* Icon */}
              <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                {step.isImage ? (
                  <img src={step.icon} alt={step.title} className="w-full h-full object-contain" />
                ) : (
                  <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-card to-secondary flex items-center justify-center text-2xl sm:text-4xl border border-border">
                    {step.icon}
                  </div>
                )}
              </div>
              
              <h3 className="text-base sm:text-xl font-bold text-white mb-2 sm:mb-3">{step.title}</h3>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Providers Carousel */}
      <section className="relative z-10 py-4 md:py-6 overflow-hidden">
        <div className="relative overflow-hidden">
          <div className="flex items-center animate-scroll-providers" style={{ width: 'max-content' }}>
            {[...providers, ...providers].map((provider, index) => (
              <div 
                key={index}
                className="flex-shrink-0 px-4 md:px-6 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <img 
                  src={provider.logo} 
                  alt={provider.name}
                  className="h-6 md:h-8 lg:h-10 w-auto object-contain"
                  style={{ minWidth: '60px' }}
                />
              </div>
            ))}
          </div>
        </div>
        <style>{`
          @keyframes scroll-providers {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
          .animate-scroll-providers {
            animation: scroll-providers 30s linear infinite;
            will-change: transform;
          }
          .animate-scroll-providers:hover {
            animation-play-state: paused;
          }
        `}</style>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 container mx-auto px-3 sm:px-4 py-10 sm:py-16">
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-8 items-start max-w-5xl mx-auto">
          {/* Title */}
          <div className="lg:sticky lg:top-24 text-center lg:text-left">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">Frequently</h2>
            <h2 className="text-xl sm:text-2xl font-bold text-primary">Asked Questions</h2>
          </div>

          {/* Accordion */}
          <div className="lg:col-span-2">
            <Accordion type="single" collapsible defaultValue="item-0" className="space-y-2">
              {faqData.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="relative bg-card rounded-xl px-3 sm:px-4 overflow-hidden data-[state=open]:shadow-[0_0_15px_hsl(var(--casino-cyan)/0.1)]"
                >
                  {/* Gradient border */}
                  <div className="absolute inset-0 rounded-xl pointer-events-none" style={{
                    background: 'linear-gradient(to bottom, hsl(var(--casino-cyan) / 0.05) 0%, hsl(var(--casino-cyan) / 0.15) 50%, hsl(var(--casino-cyan) / 0.3) 100%)',
                    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    maskComposite: 'xor',
                    WebkitMaskComposite: 'xor',
                    padding: '1px'
                  }} />
                  <AccordionTrigger className="text-left text-white hover:no-underline py-3 sm:py-4 text-xs sm:text-sm font-medium min-h-[48px]">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-3 sm:pb-4 text-[11px] sm:text-xs leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Footer spacing */}
      <div className="h-12 sm:h-20" />

      {/* Animations */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>

      {/* Footer */}
      <div className="container mx-auto px-3 sm:px-4">
        <Footer />
      </div>

      {/* Auth Modals */}
      <AuthModals
        isSignInOpen={signInOpen}
        isSignUpOpen={signUpOpen}
        onCloseSignIn={() => setSignInOpen(false)}
        onCloseSignUp={() => setSignUpOpen(false)}
        onSwitchToSignUp={() => { setSignInOpen(false); setSignUpOpen(true); }}
        onSwitchToSignIn={() => { setSignUpOpen(false); setSignInOpen(true); }}
      />

      {/* Register Modal */}
      <RegisterModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onSwitchToLogin={() => {
          setRegisterModalOpen(false);
          setLoginModalOpen(true);
        }}
        onForgotPassword={() => {
          setRegisterModalOpen(false);
          setForgotPasswordOpen(true);
        }}
        onRegistrationSuccess={(email) => {
          setRegisterModalOpen(false);
          setRegisteredEmail(email);
          setEmailVerificationOpen(true);
        }}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSwitchToRegister={() => {
          setLoginModalOpen(false);
          setRegisterModalOpen(true);
        }}
        onForgotPassword={() => {
          setLoginModalOpen(false);
          setForgotPasswordOpen(true);
        }}
      />

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
        onBackToLogin={() => {
          setForgotPasswordOpen(false);
          setLoginModalOpen(true);
        }}
      />

      {/* Location Issue Modal */}
      <LocationIssueModal
        isOpen={locationIssueOpen}
        onClose={() => setLocationIssueOpen(false)}
      />

      {/* Email Verification Modal */}
      <EmailVerificationModal
        isOpen={emailVerificationOpen}
        onClose={() => setEmailVerificationOpen(false)}
        email={registeredEmail}
        onVerifyByMobile={() => {
          setEmailVerificationOpen(false);
          setPhoneVerificationOpen(true);
        }}
      />

      {/* Resend Verification Modal */}
      <ResendVerificationModal
        isOpen={resendVerificationOpen}
        onClose={() => setResendVerificationOpen(false)}
      />

      {/* Phone Verification Modal */}
      <PhoneVerificationModal
        isOpen={phoneVerificationOpen}
        onClose={() => setPhoneVerificationOpen(false)}
        onVerifyByEmail={() => {
          setPhoneVerificationOpen(false);
          setEmailVerificationOpen(true);
        }}
      />

      {/* OTP Verification Modal */}
      <OTPVerificationModal
        isOpen={otpVerificationOpen}
        onClose={() => setOtpVerificationOpen(false)}
        onChangeNumber={() => {
          setOtpVerificationOpen(false);
          setPhoneVerificationOpen(true);
        }}
      />
    </div>
  );
}