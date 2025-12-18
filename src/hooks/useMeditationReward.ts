import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCamlyCoin } from "@/hooks/useCamlyCoin";

interface UseMeditationRewardProps {
  currentTime: number;
  duration: number;
  trackId: string;
  trackName: string;
  isPlaying: boolean;
}

interface RewardResult {
  success: boolean;
  coins?: number;
  message?: string;
  alreadyRewarded?: boolean;
}

export const useMeditationReward = ({
  currentTime,
  duration,
  trackId,
  trackName,
  isPlaying,
}: UseMeditationRewardProps) => {
  const { user } = useAuth();
  const { awardMeditationCompletion } = useCamlyCoin();
  const [hasTriggeredReward, setHasTriggeredReward] = useState(false);
  const [lastRewardResult, setLastRewardResult] = useState<RewardResult | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const previousTrackIdRef = useRef(trackId);

  // Reset when track changes
  useEffect(() => {
    if (trackId !== previousTrackIdRef.current) {
      setHasTriggeredReward(false);
      setLastRewardResult(null);
      setShowNotification(false);
      previousTrackIdRef.current = trackId;
    }
  }, [trackId]);

  // Calculate completion percentage
  const completionPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const hasReached80Percent = completionPercent >= 80;

  // Trigger reward at 80% completion
  useEffect(() => {
    const triggerReward = async () => {
      if (
        user?.id &&
        hasReached80Percent &&
        !hasTriggeredReward &&
        isPlaying &&
        duration > 30 // Only reward for tracks longer than 30 seconds
      ) {
        setHasTriggeredReward(true);

        const result = await awardMeditationCompletion(trackId, trackName, false);

        if (result) {
          setLastRewardResult({
            success: result.success,
            coins: result.coinsAwarded,
            message: result.message,
            alreadyRewarded: result.alreadyRewarded,
          });

          if (result.success) {
            setShowNotification(true);
            // Auto-hide notification after 5 seconds
            setTimeout(() => setShowNotification(false), 5000);
          }
        }
      }
    };

    triggerReward();
  }, [
    user?.id,
    hasReached80Percent,
    hasTriggeredReward,
    isPlaying,
    duration,
    trackId,
    trackName,
    awardMeditationCompletion,
  ]);

  const dismissNotification = useCallback(() => {
    setShowNotification(false);
  }, []);

  return {
    completionPercent,
    hasReached80Percent,
    hasTriggeredReward,
    lastRewardResult,
    showNotification,
    dismissNotification,
  };
};
