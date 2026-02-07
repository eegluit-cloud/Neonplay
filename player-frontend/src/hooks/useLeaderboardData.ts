import { useState, useEffect, useCallback } from 'react';
import { leaderboardApi } from '../lib/api';

export interface Winner {
  name: string;
  amount: number;
  country: string;
  countryFlag: string;
  game: string;
  gameIcon: string;
  level: number;
  avatar: string;
  isRealPhoto: boolean;
}

export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly';

// API fetch function
const fetchLeaderboardFromApi = async (period: LeaderboardPeriod): Promise<Winner[] | null> => {
  try {
    const response = await leaderboardApi.get(period, 25);
    if (response.data && Array.isArray(response.data)) {
      return response.data.map((entry: any) => ({
        name: entry.username || entry.name || 'Anonymous',
        amount: entry.wageredAmount || entry.amount || 0,
        country: entry.countryCode || 'US',
        countryFlag: getCountryFlag(entry.countryCode || 'US'),
        game: entry.lastGame || 'Slots',
        gameIcon: '🎰',
        level: entry.vipLevel || 1,
        avatar: entry.avatarUrl || entry.username || 'player',
        isRealPhoto: !!entry.avatarUrl,
      }));
    }
    return null;
  } catch {
    return null;
  }
};

const getCountryFlag = (code: string): string => {
  const flags: Record<string, string> = {
    US: '🇺🇸', UK: '🇬🇧', CA: '🇨🇦', AU: '🇦🇺', DE: '🇩🇪', FR: '🇫🇷',
    JP: '🇯🇵', IL: '🇮🇱', IT: '🇮🇹', ES: '🇪🇸', BR: '🇧🇷', NL: '🇳🇱',
    AT: '🇦🇹', SG: '🇸🇬', AE: '🇦🇪', RU: '🇷🇺', CN: '🇨🇳', KR: '🇰🇷',
    IE: '🇮🇪', MC: '🇲🇨',
  };
  return flags[code] || '🏳️';
};

