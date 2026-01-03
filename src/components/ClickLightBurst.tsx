import { memo, useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLightBurst, LIGHT_BURST_COLORS, LIGHT_BURST_SIZES } from '@/contexts/LightBurstContext';

interface BurstParticle {
  id: string;
  x: number;
  y: number;
  hue: number;
  scale: number;
}

const ClickLightBurst = memo(() => {
  const [bursts, setBursts] = useState<BurstParticle[]>([]);
  const { settings } = useLightBurst();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Create audio element for the burst sound
  useEffect(() => {
    // Create a simple sparkle sound using Web Audio API
    const createSparkleSound = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create oscillator for sparkle tone
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(2000, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(3000, audioContext.currentTime + 0.05);
      oscillator.frequency.exponentialRampToValueAtTime(1500, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
      
      oscillator.type = 'sine';
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
      
      return audioContext;
    };

    // Store the function for later use
    (window as any).__createSparkleSound = createSparkleSound;
    
    return () => {
      delete (window as any).__createSparkleSound;
    };
  }, []);

  const playSound = useCallback(() => {
    if (!settings.soundEnabled) return;
    
    try {
      const createSparkleSound = (window as any).__createSparkleSound;
      if (createSparkleSound) {
        createSparkleSound();
      }
    } catch (e) {
      // Silently fail if audio can't be played
    }
  }, [settings.soundEnabled]);

  const getHue = useCallback(() => {
    if (settings.color === 'rainbow') {
      return Math.random() * 360;
    }
    return LIGHT_BURST_COLORS[settings.color].hue;
  }, [settings.color]);

  const handleClick = useCallback((e: MouseEvent) => {
    if (!settings.enabled) return;
    
    const id = `burst-${Date.now()}-${Math.random()}`;
    const sizeScale = LIGHT_BURST_SIZES[settings.size].scale;
    const newBurst: BurstParticle = {
      id,
      x: e.clientX,
      y: e.clientY,
      hue: getHue(),
      scale: sizeScale,
    };
    
    setBursts(prev => [...prev, newBurst]);
    playSound();
    
    // Remove after animation completes
    setTimeout(() => {
      setBursts(prev => prev.filter(b => b.id !== id));
    }, 800);
  }, [settings.enabled, settings.size, getHue, playSound]);

  useEffect(() => {
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [handleClick]);

  if (!settings.enabled) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      <AnimatePresence>
        {bursts.map((burst) => (
          <LightBurstEffect 
            key={burst.id} 
            x={burst.x} 
            y={burst.y} 
            hue={burst.hue} 
            scale={burst.scale}
            isRainbow={settings.color === 'rainbow'} 
          />
        ))}
      </AnimatePresence>
    </div>
  );
});

ClickLightBurst.displayName = 'ClickLightBurst';

interface LightBurstEffectProps {
  x: number;
  y: number;
  hue: number;
  scale: number;
  isRainbow: boolean;
}

const LightBurstEffect = memo(({ x, y, hue, scale, isRainbow }: LightBurstEffectProps) => {
  const particleCount = 8;
  const rayCount = 6;

  const getColor = (saturation: number, lightness: number, alpha: number = 1) => {
    return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
  };

  return (
    <motion.div
      className="absolute"
      style={{ left: x, top: y }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Central glow */}
      <motion.div
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 20 * scale,
          height: 20 * scale,
          background: `radial-gradient(circle, ${getColor(100, 95)} 0%, ${getColor(100, 80, 0.8)} 40%, transparent 70%)`,
          boxShadow: `0 0 ${20 * scale}px ${getColor(100, 85, 0.8)}, 0 0 ${40 * scale}px ${getColor(100, 75, 0.5)}`,
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: [0, 2.5, 4],
          opacity: [0, 1, 0],
        }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />

      {/* Light rays */}
      {[...Array(rayCount)].map((_, i) => {
        const rayHue = isRainbow ? (hue + i * 60) % 360 : hue;
        return (
          <motion.div
            key={`ray-${i}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 origin-center"
            style={{
              width: 60 * scale,
              height: 2 * scale,
              background: `linear-gradient(90deg, hsla(${rayHue}, 100%, 90%, 0.9) 0%, hsla(${rayHue}, 100%, 80%, 0.4) 50%, transparent 100%)`,
              rotate: `${(i * 360) / rayCount}deg`,
              borderRadius: 4,
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{
              scaleX: [0, 1, 1.5],
              opacity: [0, 0.9, 0],
            }}
            transition={{
              duration: 0.4,
              ease: 'easeOut',
              delay: i * 0.02,
            }}
          />
        );
      })}

      {/* Sparkle particles */}
      {[...Array(particleCount)].map((_, i) => {
        const angle = (i / particleCount) * Math.PI * 2;
        const distance = (30 + Math.random() * 25) * scale;
        const size = (3 + Math.random() * 3) * scale;
        const particleHue = isRainbow ? (hue + i * 45) % 360 : hue;
        
        return (
          <motion.div
            key={`particle-${i}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: size,
              height: size,
              background: i % 2 === 0 
                ? `hsla(${particleHue}, 100%, 90%, 1)` 
                : `hsla(${particleHue}, 100%, 85%, 1)`,
              boxShadow: `0 0 ${8 * scale}px hsla(${particleHue}, 100%, 85%, 0.8)`,
            }}
            initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
            animate={{
              x: [0, Math.cos(angle) * distance],
              y: [0, Math.sin(angle) * distance],
              scale: [0, 1.2, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 0.5,
              ease: 'easeOut',
              delay: 0.05 + i * 0.02,
            }}
          />
        );
      })}

      {/* Outer ring */}
      <motion.div
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
        style={{
          width: 40 * scale,
          height: 40 * scale,
          borderColor: getColor(100, 85, 0.6),
          boxShadow: `0 0 ${15 * scale}px ${getColor(100, 80, 0.4)}`,
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: [0, 2, 3],
          opacity: [0, 0.8, 0],
        }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </motion.div>
  );
});

LightBurstEffect.displayName = 'LightBurstEffect';

export default ClickLightBurst;
