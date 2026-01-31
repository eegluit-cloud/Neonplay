import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppModeProvider } from "@/contexts/AppModeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { SupportButton } from "@/components/SupportButton";
import { ScrollToTop } from "@/components/ScrollToTop";
import { PageLoadingState } from "@/components/PageLoadingState";

// Eagerly load Register (landing page) for fast initial render
import Register from "./pages/Register";

// Lazy load all other pages for code splitting
const Profile = lazy(() => import("./pages/Profile"));
const Providers = lazy(() => import("./pages/Providers"));
const ProviderGames = lazy(() => import("./pages/ProviderGames"));
const Favorites = lazy(() => import("./pages/Favorites"));
const LiveCasino = lazy(() => import("./pages/LiveCasino"));
const Promotions = lazy(() => import("./pages/Promotions"));
const ReferFriend = lazy(() => import("./pages/ReferFriend"));
const VIP = lazy(() => import("./pages/VIP"));
const LeaderboardPage = lazy(() => import("./pages/LeaderboardPage"));
const Prizes = lazy(() => import("./pages/Prizes"));
const Search = lazy(() => import("./pages/Search"));
const HotGames = lazy(() => import("./pages/HotGames"));
const Slots = lazy(() => import("./pages/Slots"));
const CrashGames = lazy(() => import("./pages/CrashGames"));
const Casino = lazy(() => import("./pages/Casino"));
const GameDetail = lazy(() => import("./pages/GameDetail"));
const Sports = lazy(() => import("./pages/Sports"));
const Index = lazy(() => import("./pages/Index"));
const AMOE = lazy(() => import("./pages/AMOE"));
const NeonPlayTV = lazy(() => import("./pages/NeonPlayTV"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Optimized QueryClient with aggressive caching strategy
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Keep data fresh for 5 minutes
      staleTime: 1000 * 60 * 5,
      // Cache data for 30 minutes
      gcTime: 1000 * 60 * 30,
      // Don't refetch on window focus for better UX
      refetchOnWindowFocus: false,
      // Retry failed requests once
      retry: 1,
      // Don't refetch on mount if data is fresh
      refetchOnMount: false,
      // Don't refetch on reconnect
      refetchOnReconnect: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AppModeProvider>
        <TooltipProvider delayDuration={0}>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<PageLoadingState />}>
            <Routes>
              <Route path="/" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/providers" element={<Providers />} />
              <Route path="/providers/:providerId" element={<ProviderGames />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/live-casino" element={<LiveCasino />} />
              <Route path="/promotions" element={<Promotions />} />
              <Route path="/refer-friend" element={<ReferFriend />} />
              <Route path="/vip" element={<VIP />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/prizes" element={<Prizes />} />
              <Route path="/search" element={<Search />} />
              <Route path="/hot-games" element={<HotGames />} />
              <Route path="/slots" element={<Slots />} />
              <Route path="/crash-games" element={<CrashGames />} />
              <Route path="/casino" element={<Casino />} />
              <Route path="/game/:gameId" element={<GameDetail />} />
              <Route path="/sports" element={<Sports />} />
              <Route path="/lobby" element={<Index />} />
              <Route path="/amoe" element={<AMOE />} />
              <Route path="/neonplay-tv" element={<NeonPlayTV />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
            <SupportButton />
          </BrowserRouter>
        </TooltipProvider>
      </AppModeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