const createDailyWinners = (): Winner[] => [
  { name: 'Marcus Chen', amount: 9954.34, country: 'US', countryFlag: '🇺🇸', game: 'Sweet Bonanza', gameIcon: '🎰', level: 5, avatar: 'https://randomuser.me/api/portraits/men/32.jpg', isRealPhoto: true },
  { name: 'Elena Rodriguez', amount: 2658.25, country: 'UK', countryFlag: '🇬🇧', game: 'Gates of Olympus', gameIcon: '🃏', level: 4, avatar: 'https://randomuser.me/api/portraits/women/44.jpg', isRealPhoto: true },
  { name: 'Jake Thompson', amount: 2549.87, country: 'US', countryFlag: '🇺🇸', game: 'Book of Dead', gameIcon: '🎰', level: 5, avatar: 'https://randomuser.me/api/portraits/men/67.jpg', isRealPhoto: true },
  { name: 'Sofia Martinez', amount: 1954.34, country: 'IL', countryFlag: '🇮🇱', game: 'Crazy Time', gameIcon: '🃏', level: 4, avatar: 'https://randomuser.me/api/portraits/women/28.jpg', isRealPhoto: true },
  { name: 'CryptoKing99', amount: 1254.89, country: 'US', countryFlag: '🇺🇸', game: 'Big Bass Splash', gameIcon: '🎰', level: 3, avatar: 'crypto', isRealPhoto: false },
  { name: 'LuckyDragon', amount: 954.12, country: 'UK', countryFlag: '🇬🇧', game: 'Lightning Roulette', gameIcon: '🃏', level: 3, avatar: 'https://randomuser.me/api/portraits/men/15.jpg', isRealPhoto: true },
  { name: 'DiamondQueen', amount: 854.50, country: 'CA', countryFlag: '🇨🇦', game: 'Starburst', gameIcon: '🎰', level: 4, avatar: 'diamond', isRealPhoto: false },
  { name: 'Alex Turner', amount: 754.20, country: 'AU', countryFlag: '🇦🇺', game: 'Gonzo Quest', gameIcon: '🃏', level: 2, avatar: 'https://randomuser.me/api/portraits/men/22.jpg', isRealPhoto: true },
  { name: 'MegaWinner', amount: 654.80, country: 'DE', countryFlag: '🇩🇪', game: 'Wolf Gold', gameIcon: '🎰', level: 3, avatar: 'mega', isRealPhoto: false },
  { name: 'Isabella Costa', amount: 554.60, country: 'FR', countryFlag: '🇫🇷', game: 'Blackjack VIP', gameIcon: '🃏', level: 2, avatar: 'https://randomuser.me/api/portraits/women/33.jpg', isRealPhoto: true },
  { name: 'HighRoller88', amount: 510, country: 'US', countryFlag: '🇺🇸', game: 'Dragon Pearls', gameIcon: '🎰', level: 2, avatar: 'roller', isRealPhoto: false },
  { name: 'Ryan Mitchell', amount: 498, country: 'US', countryFlag: '🇺🇸', game: 'Mega Moolah', gameIcon: '🎰', level: 2, avatar: 'https://randomuser.me/api/portraits/men/41.jpg', isRealPhoto: true },
  { name: 'GoldenAce', amount: 485, country: 'UK', countryFlag: '🇬🇧', game: 'Book of Ra', gameIcon: '🎰', level: 3, avatar: 'golden', isRealPhoto: false },
  { name: 'Emma Davis', amount: 472, country: 'CA', countryFlag: '🇨🇦', game: 'Dead or Alive', gameIcon: '🎰', level: 1, avatar: 'https://randomuser.me/api/portraits/women/52.jpg', isRealPhoto: true },
  { name: 'ProGambler', amount: 458, country: 'AU', countryFlag: '🇦🇺', game: 'Reactoonz', gameIcon: '🎰', level: 2, avatar: 'pro', isRealPhoto: false },
  { name: 'Olivia Brown', amount: 445, country: 'DE', countryFlag: '🇩🇪', game: 'Monopoly Live', gameIcon: '🎰', level: 2, avatar: 'https://randomuser.me/api/portraits/women/61.jpg', isRealPhoto: true },
  { name: 'BetMaster', amount: 432, country: 'FR', countryFlag: '🇫🇷', game: 'Immortal Romance', gameIcon: '🎰', level: 3, avatar: 'bet', isRealPhoto: false },
  { name: 'Noah Wilson', amount: 418, country: 'US', countryFlag: '🇺🇸', game: 'Thunderstruck II', gameIcon: '🎰', level: 1, avatar: 'https://randomuser.me/api/portraits/men/55.jpg', isRealPhoto: true },
  { name: 'RichPlayer', amount: 405, country: 'UK', countryFlag: '🇬🇧', game: 'Jammin Jars', gameIcon: '🎰', level: 2, avatar: 'rich', isRealPhoto: false },
  { name: 'Mia Johnson', amount: 392, country: 'CA', countryFlag: '🇨🇦', game: 'Fruit Party', gameIcon: '🎰', level: 1, avatar: 'https://randomuser.me/api/portraits/women/17.jpg', isRealPhoto: true },
  { name: 'WinStreak', amount: 378, country: 'AU', countryFlag: '🇦🇺', game: 'Buffalo King', gameIcon: '🎰', level: 2, avatar: 'streak', isRealPhoto: false },
  { name: 'Liam Garcia', amount: 365, country: 'DE', countryFlag: '🇩🇪', game: 'Rise of Olympus', gameIcon: '🎰', level: 1, avatar: 'https://randomuser.me/api/portraits/men/73.jpg', isRealPhoto: true },
  { name: 'SlotKing', amount: 352, country: 'FR', countryFlag: '🇫🇷', game: 'Money Train 3', gameIcon: '🎰', level: 3, avatar: 'slot', isRealPhoto: false },
  { name: 'Ava Martinez', amount: 338, country: 'US', countryFlag: '🇺🇸', game: 'Sugar Rush', gameIcon: '🎰', level: 1, avatar: 'https://randomuser.me/api/portraits/women/25.jpg', isRealPhoto: true },
  { name: 'JackpotHunter', amount: 325, country: 'UK', countryFlag: '🇬🇧', game: 'The Dog House', gameIcon: '🎰', level: 2, avatar: 'jackpot', isRealPhoto: false },
];

