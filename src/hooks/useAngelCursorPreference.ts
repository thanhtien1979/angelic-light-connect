import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type AngelCursorColor = 'pink' | 'gold' | 'white' | 'purple';

export const useAngelCursorPreference = () => {
  const { user } = useAuth();
  const [cursorColor, setCursorColor] = useState<AngelCursorColor>('pink');
  const [isLoading, setIsLoading] = useState(true);

  // Load preference from database
  useEffect(() => {
    const loadPreference = async () => {
      if (!user?.id) {
        // Use localStorage for non-authenticated users
        const stored = localStorage.getItem('angel_cursor_color') as AngelCursorColor | null;
        if (stored && ['pink', 'gold', 'white', 'purple'].includes(stored)) {
          setCursorColor(stored);
        }
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('angel_cursor_color')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        
        if (data?.angel_cursor_color) {
          setCursorColor(data.angel_cursor_color as AngelCursorColor);
        }
      } catch (error) {
        console.error('Error loading angel cursor preference:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreference();
  }, [user?.id]);

  // Sync preference to database
  const syncCursorColor = async (color: AngelCursorColor) => {
    setCursorColor(color);
    
    // Always save to localStorage for immediate effect
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
      console.error('Error saving angel cursor preference:', error);
    }
  };

  return { cursorColor, setCursorColor: syncCursorColor, isLoading };
};
