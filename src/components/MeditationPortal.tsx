import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sun, Sparkles, Play, Pause, Volume2, VolumeX, Music, ChevronDown, Check, SkipBack, SkipForward, Clock, Disc, Rewind, FastForward, Timer, Moon } from "lucide-react";
import { useMeditationAudio, MeditationPlaylist } from "@/hooks/useMeditationAudio";
import { useSleepTimer, SLEEP_TIMER_OPTIONS } from "@/hooks/useSleepTimer";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const meditationCards = [
  {
    id: 1,
    title: "Healing Light",
    titleVi: "Ánh Sáng Chữa Lành",
    description: "Để năng lượng chữa lành lan tỏa khắp cơ thể",
    icon: Sun,
    gradient: "from-gold-light to-gold",
    glowColor: "hsla(45, 100%, 70%, 0.4)",
  },
  {
    id: 2,
    title: "Divine Love",
    titleVi: "Tình Yêu Thiêng Liêng",
    description: "Kết nối với tình yêu vô điều kiện của vũ trụ",
    icon: Heart,
    gradient: "from-pink-300 to-rose-400",
    glowColor: "hsla(350, 80%, 70%, 0.4)",
  },
  {
    id: 3,
    title: "Connect with Father",
    titleVi: "Kết Nối Với Cha Vũ Trụ",
    description: "Hòa mình vào nguồn năng lượng vô tận",
    icon: Sparkles,
    gradient: "from-sky to-blue-400",
    glowColor: "hsla(200, 80%, 70%, 0.4)",
  },
];

const getPlaylistIcon = (iconType: MeditationPlaylist["icon"]) => {
  switch (iconType) {
    case "healing": return Sun;
    case "love": return Heart;
    case "cosmos": return Sparkles;
    case "peace": return Disc;
    default: return Music;
  }
};

const getPlaylistGradient = (iconType: MeditationPlaylist["icon"]) => {
  switch (iconType) {
    case "healing": return "from-gold to-gold-light";
    case "love": return "from-pink-400 to-rose-300";
    case "cosmos": return "from-indigo-400 to-purple-300";
    case "peace": return "from-sky to-blue-300";
    default: return "from-gold to-gold-light";
  }
};

const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

// Keyboard feedback indicator component
const KeyboardFeedback = ({ 
  icon: Icon, 
  label, 
  isVisible 
}: { 
  icon: React.ComponentType<{ className?: string }>; 
  label: string; 
  isVisible: boolean;
}) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -10 }}
        className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
      >
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 backdrop-blur-md border border-gold/30 shadow-lg shadow-gold/10">
          <Icon className="w-4 h-4 text-gold" />
          <span className="text-sm text-foreground/80 font-light">{label}</span>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

