import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSidebar } from '@/hooks/useSidebar';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { AuthModals } from '@/components/AuthModals';
import { SpinGiftModal } from '@/components/SpinGiftModal';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import Leaderboard from '@/components/Leaderboard';
import { ChevronLeft, ChevronRight, Info, Share2, Heart, X, Copy, Check, Maximize } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import slotGameDisplay from '@/assets/games/commander-of-tridents.png';
import { NeonPlayLogo } from '@/components/NeonPlayLogo';

// Import game images
import thorHammerTime from '@/assets/games/thor-hammer-time.png';
import theRace from '@/assets/games/the-race.png';
import strikingHot5 from '@/assets/games/striking-hot-5.png';
import immortalFruits from '@/assets/games/immortal-fruits.png';
import aztecTwist from '@/assets/games/aztec-twist.png';
import ancientsBlessing from '@/assets/games/ancients-blessing.png';
import playWithTheDevil from '@/assets/games/play-with-the-devil.png';
import poisonEve from '@/assets/games/poison-eve.png';
import bigBassSplash from '@/assets/games/big-bass-splash.png';
import gonzosQuest from '@/assets/games/gonzos-quest.png';
import candyBonanza from '@/assets/games/candy-bonanza.png';
import fortuneRabbit from '@/assets/games/fortune-rabbit.png';

const recommendedGames = [
  { id: 'thor-hammer', name: 'Thor Hammer Time', provider: 'NOLIMIT CITY', image: thorHammerTime, players: 32, rtp: 96.5 },
  { id: 'the-race', name: 'The Race', provider: 'BIG TIME GAMING', image: theRace, players: 32, rtp: 95.8 },
  { id: 'striking-hot', name: 'Striking Hot 5', provider: 'PRAGMATIC PLAY', image: strikingHot5, players: 32, rtp: 96.7 },
  { id: 'immortal-fruits', name: 'Immortal Fruits', provider: 'NOLIMIT CITY', image: immortalFruits, players: 32, rtp: 94.2 },
  { id: 'aztec-twist', name: 'Aztec Twist', provider: 'HACKSAW', image: aztecTwist, players: 32, rtp: 96.3 },
  { id: 'ancients-blessing', name: 'Ancients Blessing', provider: 'RED TIGER', image: ancientsBlessing, players: 32, rtp: 95.7 },
  { id: 'play-devil', name: 'Play With The Devil', provider: 'RED TIGER', image: playWithTheDevil, players: 32, rtp: 97.1 },
  { id: 'poison-eve', name: 'Poison Eve', provider: 'NOLIMIT CITY', image: poisonEve, players: 32, rtp: 96.0 },
  { id: 'big-bass', name: 'Big Bass Splash', provider: 'PRAGMATIC PLAY', image: bigBassSplash, players: 32, rtp: 95.5 },
  { id: 'gonzos-quest', name: "Gonzo's Quest", provider: 'NETENT', image: gonzosQuest, players: 32, rtp: 96.0 },
  { id: 'candy-bonanza', name: 'Candy Bonanza', provider: 'PRAGMATIC PLAY', image: candyBonanza, players: 32, rtp: 96.4 },
  { id: 'fortune-rabbit', name: 'Fortune Rabbit', provider: 'PG SOFT', image: fortuneRabbit, players: 32, rtp: 96.8 },
];

