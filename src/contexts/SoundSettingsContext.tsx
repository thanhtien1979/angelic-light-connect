import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

const SOUND_SETTINGS_KEY = "angel-sound-settings";

export interface SoundSettings {
  ambientSounds: boolean;
  notificationSounds: boolean;
  meditationAudio: boolean;
}

interface SoundSettingsContextType {
  settings: SoundSettings;
  updateSetting: <K extends keyof SoundSettings>(key: K, value: SoundSettings[K]) => void;
  toggleSetting: (key: keyof SoundSettings) => void;
  isSoundAllowed: (type: keyof SoundSettings) => boolean;
  prefersReducedMotion: boolean;
}

const DEFAULT_SETTINGS: SoundSettings = {
  ambientSounds: false,
  notificationSounds: true,
  meditationAudio: false,
};

const SoundSettingsContext = createContext<SoundSettingsContextType | undefined>(undefined);

export const SoundSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<SoundSettings>(() => {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    
    const saved = localStorage.getItem(SOUND_SETTINGS_KEY);
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  // Check for reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Persist settings
  useEffect(() => {
    localStorage.setItem(SOUND_SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSetting = useCallback(<K extends keyof SoundSettings>(
    key: K,
    value: SoundSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const toggleSetting = useCallback((key: keyof SoundSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // Check if a sound type is allowed (respecting accessibility and user preference)
  const isSoundAllowed = useCallback((type: keyof SoundSettings): boolean => {
    if (prefersReducedMotion) return false;
    return settings[type];
  }, [settings, prefersReducedMotion]);

  return (
    <SoundSettingsContext.Provider value={{
      settings,
      updateSetting,
      toggleSetting,
      isSoundAllowed,
      prefersReducedMotion,
    }}>
      {children}
    </SoundSettingsContext.Provider>
  );
};

export const useSoundSettingsContext = (): SoundSettingsContextType => {
  const context = useContext(SoundSettingsContext);
  if (!context) {
    throw new Error("useSoundSettingsContext must be used within a SoundSettingsProvider");
  }
  return context;
};
