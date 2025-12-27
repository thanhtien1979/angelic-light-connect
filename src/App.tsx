import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Privacy from "./pages/Privacy";
import Community from "./pages/Community";
import CreativeStudio from "./pages/CreativeStudio";
import Credits from "./pages/Credits";
import Friends from "./pages/Friends";
import UserProfile from "./pages/UserProfile";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";
import DailyLightGreeting from "./components/DailyLightGreeting";
import ChatButton from "./components/ChatButton";
import { usePresence } from "./hooks/usePresence";
import { useFriendRequestSound } from "./hooks/useFriendRequestSound";

const queryClient = new QueryClient();

// Component to initialize presence and notifications
const AppInitializer = ({ children }: { children: React.ReactNode }) => {
  usePresence();
  useFriendRequestSound();
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppInitializer>
          <DailyLightGreeting />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/community" element={<Community />} />
            <Route path="/user/:userId" element={<UserProfile />} />
            <Route path="/studio" element={<CreativeStudio />} />
            <Route path="/credits" element={<Credits />} />
            <Route path="/friends" element={<Friends />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/privacy"
              element={
                <ProtectedRoute>
                  <Privacy />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ChatButton />
        </AppInitializer>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
