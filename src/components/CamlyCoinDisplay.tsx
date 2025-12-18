import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, TrendingUp, Star } from "lucide-react";
import { useCamlyCoin } from "@/hooks/useCamlyCoin";
import { useAuth } from "@/hooks/useAuth";
import { useBalanceShimmer } from "@/hooks/useBalanceShimmer";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LightBurstAnimation } from "@/components/LightBurstAnimation";
import CoinLightMotes from "./CoinLightMotes";

interface CamlyCoinDisplayProps {
  variant?: "compact" | "full";
  showLifetime?: boolean;
  className?: string;
}

export const CamlyCoinDisplay = ({
  variant = "compact",
  showLifetime = false,
  className = "",
}: CamlyCoinDisplayProps) => {
  const { user } = useAuth();
  const { balance, formatCoins, isLoading } = useCamlyCoin();
  const isShimmering = useBalanceShimmer(balance.total_coins);

  if (!user || isLoading) return null;

  if (variant === "compact") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/30 transition-all ${
                isShimmering ? "animate-coin-shimmer" : ""
              } ${className}`}
              style={isShimmering ? {
                background: "linear-gradient(90deg, transparent 0%, hsla(45, 100%, 70%, 0.4) 50%, transparent 100%)",
                backgroundSize: "200% 100%",
              } : undefined}
            >
              <div className="relative">
                <Star className={`w-4 h-4 transition-colors animate-coin-float ${isShimmering ? "text-yellow-300 fill-yellow-300/30" : "text-gold fill-gold/30"}`} />
                <CoinLightMotes />
                {isShimmering && (
                  <span 
                    className="absolute inset-0 rounded-full border border-gold/40 animate-sacred-glow-ring pointer-events-none"
                    aria-hidden="true"
                  />
                )}
              </div>
              <span className={`text-sm font-medium transition-colors ${isShimmering ? "text-yellow-300" : "text-gold"}`}>
                {formatCoins(balance.total_coins)}
              </span>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-background/95 border-gold/30">
            <div className="text-center">
              <p className="font-medium text-gold">Happy Camly Coin</p>
              <p className="text-xs text-muted-foreground">
                {balance.total_coins.toLocaleString("vi-VN")} coins
              </p>
              {showLifetime && (
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Tổng đã nhận: {balance.lifetime_coins.toLocaleString("vi-VN")}
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-2xl bg-gradient-to-br from-gold/20 via-gold-light/10 to-transparent border border-gold/30 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="relative p-2 rounded-full bg-gold/20">
            <Sparkles className="w-5 h-5 text-gold animate-coin-float" />
            <CoinLightMotes />
            {isShimmering && (
              <span 
                className="absolute inset-0 rounded-full border border-gold/40 animate-sacred-glow-ring pointer-events-none"
                aria-hidden="true"
              />
            )}
          </div>
          <h3 className="font-serif text-lg text-foreground">Happy Camly Coin</h3>
        </div>
        <TrendingUp className="w-5 h-5 text-gold/60" />
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Số dư hiện tại</p>
          <motion.p
            key={balance.total_coins}
            initial={{ scale: 1.1, color: "hsl(45, 100%, 70%)" }}
            animate={{ 
              scale: 1, 
              color: isShimmering ? "hsl(45, 100%, 70%)" : "hsl(var(--foreground))",
              textShadow: isShimmering ? "0 0 20px hsla(45, 100%, 70%, 0.6)" : "none",
            }}
            transition={{ duration: 0.3 }}
            className={`text-3xl font-bold ${isShimmering ? "animate-coin-shimmer" : ""}`}
            style={isShimmering ? {
              background: "linear-gradient(90deg, hsl(var(--foreground)) 0%, hsl(45, 100%, 70%) 50%, hsl(var(--foreground)) 100%)",
              backgroundSize: "200% 100%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            } : undefined}
          >
            {balance.total_coins.toLocaleString("vi-VN")}
            <span className="text-lg ml-1 text-gold">✨</span>
          </motion.p>
        </div>

        {showLifetime && (
          <div className="pt-3 border-t border-gold/20">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tổng đã nhận</span>
              <span className="text-gold font-medium">
                {balance.lifetime_coins.toLocaleString("vi-VN")}
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Animated notification for when coins are awarded
export const CamlyCoinNotification = ({
  show,
  coins,
  message,
  onClose,
}: {
  show: boolean;
  coins: number;
  message: string;
  onClose: () => void;
}) => {
  return (
    <>
      {/* Light burst animation - plays with notification */}
      <LightBurstAnimation show={show} />
      
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 max-w-sm w-full mx-4"
          >
            <motion.div
              className="p-4 rounded-2xl bg-gradient-to-r from-gold/30 via-gold-light/20 to-gold/30 backdrop-blur-xl border border-gold/40 shadow-lg shadow-gold/20"
              animate={{
                boxShadow: [
                  "0 0 20px hsla(45, 100%, 70%, 0.2)",
                  "0 0 40px hsla(45, 100%, 70%, 0.4)",
                  "0 0 20px hsla(45, 100%, 70%, 0.2)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="flex items-start gap-3">
                <motion.div
                  className="p-2 rounded-full bg-gold/30"
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 0.5, repeat: 2 }}
                >
                  <Sparkles className="w-5 h-5 text-gold" />
                </motion.div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-bold text-gold">
                      +{coins.toLocaleString("vi-VN")}
                    </span>
                    <span className="text-sm text-gold-dark">Happy Camly Coin</span>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {message}
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="p-1 rounded-full hover:bg-gold/20 transition-colors"
                >
                  <span className="sr-only">Đóng</span>
                  ×
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
