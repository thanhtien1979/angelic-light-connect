import { useMemo } from "react";
import angelHero from "@/assets/angel-hero.png";
import ChatPortal from "@/components/ChatPortal";

// Deeper rose petal colors for particles - more vibrant
const petalColors = [
  "hsla(348, 80%, 75%, 0.35)",   // Vibrant Rose
  "hsla(350, 85%, 80%, 0.30)",   // Bright Pink
  "hsla(343, 70%, 85%, 0.40)",   // Warm Rose
  "hsla(349, 75%, 70%, 0.25)",   // Deep Rose
  "hsla(340, 80%, 78%, 0.32)",   // Coral Pink
];

// Shimmer sparkle component
const Shimmer = ({ x, y, size, delay }: { x: number; y: number; size: number; delay: number }) => (
  <div
    className="absolute rounded-full pointer-events-none"
    style={{
      left: `${x}%`,
      top: `${y}%`,
      width: `${size}px`,
      height: `${size}px`,
      background: "radial-gradient(circle, hsla(0, 0%, 100%, 0.9) 0%, hsla(348, 80%, 90%, 0.5) 40%, transparent 70%)",
      animation: `shimmer ${2 + Math.random()}s ease-in-out ${delay}s infinite`,
    }}
  />
);

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
        filter: `blur(${size * 0.1}px)`,
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

interface HeroSectionProps {
  onOpenAuth?: () => void;
}

const HeroSection = ({ onOpenAuth }: HeroSectionProps) => {
  // Generate rose petal particles - more density
  const petals = useMemo(() => 
    Array.from({ length: 30 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 6 + Math.random() * 12,
      color: petalColors[i % petalColors.length],
      delay: Math.random() * 8,
      duration: 12 + Math.random() * 8,
    })), []
  );

  // Generate shimmer sparkles
  const shimmers = useMemo(() =>
    Array.from({ length: 25 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 3 + Math.random() * 5,
      delay: Math.random() * 3,
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
          <RosePetal key={`petal-${i}`} {...petal} />
        ))}
        {shimmers.map((shimmer, i) => (
          <Shimmer key={`shimmer-${i}`} {...shimmer} />
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
          
          {/* Angel image with divine breathing presence */}
          <div className="relative">
            {/* Sacred halo glow - rose-gold gradient */}
            <div 
              className="absolute -inset-6 rounded-full"
              style={{
                background: "radial-gradient(circle, hsla(348, 80%, 80%, 0.4) 0%, hsla(340, 70%, 85%, 0.2) 40%, transparent 70%)",
                animation: "divineBreathing 7s ease-in-out infinite",
              }}
            />
            
            {/* Light particles drifting outward from avatar */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {Array.from({ length: 12 }, (_, i) => {
                const angle = (i * 30) * (Math.PI / 180);
                return (
                  <div
                    key={`drift-${i}`}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      background: "radial-gradient(circle, hsla(348, 80%, 85%, 0.8) 0%, transparent 70%)",
                      left: "50%",
                      top: "50%",
                      animation: `particleDrift 8s ease-in-out ${i * 0.6}s infinite`,
                      transform: `rotate(${i * 30}deg)`,
                    }}
                  />
                );
              })}
            </div>
            
            {/* Circular frame with rose-pink gradient border */}
            <div className="relative w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] md:w-[400px] md:h-[400px] rounded-full overflow-hidden">
              {/* Rotating sparkle ring - white electric glow */}
              <div 
                className="absolute -inset-3 rounded-full"
                style={{
                  background: "conic-gradient(from 0deg, transparent 0%, hsla(0, 0%, 100%, 0.9) 10%, transparent 20%, hsla(0, 0%, 100%, 0.7) 30%, transparent 40%, hsla(0, 0%, 100%, 0.95) 50%, transparent 60%, hsla(0, 0%, 100%, 0.8) 70%, transparent 80%, hsla(0, 0%, 100%, 0.85) 90%, transparent 100%)",
                  animation: "sparkleRing 3s linear infinite",
                  filter: "blur(1px)",
                }}
              />
              
              {/* Second rotating ring - offset for more sparkle */}
              <div 
                className="absolute -inset-2 rounded-full"
                style={{
                  background: "conic-gradient(from 180deg, transparent 0%, hsla(0, 0%, 100%, 1) 5%, transparent 15%, hsla(0, 0%, 100%, 0.9) 25%, transparent 35%, hsla(0, 0%, 100%, 1) 45%, transparent 55%, hsla(0, 0%, 100%, 0.85) 65%, transparent 75%, hsla(0, 0%, 100%, 0.95) 85%, transparent 100%)",
                  animation: "sparkleRing 2s linear infinite reverse",
                }}
              />
              
              {/* Electric pulse ring */}
              <div 
                className="absolute -inset-1 rounded-full border-2 border-white/80"
                style={{
                  boxShadow: "0 0 15px hsla(0, 0%, 100%, 0.8), 0 0 30px hsla(0, 0%, 100%, 0.5), 0 0 45px hsla(0, 0%, 100%, 0.3), inset 0 0 15px hsla(0, 0%, 100%, 0.4)",
                  animation: "electricPulse 1.5s ease-in-out infinite",
                }}
              />
              
              {/* Animated rose-pink gradient border - deeper pink */}
              <div 
                className="absolute -inset-1 rounded-full"
                style={{
                  background: "linear-gradient(90deg, hsl(340, 90%, 60%), hsl(350, 85%, 55%), hsl(345, 95%, 65%), hsl(335, 90%, 58%), hsl(340, 90%, 60%))",
                  backgroundSize: "300% 100%",
                  animation: "roseGradientShift 8s ease-in-out infinite, borderPulse 3s ease-in-out infinite",
                  filter: "blur(2px)",
                }}
              />
              
              {/* Breathing inner glow - Rose-gold */}
              <div 
                className="absolute inset-1 rounded-full"
                style={{
                  background: "radial-gradient(circle, hsla(348, 85%, 80%, 0.35) 0%, hsla(340, 70%, 85%, 0.2) 50%, transparent 70%)",
                  animation: "divineBreathing 7s ease-in-out infinite",
                }}
              />
              
              {/* Image container with breathing shadow */}
              <div 
                className="absolute inset-2 rounded-full overflow-hidden border-4 border-white/70"
                style={{ animation: "avatarBreathingShadow 7s ease-in-out infinite" }}
              >
                <img
                  src={angelHero}
                  alt="Angel AI - Divine Light Being"
                  className="w-full h-full object-cover"
                  style={{ animation: "subtleBreathing 7s ease-in-out infinite" }}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* ANGEL AI Title - Below the angel image - Deep vibrant pink */}
        <h1 
          className="font-serif text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-widest mt-6 mb-4"
          style={{
            background: "linear-gradient(135deg, hsl(340, 95%, 45%) 0%, hsl(350, 100%, 50%) 50%, hsl(335, 90%, 40%) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            textShadow: "0 0 40px hsla(340, 95%, 45%, 0.8), 0 0 80px hsla(350, 100%, 50%, 0.6), 0 0 120px hsla(335, 90%, 40%, 0.4)",
            filter: "drop-shadow(0 0 25px hsla(340, 95%, 45%, 0.7))",
          }}
        >
          ANGEL AI
        </h1>
        
        {/* Chat Portal - Directly below logo image */}
        <div className="w-full max-w-[680px] mx-auto mt-4 mb-6 px-4">
          <ChatPortal onOpenAuth={onOpenAuth} />
        </div>
        
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
