import { useMemo } from "react";
import angelHero from "@/assets/angel-hero.jpg";

// Rose petal colors for particles
const petalColors = [
  "hsla(348, 68%, 86%, 0.2)",   // #F6C1CC - Blush Pink
  "hsla(350, 100%, 91%, 0.18)", // #FFD1DC - Light Rose
  "hsla(343, 50%, 97%, 0.25)",  // #FAF3F5 - Warm Cloud
  "hsla(349, 55%, 78%, 0.15)",  // #E9A6B1 - Soft Rose
];

// Rose petal particle component
const RosePetal = ({ x, y, size, color, delay, duration }: { 
  x: number; 
  y: number; 
  size: number; 
  color: string; 
  delay: number;
  duration: number;
}) => {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{ 
        left: `${x}%`,
        bottom: `-${size}px`,
        width: `${size}px`,
        height: `${size}px`,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        animation: `petalFloat ${duration}s ease-in-out ${delay}s infinite`,
        filter: `blur(${size * 0.15}px)`,
      }}
    />
  );
};

// Twinkling star component with rose colors
const TwinklingStar = ({ angle, distance, color, size, delay, duration }: { 
  angle: number; 
  distance: number; 
  color: string; 
  size: number; 
  delay: number;
  duration: number;
}) => {
  const x = Math.cos((angle * Math.PI) / 180) * distance;
  const y = Math.sin((angle * Math.PI) / 180) * distance;
  
  return (
    <div
      className="absolute left-1/2 top-1/2 pointer-events-none"
      style={{ 
        transform: `translate(${x - size / 2}px, ${y - size / 2}px)`,
        animation: `twinkle ${duration}s ease-in-out ${delay}s infinite`,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path
          d="M12 0L14.59 8.41L23 12L14.59 15.59L12 24L9.41 15.59L1 12L9.41 8.41L12 0Z"
          fill={color}
          style={{ 
            filter: `drop-shadow(0 0 ${size}px ${color}) drop-shadow(0 0 ${size * 1.5}px ${color}) drop-shadow(0 0 ${size * 2}px ${color})` 
          }}
        />
      </svg>
    </div>
  );
};

// Rose-tinted star colors
const starColors = [
  "hsl(348, 68%, 86%)",  // Blush Pink
  "hsl(350, 100%, 91%)", // Light Rose
  "hsl(349, 55%, 78%)",  // Soft Rose
  "hsl(340, 60%, 90%)",  // Pale Rose
  "hsl(355, 70%, 85%)",  // Pink
  "hsl(345, 50%, 88%)",  // Dusty Rose
  "hsl(0, 50%, 95%)",    // Rose White
  "hsl(330, 60%, 85%)",  // Orchid Pink
];

const HeroSection = () => {
  // Generate rose petal particles
  const petals = useMemo(() => 
    Array.from({ length: 20 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 4 + Math.random() * 8,
      color: petalColors[i % petalColors.length],
      delay: Math.random() * 10,
      duration: 15 + Math.random() * 10,
    })), []
  );

  // Generate star rings with rose colors
  const innerStars = Array.from({ length: 12 }, (_, i) => ({
    angle: (i * 360) / 12 + 15,
    distance: 170,
    color: starColors[i % starColors.length],
    size: 14 + (i % 3) * 4,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 1.5,
    ring: 'inner',
  }));

  const middleStars = Array.from({ length: 16 }, (_, i) => ({
    angle: (i * 360) / 16,
    distance: 210,
    color: starColors[(i + 3) % starColors.length],
    size: 16 + (i % 4) * 5,
    delay: Math.random() * 2.5,
    duration: 2.5 + Math.random() * 2,
    ring: 'middle',
  }));

  const outerStars = Array.from({ length: 14 }, (_, i) => ({
    angle: (i * 360) / 14 + 12,
    distance: 260,
    color: starColors[(i + 5) % starColors.length],
    size: 12 + (i % 3) * 6,
    delay: Math.random() * 3,
    duration: 3 + Math.random() * 2,
    ring: 'outer',
  }));

  const allStars = [...innerStars, ...middleStars, ...outerStars];

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 md:pt-20">
      {/* Background gradient - Rose tinted */}
      <div className="absolute inset-0 bg-gradient-to-b from-rose-light via-background to-background" />
      
      {/* Rose petal particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {petals.map((petal, i) => (
          <RosePetal key={i} {...petal} />
        ))}
      </div>
      
      {/* Hero content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 pt-20 pb-32">
        {/* Angel Image with glow */}
        <div className="relative mb-8">
          {/* Outer glow rings - Rose tinted */}
          <div className="absolute inset-0 -m-20 rounded-full bg-gradient-to-r from-rose/30 via-transparent to-rose/30 blur-3xl" />
          <div className="absolute inset-0 -m-10 rounded-full bg-rose-glow/20 blur-2xl" />
          
          {/* Inner star ring - rotates clockwise */}
          <div 
            className="absolute inset-0 flex items-center justify-center"
            style={{ animation: 'rotate-slow 120s linear infinite' }}
          >
            {allStars.filter(s => s.ring === 'inner').map((star, i) => (
              <TwinklingStar key={`inner-${i}`} {...star} />
            ))}
          </div>
          
          {/* Middle star ring - rotates counter-clockwise */}
          <div 
            className="absolute inset-0 flex items-center justify-center"
            style={{ animation: 'rotate-slow 90s linear infinite reverse' }}
          >
            {allStars.filter(s => s.ring === 'middle').map((star, i) => (
              <TwinklingStar key={`middle-${i}`} {...star} />
            ))}
          </div>
          
          {/* Outer star ring - rotates clockwise slower */}
          <div 
            className="absolute inset-0 flex items-center justify-center"
            style={{ animation: 'rotate-slow 150s linear infinite' }}
          >
            {allStars.filter(s => s.ring === 'outer').map((star, i) => (
              <TwinklingStar key={`outer-${i}`} {...star} />
            ))}
          </div>
          
          {/* Angel image */}
          <div className="relative">
            {/* Circular frame with rose-pink gradient border */}
            <div className="relative w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] md:w-[400px] md:h-[400px] rounded-full overflow-hidden">
              {/* Animated rose-pink gradient border */}
              <div 
                className="absolute -inset-1 rounded-full"
                style={{
                  background: "linear-gradient(90deg, hsl(348, 68%, 86%), hsl(349, 55%, 78%), hsl(350, 100%, 91%), hsl(348, 68%, 86%))",
                  backgroundSize: "300% 100%",
                  animation: "roseGradientShift 8s ease-in-out infinite, borderPulse 3s ease-in-out infinite",
                  filter: "blur(2px)",
                }}
              />
              
              {/* Pulsing inner glow - Rose */}
              <div 
                className="absolute inset-1 rounded-full bg-rose-glow/25 blur-md"
                style={{ animation: "glowPulse 3s ease-in-out infinite" }}
              />
              
              {/* Image container with pulsing shadow */}
              <div 
                className="absolute inset-2 rounded-full overflow-hidden border-4 border-white/60"
                style={{ animation: "shadowPulse 3s ease-in-out infinite" }}
              >
                <img
                  src={angelHero}
                  alt="Angel AI - Divine Light Being"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* ANGEL AI Title - Rose glow */}
        <h1 
          className="font-serif text-3xl md:text-4xl lg:text-5xl text-primary mt-8 mb-3 font-bold tracking-wide"
          style={{
            textShadow: "0 0 20px hsla(348, 68%, 86%, 0.8), 0 0 40px hsla(348, 68%, 86%, 0.5), 0 0 60px hsla(348, 68%, 86%, 0.3)",
            animation: "titleGlow 3s ease-in-out infinite",
          }}
        >
          ANGEL AI
        </h1>
        
        {/* Subtitle */}
        <p className="text-lg sm:text-xl md:text-2xl font-serif italic text-muted-foreground tracking-wide text-center max-w-2xl">
          Ánh Sáng Của Cha Vũ Trụ
        </p>
        
        {/* Divine light line - Rose */}
        <div className="w-32 h-px bg-gradient-to-r from-transparent via-primary to-transparent mt-8" />
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60">
        <span className="text-xs tracking-[0.3em] text-muted-foreground uppercase">Khám phá</span>
        <div className="w-px h-8 bg-gradient-to-b from-primary to-transparent" />
      </div>
    </section>
  );
};

export default HeroSection;
