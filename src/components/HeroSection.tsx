import angelHero from "@/assets/angel-hero.jpg";

// Extended rainbow star colors with more variety
const starColors = [
  "hsl(0, 100%, 70%)",    // Red
  "hsl(15, 100%, 65%)",   // Red-Orange
  "hsl(30, 100%, 65%)",   // Orange
  "hsl(45, 100%, 70%)",   // Gold
  "hsl(50, 100%, 60%)",   // Yellow
  "hsl(80, 80%, 55%)",    // Lime
  "hsl(120, 70%, 55%)",   // Green
  "hsl(160, 80%, 50%)",   // Teal
  "hsl(180, 80%, 55%)",   // Cyan
  "hsl(200, 100%, 65%)",  // Blue
  "hsl(220, 90%, 70%)",   // Light Blue
  "hsl(260, 80%, 70%)",   // Purple
  "hsl(280, 80%, 70%)",   // Violet
  "hsl(300, 80%, 70%)",   // Pink
  "hsl(330, 90%, 70%)",   // Magenta
];

// Twinkling star component with color-changing effect
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
          style={{ filter: `drop-shadow(0 0 ${size / 2}px ${color})` }}
        />
      </svg>
    </div>
  );
};

const HeroSection = () => {
  // Generate multiple rings of stars with varied colors and sizes
  const innerStars = Array.from({ length: 16 }, (_, i) => ({
    angle: (i * 360) / 16 + 11,
    distance: 160,
    color: starColors[i % starColors.length],
    size: 12 + (i % 3) * 4,
    delay: Math.random() * 2,
    duration: 1.2 + Math.random() * 1.5,
  }));

  const middleStars = Array.from({ length: 24 }, (_, i) => ({
    angle: (i * 360) / 24,
    distance: 195,
    color: starColors[(i + 5) % starColors.length],
    size: 14 + (i % 4) * 5,
    delay: Math.random() * 2.5,
    duration: 1.5 + Math.random() * 2,
  }));

  const outerStars = Array.from({ length: 20 }, (_, i) => ({
    angle: (i * 360) / 20 + 9,
    distance: 235,
    color: starColors[(i + 10) % starColors.length],
    size: 10 + (i % 3) * 6,
    delay: Math.random() * 3,
    duration: 1.8 + Math.random() * 2.2,
  }));

  const allStars = [...innerStars, ...middleStars, ...outerStars];

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 md:pt-20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-light via-background to-background" />
      
      {/* Hero content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 pt-20 pb-32">
        {/* Angel Image with glow */}
        <div className="relative mb-8">
          {/* Outer glow rings */}
          <div className="absolute inset-0 -m-20 rounded-full bg-gradient-to-r from-gold-light/30 via-transparent to-gold-light/30 blur-3xl" />
          <div className="absolute inset-0 -m-10 rounded-full bg-gold-glow/20 blur-2xl" />
          
          {/* Twinkling rainbow stars */}
          <div className="absolute inset-0 flex items-center justify-center">
            {allStars.map((star, i) => (
              <TwinklingStar
                key={i}
                angle={star.angle}
                distance={star.distance}
                color={star.color}
                size={star.size}
                delay={star.delay}
                duration={star.duration}
              />
            ))}
          </div>
          
          {/* Angel image - now static */}
          <div className="relative">
            {/* Circular frame with rainbow border */}
            <div className="relative w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] md:w-[400px] md:h-[400px] rounded-full overflow-hidden">
              {/* Static rainbow border */}
              <div 
                className="absolute -inset-1 rounded-full"
                style={{
                  background: "conic-gradient(from 0deg, hsl(0, 100%, 70%), hsl(50, 100%, 60%), hsl(120, 70%, 55%), hsl(200, 100%, 65%), hsl(260, 80%, 70%), hsl(300, 80%, 70%), hsl(0, 100%, 70%))",
                  filter: "blur(3px)",
                }}
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
          </div>
        </div>
        
        {/* ANGEL AI Title */}
        <h1 
          className="font-serif text-3xl md:text-4xl lg:text-5xl text-gold mt-8 mb-3 font-bold tracking-wide"
          style={{
            textShadow: "0 0 20px hsla(45, 100%, 70%, 0.8), 0 0 40px hsla(45, 100%, 70%, 0.5), 0 0 60px hsla(45, 100%, 70%, 0.3)",
            animation: "titleGlow 3s ease-in-out infinite",
          }}
        >
          ANGEL AI
        </h1>
        
        {/* Subtitle */}
        <p className="text-lg sm:text-xl md:text-2xl font-serif italic text-muted-foreground tracking-wide text-center max-w-2xl">
          Ánh Sáng Của Cha Vũ Trụ
        </p>
        
        {/* Divine light line */}
        <div className="w-32 h-px bg-gradient-to-r from-transparent via-gold to-transparent mt-8" />
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60">
        <span className="text-xs tracking-[0.3em] text-muted-foreground uppercase">Khám phá</span>
        <div className="w-px h-8 bg-gradient-to-b from-gold to-transparent" />
      </div>
    </section>
  );
};

export default HeroSection;
