import { useState, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCamlyCoin } from "@/hooks/useCamlyCoin";

interface ChatRewardResult {
  success: boolean;
  coinsAwarded: number;
  message: string;
  alreadyRewarded?: boolean;
}

export const useChatReward = () => {
  const { user } = useAuth();
  const { awardChatMessage, refetch } = useCamlyCoin();
  const [lastRewardResult, setLastRewardResult] = useState<ChatRewardResult | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const hasRewardedTodayRef = useRef(false);
  const sessionIdRef = useRef<string>("");

  // Try to award coins after a chat message (first message of the day)
  const tryAwardChatReward = useCallback(async (sessionId: string) => {
    if (!user?.id) return null;
    
    // Don't try again if already rewarded today in this session
    if (hasRewardedTodayRef.current && sessionIdRef.current === sessionId) {
      return null;
    }

    sessionIdRef.current = sessionId;

    try {
      const result = await awardChatMessage(sessionId);

      if (result?.success) {
        hasRewardedTodayRef.current = true;
        setLastRewardResult({
          success: true,
          coinsAwarded: result.coinsAwarded,
          message: result.message,
        });
        setShowNotification(true);
        await refetch();
        return result;
      } else if (result?.alreadyRewarded) {
        hasRewardedTodayRef.current = true;
        return null;
      }
    } catch (error) {
      console.error("Chat reward error:", error);
    }

    return null;
  }, [user?.id, awardChatMessage, refetch]);

  const dismissNotification = useCallback(() => {
    setShowNotification(false);
  }, []);

  return {
    tryAwardChatReward,
    lastRewardResult,
    showNotification,
    dismissNotification,
    hasRewardedToday: hasRewardedTodayRef.current,
  };
};
