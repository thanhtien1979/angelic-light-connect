import { memo } from 'react';
import type { SparkleParticle, AngelColor } from './types';
import { ANGEL_COLORS } from './types';

/**
 * SparkleParticles - Renders subtle sparkle effects around the angel
 * Each sparkle fades out gently within 1-2 seconds
 * Color adapts to the selected angel color
 */

interface SparkleParticlesProps {
  particles: SparkleParticle[];
  color?: AngelColor;
}

const SparkleParticles = memo(({ particles, color = 'white' }: SparkleParticlesProps) => {
  const colorConfig = ANGEL_COLORS.find(c => c.id === color) || ANGEL_COLORS[0];
  
  // Generate sparkle color based on angel color
  const getSparkleColor = (opacity: number) => {
    // Extract base color from glowColor and apply custom opacity
    const baseGlow = colorConfig.glowColor;
    // Parse rgba and adjust opacity
    const match = baseGlow.match(/rgba?\(([^)]+)\)/);
    if (match) {
      const parts = match[1].split(',').map(s => s.trim());
      if (parts.length >= 3) {
        return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${opacity})`;
      }
    }
    return `rgba(255, 255, 255, ${opacity})`;
  };

  return (
    <>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute pointer-events-none"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            opacity: particle.opacity,
            animation: 'sparkle-fade 1.5s ease-out forwards',
          }}
        >
          {/* Star-like sparkle with dynamic color */}
          <svg
            width={particle.size}
            height={particle.size}
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 0 L9 6 L16 8 L9 10 L8 16 L7 10 L0 8 L7 6 Z"
              fill={getSparkleColor(0.9)}
            />
            <circle cx="8" cy="8" r="2" fill={getSparkleColor(1)} />
          </svg>
        </div>
      ))}
      
      {/* Sparkle animation styles */}
      <style>{`
        @keyframes sparkle-fade {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          20% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(0.3);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
});

SparkleParticles.displayName = 'SparkleParticles';

export default SparkleParticles;