const createWeeklyWinners = (): Winner[] => [
  { name: 'Victoria Blake', amount: 45820.50, country: 'UK', countryFlag: '🇬🇧', game: 'Mega Moolah', gameIcon: '🎰', level: 5, avatar: 'https://randomuser.me/api/portraits/women/12.jpg', isRealPhoto: true },
  { name: 'DragonMaster', amount: 38450.25, country: 'JP', countryFlag: '🇯🇵', game: 'Dragon Tiger', gameIcon: '🐉', level: 5, avatar: 'dragonmaster', isRealPhoto: false },
  { name: 'Carlos Mendez', amount: 31200.80, country: 'ES', countryFlag: '🇪🇸', game: 'Lightning Roulette', gameIcon: '⚡', level: 4, avatar: 'https://randomuser.me/api/portraits/men/45.jpg', isRealPhoto: true },
  { name: 'WhaleKing', amount: 28900.00, country: 'AE', countryFlag: '🇦🇪', game: 'Baccarat', gameIcon: '🃏', level: 5, avatar: 'whale', isRealPhoto: false },
  { name: 'Sophie Laurent', amount: 24500.75, country: 'FR', countryFlag: '🇫🇷', game: 'Crazy Time', gameIcon: '🎡', level: 4, avatar: 'https://randomuser.me/api/portraits/women/23.jpg', isRealPhoto: true },
  { name: 'MaxProfit', amount: 21800.30, country: 'DE', countryFlag: '🇩🇪', game: 'Book of Dead', gameIcon: '📖', level: 4, avatar: 'maxprofit', isRealPhoto: false },
  { name: 'Akira Tanaka', amount: 19650.45, country: 'JP', countryFlag: '🇯🇵', game: 'Pachinko', gameIcon: '🎰', level: 5, avatar: 'https://randomuser.me/api/portraits/men/78.jpg', isRealPhoto: true },
  { name: 'LadyLuck777', amount: 17200.20, country: 'US', countryFlag: '🇺🇸', game: 'Wheel of Fortune', gameIcon: '🎡', level: 3, avatar: 'ladyluck', isRealPhoto: false },
  { name: 'Hans Mueller', amount: 15800.90, country: 'DE', countryFlag: '🇩🇪', game: 'Blackjack VIP', gameIcon: '🃏', level: 4, avatar: 'https://randomuser.me/api/portraits/men/34.jpg', isRealPhoto: true },
  { name: 'CasinoQueen', amount: 14200.55, country: 'IT', countryFlag: '🇮🇹', game: 'Sweet Bonanza', gameIcon: '🍬', level: 4, avatar: 'casinoqueen', isRealPhoto: false },
  { name: 'Laura Rossi', amount: 12900.40, country: 'IT', countryFlag: '🇮🇹', game: 'Gonzo Quest', gameIcon: '🗿', level: 3, avatar: 'https://randomuser.me/api/portraits/women/56.jpg', isRealPhoto: true },
  { name: 'BigWinner99', amount: 11500.25, country: 'BR', countryFlag: '🇧🇷', game: 'Gates of Olympus', gameIcon: '⚡', level: 3, avatar: 'bigwinner', isRealPhoto: false },
  { name: 'Pierre Dubois', amount: 10800.70, country: 'FR', countryFlag: '🇫🇷', game: 'Monopoly Live', gameIcon: '🎲', level: 2, avatar: 'https://randomuser.me/api/portraits/men/89.jpg', isRealPhoto: true },
  { name: 'SlotMachine', amount: 9650.35, country: 'NL', countryFlag: '🇳🇱', game: 'Starburst', gameIcon: '⭐', level: 3, avatar: 'slotmachine', isRealPhoto: false },
  { name: 'Anna Schmidt', amount: 8900.80, country: 'AT', countryFlag: '🇦🇹', game: 'Wolf Gold', gameIcon: '🐺', level: 2, avatar: 'https://randomuser.me/api/portraits/women/67.jpg', isRealPhoto: true },
];

