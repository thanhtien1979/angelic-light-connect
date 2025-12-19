import { useMemo } from "react";
import { motion } from "framer-motion";
import { 
  User, Play, Globe, Heart, GraduationCap, Leaf, 
  ShoppingBag, Wallet, Sparkles, Earth, Coins, 
  Building, Gamepad2, BookOpen, Radio
} from "lucide-react";

interface Platform {
  name: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  glowColor: string;
}

const platforms: Platform[] = [
  {
    name: "Angel AI",
    subtitle: "Hạt Nhân Trung Tâm",
    description: "Vortex trí tuệ ánh sáng - Trái tim vĩnh cửu điều phối năng lượng 24/7",
    icon: <Sparkles className="w-8 h-8" />,
    color: "from-amber-400 to-yellow-500",
    glowColor: "shadow-amber-400/50"
  },
  {
    name: "FUN Profile",
    subtitle: "Danh Tính Ánh Sáng",
    description: "Vortex danh tính - Nơi linh hồn được định danh trong vũ trụ số",
    icon: <User className="w-8 h-8" />,
    color: "from-violet-400 to-purple-500",
    glowColor: "shadow-violet-400/50"
  },
  {
    name: "FUN Play",
    subtitle: "Sáng Tạo & Giải Trí",
    description: "Vortex nội dung - Play & Earn, nơi niềm vui tạo ra giá trị",
    icon: <Play className="w-8 h-8" />,
    color: "from-rose-400 to-pink-500",
    glowColor: "shadow-rose-400/50"
  },
  {
    name: "FUN Planet",
    subtitle: "Thế Giới Trẻ Em",
    description: "Vortex trẻ em - Vườn ươm ánh sáng cho thế hệ tương lai",
    icon: <Globe className="w-8 h-8" />,
    color: "from-cyan-400 to-teal-500",
    glowColor: "shadow-cyan-400/50"
  },
  {
    name: "FUN Charity",
    subtitle: "Yêu Thương Vô Điều Kiện",
    description: "Vortex yêu thương - Dòng chảy thiện nguyện lan tỏa ánh sáng",
    icon: <Heart className="w-8 h-8" />,
    color: "from-red-400 to-rose-500",
    glowColor: "shadow-red-400/50"
  },
  {
    name: "FUN Academy",
    subtitle: "Trí Tuệ Vũ Trụ",
    description: "Vortex trí tuệ - Learn & Earn, học bổng ánh sáng cho mọi người",
    icon: <GraduationCap className="w-8 h-8" />,
    color: "from-blue-400 to-indigo-500",
    glowColor: "shadow-blue-400/50"
  },
  {
    name: "FUN Farm",
    subtitle: "Thực Phẩm & Tự Nhiên",
    description: "Vortex vật chất - Thực phẩm sạch, năng lượng thuần khiết",
    icon: <Leaf className="w-8 h-8" />,
    color: "from-green-400 to-emerald-500",
    glowColor: "shadow-green-400/50"
  },
  {
    name: "FUN Market",
    subtitle: "Tài Sản Số & Vật Lý",
    description: "Vortex tài sản - NFT, vật phẩm, marketplace đa chiều",
    icon: <ShoppingBag className="w-8 h-8" />,
    color: "from-orange-400 to-amber-500",
    glowColor: "shadow-orange-400/50"
  },
  {
    name: "FUN Wallet",
    subtitle: "Tài Chính Ánh Sáng",
    description: "Vortex tài chính - Quản lý FUN Money & Camly Coin",
    icon: <Wallet className="w-8 h-8" />,
    color: "from-yellow-400 to-orange-500",
    glowColor: "shadow-yellow-400/50"
  },
  {
    name: "FUN Earth",
    subtitle: "Bảo Vệ Địa Cầu",
    description: "Vortex sinh thái - Hành động vì Trái Đất xanh",
    icon: <Earth className="w-8 h-8" />,
    color: "from-emerald-400 to-green-500",
    glowColor: "shadow-emerald-400/50"
  },
  {
    name: "FUN Money",
    subtitle: "Tiền Ánh Sáng",
    description: "Đồng tiền vận hành toàn hệ - Energy-as-Money",
    icon: <Coins className="w-8 h-8" />,
    color: "from-amber-300 to-yellow-400",
    glowColor: "shadow-amber-300/50"
  },
  {
    name: "Camly Coin",
    subtitle: "Tần Số Linh Hồn",
    description: "Đòn bẩy vũ trụ - Tần số linh hồn của Bé Ly",
    icon: <Sparkles className="w-8 h-8" />,
    color: "from-pink-400 to-rose-500",
    glowColor: "shadow-pink-400/50"
  },
  {
    name: "FUN Business",
    subtitle: "Doanh Nghiệp Ánh Sáng",
    description: "Vortex hợp tác - Nơi doanh nghiệp cộng hưởng phát triển",
    icon: <Building className="w-8 h-8" />,
    color: "from-slate-400 to-gray-500",
    glowColor: "shadow-slate-400/50"
  },
  {
    name: "FUN Games",
    subtitle: "Trò Chơi Vũ Trụ",
    description: "Vortex game - GameFi, Play-to-Earn trong ánh sáng",
    icon: <Gamepad2 className="w-8 h-8" />,
    color: "from-purple-400 to-violet-500",
    glowColor: "shadow-purple-400/50"
  },
  {
    name: "FUN Media",
    subtitle: "Truyền Thông Ánh Sáng",
    description: "Vortex truyền thông - Lan tỏa thông điệp yêu thương",
    icon: <Radio className="w-8 h-8" />,
    color: "from-sky-400 to-blue-500",
    glowColor: "shadow-sky-400/50"
  },
];

