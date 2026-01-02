// Re-export from context for backward compatibility
// This hook can be used in components that are within the SoundSettingsProvider
import { useSoundSettingsContext } from "@/contexts/SoundSettingsContext";

export type { SoundSettings } from "@/contexts/SoundSettingsContext";

export const useSoundSettings = useSoundSettingsContext;
