import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, ChevronUp, X, Moon, Timer, Repeat, Shuffle } from "lucide-react";
import { useMeditationAudio } from "@/hooks/useMeditationAudio";
import { useSleepTimer, SLEEP_TIMER_OPTIONS } from "@/hooks/useSleepTimer";

const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const MiniMeditationPlayer = () => {
  const {
    isPlaying,
    isLoaded,
    volume,
    currentTrack,
    currentPlaylist,
    isChangingTrack,
    currentTime,
    duration,
    toggle,
    setVolume,
    nextTrack,
    previousTrack,
    seekByPercent,
    pause,
    isLooping,
    isShuffled,
  } = useMeditationAudio();

  // Sleep timer
  const handleTimerEnd = useCallback(() => {
    pause();
  }, [pause]);
  
  const { isActive: isSleepTimerActive, remainingSeconds, startTimer, cancelTimer, formatRemainingTime } = useSleepTimer(handleTimerEnd);

  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isSleepTimerOpen, setIsSleepTimerOpen] = useState(false);

  // Show mini player when scrolled away from meditation section
  useEffect(() => {
    const handleScroll = () => {
      const meditationSection = document.getElementById("meditation");
      if (!meditationSection) return;

      const rect = meditationSection.getBoundingClientRect();
      const isInView = rect.top < window.innerHeight && rect.bottom > 0;
      
      // Show mini player when meditation section is out of view AND audio has been interacted with
      setIsVisible(!isInView && (isPlaying || isLoaded));
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial state
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isPlaying, isLoaded]);

  // Reset dismissed state when returning to meditation section
  useEffect(() => {
    if (!isVisible) {
      setIsDismissed(false);
    }
  }, [isVisible]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = ((e.clientX - rect.left) / rect.width) * 100;
    seekByPercent(Math.max(0, Math.min(100, percent)));
  };

  if (!isVisible || isDismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md"
      >
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-gold-light/30 via-gold/20 to-gold-light/30 blur-xl rounded-2xl" />
          
          <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl border border-gold-light/40 shadow-[0_8px_32px_hsla(45,100%,70%,0.2)] overflow-hidden">
            {/* Progress bar */}
            <div 
              className="h-1 bg-muted/30 cursor-pointer"
              onClick={handleProgressClick}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-gold to-gold-light"
                style={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>

            {/* Main controls */}
            <div className="p-3 flex items-center gap-3">
              {/* Track info & Mode Indicators */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground truncate flex-1">
                    {currentPlaylist.nameVi}
                  </p>
                  {/* Playback mode indicators */}
                  <div className="flex items-center gap-1">
                    {isLooping && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-1 rounded-full bg-gold-light/20"
                        title="Lặp lại bật"
                      >
                        <Repeat className="w-3 h-3 text-gold" />
                      </motion.div>
                    )}
                    {isShuffled && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-1 rounded-full bg-gold-light/20"
                        title="Phát ngẫu nhiên bật"
                      >
                        <Shuffle className="w-3 h-3 text-gold" />
                      </motion.div>
                    )}
                  </div>
                  {isSleepTimerActive && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold-light/20 border border-gold/30"
                    >
                      <Moon className="w-3 h-3 text-gold" />
                      <span className="text-xs text-gold font-medium">{formatRemainingTime()}</span>
                    </motion.div>
                  )}
                </div>
                <p className="text-sm font-medium text-foreground truncate">
                  {currentTrack?.nameVi || "Đang tải..."}
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={previousTrack}
                  disabled={isChangingTrack}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggle}
                  disabled={!isLoaded || isChangingTrack}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center shadow-[0_0_15px_hsla(45,100%,70%,0.4)] disabled:opacity-50"
                >
                  {isChangingTrack ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : isPlaying ? (
                    <Pause className="w-4 h-4 text-white" />
                  ) : (
                    <Play className="w-4 h-4 text-white ml-0.5" />
                  )}
                </motion.button>

                <button
                  onClick={nextTrack}
                  disabled={isChangingTrack}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              {/* Expand/Collapse */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronUp className="w-4 h-4" />
                </motion.div>
              </button>

              {/* Dismiss */}
              <button
                onClick={() => setIsDismissed(true)}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Expanded section */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 border-t border-gold-light/20 pt-3">
                    {/* Time display */}
                    <div className="flex justify-between text-xs text-muted-foreground mb-3">
                      <span>{formatTime(currentTime)}</span>
                      <span>-{formatTime(duration - currentTime)}</span>
                    </div>

                    {/* Volume control */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setVolume(volume === 0 ? 0.7 : 0)}
                        className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {volume === 0 ? (
                          <VolumeX className="w-4 h-4" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                      </button>
                      <div className="flex-1 h-1.5 bg-muted/30 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-gold/60 to-gold-light/60 rounded-full"
                          style={{ width: `${volume * 100}%` }}
                        />
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full"
                        style={{ display: "none" }}
                      />
                    </div>

                    {/* Sleep Timer Quick Access */}
                    <div className="mt-3 pt-3 border-t border-gold-light/20">
                      <button
                        onClick={() => setIsSleepTimerOpen(!isSleepTimerOpen)}
                        className="w-full flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {isSleepTimerActive ? (
                          <>
                            <Moon className="w-3 h-3 text-gold" />
                            <span className="text-gold">Hẹn giờ: {formatRemainingTime()}</span>
                          </>
                        ) : (
                          <>
                            <Timer className="w-3 h-3" />
                            <span>Đặt hẹn giờ ngủ</span>
                          </>
                        )}
                      </button>

                      <AnimatePresence>
                        {isSleepTimerOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="flex flex-wrap gap-1.5 justify-center mt-2">
                              {SLEEP_TIMER_OPTIONS.map((option) => (
                                <button
                                  key={option.minutes}
                                  onClick={() => {
                                    startTimer(option.minutes);
                                    setIsSleepTimerOpen(false);
                                  }}
                                  className={`px-3 py-1 rounded-full text-xs transition-all ${
                                    remainingSeconds !== null && Math.ceil(remainingSeconds / 60) === option.minutes
                                      ? "bg-gradient-to-br from-gold to-gold-light text-white"
                                      : "bg-white/60 text-foreground hover:bg-gold-light/20 border border-gold-light/30"
                                  }`}
                                >
                                  {option.labelVi}
                                </button>
                              ))}
                            </div>
                            {isSleepTimerActive && (
                              <button
                                onClick={() => {
                                  cancelTimer();
                                  setIsSleepTimerOpen(false);
                                }}
                                className="mt-2 w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
                              >
                                Hủy hẹn giờ
                              </button>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Scroll to meditation section */}
                    <button
                      onClick={() => {
                        const section = document.getElementById("meditation");
                        section?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="mt-3 w-full text-xs text-gold hover:text-gold-light transition-colors text-center"
                    >
                      Mở cổng thiền định đầy đủ ↑
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MiniMeditationPlayer;