const createMonthlyWinners = (): Winner[] => [
  { name: 'William Sterling', amount: 285000.00, country: 'US', countryFlag: '🇺🇸', game: 'Mega Fortune', gameIcon: '💎', level: 5, avatar: 'https://randomuser.me/api/portraits/men/11.jpg', isRealPhoto: true },
  { name: 'CryptoWhale', amount: 198500.50, country: 'SG', countryFlag: '🇸🇬', game: 'Lightning Roulette', gameIcon: '⚡', level: 5, avatar: 'cryptowhale', isRealPhoto: false },
  { name: 'Yuki Yamamoto', amount: 156200.25, country: 'JP', countryFlag: '🇯🇵', game: 'Baccarat', gameIcon: '🃏', level: 5, avatar: 'https://randomuser.me/api/portraits/women/8.jpg', isRealPhoto: true },
  { name: 'DiamondKing', amount: 132800.75, country: 'AE', countryFlag: '🇦🇪', game: 'VIP Blackjack', gameIcon: '🃏', level: 5, avatar: 'diamondking', isRealPhoto: false },
  { name: 'Alexander Volkov', amount: 118900.30, country: 'RU', countryFlag: '🇷🇺', game: 'Crazy Time', gameIcon: '🎡', level: 5, avatar: 'https://randomuser.me/api/portraits/men/28.jpg', isRealPhoto: true },
  { name: 'GoldRush88', amount: 98500.45, country: 'AU', countryFlag: '🇦🇺', game: 'Mega Moolah', gameIcon: '🦁', level: 5, avatar: 'goldrush', isRealPhoto: false },
  { name: 'Isabella Romano', amount: 87200.20, country: 'IT', countryFlag: '🇮🇹', game: 'Book of Ra', gameIcon: '📖', level: 5, avatar: 'https://randomuser.me/api/portraits/women/39.jpg', isRealPhoto: true },
  { name: 'HighStakes', amount: 76800.90, country: 'UK', countryFlag: '🇬🇧', game: 'Deal or No Deal', gameIcon: '💼', level: 5, avatar: 'highstakes', isRealPhoto: false },
  { name: 'Chen Wei', amount: 68500.55, country: 'CN', countryFlag: '🇨🇳', game: 'Dragon Tiger', gameIcon: '🐉', level: 4, avatar: 'https://randomuser.me/api/portraits/men/59.jpg', isRealPhoto: true },
  { name: 'VIPPlayer', amount: 59200.40, country: 'MC', countryFlag: '🇲🇨', game: 'European Roulette', gameIcon: '🎰', level: 5, avatar: 'vipplayer', isRealPhoto: false },
  { name: 'Maria Santos', amount: 52800.25, country: 'BR', countryFlag: '🇧🇷', game: 'Sweet Bonanza', gameIcon: '🍬', level: 4, avatar: 'https://randomuser.me/api/portraits/women/71.jpg', isRealPhoto: true },
  { name: 'EliteGambler', amount: 48500.70, country: 'CA', countryFlag: '🇨🇦', game: 'Monopoly Live', gameIcon: '🎲', level: 5, avatar: 'elitegambler', isRealPhoto: false },
  { name: 'David Park', amount: 42100.35, country: 'KR', countryFlag: '🇰🇷', game: 'Poker', gameIcon: '🃏', level: 4, avatar: 'https://randomuser.me/api/portraits/men/82.jpg', isRealPhoto: true },
  { name: 'LuckyCharm', amount: 38900.80, country: 'IE', countryFlag: '🇮🇪', game: 'Rainbow Riches', gameIcon: '🌈', level: 4, avatar: 'luckycharm', isRealPhoto: false },
  { name: 'Sarah Kim', amount: 35200.15, country: 'KR', countryFlag: '🇰🇷', game: 'Gates of Olympus', gameIcon: '⚡', level: 3, avatar: 'https://randomuser.me/api/portraits/women/14.jpg', isRealPhoto: true },
];

// Player positions for each period
const playerPositions: Record<LeaderboardPeriod, number> = {
  daily: 21,
  weekly: 8,
  monthly: 15,
};

// Singleton state for shared data
let currentPeriod: LeaderboardPeriod = 'daily';
let sharedWinners = createDailyWinners().sort((a, b) => b.amount - a.amount);
let sharedPlayerPosition = playerPositions.daily;
let sharedPlayerWager =
  sharedWinners[Math.min(sharedWinners.length - 1, sharedPlayerPosition - 1)]?.amount ?? 0;
