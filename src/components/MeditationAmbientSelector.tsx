import { useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Waves, TreePine, CloudRain, Volume2, VolumeX, Info, Clock } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useAmbientSound, AmbientSoundType, getJourneyAmbientSound } from "@/hooks/useAmbientSound";
import { useSoundSettingsContext } from "@/contexts/SoundSettingsContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface MeditationAmbientSelectorProps {
  className?: string;
  compact?: boolean;
  journeyId?: string; // The meditation journey/playlist ID for per-journey persistence
}

// Simplified sounds for meditation context
const MEDITATION_AMBIENT_SOUNDS = [
  { 
    id: "rain" as AmbientSoundType, 
    icon: CloudRain, 
    nameKey: "sound.rain",
    gradient: "from-blue-400 to-sky-500"
  },
  { 
    id: "ocean" as AmbientSoundType, 
    icon: Waves, 
    nameKey: "sound.ocean",
    gradient: "from-cyan-400 to-blue-500"
  },
  { 
    id: "forest" as AmbientSoundType, 
    icon: TreePine, 
    nameKey: "sound.forest",
    gradient: "from-green-400 to-emerald-500"
  },
];

const MeditationAmbientSelector = ({ 
  className, 
  compact = false, 
  journeyId 
}: MeditationAmbientSelectorProps) => {
  const { t } = useLanguage();
  const { settings, isSoundAllowed, prefersReducedMotion } = useSoundSettingsContext();
  const {
    isPlaying,
    isLoading,
    selectedSound,
    setSelectedSound,
    volume,
    setVolume,
    playSound,
    stopSound,
  } = useAmbientSound();

  const isAmbientAllowed = isSoundAllowed("ambientSounds");

  // Get the saved sound for this journey (for "recently used" indicator)
  const journeySavedSound = useMemo(() => {
    if (!journeyId) return null;
    return getJourneyAmbientSound(journeyId);
  }, [journeyId]);

  // When journeyId changes, preselect the saved sound for that journey (without playing)
  useEffect(() => {
    if (journeyId && isAmbientAllowed) {
      const savedSound = getJourneyAmbientSound(journeyId);
      if (savedSound) {
        setSelectedSound(savedSound);
      }
    }
  }, [journeyId, isAmbientAllowed, setSelectedSound]);

  const handleSoundSelect = useCallback((soundId: AmbientSoundType) => {
    if (!isAmbientAllowed) return;

    if (selectedSound === soundId && isPlaying) {
      // Toggle off if clicking the same sound
      stopSound();
    } else {
      // Play the new sound, passing journeyId to save the preference
      playSound(soundId, journeyId);
    }
  }, [isAmbientAllowed, selectedSound, isPlaying, stopSound, playSound, journeyId]);

  // Disabled state message
  if (!settings.ambientSounds) {
    return (
      <div className={cn("rounded-xl bg-muted/30 border border-border/50 p-3", className)}>
        <div className="flex items-center gap-2 text-muted-foreground">
          <VolumeX className="w-4 h-4" />
          <p className="text-xs">
            {t("settings.sound.ambient")} {t("common.off") || "is off"}
          </p>
        </div>
        <p className="text-[10px] text-muted-foreground/60 mt-1 flex items-start gap-1">
          <Info className="w-3 h-3 mt-0.5 shrink-0" />
          Bật trong Cài đặt → Âm thanh để sử dụng
        </p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {MEDITATION_AMBIENT_SOUNDS.map((sound) => {
          const Icon = sound.icon;
          const isActive = selectedSound === sound.id && isPlaying;
          const isRecentlyUsed = journeySavedSound === sound.id && !isActive;

          return (
            <button
              key={sound.id}
              onClick={() => handleSoundSelect(sound.id)}
              disabled={!isAmbientAllowed || isLoading}
              className={cn(
                "relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                isActive
                  ? `bg-gradient-to-br ${sound.gradient} shadow-lg`
                  : isRecentlyUsed
                    ? "bg-white/80 border-2 border-gold-light/50"
                    : "bg-white/60 hover:bg-white/80 border border-gold-light/30"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 transition-colors",
                isActive ? "text-white" : isRecentlyUsed ? "text-gold" : "text-muted-foreground"
              )} />
              
              {/* Recently used indicator (subtle dot) */}
              <AnimatePresence>
                {isRecentlyUsed && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -bottom-0.5 left-1/2 -translate-x-1/2"
                  >
                    <div className="flex items-center gap-0.5">
                      <Clock className="w-2 h-2 text-gold/70" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Playing pulse indicator */}
              <AnimatePresence>
                {isActive && !prefersReducedMotion && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -top-0.5 -right-0.5"
                  >
                    <motion.div
                      className="w-2.5 h-2.5 bg-white rounded-full shadow-sm"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          );
        })}

        {/* Volume slider (only when playing) */}
        <AnimatePresence>
          {isPlaying && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="flex items-center gap-2 overflow-hidden"
            >
              <Volume2 className="w-4 h-4 text-gold shrink-0" />
              <Slider
                value={[volume]}
                onValueChange={([v]) => setVolume(v)}
                max={1}
                step={0.05}
                className="w-20"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Label */}
      <div className="flex items-center gap-2">
        <Volume2 className="w-4 h-4 text-gold" />
        <Label className="text-sm font-medium text-foreground/80">
          {t("sound.selectAmbient")}
        </Label>
      </div>

      {/* Sound options */}
      <div className="flex items-center gap-3">
        {MEDITATION_AMBIENT_SOUNDS.map((sound) => {
          const Icon = sound.icon;
          const isActive = selectedSound === sound.id && isPlaying;
          const isRecentlyUsed = journeySavedSound === sound.id && !isActive;

          return (
            <motion.button
              key={sound.id}
              onClick={() => handleSoundSelect(sound.id)}
              disabled={!isAmbientAllowed || isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "relative flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-300",
                isActive
                  ? `bg-gradient-to-br ${sound.gradient} shadow-lg shadow-${sound.gradient.split("-")[1]}/30`
                  : isRecentlyUsed
                    ? "bg-white/80 border-2 border-gold-light/50"
                    : "bg-white/60 hover:bg-white/80 border border-gold-light/30"
              )}
            >
              <Icon className={cn(
                "w-6 h-6 transition-colors",
                isActive ? "text-white" : isRecentlyUsed ? "text-gold" : "text-muted-foreground"
              )} />
              <span className={cn(
                "text-xs font-medium",
                isActive ? "text-white" : isRecentlyUsed ? "text-gold" : "text-muted-foreground"
              )}>
                {t(sound.nameKey)}
              </span>

              {/* Recently used indicator */}
              <AnimatePresence>
                {isRecentlyUsed && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2"
                  >
                    <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-gold-light/20 border border-gold-light/30">
                      <Clock className="w-2 h-2 text-gold/70" />
                      <span className="text-[8px] text-gold/70 font-medium">{t("common.recent") || "Gần đây"}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Playing pulse indicator */}
              <AnimatePresence>
                {isActive && !prefersReducedMotion && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -top-1 -right-1"
                  >
                    <motion.div
                      className="w-3 h-3 bg-white rounded-full shadow-md"
                      animate={{ scale: [1, 1.4, 1], opacity: [1, 0.7, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Volume control (only when playing) */}
      <AnimatePresence>
        {isPlaying && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3 pt-2">
              <Volume2 className="w-4 h-4 text-gold shrink-0" />
              <Slider
                value={[volume]}
                onValueChange={([v]) => setVolume(v)}
                max={1}
                step={0.05}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-8 text-right">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MeditationAmbientSelector;
