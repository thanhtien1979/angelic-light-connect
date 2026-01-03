import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

const LIGHT_BURST_SETTINGS_KEY = "angel-light-burst-settings";

export interface LightBurstSettings {
  enabled: boolean;
  soundEnabled: boolean;
  color: 'gold' | 'blue' | 'pink' | 'purple' | 'green' | 'rainbow';
}

interface LightBurstContextType {
  settings: LightBurstSettings;
  updateSetting: <K extends keyof LightBurstSettings>(key: K, value: LightBurstSettings[K]) => void;
}

const DEFAULT_SETTINGS: LightBurstSettings = {
  enabled: true,
  soundEnabled: true,
  color: 'gold',
};

export const LIGHT_BURST_COLORS = {
  gold: { hue: 45, name: 'Vàng Ánh Sáng' },
  blue: { hue: 210, name: 'Xanh Thiên Đường' },
  pink: { hue: 330, name: 'Hồng Yêu Thương' },
  purple: { hue: 270, name: 'Tím Huyền Bí' },
  green: { hue: 140, name: 'Xanh Thiên Nhiên' },
  rainbow: { hue: 0, name: 'Cầu Vồng' },
} as const;

const LightBurstContext = createContext<LightBurstContextType | undefined>(undefined);

export const LightBurstProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<LightBurstSettings>(() => {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    
    const saved = localStorage.getItem(LIGHT_BURST_SETTINGS_KEY);
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  // Persist settings
  useEffect(() => {
    localStorage.setItem(LIGHT_BURST_SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSetting = useCallback(<K extends keyof LightBurstSettings>(
    key: K,
    value: LightBurstSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  return (
    <LightBurstContext.Provider value={{ settings, updateSetting }}>
      {children}
    </LightBurstContext.Provider>
  );
};

export const useLightBurst = (): LightBurstContextType => {
  const context = useContext(LightBurstContext);
  if (!context) {
    throw new Error("useLightBurst must be used within a LightBurstProvider");
  }
  return context;
};
