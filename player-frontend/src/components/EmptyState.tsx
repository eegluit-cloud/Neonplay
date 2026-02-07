import { type ReactNode } from 'react';
import { SearchX, Heart, History, Inbox, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon = Inbox, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
      <div className="w-14 h-14 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// Pre-built variants for common iGaming empty states
export function EmptyFavorites() {
  return (
    <EmptyState
      icon={Heart}
      title="No favorites yet"
      description="Tap the heart on any game to save it here for quick access."
    />
  );
}

export function EmptyBetHistory() {
  return (
    <EmptyState
      icon={History}
      title="No bets placed yet"
      description="Place your first bet on casino games or sports events to see your history here."
    />
  );
}

export function EmptySearchResults() {
  return (
    <EmptyState
      icon={SearchX}
      title="No results found"
      description="Try adjusting your search or filters to find what you're looking for."
    />
  );
}
