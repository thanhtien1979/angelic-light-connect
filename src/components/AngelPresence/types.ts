/**
 * Angel Presence Type Definitions
 */

export type AngelStyle = 'classic' | 'cherub' | 'seraph' | 'guardian';

export interface AngelStyleConfig {
  id: AngelStyle;
  name: string;
  description: string;
  glowIntensity: number; // 0-1
  glowColor: string;
  scale: number;
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
  sparklesEnabled: boolean;
  trailEnabled: boolean;
}

export const ANGEL_STYLES: AngelStyleConfig[] = [
  {
    id: 'classic',
    name: 'Classic Angel',
    description: 'Soft wings with white glow',
    glowIntensity: 0.6,
    glowColor: 'rgba(255,255,255,0.6)',
    scale: 1,
  },
  {
    id: 'cherub',
    name: 'Cherub',
    description: 'Small, gentle, child-friendly',
    glowIntensity: 0.5,
    glowColor: 'rgba(255,245,220,0.6)',
    scale: 0.8,
  },
  {
    id: 'seraph',
    name: 'Seraph',
    description: 'Light-based, radiant wings',
    glowIntensity: 0.8,
    glowColor: 'rgba(255,255,240,0.7)',
    scale: 1.1,
  },
  {
    id: 'guardian',
    name: 'Guardian Angel',
    description: 'Tall, protective presence',
    glowIntensity: 0.55,
    glowColor: 'rgba(240,248,255,0.6)',
    scale: 1.2,
  },
];
