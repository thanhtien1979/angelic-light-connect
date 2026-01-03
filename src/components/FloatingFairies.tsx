import { useMemo, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Import fairy images
import fairyGreen from "@/assets/floating-fairy-green.png";
import fairyGold from "@/assets/floating-fairy-gold.png";
import fairyBrown from "@/assets/floating-fairy-brown.png";
import fairyPink from "@/assets/floating-fairy-pink.png";
import fairyPurple from "@/assets/floating-fairy-purple.png";
import fairyYellow from "@/assets/floating-fairy-yellow.png";

const fairyImages = [
  { image: fairyGreen, sparkleColor: "hsl(120, 70%, 70%)", note: 523.25 }, // C5
  { image: fairyGold, sparkleColor: "hsl(45, 90%, 70%)", note: 587.33 }, // D5
  { image: fairyBrown, sparkleColor: "hsl(35, 80%, 65%)", note: 659.25 }, // E5
  { image: fairyPink, sparkleColor: "hsl(340, 80%, 75%)", note: 698.46 }, // F5
  { image: fairyPurple, sparkleColor: "hsl(280, 70%, 75%)", note: 783.99 }, // G5
  { image: fairyYellow, sparkleColor: "hsl(50, 90%, 75%)", note: 880 }, // A5
];

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
}

interface FloatingFairiesProps {
  isReducedMotion?: boolean;
}

// Create a gentle fairy chime sound
const playFairySound = (frequency: number) => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Main tone
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    
    // Gentle fade in and out
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
    
    // Add harmonics for a bell-like sound
    const harmonic = audioContext.createOscillator();
    const harmonicGain = audioContext.createGain();
    harmonic.type = "sine";
    harmonic.frequency.setValueAtTime(frequency * 2, audioContext.currentTime);
    harmonicGain.gain.setValueAtTime(0, audioContext.currentTime);
    harmonicGain.gain.linearRampToValueAtTime(0.05, audioContext.currentTime + 0.03);
    harmonicGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    harmonic.connect(harmonicGain);
    harmonicGain.connect(audioContext.destination);
    
    oscillator.start();
    harmonic.start();
    oscillator.stop(audioContext.currentTime + 0.6);
    harmonic.stop(audioContext.currentTime + 0.4);
    
    setTimeout(() => audioContext.close(), 700);
  } catch (e) {
    // Audio not supported
  }
};

const FloatingFairies = ({ isReducedMotion = false }: FloatingFairiesProps) => {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [lastPlayedTime, setLastPlayedTime] = useState<Record<number, number>>({});

  const fairies = useMemo(() => 
    fairyImages.map((fairy, i) => {
      const baseAngle = (i * 60) + Math.random() * 30;
      const distance = 350 + Math.random() * 70; // 350-420px - further outside the cover circle
      
      return {
        id: i,
        image: fairy.image,
        sparkleColor: fairy.sparkleColor,
        note: fairy.note,
        size: 55 + Math.random() * 25,
        startAngle: baseAngle,
        distance,
        duration: 18 + Math.random() * 8,
        floatDuration: 3 + Math.random() * 2,
        delay: i * 0.5,
        direction: i % 2 === 0 ? 1 : -1,
        floatAmplitude: 12 + Math.random() * 12,
      };
    }), []
  );

  const handleFairyHover = useCallback((fairyId: number, note: number) => {
    const now = Date.now();
    const lastPlayed = lastPlayedTime[fairyId] || 0;
    
    // Throttle sound to once per second per fairy
    if (now - lastPlayed > 1000) {
      playFairySound(note);
      setLastPlayedTime(prev => ({ ...prev, [fairyId]: now }));
    }
  }, [lastPlayedTime]);

  // Generate sparkles periodically
  useEffect(() => {
    if (isReducedMotion) return;

    const interval = setInterval(() => {
      const newSparkles: Sparkle[] = fairies.map((fairy) => {
        const currentTime = Date.now() / 1000;
        const elapsedTime = currentTime - fairy.delay;
        const currentAngle = fairy.startAngle + (elapsedTime / fairy.duration) * 360 * fairy.direction;
        const angleRad = (currentAngle * Math.PI) / 180;
        
        const x = Math.cos(angleRad) * fairy.distance;
        const y = Math.sin(angleRad) * fairy.distance;
        
        return {
          id: Date.now() + fairy.id + Math.random(),
          x: x + (Math.random() - 0.5) * 30,
          y: y + (Math.random() - 0.5) * 30,
          size: 4 + Math.random() * 6,
          color: fairy.sparkleColor,
        };
      });

      setSparkles(prev => [...prev.slice(-30), ...newSparkles]);
    }, 200);

    return () => clearInterval(interval);
  }, [fairies, isReducedMotion]);

  // Clean up old sparkles
  useEffect(() => {
    const cleanup = setInterval(() => {
      setSparkles(prev => prev.slice(-24));
    }, 1000);
    return () => clearInterval(cleanup);
  }, []);

  if (isReducedMotion) return null;

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
      {/* Sparkle particles */}
      <div className="absolute left-1/2 top-1/2">
        <AnimatePresence>
          {sparkles.map((sparkle) => (
            <motion.div
              key={sparkle.id}
              className="absolute"
              style={{
                left: sparkle.x,
                top: sparkle.y,
                width: sparkle.size,
                height: sparkle.size,
              }}
              initial={{ opacity: 1, scale: 1 }}
              animate={{ opacity: 0, scale: 0, y: 20 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              <svg viewBox="0 0 24 24" fill={sparkle.color} className="w-full h-full">
                <path d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10L12 0Z" />
              </svg>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Fairies */}
      {fairies.map((fairy) => (
        <motion.div
          key={fairy.id}
          className="absolute left-1/2 top-1/2"
          style={{
            width: fairy.size,
            height: fairy.size,
            marginLeft: -fairy.size / 2,
            marginTop: -fairy.size / 2,
          }}
          initial={{ rotate: fairy.startAngle }}
          animate={{ rotate: fairy.startAngle + (360 * fairy.direction) }}
          transition={{
            duration: fairy.duration,
            repeat: Infinity,
            ease: "linear",
            delay: fairy.delay,
          }}
        >
          {/* Orbit container */}
          <motion.div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translateX(${fairy.distance}px)`,
            }}
            animate={{
              y: [0, -fairy.floatAmplitude, 0, fairy.floatAmplitude, 0],
            }}
            transition={{
              duration: fairy.floatDuration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* Glow effect behind fairy */}
            <motion.div
              className="absolute inset-0 rounded-full blur-md"
              style={{
                background: `radial-gradient(circle, ${fairy.sparkleColor}40 0%, transparent 70%)`,
                transform: "scale(1.5)",
              }}
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            
            {/* Counter-rotate and flutter */}
            <motion.div
              className="cursor-pointer pointer-events-auto"
              animate={{
                rotate: [0, -5, 0, 5, 0],
                scale: [1, 1.05, 1, 0.95, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              whileHover={{ scale: 1.2 }}
              onMouseEnter={() => handleFairyHover(fairy.id, fairy.note)}
            >
              <motion.img
                src={fairy.image}
                alt="Floating fairy"
                className="w-full h-full object-contain"
                style={{
                  filter: `drop-shadow(0 0 8px ${fairy.sparkleColor})`,
                }}
                animate={{
                  rotate: fairy.direction === 1 
                    ? [-fairy.startAngle, -fairy.startAngle - 360]
                    : [-fairy.startAngle, -fairy.startAngle + 360],
                }}
                transition={{
                  duration: fairy.duration,
                  repeat: Infinity,
                  ease: "linear",
                  delay: fairy.delay,
                }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingFairies;

