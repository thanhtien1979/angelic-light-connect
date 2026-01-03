/**
 * Angel Presence Type Definitions
 */

export type AngelStyle = 'classic' | 'cherub' | 'seraph' | 'guardian' | 'joy' | 'peace' | 'healing' | 'fairy' | 'fairy-blue' | 'fairy-red' | 'fairy-pink' | 'fairy-mint' | 'fairy-video' | 'celestial-video' | 'starlight-seraph' | 'aurora-guardian' | 'nebula-messenger';

export type AngelColor = 'white' | 'gold' | 'blue' | 'pink' | 'green' | 'purple';

export interface AngelColorConfig {
  id: AngelColor;
  name: string;
  hsl: string;
  glowColor: string;
}

export interface AngelAnimationConfig {
  floatDuration: number;      // seconds - main float cycle
  floatAmplitude: number;     // pixels - vertical float distance
  flapDuration?: number;      // seconds - wing flap (if applicable)
  followEasing: number;       // 0-1 - how smoothly it follows cursor
  sparkleIntensity: number;   // 0-1 - particle spawn rate multiplier
  trailIntensity: number;     // 0-1 - trail opacity/length multiplier
  bouncy?: boolean;           // adds micro-bounce effect
  pulseGlow?: boolean;        // adds breathing glow effect
}

export interface VideoSources {
  webmSrc?: string;    // WebM with alpha (preferred)
  mp4Src: string;      // MP4 fallback (required)
  posterSrc?: string;  // Thumbnail for selector
}

export interface AngelStyleConfig {
  id: AngelStyle;
  name: string;
  description: string;
  glowIntensity: number; // 0-1
  glowColor: string;
  scale: number;
  animation: AngelAnimationConfig;
  isVideo?: boolean;
  videoSources?: VideoSources;
}

export interface SparkleParticle {
  id: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
  createdAt: number;
}

export interface TrailPoint {
  id: string;
  x: number;
  y: number;
  opacity: number;
  createdAt: number;
}

export interface AngelPresenceSettings {
  enabled: boolean;
  style: AngelStyle;
  color: AngelColor;
  sparklesEnabled: boolean;
  trailEnabled: boolean;
  customImageUrl?: string;
}

export const ANGEL_COLORS: AngelColorConfig[] = [
  {
    id: 'white',
    name: 'Pure Light',
    hsl: '0 0% 100%',
    glowColor: 'rgba(255, 255, 255, 0.6)',
  },
  {
    id: 'gold',
    name: 'Divine Gold',
    hsl: '45 100% 70%',
    glowColor: 'rgba(255, 215, 100, 0.6)',
  },
  {
    id: 'blue',
    name: 'Celestial Blue',
    hsl: '210 80% 75%',
    glowColor: 'rgba(150, 200, 255, 0.6)',
  },
  {
    id: 'pink',
    name: 'Rose Grace',
    hsl: '330 70% 80%',
    glowColor: 'rgba(255, 180, 200, 0.6)',
  },
  {
    id: 'green',
    name: 'Healing Light',
    hsl: '140 50% 70%',
    glowColor: 'rgba(150, 220, 170, 0.6)',
  },
  {
    id: 'purple',
    name: 'Sacred Violet',
    hsl: '270 60% 75%',
    glowColor: 'rgba(200, 160, 255, 0.6)',
  },
];

