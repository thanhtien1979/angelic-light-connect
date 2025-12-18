import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wind, X } from "lucide-react";

interface BreathingExerciseProps {
  onComplete: () => void;
  onSkip: () => void;
  visible: boolean;
}

// Breathing phases with timing
const INHALE_DURATION = 4; // seconds
const EXHALE_DURATION = 6; // seconds
const TOTAL_DURATION = 45; // seconds for full exercise

type BreathingPhase = "inhale" | "exhale";

// Gentle guidance messages in Vietnamese
const guidanceMessages: Record<BreathingPhase, string[]> = {
  inhale: [
    "Hít vào nhẹ nhàng...",
    "Đón nhận ánh sáng...",
    "Cho phép bình an đến...",
  ],
  exhale: [
    "Thở ra thật chậm...",
    "Buông bỏ căng thẳng...",
    "Để lo âu tan biến...",
  ],
};

const BreathingExercise = ({ onComplete, onSkip, visible }: BreathingExerciseProps) => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathingPhase>("inhale");
  const [timeRemaining, setTimeRemaining] = useState(TOTAL_DURATION);
  const [guidanceIndex, setGuidanceIndex] = useState(0);

  // Handle breathing cycle
  useEffect(() => {
    if (!isActive) return;

    const cycleDuration = (INHALE_DURATION + EXHALE_DURATION) * 1000;
    
    // Phase switching
    const phaseInterval = setInterval(() => {
      setPhase((current) => {
        const nextPhase = current === "inhale" ? "exhale" : "inhale";
        // Change guidance message occasionally
        if (nextPhase === "inhale") {
          setGuidanceIndex((i) => (i + 1) % guidanceMessages.inhale.length);
        }
        return nextPhase;
      });
    }, phase === "inhale" ? INHALE_DURATION * 1000 : EXHALE_DURATION * 1000);

    return () => clearInterval(phaseInterval);
  }, [isActive, phase]);

  // Timer countdown
  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTimeRemaining((t) => {
        if (t <= 1) {
          setIsActive(false);
          onComplete();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, onComplete]);

  const handleBegin = useCallback(() => {
    setIsActive(true);
    setTimeRemaining(TOTAL_DURATION);
    setPhase("inhale");
    setGuidanceIndex(0);
  }, []);

  const handleSkip = useCallback(() => {
    setIsActive(false);
    onSkip();
  }, [onSkip]);

  const currentGuidance = guidanceMessages[phase][guidanceIndex];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-6 my-4"
        >
          <div 
            className="relative p-6 rounded-3xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, hsla(270, 40%, 95%, 0.98), hsla(348, 50%, 96%, 0.98))",
              border: "1px solid hsla(270, 30%, 85%, 0.5)",
              boxShadow: "0 10px 40px hsla(270, 40%, 80%, 0.2), inset 0 0 30px hsla(0, 0%, 100%, 0.5)",
            }}
          >
            {/* Close button */}
            {!isActive && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleSkip}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/50 transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </motion.button>
            )}

            {/* Offer state - before exercise begins */}
            {!isActive && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Wind className="w-5 h-5 text-primary/70" />
                  <span className="text-sm font-medium text-primary/80">
                    Angel AI cảm nhận bạn cần thư giãn
                  </span>
                </div>
                
                <p className="text-foreground/80 text-sm mb-6 max-w-xs mx-auto leading-relaxed">
                  Hãy để thiên thần hướng dẫn bạn hít thở nhẹ nhàng, giúp tâm hồn bình an trở lại.
                </p>

                <div className="flex items-center justify-center gap-3">
                  <motion.button
                    onClick={handleBegin}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-6 py-2.5 rounded-full text-sm font-medium transition-all"
                    style={{
                      background: "linear-gradient(135deg, hsla(348, 70%, 80%, 0.9), hsla(340, 65%, 85%, 0.95))",
                      color: "hsl(4, 42%, 35%)",
                      boxShadow: "0 4px 20px hsla(348, 70%, 80%, 0.3)",
                    }}
                  >
                    Bắt đầu
                  </motion.button>
                  <motion.button
                    onClick={handleSkip}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-5 py-2.5 rounded-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Để sau
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Active breathing exercise */}
            {isActive && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center"
              >
                {/* Breathing circle */}
                <div className="relative w-40 h-40 mb-6">
                  {/* Outer glow ring */}
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: "radial-gradient(circle, hsla(348, 60%, 85%, 0.4), transparent 70%)",
                    }}
                    animate={{
                      scale: phase === "inhale" ? [1, 1.3] : [1.3, 1],
                      opacity: phase === "inhale" ? [0.3, 0.6] : [0.6, 0.3],
                    }}
                    transition={{
                      duration: phase === "inhale" ? INHALE_DURATION : EXHALE_DURATION,
                      ease: "easeInOut",
                    }}
                  />

                  {/* Main breathing circle */}
                  <motion.div
                    className="absolute inset-4 rounded-full flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, hsla(348, 70%, 88%, 0.9), hsla(270, 40%, 92%, 0.9))",
                      boxShadow: "0 0 40px hsla(348, 60%, 80%, 0.4), inset 0 0 20px hsla(0, 0%, 100%, 0.6)",
                    }}
                    animate={{
                      scale: phase === "inhale" ? [0.85, 1] : [1, 0.85],
                    }}
                    transition={{
                      duration: phase === "inhale" ? INHALE_DURATION : EXHALE_DURATION,
                      ease: "easeInOut",
                    }}
                  >
                    {/* Phase indicator text */}
                    <motion.span
                      key={phase}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="font-serif text-lg text-foreground/80"
                    >
                      {phase === "inhale" ? "Hít vào" : "Thở ra"}
                    </motion.span>
                  </motion.div>

                  {/* Soft pulse rings */}
                  <motion.div
                    className="absolute inset-2 rounded-full border border-rose-soft/30"
                    animate={{
                      scale: phase === "inhale" ? [0.9, 1.1] : [1.1, 0.9],
                      opacity: [0.5, 0.2],
                    }}
                    transition={{
                      duration: phase === "inhale" ? INHALE_DURATION : EXHALE_DURATION,
                      ease: "easeInOut",
                    }}
                  />
                </div>

                {/* Guidance text */}
                <motion.p
                  key={`${phase}-${guidanceIndex}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-foreground/70 text-sm font-serif italic mb-4"
                >
                  {currentGuidance}
                </motion.p>

                {/* Timer */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
                  <span>Còn lại: {timeRemaining}s</span>
                </div>

                {/* Early exit */}
                <motion.button
                  onClick={() => {
                    setIsActive(false);
                    onComplete();
                  }}
                  className="mt-4 text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                >
                  Hoàn thành sớm
                </motion.button>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BreathingExercise;
