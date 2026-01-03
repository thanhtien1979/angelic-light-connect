import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useAmbientSound, AMBIENT_SOUNDS, SOUND_CATEGORIES, AmbientSoundType } from "@/hooks/useAmbientSound";
import { useSoundSettingsContext } from "@/contexts/SoundSettingsContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface AmbientSoundPlayerProps {
  className?: string;
  compact?: boolean;
}

const AmbientSoundPlayer = ({ className, compact = false }: AmbientSoundPlayerProps) => {
  const { t, language } = useLanguage();
  const { isSoundAllowed, settings } = useSoundSettingsContext();
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

  // Stop sound when ambient sounds setting is disabled
  useEffect(() => {
    if (!settings.ambientSounds && isPlaying) {
      stopSound();
    }
  }, [settings.ambientSounds, isPlaying, stopSound]);

  const isAmbientAllowed = isSoundAllowed("ambientSounds");

  const handleSoundSelect = (soundId: AmbientSoundType) => {
    if (!isAmbientAllowed) return;
    
    setSelectedSound(soundId);
    if (soundId !== "silence") {
      playSound(soundId);
    } else {
      stopSound();
    }
  };

  const handleTogglePlay = () => {
    if (!isAmbientAllowed) return;
    
    if (isPlaying) {
      stopSound();
    } else if (selectedSound !== "silence") {
      playSound(selectedSound);
    }
  };

  const getSoundName = (sound: typeof AMBIENT_SOUNDS[0]) => {
    // Return localized name based on language
    if (language === "vi") return sound.nameVi;
    return sound.name;
  };

  const getCategoryName = (categoryId: string) => {
    const key = `sound.category.${categoryId}`;
    return t(key);
  };

  if (!settings.ambientSounds) {
    return null;
  }

  if (compact) {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleTogglePlay}
          disabled={!isAmbientAllowed || selectedSound === "silence"}
          className="h-8 w-8"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        <div className="flex items-center gap-2 flex-1">
          <Volume2 className="h-4 w-4 text-muted-foreground" />
          <Slider
            value={[volume]}
            onValueChange={([v]) => setVolume(v)}
            max={1}
            step={0.05}
            className="flex-1"
            disabled={!isAmbientAllowed}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Sound Categories */}
      {SOUND_CATEGORIES.map((category) => {
        const categorySounds = AMBIENT_SOUNDS.filter(s => s.category === category.id);
        
        return (
          <div key={category.id} className="space-y-2">
            <Label className="text-xs text-muted-foreground flex items-center gap-2">
              <span>{category.icon}</span>
              {getCategoryName(category.id)}
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {categorySounds.map((sound) => {
                const isSelected = selectedSound === sound.id;
                const isCurrentPlaying = isSelected && isPlaying;
                
                return (
                  <button
                    key={sound.id}
                    onClick={() => handleSoundSelect(sound.id)}
                    disabled={!isAmbientAllowed}
                    className={cn(
                      "relative p-3 rounded-xl border text-center transition-all duration-200 group",
                      isSelected
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-border/50 bg-card/30 hover:border-primary/30 hover:bg-card/50",
                      !isAmbientAllowed && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xl">{sound.icon}</span>
                      <span className={cn(
                        "text-xs font-medium",
                        isSelected ? "text-primary" : "text-foreground"
                      )}>
                        {getSoundName(sound)}
                      </span>
                    </div>
                    
                    {/* Playing indicator */}
                    <AnimatePresence>
                      {isCurrentPlaying && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          className="absolute top-1 right-1"
                        >
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Volume Control */}
      <div className="pt-4 border-t border-border/50 space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            {t("sound.volume")}
          </Label>
          <span className="text-xs text-muted-foreground">
            {Math.round(volume * 100)}%
          </span>
        </div>
        <Slider
          value={[volume]}
          onValueChange={([v]) => setVolume(v)}
          max={1}
          step={0.05}
          disabled={!isAmbientAllowed}
        />
      </div>

      {/* Play/Stop Control */}
      <div className="flex items-center justify-center gap-3 pt-2">
        <Button
          variant={isPlaying ? "default" : "outline"}
          size="sm"
          onClick={handleTogglePlay}
          disabled={!isAmbientAllowed || selectedSound === "silence" || isLoading}
          className="gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("common.loading")}
            </>
          ) : isPlaying ? (
            <>
              <Pause className="h-4 w-4" />
              {t("sound.playing")}
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              {selectedSound === "silence" ? t("settings.sound.selectSound") : t("meditation.start")}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default AmbientSoundPlayer;
