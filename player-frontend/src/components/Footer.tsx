import { Link } from 'react-router-dom';
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
  title: 'font-semibold text-xs text-foreground mb-2',
  link: 'text-[11px] text-muted-foreground hover:text-foreground transition-colors leading-relaxed',
  linkList: 'space-y-1.5',
  iconButton: 'w-10 h-10 flex items-center justify-center transition-opacity hover:opacity-80',
  icon: 'w-8 h-8',
  section: 'space-y-2',
};

export function Footer() {
  const columns = [
    { title: 'Casino', links: ['Casino Home', 'Slots', 'Live Casino', 'New Releases', 'Recommended', 'Table Game', 'BlackJack', 'Roulette', 'Baccarat'] },
    { title: 'Sports', links: ['Sports Home', 'Live', 'Rules', 'Sport Betting Insights'] },
    { title: 'Promo', links: ['VIP Club', 'Affiliate', 'Promotions', 'Lottery', 'Refer a friend', 'AMOE'] },
    { title: 'Support/Legal', links: ['Help center', 'Important Announcement', 'Gamble Aware', 'Fairness', 'FAQ', 'Privacy Policy', 'Terms Of Service'] },
    { title: 'About us', links: ['News', 'Work with us', 'Business Contacts', 'Help Desk', 'Verify Representative'] },
  ];

  return (
    <footer className="hidden md:block border-t border-border py-6 px-4 md:py-8 md:px-0 pb-16 md:pb-8">
      {/* Top Section - Logo and Social */}
      <div className="mb-8">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-3">
          <NeonPlayLogo size="lg" />
        </div>
        
        {/* Description */}
        <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mb-4">
          Discover top-rated online casinos and Betting with massive bonuses, secure gameplay, and fast payouts.
        </p>
        
        {/* Social Icons - same style as main site */}
        <div className="flex items-center gap-2">
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

      {/* Links Grid */}
      <div className="grid grid-cols-2 gap-4 md:gap-6 md:grid-cols-3 lg:grid-cols-5">
        {columns.map((col) => (
          <div key={col.title} className={footerStyles.section}>
            <h4 className={footerStyles.title}>{col.title}</h4>
            <ul className={footerStyles.linkList}>
              {col.links.map((link) => {
                // Special routing for specific links
                const linkRoutes: Record<string, string> = {
                  'AMOE': '/amoe',
                  'VIP Club': '/vip',
                  'Promotions': '/promotions',
                  'Refer a friend': '/refer-friend',
                };
                const route = linkRoutes[link];
                
                return (
                  <li key={link}>
                    {route ? (
                      <Link to={route} className={footerStyles.link}>
                        {link}
                      </Link>
                    ) : (
                      <a href="#" className={footerStyles.link}>
                        {link}
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}