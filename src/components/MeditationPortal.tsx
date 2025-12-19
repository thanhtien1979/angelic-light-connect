import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sun, Sparkles, Play, Pause, Volume2, VolumeX, Music, ChevronDown, Check, SkipBack, SkipForward, Clock, Disc, Rewind, FastForward, Timer, Moon, X, Keyboard, HelpCircle, Repeat, Shuffle } from "lucide-react";
import { useMeditationAudio, MeditationPlaylist } from "@/hooks/useMeditationAudio";
import { useSleepTimer, SLEEP_TIMER_OPTIONS } from "@/hooks/useSleepTimer";
import { useMeditationReward } from "@/hooks/useMeditationReward";
import CoinRewardAnimation from "@/components/CoinRewardAnimation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import angelAvatar from "@/assets/angel-avatar.jpg";

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

// Keyboard shortcuts data
const keyboardShortcuts = [
  { key: "Space", label: "Phát / Tạm dừng" },
  { key: "←", label: "Tua lùi 10 giây" },
  { key: "→", label: "Tua tiến 10 giây" },
  { key: "↑", label: "Tăng âm lượng" },
  { key: "↓", label: "Giảm âm lượng" },
  { key: "M", label: "Tắt / Bật tiếng" },
  { key: "L", label: "Lặp lại bài hát" },
  { key: "S", label: "Phát ngẫu nhiên" },
  { key: "N", label: "Bài tiếp theo" },
  { key: "P", label: "Bài trước đó" },
  { key: "?", label: "Hiện phím tắt" },
  { key: "Esc", label: "Đóng hộp thoại" },
];