export const ANGEL_STYLES: AngelStyleConfig[] = [
  {
    id: 'classic',
    name: 'Classic Angel',
    description: 'Soft wings with white glow',
    glowIntensity: 0.6,
    glowColor: 'rgba(255,255,255,0.6)',
    scale: 1,
    animation: {
      floatDuration: 3,
      floatAmplitude: 4,
      flapDuration: 2.5,
      followEasing: 0.12,
      sparkleIntensity: 1,
      trailIntensity: 1,
    },
  },
  {
    id: 'cherub',
    name: 'Cherub',
    description: 'Small, gentle, child-friendly',
    glowIntensity: 0.5,
    glowColor: 'rgba(255,245,220,0.6)',
    scale: 0.8,
    animation: {
      floatDuration: 2.2,
      floatAmplitude: 5,
      flapDuration: 1.8,
      followEasing: 0.15,
      sparkleIntensity: 0.7,
      trailIntensity: 0.6,
      bouncy: true,
    },
  },
  {
    id: 'seraph',
    name: 'Seraph',
    description: 'Light-based, radiant wings',
    glowIntensity: 0.8,
    glowColor: 'rgba(255,255,240,0.7)',
    scale: 1.1,
    animation: {
      floatDuration: 4,
      floatAmplitude: 3,
      followEasing: 0.08,
      sparkleIntensity: 1.3,
      trailIntensity: 1.2,
      pulseGlow: true,
    },
  },
  {
    id: 'guardian',
    name: 'Guardian Angel',
    description: 'Tall, protective presence',
    glowIntensity: 0.55,
    glowColor: 'rgba(240,248,255,0.6)',
    scale: 1.2,
    animation: {
      floatDuration: 3.5,
      floatAmplitude: 2.5,
      followEasing: 0.1,
      sparkleIntensity: 0.8,
      trailIntensity: 0.9,
      pulseGlow: true,
    },
  },
  {
    id: 'joy',
    name: 'Joy Angel',
    description: 'Uplifting, playful spirit',
    glowIntensity: 0.65,
    glowColor: 'rgba(255,250,240,0.65)',
    scale: 1,
    animation: {
      floatDuration: 2.5,
      floatAmplitude: 6,
      flapDuration: 2,
      followEasing: 0.14,
      sparkleIntensity: 1.2,
      trailIntensity: 1.1,
      bouncy: true,
    },
  },
  {
    id: 'peace',
    name: 'Peace Angel',
    description: 'Serene, calming presence',
    glowIntensity: 0.5,
    glowColor: 'rgba(245,250,255,0.6)',
    scale: 1.05,
    animation: {
      floatDuration: 4.5,
      floatAmplitude: 2,
      followEasing: 0.07,
      sparkleIntensity: 0.6,
      trailIntensity: 0.7,
    },
  },
  {
    id: 'healing',
    name: 'Healing Angel',
    description: 'Gentle, restorative energy',
    glowIntensity: 0.6,
    glowColor: 'rgba(250,255,250,0.6)',
    scale: 1.1,
    animation: {
      floatDuration: 3.8,
      floatAmplitude: 3,
      followEasing: 0.09,
      sparkleIntensity: 0.9,
      trailIntensity: 0.8,
      pulseGlow: true,
    },
  },
  {
    id: 'fairy',
    name: 'Fairy Angel',
    description: 'Whimsical, magical spirit',
    glowIntensity: 0.7,
    glowColor: 'rgba(255,220,255,0.6)',
    scale: 1,
    animation: {
      floatDuration: 2.8,
      floatAmplitude: 5,
      flapDuration: 2.8,
      followEasing: 0.13,
      sparkleIntensity: 1.4,
      trailIntensity: 1.3,
      bouncy: true,
    },
  },
  {
    id: 'fairy-blue',
    name: 'Blue Fairy',
    description: 'Serene blue fairy with elegant wings',
    glowIntensity: 0.65,
    glowColor: 'rgba(150,200,255,0.6)',
    scale: 1,
    animation: {
      floatDuration: 3,
      floatAmplitude: 4,
      flapDuration: 2.5,
      followEasing: 0.12,
      sparkleIntensity: 1.2,
      trailIntensity: 1.1,
      bouncy: true,
    },
  },
  {
    id: 'fairy-red',
    name: 'Red Fairy',
    description: 'Playful fairy with colorful wings',
    glowIntensity: 0.7,
    glowColor: 'rgba(255,150,180,0.6)',
    scale: 1,
    animation: {
      floatDuration: 2.5,
      floatAmplitude: 5,
      flapDuration: 2.2,
      followEasing: 0.14,
      sparkleIntensity: 1.3,
      trailIntensity: 1.2,
      bouncy: true,
    },
  },
  {
    id: 'fairy-pink',
    name: 'Pink Fairy',
    description: 'Graceful fairy with pink & gold wings',
    glowIntensity: 0.68,
    glowColor: 'rgba(255,180,200,0.6)',
    scale: 1,
    animation: {
      floatDuration: 2.8,
      floatAmplitude: 4.5,
      flapDuration: 2.4,
      followEasing: 0.13,
      sparkleIntensity: 1.25,
      trailIntensity: 1.15,
      bouncy: true,
    },
  },
  {
    id: 'fairy-mint',
    name: 'Mint Fairy',
    description: 'Sweet fairy with mint green wings',
    glowIntensity: 0.6,
    glowColor: 'rgba(180,255,220,0.6)',
    scale: 1,
    animation: {
      floatDuration: 3.2,
      floatAmplitude: 4,
      flapDuration: 2.6,
      followEasing: 0.11,
      sparkleIntensity: 1.1,
      trailIntensity: 1.0,
      bouncy: true,
    },
  },
  {
    id: 'fairy-video',
    name: 'Animated Fairy',
    description: 'Magical animated fairy video',
    glowIntensity: 0.75,
    glowColor: 'rgba(255,220,255,0.7)',
    scale: 1.1,
    isVideo: true,
    animation: {
      floatDuration: 3,
      floatAmplitude: 4,
      flapDuration: 2.5,
      followEasing: 0.12,
      sparkleIntensity: 1.4,
      trailIntensity: 1.3,
      bouncy: true,
    },
  },
  {
    id: 'celestial-video',
    name: 'Celestial Video',
    description: 'Mesmerizing celestial video angel',
    glowIntensity: 0.7,
    glowColor: 'rgba(200,220,255,0.65)',
    scale: 1.15,
    isVideo: true,
    animation: {
      floatDuration: 3.5,
      floatAmplitude: 3.5,
      flapDuration: 3,
      followEasing: 0.1,
      sparkleIntensity: 0.8,
      trailIntensity: 0.9,
      pulseGlow: true,
    },
  },
  {
    id: 'starlight-seraph',
    name: 'Starlight Seraph',
    description: 'Shimmering starlight and stardust angel',
    glowIntensity: 0.75,
    glowColor: 'rgba(255,250,220,0.7)',
    scale: 1.1,
    isVideo: true,
    animation: {
      floatDuration: 3.2,
      floatAmplitude: 3,
      flapDuration: 2.8,
      followEasing: 0.09,
      sparkleIntensity: 1.2,
      trailIntensity: 1.0,
      pulseGlow: true,
    },
  },
  {
    id: 'aurora-guardian',
    name: 'Aurora Guardian',
    description: 'Divine guardian of northern lights',
    glowIntensity: 0.72,
    glowColor: 'rgba(100,220,180,0.65)',
    scale: 1.2,
    isVideo: true,
    animation: {
      floatDuration: 3.8,
      floatAmplitude: 2.5,
      flapDuration: 3.2,
      followEasing: 0.08,
      sparkleIntensity: 0.7,
      trailIntensity: 1.1,
      pulseGlow: true,
    },
  },
  {
    id: 'nebula-messenger',
    name: 'Nebula Messenger',
    description: 'Cosmic messenger from the nebulae',
    glowIntensity: 0.78,
    glowColor: 'rgba(200,150,255,0.7)',
    scale: 1.15,
    isVideo: true,
    animation: {
      floatDuration: 3.5,
      floatAmplitude: 3.5,
      flapDuration: 3,
      followEasing: 0.1,
      sparkleIntensity: 0.9,
      trailIntensity: 1.0,
      pulseGlow: true,
    },
  },
];
