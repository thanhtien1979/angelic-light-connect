/**
 * Angel Presence Preset Themes
 * Pre-configured bundles of style, color, and effects
 */

import type { AngelStyle, AngelColor } from './types';

export interface AngelPreset {
  id: string;
  name: string;
  description: string;
  // Settings bundle
  style: AngelStyle;
  color: AngelColor;
  sparklesEnabled: boolean;
  trailEnabled: boolean;
  // Visual preview hints
  previewGlow: string;
  accentColor: string;
}

export const ANGEL_PRESETS: AngelPreset[] = [
  {
    id: 'ethereal',
    name: 'Ethereal',
    description: 'Serene, radiant presence with soft celestial glow',
    style: 'seraph',
    color: 'blue',
    sparklesEnabled: true, // rare sparkles
    trailEnabled: true, // subtle trail
    previewGlow: 'rgba(150, 200, 255, 0.4)',
    accentColor: 'hsl(210 80% 75%)',
  },
  {
    id: 'golden-guardian',
    name: 'Golden Guardian',
    description: 'Protective, warm presence with steady golden light',
    style: 'guardian',
    color: 'gold',
    sparklesEnabled: false, // very rare
    trailEnabled: false, // off or very subtle
    previewGlow: 'rgba(255, 215, 100, 0.4)',
    accentColor: 'hsl(45 100% 70%)',
  },
  {
    id: 'celestial-pink',
    name: 'Celestial Pink',
    description: 'Graceful, joyful spirit with delicate pink sparkles',
    style: 'joy',
    color: 'pink',
    sparklesEnabled: true, // occasional
    trailEnabled: true, // sparkle trail
    previewGlow: 'rgba(255, 180, 200, 0.4)',
    accentColor: 'hsl(330 70% 80%)',
  },
];

/**
 * Detect if current settings match a preset exactly
 */
export function detectCurrentPreset(
  style: AngelStyle,
  color: AngelColor,
  sparklesEnabled: boolean,
  trailEnabled: boolean
): string | null {
  for (const preset of ANGEL_PRESETS) {
    if (
      preset.style === style &&
      preset.color === color &&
      preset.sparklesEnabled === sparklesEnabled &&
      preset.trailEnabled === trailEnabled
    ) {
      return preset.id;
    }
  }
  return null;
}
