import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSidebar } from '@/hooks/useSidebar';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { AuthModals } from '@/components/AuthModals';
import { SpinGiftModal } from '@/components/SpinGiftModal';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { MobilePageHeader } from '@/components/MobilePageHeader';
import { GameCategoryNav } from '@/components/GameCategoryNav';
import { Search, LayoutGrid, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGameProviders } from '@/hooks/useGames';

const Providers = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [signInOpen, setSignInOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);
  const [spinGiftOpen, setSpinGiftOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const { providers, isLoading } = useGameProviders();

  const filteredProviders = useMemo(() => {
    if (!searchTerm) return providers;
    return providers.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [providers, searchTerm]);

  return (
    <div className="min-h-screen bg-background">
      <Header
        onOpenSignIn={() => setSignInOpen(true)}
        onOpenSignUp={() => setSignUpOpen(true)}
        onToggleSidebar={toggleSidebar}
      />

      <Sidebar
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        onOpenSpinGift={() => setSpinGiftOpen(true)}
      />

      <div className={`transition-all duration-300 pt-14 md:pt-16 pb-20 md:pb-0 ${sidebarOpen ? 'md:ml-56' : 'md:ml-16'}`}>
        <main className="p-3 md:p-4 lg:p-6 space-y-4 md:space-y-6 overflow-x-hidden max-w-full">

          {/* Mobile Header with Back Button */}
          <MobilePageHeader title="Providers" />


          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-3xl w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search a provider..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-9 md:h-12 pl-9 pr-3 rounded-lg md:rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Volatility Dropdown - Hidden on mobile */}
            <div className="hidden md:block">
              <Select defaultValue="all">
                <SelectTrigger className="h-12 w-[160px] bg-card border-border rounded-xl">
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4" />
                    <SelectValue placeholder="Volatility" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Volatility</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category Navigation */}
          <GameCategoryNav activeTab="providers" />

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
            </div>
          )}

          {/* Providers Grid - Mobile: 3 columns */}
          {!isLoading && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 md:gap-3">
              {filteredProviders.map((provider) => (
                <div
                  key={provider.id}
                  onClick={() => navigate(`/providers/${provider.slug}`)}
                  className="bg-card border border-border rounded-lg md:rounded-xl p-3 md:p-4 flex items-center justify-center h-14 md:h-20 hover:border-primary/50 transition-colors cursor-pointer group"
                >
                  {provider.logoUrl && provider.logoUrl.startsWith('http') ? (
                    <img
                      src={provider.logoUrl}
                      alt={provider.name}
                      className="max-h-8 md:max-h-10 max-w-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <span className={`text-xs font-medium text-center text-muted-foreground group-hover:text-foreground transition-colors ${provider.logoUrl && provider.logoUrl.startsWith('http') ? 'hidden' : ''}`}>
                    {provider.name}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {!isLoading && filteredProviders.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No providers found</p>
            </div>
          )}

          <Footer />
        </main>
      </div>

      <AuthModals
        isSignInOpen={signInOpen}
        isSignUpOpen={signUpOpen}
        onCloseSignIn={() => setSignInOpen(false)}
        onCloseSignUp={() => setSignUpOpen(false)}
        onSwitchToSignUp={() => { setSignInOpen(false); setSignUpOpen(true); }}
        onSwitchToSignIn={() => { setSignUpOpen(false); setSignInOpen(true); }}
      />

      <SpinGiftModal isOpen={spinGiftOpen} onClose={() => setSpinGiftOpen(false)} />

      <MobileBottomNav onMenuClick={toggleSidebar} />
    </div>
  );
};

export default Providers;
