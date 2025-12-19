import { motion } from 'framer-motion';
import { Wind } from 'lucide-react';
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
      return { baseMultiplier: 1.3, organic: true }; // Slowest, most meditative
    case 'water':
    case 'healing-tones':
    case 'soft-piano':
      return { baseMultiplier: 1.15, organic: true }; // Calm, flowing
    case 'forest':
    case 'rain':
    case 'night':
      return { baseMultiplier: 1.0, organic: true }; // Natural rhythm
    case 'wind':
    case 'temple-bells':
      return { baseMultiplier: 0.95, organic: false }; // Slightly dynamic
    default:
      return { baseMultiplier: 1.1, organic: true }; // Default calm
  }
};

const BreathingVisualization = ({
  phase,
  isActive,
  selectedSound,
  inhaleDuration,
  exhaleDuration,
}: BreathingVisualizationProps) => {
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
    switch (phase) {
      case 'inhale': return inhaleDuration * baseMultiplier;
      case 'exhale': return exhaleDuration * baseMultiplier;
      default: return 0.5;
    }
  };

  // Sacred geometry petal count based on sound type
  const petalCount = organic ? 6 : 8;
  const petals = Array.from({ length: petalCount }, (_, i) => i);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Outer ethereal glow */}
      <motion.div
        animate={{
          scale: isActive ? [1, 1.1, 1] : 1,
          opacity: isActive ? [0.15, 0.25, 0.15] : 0.1,
        }}
        transition={{
          duration: 6 * baseMultiplier,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute w-full h-full rounded-full bg-gradient-radial from-primary/20 via-[hsl(45,50%,70%)]/10 to-transparent blur-xl"
      />

      {/* Sacred geometry petals - rotating slowly */}
      <motion.div
        animate={{
          rotate: isActive ? 360 : 0,
        }}
        transition={{
          duration: 120 * baseMultiplier,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute inset-2"
      >
        {petals.map((i) => (
          <motion.div
            key={i}
            animate={{
              scale: getScale(),
              opacity: isActive ? [0.15, 0.3, 0.15] : 0.1,
            }}
            transition={{
              scale: { duration: getDuration(), ease: 'easeInOut' },
              opacity: { duration: 4 * baseMultiplier, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 },
            }}
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transform: `rotate(${i * (360 / petalCount)}deg)`,
            }}
          >
            <div 
              className="w-1/2 h-8 origin-bottom rounded-t-full bg-gradient-to-t from-transparent via-primary/20 to-[hsl(45,50%,70%)]/30"
              style={{
                filter: 'blur(2px)',
              }}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Middle breathing ring */}
      <motion.div
        animate={{
          scale: getScale(),
          opacity: isActive ? 0.4 : 0.15,
        }}
        transition={{
          duration: getDuration(),
          ease: organic ? 'easeInOut' : [0.4, 0, 0.6, 1],
        }}
        className="absolute w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 via-[hsl(45,50%,70%)]/20 to-[hsl(350,40%,75%)]/20 border border-primary/20"
        style={{
          boxShadow: isActive 
            ? '0 0 40px hsl(var(--primary) / 0.3), inset 0 0 20px hsl(45, 50%, 70%, 0.2)' 
            : '0 0 20px hsl(var(--primary) / 0.1)',
        }}
      />

      {/* Inner breathing core */}
      <motion.div
        animate={{
          scale: getScale(),
        }}
        transition={{
          duration: getDuration(),
          ease: 'easeInOut',
        }}
        className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary/25 via-primary/15 to-[hsl(45,50%,70%)]/25 flex items-center justify-center"
        style={{
          boxShadow: isActive 
            ? '0 0 30px hsl(var(--primary) / 0.4), 0 0 60px hsl(45, 50%, 70%, 0.2)' 
            : '0 0 15px hsl(var(--primary) / 0.15)',
        }}
      >
        {/* Gentle inner pulse */}
        <motion.div
          animate={{
            scale: isActive ? [1, 1.1, 1] : 1,
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 3 * baseMultiplier,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 rounded-full bg-gradient-radial from-[hsl(45,50%,70%)]/20 to-transparent"
        />
        
        <Wind className="w-6 h-6 text-primary/60" />
      </motion.div>

      {/* Floating particles - only when active */}
      {isActive && (
        <>
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              initial={{ opacity: 0, y: 0 }}
              animate={{
                opacity: [0, 0.6, 0],
                y: [-20, -50],
                x: [0, (i % 2 === 0 ? 1 : -1) * (10 + i * 5)],
              }}
              transition={{
                duration: 4 * baseMultiplier,
                repeat: Infinity,
                delay: i * 1.2,
                ease: 'easeOut',
              }}
              className="absolute w-1.5 h-1.5 rounded-full bg-[hsl(45,60%,70%)]"
              style={{
                boxShadow: '0 0 8px hsl(45, 60%, 70%, 0.8)',
              }}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default BreathingVisualization;
