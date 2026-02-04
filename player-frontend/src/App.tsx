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
import { ProtectedRoute } from "@/components/ProtectedRoute";

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
              {/* Public routes */}
              <Route path="/" element={<Register />} />
              
              {/* Protected routes */}
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/providers" element={<ProtectedRoute><Providers /></ProtectedRoute>} />
              <Route path="/providers/:providerId" element={<ProtectedRoute><ProviderGames /></ProtectedRoute>} />
              <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
              <Route path="/live-casino" element={<ProtectedRoute><LiveCasino /></ProtectedRoute>} />
              <Route path="/promotions" element={<ProtectedRoute><Promotions /></ProtectedRoute>} />
              <Route path="/refer-friend" element={<ProtectedRoute><ReferFriend /></ProtectedRoute>} />
              <Route path="/vip" element={<ProtectedRoute><VIP /></ProtectedRoute>} />
              <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
              <Route path="/prizes" element={<ProtectedRoute><Prizes /></ProtectedRoute>} />
              <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
              <Route path="/hot-games" element={<ProtectedRoute><HotGames /></ProtectedRoute>} />
              <Route path="/slots" element={<ProtectedRoute><Slots /></ProtectedRoute>} />
              <Route path="/crash-games" element={<ProtectedRoute><CrashGames /></ProtectedRoute>} />
              <Route path="/casino" element={<ProtectedRoute><Casino /></ProtectedRoute>} />
              <Route path="/game/:gameId" element={<ProtectedRoute><GameDetail /></ProtectedRoute>} />
              <Route path="/sports" element={<ProtectedRoute><Sports /></ProtectedRoute>} />
              <Route path="/lobby" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/amoe" element={<ProtectedRoute><AMOE /></ProtectedRoute>} />
              <Route path="/neonplay-tv" element={<ProtectedRoute><NeonPlayTV /></ProtectedRoute>} />
              
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