const GameDetail = () => {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [signInOpen, setSignInOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);
  const [spinGiftOpen, setSpinGiftOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const gameUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(gameUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = [
    { name: 'Facebook', icon: 'f', color: 'bg-blue-600', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(gameUrl)}` },
    { name: 'X', icon: '𝕏', color: 'bg-black', url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(gameUrl)}` },
    { name: 'Telegram', icon: '➤', color: 'bg-sky-500', url: `https://t.me/share/url?url=${encodeURIComponent(gameUrl)}` },
    { name: 'WhatsApp', icon: '📱', color: 'bg-green-500', url: `https://wa.me/?text=${encodeURIComponent(gameUrl)}` },
    { name: 'LinkedIn', icon: 'in', color: 'bg-blue-700', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(gameUrl)}` },
  ];

  // Find current game or use default
  const currentGame = recommendedGames.find(g => g.id === gameId) || {
    name: 'Baccarat Lobby',
    provider: 'Pragmatic Play',
    image: thorHammerTime,
    rtp: 96.5
  };

  return (
    <div className="min-h-screen bg-background">
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
        <main className="p-2 md:p-3 lg:p-4 space-y-2 md:space-y-3 overflow-x-hidden max-w-full">
          
          {/* Back Button */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <span className="font-semibold text-foreground">Back To Games</span>
          </div>

          {/* Game Container */}
          <div className="relative rounded-2xl overflow-hidden bg-black">
            {/* Game Iframe/Image Area */}
            <div className="w-full aspect-video bg-black flex items-center justify-center">
              <img 
                src={slotGameDisplay} 
                alt={currentGame.name}
                className="w-full h-full object-contain"
              />
            </div>
            
            {/* Bottom Bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#1a1a1a] border-t border-border/30">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setInfoModalOpen(true)}
                  className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Info className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`w-8 h-8 flex items-center justify-center transition-colors ${isFavorite ? 'text-red-500' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500' : ''}`} />
                </button>
                <button 
                  onClick={() => setShareModalOpen(true)}
                  className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex items-center gap-2 opacity-40">
                <NeonPlayLogo size="md" />
              </div>
              
              <button className="w-8 h-8 rounded-lg bg-[#2a2a2a] hover:bg-[#3a3a3a] flex items-center justify-center transition-colors">
                <Maximize className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Game Info */}
          <div className="bg-[#1a1a1a] rounded-xl px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-base font-bold text-foreground">{currentGame.name}</h1>
                <p className="text-sm text-muted-foreground">
                  By <span className="text-cyan-400">{currentGame.provider}</span>
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">RTP</span>
                <span className="text-sm font-bold text-cyan-400">{currentGame.rtp}%</span>
              </div>
            </div>
          </div>

          {/* Recommended Games */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">Recommended Games</h2>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  All
                </button>
                <button className="w-7 h-7 flex items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="w-7 h-7 flex items-center justify-center rounded-full border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {recommendedGames.map((game) => (
                <button
                  key={game.id}
                  onClick={() => navigate(`/game/${game.id}`)}
                  className="flex-shrink-0 group relative"
                >
                  <div className="relative w-28 sm:w-32 aspect-[3/4] rounded-xl overflow-hidden">
                    <img 
                      src={game.image} 
                      alt={game.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Players Badge */}
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2 py-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span className="text-[10px] text-white font-medium">{game.players}</span>
                    </div>
                    
                    {/* Favorite Button */}
                    <button 
                      className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Heart className="w-3.5 h-3.5 text-white" />
                    </button>
                    
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Leaderboard */}
          <Leaderboard />

          <Footer />
        </main>
      </div>

      <AuthModals 
        isSignInOpen={signInOpen}
        isSignUpOpen={signUpOpen}
        onCloseSignIn={() => setSignInOpen(false)}
        onCloseSignUp={() => setSignUpOpen(false)}
        onSwitchToSignUp={() => { setSignInOpen(false); setSignUpOpen(true); }}
        onSwitchToSignIn={() => { setSignUpOpen(false); setSignInOpen(true); }}
      />
      
      <SpinGiftModal isOpen={spinGiftOpen} onClose={() => setSpinGiftOpen(false)} />
      
      {/* Game Info Modal */}
      <Dialog open={infoModalOpen} onOpenChange={setInfoModalOpen}>
        <DialogContent className="bg-card border-border max-w-md max-h-[90vh] overflow-y-auto scrollbar-hide [&>button]:hidden">
          <DialogHeader className="flex-row items-center gap-3">
            <button 
              onClick={() => setInfoModalOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <DialogTitle className="text-xl font-bold">Game Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-4">
              <img 
                src={currentGame.image || slotGameDisplay} 
                alt={currentGame.name}
                className="w-20 h-20 rounded-xl object-cover"
              />
              <div>
                <h3 className="font-bold text-base">{currentGame.name}</h3>
                <p className="text-sm text-muted-foreground">By <span className="text-emerald-400">{currentGame.provider}</span></p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-background/50 rounded-xl p-3">
                <p className="text-xs text-muted-foreground mb-1">RTP</p>
                <p className="font-bold text-emerald-400">{currentGame.rtp}%</p>
              </div>
              <div className="bg-background/50 rounded-xl p-3">
                <p className="text-xs text-muted-foreground mb-1">Volatility</p>
                <p className="font-bold text-amber-400">Medium-High</p>
              </div>
              <div className="bg-background/50 rounded-xl p-3">
                <p className="text-xs text-muted-foreground mb-1">Min Bet</p>
                <p className="font-bold">$0.10</p>
              </div>
              <div className="bg-background/50 rounded-xl p-3">
                <p className="text-xs text-muted-foreground mb-1">Max Bet</p>
                <p className="font-bold">$100.00</p>
              </div>
              <div className="bg-background/50 rounded-xl p-3 col-span-2">
                <p className="text-xs text-muted-foreground mb-1">Max Win</p>
                <p className="font-bold text-emerald-400">10,000x</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Modal */}
      <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
        <DialogContent className="bg-card border-border max-w-md max-h-[90vh] overflow-y-auto scrollbar-hide [&>button]:hidden">
          <DialogHeader className="flex-row items-center gap-3">
            <button 
              onClick={() => setShareModalOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <DialogTitle className="text-xl font-bold">Share This Game</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-5 py-2">
            <div>
              <p className="text-sm text-muted-foreground mb-3">Share via social media</p>
              <div className="flex flex-wrap gap-4">
                {shareLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1.5"
                  >
                    <div className={`w-14 h-14 rounded-full ${social.color} flex items-center justify-center text-white text-xl font-bold`}>
                      {social.icon}
                    </div>
                    <span className="text-xs text-muted-foreground">{social.name}</span>
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-3">Share via web link</p>
              <div className="flex items-center gap-2 bg-background/50 rounded-xl p-3">
                <input 
                  type="text" 
                  value={gameUrl}
                  readOnly
                  className="flex-1 bg-transparent text-sm text-cyan-400 outline-none truncate"
                />
                <button 
                  onClick={handleCopyLink}
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 text-white text-sm font-medium hover:bg-cyan-600 transition-colors flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <MobileBottomNav onMenuClick={toggleSidebar} />
    </div>
  );
};

export default GameDetail;
