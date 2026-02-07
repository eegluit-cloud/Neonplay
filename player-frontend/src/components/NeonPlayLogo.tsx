import { cn } from '@/lib/utils';
import phibetLogo from '@/assets/phibet-logo.png';

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
      <div className={cn('flex-shrink-0 rounded-xl overflow-hidden flex items-center justify-center', icon)}>
        <img
          src={phibetLogo}
          alt="Phibet"
          className="w-full h-full object-cover"
        />
      </div>
      {showText && (
        <span className={cn(
          'font-bold bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent',
          text
        )}>
          Phibet
        </span>
      )}
    </div>
  );
}

// Icon-only version for compact spaces
export function NeonPlayIcon({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl overflow-hidden flex items-center justify-center', className)}>
      <img
        src={phibetLogo}
        alt="Phibet"
        className="w-full h-full object-cover"
      />
    </div>
  );
}
