import { motion } from 'framer-motion';
import { Wind } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { type AmbientSoundType } from '@/hooks/useAmbientSound';

interface BreathingVisualizationProps {
  phase: 'idle' | 'inhale' | 'hold-in' | 'exhale' | 'hold-out' | 'next-cycle' | 'complete';
  isActive: boolean;
  selectedSound: AmbientSoundType;
  inhaleDuration: number;
  exhaleDuration: number;
}

// Sound tempo mapping - slower sounds get slower breathing rhythm
const getSoundTempo = (sound: AmbientSoundType): { baseMultiplier: number; organic: boolean } => {
  switch (sound) {
    case 'ocean':
    case 'singing-bowl':
    case 'crystal-bowls':
      return { baseMultiplier: 1.3, organic: true };
    case 'water':
    case 'healing-tones':
    case 'soft-piano':
      return { baseMultiplier: 1.15, organic: true };
    case 'forest':
    case 'rain':
    case 'night':
      return { baseMultiplier: 1.0, organic: true };
    case 'wind':
    case 'temple-bells':
      return { baseMultiplier: 0.95, organic: false };
    default:
      return { baseMultiplier: 1.1, organic: true };
  }
};

const BreathingVisualization = ({
  phase,
  isActive,
  selectedSound,
  inhaleDuration,
  exhaleDuration,
}: BreathingVisualizationProps) => {
  const [reducedMotion, setReducedMotion] = useState(false);
  
  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  const { baseMultiplier, organic } = getSoundTempo(selectedSound);
  
  // Calculate scale based on phase
  const getScale = () => {
    if (!isActive) return 0.75;
    switch (phase) {
      case 'inhale': return 1;
      case 'hold-in': return 1;
      case 'exhale': return 0.55;
      case 'hold-out': return 0.55;
      default: return 0.75;
    }
  };

  const getDuration = () => {
    if (reducedMotion) return 0.3;
    switch (phase) {
      case 'inhale': return inhaleDuration * baseMultiplier;
      case 'exhale': return exhaleDuration * baseMultiplier;
      default: return 0.5;
    }
  };

  // Reduced petal count: 6->4, 8->4
  const petalCount = 4;
  const petals = useMemo(() => Array.from({ length: petalCount }, (_, i) => i), []);

  // Reduced particles: 4->2
  const particles = useMemo(() => [0, 1], []);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Outer ethereal glow - simplified, no blur */}
      <motion.div
        animate={{
          scale: isActive && !reducedMotion ? [1, 1.08, 1] : 1,
          opacity: isActive ? 0.2 : 0.1,
        }}
        transition={{
          duration: reducedMotion ? 0 : 6 * baseMultiplier,
          repeat: reducedMotion ? 0 : Infinity,
          ease: 'easeInOut',
        }}
        className="absolute w-full h-full rounded-full bg-gradient-radial from-primary/15 via-primary/5 to-transparent"
        style={{ willChange: 'transform, opacity' }}
      />

      {/* Sacred geometry petals - CSS rotation, reduced count */}
      <div 
        className={`absolute inset-2 ${isActive && !reducedMotion ? 'animate-spin-slow' : ''}`}
        style={{ animationDuration: `${120 * baseMultiplier}s` }}
      >
        {petals.map((i) => (
          <motion.div
            key={i}
            animate={{
              scale: getScale(),
              opacity: isActive ? 0.25 : 0.1,
            }}
            transition={{
              scale: { duration: getDuration(), ease: 'easeInOut' },
              opacity: { duration: 0.3 },
            }}
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transform: `rotate(${i * (360 / petalCount)}deg)`,
              willChange: 'transform, opacity',
            }}
          >
            {/* Removed blur filter - using soft gradient instead */}
            <div className="w-1/2 h-8 origin-bottom rounded-t-full bg-gradient-to-t from-transparent via-primary/15 to-primary/25" />
          </motion.div>
        ))}
      </div>

      {/* Middle breathing ring - simplified shadow */}
      <motion.div
        animate={{
          scale: getScale(),
          opacity: isActive ? 0.4 : 0.15,
        }}
        transition={{
          duration: getDuration(),
          ease: organic ? 'easeInOut' : [0.4, 0, 0.6, 1],
        }}
        className="absolute w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 via-primary/15 to-primary/20 border border-primary/20 shadow-lg shadow-primary/20"
        style={{ willChange: 'transform, opacity' }}
      />

      {/* Inner breathing core - combined with pulse, simplified shadow */}
      <motion.div
        animate={{
          scale: reducedMotion ? getScale() : [getScale(), getScale() * 1.05, getScale()],
        }}
        transition={{
          duration: reducedMotion ? getDuration() : 3 * baseMultiplier,
          repeat: reducedMotion ? 0 : Infinity,
          ease: 'easeInOut',
        }}
        className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary/25 via-primary/15 to-primary/20 flex items-center justify-center shadow-lg shadow-primary/30"
        style={{ willChange: 'transform' }}
      >
        <Wind className="w-6 h-6 text-primary/60" />
      </motion.div>

      {/* Floating particles - reduced to 2, simplified */}
      {isActive && !reducedMotion && (
        <>
          {particles.map((i) => (
            <motion.div
              key={`particle-${i}`}
              initial={{ opacity: 0, y: 0 }}
              animate={{
                opacity: [0, 0.5, 0],
                y: [-20, -40],
                x: [0, (i % 2 === 0 ? 1 : -1) * 15],
              }}
              transition={{
                duration: 4 * baseMultiplier,
                repeat: Infinity,
                delay: i * 2,
                ease: 'easeOut',
              }}
              className="absolute w-1.5 h-1.5 rounded-full bg-primary/60"
              style={{ willChange: 'transform, opacity' }}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default BreathingVisualization;
