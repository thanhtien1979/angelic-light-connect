import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const LOCAL_STORAGE_KEY = "flying-angels-enabled";
const SETTINGS_STORAGE_KEY = "flying-angels-settings";

export interface FlyingAngelsSettings {
  angelCount: number; // 1-6
  size: number; // 40-150
  speed: number; // 0.5-2
}

const DEFAULT_SETTINGS: FlyingAngelsSettings = {
  angelCount: 5,
  size: 80,
  speed: 1,
};

export const useFlyingAngels = () => {
  const { user } = useAuth();
  const [isEnabled, setIsEnabled] = useState(() => {
    // Check localStorage first
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved !== null) {
      return saved === "true";
    }
    // Default to true for desktop
    return typeof window !== "undefined" && window.innerWidth >= 768;
  });
  
  const [settings, setSettings] = useState<FlyingAngelsSettings>(() => {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });
  
  const [isLoading, setIsLoading] = useState(false);

  // Sync with database for logged in users
  useEffect(() => {
    if (!user) return;

    const fetchPreference = async () => {
      try {
        const { data } = await supabase
          .from("user_preferences")
          .select("angel_presence_settings")
          .eq("user_id", user.id)
          .single();

        if (data?.angel_presence_settings) {
          const dbSettings = data.angel_presence_settings as Record<string, unknown>;
          if (typeof dbSettings.flyingAngelsEnabled === "boolean") {
            setIsEnabled(dbSettings.flyingAngelsEnabled);
            localStorage.setItem(LOCAL_STORAGE_KEY, String(dbSettings.flyingAngelsEnabled));
          }
          if (dbSettings.flyingAngelsSettings) {
            const flyingSettings = dbSettings.flyingAngelsSettings as FlyingAngelsSettings;
            setSettings({ ...DEFAULT_SETTINGS, ...flyingSettings });
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(flyingSettings));
          }
        }
      } catch (error) {
        console.error("Error fetching flying angels preference:", error);
      }
    };

    fetchPreference();
  }, [user]);

  const toggle = useCallback(async (enabled: boolean) => {
    setIsEnabled(enabled);
    localStorage.setItem(LOCAL_STORAGE_KEY, String(enabled));

    if (!user) return;

    setIsLoading(true);
    try {
      // Fetch current settings
      const { data: existing } = await supabase
        .from("user_preferences")
        .select("angel_presence_settings")
        .eq("user_id", user.id)
        .single();

      const currentSettings = (existing?.angel_presence_settings as Record<string, unknown>) || {};
      const updatedSettings = {
        ...currentSettings,
        flyingAngelsEnabled: enabled,
      };

      await supabase
        .from("user_preferences")
        .upsert({
          user_id: user.id,
          angel_presence_settings: updatedSettings,
          updated_at: new Date().toISOString(),
        });
    } catch (error) {
      console.error("Error saving flying angels preference:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const updateSettings = useCallback(async (newSettings: Partial<FlyingAngelsSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updatedSettings));
    
    // Emit change to all listeners
    emitFlyingAngelsSettingsChange(updatedSettings);

    if (!user) return;

    try {
      // Fetch current settings
      const { data: existing } = await supabase
        .from("user_preferences")
        .select("angel_presence_settings")
        .eq("user_id", user.id)
        .single();

      const currentDbSettings = (existing?.angel_presence_settings as Record<string, unknown>) || {};
      const newDbSettings = {
        ...currentDbSettings,
        flyingAngelsSettings: updatedSettings,
      };

      await supabase
        .from("user_preferences")
        .upsert({
          user_id: user.id,
          angel_presence_settings: newDbSettings,
          updated_at: new Date().toISOString(),
        });
    } catch (error) {
      console.error("Error saving flying angels settings:", error);
    }
  }, [settings, user]);

  return {
    isEnabled,
    isLoading,
    settings,
    toggle,
    updateSettings,
  };
};

// Global event emitter for flying angels state
type FlyingAngelsListener = (enabled: boolean) => void;
type FlyingAngelsSettingsListener = (settings: FlyingAngelsSettings) => void;

const listeners = new Set<FlyingAngelsListener>();
const settingsListeners = new Set<FlyingAngelsSettingsListener>();

export const emitFlyingAngelsChange = (enabled: boolean) => {
  listeners.forEach((listener) => listener(enabled));
};

export const subscribeFlyingAngels = (listener: FlyingAngelsListener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const emitFlyingAngelsSettingsChange = (settings: FlyingAngelsSettings) => {
  settingsListeners.forEach((listener) => listener(settings));
};

export const subscribeFlyingAngelsSettings = (listener: FlyingAngelsSettingsListener) => {
  settingsListeners.add(listener);
  return () => settingsListeners.delete(listener);
};
