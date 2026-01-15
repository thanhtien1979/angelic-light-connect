import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useAdminRole = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAdminRole = useCallback(async () => {
    if (!user) {
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    try {
      // Get the current session for auth header
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      // Use server-side verification via edge function
      const response = await supabase.functions.invoke("verify-admin", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        console.error("Error verifying admin role:", response.error);
        setIsAdmin(false);
      } else {
        setIsAdmin(response.data?.isAdmin === true);
      }
    } catch (error) {
      console.error("Error checking admin role:", error);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    checkAdminRole();
  }, [checkAdminRole]);

  return { isAdmin, isLoading, refetch: checkAdminRole };
};
