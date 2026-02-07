import { useState } from 'react';
import { Search as SearchIcon, ChevronDown, Flame, Sparkles, Zap, Star, Play, Heart } from 'lucide-react';
import { useSidebar } from '@/hooks/useSidebar';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { MobilePageHeader } from '@/components/MobilePageHeader';
import { LoginModal } from '@/components/LoginModal';
import { RegisterModal } from '@/components/RegisterModal';
import { SpinGiftModal } from '@/components/SpinGiftModal';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';

// Game data with images from assets
import plinkoImg from '@/assets/games/plinko.png';
import ringOfFortuneImg from '@/assets/games/ring-of-fortune.png';
import ultimateDiceImg from '@/assets/games/ultimate-dice.png';
import luckyDiceImg from '@/assets/games/lucky-dice.jpg';
import limboImg from '@/assets/games/limbo.png';
import crashImg from '@/assets/games/crash.png';
import strikingHotImg from '@/assets/games/striking-hot-5.png';
import videoPokerImg from '@/assets/games/video-poker.png';
import baccaratImg from '@/assets/games/baccarat-a.png';
import liveRouletteImg from '@/assets/games/live-roulette.png';
import dragonPearlsImg from '@/assets/games/dragon-pearls.png';
import rhinoRobberyImg from '@/assets/games/rhino-robbery.png';
import timLarryImg from '@/assets/games/tim-larry.png';
import deadliestSeaImg from '@/assets/games/deadliest-sea.png';
import fortuneRabbitImg from '@/assets/games/fortune-rabbit.png';
import moneyPotImg from '@/assets/games/money-pot.png';
import bearSmashImg from '@/assets/games/bear-smash.png';

const games = [
  { id: 1, name: 'Plinko', image: plinkoImg, players: 230, category: 'originals' },
  { id: 2, name: 'Ring of Fortune', image: ringOfFortuneImg, players: 64, category: 'originals' },
  { id: 3, name: 'Ultimate Dice', image: ultimateDiceImg, players: 146, category: 'originals' },
  { id: 4, name: 'Lucky Dice', image: luckyDiceImg, players: 128, category: 'originals' },
  { id: 5, name: 'Limbo', image: limboImg, players: 402, category: 'originals' },
  { id: 6, name: 'Crash', image: crashImg, players: 2510, category: 'hot' },
  { id: 7, name: 'Striking Hot 5', image: strikingHotImg, players: 50, category: 'slots' },
  { id: 8, name: 'Video Poker', image: videoPokerImg, players: 89, category: 'slots' },
  { id: 9, name: 'Baccarat', image: baccaratImg, players: 156, category: 'live' },
  { id: 10, name: 'Live Roulette', image: liveRouletteImg, players: 320, category: 'live' },
  { id: 11, name: 'Dragon Pearls', image: dragonPearlsImg, players: 175, category: 'slots' },
  { id: 12, name: 'Rhino Robbery', image: rhinoRobberyImg, players: 32, category: 'hot' },
  { id: 13, name: 'Tim & Larry', image: timLarryImg, players: 28, category: 'slots' },
  { id: 14, name: 'Deadliest Sea', image: deadliestSeaImg, players: 45, category: 'hot' },
  { id: 15, name: 'Fortune Rabbit', image: fortuneRabbitImg, players: 19, category: 'slots' },
  { id: 16, name: 'Money Pot', image: moneyPotImg, players: 36, category: 'slots' },
  { id: 17, name: 'Bear Smash', image: bearSmashImg, players: 62, category: 'hot' },
  { id: 18, name: 'Plinko', image: plinkoImg, players: 212, category: 'originals' },
];

const categories = [
  { id: 'all', label: 'All Games', icon: Star },
  { id: 'originals', label: 'Originals', icon: Sparkles },
  { id: 'hot', label: 'Hot Games', icon: Flame },
  { id: 'slots', label: 'Slots', icon: Zap },
];

const searchTypes = [
  { id: 'casino', label: 'Casino' },
  { id: 'sports', label: 'Sports' },
  { id: 'live-casino', label: 'Live Casino' },
];

function GameCard({ game }: { game: typeof games[0] }) {
  const [isFavorite, setIsFavorite] = useState(false);
  
  return (
    <div className="game-card group relative">
      {/* Player Count Badge */}
      <div className="absolute top-1.5 md:top-2 left-1.5 md:left-2 z-10 flex items-center gap-1 bg-black/70 rounded-full px-1.5 md:px-2 py-0.5 md:py-1">
        <span className="w-1.5 md:w-2 h-1.5 md:h-2 bg-cyan-400 rounded-full animate-slow-blink"></span>
        <span className="text-[10px] md:text-xs font-medium">{game.players}</span>
      </div>

      {/* Favorite Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsFavorite(!isFavorite);
        }}
        className="absolute top-1.5 md:top-2 right-1.5 md:right-2 z-10 w-6 md:w-7 h-6 md:h-7 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
      >
        <Heart className={cn("w-3 md:w-4 h-3 md:h-4", isFavorite ? "fill-yellow-400 text-yellow-400" : "text-yellow-400")} />
      </button>

      <img src={game.image} alt={game.name} className="w-full aspect-[3/4] object-cover rounded-lg md:rounded-xl" />

      {/* Play Overlay */}
      <div className="game-overlay rounded-lg md:rounded-xl">
        <button className="w-10 md:w-14 h-10 md:h-14 rounded-full bg-primary flex items-center justify-center hover:scale-110 transition-transform">
          <Play className="w-5 md:w-7 h-5 md:h-7 text-black fill-current" />
        </button>
      </div>
    </div>
  );
}

