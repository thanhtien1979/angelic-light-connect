import { motion } from "framer-motion";
import { useMemo } from "react";
import { ArrowLeft, Heart, Sparkles, Star } from "lucide-react";
import { Link } from "react-router-dom";
import angelAiLogo from "@/assets/angel-ai-logo.png";

// Angel avatar imports
import angelAvatar1 from "@/assets/angel-avatar-1.png";
import angelAvatar2 from "@/assets/angel-avatar-2.png";
import angelAvatar3 from "@/assets/angel-avatar-3.png";
import angelAvatar4 from "@/assets/angel-avatar-4.png";
import angelAvatar5 from "@/assets/angel-avatar-5.png";
import angelAvatar6 from "@/assets/angel-avatar-6.png";
import angelAvatar7 from "@/assets/angel-avatar-7.png";
import angelAvatar8 from "@/assets/angel-avatar-8.webp";
import angelAvatar9 from "@/assets/angel-avatar-9.png";
import angelAvatar10 from "@/assets/angel-avatar-10.png";
import angelAvatar11 from "@/assets/angel-avatar-11.png";
import angelAvatar12 from "@/assets/angel-avatar-12.png";
import angelAvatar13 from "@/assets/angel-avatar-13.png";

// Angel video imports
import angelVideo1 from "@/assets/angel-video-1.mp4";
import angelVideo2 from "@/assets/angel-video-2.mp4";
import angelVideo3 from "@/assets/angel-video-3.mp4";
import angelVideo4 from "@/assets/angel-video-4.mp4";
import grokAngel1 from "@/assets/grok-angel-1.mp4";
import grokAngel2 from "@/assets/grok-angel-2.mp4";
import grokAngel3 from "@/assets/grok-angel-3.mp4";
import thanhTienVideo from "@/assets/thanh-tien-video.mp4";
import thanhTienVideoNew from "@/assets/thanh-tien-video-new.mp4";
import angelMinhQuan from "@/assets/angel-minh-quan.mp4";
import angelVanHoang from "@/assets/angel-van-hoang.mp4";
import angelQuangVu from "@/assets/angel-quang-vu.mp4";
import angelMinhTri from "@/assets/angel-minh-tri.mp4";
import angelBachViet from "@/assets/angel-bach-viet.mp4";
import angelThanhTinh from "@/assets/angel-thanh-tinh.mp4";

interface Angel {
  name: string;
  color: string;
  glowColor: string;
  link?: string;
  avatar?: string;
  video?: string;
}

