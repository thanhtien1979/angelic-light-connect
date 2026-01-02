import { memo } from 'react';
import type { TrailPoint } from './types';

/**
 * LightTrail - Renders a soft light trail following the angel
 * Trail fades smoothly and adapts to movement speed
 */

interface LightTrailProps {
  points: TrailPoint[];
}

const LightTrail = memo(({ points }: LightTrailProps) => {
  if (points.length < 2) return null;

  // Create smooth path from points
  const pathData = points.reduce((acc, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }
    // Use quadratic curves for smooth path
    const prev = points[index - 1];
    const midX = (prev.x + point.x) / 2;
    const midY = (prev.y + point.y) / 2;
    return `${acc} Q ${prev.x} ${prev.y} ${midX} ${midY}`;
  }, '');

  return (
    <svg
      className="absolute inset-0 pointer-events-none overflow-visible"
      style={{ width: '100%', height: '100%' }}
    >
      <defs>
        <linearGradient id="trailGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.4)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
        </linearGradient>
        <filter id="trailGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* Main trail path */}
      <path
        d={pathData}
        fill="none"
        stroke="url(#trailGradient)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#trailGlow)"
        opacity={0.6}
      />
      
      {/* Softer inner trail */}
      <path
        d={pathData}
        fill="none"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
});

LightTrail.displayName = 'LightTrail';

export default LightTrail;
