import { useState, useRef, useEffect, ImgHTMLAttributes, memo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  /** Whether this is an above-the-fold image that should load eagerly */
  priority?: boolean;
  /** Fallback content or color when image fails to load */
  fallback?: React.ReactNode;
  /** Whether to show skeleton placeholder while loading */
  showSkeleton?: boolean;
  /** Aspect ratio for the placeholder (e.g., "3/4", "16/9") */
  aspectRatio?: string;
  /** Custom skeleton className */
  skeletonClassName?: string;
  /** Disable fade-in animation */
  noFade?: boolean;
  /** Root margin for intersection observer */
  rootMargin?: string;
}

/**
 * OptimizedImage - A performance-optimized image component
 * 
 * Features:
 * - Lazy loading for below-the-fold images
 * - Skeleton placeholder during load
 * - Smooth fade-in animation
 * - Error fallback handling
 * - Intersection Observer for efficient loading
 */
export const OptimizedImage = memo(function OptimizedImage({
  src,
  alt = '',
  className,
  priority = false,
  fallback,
  showSkeleton = true,
  aspectRatio,
  skeletonClassName,
  noFade = false,
  rootMargin = '200px',
  style,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin,
        threshold: 0.01,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView, rootMargin]);

  // Preload priority images
  useEffect(() => {
    if (priority && src && typeof src === 'string') {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
      return () => {
        document.head.removeChild(link);
      };
    }
  }, [priority, src]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setHasError(false);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(true);
  }, []);

  const containerStyle = aspectRatio
    ? { ...style, aspectRatio }
    : style;

  // Error fallback
  if (hasError) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div
        ref={containerRef}
        className={cn('bg-muted flex items-center justify-center', className)}
        style={containerStyle}
        aria-label={alt}
      >
        <span className="text-muted-foreground text-xs">Failed to load</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', aspectRatio && 'w-full')}
      style={containerStyle}
    >
      {/* Skeleton placeholder */}
      {showSkeleton && !isLoaded && (
        <Skeleton
          className={cn(
            'absolute inset-0 w-full h-full',
            skeletonClassName
          )}
        />
      )}

      {/* Actual image - only render when in view */}
      {isInView && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            className,
            !noFade && 'transition-opacity duration-200',
            !noFade && (isLoaded ? 'opacity-100' : 'opacity-0')
          )}
          style={style}
          {...props}
        />
      )}
    </div>
  );
});

/**
 * GameCardImage - Optimized image specifically for game cards
 * Pre-configured with game card aspect ratio and styling
 */
export const GameCardImage = memo(function GameCardImage({
  src,
  alt,
  className,
  priority = false,
  ...props
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
} & Omit<ImgHTMLAttributes<HTMLImageElement>, 'loading' | 'decoding'>) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px', threshold: 0 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  return (
    <div 
      ref={containerRef}
      className={cn('relative w-full aspect-[3/4] bg-muted rounded-lg md:rounded-xl overflow-hidden', className)}
    >
      {!isLoaded && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}
      {isInView && (
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-200',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          {...props}
        />
      )}
    </div>
  );
});

/**
 * ImageSkeleton - Standalone skeleton for image placeholders
 */
export function ImageSkeleton({
  className,
  aspectRatio,
  ...props
}: {
  className?: string;
  aspectRatio?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Skeleton
      className={cn('w-full', className)}
      style={{ aspectRatio }}
      {...props}
    />
  );
}

export default OptimizedImage;
