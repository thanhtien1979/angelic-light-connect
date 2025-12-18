import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, X } from 'lucide-react';
import { useMeditationReminders } from '@/hooks/useMeditationReminders';

export const GentleMeditationReminder: React.FC = () => {
  const { shouldShowReminder, currentReminder, dismissReminder } = useMeditationReminders();

  return (
    <AnimatePresence>
      {shouldShowReminder && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md"
        >
          <div className="relative p-5 rounded-2xl bg-gradient-to-br from-primary/10 via-card/95 to-secondary/10 border border-primary/20 shadow-xl backdrop-blur-sm">
            {/* Soft glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-primary/5 blur-xl -z-10" />
            
            {/* Close button */}
            <button
              onClick={dismissReminder}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted/50 transition-colors"
              aria-label="Dismiss reminder"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>

            <div className="flex items-start gap-4">
              {/* Breathing icon */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="p-3 rounded-full bg-primary/10 shrink-0"
              >
                <Wind className="w-5 h-5 text-primary" />
              </motion.div>

              <div className="flex-1 pt-0.5">
                <p className="text-foreground/90 text-sm leading-relaxed italic">
                  "{currentReminder}"
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  No response needed — just a gentle whisper.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
