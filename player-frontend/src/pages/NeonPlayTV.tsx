import { useState, useMemo } from 'react';
import { useSidebar } from '@/hooks/useSidebar';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { MobilePageHeader } from '@/components/MobilePageHeader';
import { Play, Calendar, Clock, Eye, ChevronRight, ChevronLeft, Radio, Loader2 } from 'lucide-react';
import neonplayTvIcon from '@/assets/neonplay-tv-icon.png';
import { useContentVideos, useContentCategories, useLiveVideos } from '@/hooks/useContent';

const NeonPlayTV = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [signInOpen, setSignInOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);
  const [spinGiftOpen, setSpinGiftOpen] = useState(false);
  const [bonusClaimedOpen, setBonusClaimedOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const episodesPerPage = 6;

  // Fetch data from API
  const { categories: apiCategories, isLoading: categoriesLoading } = useContentCategories();
  const { videos: liveVideos } = useLiveVideos();
  const { videos: apiVideos, isLoading: videosLoading } = useContentVideos({
    category: selectedCategory === 'All' ? undefined : selectedCategory.toLowerCase(),
  });

  // Build categories list with 'All' option
  const categories = useMemo(() => {
    const cats = ['All'];
    apiCategories.forEach(c => cats.push(c.name));
    return cats.length > 1 ? cats : ['All', 'News', 'Winners', 'Tips', 'VIP', 'Tournaments', 'Community'];
  }, [apiCategories]);

  // Process videos into episodes format
  const episodes = useMemo(() => {
    return apiVideos.map(video => ({
      id: video.id,
      title: video.title,
      description: video.description || '',
      thumbnail: video.thumbnailUrl || 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=400&h=225&fit=crop',
      duration: formatDuration(video.duration),
      date: video.createdAt,
      views: video.viewCount,
      category: video.category?.name || 'News',
      isLive: video.isLive,
    }));
  }, [apiVideos]);

  // Check if there's a live stream
  const isLiveStreamActive = liveVideos.length > 0;
  const activeLiveStream = liveVideos[0];

  const filteredEpisodes = selectedCategory === 'All'
    ? episodes
    : episodes.filter(ep => ep.category === selectedCategory);

  const totalPages = Math.ceil(filteredEpisodes.length / episodesPerPage);
  const startIndex = (currentPage - 1) * episodesPerPage;
  const paginatedEpisodes = filteredEpisodes.slice(startIndex, startIndex + episodesPerPage);

  const isLoading = categoriesLoading || videosLoading;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const formatViews = (views: number) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  // Helper to format duration from seconds to MM:SS
  function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background">
      <Header 
        onOpenSignIn={() => setSignInOpen(true)} 
        onOpenSignUp={() => setSignUpOpen(true)} 
        onToggleSidebar={toggleSidebar} 
      />
      
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={toggleSidebar} 
        onOpenSpinGift={() => setSpinGiftOpen(true)} 
        onOpenBonusClaimed={() => setBonusClaimedOpen(true)} 
      />
      
      <div className={`transition-all duration-300 pt-14 md:pt-16 pb-20 md:pb-0 ${sidebarOpen ? 'md:ml-56' : 'md:ml-16'}`}>
        <main className="p-3 md:p-4 lg:p-6 space-y-4 md:space-y-6 overflow-x-hidden page-transition-enter max-w-full">
          <MobilePageHeader title="NeonPlay TV" />

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
            </div>
          )}

          {!isLoading && (
            <>
          {/* Hero Section - Live Stream */}
          <div className="relative rounded-xl md:rounded-2xl overflow-hidden bg-gradient-to-br from-rose-950/50 via-card to-card border border-rose-500/20">
            {/* NeonPlay TV Header */}
            <div className="flex items-center gap-2 md:gap-3 p-3 md:p-4 border-b border-border/50">
              <img src={neonplayTvIcon} alt="NeonPlay TV" className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl" />
              <div className="flex-1 min-w-0">
                <h1 className="text-base md:text-xl font-bold text-foreground">NeonPlay TV</h1>
                <p className="text-xs md:text-sm text-muted-foreground truncate">Watch Live & On-Demand</p>
              </div>
              {isLiveStreamActive && (
                <div className="flex items-center gap-1.5 md:gap-2 bg-rose-500/20 text-rose-400 px-2 md:px-3 py-1 md:py-1.5 rounded-full shrink-0">
                  <Radio className="w-3 h-3 md:w-4 md:h-4 animate-pulse" />
                  <span className="text-xs md:text-sm font-semibold">LIVE</span>
                </div>
              )}
            </div>
            
            {/* Video Player Area */}
            <div className="relative aspect-video bg-black/50">
              <div className="absolute inset-0 flex items-center justify-center">
                <img 
                  src="https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200&h=675&fit=crop" 
                  alt="Live Stream" 
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
                
                {/* Play Button */}
                <button className="absolute inset-0 flex items-center justify-center group">
                  <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-rose-500/90 flex items-center justify-center group-hover:bg-rose-500 transition-all group-hover:scale-110 shadow-lg shadow-rose-500/30">
                    <Play className="w-6 h-6 md:w-8 md:h-8 text-white ml-0.5 md:ml-1" fill="white" />
                  </div>
                </button>
                
                {/* Live Badge */}
                {isLiveStreamActive && (
                  <div className="absolute top-2 md:top-4 left-2 md:left-4 flex items-center gap-1.5 md:gap-2">
                    <div className="flex items-center gap-1 md:gap-1.5 bg-rose-500 text-white px-2 md:px-3 py-0.5 md:py-1 rounded text-xs md:text-sm font-bold">
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-white animate-pulse" />
                      LIVE
                    </div>
                    <div className="bg-black/60 backdrop-blur-sm text-white px-2 md:px-3 py-0.5 md:py-1 rounded text-xs md:text-sm">
                      <Eye className="w-3 h-3 md:w-4 md:h-4 inline mr-1" />
                      <span className="hidden sm:inline">2,847 watching</span>
                      <span className="sm:hidden">2.8K</span>
                    </div>
                  </div>
                )}
                
                {/* Stream Info */}
                <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 right-2 md:right-4">
                  <h2 className="text-white text-sm md:text-xl font-bold mb-0.5 md:mb-1 line-clamp-1">
                    {activeLiveStream ? `🔴 ${activeLiveStream.title}` : '🔴 Weekly Tournament - Grand Finals'}
                  </h2>
                  <p className="text-white/70 text-xs md:text-sm line-clamp-1 md:line-clamp-none">
                    {activeLiveStream?.description || 'Watch our top players compete for the championship!'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Categories */}
          <div className="flex gap-1.5 md:gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-3 px-3 md:mx-0 md:px-0">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-rose-500 text-white'
                    : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-rose-500/50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          {/* Episodes Grid */}
          <div>
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h2 className="text-base md:text-lg font-bold text-foreground">Past Episodes</h2>
              <button className="text-rose-400 text-xs md:text-sm font-medium flex items-center gap-0.5 md:gap-1 hover:text-rose-300 transition-colors">
                View All <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
              {paginatedEpisodes.map(episode => (
                <div 
                  key={episode.id}
                  className="group bg-card rounded-lg md:rounded-xl overflow-hidden border border-border hover:border-rose-500/50 transition-all cursor-pointer"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video">
                    <img 
                      src={episode.thumbnail} 
                      alt={episode.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:opacity-0 md:group-hover:opacity-100 transition-opacity" />
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-rose-500/90 flex items-center justify-center">
                        <Play className="w-3.5 h-3.5 md:w-5 md:h-5 text-white ml-0.5" fill="white" />
                      </div>
                    </div>
                    
                    {/* Duration Badge */}
                    <div className="absolute bottom-1.5 md:bottom-2 right-1.5 md:right-2 bg-black/80 text-white text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded">
                      {episode.duration}
                    </div>
                    
                    {/* Category Badge */}
                    <div className="absolute top-1.5 md:top-2 left-1.5 md:left-2 bg-rose-500/90 text-white text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded font-medium">
                      {episode.category}
                    </div>
                  </div>
                  
                  {/* Info */}
                  <div className="p-2 md:p-3">
                    <h3 className="font-semibold text-foreground text-xs md:text-sm line-clamp-2 mb-0.5 md:mb-1 group-hover:text-rose-400 transition-colors">
                      {episode.title}
                    </h3>
                    <p className="text-muted-foreground text-[10px] md:text-xs line-clamp-1 md:line-clamp-2 mb-1.5 md:mb-2 hidden sm:block">
                      {episode.description}
                    </p>
                    <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-xs text-muted-foreground">
                      <span className="flex items-center gap-0.5 md:gap-1">
                        <Eye className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        {formatViews(episode.views)}
                      </span>
                      <span className="flex items-center gap-0.5 md:gap-1 hidden sm:flex">
                        <Calendar className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        {new Date(episode.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-0.5 md:gap-1">
                        <Clock className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        {episode.duration}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 md:gap-2 mt-4 md:mt-6">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-7 h-7 md:w-8 md:h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-rose-500/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-7 h-7 md:w-8 md:h-8 rounded-lg text-xs md:text-sm font-medium transition-all ${
                      currentPage === page
                        ? 'bg-rose-500 text-white'
                        : 'border border-border text-muted-foreground hover:text-foreground hover:border-rose-500/50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-7 h-7 md:w-8 md:h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-rose-500/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
            </>
          )}

          <Footer />
        </main>
      </div>

      <MobileBottomNav onMenuClick={toggleSidebar} />
    </div>
  );
};

export default NeonPlayTV;
