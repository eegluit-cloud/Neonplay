import { useRef } from 'react';
import { Home, Gamepad2, Volleyball } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
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
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    gsap.from(containerRef.current, {
      opacity: 0,
      y: 8,
      duration: 0.3,
      delay: 0.4,
      ease: 'power2.out',
    });

    const buttons = containerRef.current.querySelectorAll('button');
    gsap.from(buttons, {
      opacity: 0,
      scale: 0.95,
      duration: 0.25,
      stagger: 0.08,
      delay: 0.5,
      ease: 'power2.out',
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="flex items-center gap-1.5 sm:gap-2">
      {modes.map((mode) => {
        const isActive = activeMode === mode.id;
        return (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={cn(
              "flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all",
              isActive
                ? "bg-amber-500 text-white shadow-lg shadow-cyan-500/25"
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