const Search = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [signInOpen, setSignInOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);
  const [spinGiftOpen, setSpinGiftOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy] = useState('Popular');
  const [provider] = useState('All');
  const [searchType, setSearchType] = useState('casino');
  const [typeDrawerOpen, setTypeDrawerOpen] = useState(false);

  const filteredGames = games.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || game.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const selectedType = searchTypes.find(t => t.id === searchType);

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background">
      <Header 
        onOpenSignIn={() => setSignInOpen(true)}
        onOpenSignUp={() => setSignUpOpen(true)}
        onToggleSidebar={toggleSidebar}
      />
      
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={toggleSidebar}
        onOpenSpinGift={() => setSpinGiftOpen(true)}
      />
      
      <div className={`transition-all duration-300 pt-14 md:pt-16 pb-20 md:pb-0 ${sidebarOpen ? 'md:ml-56' : 'md:ml-16'}`}>
        <main className="p-2 md:p-4 lg:p-6 space-y-3 md:space-y-4 page-transition-enter max-w-full">
          {/* Mobile Page Header */}
          <div className="md:hidden">
            <MobilePageHeader title="Search" />
          </div>

          {/* Search Bar with Category Dropdown */}
          <div className="flex items-center gap-1.5 md:gap-2 bg-[#2a2a2a] rounded-xl p-1.5 md:p-2 h-12 md:h-14">
            <Drawer open={typeDrawerOpen} onOpenChange={setTypeDrawerOpen}>
              <DrawerTrigger asChild>
                <button className="flex items-center gap-1 md:gap-2 px-3 md:px-4 h-9 md:h-10 bg-[#1a1a1a] rounded-xl cursor-pointer flex-shrink-0 tap-feedback">
                  <span className="text-xs md:text-sm font-medium">{selectedType?.label}</span>
                  <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
                </button>
              </DrawerTrigger>
              <DrawerContent className="bg-[#1a1a1a] border-t border-border">
                <DrawerHeader className="pb-2">
                  <DrawerTitle className="text-center text-lg font-semibold">Select</DrawerTitle>
                </DrawerHeader>
                <div className="px-4 pb-8 space-y-1">
                  {searchTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => {
                        setSearchType(type.id);
                        setTypeDrawerOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-4 rounded-xl hover:bg-[#2a2a2a] transition-colors"
                    >
                      <span className="text-base font-medium">{type.label}</span>
                      <div className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                        searchType === type.id 
                          ? "border-cyan-400 bg-cyan-400" 
                          : "border-muted-foreground"
                      )}>
                        {searchType === type.id && (
                          <div className="w-2 h-2 rounded-full bg-black" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </DrawerContent>
            </Drawer>
            <div className="flex-1 flex items-center gap-1.5 md:gap-2 min-w-0">
              <SearchIcon className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                placeholder="Search games"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none min-w-0"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 md:gap-2 overflow-x-auto scrollbar-hide -mx-2 px-2">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 h-10 md:h-11 rounded-xl whitespace-nowrap transition-all tap-feedback ${
                    isActive 
                      ? 'bg-cyan-500 text-white' 
                      : 'bg-[#2a2a2a] text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs md:text-sm font-medium">{category.label}</span>
                </button>
              );
            })}
          </div>

          {/* Filters Row */}
          <div className="flex items-center gap-2 md:gap-3 overflow-x-auto scrollbar-hide -mx-2 px-2">
            <div className="flex items-center justify-between flex-1 max-w-[180px] md:max-w-[200px] px-3 md:px-4 h-11 md:h-12 bg-[#1a1a1a] border border-[#3a3a3a] rounded-xl cursor-pointer tap-feedback">
              <div className="flex items-center gap-1.5">
                <span className="text-xs md:text-sm text-muted-foreground">Sort By:</span>
                <span className="text-xs md:text-sm font-medium text-foreground">{sortBy}</span>
              </div>
              <div className="w-7 h-7 bg-[#333333] rounded-lg flex items-center justify-center ml-2">
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            <div className="flex items-center justify-between flex-1 max-w-[180px] md:max-w-[200px] px-3 md:px-4 h-11 md:h-12 bg-[#1a1a1a] border border-[#3a3a3a] rounded-xl cursor-pointer tap-feedback">
              <div className="flex items-center gap-1.5">
                <span className="text-xs md:text-sm text-muted-foreground">Providers:</span>
                <span className="text-xs md:text-sm font-medium text-foreground">{provider}</span>
              </div>
              <div className="w-7 h-7 bg-[#333333] rounded-lg flex items-center justify-center ml-2">
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Games Grid - Matching site design */}
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 md:gap-3">
            {filteredGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>

          {filteredGames.length === 0 && (
            <div className="text-center py-8 md:py-12">
              <SearchIcon className="w-10 h-10 md:w-12 md:h-12 text-muted-foreground mx-auto mb-3 md:mb-4" />
              <p className="text-sm md:text-base text-muted-foreground">No games found</p>
            </div>
          )}

          <div className="hidden md:block">
            <Footer />
          </div>
        </main>
      </div>
      
      <MobileBottomNav onMenuClick={toggleSidebar} />

      <LoginModal
        isOpen={signInOpen}
        onClose={() => setSignInOpen(false)}
        onSwitchToRegister={() => { setSignInOpen(false); setSignUpOpen(true); }}
      />
      <RegisterModal
        isOpen={signUpOpen}
        onClose={() => setSignUpOpen(false)}
        onSwitchToLogin={() => { setSignUpOpen(false); setSignInOpen(true); }}
      />
      
      <SpinGiftModal isOpen={spinGiftOpen} onClose={() => setSpinGiftOpen(false)} />
    </div>
  );
};

export default Search;
