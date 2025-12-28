import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { triggerSessionExpired } from "./useSessionExpired";

const REFRESH_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes before expiry
const CHECK_INTERVAL_MS = 60 * 1000; // Check every minute

export const useTokenRefresh = () => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkAndRefreshToken = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) return; // No session, nothing to refresh
        
        const expiresAt = session.expires_at;
        if (!expiresAt) return;
        
        const expiresAtMs = expiresAt * 1000;
        const now = Date.now();
        const timeUntilExpiry = expiresAtMs - now;
        
        // If token expires within threshold, refresh it
        if (timeUntilExpiry <= REFRESH_THRESHOLD_MS && timeUntilExpiry > 0) {
          console.log("Token expiring soon, refreshing...");
          const { error } = await supabase.auth.refreshSession();
          
          if (error) {
            console.error("Failed to refresh token:", error);
            triggerSessionExpired();
          } else {
            console.log("Token refreshed successfully");
          }
        } else if (timeUntilExpiry <= 0) {
          // Token already expired
          console.log("Token expired, triggering session expired dialog");
          triggerSessionExpired();
        }
      } catch (error) {
        console.error("Error checking token:", error);
      }
    };

    // Check immediately on mount
    checkAndRefreshToken();

    // Set up interval for periodic checks
    intervalRef.current = setInterval(checkAndRefreshToken, CHECK_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
};
