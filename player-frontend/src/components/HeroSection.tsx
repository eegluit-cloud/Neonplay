import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import heroBannerMobile from '@/assets/hero-banner-mobile.png';
import promoHeroBanner from '@/assets/promo-hero-banner.png';
import promoDailyBonus from '@/assets/promo-daily-bonus.png';
import promoWeeklyBonus from '@/assets/promo-weekly-bonus.png';
import promoMonthlyBonus from '@/assets/promo-monthly-bonus.png';
import buildBrandBanner from '@/assets/build-brand-banner.png';
import platformShowcase from '@/assets/platform-showcase.png';
import jackpotImg from '@/assets/jackpot-header.png';
import jackpotBannerMobile from '@/assets/jackpot-banner-mobile.png';
import bonusGiftBox from '@/assets/bonus-gift-box.png';
import jackpotBg from '@/assets/jackpot-bg.gif';
import winnersPrizesBanner from '@/assets/winners-prizes-banner.png';
import heroVideo from '@/assets/hero-video.mp4';
import bannerSecondVideo from '@/assets/banner-second.mp4';
import bannerThirdVideo from '@/assets/banner-third.mp4';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeroSectionProps {
  onOpenSignUp: () => void;
}

const INITIAL_AMOUNT = 1250000;
const LOCAL_STORAGE_KEY = 'jackpot_amount';
const MOBILE_AUTOPLAY_DELAY = 7000; // 7 seconds
const MOBILE_INTERACTION_PAUSE = 8000; // 8 seconds pause after interaction

// Mobile carousel banner data
const mobileCarouselBanners = [
  { id: 'brand', video: heroVideo, textType: 'brand' as const, videoFit: '' },
  { id: 'platform', video: bannerSecondVideo, textType: 'platform' as const, videoFit: 'object-contain object-right' },
  { id: 'winners', video: bannerThirdVideo, textType: 'winners' as const, videoFit: '' },
];

