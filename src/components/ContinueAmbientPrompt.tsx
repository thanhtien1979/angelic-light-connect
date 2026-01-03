import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSoundSettingsContext } from "@/contexts/SoundSettingsContext";
import { cn } from "@/lib/utils";

interface ContinueAmbientPromptProps {
  isVisible: boolean;
  onContinue: () => void;
  onStop: () => void;
  autoDismissSeconds?: number;
}

const ContinueAmbientPrompt = ({
  isVisible,
  onContinue,
  onStop,
  autoDismissSeconds = 8,
}: ContinueAmbientPromptProps) => {
  const { t } = useLanguage();
  const { prefersReducedMotion } = useSoundSettingsContext();
  const [remainingTime, setRemainingTime] = useState(autoDismissSeconds);

  // Countdown timer for auto-dismiss
  useEffect(() => {
    if (!isVisible) {
      setRemainingTime(autoDismissSeconds);
      return;
    }

    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          // Auto-dismiss with stop (default to silence)
          onStop();
          return autoDismissSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, autoDismissSeconds, onStop]);

  const handleContinue = useCallback(() => {
    onContinue();
  }, [onContinue]);

  const handleStop = useCallback(() => {
    onStop();
  }, [onStop]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ 
            duration: prefersReducedMotion ? 0.1 : 0.3,
            ease: "easeOut"
          }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="relative bg-background/90 backdrop-blur-xl rounded-2xl border border-gold-light/30 shadow-lg shadow-gold/10 p-4 min-w-[280px] max-w-sm">
            {/* Close button */}
            <button
              onClick={handleStop}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted/50 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>

            {/* Header with icon */}
            <div className="flex items-center gap-3 mb-3 pr-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-light/30 to-gold/30 flex items-center justify-center">
                <Volume2 className="w-5 h-5 text-gold" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {t("meditation.continueAmbient") || "Tiếp tục âm thanh nền?"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("meditation.continueAmbientHint") || "Âm thanh sẽ tiếp tục phát trong nền"}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <Button
                onClick={handleContinue}
                size="sm"
                className="flex-1 bg-gradient-to-r from-gold-light to-gold text-white hover:opacity-90 transition-opacity"
              >
                <Volume2 className="w-4 h-4 mr-1.5" />
                {t("meditation.continue") || "Tiếp tục"}
              </Button>
              <Button
                onClick={handleStop}
                variant="outline"
                size="sm"
                className="flex-1 border-gold-light/30 hover:bg-gold-light/10"
              >
                <VolumeX className="w-4 h-4 mr-1.5" />
                {t("meditation.stop") || "Dừng"}
              </Button>
            </div>

            {/* Auto-dismiss countdown */}
            <div className="mt-3 flex items-center justify-center">
              <p className="text-[10px] text-muted-foreground/60">
                {t("meditation.autoDismiss") || "Tự động dừng sau"} {remainingTime}s
              </p>
              {/* Progress bar */}
              <div className="ml-2 w-16 h-1 bg-muted/30 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gold-light/50 rounded-full"
                  initial={{ width: "100%" }}
                  animate={{ width: `${(remainingTime / autoDismissSeconds) * 100}%` }}
                  transition={{ duration: 1, ease: "linear" }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContinueAmbientPrompt;
