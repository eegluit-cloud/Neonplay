import { memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Play, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Game } from '@/hooks/useGames';

// Fallback image
import placeholderImg from '@/assets/games/thor-hammer-time.png';

interface ApiGameCardProps {
  game: Game;
  isFavorite?: boolean;
  onToggleFavorite?: (gameId: string) => void;
  showProvider?: boolean;
  priority?: boolean;
}

export const ApiGameCard = memo(function ApiGameCard({
  game,
  isFavorite,
  onToggleFavorite,
  showProvider = true,
  priority = false,
}: ApiGameCardProps) {
  const navigate = useNavigate();

  const handleClick = useCallback(() => {
    navigate(`/game/${game.slug}`);
  }, [navigate, game.slug]);

  const handleFavoriteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleFavorite?.(game.id);
    },
    [game.id, onToggleFavorite]
  );

  return (
    <div
      className="game-card group relative rounded-lg md:rounded-xl overflow-hidden cursor-pointer"
      onClick={handleClick}
    >
      {/* Player Count Badge */}
      <div className="absolute top-1.5 md:top-2 left-1.5 md:left-2 z-10 flex items-center gap-1 bg-black/70 rounded-full px-1.5 md:px-2 py-0.5 md:py-1">
        <span className="w-1.5 md:w-2 h-1.5 md:h-2 bg-amber-400 rounded-full animate-slow-blink" />
        <span className="text-[10px] md:text-xs font-medium text-white">
          {game.playCount || Math.floor(Math.random() * 100) + 10}
        </span>
      </div>

      {/* Favorite Heart */}
      {onToggleFavorite && (
        <button
          className="absolute top-1.5 md:top-2 right-1.5 md:right-2 z-10 w-6 md:w-7 h-6 md:h-7 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
          onClick={handleFavoriteClick}
        >
          <Heart
            className={cn(
              'w-3 md:w-4 h-3 md:h-4',
              isFavorite ? 'text-red-500 fill-red-500' : 'text-yellow-400'
            )}
          />
        </button>
      )}

      {/* Tags */}
      {(game.isNew || game.isHot) && (
        <div className="absolute top-8 md:top-10 left-1.5 md:left-2 z-10 flex flex-col gap-1">
          {game.isNew && (
            <span className="bg-green-500 text-white text-[8px] md:text-[10px] px-1.5 py-0.5 rounded font-bold">
              NEW
            </span>
          )}
          {game.isHot && (
            <span className="bg-orange-500 text-white text-[8px] md:text-[10px] px-1.5 py-0.5 rounded font-bold">
              HOT
            </span>
          )}
        </div>
      )}

      {/* Game Image */}
      <img
        src={game.thumbnailUrl || placeholderImg}
        alt={game.name}
        loading={priority ? 'eager' : 'lazy'}
        className="w-full aspect-[3/4] object-cover transition-transform group-hover:scale-105"
        onError={(e) => {
          (e.target as HTMLImageElement).src = placeholderImg;
        }}
      />

      {/* Play Overlay */}
      <div className="game-overlay rounded-lg md:rounded-xl">
        <button className="w-10 md:w-14 h-10 md:h-14 rounded-full bg-primary flex items-center justify-center hover:scale-110 transition-transform">
          <Play className="w-5 md:w-7 h-5 md:h-7 text-black fill-current" />
        </button>
      </div>

      {/* Game Name Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
        <p className="text-xs text-white font-medium truncate">{game.name}</p>
        {showProvider && game.provider && (
          <p className="text-[10px] text-gray-300 truncate">{game.provider.name}</p>
        )}
      </div>
    </div>
  );
});

interface ApiGameGridProps {
  games: Game[];
  isLoading?: boolean;
  favoriteIds?: Set<string>;
  onToggleFavorite?: (gameId: string) => void;
  emptyMessage?: string;
  columns?: number;
}

export const ApiGameGrid = memo(function ApiGameGrid({
  games,
  isLoading,
  favoriteIds,
  onToggleFavorite,
  emptyMessage = 'No games found',
}: ApiGameGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">{emptyMessage}</div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 md:gap-3">
      {games.map((game, index) => (
        <ApiGameCard
          key={game.id}
          game={game}
          isFavorite={favoriteIds?.has(game.id)}
          onToggleFavorite={onToggleFavorite}
          priority={index < 8}
        />
      ))}
    </div>
  );
});

export default ApiGameCard;
