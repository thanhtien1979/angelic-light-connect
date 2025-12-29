import { useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useThemePreference = () => {
  const { user } = useAuth();
  const { setTheme } = useTheme();

  // Load theme preference from database on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("user_preferences")
          .select("theme")
          .eq("user_id", user.id)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error loading theme preference:", error);
          return;
        }

        if (data?.theme) {
          setTheme(data.theme);
        }
      } catch (error) {
        console.error("Error loading theme preference:", error);
      }
    };

    loadThemePreference();
  }, [user, setTheme]);

  // Sync theme preference to database
  const syncTheme = useCallback(async (theme: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("user_preferences")
        .upsert(
          {
            user_id: user.id,
            theme,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

      if (error) {
        console.error("Error saving theme preference:", error);
      }
    } catch (error) {
      console.error("Error saving theme preference:", error);
    }
  }, [user]);

  return { syncTheme };
};
