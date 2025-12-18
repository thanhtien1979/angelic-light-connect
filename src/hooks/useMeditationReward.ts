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

const REWARDED_TRACKS_KEY = "meditation_rewarded_tracks";

// Get rewarded tracks from localStorage
const getRewardedTracks = (): Set<string> => {
  try {
    const stored = localStorage.getItem(REWARDED_TRACKS_KEY);
    if (stored) {
      return new Set(JSON.parse(stored));
    }
  } catch {
    // Ignore parse errors
  }
  return new Set();
};

// Save rewarded track to localStorage
const saveRewardedTrack = (trackId: string) => {
  const tracks = getRewardedTracks();
  tracks.add(trackId);
  localStorage.setItem(REWARDED_TRACKS_KEY, JSON.stringify([...tracks]));
};

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
  const rewardedTracksRef = useRef<Set<string>>(getRewardedTracks());

  // Reset session state when track changes (but keep lifetime tracking)
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

  // Check if track was already rewarded (lifetime)
  const isTrackAlreadyRewarded = rewardedTracksRef.current.has(trackId);

  // Trigger reward at 80% completion
  useEffect(() => {
    const triggerReward = async () => {
      if (
        user?.id &&
        hasReached80Percent &&
        !hasTriggeredReward &&
        !isTrackAlreadyRewarded &&
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
            // Save to localStorage to prevent future attempts
            saveRewardedTrack(trackId);
            rewardedTracksRef.current.add(trackId);
            
            setShowNotification(true);
            // Auto-hide notification after 6 seconds for calm experience
            setTimeout(() => setShowNotification(false), 6000);
          } else if (result.alreadyRewarded) {
            // Also save to localStorage if server says already rewarded
            saveRewardedTrack(trackId);
            rewardedTracksRef.current.add(trackId);
          }
        }
      }
    };

    triggerReward();
  }, [
    user?.id,
    hasReached80Percent,
    hasTriggeredReward,
    isTrackAlreadyRewarded,
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
    isTrackAlreadyRewarded,
    lastRewardResult,
    showNotification,
    dismissNotification,
  };
};
