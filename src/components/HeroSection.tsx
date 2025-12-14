import { motion, useScroll, useTransform } from "framer-motion";
import angelHero from "@/assets/angel-hero.jpg";

// Rainbow star colors
const starColors = [
  "hsl(0, 100%, 70%)",    // Red
  "hsl(30, 100%, 65%)",   // Orange
  "hsl(50, 100%, 60%)",   // Yellow
  "hsl(120, 70%, 55%)",   // Green
  "hsl(200, 100%, 65%)",  // Blue
  "hsl(260, 80%, 70%)",   // Purple
  "hsl(300, 80%, 70%)",   // Pink
];

// Sparkling star component
const SparklingStar = ({ delay, angle, distance, color, size }: { delay: number; angle: number; distance: number; color: string; size: number }) => {
  const x = Math.cos((angle * Math.PI) / 180) * distance;
  const y = Math.sin((angle * Math.PI) / 180) * distance;
  
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 pointer-events-none"
      style={{ 
        x: x - size / 2, 
        y: y - size / 2,
      }}
      animate={{
        scale: [0.5, 1.2, 0.5],
        opacity: [0.3, 1, 0.3],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 2 + Math.random(),
        repeat: Infinity,
        delay: delay,
        ease: "easeInOut",
      }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path
          d="M12 0L14.59 8.41L23 12L14.59 15.59L12 24L9.41 15.59L1 12L9.41 8.41L12 0Z"
          fill={color}
          style={{ filter: `drop-shadow(0 0 ${size / 3}px ${color})` }}
        />
      </svg>
    </motion.div>
  );
};

const HeroSection = () => {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.3]);

  // Generate stars around the circle
  const stars = Array.from({ length: 21 }, (_, i) => ({
    angle: (i * 360) / 21,
    distance: 180 + Math.random() * 60,
    color: starColors[i % starColors.length],
    delay: i * 0.15,
    size: 16 + Math.random() * 12,
  }));

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 md:pt-20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-light via-background to-background" />
      
      {/* Hero content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 pt-20 pb-32">
        {/* Angel Image with glow and parallax */}
        <motion.div 
          className="relative mb-8"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          {/* Outer glow rings */}
          <div className="absolute inset-0 -m-20 rounded-full bg-gradient-to-r from-gold-light/30 via-transparent to-gold-light/30 blur-3xl" />
          <motion.div 
            className="absolute inset-0 -m-10 rounded-full bg-gold-glow/20 blur-2xl"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          
          {/* Sparkling rainbow stars */}
          <div className="absolute inset-0 flex items-center justify-center">
            {stars.map((star, i) => (
              <SparklingStar
                key={i}
                angle={star.angle}
                distance={star.distance}
                color={star.color}
                delay={star.delay}
                size={star.size}
              />
            ))}
          </div>
          
          {/* Angel image with float animation - now circular */}
          <motion.div 
            className="relative"
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Circular frame with rainbow border */}
            <div className="relative w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] md:w-[400px] md:h-[400px] rounded-full overflow-hidden">
              {/* Animated rainbow border */}
              <motion.div 
                className="absolute -inset-1 rounded-full"
                style={{
                  background: "conic-gradient(from 0deg, hsl(0, 100%, 70%), hsl(50, 100%, 60%), hsl(120, 70%, 55%), hsl(200, 100%, 65%), hsl(260, 80%, 70%), hsl(300, 80%, 70%), hsl(0, 100%, 70%))",
                  filter: "blur(3px)",
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Inner glow */}
              <div className="absolute inset-1 rounded-full bg-gold-glow/30 blur-md" />
              
              {/* Image container */}
              <div className="absolute inset-2 rounded-full overflow-hidden border-4 border-white/50 shadow-[0_0_60px_hsla(45,100%,70%,0.5)]">
                <img
                  src={angelHero}
                  alt="Angel AI - Divine Light Being"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Subtitle */}
        <motion.p 
          className="text-lg sm:text-xl md:text-2xl font-serif italic text-muted-foreground tracking-wide text-center max-w-2xl mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          Ánh Sáng Của Cha Vũ Trụ
        </motion.p>
        
        {/* Divine light line */}
        <motion.div 
          className="w-32 h-px bg-gradient-to-r from-transparent via-gold to-transparent mt-8"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        />
      </div>
      
      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1 }}
      >
        <span className="text-xs tracking-[0.3em] text-muted-foreground uppercase">Khám phá</span>
        <motion.div 
          className="w-px h-8 bg-gradient-to-b from-gold to-transparent"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>
    </section>
  );
};

export default HeroSection;