// Keyboard shortcuts help overlay
const KeyboardShortcutsOverlay = ({ 
  isVisible, 
  onClose 
}: { 
  isVisible: boolean; 
  onClose: () => void;
}) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative bg-background/95 backdrop-blur-xl rounded-2xl border border-gold/20 shadow-2xl shadow-gold/10 p-6 max-w-sm w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-gold" />
              <h3 className="font-serif text-lg text-foreground">Phím Tắt</h3>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-muted/50 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          
          {/* Shortcuts list */}
          <div className="space-y-2">
            {keyboardShortcuts.map((shortcut) => (
              <div 
                key={shortcut.key}
                className="flex items-center justify-between py-2 border-b border-gold/10 last:border-0"
              >
                <span className="text-sm text-muted-foreground">{shortcut.label}</span>
                <kbd className="px-2 py-1 text-xs font-mono bg-muted/50 text-gold rounded border border-gold/20">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
          
          {/* Footer hint */}
          <p className="mt-4 text-xs text-muted-foreground/60 text-center">
            Nhấn <kbd className="px-1 bg-muted/30 rounded text-gold/60">Esc</kbd> hoặc bấm ngoài để đóng
          </p>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

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
    isLoading,
    loadError,
    volume, 
    currentTrack, 
    currentTrackIndex,
    currentPlaylist,
    playlists,
    isChangingTrack,
    currentTime,
    duration,
    isLooping,
    isShuffled,
    toggle, 
    toggleLoop,
    toggleShuffle,
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
  
  // Meditation reward tracking (80% completion)
  const { showNotification, lastRewardResult, dismissNotification } = useMeditationReward({
    currentTime,
    duration,
    trackId: currentTrack?.id || "",
    trackName: currentTrack?.nameVi || currentTrack?.name || "",
    isPlaying,
  });
  
  const [isDragging, setIsDragging] = useState(false);
  const [breathPhase, setBreathPhase] = useState<"inhale" | "exhale">("inhale");
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [isJourneyOpen, setIsJourneyOpen] = useState(false);
  const [isSleepTimerOpen, setIsSleepTimerOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const prevVolumeRef = useState(0.7); // Store previous volume for mute toggle
  
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

      switch (e.key) {
        case " ": // Spacebar - toggle play/pause
          e.preventDefault();
          toggle();
          showKeyFeedback(isPlaying ? Pause : Play, isPlaying ? "Tạm dừng" : "Phát");
          break;
        case "ArrowLeft": // Seek backward 10 seconds
          e.preventDefault();
          if (duration > 0) {
            const newPercent = Math.max(0, ((currentTime - 10) / duration) * 100);
            seekByPercent(newPercent);
            showKeyFeedback(Rewind, "-10 giây");
          }
          break;
        case "ArrowRight": // Seek forward 10 seconds
          e.preventDefault();
          if (duration > 0) {
            const newPercent = Math.min(100, ((currentTime + 10) / duration) * 100);
            seekByPercent(newPercent);
            showKeyFeedback(FastForward, "+10 giây");
          }
          break;
        case "ArrowUp": // Volume up
          e.preventDefault();
          {
            const newVolume = Math.min(1, volume + 0.1);
            setVolume(newVolume);
            showKeyFeedback(Volume2, `${Math.round(newVolume * 100)}%`);
          }
          break;
        case "ArrowDown": // Volume down
          e.preventDefault();
          {
            const newVolume = Math.max(0, volume - 0.1);
            setVolume(newVolume);
            showKeyFeedback(newVolume > 0 ? Volume2 : VolumeX, `${Math.round(newVolume * 100)}%`);
          }
          break;
        case "m":
        case "M": // Mute/unmute
          e.preventDefault();
          if (volume > 0) {
            prevVolumeRef[1](volume);
            setVolume(0);
            showKeyFeedback(VolumeX, "Tắt tiếng");
          } else {
            const restored = prevVolumeRef[0] || 0.7;
            setVolume(restored);
            showKeyFeedback(Volume2, "Bật tiếng");
          }
          break;
        case "n":
        case "N": // Next track
          e.preventDefault();
          nextTrack();
          showKeyFeedback(SkipForward, "Bản tiếp theo");
          break;
        case "p":
        case "P": // Previous track
          e.preventDefault();
          previousTrack();
          showKeyFeedback(SkipBack, "Bản trước");
          break;
        case "l":
        case "L": // Toggle loop
          e.preventDefault();
          toggleLoop();
          showKeyFeedback(Repeat, isLooping ? "Tắt lặp lại" : "Bật lặp lại");
          break;
        case "s":
        case "S": // Toggle shuffle
          e.preventDefault();
          toggleShuffle();
          showKeyFeedback(Shuffle, isShuffled ? "Tắt ngẫu nhiên" : "Bật ngẫu nhiên");
          break;
        case "?": // Show shortcuts help
          e.preventDefault();
          setIsShortcutsOpen(true);
          break;
        case "Escape": // Close shortcuts overlay
          if (isShortcutsOpen) {
            e.preventDefault();
            setIsShortcutsOpen(false);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggle, nextTrack, previousTrack, toggleLoop, toggleShuffle, seekByPercent, setVolume, volume, currentTime, duration, isPlaying, isLooping, isShuffled, isShortcutsOpen, showKeyFeedback, prevVolumeRef]);

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
      {/* Keyboard shortcuts help overlay */}
      <KeyboardShortcutsOverlay 
        isVisible={isShortcutsOpen} 
        onClose={() => setIsShortcutsOpen(false)} 
      />
      
      {/* Keyboard shortcut feedback indicator */}
      <KeyboardFeedback 
        icon={keyFeedback?.icon || Play} 
        label={keyFeedback?.label || ""} 
        isVisible={keyFeedback !== null} 
      />
      
      {/* Camly Coin reward notification */}
      <CoinRewardAnimation
        show={showNotification && lastRewardResult?.success === true}
        coins={lastRewardResult?.coins || 1000}
        message={lastRewardResult?.message || "Ánh sáng đang lan tỏa qua con!"}
        onClose={dismissNotification}
        variant="meditation"
      />
      
    <section id="meditation" className="relative min-h-screen py-24 px-4 overflow-hidden">
      {/* Immersive background with cosmic golden atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-amber-950/30 to-amber-900/40" />
      
      {/* Forest silhouettes on sides */}
      <div className="absolute bottom-0 left-0 right-0 h-[70%] overflow-hidden pointer-events-none">
        {/* Left forest */}
        <svg className="absolute left-0 bottom-0 h-[60%] w-[25%]" viewBox="0 0 200 300" preserveAspectRatio="xMinYMax slice">
          <defs>
            <linearGradient id="treeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsla(35, 30%, 25%, 0.9)" />
              <stop offset="100%" stopColor="hsla(30, 25%, 15%, 0.95)" />
            </linearGradient>
          </defs>
          {/* Tree silhouettes */}
          <path d="M0 300 L0 180 Q10 170 20 180 L20 120 Q30 100 40 120 L40 90 Q50 60 60 90 L60 140 Q70 130 80 140 L80 200 Q90 190 100 200 L100 160 Q115 130 130 160 L130 220 Q145 210 160 220 L160 250 Q170 240 180 250 L200 250 L200 300 Z" fill="url(#treeGradient)" />
          {/* Individual tall trees */}
          <ellipse cx="30" cy="100" rx="25" ry="60" fill="hsla(35, 25%, 20%, 0.8)" />
          <rect x="27" y="140" width="6" height="160" fill="hsla(30, 20%, 15%, 0.9)" />
          <ellipse cx="80" cy="120" rx="30" ry="70" fill="hsla(32, 25%, 22%, 0.75)" />
          <rect x="77" y="170" width="6" height="130" fill="hsla(30, 20%, 15%, 0.9)" />
          <ellipse cx="140" cy="140" rx="28" ry="65" fill="hsla(35, 25%, 18%, 0.85)" />
          <rect x="137" y="190" width="6" height="110" fill="hsla(30, 20%, 15%, 0.9)" />
        </svg>
        
        {/* Right forest */}
        <svg className="absolute right-0 bottom-0 h-[60%] w-[25%]" viewBox="0 0 200 300" preserveAspectRatio="xMaxYMax slice">
          <path d="M0 250 Q15 240 30 250 L30 220 Q45 210 60 220 L60 170 Q75 150 90 170 L90 130 Q105 100 120 130 L120 90 Q135 60 150 90 L150 120 Q160 110 170 120 L170 180 Q180 170 190 180 L200 180 L200 300 L0 300 Z" fill="url(#treeGradient)" />
          <ellipse cx="60" cy="140" rx="28" ry="65" fill="hsla(32, 25%, 20%, 0.8)" />
          <rect x="57" y="190" width="6" height="110" fill="hsla(30, 20%, 15%, 0.9)" />
          <ellipse cx="120" cy="110" rx="30" ry="70" fill="hsla(35, 25%, 18%, 0.85)" />
          <rect x="117" y="160" width="6" height="140" fill="hsla(30, 20%, 15%, 0.9)" />
          <ellipse cx="170" cy="130" rx="25" ry="55" fill="hsla(32, 25%, 22%, 0.75)" />
          <rect x="167" y="170" width="6" height="130" fill="hsla(30, 20%, 15%, 0.9)" />
        </svg>
      </div>

      {/* Golden water lake at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[35%] overflow-hidden">
        {/* Water base with golden reflection */}
        <div 
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to top, hsla(40, 70%, 45%, 0.5), hsla(45, 60%, 55%, 0.3), hsla(40, 50%, 60%, 0.15), transparent)",
          }}
        />
        
        {/* Animated water ripples */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: "repeating-linear-gradient(0deg, transparent, hsla(45, 80%, 70%, 0.06) 1px, transparent 2px)",
          }}
          animate={{
            backgroundPosition: ["0px 0px", "0px 20px"],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Horizontal water lines */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`waterline-${i}`}
            className="absolute left-0 right-0 h-[1px]"
            style={{
              top: `${15 + i * 12}%`,
              background: "linear-gradient(90deg, transparent, hsla(45, 90%, 70%, 0.3), hsla(45, 100%, 75%, 0.5), hsla(45, 90%, 70%, 0.3), transparent)",
            }}
            animate={{
              opacity: [0.2, 0.6, 0.2],
              scaleX: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
          />
        ))}
        
        {/* Golden light reflections on water */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`reflect-${i}`}
            className="absolute rounded-full"
            style={{
              width: 4 + Math.random() * 8,
              height: 2 + Math.random() * 4,
              left: `${5 + i * 6.5}%`,
              top: `${20 + Math.random() * 60}%`,
              background: "radial-gradient(ellipse, hsla(45, 100%, 80%, 0.9), transparent)",
              boxShadow: "0 0 15px hsla(45, 100%, 70%, 0.7)",
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scaleX: [1, 1.5, 1],
              x: [0, Math.sin(i) * 5, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      


      {/* Golden dust particles rising */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`dust-${i}`}
            className="absolute w-1 h-1 rounded-full bg-gold/60"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: "20%",
            }}
            animate={{
              y: [0, -300, -600],
              opacity: [0, 0.8, 0],
              x: [0, Math.sin(i) * 30, Math.sin(i) * 60],
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeOut",
            }}
          />
        ))}
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
            
            {/* Main breathing circle with Angel AI avatar */}
            <motion.div
              className="relative w-40 h-40 md:w-56 md:h-56 rounded-full flex items-center justify-center"
              animate={{
                scale: breathPhase === "inhale" ? [1, 1.15] : [1.15, 1],
              }}
              transition={{ duration: 4, ease: "easeInOut" }}
            >
              {/* Glowing border */}
              <div 
                className="absolute inset-0 rounded-full bg-gradient-to-br from-gold-light via-gold to-gold-light"
                style={{
                  boxShadow: "0 0 60px hsla(45, 100%, 70%, 0.5), 0 0 100px hsla(45, 100%, 70%, 0.3)",
                }}
              />
              
              {/* Avatar image */}
              <img 
                src={angelAvatar} 
                alt="Angel AI" 
                className="relative w-[calc(100%-8px)] h-[calc(100%-8px)] rounded-full object-cover"
              />
              
              {/* Breathing text overlay */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center rounded-full bg-gradient-to-t from-gold/60 via-transparent to-transparent"
                animate={{ opacity: [0.6, 0.9, 0.6] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <span className="font-serif text-lg md:text-xl text-white tracking-wider drop-shadow-lg mt-auto mb-6">
                  {breathPhase === "inhale" ? "Hít vào..." : "Thở ra..."}
                </span>
              </motion.div>
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
                  {/* Loop Toggle */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.button
                        onClick={toggleLoop}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={`p-2 transition-colors ${
                          isLooping 
                            ? "text-gold" 
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Repeat className={`w-5 h-5 ${isLooping ? "drop-shadow-[0_0_6px_hsla(45,100%,70%,0.6)]" : ""}`} />
                      </motion.button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-background/95 backdrop-blur-sm border-gold-light/30 text-foreground">
                      <p className="text-xs">{isLooping ? "Tắt lặp lại" : "Lặp lại"} <span className="text-muted-foreground ml-1">L</span></p>
                    </TooltipContent>
                  </Tooltip>
                  {/* Shuffle Toggle */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.button
                        onClick={toggleShuffle}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={`p-2 transition-colors ${
                          isShuffled 
                            ? "text-gold" 
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Shuffle className={`w-5 h-5 ${isShuffled ? "drop-shadow-[0_0_6px_hsla(45,100%,70%,0.6)]" : ""}`} />
                      </motion.button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-background/95 backdrop-blur-sm border-gold-light/30 text-foreground">
                      <p className="text-xs">{isShuffled ? "Tắt ngẫu nhiên" : "Ngẫu nhiên"} <span className="text-muted-foreground ml-1">S</span></p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-foreground truncate">{currentTrack.name}</p>
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-shrink-0"
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                          className="w-3 h-3 border border-gold/40 border-t-gold rounded-full"
                        />
                      </motion.div>
                    )}
                    {isLooping && !isLoading && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-shrink-0"
                      >
                        <Repeat className="w-3 h-3 text-gold drop-shadow-[0_0_4px_hsla(45,100%,70%,0.5)]" />
                      </motion.div>
                    )}
                    {isShuffled && !isLoading && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-shrink-0"
                      >
                        <Shuffle className="w-3 h-3 text-gold drop-shadow-[0_0_4px_hsla(45,100%,70%,0.5)]" />
                      </motion.div>
                    )}
                  </div>
                  {loadError ? (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-muted-foreground/80 truncate italic"
                    >
                      ✨ {loadError}
                    </motion.p>
                  ) : isLoading ? (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="text-xs text-gold/60 truncate"
                    >
                      Âm thanh đang được chuẩn bị...
                    </motion.p>
                  ) : (
                    <p className="text-xs text-muted-foreground truncate">{currentTrack.nameVi}</p>
                  )}
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
                className="flex-1 px-4 py-2 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:bg-gold-light/10 transition-colors border-r border-gold-light/20"
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

              {/* Help Button */}
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      onClick={() => setIsShortcutsOpen(true)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 flex items-center justify-center text-muted-foreground hover:text-gold hover:bg-gold-light/10 transition-colors"
                    >
                      <HelpCircle className="w-4 h-4" />
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="top" 
                    className="bg-background/90 backdrop-blur-sm border-gold/20 text-foreground/80 text-xs font-light"
                  >
                    Phím tắt <span className="text-gold/80 ml-1">?</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
