import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to manage Angel Presence state
 * 
 * Features:
 * - Enabled by default for desktop users
 * - Persists preference in localStorage (guests) or database (authenticated)
 * - Easy to toggle on/off
 */

const STORAGE_KEY = 'angel-presence-enabled';

export function useAngelPresence() {
  const { user } = useAuth();
  const [isEnabled, setIsEnabled] = useState(true); // Enabled by default
  const [isLoading, setIsLoading] = useState(true);

  // Load preference on mount
  useEffect(() => {
    const loadPreference = async () => {
      try {
        if (user) {
          // Try to load from database for authenticated users
          const { data } = await supabase
            .from('user_preferences')
            .select('angel_cursor_enabled')
            .eq('user_id', user.id)
            .maybeSingle();

          if (data?.angel_cursor_enabled !== null && data?.angel_cursor_enabled !== undefined) {
            setIsEnabled(data.angel_cursor_enabled);
          }
        } else {
          // Load from localStorage for guests
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored !== null) {
            setIsEnabled(stored === 'true');
          }
        }
      } catch (error) {
        console.error('Failed to load angel presence preference:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreference();
  }, [user]);

  // Toggle function
  const toggle = useCallback(async () => {
    const newValue = !isEnabled;
    setIsEnabled(newValue);

    try {
      if (user) {
        // Save to database for authenticated users
        await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            angel_cursor_enabled: newValue,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });
      } else {
        // Save to localStorage for guests
        localStorage.setItem(STORAGE_KEY, String(newValue));
      }
    } catch (error) {
      console.error('Failed to save angel presence preference:', error);
    }
  }, [isEnabled, user]);

  // Set enabled directly
  const setEnabled = useCallback(async (value: boolean) => {
    setIsEnabled(value);

    try {
      if (user) {
        await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            angel_cursor_enabled: value,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });
      } else {
        localStorage.setItem(STORAGE_KEY, String(value));
      }
    } catch (error) {
      console.error('Failed to save angel presence preference:', error);
    }
  }, [user]);

  return {
    isEnabled,
    isLoading,
    toggle,
    setEnabled,
  };
}
