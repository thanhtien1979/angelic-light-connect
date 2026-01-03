import { useAngelPresenceContext } from '@/contexts/AngelPresenceContext';

/**
 * Hook to manage Angel Presence state and settings
 * This is a thin wrapper around the context for backwards compatibility
 * 
 * Returns:
 * - isEnabled: whether angel cursor is enabled
 * - style: the selected angel style
 * - color: the selected color
 * - sparklesEnabled: whether sparkle particles are enabled
 * - trailEnabled: whether light trail is enabled
 * - customImageUrl: custom uploaded image URL if any
 * - isLoading: whether settings are being loaded
 * - isHydrated: whether settings have been hydrated from storage
 * - syncStatus: current sync status (idle | saving | success | error)
 * - toggle, setEnabled, setStyle, setColor, etc.: action functions
 * - resetToDefaults: reset all angel presence settings to defaults
 */
export function useAngelPresence() {
  return useAngelPresenceContext();
}

// Re-export types
export type { AngelStyle, AngelColor, AngelPresenceSettings, VideoQuality } from '@/components/AngelPresence/types';
export type { SyncStatus } from '@/contexts/AngelPresenceContext';
