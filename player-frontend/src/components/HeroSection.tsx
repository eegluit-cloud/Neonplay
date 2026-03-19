import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import jackpotBannerMobile from '@/assets/jackpot-banner-mobile.png';
import bonusGiftBox from '@/assets/bonus-gift-box.png';
import heroVideo from '@/assets/hero-video.mp4';
import bannerSecondVideo from '@/assets/banner-second.mp4';
import bannerThirdVideo from '@/assets/banner-third.mp4';
import { useAuth } from '@/contexts/AuthContext';

interface HeroSectionProps {
  onOpenSignUp: () => void;
}

interface ApiBanner {
  id: string;
  title: string | null;
  subtitle: string | null;
  ctaText: string | null;
  ctaLink: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  backgroundGradient: string | null;
  platform: string;
  targetAudience: string;
  sortOrder: number;
}

const PLAYER_API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

const INITIAL_AMOUNT = 1250000;
const LOCAL_STORAGE_KEY = 'jackpot_amount';
const MOBILE_AUTOPLAY_DELAY = 7000;
const MOBILE_INTERACTION_PAUSE = 8000;
const DESKTOP_AUTOPLAY_DELAY = 6000;

// Static fallback carousel banner data (mobile)
const staticMobileCarouselBanners = [
  { id: 'brand', video: heroVideo, textType: 'brand' as const, videoFit: '' },
  { id: 'platform', video: bannerSecondVideo, textType: 'platform' as const, videoFit: 'object-contain object-right' },
  { id: 'winners', video: bannerThirdVideo, textType: 'winners' as const, videoFit: '' },
];

// Static fallback desktop banners
const staticDesktopBanners = [
  { src: null, video: heroVideo, alt: 'Build Your Brand', hasText: true, textType: 'brand', videoFit: '' },
  { src: null, video: bannerSecondVideo, alt: 'Ready to Launch', hasText: true, textType: 'platform', videoFit: 'object-contain object-right' },
  { src: null, video: bannerThirdVideo, alt: 'Win Amazing Prizes', hasText: true, textType: 'winners', videoFit: '' },
];

