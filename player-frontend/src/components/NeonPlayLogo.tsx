import { cn } from '@/lib/utils';
import phibetLogoIcon from '@/assets/phibet-logo-icon.svg';

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
      <div className={cn('flex-shrink-0 overflow-hidden flex items-center justify-center', icon)}>
        <img
          src={phibetLogoIcon}
          alt="PhiBet.io"
          className="w-full h-full object-contain"
        />
      </div>
      {showText && (
        <span className={cn(
          'font-bold text-amber-500 dark:text-amber-400',
          text
        )}>
          PhiBet.io
        </span>
      )}
    </div>
  );
}

// Icon-only version for compact spaces
export function NeonPlayIcon({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <img
        src={phibetLogoIcon}
        alt="PhiBet.io"
        className="w-full h-full object-contain"
      />
    </div>
  );
}
