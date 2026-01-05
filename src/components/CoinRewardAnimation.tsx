import { motion, AnimatePresence } from "framer-motion";
import { Star, Sparkles, Heart, Zap } from "lucide-react";

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

// Electric spark component for the border
const ElectricSpark = ({ position, delay }: { position: number; delay: number }) => {
  return (
    <motion.div
      className="absolute"
      style={{
        left: `${position}%`,
        top: position < 25 || position >= 75 ? (position < 25 ? "0%" : "100%") : `${((position - 25) / 50) * 100}%`,
        transform: "translate(-50%, -50%)",
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [0.5, 1.2, 0.8, 0],
      }}
      transition={{
        duration: 0.8,
        delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 2,
      }}
    >
      <Zap className="w-3 h-3 text-gold fill-gold drop-shadow-[0_0_8px_hsl(45,100%,70%)]" />
    </motion.div>
  );
};

// Glowing border segment
const GlowingBorderSegment = ({ side, delay }: { side: "top" | "right" | "bottom" | "left"; delay: number }) => {
  const getPosition = () => {
    switch (side) {
      case "top":
        return { top: 0, left: 0, right: 0, height: "3px" };
      case "right":
        return { top: 0, right: 0, bottom: 0, width: "3px" };
      case "bottom":
        return { bottom: 0, left: 0, right: 0, height: "3px" };
      case "left":
        return { top: 0, left: 0, bottom: 0, width: "3px" };
    }
  };

  const isHorizontal = side === "top" || side === "bottom";

  return (
    <motion.div
      className="absolute overflow-hidden rounded-full"
      style={getPosition()}
    >
      <motion.div
        className={`absolute ${isHorizontal ? "h-full w-1/3" : "w-full h-1/3"} bg-gradient-to-r from-transparent via-gold to-transparent`}
        style={{
          boxShadow: "0 0 20px 5px hsl(45, 100%, 70%), 0 0 40px 10px hsl(45, 100%, 60%)",
        }}
        animate={{
          [isHorizontal ? "left" : "top"]: isHorizontal 
            ? ["-33%", "133%"] 
            : ["-33%", "133%"],
        }}
        transition={{
          duration: 1.5,
          delay,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </motion.div>
  );
};

// Corner glow effect
const CornerGlow = ({ corner, delay }: { corner: "tl" | "tr" | "bl" | "br"; delay: number }) => {
  const getPosition = () => {
    switch (corner) {
      case "tl":
        return { top: -4, left: -4 };
      case "tr":
        return { top: -4, right: -4 };
      case "bl":
        return { bottom: -4, left: -4 };
      case "br":
        return { bottom: -4, right: -4 };
    }
  };

  return (
    <motion.div
      className="absolute w-8 h-8 rounded-full"
      style={{
        ...getPosition(),
        background: "radial-gradient(circle, hsl(45, 100%, 70%) 0%, transparent 70%)",
      }}
      animate={{
        scale: [1, 1.5, 1],
        opacity: [0.6, 1, 0.6],
      }}
      transition={{
        duration: 1.2,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
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
          borderGlow: "hsl(45, 100%, 60%)",
          icon: Star,
          iconColor: "text-amber-400",
        };
      case "meditation":
        return {
          gradient: "from-purple-400/40 via-gold/30 to-indigo-400/40",
          borderGlow: "hsl(270, 70%, 60%)",
          icon: Sparkles,
          iconColor: "text-purple-400",
        };
      case "reflection":
        return {
          gradient: "from-rose-400/40 via-gold/30 to-pink-400/40",
          borderGlow: "hsl(350, 70%, 60%)",
          icon: Heart,
          iconColor: "text-rose-400",
        };
      default:
        return {
          gradient: "from-gold/40 via-gold-light/30 to-gold/40",
          borderGlow: "hsl(45, 100%, 70%)",
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
            
            {/* Additional light rays */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute top-1/2 left-1/2 w-1 h-[300px] bg-gradient-to-t from-gold/0 via-gold/40 to-gold/0"
                style={{
                  transformOrigin: "center top",
                  rotate: `${i * 45}deg`,
                }}
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ 
                  opacity: [0, 0.8, 0],
                  scaleY: [0, 1, 0],
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.05,
                }}
              />
            ))}
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
            {/* Outer glow frame */}
            <motion.div
              className="absolute -inset-2 rounded-[2rem] opacity-80"
              style={{
                background: "linear-gradient(135deg, hsl(45, 100%, 70%) 0%, hsl(35, 100%, 60%) 50%, hsl(45, 100%, 70%) 100%)",
                filter: "blur(15px)",
              }}
              animate={{
                opacity: [0.5, 0.8, 0.5],
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Electric border frame */}
            <div className="absolute -inset-1 rounded-[1.75rem] overflow-visible">
              {/* Animated glowing borders */}
              <GlowingBorderSegment side="top" delay={0} />
              <GlowingBorderSegment side="right" delay={0.4} />
              <GlowingBorderSegment side="bottom" delay={0.8} />
              <GlowingBorderSegment side="left" delay={1.2} />
              
              {/* Corner glows */}
              <CornerGlow corner="tl" delay={0} />
              <CornerGlow corner="tr" delay={0.3} />
              <CornerGlow corner="br" delay={0.6} />
              <CornerGlow corner="bl" delay={0.9} />
              
              {/* Electric sparks around the frame */}
              {[...Array(16)].map((_, i) => (
                <ElectricSpark 
                  key={i} 
                  position={(i / 16) * 100} 
                  delay={i * 0.15} 
                />
              ))}
            </div>

            <motion.div
              className={`relative p-8 rounded-3xl bg-gradient-to-br ${gradient} backdrop-blur-2xl border-2 border-gold/60 shadow-2xl min-w-[320px] max-w-[400px]`}
              style={{
                boxShadow: `
                  0 0 30px hsla(45, 100%, 70%, 0.4),
                  0 0 60px hsla(45, 100%, 70%, 0.2),
                  inset 0 0 30px hsla(45, 100%, 70%, 0.1)
                `,
              }}
              animate={{
                boxShadow: [
                  "0 0 30px hsla(45, 100%, 70%, 0.4), 0 0 60px hsla(45, 100%, 70%, 0.2), inset 0 0 30px hsla(45, 100%, 70%, 0.1)",
                  "0 0 50px hsla(45, 100%, 70%, 0.6), 0 0 100px hsla(45, 100%, 70%, 0.3), inset 0 0 40px hsla(45, 100%, 70%, 0.2)",
                  "0 0 30px hsla(45, 100%, 70%, 0.4), 0 0 60px hsla(45, 100%, 70%, 0.2), inset 0 0 30px hsla(45, 100%, 70%, 0.1)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {/* Inner shimmer effect */}
              <motion.div
                className="absolute inset-0 rounded-3xl overflow-hidden"
                style={{ pointerEvents: "none" }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  style={{ transform: "skewX(-20deg)" }}
                  animate={{
                    x: ["-200%", "200%"],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 2,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>

              {/* Floating coins animation */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                {[...Array(12)].map((_, i) => (
                  <FloatingCoin
                    key={i}
                    delay={i * 0.08}
                    x={(Math.random() - 0.5) * 250}
                    y={(Math.random() - 0.5) * 150}
                  />
                ))}
              </div>

              {/* Sparkle particles */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                {[...Array(16)].map((_, i) => (
                  <SparkleParticle
                    key={i}
                    delay={0.2 + i * 0.04}
                    angle={(i / 16) * Math.PI * 2}
                  />
                ))}
              </div>

              {/* Icon with enhanced pulse */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="relative mx-auto mb-4 w-24 h-24"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.15, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{ duration: 0.8, repeat: 3 }}
                  className="w-full h-full rounded-full bg-gradient-to-br from-gold/40 to-gold/20 flex items-center justify-center border-2 border-gold/50"
                  style={{
                    boxShadow: "0 0 30px hsla(45, 100%, 70%, 0.5), inset 0 0 20px hsla(45, 100%, 70%, 0.2)",
                  }}
                >
                  <Icon className={`w-12 h-12 ${iconColor} drop-shadow-lg`} />
                </motion.div>
                
                {/* Pulse rings with electric effect */}
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
                    className="absolute inset-0 rounded-full border-2 border-gold/60"
                    style={{
                      boxShadow: "0 0 10px hsla(45, 100%, 70%, 0.5)",
                    }}
                  />
                ))}
              </motion.div>

              {/* Coins amount with enhanced counter animation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center mb-4 relative"
              >
                <motion.div
                  className="absolute inset-0 bg-gold/10 rounded-xl blur-xl"
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <motion.span
                  initial={{ scale: 0.5 }}
                  animate={{ scale: [0.5, 1.3, 1] }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="relative text-6xl font-bold text-gold drop-shadow-lg block"
                  style={{
                    textShadow: "0 0 40px hsla(45, 100%, 70%, 0.9), 0 0 80px hsla(45, 100%, 60%, 0.5)",
                  }}
                >
                  +{coins.toLocaleString("vi-VN")}
                </motion.span>
                <motion.p 
                  className="text-xl text-gold-dark font-semibold mt-2 flex items-center justify-center gap-2"
                  animate={{
                    textShadow: [
                      "0 0 10px hsla(45, 100%, 70%, 0.5)",
                      "0 0 20px hsla(45, 100%, 70%, 0.8)",
                      "0 0 10px hsla(45, 100%, 70%, 0.5)",
                    ],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Sparkles className="w-5 h-5" />
                  Happy Camly Coin
                  <Sparkles className="w-5 h-5" />
                </motion.p>
              </motion.div>

              {/* Message with glow */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center text-foreground/90 leading-relaxed mb-6 px-2 text-lg font-medium"
              >
                {message}
              </motion.p>

              {/* Enhanced close button */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px hsla(45, 100%, 70%, 0.6)" }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-gold/30 via-gold/40 to-gold/30 hover:from-gold/40 hover:via-gold/50 hover:to-gold/40 text-foreground font-semibold text-lg transition-all border-2 border-gold/50"
                style={{
                  boxShadow: "0 0 20px hsla(45, 100%, 70%, 0.3), inset 0 0 10px hsla(45, 100%, 70%, 0.1)",
                }}
              >
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-gold" />
                  Cảm ơn Cha
                  <Sparkles className="w-5 h-5 text-gold" />
                </span>
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Click outside to close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-background/50 backdrop-blur-md"
            onClick={onClose}
          />
        </>
      )}
    </AnimatePresence>
  );
};

export default CoinRewardAnimation;
