import { memo, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLightBurst, LIGHT_BURST_COLORS, LIGHT_BURST_SIZES, type LightBurstEffect } from '@/contexts/LightBurstContext';

interface BurstParticle {
  id: string;
  x: number;
  y: number;
  hue: number;
  scale: number;
  effect: LightBurstEffect;
}

const ClickLightBurst = memo(() => {
  const [bursts, setBursts] = useState<BurstParticle[]>([]);
  const { settings } = useLightBurst();

  // Create audio element for the burst sound
  useEffect(() => {
    const createSparkleSound = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
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
      // Silently fail
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
      effect: settings.effect,
    };
    
    setBursts(prev => [...prev, newBurst]);
    playSound();
    
    setTimeout(() => {
      setBursts(prev => prev.filter(b => b.id !== id));
    }, 1200);
  }, [settings.enabled, settings.size, settings.effect, getHue, playSound]);

  useEffect(() => {
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [handleClick]);

  if (!settings.enabled) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      <AnimatePresence>
        {bursts.map((burst) => {
          switch (burst.effect) {
            case 'snow':
              return <SnowEffect key={burst.id} x={burst.x} y={burst.y} scale={burst.scale} />;
            case 'flowers':
              return <FlowerEffect key={burst.id} x={burst.x} y={burst.y} scale={burst.scale} />;
            case 'hearts':
              return <HeartEffect key={burst.id} x={burst.x} y={burst.y} scale={burst.scale} />;
            case 'stars':
              return <StarEffect key={burst.id} x={burst.x} y={burst.y} scale={burst.scale} hue={burst.hue} />;
            case 'butterflies':
              return <ButterflyEffect key={burst.id} x={burst.x} y={burst.y} scale={burst.scale} />;
            default:
              return <LightBurstEffect key={burst.id} x={burst.x} y={burst.y} hue={burst.hue} scale={burst.scale} isRainbow={settings.color === 'rainbow'} />;
          }
        })}
      </AnimatePresence>
    </div>
  );
});

ClickLightBurst.displayName = 'ClickLightBurst';

// Light Burst Effect (original)
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
    <motion.div className="absolute" style={{ left: x, top: y }} initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 20 * scale,
          height: 20 * scale,
          background: `radial-gradient(circle, ${getColor(100, 95)} 0%, ${getColor(100, 80, 0.8)} 40%, transparent 70%)`,
          boxShadow: `0 0 ${20 * scale}px ${getColor(100, 85, 0.8)}, 0 0 ${40 * scale}px ${getColor(100, 75, 0.5)}`,
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 2.5, 4], opacity: [0, 1, 0] }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
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
            animate={{ scaleX: [0, 1, 1.5], opacity: [0, 0.9, 0] }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: i * 0.02 }}
          />
        );
      })}
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
              background: `hsla(${particleHue}, 100%, 90%, 1)`,
              boxShadow: `0 0 ${8 * scale}px hsla(${particleHue}, 100%, 85%, 0.8)`,
            }}
            initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
            animate={{ x: [0, Math.cos(angle) * distance], y: [0, Math.sin(angle) * distance], scale: [0, 1.2, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.05 + i * 0.02 }}
          />
        );
      })}
      <motion.div
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
        style={{ width: 40 * scale, height: 40 * scale, borderColor: getColor(100, 85, 0.6), boxShadow: `0 0 ${15 * scale}px ${getColor(100, 80, 0.4)}` }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 2, 3], opacity: [0, 0.8, 0] }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </motion.div>
  );
});

LightBurstEffect.displayName = 'LightBurstEffect';

// Snow Effect
interface EffectProps {
  x: number;
  y: number;
  scale: number;
  hue?: number;
}

const SnowEffect = memo(({ x, y, scale }: EffectProps) => {
  const snowflakes = ['❄️', '❅', '❆', '✻', '✼'];
  const particleCount = 10;

  return (
    <motion.div className="absolute" style={{ left: x, top: y }} initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {[...Array(particleCount)].map((_, i) => {
        const angle = (i / particleCount) * Math.PI * 2;
        const distance = (40 + Math.random() * 40) * scale;
        const size = (12 + Math.random() * 8) * scale;
        const snowflake = snowflakes[Math.floor(Math.random() * snowflakes.length)];
        
        return (
          <motion.div
            key={`snow-${i}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 select-none"
            style={{ fontSize: size }}
            initial={{ x: 0, y: 0, opacity: 0, rotate: 0 }}
            animate={{
              x: [0, Math.cos(angle) * distance * 0.5, Math.cos(angle) * distance],
              y: [0, Math.sin(angle) * distance * 0.3, Math.sin(angle) * distance + 50 * scale],
              opacity: [0, 1, 1, 0],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 1, ease: 'easeOut', delay: i * 0.03 }}
          >
            {snowflake}
          </motion.div>
        );
      })}
    </motion.div>
  );
});

SnowEffect.displayName = 'SnowEffect';

// Flower Effect
const FlowerEffect = memo(({ x, y, scale }: EffectProps) => {
  const flowers = ['🌸', '🌺', '🌷', '🌹', '💮', '🏵️', '🌻', '🌼'];
  const particleCount = 8;

  return (
    <motion.div className="absolute" style={{ left: x, top: y }} initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {[...Array(particleCount)].map((_, i) => {
        const angle = (i / particleCount) * Math.PI * 2;
        const distance = (35 + Math.random() * 35) * scale;
        const size = (14 + Math.random() * 10) * scale;
        const flower = flowers[Math.floor(Math.random() * flowers.length)];
        
        return (
          <motion.div
            key={`flower-${i}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 select-none"
            style={{ fontSize: size }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0, rotate: 0 }}
            animate={{
              x: [0, Math.cos(angle) * distance],
              y: [0, Math.sin(angle) * distance + 30 * scale],
              opacity: [0, 1, 1, 0],
              scale: [0, 1.2, 1, 0.5],
              rotate: [0, Math.random() * 180 - 90],
            }}
            transition={{ duration: 1.1, ease: 'easeOut', delay: i * 0.04 }}
          >
            {flower}
          </motion.div>
        );
      })}
    </motion.div>
  );
});