const angels: Angel[] = [
  { name: "ÁI VÂN", color: "from-pink-400 to-rose-500", glowColor: "rgba(236,72,153,0.6)", link: "https://angelai.lovable.app", avatar: angelAvatar7 },
  { name: "QUANG VŨ", color: "from-orange-400 to-amber-500", glowColor: "rgba(251,146,60,0.6)", link: "https://angelquangvu.fun.rich/", video: angelMinhTri },
  { name: "THU TRANG", color: "from-purple-400 to-violet-500", glowColor: "rgba(168,85,247,0.6)", link: "https://angel-ai-732b8bac.base44.app", avatar: angelAvatar5 },
  { name: "HOÀI AN", color: "from-emerald-400 to-green-500", glowColor: "rgba(52,211,153,0.6)", avatar: angelAvatar4 },
  { name: "NGUYỄN HOA", color: "from-rose-400 to-pink-500", glowColor: "rgba(251,113,133,0.6)", avatar: angelAvatar2 },
  { name: "VĂN HOÀNG", color: "from-red-400 to-rose-500", glowColor: "rgba(248,113,113,0.6)", link: "https://angelai-fun-rich.lovable.app/", video: angelVanHoang },
  { name: "CÔ KIM", color: "from-yellow-400 to-amber-500", glowColor: "rgba(250,204,21,0.6)", avatar: angelAvatar1 },
  { name: "MINH QUÂN", color: "from-blue-400 to-cyan-500", glowColor: "rgba(96,165,250,0.6)", link: "https://cosmic-angel-aether.lovable.app/", video: angelQuangVu },
  { name: "QUẾ ANH", color: "from-fuchsia-400 to-pink-500", glowColor: "rgba(232,121,249,0.6)", avatar: angelAvatar6 },
  { name: "DIỆU NGỌC", color: "from-violet-400 to-purple-500", glowColor: "rgba(139,92,246,0.6)", link: "https://angeldieungoc.fun.rich", avatar: angelAvatar3 },
  { name: "KHẢ NHI", color: "from-fuchsia-400 to-pink-500", glowColor: "rgba(232,121,249,0.6)", link: "https://angelkhanhi.fun.rich", video: angelVideo1 },
  { name: "MINH TRÍ", color: "from-gray-200 to-white", glowColor: "rgba(255,255,255,0.6)", link: "https://angelminhtri.fun.rich", video: angelMinhQuan },
  { name: "BÁCH VIỆT", color: "from-orange-400 to-red-500", glowColor: "rgba(251,146,60,0.6)", link: "https://angelbachviet.fun.rich/", video: angelBachViet },
  { name: "NGỌC GIÀU", color: "from-lime-400 to-green-500", glowColor: "rgba(163,230,53,0.6)", avatar: angelAvatar9 },
  { name: "THIÊN HẠNH", color: "from-sky-400 to-cyan-500", glowColor: "rgba(56,189,248,0.6)", avatar: angelAvatar10 },
  { name: "BÍCH LIÊN", color: "from-teal-400 to-emerald-500", glowColor: "rgba(45,212,191,0.6)", avatar: angelAvatar11 },
  { name: "HUỲNH THỦY", color: "from-blue-500 to-indigo-600", glowColor: "rgba(59,130,246,0.6)", avatar: angelAvatar12 },
  { name: "QUỲNH HOA", color: "from-pink-500 to-rose-600", glowColor: "rgba(236,72,153,0.6)", avatar: angelAvatar13 },
  { name: "THÀNH TÍNH", color: "from-slate-400 to-gray-500", glowColor: "rgba(148,163,184,0.6)", video: angelThanhTinh },
  { name: "THU HÀ", color: "from-amber-500 to-yellow-600", glowColor: "rgba(245,158,11,0.6)", video: grokAngel1 },
  { name: "NGỌC LẮM", color: "from-emerald-500 to-teal-600", glowColor: "rgba(16,185,129,0.6)", video: grokAngel2 },
  { name: "ÁNH NGUYỆT", color: "from-purple-500 to-indigo-600", glowColor: "rgba(147,51,234,0.6)", video: grokAngel3 },
  { name: "KIỀU PHI", color: "from-rose-500 to-fuchsia-500", glowColor: "rgba(244,63,94,0.6)", video: thanhTienVideo },
  { name: "THANH TIÊN", color: "from-sky-400 to-blue-500", glowColor: "rgba(56,189,248,0.6)", link: "https://angelthanhtien.fun.rich", video: thanhTienVideoNew },
];

