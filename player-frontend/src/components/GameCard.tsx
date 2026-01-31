import { memo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GameCardImage } from '@/components/ui/optimized-image';

export interface Game {
  id: number;
  name: string;
  provider: string;
  image: string;
  players: number;
  category?: string[];
  tags?: string[];
}

interface GameCardProps {
  game: Game;
  /** Whether this is an above-the-fold card that should load eagerly */
  priority?: boolean;
  /** Custom size class for the card */
  sizeClass?: string;
}

/**
 * Memoized Game Card component for optimal re-render performance
 */
export const GameCard = memo(function GameCard({ 
  game, 
  priority = false,
  sizeClass 
}: GameCardProps) {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);

  const handlePlayClick = useCallback(() => {
    navigate(`/game/${game.id}`);
  }, [navigate, game.id]);

  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(prev => !prev);
  }, []);

  return (
    <div 
      className={cn("game-card group relative cursor-pointer", sizeClass)} 
      onClick={handlePlayClick}
    >
      {/* Player Count Badge */}
      <div className="absolute top-1.5 md:top-2 left-1.5 md:left-2 z-10 flex items-center gap-1 bg-black/70 rounded-full px-1.5 md:px-2 py-0.5 md:py-1">
        <span className="w-1.5 md:w-2 h-1.5 md:h-2 bg-cyan-400 rounded-full animate-slow-blink" />
        <span className="text-[10px] md:text-xs font-medium">{game.players}</span>
      </div>

      {/* Favorite Button */}
      <button
        onClick={handleFavoriteClick}
        className="absolute top-1.5 md:top-2 right-1.5 md:right-2 z-10 w-6 md:w-7 h-6 md:h-7 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart
          className={cn(
            "w-3 md:w-4 h-3 md:h-4",
            isFavorite ? "fill-yellow-400 text-yellow-400" : "text-yellow-400"
          )}
        />
      </button>

      {/* Optimized Game Image with lazy loading */}
      <GameCardImage
        src={game.image}
        alt={game.name}
        priority={priority}
        className="rounded-lg md:rounded-xl"
      />

      {/* Play Overlay */}
      <div className="game-overlay rounded-lg md:rounded-xl">
        <button 
          className="w-10 md:w-14 h-10 md:h-14 rounded-full bg-primary flex items-center justify-center hover:scale-110 transition-transform"
          aria-label={`Play ${game.name}`}
        >
          <Play className="w-5 md:w-7 h-5 md:h-7 text-black fill-current" />
        </button>
      </div>
    </div>
  );
});

/**
 * Memoized mini game card for carousels
 */
export const MiniGameCard = memo(function MiniGameCard({
  game,
  priority = false,
}: {
  game: Game;
  priority?: boolean;
}) {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);

  const handleClick = useCallback(() => {
    navigate(`/game/${game.id}`);
  }, [navigate, game.id]);

  return (
    <div 
      className="game-card group relative cursor-pointer" 
      onClick={handleClick}
    >
      {/* Player Count Badge */}
      <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-black/70 rounded-full px-2 py-1">
        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-slow-blink" />
        <span className="text-xs font-medium">{game.players}</span>
      </div>

      {/* Favorite Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsFavorite(!isFavorite);
        }}
        className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
      >
        <Heart className={cn("w-4 h-4", isFavorite ? "fill-red-500 text-red-500" : "text-white")} />
      </button>

      <GameCardImage
        src={game.image}
        alt={game.name}
        priority={priority}
        className="rounded-xl"
      />

      {/* Play Overlay */}
      <div className="game-overlay rounded-xl">
        <button className="w-14 h-14 rounded-full bg-primary flex items-center justify-center hover:scale-110 transition-transform">
          <Play className="w-7 h-7 text-black fill-current" />
        </button>
      </div>
    </div>
  );
});

export default GameCard;
