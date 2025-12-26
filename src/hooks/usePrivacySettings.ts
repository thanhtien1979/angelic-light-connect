import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export type VisibilityOption = "everyone" | "friends" | "nobody";

export interface PrivacySettings {
  id: string;
  user_id: string;
  profile_visibility: VisibilityOption;
  online_status_visibility: VisibilityOption;
  show_last_seen: boolean;
  notify_profile_views: boolean;
  created_at: string;
  updated_at: string;
}

const defaultSettings: Omit<PrivacySettings, "id" | "user_id" | "created_at" | "updated_at"> = {
  profile_visibility: "friends",
  online_status_visibility: "friends",
  show_last_seen: true,
  notify_profile_views: true,
};

export const usePrivacySettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<PrivacySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("privacy_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings(data as PrivacySettings);
      } else {
        // No settings exist yet, use defaults
        setSettings(null);
      }
    } catch (error) {
      console.error("Error fetching privacy settings:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = async (updates: Partial<Omit<PrivacySettings, "id" | "user_id" | "created_at" | "updated_at">>) => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      if (settings) {
        // Update existing settings
        const { data, error } = await supabase
          .from("privacy_settings")
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id)
          .select()
          .single();

        if (error) throw error;
        setSettings(data as PrivacySettings);
      } else {
        // Create new settings
        const { data, error } = await supabase
          .from("privacy_settings")
          .insert({
            user_id: user.id,
            ...defaultSettings,
            ...updates,
          })
          .select()
          .single();

        if (error) throw error;
        setSettings(data as PrivacySettings);
      }

      toast.success("Đã lưu cài đặt quyền riêng tư");
    } catch (error) {
      console.error("Error updating privacy settings:", error);
      toast.error("Không thể lưu cài đặt. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  const currentSettings = settings || {
    profile_visibility: defaultSettings.profile_visibility,
    online_status_visibility: defaultSettings.online_status_visibility,
    show_last_seen: defaultSettings.show_last_seen,
    notify_profile_views: defaultSettings.notify_profile_views,
  };

  return {
    settings: currentSettings,
    isLoading,
    isSaving,
    updateSettings,
    refetch: fetchSettings,
  };
};
