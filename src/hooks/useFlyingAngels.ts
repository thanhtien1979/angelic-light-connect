import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const LOCAL_STORAGE_KEY = "flying-angels-enabled";

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
          const settings = data.angel_presence_settings as Record<string, unknown>;
          if (typeof settings.flyingAngelsEnabled === "boolean") {
            setIsEnabled(settings.flyingAngelsEnabled);
            localStorage.setItem(LOCAL_STORAGE_KEY, String(settings.flyingAngelsEnabled));
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

  return {
    isEnabled,
    isLoading,
    toggle,
  };
};

// Global event emitter for flying angels state
type FlyingAngelsListener = (enabled: boolean) => void;
const listeners = new Set<FlyingAngelsListener>();

export const emitFlyingAngelsChange = (enabled: boolean) => {
  listeners.forEach((listener) => listener(enabled));
};

export const subscribeFlyingAngels = (listener: FlyingAngelsListener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
