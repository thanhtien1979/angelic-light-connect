import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { AngelStyle, AngelColor, AngelPresenceSettings, VideoQuality } from '@/components/AngelPresence/types';
import { toast } from 'sonner';

const STORAGE_KEY = 'angel-presence-settings';
const HIDDEN_STYLES_KEY = 'angel-hidden-styles';
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_DIMENSIONS = 512;
const DEBOUNCE_DELAY = 600; // ms
const SUCCESS_DISPLAY_DURATION = 1500; // ms

export type SyncStatus = 'idle' | 'saving' | 'success' | 'error';

export const defaultSettings: AngelPresenceSettings = {
  enabled: true,
  style: 'classic',
  color: 'white',
  sparklesEnabled: true,
  trailEnabled: true,
  customImageUrl: undefined,
  videoQuality: 'high',
};

// Get hidden styles from localStorage
function getHiddenStyles(): AngelStyle[] {
  try {
    const stored = localStorage.getItem(HIDDEN_STYLES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Invalid JSON
  }
  return [];
}

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
  videoQuality: VideoQuality;
  hiddenStyles: AngelStyle[];
  isLoading: boolean;
  isUploading: boolean;
  isHydrated: boolean;
  syncStatus: SyncStatus;
  
  // Actions
  toggle: () => void;
  setEnabled: (value: boolean) => void;
  setStyle: (style: AngelStyle) => void;
  setColor: (color: AngelColor) => void;
  setSparklesEnabled: (value: boolean) => void;
  setTrailEnabled: (value: boolean) => void;
  setVideoQuality: (quality: VideoQuality) => void;
  uploadCustomImage: (file: File) => Promise<void>;
  removeCustomImage: () => void;
  resetToDefaults: () => Promise<void>;
  deleteStyle: (styleId: AngelStyle) => void;
  restoreStyle: (styleId: AngelStyle) => void;
}

const AngelPresenceContext = createContext<AngelPresenceContextValue | null>(null);

