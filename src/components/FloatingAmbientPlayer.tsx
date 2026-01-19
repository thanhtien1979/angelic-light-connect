import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, X, ChevronUp, ChevronDown, Volume2, Loader2 } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useAmbientSound, AMBIENT_SOUNDS, AmbientSoundType } from "@/hooks/useAmbientSound";
import { useSoundSettingsContext } from "@/contexts/SoundSettingsContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const FloatingAmbientPlayer = () => {
  const { t, language } = useLanguage();
  const { settings, prefersReducedMotion } = useSoundSettingsContext();
  const location = useLocation();
  const {
    isPlaying,
    isLoading,
    selectedSound,
    volume,
    setVolume,
    playSound,
    stopSound,
  } = useAmbientSound();

  const [isExpanded, setIsExpanded] = useState(false);

  // Hide on home page
  const isHomePage = location.pathname === "/";

  // Only show when ambient sounds are playing and not on home page
  if (!isPlaying || !settings.ambientSounds || isHomePage) {
    return null;
  }

  const currentSound = AMBIENT_SOUNDS.find(s => s.id === selectedSound);
  const getSoundName = (sound: typeof AMBIENT_SOUNDS[0]) => {
    if (language === "vi") return sound.nameVi;
    return sound.name;
  };

  // Quick switch sounds (Rain, Ocean, Forest only for simplicity)
  const quickSounds = AMBIENT_SOUNDS.filter(s => 
    ["rain", "ocean", "forest"].includes(s.id)
  );

  const handleSoundSwitch = (soundId: AmbientSoundType) => {
    if (soundId !== selectedSound) {
      playSound(soundId);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.8 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30,
          ...(prefersReducedMotion && { type: "tween", duration: 0.2 })
        }}
        className="fixed bottom-20 right-4 z-40 md:bottom-6 md:right-6"
      >
        <div className="relative">
          {/* Main floating widget */}
          <motion.div
            layout
            className={cn(
              "bg-background/80 backdrop-blur-xl rounded-2xl border border-primary/20 shadow-2xl shadow-primary/10 overflow-hidden",
              isExpanded ? "w-64" : "w-auto"
            )}
          >
            {/* Collapsed view - compact */}
            <div className="flex items-center gap-2 p-2">
              {/* Sound icon with pulse */}
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="text-lg">{currentSound?.icon || "🎵"}</span>
                </div>
                {/* Playing indicator */}
                <motion.div
                  className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full"
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </div>

              {/* Play/Pause button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => isPlaying ? stopSound() : playSound(selectedSound)}
                className="h-9 w-9 rounded-full hover:bg-primary/10"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : isPlaying ? (
                  <Pause className="h-4 w-4 text-primary" />
                ) : (
                  <Play className="h-4 w-4 text-primary" />
                )}
              </Button>

              {/* Expand/collapse button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-9 w-9 rounded-full hover:bg-muted/50"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>

              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={stopSound}
                className="h-9 w-9 rounded-full hover:bg-destructive/10"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>

            {/* Expanded view */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 space-y-3">
                    {/* Current sound name */}
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">{t("sound.playing")}</p>
                      <p className="text-sm font-medium text-foreground">
                        {currentSound ? getSoundName(currentSound) : selectedSound}
                      </p>
                    </div>

                    {/* Quick sound selector */}
                    <div className="flex justify-center gap-2">
                      {quickSounds.map((sound) => {
                        const isActive = selectedSound === sound.id;
                        return (
                          <button
                            key={sound.id}
                            onClick={() => handleSoundSwitch(sound.id)}
                            className={cn(
                              "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200",
                              isActive
                                ? "bg-primary/15 border border-primary/30"
                                : "bg-muted/30 hover:bg-muted/50 border border-transparent"
                            )}
                          >
                            <span className="text-lg">{sound.icon}</span>
                            <span className={cn(
                              "text-[10px]",
                              isActive ? "text-primary" : "text-muted-foreground"
                            )}>
                              {getSoundName(sound)}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Volume slider */}
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <Slider
                        value={[volume]}
                        onValueChange={([v]) => setVolume(v)}
                        max={1}
                        step={0.05}
                        className="flex-1"
                      />
                      <span className="text-[10px] text-muted-foreground w-6 text-right">
                        {Math.round(volume * 100)}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Subtle ambient glow effect */}
          {!prefersReducedMotion && (
            <motion.div
              className="absolute inset-0 -z-10 rounded-2xl bg-primary/20 blur-xl"
              animate={{ opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FloatingAmbientPlayer;
