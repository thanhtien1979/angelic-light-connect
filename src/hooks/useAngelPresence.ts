import { useAngelPresenceContext } from '@/contexts/AngelPresenceContext';

/**
 * Hook to manage Angel Presence state and settings
 * This is a thin wrapper around the context for backwards compatibility
 */
export function useAngelPresence() {
  return useAngelPresenceContext();
}

// Re-export types
export type { AngelStyle, AngelColor, AngelPresenceSettings } from '@/components/AngelPresence/types';