export function AngelPresenceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  // Initialize with localStorage to prevent flicker
  const [settings, setSettings] = useState<AngelPresenceSettings>(() => getLocalStorageSettings());
  const [hiddenStyles, setHiddenStyles] = useState<AngelStyle[]>(() => getHiddenStyles());
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  
  const hasLoadedFromDB = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSettingsRef = useRef<AngelPresenceSettings | null>(null);
  const isOnlineRef = useRef(navigator.onLine);

  // Track online status
  useEffect(() => {
    const handleOnline = () => {
      isOnlineRef.current = true;
      // Retry pending save when coming back online
      if (pendingSettingsRef.current && user) {
        debouncedSaveToDatabase(user.id, pendingSettingsRef.current);
      }
    };
    const handleOffline = () => {
      isOnlineRef.current = false;
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

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
              videoQuality: (dbSettings?.videoQuality as 'high' | 'performance') || defaultSettings.videoQuality,
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

  // Save to database helper (immediate)
  const saveToDatabase = async (userId: string, newSettings: AngelPresenceSettings): Promise<boolean> => {
    try {
      const settingsJson = {
        style: newSettings.style,
        color: newSettings.color,
        sparklesEnabled: newSettings.sparklesEnabled,
        trailEnabled: newSettings.trailEnabled,
        customImageUrl: newSettings.customImageUrl,
        videoQuality: newSettings.videoQuality,
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
        return false;
      }
      return true;
    } catch (error) {
      console.error('Failed to save angel presence settings to database:', error);
      return false;
    }
  };

  // Debounced save to database
  const debouncedSaveToDatabase = useCallback((userId: string, newSettings: AngelPresenceSettings) => {
    // Clear any existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Clear success timer to prevent stale state
    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current);
    }

    // Store pending settings for retry
    pendingSettingsRef.current = newSettings;
    
    // Set saving status
    setSyncStatus('saving');

    debounceTimerRef.current = setTimeout(async () => {
      if (!isOnlineRef.current) {
        setSyncStatus('error');
        return;
      }

      const success = await saveToDatabase(userId, newSettings);
      
      if (success) {
        pendingSettingsRef.current = null;
        setSyncStatus('success');
        
        // Auto-clear success after delay
        successTimerRef.current = setTimeout(() => {
          setSyncStatus('idle');
        }, SUCCESS_DISPLAY_DURATION);
      } else {
        setSyncStatus('error');
      }
    }, DEBOUNCE_DELAY);
  }, []);

  // Save settings helper with optimistic update
  const saveSettings = useCallback((newSettings: AngelPresenceSettings) => {
    // Optimistic update: immediately update local state
    setSettings(newSettings);
    
    // Always save to localStorage as backup/fallback
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    
    // Debounced save to database if logged in
    if (user) {
      debouncedSaveToDatabase(user.id, newSettings);
    }
  }, [user, debouncedSaveToDatabase]);

  const toggle = useCallback(() => {
    const newSettings = { ...settings, enabled: !settings.enabled };
    saveSettings(newSettings);
  }, [settings, saveSettings]);

  const setEnabled = useCallback((value: boolean) => {
    const newSettings = { ...settings, enabled: value };
    saveSettings(newSettings);
  }, [settings, saveSettings]);

  const setStyle = useCallback((style: AngelStyle) => {
    const newSettings = { ...settings, style };
    saveSettings(newSettings);
  }, [settings, saveSettings]);

  const setColor = useCallback((color: AngelColor) => {
    const newSettings = { ...settings, color };
    saveSettings(newSettings);
  }, [settings, saveSettings]);

  const setSparklesEnabled = useCallback((value: boolean) => {
    const newSettings = { ...settings, sparklesEnabled: value };
    saveSettings(newSettings);
  }, [settings, saveSettings]);

  const setTrailEnabled = useCallback((value: boolean) => {
    const newSettings = { ...settings, trailEnabled: value };
    saveSettings(newSettings);
  }, [settings, saveSettings]);

  const setVideoQuality = useCallback((quality: VideoQuality) => {
    const newSettings = { ...settings, videoQuality: quality };
    saveSettings(newSettings);
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
      saveSettings(newSettings);
      toast.success('Custom angel image uploaded!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload image';
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  }, [user, settings, saveSettings]);

  const removeCustomImage = useCallback(() => {
    const newSettings = { ...settings, customImageUrl: undefined };
    saveSettings(newSettings);
    toast.success('Custom angel image removed');
  }, [settings, saveSettings]);

  const deleteStyle = useCallback((styleId: AngelStyle) => {
    const newHiddenStyles = [...hiddenStyles, styleId];
    setHiddenStyles(newHiddenStyles);
    localStorage.setItem(HIDDEN_STYLES_KEY, JSON.stringify(newHiddenStyles));
    
    // If current style is being deleted, switch to classic
    if (settings.style === styleId) {
      const newSettings = { ...settings, style: 'classic' as AngelStyle };
      saveSettings(newSettings);
    }
    
    toast.success('Đã xóa thiên thần khỏi danh sách');
  }, [hiddenStyles, settings, saveSettings]);

  const restoreStyle = useCallback((styleId: AngelStyle) => {
    const newHiddenStyles = hiddenStyles.filter(id => id !== styleId);
    setHiddenStyles(newHiddenStyles);
    localStorage.setItem(HIDDEN_STYLES_KEY, JSON.stringify(newHiddenStyles));
    toast.success('Đã khôi phục thiên thần');
  }, [hiddenStyles]);

  const resetToDefaults = useCallback(async () => {
    // Preserve custom image URL - don't delete user uploads
    const resetSettings: AngelPresenceSettings = {
      ...defaultSettings,
      // Keep customImageUrl but switch away from custom style if it was selected
    };
    
    // Optimistic update
    setSettings(resetSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resetSettings));
    
    // Save to database if logged in
    if (user) {
      setSyncStatus('saving');
      const success = await saveToDatabase(user.id, resetSettings);
      if (success) {
        setSyncStatus('success');
        successTimerRef.current = setTimeout(() => {
          setSyncStatus('idle');
        }, SUCCESS_DISPLAY_DURATION);
      } else {
        setSyncStatus('error');
      }
    }
  }, [user]);

  const value = useMemo<AngelPresenceContextValue>(() => ({
    isEnabled: settings.enabled,
    style: settings.style,
    color: settings.color,
    sparklesEnabled: settings.sparklesEnabled,
    trailEnabled: settings.trailEnabled,
    customImageUrl: settings.customImageUrl,
    videoQuality: settings.videoQuality,
    hiddenStyles,
    isLoading,
    isUploading,
    isHydrated,
    syncStatus,
    toggle,
    setEnabled,
    setStyle,
    setColor,
    setSparklesEnabled,
    setTrailEnabled,
    setVideoQuality,
    uploadCustomImage,
    removeCustomImage,
    resetToDefaults,
    deleteStyle,
    restoreStyle,
  }), [settings, hiddenStyles, isLoading, isUploading, isHydrated, syncStatus, toggle, setEnabled, setStyle, setColor, setSparklesEnabled, setTrailEnabled, setVideoQuality, uploadCustomImage, removeCustomImage, resetToDefaults, deleteStyle, restoreStyle]);

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