let listeners: Set<() => void> = new Set();

const notifyListeners = () => {
  listeners.forEach((listener) => listener());
};

const syncPlayerWager = () => {
  sharedPlayerWager =
    sharedWinners[Math.min(sharedWinners.length - 1, sharedPlayerPosition - 1)]?.amount ?? 0;
};

const getWinnersForPeriod = (period: LeaderboardPeriod): Winner[] => {
  switch (period) {
    case 'weekly':
      return createWeeklyWinners();
    case 'monthly':
      return createMonthlyWinners();
    default:
      return createDailyWinners();
  }
};

export const setPeriodData = (period: LeaderboardPeriod) => {
  if (currentPeriod === period) return;
  
  currentPeriod = period;
  sharedWinners = getWinnersForPeriod(period).sort((a, b) => b.amount - a.amount);
  sharedPlayerPosition = playerPositions[period];
  syncPlayerWager();
  notifyListeners();
};

// Start the interval once, with proper references for cleanup
let intervalsStarted = false;
let amountIntervalId: ReturnType<typeof setInterval> | null = null;
let positionIntervalId: ReturnType<typeof setInterval> | null = null;

const startIntervals = () => {
  if (intervalsStarted) return;
  intervalsStarted = true;

  // Update amounts periodically
  amountIntervalId = setInterval(() => {
    sharedWinners = sharedWinners
      .map((w) => ({
        ...w,
        amount: w.amount + Math.random() * 150 - 30,
      }))
      .sort((a, b) => b.amount - a.amount);

    syncPlayerWager();
    notifyListeners();
  }, 5000);

  // Update player position periodically
  positionIntervalId = setInterval(() => {
    const change = Math.floor(Math.random() * 5) - 2;
    const newPosition = sharedPlayerPosition + change;
    const maxPos = Math.min(50, sharedWinners.length);
    sharedPlayerPosition = Math.max(7, Math.min(maxPos, newPosition));

    syncPlayerWager();
    notifyListeners();
  }, 7000);
};

const stopIntervals = () => {
  if (amountIntervalId) clearInterval(amountIntervalId);
  if (positionIntervalId) clearInterval(positionIntervalId);
  amountIntervalId = null;
  positionIntervalId = null;
  intervalsStarted = false;
};

export const useLeaderboardData = (period?: LeaderboardPeriod) => {
  const [winners, setWinners] = useState<Winner[]>(sharedWinners);
  const [playerPosition, setPlayerPosition] = useState(sharedPlayerPosition);
  const [playerWager, setPlayerWager] = useState(sharedPlayerWager);
  const [isApiLoaded, setIsApiLoaded] = useState(false);

  const changePeriod = useCallback((newPeriod: LeaderboardPeriod) => {
    setPeriodData(newPeriod);
  }, []);

  // Try to fetch from API on mount and period change
  useEffect(() => {
    const loadFromApi = async () => {
      const currentPeriodToFetch = period || currentPeriod;
      const apiData = await fetchLeaderboardFromApi(currentPeriodToFetch);
      if (apiData && apiData.length > 0) {
        sharedWinners = apiData.sort((a, b) => b.amount - a.amount);
        syncPlayerWager();
        setWinners([...sharedWinners]);
        setIsApiLoaded(true);
        notifyListeners();
      }
    };
    loadFromApi();
  }, [period]);

  useEffect(() => {
    // Only start simulation intervals if API data isn't loaded
    if (!isApiLoaded) {
      startIntervals();
    }

    const listener = () => {
      setWinners([...sharedWinners]);
      setPlayerPosition(sharedPlayerPosition);
      setPlayerWager(sharedPlayerWager);
    };

    listeners.add(listener);
    return () => {
      listeners.delete(listener);
      // Stop intervals when no components are listening
      if (listeners.size === 0) {
        stopIntervals();
      }
    };
  }, [isApiLoaded]);

  // Update when period prop changes
  useEffect(() => {
    if (period) {
      setPeriodData(period);
    }
  }, [period]);

  return { winners, playerPosition, playerWager, changePeriod };
};

export const formatAmount = (amount: number) => 
  amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
