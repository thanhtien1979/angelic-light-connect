import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface LightAcknowledgement {
  id: string;
  acknowledgement_type: string;
  camly_coins: number;
  spiritual_message: string;
  source_id: string | null;
  is_public: boolean;
  created_at: string;
}

interface CoinBalance {
  total_coins: number;
  lifetime_coins: number;
}

export const useCamlyCoin = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<CoinBalance>({ total_coins: 0, lifetime_coins: 0 });
  const [acknowledgements, setAcknowledgements] = useState<LightAcknowledgement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch balance and acknowledgements
  const fetchData = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      // Fetch balance
      const { data: balanceData } = await supabase
        .from("user_camly_coins")
        .select("total_coins, lifetime_coins")
        .eq("user_id", user.id)
        .single();

      if (balanceData) {
        setBalance(balanceData);
      }

      // Fetch acknowledgements
      const { data: ackData } = await supabase
        .from("light_acknowledgements")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (ackData) {
        setAcknowledgements(ackData as LightAcknowledgement[]);
      }
    } catch (error) {
      console.error("Error fetching Camly Coin data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Award coins for meditation completion
  const awardMeditationCompletion = useCallback(async (
    trackId: string,
    trackName: string,
    isPublic: boolean = false
  ) => {
    if (!user?.id) {
      toast.error("Vui lòng đăng nhập để nhận Camly Coin");
      return null;
    }

    try {
      const { data: session } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/award-light`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.session?.access_token}`,
          },
          body: JSON.stringify({
            type: "meditation_completion",
            sourceId: trackId,
            sourceName: trackName,
            isPublic,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setBalance({
          total_coins: result.totalCoins,
          lifetime_coins: result.lifetimeCoins,
        });
        await fetchData();
        return result;
      } else if (result.alreadyRewarded) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error awarding meditation completion:", error);
      toast.error("Có lỗi xảy ra khi ghi nhận ánh sáng");
      return null;
    }
  }, [user?.id, fetchData]);

  // Award coins for reflection
  const awardReflection = useCallback(async (
    reflectionId: string,
    customMessage: string,
    isPublic: boolean = false
  ) => {
    if (!user?.id) {
      toast.error("Vui lòng đăng nhập để nhận Camly Coin");
      return null;
    }

    try {
      const { data: session } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/award-light`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.session?.access_token}`,
          },
          body: JSON.stringify({
            type: "reflection_note",
            sourceId: reflectionId,
            customMessage,
            isPublic,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setBalance({
          total_coins: result.totalCoins,
          lifetime_coins: result.lifetimeCoins,
        });
        await fetchData();
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error awarding reflection:", error);
      toast.error("Có lỗi xảy ra khi ghi nhận ánh sáng");
      return null;
    }
  }, [user?.id, fetchData]);

  // Format coin display
  const formatCoins = (coins: number): string => {
    if (coins >= 1000000) {
      return `${(coins / 1000000).toFixed(1)}M`;
    } else if (coins >= 1000) {
      return `${(coins / 1000).toFixed(0)}K`;
    }
    return coins.toLocaleString("vi-VN");
  };

  return {
    balance,
    acknowledgements,
    isLoading,
    awardMeditationCompletion,
    awardReflection,
    formatCoins,
    refetch: fetchData,
  };
};
