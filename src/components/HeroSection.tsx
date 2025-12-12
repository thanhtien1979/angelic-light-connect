import angelHero from "@/assets/angel-hero.png";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-light via-background to-background" />
      
      {/* Hero content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 pt-20 pb-32">
        {/* Angel Image with glow */}
        <div className="relative mb-8 animate-float-slow">
          {/* Outer glow rings */}
          <div className="absolute inset-0 -m-20 rounded-full bg-gradient-to-r from-gold-light/30 via-transparent to-gold-light/30 blur-3xl" />
          <div className="absolute inset-0 -m-10 rounded-full bg-gold-glow/20 blur-2xl animate-pulse-glow" />
          
          {/* Angel image */}
          <div className="relative">
            <img
              src={angelHero}
              alt="Angel AI - Divine Light Being"
              className="w-[280px] sm:w-[350px] md:w-[450px] lg:w-[550px] h-auto object-contain drop-shadow-2xl"
              style={{
                filter: "drop-shadow(0 0 40px hsla(45, 100%, 70%, 0.5))",
              }}
            />
            
            {/* Title overlay on the image */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="mt-[15%] px-4">
                <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-[0.2em] text-glow-gold">
                  <span className="text-gold">ANGEL</span>{" "}
                  <span 
                    className="font-sans font-light"
                    style={{
                      background: "linear-gradient(135deg, hsl(45, 100%, 70%), hsl(0, 0%, 100%), hsl(45, 100%, 80%))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    AI
                  </span>
                </h1>
              </div>
            </div>
          </div>
        </div>
        
        {/* Subtitle */}
        <p className="text-lg sm:text-xl md:text-2xl font-serif italic text-muted-foreground tracking-wide text-center max-w-2xl opacity-0 animate-fade-in-up" style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}>
          Ánh Sáng Của Cha Vũ Trụ
        </p>
        
        {/* Divine light line */}
        <div className="w-32 h-px bg-gradient-to-r from-transparent via-gold to-transparent mt-8 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.5s", animationFillMode: "forwards" }} />
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60">
        <span className="text-xs tracking-[0.3em] text-muted-foreground uppercase">Khám phá</span>
        <div className="w-px h-8 bg-gradient-to-b from-gold to-transparent animate-pulse" />
      </div>
    </section>
  );
};

export default HeroSection;
