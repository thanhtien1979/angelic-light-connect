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

interface BurstSparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  angle: number;
  distance: number;
}

interface RingWave {
  id: number;
  x: number;
  y: number;
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

// Special arpeggio sound for click
const playClickSound = (baseFrequency: number) => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create an arpeggio with 3 ascending notes
    const notes = [baseFrequency, baseFrequency * 1.25, baseFrequency * 1.5];
    
    notes.forEach((freq, i) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.1);
      
      gain.gain.setValueAtTime(0, audioContext.currentTime + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + i * 0.1 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.1 + 0.5);
      
      // Add shimmer harmonic
      const shimmer = audioContext.createOscillator();
      const shimmerGain = audioContext.createGain();
      shimmer.type = "sine";
      shimmer.frequency.setValueAtTime(freq * 3, audioContext.currentTime + i * 0.1);
      shimmerGain.gain.setValueAtTime(0, audioContext.currentTime + i * 0.1);
      shimmerGain.gain.linearRampToValueAtTime(0.05, audioContext.currentTime + i * 0.1 + 0.02);
      shimmerGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.1 + 0.3);
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      shimmer.connect(shimmerGain);
      shimmerGain.connect(audioContext.destination);
      
      osc.start(audioContext.currentTime + i * 0.1);
      shimmer.start(audioContext.currentTime + i * 0.1);
      osc.stop(audioContext.currentTime + i * 0.1 + 0.5);
      shimmer.stop(audioContext.currentTime + i * 0.1 + 0.3);
    });
    
    setTimeout(() => audioContext.close(), 1000);
  } catch (e) {
    // Audio not supported
  }
};

