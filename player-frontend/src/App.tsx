import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppModeProvider } from "@/contexts/AppModeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { SupportButton } from "@/components/SupportButton";
import { ScrollToTop } from "@/components/ScrollToTop";
import { PageLoadingState } from "@/components/PageLoadingState";
import { ErrorBoundary } from "@/components/ErrorBoundary";
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
const NotFound = lazy(() => import("./pages/NotFound"));
const GameShows = lazy(() => import("./pages/GameShows"));
const TableGames = lazy(() => import("./pages/TableGames"));
const Blackjack = lazy(() => import("./pages/Blackjack"));
const Roulette = lazy(() => import("./pages/Roulette"));
const NewReleases = lazy(() => import("./pages/NewReleases"));
const BurstGames = lazy(() => import("./pages/BurstGames"));
const Featured = lazy(() => import("./pages/Featured"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const ResponsibleGambling = lazy(() => import("./pages/ResponsibleGambling"));
const FAQPage = lazy(() => import("./pages/FAQ"));
const ProvablyFair = lazy(() => import("./pages/ProvablyFair"));

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
      <SocketProvider>
      <AppModeProvider>
        <TooltipProvider delayDuration={0}>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <ScrollToTop />
          <ErrorBoundary>
          <Suspense fallback={<PageLoadingState />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Register />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/responsible-gambling" element={<ResponsibleGambling />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/provably-fair" element={<ProvablyFair />} />

              {/* Protected routes - require authentication */}
              <Route path="/lobby" element={<ProtectedRoute><Index /></ProtectedRoute>} />
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
              <Route path="/amoe" element={<ProtectedRoute><AMOE /></ProtectedRoute>} />
              <Route path="/game-shows" element={<ProtectedRoute><GameShows /></ProtectedRoute>} />
              <Route path="/table-games" element={<ProtectedRoute><TableGames /></ProtectedRoute>} />
              <Route path="/blackjack" element={<ProtectedRoute><Blackjack /></ProtectedRoute>} />
              <Route path="/roulette" element={<ProtectedRoute><Roulette /></ProtectedRoute>} />
              <Route path="/new-releases" element={<ProtectedRoute><NewReleases /></ProtectedRoute>} />
              <Route path="/burst-games" element={<ProtectedRoute><BurstGames /></ProtectedRoute>} />
              <Route path="/featured" element={<ProtectedRoute><Featured /></ProtectedRoute>} />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          </ErrorBoundary>
            <SupportButton />
          </BrowserRouter>
        </TooltipProvider>
      </AppModeProvider>
      </SocketProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