const AngelAITeam = () => {
  // Generate floating particles
  const particles = useMemo(() =>
    Array.from({ length: 40 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 2,
    })), []
  );

  // Generate floating stars
  const stars = useMemo(() =>
    Array.from({ length: 25 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 10 + Math.random() * 15,
      duration: 4 + Math.random() * 3,
      delay: Math.random() * 3,
    })), []
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-rose-200 via-pink-200 to-rose-100">
      {/* Animated background particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-rose-400/40"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Floating stars */}
        {stars.map((star, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute text-yellow-400/60"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.4, 1, 0.4],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              delay: star.delay,
              ease: "easeInOut",
            }}
          >
            <Star size={star.size} fill="currentColor" />
          </motion.div>
        ))}
      </div>

      {/* Central glow effect */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className="w-[800px] h-[800px] rounded-full bg-gradient-to-r from-rose-300/30 via-pink-300/30 to-rose-200/30 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-rose-700 hover:text-rose-900 font-medium mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại Ecosystem
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Angel AI Logo */}
          <motion.div
            className="relative inline-block mb-8"
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-pink-500/40 via-rose-500/40 to-purple-500/40 blur-3xl rounded-full"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <img 
              src={angelAiLogo} 
              alt="Angel AI" 
              className="relative w-40 h-40 object-cover rounded-full ring-4 ring-pink-400 shadow-[0_0_40px_rgba(236,72,153,0.6)]"
            />
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span 
              style={{
                background: "linear-gradient(90deg, #FF6B9D 0%, #C084FC 50%, #F472B6 100%)",
                backgroundSize: "200% 100%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "rainbowShift 5s linear infinite",
              }}
            >
              Angel AI Team
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-rose-900 max-w-3xl mx-auto leading-relaxed font-medium">
            Đội ngũ <span className="text-pink-600 font-bold">23 Thiên Thần</span> — Những người đồng hành lan tỏa ánh sáng yêu thương
          </p>

          <motion.div 
            className="flex items-center justify-center gap-2 mt-4"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <span className="text-rose-700 font-semibold">Yêu thương vô điều kiện</span>
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
          </motion.div>
        </motion.div>

        {/* Angels Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {angels.map((angel, index) => {
            const angelId = angel.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").replace(/\s+/g, "-");
            
            return (
              <motion.div
                key={angel.name}
                className="group relative"
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <Link to={`/angel-ai-team/${angelId}`} className="block h-full">
                  <motion.div
                    className="relative p-5 rounded-2xl bg-white/70 backdrop-blur-sm border border-rose-300/50 hover:border-pink-400/70 transition-all duration-500 h-full cursor-pointer overflow-hidden shadow-lg shadow-rose-200/30"
                    whileHover={{ 
                      scale: 1.05,
                      y: -8,
                    }}
                  >
                {/* Glow effect on hover */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${angel.color} opacity-0 group-hover:opacity-15 transition-opacity duration-500 rounded-2xl`}
                />
                
                {/* Rotating border effect */}
                <motion.div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `conic-gradient(from 0deg, transparent, ${angel.glowColor}, transparent)`,
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center text-center">
                  {/* Avatar */}
                  <motion.div
                    className={`w-16 h-16 rounded-full bg-gradient-to-br ${angel.color} flex items-center justify-center text-white mb-3 shadow-lg overflow-hidden`}
                    style={{ boxShadow: `0 0 20px ${angel.glowColor}` }}
                    whileHover={{ 
                      rotate: [0, -5, 5, -5, 0], 
                      scale: 1.1,
                    }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  >
                    {angel.video ? (
                      <video 
                        src={angel.video} 
                        autoPlay 
                        loop 
                        muted 
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : angel.avatar ? (
                      <img src={angel.avatar} alt={angel.name} className="w-full h-full object-cover" />
                    ) : (
                      <Sparkles className="w-7 h-7" />
                    )}
                  </motion.div>

                  {/* Name */}
                  <h3 className={`text-sm font-bold bg-gradient-to-r ${angel.color} bg-clip-text text-transparent`}>
                    {angel.name}
                  </h3>

                  {/* Role label */}
                  <span className="text-xs text-rose-600 mt-1 font-medium">Angel AI</span>
                </div>

                  {/* Sparkle particles on hover */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                  >
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full"
                        style={{
                          left: `${20 + Math.random() * 60}%`,
                          top: `${20 + Math.random() * 60}%`,
                        }}
                        animate={{
                          y: [-5, 5, -5],
                          opacity: [0, 1, 0],
                          scale: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </motion.div>
                </motion.div>
              </Link>
            </motion.div>
          );
        })}
        </div>

        {/* Bottom Quote */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <p className="text-xl md:text-2xl italic text-rose-800 font-medium">
            "Mỗi Thiên Thần là một tia sáng, cùng nhau tạo nên mặt trời yêu thương"
          </p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
          </div>
        </motion.div>
      </div>

      {/* Rainbow animation keyframes */}
      <style>{`
        @keyframes rainbowShift {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>
    </div>
  );
};

export default AngelAITeam;
