import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import discordIcon from '@/assets/social/discord.png';
import twitterIcon from '@/assets/social/twitter.png';
import instagramIcon from '@/assets/social/instagram.png';
import telegramIcon from '@/assets/social/telegram.png';
import tiktokIcon from '@/assets/social/tiktok.png';
import facebookIcon from '@/assets/social/facebook.png';
import { NeonPlayLogo } from '@/components/NeonPlayLogo';

const socialIconsRow1 = [
  { src: facebookIcon, alt: 'Facebook', href: '#' },
  { src: instagramIcon, alt: 'Instagram', href: '#' },
  { src: tiktokIcon, alt: 'TikTok', href: '#' },
  { src: twitterIcon, alt: 'Twitter', href: '#' },
  { src: telegramIcon, alt: 'Telegram', href: '#' },
  { src: discordIcon, alt: 'Discord', href: '#' },
];

// Consistent footer styles - matching main site
const footerStyles = {
  title: 'font-semibold text-xs sm:text-sm text-foreground mb-2',
  link: 'footer-link text-[11px] text-muted-foreground hover:text-foreground transition-colors leading-relaxed',
  linkList: 'space-y-1.5',
  iconButton: 'w-10 h-10 flex items-center justify-center social-hover transition-all',
  icon: 'w-8 h-8',
  section: 'space-y-2',
};

export function Footer() {
  const { t } = useTranslation();
  const footerRef = useRef<HTMLElement>(null);
  const topSectionRef = useRef<HTMLDivElement>(null);
  const socialRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!footerRef.current) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Top section fade
    if (topSectionRef.current) {
      gsap.from(topSectionRef.current, {
        opacity: 0, y: 15, duration: 0.4, ease: 'power2.out',
        scrollTrigger: { trigger: footerRef.current, start: 'top 90%', once: true },
      });
    }

    // Social icons bounce-in
    if (socialRef.current) {
      const icons = socialRef.current.children;
      gsap.from(icons, {
        scale: 0, opacity: 0, duration: 0.3, stagger: 0.05, delay: 0.15,
        ease: 'back.out(1.7)',
        scrollTrigger: { trigger: footerRef.current, start: 'top 90%', once: true },
      });
    }

    // Link columns stagger
    if (gridRef.current) {
      const columns = gridRef.current.children;
      gsap.from(columns, {
        opacity: 0, y: 10, duration: 0.3, stagger: 0.08, delay: 0.3,
        ease: 'power2.out',
        scrollTrigger: { trigger: footerRef.current, start: 'top 90%', once: true },
      });
    }
  }, { scope: footerRef });

  const columns = [
    {
      title: t('footer.casino'),
      links: [
        { label: t('footer.casinoHome'), route: '/casino' },
        { label: t('footer.slots'), route: '/slots' },
        { label: t('footer.liveCasino'), route: '/live-casino' },
        { label: t('footer.newReleases'), route: '/new-releases' },
        { label: t('footer.recommended'), route: '/featured' },
        { label: t('footer.tableGame'), route: '/table-games' },
        { label: t('footer.blackjack'), route: '/blackjack' },
        { label: t('footer.roulette'), route: '/roulette' },
        { label: t('footer.baccarat'), route: '/table-games' },
      ],
    },
    {
      title: t('footer.sports'),
      links: [
        { label: t('footer.sportsHome'), route: '/sports' },
        { label: t('footer.live'), route: '/sports' },
        { label: t('footer.rules'), route: '/faq' },
        { label: t('footer.sportsBettingInsights'), route: '/sports' },
      ],
    },
    {
      title: t('footer.promo'),
      links: [
        { label: t('footer.vipClub'), route: '/vip' },
        { label: t('footer.affiliate'), route: '/refer-friend' },
        { label: t('footer.promotions'), route: '/promotions' },
        { label: t('footer.lottery'), route: '/promotions' },
        { label: t('footer.referFriend'), route: '/refer-friend' },
        { label: t('footer.amoe'), route: '/amoe' },
      ],
    },
    {
      title: t('footer.supportLegal'),
      links: [
        { label: t('footer.helpCenter'), route: '/page/help-center' },
        { label: t('footer.importantAnnouncement'), route: '/page/important-announcement' },
        { label: t('footer.responsibleGambling'), route: '/page/responsible-gambling' },
        { label: t('footer.gambleAware'), route: '/page/gamble-aware' },
        { label: t('footer.fairness'), route: '/page/fairness' },
        { label: t('footer.faq'), route: '/page/faq' },
        { label: t('footer.privacyPolicy'), route: '/page/privacy-policy' },
        { label: t('footer.termsOfService'), route: '/terms' },
      ],
    },
    {
      title: t('footer.aboutUs'),
      links: [
        { label: t('footer.news'), route: '/lobby' },
        { label: t('footer.workWithUs'), route: '/faq' },
        { label: t('footer.businessContacts'), route: '/faq' },
        { label: t('footer.helpDesk'), route: '/faq' },
        { label: t('footer.verifyRepresentative'), route: '/faq' },
      ],
    },
  ];

  return (
    <footer ref={footerRef} className="border-t border-border py-6 px-4 md:py-8 md:px-0 pb-20 md:pb-8">
      {/* Top Section - Logo and Social (desktop only) */}
      <div ref={topSectionRef} className="hidden md:block mb-8">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-3">
          <NeonPlayLogo size="lg" />
        </div>

        {/* Description */}
        <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mb-4">
          Discover top-rated online casino and sports betting with massive bonuses, secure gameplay, and fast payouts. Play responsibly.
        </p>

        {/* Social Icons - same style as main site */}
        <div ref={socialRef} className="flex items-center gap-2">
          {socialIconsRow1.map((icon) => (
            <a
              key={icon.alt}
              href={icon.href}
              className={footerStyles.iconButton}
              aria-label={icon.alt}
            >
              <img src={icon.src} alt={icon.alt} className={footerStyles.icon} />
            </a>
          ))}
        </div>
      </div>

      {/* Links Grid (desktop only) */}
      <div ref={gridRef} className="hidden md:grid grid-cols-2 gap-4 md:gap-6 md:grid-cols-3 lg:grid-cols-5">
        {columns.map((col) => (
          <div key={col.title} className={footerStyles.section}>
            <h4 className={footerStyles.title}>{col.title}</h4>
            <ul className={footerStyles.linkList}>
              {col.links.map((link) => (
                <li key={link.route + link.label}>
                  <Link to={link.route} className={footerStyles.link}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Mobile legal links - visible on mobile only */}
      <div className="md:hidden pt-4 border-t border-border mb-3">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
          <Link to="/terms" className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">
            {t('footer.termsOfService')}
          </Link>
          <Link to="/page/privacy-policy" className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">
            {t('footer.privacyPolicy')}
          </Link>
          <Link to="/page/responsible-gambling" className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">
            {t('footer.responsibleGambling')}
          </Link>
          <Link to="/page/faq" className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">
            {t('footer.faq')}
          </Link>
        </div>
      </div>

      {/* Copyright */}
      <div className="md:mt-8 pt-4 md:border-t border-border text-center">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Neon Play &mdash; Powered by EEGLUSOFT. {t('footer.allRightsReserved')}
        </p>
      </div>
    </footer>
  );
}