import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type AngelCursorColor = 'pink' | 'gold' | 'white' | 'purple';
export type AngelCursorSize = 'small' | 'medium' | 'large';

export const useAngelCursorPreference = () => {
  const { user } = useAuth();
  const [cursorColor, setCursorColor] = useState<AngelCursorColor>('pink');
  const [cursorSize, setCursorSize] = useState<AngelCursorSize>('medium');
  const [isEnabled, setIsEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Load preference from database
  useEffect(() => {
    const loadPreference = async () => {
      if (!user?.id) {
        // Use localStorage for non-authenticated users
        const storedColor = localStorage.getItem('angel_cursor_color') as AngelCursorColor | null;
        const storedSize = localStorage.getItem('angel_cursor_size') as AngelCursorSize | null;
        const storedEnabled = localStorage.getItem('angel_cursor_enabled');
        
        if (storedColor && ['pink', 'gold', 'white', 'purple'].includes(storedColor)) {
          setCursorColor(storedColor);
        }
        if (storedSize && ['small', 'medium', 'large'].includes(storedSize)) {
          setCursorSize(storedSize);
        }
        if (storedEnabled !== null) {
          setIsEnabled(storedEnabled === 'true');
        }
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('angel_cursor_color, angel_cursor_size, angel_cursor_enabled')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        
        if (data?.angel_cursor_color) {
          setCursorColor(data.angel_cursor_color as AngelCursorColor);
        }
        if (data?.angel_cursor_size) {
          setCursorSize(data.angel_cursor_size as AngelCursorSize);
        }
        if (data?.angel_cursor_enabled !== null && data?.angel_cursor_enabled !== undefined) {
          setIsEnabled(data.angel_cursor_enabled);
        }
      } catch (error) {
        console.error('Error loading angel cursor preference:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreference();
  }, [user?.id]);

  // Sync color preference
  const syncCursorColor = async (color: AngelCursorColor) => {
    setCursorColor(color);
    localStorage.setItem('angel_cursor_color', color);

    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          angel_cursor_color: color,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving angel cursor color:', error);
    }
  };

  // Sync size preference
  const syncCursorSize = async (size: AngelCursorSize) => {
    setCursorSize(size);
    localStorage.setItem('angel_cursor_size', size);

    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          angel_cursor_size: size,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving angel cursor size:', error);
    }
  };

  // Sync enabled preference
  const syncIsEnabled = async (enabled: boolean) => {
    setIsEnabled(enabled);
    localStorage.setItem('angel_cursor_enabled', String(enabled));

    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          angel_cursor_enabled: enabled,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving angel cursor enabled:', error);
    }
  };

  return { 
    cursorColor, 
    setCursorColor: syncCursorColor, 
    cursorSize,
    setCursorSize: syncCursorSize,
    isEnabled,
    setIsEnabled: syncIsEnabled,
    isLoading 
  };
};
