import { memo } from 'react';
import type { AngelStyle } from './types';

/**
 * Angel SVG Components - Each represents a different angel style
 * All SVGs are designed to be calm, sacred, and non-intrusive
 */

export const ClassicAngelSVG = memo(() => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Halo */}
    <ellipse cx="24" cy="10" rx="8" ry="3" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" fill="none" />
    {/* Head */}
    <circle cx="24" cy="18" r="6" fill="rgba(255,245,238,0.95)" />
    {/* Body/Robe */}
    <path d="M18 24 L24 44 L30 24 Q24 28 18 24Z" fill="rgba(255,255,255,0.9)" />
    {/* Left Wing */}
    <path 
      d="M18 22 Q8 18 6 26 Q10 24 14 26 Q10 28 8 34 Q14 30 18 32 Q16 28 18 24Z" 
      fill="rgba(255,255,255,0.85)"
      stroke="rgba(255,255,255,0.4)"
      strokeWidth="0.5"
    />
    {/* Right Wing */}
    <path 
      d="M30 22 Q40 18 42 26 Q38 24 34 26 Q38 28 40 34 Q34 30 30 32 Q32 28 30 24Z" 
      fill="rgba(255,255,255,0.85)"
      stroke="rgba(255,255,255,0.4)"
      strokeWidth="0.5"
    />
  </svg>
));
ClassicAngelSVG.displayName = 'ClassicAngelSVG';

export const CherubSVG = memo(() => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Soft halo glow */}
    <ellipse cx="20" cy="10" rx="6" ry="2.5" stroke="rgba(255,250,230,0.8)" strokeWidth="1.5" fill="none" />
    {/* Round face */}
    <circle cx="20" cy="16" r="7" fill="rgba(255,240,230,0.95)" />
    {/* Rosy cheeks */}
    <circle cx="16" cy="17" r="1.5" fill="rgba(255,200,180,0.4)" />
    <circle cx="24" cy="17" r="1.5" fill="rgba(255,200,180,0.4)" />
    {/* Small body */}
    <ellipse cx="20" cy="30" rx="6" ry="8" fill="rgba(255,255,255,0.85)" />
    {/* Soft round wings */}
    <ellipse cx="10" cy="22" rx="6" ry="8" fill="rgba(255,255,255,0.75)" transform="rotate(-15 10 22)" />
    <ellipse cx="30" cy="22" rx="6" ry="8" fill="rgba(255,255,255,0.75)" transform="rotate(15 30 22)" />
  </svg>
));
CherubSVG.displayName = 'CherubSVG';

export const SeraphSVG = memo(() => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Radiant halo */}
    <ellipse cx="26" cy="10" rx="10" ry="4" stroke="rgba(255,255,240,0.95)" strokeWidth="2" fill="rgba(255,255,255,0.2)" />
    {/* Light-based face */}
    <circle cx="26" cy="18" r="5" fill="rgba(255,255,255,0.9)" />
    {/* Ethereal body */}
    <path d="M20 23 L26 48 L32 23 Q26 26 20 23Z" fill="rgba(255,255,255,0.8)" />
    {/* Multi-layered abstract wings - Left */}
    <path d="M20 20 Q6 14 4 24 Q8 22 12 25 Q6 28 4 36 Q12 30 18 34 Q14 28 18 22Z" 
          fill="rgba(255,255,255,0.7)" />
    <path d="M19 21 Q10 18 8 25 Q11 24 14 26 Q10 28 9 32 Q14 29 18 31Z" 
          fill="rgba(255,255,240,0.6)" />
    {/* Multi-layered abstract wings - Right */}
    <path d="M32 20 Q46 14 48 24 Q44 22 40 25 Q46 28 48 36 Q40 30 34 34 Q38 28 34 22Z" 
          fill="rgba(255,255,255,0.7)" />
    <path d="M33 21 Q42 18 44 25 Q41 24 38 26 Q42 28 43 32 Q38 29 34 31Z" 
          fill="rgba(255,255,240,0.6)" />
    {/* Light rays */}
    <line x1="26" y1="6" x2="26" y2="2" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
    <line x1="20" y1="7" x2="17" y2="4" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
    <line x1="32" y1="7" x2="35" y2="4" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
  </svg>
));
SeraphSVG.displayName = 'SeraphSVG';

export const GuardianAngelSVG = memo(() => (
  <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Protective halo */}
    <ellipse cx="28" cy="10" rx="9" ry="3.5" stroke="rgba(240,248,255,0.9)" strokeWidth="1.5" fill="none" />
    {/* Serene face */}
    <circle cx="28" cy="18" r="6" fill="rgba(255,248,245,0.95)" />
    {/* Tall flowing robe */}
    <path d="M20 24 L28 54 L36 24 Q28 30 20 24Z" fill="rgba(255,255,255,0.88)" />
    {/* Shoulder detail */}
    <ellipse cx="28" cy="26" rx="10" ry="3" fill="rgba(255,255,255,0.7)" />
    {/* Large protective wings - Left */}
    <path d="M20 22 Q4 16 2 28 Q8 24 14 28 Q6 32 4 42 Q14 34 20 40 Q16 32 20 24Z" 
          fill="rgba(255,255,255,0.82)"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="0.5" />
    {/* Large protective wings - Right */}
    <path d="M36 22 Q52 16 54 28 Q48 24 42 28 Q50 32 52 42 Q42 34 36 40 Q40 32 36 24Z" 
          fill="rgba(255,255,255,0.82)"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="0.5" />
    {/* Inner wing glow */}
    <path d="M22 25 Q12 22 10 30 Q14 28 18 30 Q14 32 12 36 Q18 33 22 35Z" 
          fill="rgba(240,248,255,0.4)" />
    <path d="M34 25 Q44 22 46 30 Q42 28 38 30 Q42 32 44 36 Q38 33 34 35Z" 
          fill="rgba(240,248,255,0.4)" />
  </svg>
));
GuardianAngelSVG.displayName = 'GuardianAngelSVG';

// Map styles to SVG components
export const AngelSVGMap: Record<AngelStyle, React.ComponentType> = {
  classic: ClassicAngelSVG,
  cherub: CherubSVG,
  seraph: SeraphSVG,
  guardian: GuardianAngelSVG,
};
