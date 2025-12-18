import { motion, AnimatePresence } from "framer-motion";

interface LightBurstAnimationProps {
  show: boolean;
  onComplete?: () => void;
}

export const LightBurstAnimation = ({ show, onComplete }: LightBurstAnimationProps) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onAnimationComplete={onComplete}
        >
          {/* Central glow */}
          <motion.div
            className="absolute w-32 h-32 rounded-full"
            style={{
              background: "radial-gradient(circle, hsla(45, 100%, 90%, 0.8) 0%, hsla(45, 100%, 70%, 0.4) 40%, transparent 70%)",
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 3, 5],
              opacity: [0, 1, 0],
            }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />

          {/* Secondary warm glow ring */}
          <motion.div
            className="absolute w-40 h-40 rounded-full"
            style={{
              background: "radial-gradient(circle, transparent 30%, hsla(40, 100%, 85%, 0.3) 50%, transparent 70%)",
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 4, 6],
              opacity: [0, 0.8, 0],
            }}
            transition={{ duration: 1.4, ease: "easeOut", delay: 0.1 }}
          />

          {/* Light rays */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-1 origin-left"
              style={{
                width: "200px",
                background: "linear-gradient(90deg, hsla(45, 100%, 85%, 0.6) 0%, transparent 100%)",
                rotate: `${i * 45}deg`,
                borderRadius: "100px",
              }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{
                scaleX: [0, 1, 1.5],
                opacity: [0, 0.7, 0],
              }}
              transition={{
                duration: 1,
                ease: "easeOut",
                delay: 0.1 + i * 0.03,
              }}
            />
          ))}

          {/* Floating particles */}
          {[...Array(12)].map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const radius = 80 + Math.random() * 60;
            return (
              <motion.div
                key={`particle-${i}`}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  background: i % 2 === 0 
                    ? "hsla(45, 100%, 85%, 0.8)" 
                    : "hsla(40, 90%, 80%, 0.7)",
                  boxShadow: "0 0 10px hsla(45, 100%, 85%, 0.6)",
                }}
                initial={{ 
                  x: 0, 
                  y: 0, 
                  scale: 0, 
                  opacity: 0 
                }}
                animate={{
                  x: [0, Math.cos(angle) * radius],
                  y: [0, Math.sin(angle) * radius],
                  scale: [0, 1.5, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 1.2,
                  ease: "easeOut",
                  delay: 0.15 + i * 0.04,
                }}
              />
            );
          })}

          {/* Soft outer halo */}
          <motion.div
            className="absolute w-64 h-64 rounded-full"
            style={{
              background: "radial-gradient(circle, hsla(45, 80%, 95%, 0.15) 0%, transparent 60%)",
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 5, 8],
              opacity: [0, 0.6, 0],
            }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
