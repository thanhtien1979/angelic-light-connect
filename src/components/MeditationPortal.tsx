import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Sun, Sparkles, Play, Pause, Volume2, VolumeX, Music, ChevronDown, Check } from "lucide-react";
import { useMeditationAudio, AudioTrack } from "@/hooks/useMeditationAudio";

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

const MeditationPortal = () => {
  const { 
    isPlaying, 
    isLoaded, 
    volume, 
    currentTrack, 
    tracks, 
    isChangingTrack,
    toggle, 
    setVolume, 
    selectTrack 
  } = useMeditationAudio();
  const [breathPhase, setBreathPhase] = useState<"inhale" | "exhale">("inhale");
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);

  // Breathing animation toggle
  useEffect(() => {
    const interval = setInterval(() => {
      setBreathPhase((prev) => (prev === "inhale" ? "exhale" : "inhale"));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleTrackSelect = (track: AudioTrack) => {
    selectTrack(track);
    setIsPlaylistOpen(false);
  };

  return (
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

        {/* Ambient Audio Player with Playlist */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="max-w-md mx-auto"
        >
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-gold-light/30 overflow-hidden">
            {/* Main Player */}
            <div className="p-4 flex items-center gap-4">
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
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{currentTrack.name}</p>
                <p className="text-xs text-muted-foreground truncate">{currentTrack.nameVi}</p>
                <p className="text-xs text-gold mt-0.5">
                  {isChangingTrack ? "Đang chuyển..." : isPlaying ? "Đang phát..." : isLoaded ? "Sẵn sàng" : "Đang tải..."}
                </p>
              </div>
              
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
            </div>

            {/* Playlist Toggle */}
            <button
              onClick={() => setIsPlaylistOpen(!isPlaylistOpen)}
              className="w-full px-4 py-2 flex items-center justify-center gap-2 border-t border-gold-light/20 text-sm text-muted-foreground hover:text-foreground hover:bg-gold-light/10 transition-colors"
            >
              <Music className="w-4 h-4" />
              <span>Chọn bài thiền định</span>
              <motion.div
                animate={{ rotate: isPlaylistOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </button>

            {/* Playlist */}
            <motion.div
              initial={false}
              animate={{ height: isPlaylistOpen ? "auto" : 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="border-t border-gold-light/20 p-2 space-y-1">
                {tracks.map((track) => (
                  <motion.button
                    key={track.id}
                    onClick={() => handleTrackSelect(track)}
                    whileHover={{ x: 4 }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors text-left ${
                      currentTrack.id === track.id
                        ? "bg-gold-light/20 text-gold"
                        : "text-foreground hover:bg-gold-light/10"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      currentTrack.id === track.id
                        ? "bg-gradient-to-br from-gold to-gold-light"
                        : "bg-gold-light/20"
                    }`}>
                      {currentTrack.id === track.id ? (
                        <Check className="w-4 h-4 text-white" />
                      ) : (
                        <Music className="w-4 h-4 text-gold" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{track.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{track.nameVi}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MeditationPortal;
