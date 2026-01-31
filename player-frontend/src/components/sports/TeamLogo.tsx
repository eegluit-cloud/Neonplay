import { useState, memo } from 'react';
import { cn } from '@/lib/utils';
import { getTeamLogoUrl, generateFallbackLogo } from '@/data/teamLogos';

interface TeamLogoProps {
  teamName: string;
  logoUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  xs: 'w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5',      // Betslip: 14-20px
  sm: 'w-[18px] h-[18px] sm:w-5 sm:h-5 md:w-6 md:h-6', // Event cards: 18-24px  
  md: 'w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7',           // Standard: 20-28px
  lg: 'w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10',         // Highlight cards: 28-40px
};

/**
 * TeamLogo - Optimized team logo component
 * 
 * Features:
 * - Lazy loading for performance
 * - Fallback to initials if logo fails
 * - Consistent sizing across devices
 * - object-contain to prevent cropping
 */
export const TeamLogo = memo(function TeamLogo({
  teamName,
  logoUrl,
  size = 'sm',
  className,
}: TeamLogoProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Get logo URL from provided or lookup by team name
  const resolvedLogoUrl = logoUrl || getTeamLogoUrl(teamName);
  const fallbackUrl = generateFallbackLogo(teamName);
  
  const handleError = () => {
    setHasError(true);
  };
  
  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div 
      className={cn(
        'relative flex items-center justify-center rounded-full overflow-hidden bg-white/10 flex-shrink-0',
        sizeClasses[size],
        className
      )}
    >
      {/* Loading placeholder */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-white/5 animate-pulse rounded-full" />
      )}
      
      {/* Team logo image */}
      <img
        src={hasError ? fallbackUrl : resolvedLogoUrl}
        alt={`${teamName} logo`}
        loading="lazy"
        decoding="async"
        onError={handleError}
        onLoad={handleLoad}
        className={cn(
          'w-full h-full object-contain p-0.5 transition-opacity duration-200',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
      />
    </div>
  );
});

export default TeamLogo;
