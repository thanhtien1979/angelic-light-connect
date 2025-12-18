import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";

const LOCAL_STORAGE_KEY = "camly_last_greeting_date";

export const useDailyGreeting = () => {
  const { user } = useAuth();
  const [shouldShowGreeting, setShouldShowGreeting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
    if (!user?.id) return false;

    try {
      const today = getTodayDate();
      
      // Check existing greeting record
      const { data: existing, error: fetchError } = await supabase
        .from("user_daily_greetings")
        .select("last_greeting_date")
        .eq("user_id", user.id)
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching greeting data:", fetchError);
        return false;
      }

      // If no record or different date, show greeting
      if (!existing) {
        // Create new record
        await supabase
          .from("user_daily_greetings")
          .insert({
            user_id: user.id,
            last_greeting_date: today,
            greeting_count: 1,
          });
        return true;
      }

      const lastDate = existing.last_greeting_date;
      if (lastDate !== today) {
        // Update existing record
        await supabase
          .from("user_daily_greetings")
          .update({
            last_greeting_date: today,
            greeting_count: (existing as any).greeting_count + 1,
          })
          .eq("user_id", user.id);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error in greeting check:", error);
      return false;
    }
  }, [user?.id, getTodayDate]);

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
        // Already greeted today (locally)
        setIsLoading(false);
        setShouldShowGreeting(false);
        return;
      }

      // Verify with backend
      const shouldShow = await checkAndUpdateBackend();
      
      if (shouldShow) {
        updateLocalStorage();
        setShouldShowGreeting(true);
      }
      
      setIsLoading(false);
    };

    checkGreeting();
  }, [user?.id, checkLocalStorage, checkAndUpdateBackend, updateLocalStorage]);

  const dismissGreeting = useCallback(() => {
    setShouldShowGreeting(false);
  }, []);

  return {
    shouldShowGreeting,
    dismissGreeting,
    isLoading,
  };
};
