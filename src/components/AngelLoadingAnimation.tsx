import { motion } from "framer-motion";
import { useMemo } from "react";

interface AngelLoadingAnimationProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}

const AngelLoadingAnimation = ({ 
  message = "Đang kết nối với ánh sáng thiêng liêng...", 
  size = "md",
  fullScreen = false 
}: AngelLoadingAnimationProps) => {
  // Generate floating feathers
  const feathers = useMemo(() => 
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: -30 + Math.random() * 60,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 2,
      size: 8 + Math.random() * 12,
      rotation: Math.random() * 360,
    })), []
  );

  // Generate sparkle particles
  const sparkles = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      angle: (i / 12) * Math.PI * 2,
      distance: 40 + Math.random() * 30,
      delay: Math.random() * 1.5,
      size: 3 + Math.random() * 4,
    })), []
  );

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const containerClasses = fullScreen
    ? "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    : "flex flex-col items-center justify-center p-8";

  return (
    <div className={containerClasses}>
      <div className="relative flex flex-col items-center">
        {/* Outer glow ring */}
        <motion.div
          className={`absolute ${sizeClasses[size]} rounded-full`}
          style={{
            background: "radial-gradient(circle, hsla(348, 80%, 85%, 0.3) 0%, transparent 70%)",
            filter: "blur(20px)",
          }}
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Angel silhouette container */}
        <motion.div
          className={`relative ${sizeClasses[size]} flex items-center justify-center`}
          animate={{
            y: [0, -15, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Wings - Left */}
          <motion.div
            className="absolute"
            style={{
              left: "-20%",
              top: "30%",
            }}
            animate={{
              rotateY: [0, 20, 0],
              x: [-5, 5, -5],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <svg
              viewBox="0 0 60 80"
              className="w-12 h-16 md:w-16 md:h-20"
              fill="none"
            >
              <path
                d="M55 40 C55 20, 40 5, 20 10 C30 20, 35 35, 30 50 C35 45, 45 42, 55 40Z"
                fill="url(#wingGradientLeft)"
                className="drop-shadow-lg"
              />
              <path
                d="M50 45 C48 30, 38 18, 25 22 C32 28, 36 38, 33 48 C38 46, 45 44, 50 45Z"
                fill="hsla(0, 0%, 100%, 0.6)"
              />
              <defs>
                <linearGradient id="wingGradientLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsla(0, 0%, 100%, 0.95)" />
                  <stop offset="50%" stopColor="hsla(348, 80%, 92%, 0.9)" />
                  <stop offset="100%" stopColor="hsla(340, 70%, 88%, 0.85)" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>

          {/* Wings - Right */}
          <motion.div
            className="absolute"
            style={{
              right: "-20%",
              top: "30%",
              transform: "scaleX(-1)",
            }}
            animate={{
              rotateY: [0, -20, 0],
              x: [5, -5, 5],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <svg
              viewBox="0 0 60 80"
              className="w-12 h-16 md:w-16 md:h-20"
              fill="none"
            >
              <path
                d="M55 40 C55 20, 40 5, 20 10 C30 20, 35 35, 30 50 C35 45, 45 42, 55 40Z"
                fill="url(#wingGradientRight)"
                className="drop-shadow-lg"
              />
              <path
                d="M50 45 C48 30, 38 18, 25 22 C32 28, 36 38, 33 48 C38 46, 45 44, 50 45Z"
                fill="hsla(0, 0%, 100%, 0.6)"
              />
              <defs>
                <linearGradient id="wingGradientRight" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsla(0, 0%, 100%, 0.95)" />
                  <stop offset="50%" stopColor="hsla(348, 80%, 92%, 0.9)" />
                  <stop offset="100%" stopColor="hsla(340, 70%, 88%, 0.85)" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>

          {/* Angel body/core */}
          <motion.div
            className="relative z-10 w-10 h-14 md:w-12 md:h-16"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* Halo */}
            <motion.div
              className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-3 rounded-full border-2"
              style={{
                borderColor: "hsla(45, 100%, 80%, 0.8)",
                boxShadow: "0 0 15px hsla(45, 100%, 75%, 0.6), inset 0 0 8px hsla(45, 100%, 80%, 0.4)",
              }}
              animate={{
                opacity: [0.7, 1, 0.7],
                boxShadow: [
                  "0 0 15px hsla(45, 100%, 75%, 0.6), inset 0 0 8px hsla(45, 100%, 80%, 0.4)",
                  "0 0 25px hsla(45, 100%, 75%, 0.8), inset 0 0 12px hsla(45, 100%, 80%, 0.6)",
                  "0 0 15px hsla(45, 100%, 75%, 0.6), inset 0 0 8px hsla(45, 100%, 80%, 0.4)",
                ],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Head */}
            <div
              className="absolute top-1 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full"
              style={{
                background: "radial-gradient(circle at 30% 30%, hsla(0, 0%, 100%, 0.95), hsla(348, 60%, 92%, 0.9))",
                boxShadow: "0 2px 10px hsla(348, 80%, 80%, 0.3)",
              }}
            />

            {/* Body/Robe */}
            <div
              className="absolute top-5 left-1/2 -translate-x-1/2 w-6 h-10 rounded-t-full rounded-b-3xl"
              style={{
                background: "linear-gradient(180deg, hsla(0, 0%, 100%, 0.95) 0%, hsla(348, 70%, 95%, 0.9) 50%, hsla(340, 60%, 90%, 0.85) 100%)",
                boxShadow: "0 4px 15px hsla(348, 80%, 80%, 0.25)",
              }}
            />
          </motion.div>

          {/* Floating feathers */}
          {feathers.map((feather) => (
            <motion.div
              key={feather.id}
              className="absolute"
              style={{
                width: feather.size,
                height: feather.size * 2,
              }}
              initial={{
                x: 0,
                y: 0,
                rotate: feather.rotation,
                opacity: 0,
              }}
              animate={{
                x: [0, feather.x, feather.x * 1.5],
                y: [0, 30, 60],
                rotate: [feather.rotation, feather.rotation + 180, feather.rotation + 360],
                opacity: [0, 0.7, 0],
              }}
              transition={{
                duration: feather.duration,
                delay: feather.delay,
                repeat: Infinity,
                ease: "easeOut",
              }}
            >
              <svg viewBox="0 0 20 40" fill="none" className="w-full h-full">
                <path
                  d="M10 0 C15 10, 18 20, 15 35 C12 38, 8 38, 5 35 C2 20, 5 10, 10 0Z"
                  fill="url(#featherGradient)"
                />
                <defs>
                  <linearGradient id="featherGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="hsla(0, 0%, 100%, 0.9)" />
                    <stop offset="100%" stopColor="hsla(348, 70%, 90%, 0.7)" />
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>
          ))}

          {/* Sparkle particles */}
          {sparkles.map((sparkle) => (
            <motion.div
              key={sparkle.id}
              className="absolute rounded-full"
              style={{
                width: sparkle.size,
                height: sparkle.size,
                background: "radial-gradient(circle, hsla(45, 100%, 90%, 1) 0%, hsla(348, 80%, 85%, 0.8) 100%)",
                boxShadow: "0 0 6px hsla(45, 100%, 80%, 0.8)",
              }}
              animate={{
                x: [0, Math.cos(sparkle.angle) * sparkle.distance],
                y: [0, Math.sin(sparkle.angle) * sparkle.distance],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                delay: sparkle.delay,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          ))}
        </motion.div>

        {/* Loading text */}
        <motion.p
          className="mt-8 text-center font-serif text-lg text-foreground/80"
          animate={{
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {message}
        </motion.p>

        {/* Loading dots */}
        <div className="flex gap-1.5 mt-3">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-primary/60"
              animate={{
                y: [0, -8, 0],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1,
                delay: i * 0.15,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AngelLoadingAnimation;