export function HeroSection({ onOpenSignUp }: HeroSectionProps) {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  
  // Mobile carousel state
  const [mobileSlideIndex, setMobileSlideIndex] = useState(0);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const interactionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  
  // Embla carousel for mobile - infinite loop
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    skipSnaps: false,
    dragFree: false,
  });
  
  // Jackpot state for mobile banner
  const [amount, setAmount] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? parseFloat(saved) : INITIAL_AMOUNT;
    }
    return INITIAL_AMOUNT;
  });

  const incrementAmount = useCallback(() => {
    const increment = Math.random() * 15 + 5;
    setAmount(prev => {
      const newAmount = prev + increment;
      localStorage.setItem(LOCAL_STORAGE_KEY, newAmount.toString());
      return newAmount;
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(incrementAmount, 800 + Math.random() * 400);
    return () => clearInterval(interval);
  }, [incrementAmount]);

  const formattedAmount = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Mobile carousel autoplay logic
  const startAutoplay = useCallback(() => {
    if (autoplayTimerRef.current) {
      clearInterval(autoplayTimerRef.current);
    }
    
    autoplayTimerRef.current = setInterval(() => {
      if (emblaApi && !isPaused) {
        emblaApi.scrollNext();
      }
    }, MOBILE_AUTOPLAY_DELAY);
  }, [emblaApi, isPaused]);

  const pauseAutoplay = useCallback(() => {
    setIsPaused(true);
    
    // Clear any existing interaction timer
    if (interactionTimerRef.current) {
      clearTimeout(interactionTimerRef.current);
    }
    
    // Resume after interaction delay
    interactionTimerRef.current = setTimeout(() => {
      setIsPaused(false);
    }, MOBILE_INTERACTION_PAUSE);
  }, []);

  // Track slide changes for mobile
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setMobileSlideIndex(emblaApi.selectedScrollSnap());
    };

    const onPointerDown = () => {
      pauseAutoplay();
    };

    emblaApi.on('select', onSelect);
    emblaApi.on('pointerDown', onPointerDown);
    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('pointerDown', onPointerDown);
    };
  }, [emblaApi, pauseAutoplay]);

  // Start/restart autoplay when pause state changes
  useEffect(() => {
    if (!isPaused) {
      startAutoplay();
    }
    
    return () => {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
      }
    };
  }, [isPaused, startAutoplay]);

  // Initial autoplay start
  useEffect(() => {
    if (emblaApi) {
      startAutoplay();
    }
    
    return () => {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
      }
      if (interactionTimerRef.current) {
        clearTimeout(interactionTimerRef.current);
      }
    };
  }, [emblaApi, startAutoplay]);

  const goToMobileSlide = useCallback((index: number) => {
    if (emblaApi) {
      emblaApi.scrollTo(index);
      pauseAutoplay();
    }
  }, [emblaApi, pauseAutoplay]);

  // GSAP animation refs
  const heroSectionRef = useRef<HTMLElement>(null);
  const desktopGridRef = useRef<HTMLDivElement>(null);
  const tabletContainerRef = useRef<HTMLDivElement>(null);
  const mobileContainerRef = useRef<HTMLDivElement>(null);
  const jackpotGridRef = useRef<HTMLDivElement>(null);

  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  // Hero on-load entrance animations
  useGSAP(() => {
    if (prefersReducedMotion) return;

    // Desktop: staggered banner entrance
    if (desktopGridRef.current) {
      const banners = desktopGridRef.current.children;
      gsap.from(banners, {
        opacity: 0,
        scale: 0.92,
        y: 20,
        duration: 0.5,
        stagger: 0.15,
        ease: 'power3.out',
      });
    }

    // Tablet: container fade-in
    if (tabletContainerRef.current) {
      gsap.from(tabletContainerRef.current, {
        opacity: 0,
        duration: 0.4,
        ease: 'power2.out',
      });
    }

    // Mobile: carousel + jackpot grid entrance
    if (mobileContainerRef.current) {
      gsap.from(mobileContainerRef.current, {
        opacity: 0,
        y: 15,
        duration: 0.4,
        ease: 'power2.out',
      });
    }
    if (jackpotGridRef.current) {
      gsap.from(jackpotGridRef.current, {
        opacity: 0,
        y: 10,
        scale: 0.97,
        duration: 0.4,
        delay: 0.2,
        ease: 'power2.out',
      });
    }
  }, { scope: heroSectionRef });

  const desktopBanners = [
    { src: null, video: heroVideo, alt: 'Build Your Brand', hasText: true, textType: 'brand' },
    { src: null, video: bannerSecondVideo, alt: 'Ready to Launch', hasText: true, textType: 'platform', videoFit: 'object-contain object-right' },
    { src: null, video: bannerThirdVideo, alt: 'Win Amazing Prizes', hasText: true, textType: 'winners' },
  ];

  // For tablet: show 2 banners at a time, cycle through pairs with infinite loop
  const tabletSlides = [
    [desktopBanners[0], desktopBanners[1]],
    [desktopBanners[1], desktopBanners[2]],
    [desktopBanners[2], desktopBanners[0]],
  ];
  
  // Add clone of first slide at the end for seamless infinite loop
  const extendedSlides = [...tabletSlides, tabletSlides[0]];
  const totalSlides = tabletSlides.length;

  // Auto-rotate carousel for tablet - infinite forward loop
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => prev + 1);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  // Handle seamless reset when reaching the clone
  useEffect(() => {
    if (currentSlide === totalSlides) {
      // Wait for transition to complete, then reset without animation
      const timeout = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentSlide(0);
        // Re-enable transition after reset
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setIsTransitioning(true);
          });
        });
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [currentSlide, totalSlides]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrev = () => {
    if (currentSlide === 0) {
      // Jump to last real slide
      setIsTransitioning(false);
      setCurrentSlide(totalSlides - 1);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsTransitioning(true);
        });
      });
    } else {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const goToNext = () => {
    setCurrentSlide((prev) => prev + 1);
  };

  // Render banner text overlay based on type
  const renderBannerText = (textType: string, isMobile = false) => {
    const padding = isMobile ? 'p-3' : 'p-4 md:p-5 lg:p-6';
    const subtitleSize = isMobile ? 'text-[9px]' : 'text-[10px] md:text-[11px] lg:text-xs';
    const titleSize = isMobile ? 'text-lg' : 'text-lg md:text-xl lg:text-2xl xl:text-3xl';
    const smallTitleSize = isMobile ? 'text-base' : 'text-base md:text-lg lg:text-xl xl:text-2xl';

    switch (textType) {
      case 'brand':
        return (
          <div className={`absolute inset-0 flex items-center justify-start ${padding}`}>
            <div className="flex flex-col gap-0.5 md:gap-1 z-10">
              <span className={`${subtitleSize} font-medium uppercase tracking-widest text-amber-400`}>
                Start Your Journey
              </span>
              <h2 className={`${titleSize} font-bold text-white leading-tight`}>
                Build Your
                <span className="block bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
                  Brand
                </span>
              </h2>
            </div>
          </div>
        );
      case 'platform':
        return (
          <div className={`absolute inset-0 flex items-center justify-start ${padding}`}>
            <div className="flex flex-col gap-0.5 md:gap-1 z-10">
              <span className={`${subtitleSize} font-medium uppercase tracking-widest text-amber-400`}>
                Ready to Launch
              </span>
              <h2 className={`${smallTitleSize} font-bold text-white leading-tight`}>
                Payments &
                <span className="block bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
                  Providers
                </span>
              </h2>
            </div>
          </div>
        );
      case 'winners':
        return (
          <div className={`absolute inset-0 flex items-center justify-start ${padding}`}>
            <div className="flex flex-col gap-0.5 md:gap-1 z-10">
              <span className={`${subtitleSize} font-medium uppercase tracking-widest text-amber-400`}>
                Boost Engagement
              </span>
              <h2 className={`${smallTitleSize} font-bold text-white leading-tight`}>
                Create Your
                <span className="block bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  Leaderboard
                </span>
              </h2>
              {!isMobile && (
                <span className="hidden lg:block text-[10px] text-white/70 mt-1">
                  Custom Prizes • Real-Time Rankings
                </span>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Render single banner content
  const renderBanner = (banner: typeof desktopBanners[0], index: number) => (
    <div
      key={index}
      className={`relative overflow-hidden rounded-xl group w-full h-full ${banner.videoFit ? 'bg-gray-900' : ''}`}
      style={{ aspectRatio: '352/172' }}
    >
      {banner.video ? (
        <video
          src={banner.video}
          autoPlay
          loop
          muted
          playsInline
          className={`w-full h-full ${banner.videoFit || 'object-cover'}`}
        />
      ) : (
        <img
          src={banner.src!}
          alt={banner.alt}
          className="w-full h-full object-cover"
        />
      )}
      {/* Glass overlay for banners with text */}
      {banner.hasText && (
        <div className="absolute inset-y-0 left-0 w-1/2 bg-black/40 backdrop-blur-md" />
      )}
      {/* Text overlay */}
      {banner.textType && renderBannerText(banner.textType)}
      {/* Hover effect */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
    </div>
  );

  return (
    <section ref={heroSectionRef} className="relative overflow-hidden">
      {/* Desktop - 3 Banners Grid */}
      <div ref={desktopGridRef} className="hidden lg:grid grid-cols-3 gap-3">
        {desktopBanners.map((banner, index) => renderBanner(banner, index))}
      </div>

      {/* Tablet - Carousel showing 2 banners at a time */}
      <div ref={tabletContainerRef} className="hidden md:block lg:hidden relative">
        <div className="overflow-hidden">
          <div 
            className={`flex ${isTransitioning ? 'transition-transform duration-500 ease-out' : ''}`}
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {extendedSlides.map((slidePair, slideIndex) => (
              <div key={slideIndex} className="w-full flex-shrink-0 grid grid-cols-2 gap-2">
                {slidePair.map((banner, bannerIndex) => (
                  <div key={bannerIndex} className="overflow-hidden rounded-xl">
                    {renderBanner(banner, slideIndex * 2 + bannerIndex)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        
        
        {/* Dots Indicator */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-0.5 z-10">
          {tabletSlides.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => goToSlide(index)}
              className={`tap-sm block p-0 m-0 border-0 bg-transparent appearance-none h-[2px] rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 ${
                (currentSlide % totalSlides) === index
                  ? 'bg-amber-400 w-[14px]'
                  : 'bg-white/40 hover:bg-white/60 w-[4px]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden space-y-2">
        {/* Main Hero Banner - Infinite Autoplay Carousel */}
        <div ref={mobileContainerRef} className="relative">
          <div 
            ref={emblaRef} 
            className="overflow-hidden rounded-xl border border-border"
            style={{ aspectRatio: '352/172' }}
          >
            <div className="flex h-full">
              {mobileCarouselBanners.map((banner, index) => (
                <div
                  key={banner.id}
                  className={`flex-[0_0_100%] min-w-0 relative h-full cursor-pointer ${banner.videoFit ? 'bg-gray-900' : ''}`}
                  onClick={onOpenSignUp}
                >
                  <video
                    src={banner.video}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    className={`w-full h-full ${banner.videoFit || 'object-cover'}`}
                    onCanPlay={(e) => {
                      const video = e.currentTarget;
                      video.play().catch(() => {});
                    }}
                    ref={(el) => {
                      if (el) {
                        el.play().catch(() => {});
                      }
                    }}
                  />
                  {/* Glass overlay */}
                  <div className="absolute inset-y-0 left-0 w-1/2 bg-black/40 backdrop-blur-md" />
                  {/* Text overlay */}
                  {renderBannerText(banner.textType, true)}
                </div>
              ))}
            </div>
          </div>
          
        </div>

        {/* 2/3 Jackpot + 1/3 Bonus Grid */}
        <div ref={jackpotGridRef} className="grid grid-cols-3 gap-2 h-24">
          {/* Jackpot Banner - 2/3 width */}
          <div 
            className="col-span-2 relative overflow-hidden rounded-xl cursor-pointer border border-border h-full"
            onClick={onOpenSignUp}
          >
            <img 
              src={jackpotBannerMobile} 
              alt="Jackpot" 
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
            {/* Mega Jackpot Title */}
            <div className="absolute top-0.5 left-1/2 -translate-x-1/2">
              <span className="px-1.5 py-0.5 bg-black/50 backdrop-blur-sm rounded-md text-[10px] font-bold text-white">
                Mega Jackpot
              </span>
            </div>
            {/* Jackpot Amount */}
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2">
              <div className="relative px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 shadow-lg leading-tight">
                <span
                  className="relative text-[13px] font-bold tabular-nums tracking-tight whitespace-nowrap drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  <span className="text-[#22d3ee]">$</span>
                  <span className="text-white">{formattedAmount}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Promotion Banner - 1/3 width */}
          <div 
            className="col-span-1 relative overflow-hidden rounded-xl cursor-pointer h-full border border-border"
            onClick={() => navigate('/promotions')}
          >
            <img 
              src={bonusGiftBox} 
              alt="Promotions" 
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
            {/* Text with background */}
            <div className="absolute top-0.5 left-1/2 -translate-x-1/2">
              <span className="px-1.5 py-0.5 bg-black/50 backdrop-blur-sm rounded-md text-[10px] font-bold text-white">
                Bonuses
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
