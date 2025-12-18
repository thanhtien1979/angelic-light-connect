import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, X, Sparkles, Volume2, VolumeX, Wind, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useAmbientSound, AMBIENT_SOUNDS, AmbientSoundType } from "@/hooks/useAmbientSound";
import BreathingGuide, { BreathingPatternSelector, BreathingPattern } from "./BreathingGuide";

interface GreetingMeditationInviteProps {
  greetingTheme?: string;
  onClose: () => void;
}

const MEDITATION_THEMES = [
  { theme: "bình an", duration: 3, message: "Hãy để sự bình an lan tỏa trong từng hơi thở..." },
  { theme: "yêu thương", duration: 5, message: "Cảm nhận tình yêu vô điều kiện đang ôm ấp con..." },
  { theme: "ánh sáng", duration: 3, message: "Ánh sáng nội tâm đang tỏa sáng từ trái tim con..." },
  { theme: "chữa lành", duration: 7, message: "Năng lượng chữa lành đang chảy qua từng tế bào..." },
  { theme: "biết ơn", duration: 5, message: "Lòng biết ơn mở cánh cửa đến những điều kỳ diệu..." },
  { theme: "hiện diện", duration: 3, message: "Con đang ở đây, trong khoảnh khắc hiện tại..." },
];

const GreetingMeditationInvite = ({ greetingTheme, onClose }: GreetingMeditationInviteProps) => {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState(MEDITATION_THEMES[0]);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [showSoundPicker, setShowSoundPicker] = useState(false);
  const [breathingPattern, setBreathingPattern] = useState<BreathingPattern>(null);
  const [showBreathingGuide, setShowBreathingGuide] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const totalDurationRef = useRef<number>(0);

  const {
    isPlaying: isSoundPlaying,
    isLoading: isSoundLoading,
    selectedSound,
    setSelectedSound,
    volume,
    setVolume,
    playSound,
    stopSound,
  } = useAmbientSound();

  // Select meditation theme based on greeting
  useEffect(() => {
    if (greetingTheme) {
      const matchedTheme = MEDITATION_THEMES.find(t => 
        greetingTheme.toLowerCase().includes(t.theme)
      );
      if (matchedTheme) {
        setSelectedTheme(matchedTheme);
        return;
      }
    }
    // Random selection if no match
    const randomIndex = Math.floor(Math.random() * MEDITATION_THEMES.length);
    setSelectedTheme(MEDITATION_THEMES[randomIndex]);
  }, [greetingTheme]);

  // Timer effect
  useEffect(() => {
    if (isActive && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsActive(false);
            setHasCompleted(true);
            stopSound();
            saveMeditationSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeRemaining]);

  // Save meditation session to database
  const saveMeditationSession = async () => {
    if (!user?.id) return;

    const actualDuration = totalDurationRef.current - timeRemaining;
    if (actualDuration < 10) return; // Don't save very short sessions

    try {
      await supabase.from("meditation_history").insert({
        user_id: user.id,
        duration_seconds: actualDuration,
        theme: selectedTheme.theme,
        ambient_sound: selectedSound,
      });
    } catch (error) {
      console.error("Error saving meditation session:", error);
    }
  };

  const startMeditation = () => {
    const duration = selectedTheme.duration * 60;
    setTimeRemaining(duration);
    totalDurationRef.current = duration;
    startTimeRef.current = Date.now();
    setIsActive(true);
    setHasCompleted(false);
    
    // Show breathing guide if pattern is selected
    if (breathingPattern) {
      setShowBreathingGuide(true);
    }
    
    // Play ambient sound if not silence
    if (selectedSound !== "silence") {
      playSound(selectedSound);
    }
  };

  const toggleMeditation = () => {
    if (isActive) {
      setIsActive(false);
      setShowBreathingGuide(false);
      stopSound();
    } else if (timeRemaining > 0) {
      setIsActive(true);
      if (breathingPattern) {
        setShowBreathingGuide(true);
      }
      if (selectedSound !== "silence") {
        playSound(selectedSound);
      }
    } else {
      startMeditation();
    }
  };

  const handleClose = () => {
    stopSound();
    // Save partial session if meditation was in progress
    if (startTimeRef.current > 0 && !hasCompleted) {
      const actualDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      if (actualDuration >= 30 && user?.id) {
        supabase.from("meditation_history").insert({
          user_id: user.id,
          duration_seconds: actualDuration,
          theme: selectedTheme.theme,
          ambient_sound: selectedSound,
        });
      }
    }
    onClose();
  };

  const handleSoundSelect = (sound: AmbientSoundType) => {
    setSelectedSound(sound);
    setShowSoundPicker(false);
    
    if (isActive) {
      stopSound();
      if (sound !== "silence") {
        playSound(sound);
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = timeRemaining > 0 
    ? ((totalDurationRef.current - timeRemaining) / totalDurationRef.current) * 100 
    : hasCompleted ? 100 : 0;

  const currentSoundOption = AMBIENT_SOUNDS.find(s => s.id === selectedSound);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-sm"
        >
          {/* Decorative background glow */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-gold/20 via-primary/10 to-gold/20 blur-xl" />
          
          <div className="relative p-6 rounded-3xl bg-card/95 backdrop-blur-xl border border-gold/30 shadow-2xl shadow-gold/10">
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted/50 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* Timer circle */}
            <div className="relative w-40 h-40 mx-auto mb-4">
              {/* Background circle */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="72"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-muted/20"
                />
                {/* Progress circle */}
                <motion.circle
                  cx="80"
                  cy="80"
                  r="72"
                  fill="none"
                  stroke="url(#goldGradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={452}
                  strokeDashoffset={452 - (452 * progress) / 100}
                  transition={{ duration: 0.5 }}
                />
                <defs>
                  <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--gold))" />
                    <stop offset="100%" stopColor="hsl(var(--gold-light))" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Center content - hide when breathing guide is shown */}
              {!showBreathingGuide && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {isActive || timeRemaining > 0 ? (
                    <>
                      <motion.span 
                        className="text-3xl font-light text-foreground"
                        animate={{ opacity: isActive ? [0.7, 1, 0.7] : 1 }}
                        transition={{ duration: 4, repeat: isActive ? Infinity : 0 }}
                      >
                        {formatTime(timeRemaining)}
                      </motion.span>
                      <span className="text-xs text-muted-foreground mt-1">
                        {isActive ? "đang thiền" : "tạm dừng"}
                      </span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-8 h-8 text-gold mb-2" />
                      <span className="text-sm text-muted-foreground">
                        {selectedTheme.duration} phút
                      </span>
                    </>
                  )}
                </div>
              )}

              {/* Breathing Guide Overlay */}
              <BreathingGuide
                isActive={isActive && showBreathingGuide}
                pattern={breathingPattern}
                onClose={() => setShowBreathingGuide(false)}
              />

              {/* Breathing animation when active (only if no breathing guide) */}
              {isActive && !showBreathingGuide && (
                <motion.div
                  className="absolute inset-4 rounded-full bg-gold/10"
                  animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
            </div>

            {/* Ambient Sound Selector */}
            <div className="mb-3">
              <button
                onClick={() => setShowSoundPicker(!showSoundPicker)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-sm"
              >
                {isSoundLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                ) : (
                  <span>{currentSoundOption?.icon}</span>
                )}
                <span className="text-foreground/80">{currentSoundOption?.nameVi}</span>
                {selectedSound !== "silence" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setVolume(volume === 0 ? 0.25 : 0);
                    }}
                    className="ml-2 p-1 rounded-full hover:bg-muted/50"
                  >
                    {volume === 0 ? (
                      <VolumeX className="w-3 h-3 text-muted-foreground" />
                    ) : (
                      <Volume2 className="w-3 h-3 text-muted-foreground" />
                    )}
                  </button>
                )}
              </button>

              {/* Sound picker dropdown */}
              <AnimatePresence>
                {showSoundPicker && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 p-2 rounded-lg bg-muted/20 border border-border/30 grid grid-cols-5 gap-1">
                      {AMBIENT_SOUNDS.map((sound) => (
                        <button
                          key={sound.id}
                          onClick={() => handleSoundSelect(sound.id)}
                          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                            selectedSound === sound.id
                              ? "bg-gold/20 border border-gold/40"
                              : "hover:bg-muted/30"
                          }`}
                        >
                          <span className="text-lg">{sound.icon}</span>
                          <span className="text-[10px] text-muted-foreground">{sound.nameVi}</span>
                        </button>
                      ))}
                    </div>
                    
                    {/* Volume slider */}
                    {selectedSound !== "silence" && (
                      <div className="mt-2 px-2 flex items-center gap-2">
                        <VolumeX className="w-3 h-3 text-muted-foreground" />
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={volume}
                          onChange={(e) => setVolume(parseFloat(e.target.value))}
                          className="flex-1 h-1 appearance-none bg-muted/50 rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-gold [&::-webkit-slider-thumb]:rounded-full"
                        />
                        <Volume2 className="w-3 h-3 text-muted-foreground" />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Breathing Guide Selector */}
            <div className="mb-3">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Wind className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Hướng dẫn thở</span>
              </div>
              <div className="flex justify-center">
                <BreathingPatternSelector
                  selectedPattern={breathingPattern}
                  onSelectPattern={setBreathingPattern}
                />
              </div>
            </div>

            {/* Theme message */}
            <p className="text-center text-sm text-foreground/80 leading-relaxed mb-4 px-2">
              {selectedTheme.message}
            </p>

            {/* Control button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={toggleMeditation}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-gold/20 to-gold/30 hover:from-gold/30 hover:to-gold/40 text-foreground font-medium transition-all border border-gold/30 flex items-center justify-center gap-2"
            >
              {isActive ? (
                <>
                  <Pause className="w-4 h-4" />
                  Tạm dừng
                </>
              ) : timeRemaining > 0 ? (
                <>
                  <Play className="w-4 h-4" />
                  Tiếp tục
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Bắt đầu thiền định
                </>
              )}
            </motion.button>

            {/* Invitation text */}
            {!isActive && timeRemaining === 0 && !hasCompleted && (
              <p className="text-center text-xs text-muted-foreground/60 mt-4">
                Đây là lời mời, không phải nhiệm vụ ✨
              </p>
            )}

            {/* Completion message */}
            {hasCompleted && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 rounded-xl bg-gold/10 border border-gold/20 text-center"
              >
                <Sparkles className="w-5 h-5 text-gold mx-auto mb-1" />
                <p className="text-sm text-foreground/80">
                  Con đã hoàn thành khoảnh khắc tĩnh lặng
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Khoảnh khắc này đã được ghi lại
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GreetingMeditationInvite;
