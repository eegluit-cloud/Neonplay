import { Skeleton } from '@/components/ui/skeleton';

/**
 * Full page loading skeleton for route transitions
 */
export function PageLoadingState() {
  return (
    <div className="min-h-screen bg-background animate-in fade-in duration-200">
      {/* Header skeleton */}
      <div className="h-16 border-b border-border px-4 flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-9 w-20 rounded-lg" />
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="p-4 md:p-6 space-y-6">
        {/* Hero/Banner skeleton */}
        <Skeleton className="w-full h-40 md:h-48 rounded-xl" />

        {/* Section skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2 md:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
            ))}
          </div>
        </div>

        {/* Another section */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2 md:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Game grid loading skeleton
 */
export function GameGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="aspect-[3/4] rounded-lg md:rounded-xl" />
      ))}
    </div>
  );
}

/**
 * Banner carousel skeleton
 */
export function BannerSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
      <Skeleton className="aspect-[2/1] rounded-xl" />
      <Skeleton className="aspect-[2/1] rounded-xl hidden md:block" />
      <Skeleton className="aspect-[2/1] rounded-xl hidden md:block" />
    </div>
  );
}

/**
 * Card row skeleton for horizontal scrollers
 */
export function CardRowSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="flex gap-2 md:gap-3 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton 
          key={i} 
          className="flex-shrink-0 w-14 md:w-16 aspect-[3/4] rounded-lg" 
        />
      ))}
    </div>
  );
}

export default PageLoadingState;
