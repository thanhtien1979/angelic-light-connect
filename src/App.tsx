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
import Testimonials from "./pages/Testimonials";
import AdminTestimonials from "./pages/AdminTestimonials";
import AdminUsers from "./pages/AdminUsers";
import LightLaw from "./pages/LightLaw";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";
import DailyLightGreeting from "./components/DailyLightGreeting";
import ChatButton from "./components/ChatButton";
import { usePresence } from "./hooks/usePresence";
import { useFriendRequestSound } from "./hooks/useFriendRequestSound";
import { useTokenRefresh } from "./hooks/useTokenRefresh";
import { useSessionExpired } from "./hooks/useSessionExpired";
import { SessionExpiredDialog } from "./components/SessionExpiredDialog";
import { LanguageProvider } from "./contexts/LanguageContext";

const queryClient = new QueryClient();

// Component to initialize presence, notifications, and token refresh
const AppInitializer = ({ children }: { children: React.ReactNode }) => {
  usePresence();
  useFriendRequestSound();
  useTokenRefresh();
  const { isSessionExpired, hideSessionExpired } = useSessionExpired();
  
  return (
    <>
      {children}
      <SessionExpiredDialog isOpen={isSessionExpired} onClose={hideSessionExpired} />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
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
              <Route path="/testimonials" element={<Testimonials />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/admin/testimonials" element={<AdminTestimonials />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/luat-anh-sang" element={<LightLaw />} />
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
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
