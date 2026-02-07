import { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface SectionHeaderRowProps {
  title: ReactNode;
  linkTo?: string;
  linkText?: string;
  onScrollLeft?: () => void;
  onScrollRight?: () => void;
  showNavigation?: boolean;
  showAllButton?: boolean;
  className?: string;
}

export function SectionHeaderRow({
  title,
  linkTo,
  linkText = 'All',
  onScrollLeft,
  onScrollRight,
  showNavigation = true,
  showAllButton = true,
  className,
}: SectionHeaderRowProps) {
  return (
    <div className={cn(
      // Mobile: ultra-compact spacing (mt-1 h-6, mb-1.5)
      // Desktop: normal spacing (sm:mt-6 sm:h-8, md:mb-4)
      "mt-1 sm:mt-2 md:mt-4 h-6 sm:h-7 md:h-8 flex items-center justify-between mb-1.5 sm:mb-2 md:mb-4 min-h-0",
      className
    )}>
      {/* Title - mobile text-sm, desktop text-base (16px) */}
      <h2 className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-1 sm:gap-1.5 md:gap-2 min-w-0">
        {title}
      </h2>
      
      {showNavigation && (
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* All button - compact size matching arrows */}
          {showAllButton && (
            linkTo ? (
              <Link 
                to={linkTo} 
                className="h-7 px-2.5 rounded-lg bg-card border border-border text-xs hover:bg-card-hover transition-colors tap-feedback flex items-center"
              >
                {linkText}
              </Link>
            ) : (
              <button className="h-7 px-2.5 rounded-lg bg-card border border-border text-xs hover:bg-card-hover transition-colors tap-feedback flex items-center">
                {linkText}
              </button>
            )
          )}
          
          {/* Navigation arrows - consistent styling */}
          {onScrollLeft && (
            <button
              onClick={onScrollLeft}
              className="w-7 h-7 rounded-lg border border-border flex items-center justify-center hover:bg-amber-500/10 hover:border-amber-500/50 active:scale-95 transition-all tap-feedback"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
          {onScrollRight && (
            <button
              onClick={onScrollRight}
              className="w-7 h-7 rounded-lg border border-border flex items-center justify-center hover:bg-amber-500/10 hover:border-amber-500/50 active:scale-95 transition-all tap-feedback"
            >
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
