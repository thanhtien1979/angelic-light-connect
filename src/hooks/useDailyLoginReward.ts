import { useState, useCallback, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCamlyCoin } from "@/hooks/useCamlyCoin";
import { supabase } from "@/integrations/supabase/client";

interface DailyLoginRewardResult {
  success: boolean;
  coinsAwarded: number;
  message: string;
  alreadyRewarded?: boolean;
}

export const useDailyLoginReward = () => {
  const { user } = useAuth();
  const { refetch } = useCamlyCoin();
  const [lastRewardResult, setLastRewardResult] = useState<DailyLoginRewardResult | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const hasCheckedRef = useRef(false);

  const checkAndAwardDailyLogin = useCallback(async () => {
    if (!user?.id || hasCheckedRef.current) return null;
    
    hasCheckedRef.current = true;
    setIsLoading(true);

    try {
      // Check if already rewarded today
      const today = new Date().toISOString().split("T")[0];
      const { data: existingReward } = await supabase
        .from("light_acknowledgements")
        .select("id")
        .eq("user_id", user.id)
        .eq("acknowledgement_type", "daily_login")
        .gte("created_at", `${today}T00:00:00.000Z`)
        .lt("created_at", `${today}T23:59:59.999Z`)
        .maybeSingle();

      if (existingReward) {
        setIsLoading(false);
        return null;
      }

      // Award daily login bonus
      const { data, error } = await supabase.functions.invoke("award-light", {
        body: {
          type: "daily_login",
          sourceId: today,
          sourceName: "Daily Login",
        },
      });

      if (error) {
        console.error("Daily login reward error:", error);
        setIsLoading(false);
        return null;
      }

      if (data?.success) {
        setLastRewardResult({
          success: true,
          coinsAwarded: data.coinsAwarded,
          message: data.message,
        });
        setShowNotification(true);
        await refetch();
        setIsLoading(false);
        return data;
      }

      setIsLoading(false);
      return null;
    } catch (error) {
      console.error("Daily login reward error:", error);
      setIsLoading(false);
      return null;
    }
  }, [user?.id, refetch]);

  const dismissNotification = useCallback(() => {
    setShowNotification(false);
  }, []);

  // Reset check on user change
  useEffect(() => {
    hasCheckedRef.current = false;
  }, [user?.id]);

  return {
    checkAndAwardDailyLogin,
    lastRewardResult,
    showNotification,
    dismissNotification,
    isLoading,
  };
};
