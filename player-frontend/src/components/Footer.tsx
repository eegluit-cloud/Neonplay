import { useRef } from 'react';
import { Link } from 'react-router-dom';
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
    { title: 'Casino', links: ['Casino Home', 'Slots', 'Live Casino', 'New Releases', 'Recommended', 'Table Game', 'BlackJack', 'Roulette', 'Baccarat'] },
    { title: 'Sports', links: ['Sports Home', 'Live', 'Rules', 'Sport Betting Insights'] },
    { title: 'Promo', links: ['VIP Club', 'Affiliate', 'Promotions', 'Lottery', 'Refer a friend', 'AMOE'] },
    { title: 'Support/Legal', links: ['Help center', 'Important Announcement', 'Responsible Gambling', 'Gamble Aware', 'Fairness', 'FAQ', 'Privacy Policy', 'Terms Of Service'] },
    { title: 'About us', links: ['News', 'Work with us', 'Business Contacts', 'Help Desk', 'Verify Representative'] },
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
              {col.links.map((link) => {
                const linkRoutes: Record<string, string> = {
                  'Casino Home': '/casino',
                  'Slots': '/slots',
                  'Live Casino': '/live-casino',
                  'New Releases': '/new-releases',
                  'Recommended': '/featured',
                  'Table Game': '/table-games',
                  'BlackJack': '/blackjack',
                  'Roulette': '/roulette',
                  'Baccarat': '/table-games',
                  'Sports Home': '/sports',
                  'Live': '/sports',
                  'Rules': '/faq',
                  'Sport Betting Insights': '/sports',
                  'VIP Club': '/vip',
                  'Affiliate': '/refer-friend',
                  'Promotions': '/promotions',
                  'Lottery': '/promotions',
                  'Refer a friend': '/refer-friend',
                  'AMOE': '/amoe',
                  'Help center': '/faq',
                  'Important Announcement': '/promotions',
                  'Responsible Gambling': '/responsible-gambling',
                  'Gamble Aware': '/responsible-gambling',
                  'Fairness': '/provably-fair',
                  'FAQ': '/faq',
                  'Privacy Policy': '/privacy',
                  'Terms Of Service': '/terms',
                  'News': '/lobby',
                  'Work with us': '/faq',
                  'Business Contacts': '/faq',
                  'Help Desk': '/faq',
                  'Verify Representative': '/faq',
                };
                const route = linkRoutes[link] || '/faq';

                return (
                  <li key={link}>
                    <Link to={route} className={footerStyles.link}>
                      {link}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Copyright */}
      <div className="md:mt-8 pt-4 md:border-t border-border text-center">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} PhiBet.io &mdash; Powered by EEGLUSOFT. All rights reserved.
        </p>
      </div>
    </footer>
  );
}