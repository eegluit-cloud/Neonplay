import { LucideProps } from 'lucide-react';
import { 
  Zap, 
  ClipboardList, 
  BarChart3, 
  Crown,
  Trophy,
  Target,
  Gamepad2,
  Crosshair
} from 'lucide-react';
import { forwardRef } from 'react';

// ============================================
// CUSTOM SPORT SVG ICONS
// ============================================

// Soccer/Football Icon
export const SoccerIcon = forwardRef<SVGSVGElement, LucideProps>(
  ({ size = 24, color = 'currentColor', strokeWidth = 2, className, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m12 2 3 7h-6l3-7" />
      <path d="m12 22-3-7h6l-3 7" />
      <path d="M2 12h4l2-3" />
      <path d="M22 12h-4l-2-3" />
      <path d="M6 12 8 9h8l2 3" />
      <path d="m8 15 4 2 4-2" />
    </svg>
  )
);
SoccerIcon.displayName = 'SoccerIcon';

// Basketball Icon
export const BasketballIcon = forwardRef<SVGSVGElement, LucideProps>(
  ({ size = 24, color = 'currentColor', strokeWidth = 2, className, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2v20" />
      <path d="M2 12h20" />
      <path d="M4.93 4.93c4.08 2.38 6.07 6.07 6.07 10.07" />
      <path d="M19.07 4.93c-4.08 2.38-6.07 6.07-6.07 10.07" />
    </svg>
  )
);
BasketballIcon.displayName = 'BasketballIcon';

// Tennis Icon
export const TennisIcon = forwardRef<SVGSVGElement, LucideProps>(
  ({ size = 24, color = 'currentColor', strokeWidth = 2, className, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M18.5 5.5c-4.5 0-6.5 4-6.5 6.5s2 6.5 6.5 6.5" />
      <path d="M5.5 18.5c4.5 0 6.5-4 6.5-6.5s-2-6.5-6.5-6.5" />
    </svg>
  )
);
TennisIcon.displayName = 'TennisIcon';

// Ice Hockey Icon
export const HockeyIcon = forwardRef<SVGSVGElement, LucideProps>(
  ({ size = 24, color = 'currentColor', strokeWidth = 2, className, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M3 21h4l7-14" />
      <path d="M21 21h-4l-7-14" />
      <circle cx="12" cy="5" r="2" />
      <path d="M6 21h12" />
    </svg>
  )
);
HockeyIcon.displayName = 'HockeyIcon';

// Table Tennis / Ping Pong Icon
export const TableTennisIcon = forwardRef<SVGSVGElement, LucideProps>(
  ({ size = 24, color = 'currentColor', strokeWidth = 2, className, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="16" cy="6" r="4" />
      <path d="M12.5 9.5 4 18l2 2 8.5-8.5" />
      <path d="M4 18v2h2" />
    </svg>
  )
);
TableTennisIcon.displayName = 'TableTennisIcon';

// American Football Icon
export const AmericanFootballIcon = forwardRef<SVGSVGElement, LucideProps>(
  ({ size = 24, color = 'currentColor', strokeWidth = 2, className, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <ellipse cx="12" cy="12" rx="9" ry="5" transform="rotate(45 12 12)" />
      <path d="m9 9 6 6" />
      <path d="M9 12h6" />
      <path d="M12 9v6" />
    </svg>
  )
);
AmericanFootballIcon.displayName = 'AmericanFootballIcon';

// Handball Icon
export const HandballIcon = forwardRef<SVGSVGElement, LucideProps>(
  ({ size = 24, color = 'currentColor', strokeWidth = 2, className, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="7" cy="5" r="2" />
      <path d="M9 7.5 12 12l4-2" />
      <path d="M12 12v6l-2 4" />
      <path d="M12 18l3 3" />
      <path d="M7 7l-2 5" />
      <circle cx="18" cy="14" r="3" />
    </svg>
  )
);
HandballIcon.displayName = 'HandballIcon';

// Darts Icon
export const DartsIcon = forwardRef<SVGSVGElement, LucideProps>(
  ({ size = 24, color = 'currentColor', strokeWidth = 2, className, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
      <path d="M22 2 12 12" />
      <path d="M18 2h4v4" />
    </svg>
  )
);
DartsIcon.displayName = 'DartsIcon';

// Esports/Gaming Controller Icon (using Gamepad2 from lucide)
export const EsportsIcon = Gamepad2;

// Counter-Strike Icon (crosshair style)
export const CounterStrikeIcon = Crosshair;

// Dota 2 Icon (using Target for now, could be more specific)
export const DotaIcon = forwardRef<SVGSVGElement, LucideProps>(
  ({ size = 24, color = 'currentColor', strokeWidth = 2, className, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M12 2v4" />
      <path d="M12 18v4" />
      <path d="M2 12h4" />
      <path d="M18 12h4" />
      <path d="M12 12 6 6" />
      <path d="m12 12 6 6" />
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
);
DotaIcon.displayName = 'DotaIcon';

// ============================================
// SPORT ICON MAPPING (Single Source of Truth)
// ============================================

export type SportIconKey = 
  | 'soccer' 
  | 'basketball' 
  | 'tennis' 
  | 'hockey' 
  | 'tabletennis' 
  | 'americanfootball' 
  | 'handball' 
  | 'darts' 
  | 'csgo' 
  | 'dota'
  | 'esports';

export const SPORT_ICONS: Record<SportIconKey, React.ForwardRefExoticComponent<LucideProps & React.RefAttributes<SVGSVGElement>>> = {
  soccer: SoccerIcon,
  basketball: BasketballIcon,
  tennis: TennisIcon,
  hockey: HockeyIcon,
  tabletennis: TableTennisIcon,
  americanfootball: AmericanFootballIcon,
  handball: HandballIcon,
  darts: DartsIcon,
  csgo: CounterStrikeIcon,
  dota: DotaIcon,
  esports: EsportsIcon,
};

// ============================================
// UI ICONS (for tabs, headers)
// ============================================

export const UI_ICONS = {
  highlights: Zap,
  eventBuilder: ClipboardList,
  betsFeed: BarChart3,
  popular: Crown,
  trophy: Trophy,
};

// ============================================
// HELPER COMPONENT
// ============================================

interface SportIconProps extends Omit<LucideProps, 'ref'> {
  sport: SportIconKey;
}

/**
 * Renders a sport icon by key
 */
export function SportIcon({ sport, ...props }: SportIconProps) {
  const IconComponent = SPORT_ICONS[sport];
  if (!IconComponent) {
    // Fallback to a generic target icon
    return <Target {...props} />;
  }
  return <IconComponent {...props} />;
}

export default SPORT_ICONS;
