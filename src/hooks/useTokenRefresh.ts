import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const REFRESH_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes before expiry
const CHECK_INTERVAL_MS = 30 * 1000; // Check every 30 seconds
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 2000;

// Global flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

// Utility to attempt silent refresh with retries
export const attemptSilentRefresh = async (showToast = false): Promise<boolean> => {
  // If already refreshing, wait for that result
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
      try {
        console.log(`Silent refresh attempt ${attempt}/${MAX_RETRY_ATTEMPTS}`);
        
        const { data, error } = await supabase.auth.refreshSession();
        
        if (!error && data.session) {
          console.log("Session refreshed successfully");
          if (showToast) {
            toast.success("Phiên đăng nhập đã được gia hạn tự động", {
              duration: 2000,
            });
          }
          return true;
        }
        
        if (error) {
          console.warn(`Refresh attempt ${attempt} failed:`, error.message);
          
          // If it's a network error, retry
          if (error.message.includes("network") || error.message.includes("fetch")) {
            if (attempt < MAX_RETRY_ATTEMPTS) {
              await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * attempt));
              continue;
            }
          }
          
          // For auth errors (invalid refresh token), don't retry
          if (error.message.includes("invalid") || error.message.includes("expired")) {
            break;
          }
        }
      } catch (err) {
        console.error(`Refresh attempt ${attempt} threw error:`, err);
        if (attempt < MAX_RETRY_ATTEMPTS) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * attempt));
        }
      }
    }
    
    return false;
  })();

  try {
    const result = await refreshPromise;
    return result;
  } finally {
    isRefreshing = false;
    refreshPromise = null;
  }
};

export const useTokenRefresh = () => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasTriggeredExpiry = useRef(false);

  const checkAndRefreshToken = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // No session - user is logged out, nothing to refresh
        hasTriggeredExpiry.current = false;
        return;
      }
      
      const expiresAt = session.expires_at;
      if (!expiresAt) return;
      
      const expiresAtMs = expiresAt * 1000;
      const now = Date.now();
      const timeUntilExpiry = expiresAtMs - now;
      
      // If token expires within threshold, proactively refresh it
      if (timeUntilExpiry <= REFRESH_THRESHOLD_MS && timeUntilExpiry > 0) {
        console.log(`Token expiring in ${Math.round(timeUntilExpiry / 1000)}s, refreshing proactively...`);
        const success = await attemptSilentRefresh(false);
        
        if (!success && !hasTriggeredExpiry.current) {
          console.log("Proactive refresh failed, will retry on next check");
        }
      } else if (timeUntilExpiry <= 0) {
        // Token already expired - try to refresh silently
        console.log("Token expired, attempting silent refresh...");
        await attemptSilentRefresh(true);
      }
    } catch (error) {
      console.error("Error checking token:", error);
    }
  }, []);

  useEffect(() => {
    // Reset expiry trigger on mount
    hasTriggeredExpiry.current = false;
    
    // Check immediately on mount
    checkAndRefreshToken();

    // Set up interval for periodic checks
    intervalRef.current = setInterval(checkAndRefreshToken, CHECK_INTERVAL_MS);

    // Also listen for visibility changes to refresh when user returns to tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkAndRefreshToken();
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Listen for online event to refresh when connection restored
    const handleOnline = () => {
      console.log("Connection restored, checking token...");
      checkAndRefreshToken();
    };
    
    window.addEventListener("online", handleOnline);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleOnline);
    };
  }, [checkAndRefreshToken]);
};
