import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface DiamondIconProps extends React.SVGProps<SVGSVGElement> {
  size?: 'sm' | 'md' | 'lg' | number;
}

/**
 * Canonical Diamond Icon - Single source of truth for all diamond icons in the app.
 * 
 * Sizes:
 * - sm: 16px (mobile)
 * - md: 18px (tablet/desktop default)
 * - lg: 20px (large displays)
 * - number: custom size in pixels
 */
const DiamondIconComponent = forwardRef<SVGSVGElement, DiamondIconProps>(
  ({ className, size = 'md', ...props }, ref) => {
    const sizeValue = typeof size === 'number' 
      ? size 
      : size === 'sm' ? 16 : size === 'lg' ? 20 : 18;

    return (
      <svg
        ref={ref}
        width={sizeValue}
        height={sizeValue}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={cn("text-muted-foreground", className)}
        {...props}
      >
        <path d="M6 2L2 8L12 22L22 8L18 2H6ZM7.5 4H10L8.5 7H4.5L7.5 4ZM12 4.5L14 7.5H10L12 4.5ZM14 4H16.5L19.5 7H15.5L14 4ZM4.5 9H8L12 17L4.5 9ZM10.5 9H13.5L12 13.5L10.5 9ZM16 9H19.5L12 17L16 9Z"/>
      </svg>
    );
  }
);

DiamondIconComponent.displayName = 'DiamondIcon';

export function DiamondIcon(props: DiamondIconProps) {
  return <DiamondIconComponent {...props} />;
}
