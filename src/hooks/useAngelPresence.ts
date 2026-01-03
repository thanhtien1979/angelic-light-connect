import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { AngelStyle, AngelColor, AngelPresenceSettings } from '@/components/AngelPresence/types';

/**
 * Hook to manage Angel Presence state and settings
 */

const STORAGE_KEY = 'angel-presence-settings';

const defaultSettings: AngelPresenceSettings = {
  enabled: true,
  style: 'classic',
  color: 'white',
  sparklesEnabled: true,
  trailEnabled: true,
};

export function useAngelPresence() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AngelPresenceSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        if (user) {
          const { data } = await supabase
            .from('user_preferences')
            .select('angel_cursor_enabled, angel_cursor_color')
            .eq('user_id', user.id)
            .maybeSingle();

          if (data) {
            // Parse stored settings from angel_cursor_color field (used for JSON storage)
            let storedSettings: Partial<AngelPresenceSettings> = {};
            if (data.angel_cursor_color) {
              try {
                storedSettings = JSON.parse(data.angel_cursor_color);
              } catch {
                // If not valid JSON, ignore
              }
            }
            
            setSettings({
              enabled: data.angel_cursor_enabled ?? defaultSettings.enabled,
              style: (storedSettings.style as AngelStyle) || defaultSettings.style,
              color: (storedSettings.color as AngelColor) || defaultSettings.color,
              sparklesEnabled: storedSettings.sparklesEnabled ?? defaultSettings.sparklesEnabled,
              trailEnabled: storedSettings.trailEnabled ?? defaultSettings.trailEnabled,
            });
          }
        } else {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              setSettings({ ...defaultSettings, ...parsed });
            } catch {
              // Invalid JSON, use defaults
            }
          }
        }
      } catch (error) {
        console.error('Failed to load angel presence settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  // Save settings helper
  const saveSettings = useCallback(async (newSettings: AngelPresenceSettings) => {
    try {
      if (user) {
        const settingsJson = JSON.stringify({
          style: newSettings.style,
          color: newSettings.color,
          sparklesEnabled: newSettings.sparklesEnabled,
          trailEnabled: newSettings.trailEnabled,
        });
        
        await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            angel_cursor_enabled: newSettings.enabled,
            angel_cursor_color: settingsJson,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      }
    } catch (error) {
      console.error('Failed to save angel presence settings:', error);
    }
  }, [user]);

  // Toggle enabled
  const toggle = useCallback(async () => {
    const newSettings = { ...settings, enabled: !settings.enabled };
    setSettings(newSettings);
    await saveSettings(newSettings);
  }, [settings, saveSettings]);

  // Set enabled directly
  const setEnabled = useCallback(async (value: boolean) => {
    const newSettings = { ...settings, enabled: value };
    setSettings(newSettings);
    await saveSettings(newSettings);
  }, [settings, saveSettings]);

  // Set style
  const setStyle = useCallback(async (style: AngelStyle) => {
    const newSettings = { ...settings, style };
    setSettings(newSettings);
    await saveSettings(newSettings);
  }, [settings, saveSettings]);

  // Set color
  const setColor = useCallback(async (color: AngelColor) => {
    const newSettings = { ...settings, color };
    setSettings(newSettings);
    await saveSettings(newSettings);
  }, [settings, saveSettings]);

  // Set sparkles enabled
  const setSparklesEnabled = useCallback(async (value: boolean) => {
    const newSettings = { ...settings, sparklesEnabled: value };
    setSettings(newSettings);
    await saveSettings(newSettings);
  }, [settings, saveSettings]);

  // Set trail enabled
  const setTrailEnabled = useCallback(async (value: boolean) => {
    const newSettings = { ...settings, trailEnabled: value };
    setSettings(newSettings);
    await saveSettings(newSettings);
  }, [settings, saveSettings]);

  return {
    // Settings
    isEnabled: settings.enabled,
    style: settings.style,
    color: settings.color,
    sparklesEnabled: settings.sparklesEnabled,
    trailEnabled: settings.trailEnabled,
    isLoading,
    
    // Actions
    toggle,
    setEnabled,
    setStyle,
    setColor,
    setSparklesEnabled,
    setTrailEnabled,
  };
}
