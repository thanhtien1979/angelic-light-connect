import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";

const LOCAL_STORAGE_KEY = "camly_last_greeting_date";
const GREETING_SEEN_KEY = "camly_greeting_seen";

export const useDailyGreeting = () => {
  const { user } = useAuth();
  const [shouldShowGreeting, setShouldShowGreeting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [greetingEnabled, setGreetingEnabled] = useState(true);
  const [digestNotificationsEnabled, setDigestNotificationsEnabled] = useState(true);
  const [hasNewGreeting, setHasNewGreeting] = useState(false);

  // Get today's date in user's timezone
  const getTodayDate = useCallback(() => {
    const now = new Date();
    return now.toISOString().split("T")[0]; // YYYY-MM-DD format
  }, []);

  // Check localStorage first for quick response
  const checkLocalStorage = useCallback(() => {
    const lastGreeting = localStorage.getItem(LOCAL_STORAGE_KEY);
    const today = getTodayDate();
    return lastGreeting !== today;
  }, [getTodayDate]);

  // Update localStorage
  const updateLocalStorage = useCallback(() => {
    const today = getTodayDate();
    localStorage.setItem(LOCAL_STORAGE_KEY, today);
  }, [getTodayDate]);

  // Check and update backend
  const checkAndUpdateBackend = useCallback(async () => {
    if (!user?.id) return { shouldShow: false, enabled: true, digestNotifications: true };

    try {
      const today = getTodayDate();
      
      // Check existing greeting record
      const { data: existing, error: fetchError } = await supabase
        .from("user_daily_greetings")
        .select("last_greeting_date, greeting_enabled, greeting_count, digest_notifications_enabled")
        .eq("user_id", user.id)
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching greeting data:", fetchError);
        return { shouldShow: false, enabled: true, digestNotifications: true };
      }

      // If no record, create one
      if (!existing) {
        await supabase
          .from("user_daily_greetings")
          .insert({
            user_id: user.id,
            last_greeting_date: today,
            greeting_count: 1,
            greeting_enabled: true,
            digest_notifications_enabled: true,
          });
        return { shouldShow: true, enabled: true, digestNotifications: true };
      }

      // Check if greeting is disabled
      if (!existing.greeting_enabled) {
        return { shouldShow: false, enabled: false, digestNotifications: existing.digest_notifications_enabled };
      }

      const lastDate = existing.last_greeting_date;
      if (lastDate !== today) {
        // Update existing record
        await supabase
          .from("user_daily_greetings")
          .update({
            last_greeting_date: today,
            greeting_count: existing.greeting_count + 1,
          })
          .eq("user_id", user.id);
        return { shouldShow: true, enabled: true, digestNotifications: existing.digest_notifications_enabled };
      }

      return { shouldShow: false, enabled: existing.greeting_enabled, digestNotifications: existing.digest_notifications_enabled };
    } catch (error) {
      console.error("Error in greeting check:", error);
      return { shouldShow: false, enabled: true, digestNotifications: true };
    }
  }, [user?.id, getTodayDate]);

  // Toggle greeting preference
  const toggleGreetingEnabled = useCallback(async () => {
    if (!user?.id) return;

    const newValue = !greetingEnabled;
    setGreetingEnabled(newValue);

    try {
      // Check if record exists
      const { data: existing } = await supabase
        .from("user_daily_greetings")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("user_daily_greetings")
          .update({ greeting_enabled: newValue })
          .eq("user_id", user.id);
      } else {
        await supabase
          .from("user_daily_greetings")
          .insert({
            user_id: user.id,
            last_greeting_date: getTodayDate(),
            greeting_count: 0,
            greeting_enabled: newValue,
          });
      }
    } catch (error) {
      console.error("Error toggling greeting:", error);
      setGreetingEnabled(!newValue); // Revert on error
    }
  }, [user?.id, greetingEnabled, getTodayDate]);

  // Toggle digest notifications preference
  const toggleDigestNotifications = useCallback(async () => {
    if (!user?.id) return;

    const newValue = !digestNotificationsEnabled;
    setDigestNotificationsEnabled(newValue);

    try {
      const { data: existing } = await supabase
        .from("user_daily_greetings")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("user_daily_greetings")
          .update({ digest_notifications_enabled: newValue })
          .eq("user_id", user.id);
      } else {
        await supabase
          .from("user_daily_greetings")
          .insert({
            user_id: user.id,
            last_greeting_date: getTodayDate(),
            greeting_count: 0,
            greeting_enabled: true,
            digest_notifications_enabled: newValue,
          });
      }
    } catch (error) {
      console.error("Error toggling digest notifications:", error);
      setDigestNotificationsEnabled(!newValue); // Revert on error
    }
  }, [user?.id, digestNotificationsEnabled, getTodayDate]);

  // Main effect to check greeting status
  useEffect(() => {
    const checkGreeting = async () => {
      // Only for logged-in users
      if (!user?.id) {
        setIsLoading(false);
        setShouldShowGreeting(false);
        return;
      }

      // Quick local check first
      const shouldShowLocal = checkLocalStorage();
      
      if (!shouldShowLocal) {
        // Already greeted today (locally), but still fetch enabled status
        const { enabled, digestNotifications } = await checkAndUpdateBackend();
        setGreetingEnabled(enabled);
        setDigestNotificationsEnabled(digestNotifications);
        setIsLoading(false);
        setShouldShowGreeting(false);
        return;
      }

      // Verify with backend
      const { shouldShow, enabled, digestNotifications } = await checkAndUpdateBackend();
      setGreetingEnabled(enabled);
      setDigestNotificationsEnabled(digestNotifications);
      
      if (shouldShow && enabled) {
        updateLocalStorage();
        setShouldShowGreeting(true);
      }
      
      setIsLoading(false);
    };

    checkGreeting();
  }, [user?.id, checkLocalStorage, checkAndUpdateBackend, updateLocalStorage]);

  const dismissGreeting = useCallback(() => {
    setShouldShowGreeting(false);
    setHasNewGreeting(false);
    // Mark greeting as seen for today
    const today = getTodayDate();
    localStorage.setItem(GREETING_SEEN_KEY, today);
  }, [getTodayDate]);

  // Mark greeting as seen (for Profile page visit)
  const markGreetingSeen = useCallback(() => {
    setHasNewGreeting(false);
    const today = getTodayDate();
    localStorage.setItem(GREETING_SEEN_KEY, today);
  }, [getTodayDate]);

  // Check if there's an unseen greeting
  useEffect(() => {
    if (!user?.id || isLoading) return;
    
    const today = getTodayDate();
    const seenDate = localStorage.getItem(GREETING_SEEN_KEY);
    
    // If greeting is enabled and we haven't seen today's greeting yet
    if (greetingEnabled && seenDate !== today && shouldShowGreeting) {
      setHasNewGreeting(true);
    }
  }, [user?.id, isLoading, greetingEnabled, shouldShowGreeting, getTodayDate]);

  return {
    shouldShowGreeting,
    dismissGreeting,
    isLoading,
    greetingEnabled,
    toggleGreetingEnabled,
    hasNewGreeting,
    markGreetingSeen,
    digestNotificationsEnabled,
    toggleDigestNotifications,
  };
};
