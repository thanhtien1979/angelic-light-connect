import { memo, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BurstParticle {
  id: string;
  x: number;
  y: number;
}

const ClickLightBurst = memo(() => {
  const [bursts, setBursts] = useState<BurstParticle[]>([]);

  const handleClick = useCallback((e: MouseEvent) => {
    const id = `burst-${Date.now()}-${Math.random()}`;
    const newBurst: BurstParticle = {
      id,
      x: e.clientX,
      y: e.clientY,
    };
    
    setBursts(prev => [...prev, newBurst]);
    
    // Remove after animation completes
    setTimeout(() => {
      setBursts(prev => prev.filter(b => b.id !== id));
    }, 800);
  }, []);

  useEffect(() => {
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [handleClick]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      <AnimatePresence>
        {bursts.map((burst) => (
          <LightBurstEffect key={burst.id} x={burst.x} y={burst.y} />
        ))}
      </AnimatePresence>
    </div>
  );
});

ClickLightBurst.displayName = 'ClickLightBurst';

interface LightBurstEffectProps {
  x: number;
  y: number;
}

const LightBurstEffect = memo(({ x, y }: LightBurstEffectProps) => {
  const particleCount = 8;
  const rayCount = 6;

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
          width: 20,
          height: 20,
          background: 'radial-gradient(circle, hsla(45, 100%, 95%, 1) 0%, hsla(45, 100%, 80%, 0.8) 40%, transparent 70%)',
          boxShadow: '0 0 20px hsla(45, 100%, 85%, 0.8), 0 0 40px hsla(45, 100%, 75%, 0.5)',
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: [0, 2.5, 4],
          opacity: [0, 1, 0],
        }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />

      {/* Light rays */}
      {[...Array(rayCount)].map((_, i) => (
        <motion.div
          key={`ray-${i}`}
          className="absolute -translate-x-1/2 -translate-y-1/2 origin-center"
          style={{
            width: 60,
            height: 2,
            background: 'linear-gradient(90deg, hsla(45, 100%, 90%, 0.9) 0%, hsla(45, 100%, 80%, 0.4) 50%, transparent 100%)',
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
      ))}

      {/* Sparkle particles */}
      {[...Array(particleCount)].map((_, i) => {
        const angle = (i / particleCount) * Math.PI * 2;
        const distance = 30 + Math.random() * 25;
        const size = 3 + Math.random() * 3;
        
        return (
          <motion.div
            key={`particle-${i}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: size,
              height: size,
              background: i % 2 === 0 
                ? 'hsla(45, 100%, 90%, 1)' 
                : 'hsla(50, 100%, 85%, 1)',
              boxShadow: '0 0 8px hsla(45, 100%, 85%, 0.8)',
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
          width: 40,
          height: 40,
          borderColor: 'hsla(45, 100%, 85%, 0.6)',
          boxShadow: '0 0 15px hsla(45, 100%, 80%, 0.4)',
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