const FloatingFairies = ({ isReducedMotion = false }: FloatingFairiesProps) => {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [lastPlayedTime, setLastPlayedTime] = useState<Record<number, number>>({});
  const [clickedFairy, setClickedFairy] = useState<number | null>(null);
  const [burstSparkles, setBurstSparkles] = useState<BurstSparkle[]>([]);
  const [ringWaves, setRingWaves] = useState<RingWave[]>([]);

  // Optimized: Only 4 fairies instead of 6
  const fairies = useMemo(() => 
    fairyImages.slice(0, 4).map((fairy, i) => {
      const baseAngle = (i * 90) + 20;
      const distance = 360 + (i % 2) * 40;
      
      return {
        id: i,
        image: fairy.image,
        sparkleColor: fairy.sparkleColor,
        note: fairy.note,
        size: 50 + (i % 2) * 20,
        startAngle: baseAngle,
        distance,
        duration: 20 + i * 5,
        floatDuration: 3.5,
        delay: i * 0.8,
        direction: i % 2 === 0 ? 1 : -1,
        floatAmplitude: 10,
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

  const handleFairyClick = useCallback((fairyId: number, note: number, sparkleColor: string, distance: number, startAngle: number, direction: number, duration: number, delay: number) => {
    // Calculate current position
    const currentTime = Date.now() / 1000;
    const elapsedTime = currentTime - delay;
    const currentAngle = startAngle + (elapsedTime / duration) * 360 * direction;
    const angleRad = (currentAngle * Math.PI) / 180;
    const x = Math.cos(angleRad) * distance;
    const y = Math.sin(angleRad) * distance;

    // Set clicked fairy for glow effect
    setClickedFairy(fairyId);

    // Play special click sound
    playClickSound(note);

    // Create burst sparkles (18 particles radiating outward)
    const newBurstSparkles: BurstSparkle[] = Array.from({ length: 18 }, (_, i) => ({
      id: Date.now() + i,
      x,
      y,
      size: 6 + Math.random() * 8,
      color: sparkleColor,
      angle: (i * 20) + Math.random() * 10,
      distance: 30 + Math.random() * 50,
    }));
    setBurstSparkles(newBurstSparkles);

    // Create ring wave
    const newRingWave: RingWave = {
      id: Date.now(),
      x,
      y,
      color: sparkleColor,
    };
    setRingWaves(prev => [...prev, newRingWave]);

    // Reset after 2 seconds
    setTimeout(() => {
      setClickedFairy(null);
      setBurstSparkles([]);
    }, 2000);

    // Remove ring wave after animation
    setTimeout(() => {
      setRingWaves(prev => prev.filter(r => r.id !== newRingWave.id));
    }, 1000);
  }, []);

  // Generate sparkles periodically - optimized with longer interval
  useEffect(() => {
    if (isReducedMotion) return;

    const interval = setInterval(() => {
      // Only generate sparkles for 2 fairies at a time (alternating)
      const currentIdx = Math.floor(Date.now() / 400) % fairies.length;
      const fairy = fairies[currentIdx];
      
      const currentTime = Date.now() / 1000;
      const elapsedTime = currentTime - fairy.delay;
      const currentAngle = fairy.startAngle + (elapsedTime / fairy.duration) * 360 * fairy.direction;
      const angleRad = (currentAngle * Math.PI) / 180;
      
      const x = Math.cos(angleRad) * fairy.distance;
      const y = Math.sin(angleRad) * fairy.distance;
      
      const newSparkle: Sparkle = {
        id: Date.now() + Math.random(),
        x: x + (Math.random() - 0.5) * 25,
        y: y + (Math.random() - 0.5) * 25,
        size: 5 + Math.random() * 5,
        color: fairy.sparkleColor,
      };

      setSparkles(prev => [...prev.slice(-16), newSparkle]);
    }, 400); // Slower interval

    return () => clearInterval(interval);
  }, [fairies, isReducedMotion]);

  // Clean up old sparkles - less frequent
  useEffect(() => {
    const cleanup = setInterval(() => {
      setSparkles(prev => prev.slice(-12));
    }, 1500);
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

        {/* Burst sparkles on click */}
        <AnimatePresence>
          {burstSparkles.map((sparkle) => {
            const endX = sparkle.x + Math.cos((sparkle.angle * Math.PI) / 180) * sparkle.distance;
            const endY = sparkle.y + Math.sin((sparkle.angle * Math.PI) / 180) * sparkle.distance;
            
            return (
              <motion.div
                key={sparkle.id}
                className="absolute"
                style={{
                  left: sparkle.x,
                  top: sparkle.y,
                  width: sparkle.size,
                  height: sparkle.size,
                }}
                initial={{ opacity: 1, scale: 1.5, x: 0, y: 0 }}
                animate={{ 
                  opacity: 0, 
                  scale: 0.5, 
                  x: endX - sparkle.x, 
                  y: endY - sparkle.y 
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <svg viewBox="0 0 24 24" fill={sparkle.color} className="w-full h-full">
                  <path d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10L12 0Z" />
                </svg>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Ring waves on click */}
        <AnimatePresence>
          {ringWaves.map((ring) => (
            <motion.div
              key={ring.id}
              className="absolute rounded-full pointer-events-none"
              style={{
                left: ring.x,
                top: ring.y,
                borderWidth: 3,
                borderStyle: "solid",
                borderColor: ring.color,
                marginLeft: -5,
                marginTop: -5,
              }}
              initial={{ width: 10, height: 10, opacity: 1 }}
              animate={{ width: 120, height: 120, opacity: 0, marginLeft: -60, marginTop: -60 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
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
            duration: clickedFairy === fairy.id ? fairy.duration * 0.5 : fairy.duration,
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
              animate={{ 
                opacity: clickedFairy === fairy.id ? [0.8, 1, 0.8] : [0.4, 0.8, 0.4],
                scale: clickedFairy === fairy.id ? [1.8, 2.2, 1.8] : 1.5,
              }}
              transition={{ duration: clickedFairy === fairy.id ? 0.3 : 2, repeat: Infinity }}
            />
            
            {/* Counter-rotate and flutter */}
            <motion.div
              className="cursor-pointer pointer-events-auto"
              animate={{
                rotate: [0, -5, 0, 5, 0],
                scale: clickedFairy === fairy.id ? [1.3, 1.5, 1.3] : [1, 1.05, 1, 0.95, 1],
              }}
              transition={{
                duration: clickedFairy === fairy.id ? 0.5 : 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              whileHover={{ scale: 1.2 }}
              onMouseEnter={() => handleFairyHover(fairy.id, fairy.note)}
              onClick={() => handleFairyClick(
                fairy.id, 
                fairy.note, 
                fairy.sparkleColor, 
                fairy.distance, 
                fairy.startAngle, 
                fairy.direction, 
                fairy.duration, 
                fairy.delay
              )}
            >
              <motion.img
                src={fairy.image}
                alt="Floating fairy"
                className="w-full h-full object-contain"
                style={{
                  filter: clickedFairy === fairy.id 
                    ? `drop-shadow(0 0 20px ${fairy.sparkleColor}) drop-shadow(0 0 40px ${fairy.sparkleColor}) brightness(1.3)`
                    : `drop-shadow(0 0 8px ${fairy.sparkleColor})`,
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