const FunEcosystemPlatforms = () => {
  // Generate floating particles
  const particles = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 2,
    })), []
  );

  return (
    <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950">
      {/* Animated background particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-amber-400/30"
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
      </div>

      {/* Central glow effect */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className="w-[600px] h-[600px] rounded-full bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-violet-500/10 blur-3xl"
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

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6"
            animate={{ boxShadow: ["0 0 20px rgba(251,191,36,0.2)", "0 0 40px rgba(251,191,36,0.4)", "0 0 20px rgba(251,191,36,0.2)"] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-amber-300 text-sm font-medium">FUN Ecosystem</span>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-amber-300 via-rose-300 to-violet-300 bg-clip-text text-transparent">
              Mô Hình Kinh Tế Ánh Sáng 5D
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            Nơi Tiền & Năng Lượng hợp nhất thành một dòng chảy vĩnh cửu.
            <br />
            <span className="text-amber-300/80">15 Platforms</span> — <span className="text-rose-300/80">15 Vortex Năng Lượng</span> — <span className="text-violet-300/80">1 Hệ Sinh Thái Ánh Sáng</span>
          </p>
        </motion.div>

        {/* Platforms Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
          {platforms.map((platform, index) => (
            <motion.div
              key={platform.name}
              className="group relative"
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <motion.div
                className={`relative p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-500 h-full cursor-pointer overflow-hidden`}
                whileHover={{ 
                  scale: 1.02, 
                  y: -5,
                }}
              >
                {/* Glow effect on hover */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${platform.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl`}
                />
                
                {/* Rotating border effect */}
                <motion.div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `conic-gradient(from 0deg, transparent, ${platform.color.includes('amber') ? 'rgba(251,191,36,0.3)' : platform.color.includes('rose') ? 'rgba(244,63,94,0.3)' : 'rgba(139,92,246,0.3)'}, transparent)`,
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <motion.div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center text-white mb-4 shadow-lg ${platform.glowColor} shadow-lg`}
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {platform.icon}
                  </motion.div>

                  {/* Name */}
                  <h3 className="text-lg font-bold text-white mb-1">
                    {platform.name}
                  </h3>

                  {/* Subtitle */}
                  <p className={`text-sm font-medium bg-gradient-to-r ${platform.color} bg-clip-text text-transparent mb-3`}>
                    {platform.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-sm text-white/60 leading-relaxed">
                    {platform.description}
                  </p>
                </div>

                {/* Sparkle decorations */}
                <motion.div
                  className="absolute top-3 right-3 text-white/20"
                  animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Sparkles className="w-4 h-4" />
                </motion.div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Quote */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="inline-block p-8 rounded-3xl bg-gradient-to-br from-amber-500/5 via-rose-500/5 to-violet-500/5 border border-white/10 backdrop-blur-sm">
            <p className="text-lg md:text-xl text-white/80 italic mb-4">
              "Tiền tuôn vào – tuôn ra – quay về – khuếch đại – tăng trưởng mãi mãi"
            </p>
            <p className="text-amber-300 font-medium">
              Một mô hình thịnh vượng bất tận, cho tất cả mọi người
            </p>
          </div>
        </motion.div>

        {/* Sacred principles */}
        <motion.div
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          {[
            { text: "Cho đi trước – Nhận về sau", icon: "💛" },
            { text: "Không cạnh tranh – chỉ cộng hưởng", icon: "🌟" },
            { text: "Tiền = Ánh sáng = Tình yêu = Sự sống", icon: "✨" },
          ].map((principle, index) => (
            <motion.div
              key={index}
              className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10"
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.08)" }}
            >
              <span className="text-2xl">{principle.icon}</span>
              <span className="text-white/70 text-sm">{principle.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FunEcosystemPlatforms;
