import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { triggerSessionExpired } from "@/hooks/useSessionExpired";

// Helper to get fresh access token
const getFreshAccessToken = async (): Promise<string | null> => {
  try {
    // Try to refresh the session first
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError || !refreshData.session) {
      // If refresh fails, try getting current session
      const { data: sessionData } = await supabase.auth.getSession();
      return sessionData.session?.access_token ?? null;
    }
    return refreshData.session.access_token;
  } catch (error) {
    console.error("Error getting fresh token:", error);
    return null;
  }
};
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

interface CreditTransaction {
  id: string;
  transaction_type: string;
  amount: number;
  description: string | null;
  payment_method: string | null;
  payment_reference: string | null;
  status: string;
  created_at: string;
}

const LOW_CREDIT_THRESHOLD = 5;

export const useCamlyCoin = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<CoinBalance>({ total_coins: 0, lifetime_coins: 0 });
  const [acknowledgements, setAcknowledgements] = useState<LightAcknowledgement[]>([]);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

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

  // Fetch transaction history
  const fetchTransactions = useCallback(async () => {
    if (!user?.id) return;

    setIsLoadingTransactions(true);
    try {
      const { data, error } = await supabase
        .from("credit_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoadingTransactions(false);
    }
  }, [user?.id]);

  // Check if credits are low
  const checkLowCredits = useCallback(() => {
    if (balance.total_coins < LOW_CREDIT_THRESHOLD && balance.total_coins >= 0) {
      return true;
    }
    return false;
  }, [balance.total_coins]);

  // Show low credit warning toast
  const showLowCreditWarning = useCallback(() => {
    if (checkLowCredits()) {
      toast.warning(
        `Credits sắp hết! Bạn chỉ còn ${balance.total_coins} credits.`,
        {
          action: {
            label: "Nạp thêm",
            onClick: () => window.location.href = "/credits",
          },
          duration: 5000,
        }
      );
    }
  }, [balance.total_coins, checkLowCredits]);

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
      const accessToken = await getFreshAccessToken();
      
      if (!accessToken) {
        triggerSessionExpired();
        return null;
      }
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/award-light`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
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

      if (!response.ok) {
        if (response.status === 401) {
          triggerSessionExpired();
          return null;
        }
        throw new Error(result.error || "Unknown error");
      }

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
    isPublic: boolean = false,
    publicConsentConfirmed: boolean = false
  ) => {
    if (!user?.id) {
      toast.error("Vui lòng đăng nhập để nhận Camly Coin");
      return null;
    }

    try {
      const accessToken = await getFreshAccessToken();
      
      if (!accessToken) {
        triggerSessionExpired();
        return null;
      }
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/award-light`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            type: "reflection_note",
            sourceId: reflectionId,
            customMessage,
            isPublic,
            publicConsentConfirmed: isPublic && publicConsentConfirmed,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          triggerSessionExpired();
          return null;
        }
        throw new Error(result.error || "Unknown error");
      }

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

  // Award coins for chat message
  const awardChatMessage = useCallback(async (
    sessionId: string,
    isPublic: boolean = false
  ) => {
    if (!user?.id) {
      return null; // Silently fail for non-logged in users
    }

    try {
      const accessToken = await getFreshAccessToken();
      
      if (!accessToken) {
        return null; // Silently fail if no session
      }
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/award-light`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            type: "chat_message",
            sourceId: sessionId,
            isPublic,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // For chat, just silently fail - don't interrupt user
          return null;
        }
        console.error("Chat reward error:", result.error);
        return null;
      }

      if (result.success) {
        setBalance({
          total_coins: result.totalCoins,
          lifetime_coins: result.lifetimeCoins,
        });
        return result;
      } else if (result.alreadyRewarded) {
        return result; // Already rewarded this session, no error
      } else {
        console.error("Chat reward error:", result.error);
        return null;
      }
    } catch (error) {
      console.error("Error awarding chat message:", error);
      return null;
    }
  }, [user?.id]);

  // Create payment for credit purchase
  const createPayment = useCallback(async (
    packageId: string,
    paymentMethod: string = "bank_transfer"
  ) => {
    if (!user?.id) {
      toast.error("Vui lòng đăng nhập để nạp credits");
      return null;
    }

    try {
      const { data: session } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.session?.access_token}`,
          },
          body: JSON.stringify({ packageId, paymentMethod }),
        }
      );

      const result = await response.json();

      if (result.success) {
        await fetchTransactions();
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      toast.error("Có lỗi xảy ra khi tạo giao dịch");
      return null;
    }
  }, [user?.id, fetchTransactions]);

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
    transactions,
    isLoading,
    isLoadingTransactions,
    awardMeditationCompletion,
    awardReflection,
    awardChatMessage,
    createPayment,
    formatCoins,
    refetch: fetchData,
    fetchTransactions,
    checkLowCredits,
    showLowCreditWarning,
    LOW_CREDIT_THRESHOLD,
  };
};
