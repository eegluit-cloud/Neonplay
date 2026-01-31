import { cn } from '@/lib/utils';

interface NeonPlayLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export function NeonPlayLogo({ className, size = 'md', showText = true }: NeonPlayLogoProps) {
  const sizes = {
    sm: { icon: 'w-8 h-8', text: 'text-lg', gap: 'gap-1.5' },
    md: { icon: 'w-10 h-10', text: 'text-xl', gap: 'gap-2' },
    lg: { icon: 'w-12 h-12', text: 'text-2xl', gap: 'gap-2.5' },
    xl: { icon: 'w-16 h-16', text: 'text-3xl', gap: 'gap-3' },
  };

  const { icon, text, gap } = sizes[size];

  return (
    <div className={cn('flex items-center', gap, className)}>
      {/* N with Crown Icon */}
      <div className={cn('relative flex-shrink-0', icon)}>
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Crown on top - golden */}
          <path
            d="M14 14L18 8L24 12L30 8L34 14L32 16H16L14 14Z"
            fill="#f59e0b"
            stroke="#fcd34d"
            strokeWidth="0.5"
          />
          {/* Crown jewels */}
          <circle cx="18" cy="11" r="1.5" fill="#fef3c7" />
          <circle cx="24" cy="9" r="1.5" fill="#fef3c7" />
          <circle cx="30" cy="11" r="1.5" fill="#fef3c7" />

          {/* Letter N - cyan/blue gradient approximation */}
          <path
            d="M14 42V18H20L28 34V18H34V42H28L20 26V42H14Z"
            fill="#22d3ee"
            stroke="#22d3ee"
            strokeWidth="0.5"
          />
        </svg>
      </div>

      {/* Text */}
      {showText && (
        <span className={cn(
          'font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent',
          text
        )}>
          NeonPlay
        </span>
      )}
    </div>
  );
}

// Icon-only version for compact spaces
export function NeonPlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn('w-full h-full', className)}>
      {/* Crown */}
      <path
        d="M14 14L18 8L24 12L30 8L34 14L32 16H16L14 14Z"
        fill="#f59e0b"
        stroke="#fcd34d"
        strokeWidth="0.5"
      />
      <circle cx="18" cy="11" r="1.5" fill="#fef3c7" />
      <circle cx="24" cy="9" r="1.5" fill="#fef3c7" />
      <circle cx="30" cy="11" r="1.5" fill="#fef3c7" />

      {/* N */}
      <path
        d="M14 42V18H20L28 34V18H34V42H28L20 26V42H14Z"
        fill="#22d3ee"
        stroke="#22d3ee"
        strokeWidth="0.5"
      />
    </svg>
  );
}
