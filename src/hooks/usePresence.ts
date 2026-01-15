import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const usePresence = () => {
  const { user } = useAuth();

  const updatePresence = useCallback(async (isOnline: boolean) => {
    if (!user) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-presence`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ is_online: isOnline }),
        }
      );

      if (!response.ok && response.status !== 429) {
        console.error('Error updating presence:', await response.text());
      }
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Set online when component mounts
    updatePresence(true);

    // Update presence periodically
    const interval = setInterval(() => {
      updatePresence(true);
    }, 30000); // Every 30 seconds

    // Handle visibility change
    const handleVisibilityChange = () => {
      updatePresence(!document.hidden);
    };

    // Handle before unload - keep sendBeacon for reliability
    const handleBeforeUnload = async () => {
      // Try edge function first
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-presence`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({ is_online: false }),
              keepalive: true,
            }
          );
        }
      } catch {
        // Fallback to sendBeacon if fetch fails
        const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/user_presence?user_id=eq.${user.id}`;
        const data = JSON.stringify({ is_online: false, last_seen: new Date().toISOString() });
        navigator.sendBeacon(url, new Blob([data], { type: 'application/json' }));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      updatePresence(false);
    };
  }, [user, updatePresence]);

  return { updatePresence };
};