FlowerEffect.displayName = 'FlowerEffect';

// Heart Effect
const HeartEffect = memo(({ x, y, scale }: EffectProps) => {
  const hearts = ['💕', '💖', '💗', '💓', '💝', '❤️', '🩷', '🩵'];
  const particleCount = 10;

  return (
    <motion.div className="absolute" style={{ left: x, top: y }} initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {[...Array(particleCount)].map((_, i) => {
        const angle = (i / particleCount) * Math.PI * 2 - Math.PI / 2;
        const distance = (30 + Math.random() * 50) * scale;
        const size = (12 + Math.random() * 12) * scale;
        const heart = hearts[Math.floor(Math.random() * hearts.length)];
        
        return (
          <motion.div
            key={`heart-${i}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 select-none"
            style={{ fontSize: size }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
            animate={{
              x: [0, Math.cos(angle) * distance * 0.3, Math.cos(angle) * distance],
              y: [0, -40 * scale, Math.sin(angle) * distance - 20 * scale],
              opacity: [0, 1, 1, 0],
              scale: [0, 1.3, 1.1, 0.8],
            }}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94], delay: i * 0.03 }}
          >
            {heart}
          </motion.div>
        );
      })}
    </motion.div>
  );
});

HeartEffect.displayName = 'HeartEffect';

// Star Effect
const StarEffect = memo(({ x, y, scale, hue = 45 }: EffectProps) => {
  const stars = ['⭐', '✨', '🌟', '💫', '⚡', '✦', '✧'];
  const particleCount = 12;

  return (
    <motion.div className="absolute" style={{ left: x, top: y }} initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {[...Array(particleCount)].map((_, i) => {
        const angle = (i / particleCount) * Math.PI * 2;
        const distance = (35 + Math.random() * 45) * scale;
        const size = (10 + Math.random() * 14) * scale;
        const star = stars[Math.floor(Math.random() * stars.length)];
        
        return (
          <motion.div
            key={`star-${i}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 select-none"
            style={{ fontSize: size, filter: `hue-rotate(${hue}deg)` }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0, rotate: 0 }}
            animate={{
              x: [0, Math.cos(angle) * distance],
              y: [0, Math.sin(angle) * distance],
              opacity: [0, 1, 1, 0],
              scale: [0, 1.5, 1, 0],
              rotate: [0, 360],
            }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.025 }}
          >
            {star}
          </motion.div>
        );
      })}
    </motion.div>
  );
});

StarEffect.displayName = 'StarEffect';

// Butterfly Effect
const ButterflyEffect = memo(({ x, y, scale }: EffectProps) => {
  const butterflies = ['🦋', '🦋', '🦋'];
  const particleCount = 6;

  return (
    <motion.div className="absolute" style={{ left: x, top: y }} initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {[...Array(particleCount)].map((_, i) => {
        const angle = (i / particleCount) * Math.PI * 2;
        const distance = (50 + Math.random() * 40) * scale;
        const size = (16 + Math.random() * 10) * scale;
        const butterfly = butterflies[Math.floor(Math.random() * butterflies.length)];
        const hueRotate = Math.random() * 360;
        
        return (
          <motion.div
            key={`butterfly-${i}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 select-none"
            style={{ fontSize: size, filter: `hue-rotate(${hueRotate}deg)` }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
            animate={{
              x: [0, Math.cos(angle) * distance * 0.3, Math.cos(angle) * distance * 0.6, Math.cos(angle) * distance],
              y: [0, -20 * scale, Math.sin(angle) * distance * 0.5, Math.sin(angle) * distance - 30 * scale],
              opacity: [0, 1, 1, 0],
              scale: [0, 1, 1.2, 0.8],
              rotate: [0, -15, 15, -10, 10, 0],
            }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: i * 0.08 }}
          >
            {butterfly}
          </motion.div>
        );
      })}
    </motion.div>
  );
});

ButterflyEffect.displayName = 'ButterflyEffect';

export default ClickLightBurst;
