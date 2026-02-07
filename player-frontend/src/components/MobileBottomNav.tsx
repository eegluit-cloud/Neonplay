import { Menu, Heart, List, Volleyball } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { prefetchRoute } from '@/hooks/useRoutePrefetch';

interface MobileBottomNavProps {
  onMenuClick: () => void;
}

export function MobileBottomNav({ onMenuClick }: MobileBottomNavProps) {
  const location = useLocation();
  
  const navItems = [
    { 
      id: 'menu', 
      label: 'Menu', 
      icon: Menu, 
      action: 'menu',
      isActive: false 
    },
    {
      id: 'sports',
      label: 'Sports',
      icon: Volleyball,
      href: '/sports',
      isActive: location.pathname === '/sports'
    },
{
  id: 'casino',
  label: 'Casino',
  icon: ({ isActive }: { isActive?: boolean }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Back dice */}
      <rect 
        x="9" 
        y="3" 
        width="12" 
        height="12" 
        rx="2" 
        stroke={isActive ? "#22d3ee" : "currentColor"} 
        strokeWidth="2"
        fill="none"
      />
      <circle cx="12" cy="6" r="1" fill={isActive ? "#22d3ee" : "currentColor"}/>
      <circle cx="18" cy="12" r="1" fill={isActive ? "#22d3ee" : "currentColor"}/>
      
      {/* Front dice */}
      <rect 
        x="3" 
        y="9" 
        width="12" 
        height="12" 
        rx="2" 
        stroke={isActive ? "#22d3ee" : "currentColor"} 
        strokeWidth="2"
        fill={isActive ? "rgba(34, 211, 238, 0.1)" : "rgba(0,0,0,0.3)"}
      />
      <circle cx="6" cy="12" r="1" fill={isActive ? "#22d3ee" : "currentColor"}/>
      <circle cx="9" cy="15" r="1" fill={isActive ? "#22d3ee" : "currentColor"}/>
      <circle cx="12" cy="18" r="1" fill={isActive ? "#22d3ee" : "currentColor"}/>
        </svg>
      ),
      href: '/casino',
      isActive: location.pathname === '/casino'
    },
    { 
      id: 'bets', 
      label: 'Bets', 
      icon: List,
      href: '/profile',
      isActive: location.pathname === '/profile'
    },
    { 
      id: 'favorites', 
      label: 'Favorites', 
      icon: Heart,
      href: '/favorites',
      isActive: location.pathname === '/favorites'
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border safe-bottom md:hidden" role="navigation" aria-label="Mobile navigation">
      <div className="flex items-center justify-around h-16 px-1">
        {navItems.map((item) => {
          const isMenu = item.action === 'menu';
          const Icon = item.icon;
          
          const content = (
            <div className="flex flex-col items-center justify-center gap-0.5 py-1">
              <div className={`relative ${isMenu ? 'text-primary' : ''}`}>
                {isMenu ? (
                  <div className="flex flex-col gap-[3px]">
                    <div className="w-5 h-[3px] bg-primary rounded-full" />
                    <div className="w-5 h-[3px] bg-primary rounded-full" />
                    <div className="w-5 h-[3px] bg-primary rounded-full" />
                  </div>
                ) : item.id === 'casino' ? (
                  <Icon isActive={item.isActive} />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <span className={`text-[10px] font-medium ${isMenu ? 'text-primary' : item.isActive ? 'text-cyan-400' : 'text-muted-foreground'}`}>
                {item.label}
              </span>
            </div>
          );

          if (isMenu) {
            return (
              <button
                key={item.id}
                onClick={onMenuClick}
                className="flex flex-col items-center justify-center flex-1 h-full min-h-[48px] rounded-lg tap-feedback nav-item-press"
                aria-label="Open menu"
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={item.id}
              to={item.href || '/'}
              onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
              onMouseEnter={() => prefetchRoute(item.href || '/')}
              onTouchStart={() => prefetchRoute(item.href || '/')}
              className={`flex flex-col items-center justify-center flex-1 h-full min-h-[48px] rounded-lg tap-feedback nav-item-press ${item.isActive ? 'text-cyan-400' : 'text-muted-foreground'}`}
              aria-current={item.isActive ? 'page' : undefined}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
