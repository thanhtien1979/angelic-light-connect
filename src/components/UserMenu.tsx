import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, MessageSquare, Sparkles, Settings, Moon, Sun, Monitor } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDailyGreeting } from "@/hooks/useDailyGreeting";
import { useTheme } from "next-themes";
import { Link } from "react-router-dom";

interface UserMenuProps {
  onOpenAuth: () => void;
}

const UserMenu = ({ onOpenAuth }: UserMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, signOut, isLoading } = useAuth();
  const { hasNewGreeting, markGreetingSeen } = useDailyGreeting();
  const { theme, setTheme } = useTheme();

  const handleProfileClick = () => {
    markGreetingSeen();
    setIsOpen(false);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case "dark":
        return <Moon className="w-5 h-5 text-violet-500" />;
      case "light":
        return <Sun className="w-5 h-5 text-amber-500" />;
      default:
        return <Monitor className="w-5 h-5 text-gold" />;
    }
  };

  const getNextTheme = () => {
    switch (theme) {
      case "light":
        return "dark";
      case "dark":
        return "system";
      default:
        return "light";
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case "dark":
        return "Chế độ tối";
      case "light":
        return "Chế độ sáng";
      default:
        return "Theo hệ thống";
    }
  };

  if (isLoading) {
    return (
      <div className="w-10 h-10 rounded-full bg-white/60 animate-pulse" />
    );
  }

  if (!isAuthenticated) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onOpenAuth}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-gold to-gold-light text-white text-sm font-medium"
        style={{
          boxShadow: "0 0 15px hsla(45, 100%, 70%, 0.3)",
        }}
      >
        <Sparkles className="w-4 h-4" />
        <span className="hidden sm:inline">Đăng Nhập</span>
      </motion.button>
    );
  }

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center text-white"
        style={{
          boxShadow: "0 0 15px hsla(45, 100%, 70%, 0.3)",
        }}
      >
        <User className="w-5 h-5" />
        
        {/* Gentle greeting indicator */}
        {hasNewGreeting && (
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: [0.6, 1, 0.6],
              scale: [1, 1.1, 1],
            }}
            transition={{ 
              duration: 2.5, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-gradient-to-br from-gold via-rose-300 to-gold-light"
            style={{
              boxShadow: "0 0 8px hsla(45, 100%, 70%, 0.6), 0 0 16px hsla(348, 80%, 75%, 0.3)",
            }}
          />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-64 bg-card/95 backdrop-blur-xl rounded-2xl border border-border/30 shadow-xl overflow-hidden z-50"
            >
              <div className="p-4 border-b border-border/20">
                <p className="text-sm text-muted-foreground">Đã đăng nhập với</p>
                <p className="text-foreground font-medium truncate">{user?.email}</p>
              </div>

              <div className="p-2">
                <Link
                  to="/profile"
                  onClick={handleProfileClick}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <Settings className="w-5 h-5 text-gold" />
                  <span className="text-foreground">Hồ sơ của tôi</span>
                  {hasNewGreeting && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-gradient-to-br from-gold to-rose-300" />
                  )}
                </Link>

                <button
                  onClick={() => {
                    document.getElementById("chat")?.scrollIntoView({ behavior: "smooth" });
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted/50 transition-colors text-left"
                >
                  <MessageSquare className="w-5 h-5 text-gold" />
                  <span className="text-foreground">Chat của tôi</span>
                </button>

                <button
                  onClick={() => setTheme(getNextTheme())}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted/50 transition-colors text-left"
                >
                  {getThemeIcon()}
                  <span className="text-foreground">{getThemeLabel()}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    Nhấn để đổi
                  </span>
                </button>

                <button
                  onClick={() => {
                    signOut();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-destructive/10 transition-colors text-left"
                >
                  <LogOut className="w-5 h-5 text-destructive" />
                  <span className="text-destructive">Đăng xuất</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;
