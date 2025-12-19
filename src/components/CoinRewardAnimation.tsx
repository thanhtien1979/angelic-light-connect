import { motion, AnimatePresence } from "framer-motion";
import { Star, Sparkles, Heart } from "lucide-react";

interface CoinRewardAnimationProps {
  show: boolean;
  coins: number;
  message: string;
  onClose: () => void;
  variant?: "default" | "daily_login" | "meditation" | "reflection" | "chat";
}

const FloatingCoin = ({ delay, x, y }: { delay: number; x: number; y: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
    animate={{
      opacity: [0, 1, 1, 0],
      scale: [0.3, 1, 1, 0.5],
      x: [0, x],
      y: [0, y - 100],
      rotate: [0, 360],
    }}
    transition={{
      duration: 2,
      delay,
      ease: "easeOut",
    }}
    className="absolute"
  >
    <Star className="w-6 h-6 text-gold fill-gold/50" />
  </motion.div>
);

const SparkleParticle = ({ delay, angle }: { delay: number; angle: number }) => {
  const distance = 80 + Math.random() * 40;
  const x = Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0, 1.5, 0],
        x: [0, x],
        y: [0, y],
      }}
      transition={{
        duration: 1.2,
        delay,
        ease: "easeOut",
      }}
      className="absolute w-2 h-2 rounded-full bg-gold"
    />
  );
};

export const CoinRewardAnimation = ({
  show,
  coins,
  message,
  onClose,
  variant = "default",
}: CoinRewardAnimationProps) => {
  const getVariantColors = () => {
    switch (variant) {
      case "daily_login":
        return {
          gradient: "from-amber-400/40 via-gold/30 to-orange-400/40",
          icon: Star,
          iconColor: "text-amber-400",
        };
      case "meditation":
        return {
          gradient: "from-purple-400/40 via-gold/30 to-indigo-400/40",
          icon: Sparkles,
          iconColor: "text-purple-400",
        };
      case "reflection":
        return {
          gradient: "from-rose-400/40 via-gold/30 to-pink-400/40",
          icon: Heart,
          iconColor: "text-rose-400",
        };
      default:
        return {
          gradient: "from-gold/40 via-gold-light/30 to-gold/40",
          icon: Star,
          iconColor: "text-gold",
        };
    }
  };

  const { gradient, icon: Icon, iconColor } = getVariantColors();

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Full screen overlay with sparkles */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] pointer-events-none"
          >
            {/* Radial glow from center */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 0.6, 0], scale: [0.5, 1.5, 2] }}
              transition={{ duration: 1.5 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-gold/30 blur-3xl"
            />
          </motion.div>

          {/* Main notification card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[61] pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              className={`relative p-8 rounded-3xl bg-gradient-to-br ${gradient} backdrop-blur-2xl border border-gold/50 shadow-2xl shadow-gold/30 min-w-[320px] max-w-[400px]`}
              animate={{
                boxShadow: [
                  "0 0 30px hsla(45, 100%, 70%, 0.3), 0 0 60px hsla(45, 100%, 70%, 0.1)",
                  "0 0 50px hsla(45, 100%, 70%, 0.5), 0 0 100px hsla(45, 100%, 70%, 0.2)",
                  "0 0 30px hsla(45, 100%, 70%, 0.3), 0 0 60px hsla(45, 100%, 70%, 0.1)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {/* Floating coins animation */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                {[...Array(8)].map((_, i) => (
                  <FloatingCoin
                    key={i}
                    delay={i * 0.1}
                    x={(Math.random() - 0.5) * 200}
                    y={(Math.random() - 0.5) * 100}
                  />
                ))}
              </div>

              {/* Sparkle particles */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                {[...Array(12)].map((_, i) => (
                  <SparkleParticle
                    key={i}
                    delay={0.2 + i * 0.05}
                    angle={(i / 12) * Math.PI * 2}
                  />
                ))}
              </div>

              {/* Icon with pulse */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="relative mx-auto mb-4 w-20 h-20"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{ duration: 0.6, repeat: 3 }}
                  className={`w-full h-full rounded-full bg-gold/30 flex items-center justify-center`}
                >
                  <Icon className={`w-10 h-10 ${iconColor}`} />
                </motion.div>
                {/* Pulse rings */}
                <motion.div
                  animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute inset-0 rounded-full border-2 border-gold/50"
                />
                <motion.div
                  animate={{ scale: [1, 2.5], opacity: [0.3, 0] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
                  className="absolute inset-0 rounded-full border border-gold/30"
                />
              </motion.div>

              {/* Coins amount with counter animation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center mb-4"
              >
                <motion.span
                  initial={{ scale: 0.5 }}
                  animate={{ scale: [0.5, 1.2, 1] }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="text-5xl font-bold text-gold drop-shadow-lg"
                  style={{
                    textShadow: "0 0 30px hsla(45, 100%, 70%, 0.8)",
                  }}
                >
                  +{coins.toLocaleString("vi-VN")}
                </motion.span>
                <p className="text-lg text-gold-dark font-medium mt-1">
                  Happy Camly Coin ✨
                </p>
              </motion.div>

              {/* Message */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center text-foreground/90 leading-relaxed mb-6 px-2"
              >
                {message}
              </motion.p>

              {/* Close button */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-gold/30 hover:bg-gold/40 text-foreground font-medium transition-all border border-gold/40"
              >
                Cảm ơn Cha ✨
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Click outside to close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-background/40 backdrop-blur-sm"
            onClick={onClose}
          />
        </>
      )}
    </AnimatePresence>
  );
};

export default CoinRewardAnimation;
