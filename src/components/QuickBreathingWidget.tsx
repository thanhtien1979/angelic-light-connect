import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, X, Play, Square } from 'lucide-react';

type BreathPhase = 'idle' | 'inhale' | 'exhale' | 'complete';

const INHALE_DURATION = 4; // seconds
const EXHALE_DURATION = 6; // seconds
const TOTAL_CYCLES = 6; // 6 cycles = ~60 seconds

const QuickBreathingWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>('idle');
  const [cycleCount, setCycleCount] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  const startSession = useCallback(() => {
    setIsActive(true);
    setPhase('inhale');
    setCycleCount(0);
  }, []);

  const stopSession = useCallback(() => {
    setIsActive(false);
    setPhase('idle');
    setCycleCount(0);
  }, []);

  // Breathing cycle logic
  useEffect(() => {
    if (!isActive) return;

    if (phase === 'inhale') {
      const timer = setTimeout(() => {
        setPhase('exhale');
      }, INHALE_DURATION * 1000);
      return () => clearTimeout(timer);
    }

    if (phase === 'exhale') {
      const timer = setTimeout(() => {
        const newCount = cycleCount + 1;
        setCycleCount(newCount);
        
        if (newCount >= TOTAL_CYCLES) {
          setPhase('complete');
          setIsActive(false);
        } else {
          setPhase('inhale');
        }
      }, EXHALE_DURATION * 1000);
      return () => clearTimeout(timer);
    }
  }, [isActive, phase, cycleCount]);

  // Reset complete state after viewing
  const handleClose = () => {
    setIsOpen(false);
    if (phase === 'complete') {
      setTimeout(() => setPhase('idle'), 300);
    }
  };

  if (isDismissed) return null;

  return (
    <>
      {/* Floating Widget Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 right-4 z-40 p-3.5 rounded-full bg-gradient-to-br from-primary/80 to-primary shadow-lg shadow-primary/20 border border-primary/30 backdrop-blur-sm"
            aria-label="Open quick breathing session"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Wind className="w-5 h-5 text-primary-foreground" />
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Expanded Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-4 z-50 w-72"
          >
            <div className="relative">
              {/* Soft glow */}
              <div className="absolute inset-0 bg-primary/10 blur-xl rounded-2xl" />
              
              <div className="relative bg-card/95 backdrop-blur-xl rounded-2xl border border-border/40 shadow-xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 pb-2">
                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">One Minute of Breath</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setIsDismissed(true)}
                      className="p-1.5 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Dismiss widget"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 pt-2">
                  {phase === 'complete' ? (
                    // Completion message
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-6"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 15 }}
                        className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center"
                      >
                        <Wind className="w-8 h-8 text-primary" />
                      </motion.div>
                      <p className="text-sm text-foreground/80 italic">
                        One minute of presence has passed.
                      </p>
                      <button
                        onClick={handleClose}
                        className="mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Close
                      </button>
                    </motion.div>
                  ) : (
                    <>
                      {/* Breathing Circle */}
                      <div className="flex flex-col items-center py-4">
                        <div className="relative w-32 h-32 flex items-center justify-center">
                          {/* Outer ring */}
                          <motion.div
                            animate={{
                              scale: phase === 'inhale' ? 1 : phase === 'exhale' ? 0.6 : 0.8,
                              opacity: isActive ? 0.3 : 0.1,
                            }}
                            transition={{
                              duration: phase === 'inhale' ? INHALE_DURATION : phase === 'exhale' ? EXHALE_DURATION : 0.5,
                              ease: 'easeInOut',
                            }}
                            className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 border border-primary/20"
                          />
                          
                          {/* Inner breathing circle */}
                          <motion.div
                            animate={{
                              scale: phase === 'inhale' ? 1 : phase === 'exhale' ? 0.5 : 0.75,
                            }}
                            transition={{
                              duration: phase === 'inhale' ? INHALE_DURATION : phase === 'exhale' ? EXHALE_DURATION : 0.5,
                              ease: 'easeInOut',
                            }}
                            className={`w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20 border border-primary/30 flex items-center justify-center ${isActive ? 'shadow-[0_0_40px_hsl(var(--primary)/0.3)]' : 'shadow-[0_0_20px_hsl(var(--primary)/0.1)]'}`}
                          >
                            <Wind className="w-8 h-8 text-primary/60" />
                          </motion.div>
                        </div>

                        {/* Phase text */}
                        <AnimatePresence mode="wait">
                          <motion.p
                            key={phase}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.3 }}
                            className="mt-4 text-sm text-muted-foreground italic"
                          >
                            {phase === 'idle' && "When you're ready..."}
                            {phase === 'inhale' && 'Inhale...'}
                            {phase === 'exhale' && 'Exhale...'}
                          </motion.p>
                        </AnimatePresence>
                      </div>

                      {/* Controls */}
                      <div className="flex justify-center pt-2">
                        {isActive ? (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={stopSession}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-sm"
                          >
                            <Square className="w-3 h-3" />
                            Stop
                          </motion.button>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={startSession}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-br from-primary/80 to-primary text-primary-foreground shadow-lg shadow-primary/20 text-sm font-medium"
                          >
                            <Play className="w-3.5 h-3.5" />
                            Begin
                          </motion.button>
                        )}
                      </div>

                      {/* Subtle info */}
                      <p className="text-center text-xs text-muted-foreground/60 mt-4">
                        {isActive ? `${cycleCount + 1} of ${TOTAL_CYCLES}` : '1 minute • no tracking'}
                      </p>
                    </>
                  )}
                </div>

                {/* Close panel button */}
                {phase !== 'complete' && (
                  <button
                    onClick={handleClose}
                    className="w-full py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors border-t border-border/20"
                  >
                    Minimize
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default QuickBreathingWidget;