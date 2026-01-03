import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { AngelStyle, AngelColor, AngelPresenceSettings } from '@/components/AngelPresence/types';
import { toast } from 'sonner';

const STORAGE_KEY = 'angel-presence-settings';
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_DIMENSIONS = 512;

const defaultSettings: AngelPresenceSettings = {
  enabled: true,
  style: 'classic',
  color: 'white',
  sparklesEnabled: true,
  trailEnabled: true,
  customImageUrl: undefined,
};

// Validate and resize image
async function processCustomImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.type !== 'image/png') {
      reject(new Error('Only PNG images are allowed'));
      return;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      reject(new Error('Image must be smaller than 2MB'));
      return;
    }
    
    const img = new Image();
    const reader = new FileReader();
    
    reader.onload = (e) => {
      img.onload = () => {
        let { width, height } = img;
        
        if (width > MAX_DIMENSIONS || height > MAX_DIMENSIONS) {
          const ratio = Math.min(MAX_DIMENSIONS / width, MAX_DIMENSIONS / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to process image'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/png', 0.9);
        resolve(dataUrl);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

// Load settings from localStorage (sync for initial state)
function getLocalStorageSettings(): AngelPresenceSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaultSettings, ...parsed };
    }
  } catch {
    // Invalid JSON, use defaults
  }
  return defaultSettings;
}

interface AngelPresenceContextValue {
  // Settings
  isEnabled: boolean;
  style: AngelStyle;
  color: AngelColor;
  sparklesEnabled: boolean;
  trailEnabled: boolean;
  customImageUrl?: string;
  isLoading: boolean;
  isUploading: boolean;
  isHydrated: boolean;
  
  // Actions
  toggle: () => Promise<void>;
  setEnabled: (value: boolean) => Promise<void>;
  setStyle: (style: AngelStyle) => Promise<void>;
  setColor: (color: AngelColor) => Promise<void>;
  setSparklesEnabled: (value: boolean) => Promise<void>;
  setTrailEnabled: (value: boolean) => Promise<void>;
  uploadCustomImage: (file: File) => Promise<void>;
  removeCustomImage: () => Promise<void>;
}

const AngelPresenceContext = createContext<AngelPresenceContextValue | null>(null);