export function HeroSection({ onOpenSignUp }: HeroSectionProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  // API banner state
  const [apiBanners, setApiBanners] = useState<ApiBanner[]>([]);

  useEffect(() => {
    fetch(`${PLAYER_API_BASE}/cms/hero-banners?page=lobby`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.banners?.length) {
          setApiBanners(data.banners);
        }
      })
      .catch(() => {});
  }, []);

  const filteredBanners = apiBanners.filter(b => {
    const isAuthenticated = !!user;
    if (b.targetAudience === 'authenticated' && !isAuthenticated) return false;
    if (b.targetAudience === 'guest' && isAuthenticated) return false;
    return true;
  });

  const hasApiBanners = filteredBanners.length > 0;

  // ─── Desktop / Tablet carousel (Embla) ──────────────────────────────────────
  const [desktopSlideIndex, setDesktopSlideIndex] = useState(0);
  const desktopAutoplayRef = useRef<NodeJS.Timeout | null>(null);
  const desktopIsPausedRef = useRef(false);

  const [desktopEmblaRef, desktopEmblaApi] = useEmblaCarousel({
    loop: true,
    skipSnaps: false,
    dragFree: false,
  });

  // Track slide index
  useEffect(() => {
    if (!desktopEmblaApi) return;
    const onSelect = () => setDesktopSlideIndex(desktopEmblaApi.selectedScrollSnap());
    desktopEmblaApi.on('select', onSelect);
    onSelect();
    return () => { desktopEmblaApi.off('select', onSelect); };
  }, [desktopEmblaApi]);

  // Autoplay
  useEffect(() => {
    if (!desktopEmblaApi) return;

    const tick = () => {
      if (!desktopIsPausedRef.current) {
        desktopEmblaApi.scrollNext();
      }
    };

    desktopAutoplayRef.current = setInterval(tick, DESKTOP_AUTOPLAY_DELAY);
    return () => { if (desktopAutoplayRef.current) clearInterval(desktopAutoplayRef.current); };
  }, [desktopEmblaApi]);

  // Pause on pointer interaction
  useEffect(() => {
    if (!desktopEmblaApi) return;
    const pause = () => { desktopIsPausedRef.current = true; };
    const resume = () => { desktopIsPausedRef.current = false; };
    desktopEmblaApi.on('pointerDown', pause);
    desktopEmblaApi.on('settle', resume);
    return () => {
      desktopEmblaApi.off('pointerDown', pause);
      desktopEmblaApi.off('settle', resume);
    };
  }, [desktopEmblaApi]);

  // ─── Mobile carousel (Embla) ────────────────────────────────────────────────
  const [mobileSlideIndex, setMobileSlideIndex] = useState(0);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const interactionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    skipSnaps: false,
    dragFree: false,
  });

  // Jackpot counter
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

  // Mobile autoplay
  const startAutoplay = useCallback(() => {
    if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
    autoplayTimerRef.current = setInterval(() => {
      if (emblaApi && !isPaused) emblaApi.scrollNext();
    }, MOBILE_AUTOPLAY_DELAY);
  }, [emblaApi, isPaused]);

  const pauseAutoplay = useCallback(() => {
    setIsPaused(true);
    if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current);
    interactionTimerRef.current = setTimeout(() => setIsPaused(false), MOBILE_INTERACTION_PAUSE);
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setMobileSlideIndex(emblaApi.selectedScrollSnap());
    const onPointerDown = () => pauseAutoplay();
    emblaApi.on('select', onSelect);
    emblaApi.on('pointerDown', onPointerDown);
    onSelect();
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('pointerDown', onPointerDown);
    };
  }, [emblaApi, pauseAutoplay]);

  useEffect(() => {
    if (!isPaused) startAutoplay();
    return () => { if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current); };
  }, [isPaused, startAutoplay]);

  useEffect(() => {
    if (emblaApi) startAutoplay();
    return () => {
      if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
      if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current);
    };
  }, [emblaApi, startAutoplay]);

  const goToMobileSlide = useCallback((index: number) => {
    if (emblaApi) { emblaApi.scrollTo(index); pauseAutoplay(); }
  }, [emblaApi, pauseAutoplay]);

  // ─── GSAP ───────────────────────────────────────────────────────────────────
  const heroSectionRef = useRef<HTMLElement>(null);
  const desktopCarouselRef = useRef<HTMLDivElement>(null);
  const mobileContainerRef = useRef<HTMLDivElement>(null);
  const jackpotGridRef = useRef<HTMLDivElement>(null);

  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  useGSAP(() => {
    if (prefersReducedMotion) return;

    if (desktopCarouselRef.current) {
      gsap.from(desktopCarouselRef.current, {
        opacity: 0,
        y: 16,
        duration: 0.5,
        ease: 'power3.out',
      });
    }

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

  // ─── Banner data ─────────────────────────────────────────────────────────────
  const desktopBanners = hasApiBanners ? filteredBanners : staticDesktopBanners;
  const mobileBanners = hasApiBanners ? filteredBanners : null;
  const multipleDesktopBanners = desktopBanners.length > 1;

  // ─── Handle banner click ─────────────────────────────────────────────────────
  const handleBannerClick = (ctaLink?: string | null) => {
    if (ctaLink) {
      if (ctaLink.startsWith('http')) {
        window.open(ctaLink, '_blank', 'noopener,noreferrer');
      } else {
        navigate(ctaLink);
      }
    } else {
      onOpenSignUp();
    }
  };

  // ─── Text overlay for static banners ────────────────────────────────────────
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

  // ─── Render static banner (desktop carousel slide) ───────────────────────────
  const renderStaticBanner = (banner: typeof staticDesktopBanners[0]) => (
    <div
      className={`relative overflow-hidden w-full h-full cursor-pointer ${banner.videoFit ? 'bg-gray-900' : ''}`}
      onClick={() => handleBannerClick(null)}
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
        <img src={banner.src!} alt={banner.alt} className="w-full h-full object-cover" />
      )}
      {banner.hasText && (
        <div className="absolute inset-y-0 left-0 w-1/2 bg-black/40 backdrop-blur-md" />
      )}
      {banner.textType && renderBannerText(banner.textType)}
      <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
    </div>
  );

  // ─── Render API banner (desktop carousel slide) ──────────────────────────────
  const renderApiBanner = (banner: ApiBanner, isMobile = false) => {
    const padding = isMobile ? 'p-3' : 'p-4 md:p-5 lg:p-6';
    const subtitleSize = isMobile ? 'text-[9px]' : 'text-[10px] md:text-[11px] lg:text-xs';
    const titleSize = isMobile ? 'text-lg' : 'text-lg md:text-xl lg:text-2xl xl:text-3xl';
    const hasOverlay = !!(banner.title || banner.subtitle);

    return (
      <div
        className="relative overflow-hidden w-full h-full cursor-pointer"
        style={{ background: banner.backgroundGradient || 'linear-gradient(135deg, #1e1b4b, #312e81)' }}
        onClick={() => handleBannerClick(banner.ctaLink)}
      >
        {banner.videoUrl ? (
          <video
            src={banner.videoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        ) : banner.imageUrl ? (
          <img
            src={banner.imageUrl}
            alt={banner.title || ''}
            className="w-full h-full object-cover"
          />
        ) : null}
        {hasOverlay && (
          <div className="absolute inset-y-0 left-0 w-1/2 bg-black/40 backdrop-blur-md" />
        )}
        {hasOverlay && (
          <div className={`absolute inset-0 flex items-center justify-start ${padding}`}>
            <div className="flex flex-col gap-0.5 md:gap-1 z-10">
              {banner.subtitle && (
                <span className={`${subtitleSize} font-medium uppercase tracking-widest text-amber-400`}>
                  {banner.subtitle}
                </span>
              )}
              {banner.title && (
                <h2 className={`${titleSize} font-bold text-white leading-tight`}>
                  {banner.title}
                </h2>
              )}
              {banner.ctaText && (
                <button className="mt-2 self-start bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors">
                  {banner.ctaText}
                </button>
              )}
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
      </div>
    );
  };

  return (
    <section ref={heroSectionRef} className="relative overflow-hidden">

      {/* ── Desktop + Tablet: Full-Width Embla Carousel ── */}
      <div ref={desktopCarouselRef} className="hidden md:block relative">
        <div
          ref={desktopEmblaRef}
          className="overflow-hidden rounded-xl h-[260px] lg:h-[380px]"
        >
          <div className="flex h-full">
            {desktopBanners.map((banner, index) => (
              <div
                key={hasApiBanners ? (banner as ApiBanner).id : index}
                className="flex-[0_0_100%] min-w-0 h-full"
              >
                {hasApiBanners
                  ? renderApiBanner(banner as ApiBanner)
                  : renderStaticBanner(banner as typeof staticDesktopBanners[0])}
              </div>
            ))}
          </div>
        </div>

        {/* Arrows */}
        {multipleDesktopBanners && (
          <>
            <button
              onClick={() => desktopEmblaApi?.scrollPrev()}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/40 hover:bg-black/65 backdrop-blur-sm text-white text-xl flex items-center justify-center transition-colors border border-white/10"
              aria-label="Previous banner"
            >
              ‹
            </button>
            <button
              onClick={() => desktopEmblaApi?.scrollNext()}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/40 hover:bg-black/65 backdrop-blur-sm text-white text-xl flex items-center justify-center transition-colors border border-white/10"
              aria-label="Next banner"
            >
              ›
            </button>
          </>
        )}

        {/* Dots */}
        {multipleDesktopBanners && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
            {desktopBanners.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                onClick={() => desktopEmblaApi?.scrollTo(index)}
                className={`block h-[3px] rounded-full transition-all duration-300 focus-visible:outline-none ${
                  desktopSlideIndex === index
                    ? 'bg-amber-400 w-4'
                    : 'bg-white/40 hover:bg-white/60 w-1.5'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Mobile Layout ── */}
      <div className="md:hidden space-y-2">
        {/* Main Hero Banner - Infinite Autoplay Carousel */}
        <div ref={mobileContainerRef} className="relative">
          <div
            ref={emblaRef}
            className="overflow-hidden rounded-xl border border-border"
            style={{ aspectRatio: '352/172' }}
          >
            <div className="flex h-full">
              {mobileBanners ? (
                mobileBanners.map((banner) => (
                  <div
                    key={banner.id}
                    className="flex-[0_0_100%] min-w-0 relative h-full cursor-pointer"
                    style={{ background: banner.backgroundGradient || 'linear-gradient(135deg, #1e1b4b, #312e81)' }}
                    onClick={() => handleBannerClick(banner.ctaLink)}
                  >
                    {banner.videoUrl ? (
                      <video
                        src={banner.videoUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="auto"
                        className="w-full h-full object-cover"
                        onCanPlay={(e) => { e.currentTarget.play().catch(() => {}); }}
                        ref={(el) => { if (el) el.play().catch(() => {}); }}
                      />
                    ) : banner.imageUrl ? (
                      <img src={banner.imageUrl} alt={banner.title || ''} className="w-full h-full object-cover" />
                    ) : null}
                    {(banner.title || banner.subtitle) && (
                      <>
                        <div className="absolute inset-y-0 left-0 w-1/2 bg-black/40 backdrop-blur-md" />
                        <div className="absolute inset-0 flex items-center justify-start p-3">
                          <div className="flex flex-col gap-0.5 z-10">
                            {banner.subtitle && (
                              <span className="text-[9px] font-medium uppercase tracking-widest text-amber-400">
                                {banner.subtitle}
                              </span>
                            )}
                            {banner.title && (
                              <h2 className="text-lg font-bold text-white leading-tight">{banner.title}</h2>
                            )}
                            {banner.ctaText && (
                              <button className="mt-1 self-start bg-indigo-500 text-white px-2 py-0.5 rounded text-[10px] font-semibold">
                                {banner.ctaText}
                              </button>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))
              ) : (
                staticMobileCarouselBanners.map((banner, index) => (
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
                      onCanPlay={(e) => { e.currentTarget.play().catch(() => {}); }}
                      ref={(el) => { if (el) el.play().catch(() => {}); }}
                    />
                    <div className="absolute inset-y-0 left-0 w-1/2 bg-black/40 backdrop-blur-md" />
                    {renderBannerText(banner.textType, true)}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Mobile dots */}
          {mobileBanners && mobileBanners.length > 1 && (
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-0.5 z-10">
              {mobileBanners.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`Go to slide ${index + 1}`}
                  onClick={() => goToMobileSlide(index)}
                  className={`block h-[2px] rounded-full transition-all duration-300 focus-visible:outline-none ${
                    mobileSlideIndex === index ? 'bg-amber-400 w-[14px]' : 'bg-white/40 hover:bg-white/60 w-[4px]'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* 2/3 Jackpot + 1/3 Bonus Grid */}
        <div ref={jackpotGridRef} className="grid grid-cols-3 gap-2 h-24">
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
            <div className="absolute top-0.5 left-1/2 -translate-x-1/2">
              <span className="px-1.5 py-0.5 bg-black/50 backdrop-blur-sm rounded-md text-[10px] font-bold text-white">
                Mega Jackpot
              </span>
            </div>
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
