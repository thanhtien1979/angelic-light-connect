import { motion } from "framer-motion";

const AuroraBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Primary aurora wave */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% 30%, hsla(348, 80%, 85%, 0.2) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 70%, hsla(340, 70%, 88%, 0.18) 0%, transparent 45%),
            radial-gradient(ellipse 70% 60% at 50% 50%, hsla(320, 60%, 90%, 0.12) 0%, transparent 50%)
          `,
        }}
        animate={{
          opacity: [0.6, 0.9, 0.6],
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Secondary flowing aurora */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(
              135deg,
              hsla(348, 75%, 88%, 0.15) 0%,
              transparent 30%,
              hsla(340, 65%, 85%, 0.12) 50%,
              transparent 70%,
              hsla(320, 55%, 90%, 0.1) 100%
            )
          `,
          backgroundSize: "200% 200%",
        }}
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Floating light orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full"
        style={{
          background: "radial-gradient(circle, hsla(348, 80%, 90%, 0.2) 0%, transparent 60%)",
          filter: "blur(40px)",
        }}
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full"
        style={{
          background: "radial-gradient(circle, hsla(340, 70%, 88%, 0.18) 0%, transparent 55%)",
          filter: "blur(50px)",
        }}
        animate={{
          x: [0, -40, 0],
          y: [0, 40, 0],
          scale: [1, 1.15, 1],
          opacity: [0.25, 0.4, 0.25],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      <motion.div
        className="absolute top-1/2 right-1/3 w-48 h-48 rounded-full"
        style={{
          background: "radial-gradient(circle, hsla(320, 60%, 92%, 0.15) 0%, transparent 60%)",
          filter: "blur(35px)",
        }}
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -20, 30, 0],
          scale: [0.9, 1.1, 0.95, 0.9],
          opacity: [0.2, 0.35, 0.25, 0.2],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
      />
    </div>
  );
};

export default AuroraBackground;
