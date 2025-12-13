import { useState, useEffect, useCallback, useRef } from "react";

export interface SleepTimerOption {
  label: string;
  labelVi: string;
  minutes: number;
}

export const SLEEP_TIMER_OPTIONS: SleepTimerOption[] = [
  { label: "15 min", labelVi: "15 phút", minutes: 15 },
  { label: "30 min", labelVi: "30 phút", minutes: 30 },
  { label: "45 min", labelVi: "45 phút", minutes: 45 },
  { label: "60 min", labelVi: "60 phút", minutes: 60 },
];

export const useSleepTimer = (onTimerEnd: () => void) => {
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onTimerEndRef = useRef(onTimerEnd);

  // Keep callback ref updated
  useEffect(() => {
    onTimerEndRef.current = onTimerEnd;
  }, [onTimerEnd]);

  // Timer countdown logic
  useEffect(() => {
    if (isActive && remainingSeconds !== null && remainingSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev === null || prev <= 1) {
            setIsActive(false);
            onTimerEndRef.current();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, remainingSeconds]);

  const startTimer = useCallback((minutes: number) => {
    setRemainingSeconds(minutes * 60);
    setIsActive(true);
  }, []);

  const cancelTimer = useCallback(() => {
    setRemainingSeconds(null);
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const formatRemainingTime = useCallback(() => {
    if (remainingSeconds === null) return "";
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, [remainingSeconds]);

  return {
    remainingSeconds,
    isActive,
    startTimer,
    cancelTimer,
    formatRemainingTime,
  };
};