export function AngelPresenceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  // Initialize with localStorage to prevent flicker
  const [settings, setSettings] = useState<AngelPresenceSettings>(() => getLocalStorageSettings());
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const hasLoadedFromDB = useRef(false);

  // Load settings on mount or user change
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      
      try {
        if (user) {
          // Load from database for authenticated users
          const { data, error } = await supabase
            .from('user_preferences')
            .select('angel_cursor_enabled, angel_presence_settings')
            .eq('user_id', user.id)
            .maybeSingle();

          if (error) {
            console.error('Failed to load angel presence settings:', error);
          }

          if (data) {
            const dbSettings = data.angel_presence_settings as Partial<AngelPresenceSettings> | null;
            
            const loadedSettings: AngelPresenceSettings = {
              enabled: data.angel_cursor_enabled ?? defaultSettings.enabled,
              style: (dbSettings?.style as AngelStyle) || defaultSettings.style,
              color: (dbSettings?.color as AngelColor) || defaultSettings.color,
              sparklesEnabled: dbSettings?.sparklesEnabled ?? defaultSettings.sparklesEnabled,
              trailEnabled: dbSettings?.trailEnabled ?? defaultSettings.trailEnabled,
              customImageUrl: dbSettings?.customImageUrl,
            };
            
            setSettings(loadedSettings);
            // Also update localStorage as backup
            localStorage.setItem(STORAGE_KEY, JSON.stringify(loadedSettings));
            hasLoadedFromDB.current = true;
          } else {
            // No DB record yet, use localStorage and save to DB
            const localSettings = getLocalStorageSettings();
            setSettings(localSettings);
            // Save to DB for future sessions
            await saveToDatabase(user.id, localSettings);
            hasLoadedFromDB.current = true;
          }
        } else {
          // Not logged in, use localStorage
          const localSettings = getLocalStorageSettings();
          setSettings(localSettings);
          hasLoadedFromDB.current = false;
        }
      } catch (error) {
        console.error('Failed to load angel presence settings:', error);
        // Fallback to localStorage
        setSettings(getLocalStorageSettings());
      } finally {
        setIsLoading(false);
        setIsHydrated(true);
      }
    };

    loadSettings();
  }, [user?.id]);

  // Save to database helper
  const saveToDatabase = async (userId: string, newSettings: AngelPresenceSettings) => {
    try {
      const settingsJson = {
        style: newSettings.style,
        color: newSettings.color,
        sparklesEnabled: newSettings.sparklesEnabled,
        trailEnabled: newSettings.trailEnabled,
        customImageUrl: newSettings.customImageUrl,
      };
      
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          angel_cursor_enabled: newSettings.enabled,
          angel_presence_settings: settingsJson,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
        
      if (error) {
        console.error('Failed to save to database:', error);
      }
    } catch (error) {
      console.error('Failed to save angel presence settings to database:', error);
    }
  };

  // Save settings helper
  const saveSettings = useCallback(async (newSettings: AngelPresenceSettings) => {
    // Always save to localStorage as backup/fallback
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    
    // Save to database if logged in
    if (user) {
      await saveToDatabase(user.id, newSettings);
    }
  }, [user]);

  const toggle = useCallback(async () => {
    const newSettings = { ...settings, enabled: !settings.enabled };
    setSettings(newSettings);
    await saveSettings(newSettings);
  }, [settings, saveSettings]);

  const setEnabled = useCallback(async (value: boolean) => {
    const newSettings = { ...settings, enabled: value };
    setSettings(newSettings);
    await saveSettings(newSettings);
  }, [settings, saveSettings]);

  const setStyle = useCallback(async (style: AngelStyle) => {
    const newSettings = { ...settings, style };
    setSettings(newSettings);
    await saveSettings(newSettings);
  }, [settings, saveSettings]);

  const setColor = useCallback(async (color: AngelColor) => {
    const newSettings = { ...settings, color };
    setSettings(newSettings);
    await saveSettings(newSettings);
  }, [settings, saveSettings]);

  const setSparklesEnabled = useCallback(async (value: boolean) => {
    const newSettings = { ...settings, sparklesEnabled: value };
    setSettings(newSettings);
    await saveSettings(newSettings);
  }, [settings, saveSettings]);

  const setTrailEnabled = useCallback(async (value: boolean) => {
    const newSettings = { ...settings, trailEnabled: value };
    setSettings(newSettings);
    await saveSettings(newSettings);
  }, [settings, saveSettings]);

  const uploadCustomImage = useCallback(async (file: File) => {
    if (!user) {
      toast.error('Please sign in to upload a custom angel image');
      return;
    }
    
    setIsUploading(true);
    try {
      const dataUrl = await processCustomImage(file);
      const newSettings = { ...settings, customImageUrl: dataUrl };
      setSettings(newSettings);
      await saveSettings(newSettings);
      toast.success('Custom angel image uploaded!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload image';
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  }, [user, settings, saveSettings]);

  const removeCustomImage = useCallback(async () => {
    const newSettings = { ...settings, customImageUrl: undefined };
    setSettings(newSettings);
    await saveSettings(newSettings);
    toast.success('Custom angel image removed');
  }, [settings, saveSettings]);

  const value = useMemo<AngelPresenceContextValue>(() => ({
    isEnabled: settings.enabled,
    style: settings.style,
    color: settings.color,
    sparklesEnabled: settings.sparklesEnabled,
    trailEnabled: settings.trailEnabled,
    customImageUrl: settings.customImageUrl,
    isLoading,
    isUploading,
    isHydrated,
    toggle,
    setEnabled,
    setStyle,
    setColor,
    setSparklesEnabled,
    setTrailEnabled,
    uploadCustomImage,
    removeCustomImage,
  }), [settings, isLoading, isUploading, isHydrated, toggle, setEnabled, setStyle, setColor, setSparklesEnabled, setTrailEnabled, uploadCustomImage, removeCustomImage]);

  return (
    <AngelPresenceContext.Provider value={value}>
      {children}
    </AngelPresenceContext.Provider>
  );
}

export function useAngelPresenceContext() {
  const context = useContext(AngelPresenceContext);
  if (!context) {
    throw new Error('useAngelPresenceContext must be used within AngelPresenceProvider');
  }
  return context;
}