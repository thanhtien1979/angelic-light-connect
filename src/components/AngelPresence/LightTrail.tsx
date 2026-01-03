import { memo, useMemo } from 'react';
import type { TrailPoint, AngelColor } from './types';
import { ANGEL_COLORS } from './types';

/**
 * LightTrail - Renders a soft light trail following the angel
 * Trail fades smoothly and adapts to movement speed
 * Color adapts to the selected angel color
 */

interface LightTrailProps {
  points: TrailPoint[];
  color?: AngelColor;
}

const LightTrail = memo(({ points, color = 'white' }: LightTrailProps) => {
  if (points.length < 2) return null;

  const colorConfig = ANGEL_COLORS.find(c => c.id === color) || ANGEL_COLORS[0];
  
  // Generate unique gradient ID to avoid conflicts when multiple trails exist
  const gradientId = useMemo(() => `trailGradient-${color}-${Math.random().toString(36).substr(2, 9)}`, [color]);
  const filterId = useMemo(() => `trailGlow-${color}-${Math.random().toString(36).substr(2, 9)}`, [color]);

  // Extract RGB from glow color for trail
  const getTrailColor = (opacity: number) => {
    const match = colorConfig.glowColor.match(/rgba?\(([^)]+)\)/);
    if (match) {
      const parts = match[1].split(',').map(s => s.trim());
      if (parts.length >= 3) {
        return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${opacity})`;
      }
    }
    return `rgba(255, 255, 255, ${opacity})`;
  };

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
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={getTrailColor(0)} />
          <stop offset="50%" stopColor={getTrailColor(0.5)} />
          <stop offset="100%" stopColor={getTrailColor(0.15)} />
        </linearGradient>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
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
        stroke={`url(#${gradientId})`}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${filterId})`}
        opacity={0.6}
      />
      
      {/* Softer inner trail */}
      <path
        d={pathData}
        fill="none"
        stroke={getTrailColor(0.35)}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
});

LightTrail.displayName = 'LightTrail';

export default LightTrail;
