import { Home, Gamepad2, Volleyball } from 'lucide-react';
import { cn } from '@/lib/utils';

export type LobbyMode = 'all' | 'casino' | 'sports';

interface LobbyModeSwitcherProps {
  activeMode: LobbyMode;
  onModeChange: (mode: LobbyMode) => void;
}

const modes = [
  { id: 'all' as const, label: 'All', icon: Home },
  { id: 'casino' as const, label: 'Casino', icon: Gamepad2 },
  { id: 'sports' as const, label: 'Sports', icon: Volleyball },
];

export function LobbyModeSwitcher({ activeMode, onModeChange }: LobbyModeSwitcherProps) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {modes.map((mode) => {
        const isActive = activeMode === mode.id;
        return (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={cn(
              "flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all",
              isActive
                ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/25"
                : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            <mode.icon className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", isActive ? "text-white" : "text-muted-foreground")} />
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}