const MeditationPortal = () => {
  const { 
    isPlaying, 
    isLoaded, 
    volume, 
    currentTrack, 
    currentTrackIndex,
    currentPlaylist,
    playlists,
    isChangingTrack,
    currentTime,
    duration,
    toggle, 
    setVolume, 
    selectTrack,
    selectPlaylist,
    nextTrack,
    previousTrack,
    seekByPercent,
    pause,
  } = useMeditationAudio();

  // Sleep timer
  const handleTimerEnd = useCallback(() => {
    pause();
  }, [pause]);
  
  const { isActive: isSleepTimerActive, remainingSeconds, startTimer, cancelTimer, formatRemainingTime } = useSleepTimer(handleTimerEnd);
  
  const [isDragging, setIsDragging] = useState(false);
  const [breathPhase, setBreathPhase] = useState<"inhale" | "exhale">("inhale");
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [isJourneyOpen, setIsJourneyOpen] = useState(false);
  const [isSleepTimerOpen, setIsSleepTimerOpen] = useState(false);
  
  // Keyboard feedback state
  const [keyFeedback, setKeyFeedback] = useState<{
    icon: React.ComponentType<{ className?: string }>;
    label: string;
  } | null>(null);
  
  const showKeyFeedback = useCallback((icon: React.ComponentType<{ className?: string }>, label: string) => {
    setKeyFeedback({ icon, label });
    setTimeout(() => setKeyFeedback(null), 1200);
  }, []);

  // Breathing animation toggle
  useEffect(() => {
    const interval = setInterval(() => {
      setBreathPhase((prev) => (prev === "inhale" ? "exhale" : "inhale"));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcuts for meditation player
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input field
      const target = e.target as HTMLElement;
      const isInputField = 
        target.tagName === "INPUT" || 
        target.tagName === "TEXTAREA" || 
        target.isContentEditable;
      
      if (isInputField) return;

      switch (e.key.toLowerCase()) {
        case " ": // Spacebar - toggle play/pause
          e.preventDefault();
          toggle();
          showKeyFeedback(isPlaying ? Pause : Play, isPlaying ? "Tạm dừng" : "Phát");
          break;
        case "arrowleft": // Seek backward 10 seconds
          e.preventDefault();
          if (duration > 0) {
            const newPercent = Math.max(0, ((currentTime - 10) / duration) * 100);
            seekByPercent(newPercent);
            showKeyFeedback(Rewind, "-10 giây");
          }
          break;
        case "arrowright": // Seek forward 10 seconds
          e.preventDefault();
          if (duration > 0) {
            const newPercent = Math.min(100, ((currentTime + 10) / duration) * 100);
            seekByPercent(newPercent);
            showKeyFeedback(FastForward, "+10 giây");
          }
          break;
        case "arrowup": // Volume up
          e.preventDefault();
          {
            const newVolume = Math.min(1, volume + 0.1);
            setVolume(newVolume);
            showKeyFeedback(Volume2, `${Math.round(newVolume * 100)}%`);
          }
          break;
        case "arrowdown": // Volume down
          e.preventDefault();
          {
            const newVolume = Math.max(0, volume - 0.1);
            setVolume(newVolume);
            showKeyFeedback(newVolume > 0 ? Volume2 : VolumeX, `${Math.round(newVolume * 100)}%`);
          }
          break;
        case "n": // Next track
          e.preventDefault();
          nextTrack();
          showKeyFeedback(SkipForward, "Bản tiếp theo");
          break;
        case "p": // Previous track
          e.preventDefault();
          previousTrack();
          showKeyFeedback(SkipBack, "Bản trước");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggle, nextTrack, previousTrack, seekByPercent, setVolume, volume, currentTime, duration, isPlaying, showKeyFeedback]);

  const handlePlaylistSelect = (playlist: MeditationPlaylist) => {
    selectPlaylist(playlist);
    setIsJourneyOpen(false);
  };

  const handleTrackSelect = (index: number) => {
    selectTrack(index);
    setIsPlaylistOpen(false);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = ((e.clientX - rect.left) / rect.width) * 100;
    seekByPercent(Math.max(0, Math.min(100, percent)));
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const remainingTime = duration - currentTime;

  const PlaylistIcon = getPlaylistIcon(currentPlaylist.icon);

  return (
    <>
      {/* Keyboard shortcut feedback indicator */}
      <KeyboardFeedback 
        icon={keyFeedback?.icon || Play} 
        label={keyFeedback?.label || ""} 
        isVisible={keyFeedback !== null} 
      />
      
    <section id="meditation" className="relative min-h-screen py-24 px-4 overflow-hidden">
      {/* Immersive background with nebula effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-sky-light/20 to-background" />
      
      {/* Moving nebula effect */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <motion.div
          className="absolute w-[800px] h-[800px] rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, hsla(280, 70%, 80%, 0.3), transparent 70%)",
            left: "10%",
            top: "20%",
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, hsla(200, 80%, 80%, 0.3), transparent 70%)",
            right: "10%",
            bottom: "20%",
          }}
          animate={{
            x: [0, -80, 0],
            y: [0, -60, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, hsla(45, 100%, 80%, 0.2), transparent 70%)",
            left: "40%",
            top: "40%",
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Sacred geometry background */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 400 400">
          <defs>
            <linearGradient id="meditationGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(45, 100%, 70%)" />
              <stop offset="100%" stopColor="hsl(45, 100%, 85%)" />
            </linearGradient>
          </defs>
          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
            <motion.circle
              key={i}
              cx={200 + 80 * Math.cos((angle * Math.PI) / 180)}
              cy={200 + 80 * Math.sin((angle * Math.PI) / 180)}
              r="80"
              fill="none"
              stroke="url(#meditationGold)"
              strokeWidth="0.5"
              initial={{ opacity: 0.3 }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
            />
          ))}
        </svg>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-glow-gold text-gold mb-4">
            Meditation & Prayer Portal
          </h2>
          <p className="text-muted-foreground text-lg">Cổng thiền định và cầu nguyện</p>
        </motion.div>

        {/* Breathing Circle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="flex flex-col items-center mb-20"
        >
          <div className="relative">
            {/* Outer glow rings */}
            <motion.div
              className="absolute inset-0 -m-8 rounded-full bg-gradient-to-r from-gold-light/30 to-gold/30 blur-2xl"
              animate={{
                scale: breathPhase === "inhale" ? [1, 1.3] : [1.3, 1],
                opacity: breathPhase === "inhale" ? [0.3, 0.6] : [0.6, 0.3],
              }}
              transition={{ duration: 4, ease: "easeInOut" }}
            />
            
            {/* Main breathing circle */}
            <motion.div
              className="w-40 h-40 md:w-56 md:h-56 rounded-full bg-gradient-to-br from-gold-light via-gold to-gold-light flex items-center justify-center"
              animate={{
                scale: breathPhase === "inhale" ? [1, 1.2] : [1.2, 1],
              }}
              transition={{ duration: 4, ease: "easeInOut" }}
              style={{
                boxShadow: "0 0 60px hsla(45, 100%, 70%, 0.5), 0 0 100px hsla(45, 100%, 70%, 0.3)",
              }}
            >
              <motion.span
                className="font-serif text-xl md:text-2xl text-white/90 tracking-wider"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                {breathPhase === "inhale" ? "Hít vào..." : "Thở ra..."}
              </motion.span>
            </motion.div>
          </div>
          
          <p className="mt-8 text-muted-foreground text-center max-w-md">
            Hãy đồng bộ hơi thở của bạn với vòng tròn ánh sáng. Để năng lượng chữa lành lan tỏa.
          </p>
        </motion.div>

        {/* Meditation Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          {meditationCards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              viewport={{ once: true }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="relative group"
            >
              <div
                className="absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: card.glowColor }}
              />
              <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl border border-gold-light/30 p-6 h-full overflow-hidden">
                {/* Floating icon */}
                <motion.div
                  className={`w-16 h-16 rounded-full bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-4`}
                  animate={{ y: [-2, 2, -2] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{
                    boxShadow: `0 0 30px ${card.glowColor}`,
                  }}
                >
                  <card.icon className="w-8 h-8 text-white" />
                </motion.div>
                
                <h3 className="font-serif text-xl text-foreground mb-1">{card.title}</h3>
                <p className="text-gold font-medium mb-2">{card.titleVi}</p>
                <p className="text-muted-foreground text-sm">{card.description}</p>

                {/* Glowing border effect on hover */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-gold-light/50 transition-colors duration-500" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced Audio Player with Journey & Playlist */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="max-w-lg mx-auto"
        >
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-gold-light/30 overflow-hidden">
            {/* Journey Selector */}
            <div className="p-4 border-b border-gold-light/20">
              <button
                onClick={() => setIsJourneyOpen(!isJourneyOpen)}
                className="w-full flex items-center gap-3 text-left"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getPlaylistGradient(currentPlaylist.icon)} flex items-center justify-center shadow-lg`}>
                  <PlaylistIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Hành Trình Thiền Định</p>
                  <p className="font-serif text-lg text-foreground truncate">{currentPlaylist.nameVi}</p>
                </div>
                <motion.div
                  animate={{ rotate: isJourneyOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                </motion.div>
              </button>

              {/* Journey Dropdown */}
              <AnimatePresence>
                {isJourneyOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3 space-y-2">
                      {playlists.map((playlist) => {
                        const Icon = getPlaylistIcon(playlist.icon);
                        const isSelected = playlist.id === currentPlaylist.id;
                        return (
                          <motion.button
                            key={playlist.id}
                            onClick={() => handlePlaylistSelect(playlist)}
                            whileHover={{ x: 4 }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
                              isSelected
                                ? "bg-gold-light/20"
                                : "hover:bg-gold-light/10"
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getPlaylistGradient(playlist.icon)} flex items-center justify-center`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${isSelected ? "text-gold" : "text-foreground"}`}>
                                {playlist.nameVi}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">{playlist.tracks.length} bài</p>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-gold" />}
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Main Player Controls */}
            <div className="p-4">
              <div className="flex items-center gap-4 mb-4">
                <TooltipProvider delayDuration={400}>
                  {/* Skip Previous */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={previousTrack}
                        disabled={isChangingTrack}
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                      >
                        <SkipBack className="w-5 h-5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-background/95 backdrop-blur-sm border-gold-light/30 text-foreground">
                      <p className="text-xs">Bài trước <span className="text-muted-foreground ml-1">P</span></p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Play/Pause */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggle}
                        disabled={!isLoaded || isChangingTrack}
                        className="w-14 h-14 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center shadow-[0_0_20px_hsla(45,100%,70%,0.4)] disabled:opacity-50"
                      >
                        {isChangingTrack ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                          />
                        ) : isPlaying ? (
                          <Pause className="w-6 h-6 text-white" />
                        ) : (
                          <Play className="w-6 h-6 text-white ml-0.5" />
                        )}
                      </motion.button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-background/95 backdrop-blur-sm border-gold-light/30 text-foreground">
                      <p className="text-xs">{isPlaying ? "Tạm dừng" : "Phát"} <span className="text-muted-foreground ml-1">Space</span></p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Skip Next */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={nextTrack}
                        disabled={isChangingTrack}
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                      >
                        <SkipForward className="w-5 h-5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-background/95 backdrop-blur-sm border-gold-light/30 text-foreground">
                      <p className="text-xs">Bài tiếp <span className="text-muted-foreground ml-1">N</span></p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{currentTrack.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{currentTrack.nameVi}</p>
                </div>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setVolume(volume > 0 ? 0 : 0.7)} className="p-1">
                        {volume > 0 ? (
                          <Volume2 className="w-4 h-4 text-gold" />
                        ) : (
                          <VolumeX className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="w-16 h-1 bg-border rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold"
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="top" 
                    className="bg-background/90 backdrop-blur-sm border-gold/20 text-foreground/80 text-xs font-light"
                  >
                    <span className="text-gold/80">↑ / ↓</span> Âm lượng
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      onClick={handleProgressClick}
                      onMouseDown={() => setIsDragging(true)}
                      onMouseUp={() => setIsDragging(false)}
                      onMouseLeave={() => setIsDragging(false)}
                      className="relative h-2 bg-border/50 rounded-full cursor-pointer group"
                    >
                      {/* Progress fill */}
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-gold to-gold-light rounded-full"
                        style={{ width: `${progressPercent}%` }}
                        transition={isDragging ? { duration: 0 } : { duration: 0.1 }}
                      />
                      {/* Seek handle */}
                      <motion.div
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-gold rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ left: `calc(${progressPercent}% - 6px)` }}
                      />
                      {/* Hover glow effect */}
                      <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_8px_hsla(45,100%,70%,0.3)]" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="top" 
                    className="bg-background/90 backdrop-blur-sm border-gold/20 text-foreground/80 text-xs font-light"
                  >
                    <span className="text-gold/80">← / →</span> Tua nhanh
                  </TooltipContent>
                </Tooltip>

                {/* Time display */}
                <div className="flex justify-between text-xs text-muted-foreground font-mono">
                  <span>{formatTime(currentTime)}</span>
                  <span>-{formatTime(remainingTime)}</span>
                </div>
              </div>
            </div>

            {/* Sleep Timer & Track List Row */}
            <div className="flex border-t border-gold-light/20">
              {/* Sleep Timer Button */}
              <button
                onClick={() => setIsSleepTimerOpen(!isSleepTimerOpen)}
                className="flex-1 px-4 py-2 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:bg-gold-light/10 transition-colors border-r border-gold-light/20"
              >
                {isSleepTimerActive ? (
                  <>
                    <Moon className="w-4 h-4 text-gold" />
                    <span className="text-gold font-medium">{formatRemainingTime()}</span>
                  </>
                ) : (
                  <>
                    <Timer className="w-4 h-4" />
                    <span>Hẹn giờ ngủ</span>
                  </>
                )}
                <motion.div
                  animate={{ rotate: isSleepTimerOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </button>

              {/* Track List Toggle */}
              <button
                onClick={() => setIsPlaylistOpen(!isPlaylistOpen)}
                className="flex-1 px-4 py-2 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:bg-gold-light/10 transition-colors"
              >
                <Music className="w-4 h-4" />
                <span>{currentPlaylist.tracks.length} bài</span>
                <motion.div
                  animate={{ rotate: isPlaylistOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </button>
            </div>

            {/* Sleep Timer Dropdown */}
            <AnimatePresence>
              {isSleepTimerOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 border-t border-gold-light/20 bg-gold-light/5">
                    <div className="flex flex-wrap gap-2 justify-center">
                      {SLEEP_TIMER_OPTIONS.map((option) => (
                        <motion.button
                          key={option.minutes}
                          onClick={() => {
                            startTimer(option.minutes);
                            setIsSleepTimerOpen(false);
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-4 py-2 rounded-full text-sm transition-all ${
                            remainingSeconds !== null && Math.ceil(remainingSeconds / 60) === option.minutes
                              ? "bg-gradient-to-br from-gold to-gold-light text-white shadow-[0_0_12px_hsla(45,100%,70%,0.4)]"
                              : "bg-white/60 text-foreground hover:bg-gold-light/20 border border-gold-light/30"
                          }`}
                        >
                          {option.labelVi}
                        </motion.button>
                      ))}
                    </div>
                    {isSleepTimerActive && (
                      <motion.button
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => {
                          cancelTimer();
                          setIsSleepTimerOpen(false);
                        }}
                        className="mt-3 w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Hủy hẹn giờ
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Track List */}
            <AnimatePresence>
              {isPlaylistOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-gold-light/20 p-2 space-y-1 max-h-64 overflow-y-auto">
                    {currentPlaylist.tracks.map((track, index) => (
                      <motion.button
                        key={track.id}
                        onClick={() => handleTrackSelect(index)}
                        whileHover={{ x: 4 }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors text-left ${
                          currentTrackIndex === index
                            ? "bg-gold-light/20 text-gold"
                            : "text-foreground hover:bg-gold-light/10"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          currentTrackIndex === index
                            ? "bg-gradient-to-br from-gold to-gold-light text-white"
                            : "bg-gold-light/20 text-gold"
                        }`}>
                          {currentTrackIndex === index && isPlaying ? (
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              <Music className="w-4 h-4" />
                            </motion.div>
                          ) : (
                            index + 1
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{track.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{track.nameVi}</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{track.duration}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
    </>
  );
};

export default MeditationPortal;
