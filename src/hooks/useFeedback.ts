import { useState, useEffect, useCallback, useRef } from "react";

const STORAGE_KEY = "angel-ai-feedback-enabled";

// Audio context for generating soft tones
let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === "undefined") return null;
  
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch {
      console.warn("Audio context not supported");
      return null;
    }
  }
  return audioContext;
};

// Generate a soft, gentle tone
const playTone = (frequency: number, duration: number, volume: number = 0.1) => {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Resume audio context if suspended (required for user interaction)
  if (ctx.state === "suspended") {
    ctx.resume();
  }

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = "sine";
  oscillator.frequency.value = frequency;

  // Gentle fade in and out
  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.05);
  gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
};

// Haptic feedback
const triggerHaptic = (style: "light" | "medium" | "soft" = "light") => {
  if (typeof navigator === "undefined" || !navigator.vibrate) return;

  const patterns: Record<string, number | number[]> = {
    light: 10,
    medium: 20,
    soft: 5,
  };

  try {
    navigator.vibrate(patterns[style]);
  } catch {
    // Haptic not supported
  }
};

export const useFeedback = () => {
  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored !== null ? stored === "true" : true;
  });

  // Track if we've had user interaction
  const hasUserInteraction = useRef(false);

  // Enable audio context on first interaction
  const enableAudioContext = useCallback(() => {
    if (!hasUserInteraction.current) {
      hasUserInteraction.current = true;
      const ctx = getAudioContext();
      if (ctx && ctx.state === "suspended") {
        ctx.resume();
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(isEnabled));
  }, [isEnabled]);

  // Soft chime for sending message (gentle, short)
  const playSendFeedback = useCallback(() => {
    if (!isEnabled) return;
    enableAudioContext();
    
    // Soft ascending chime (C5 - E5)
    playTone(523, 0.1, 0.08); // C5
    setTimeout(() => playTone(659, 0.15, 0.06), 80); // E5
    
    triggerHaptic("light");
  }, [isEnabled, enableAudioContext]);

  // Gentle welcoming tone for new conversation
  const playNewConversationFeedback = useCallback(() => {
    if (!isEnabled) return;
    enableAudioContext();
    
    // Gentle ascending arpeggio (G4 - B4 - D5)
    playTone(392, 0.12, 0.06); // G4
    setTimeout(() => playTone(494, 0.12, 0.05), 100); // B4
    setTimeout(() => playTone(587, 0.2, 0.04), 200); // D5
    
    triggerHaptic("soft");
  }, [isEnabled, enableAudioContext]);

  // Very subtle confirmation tone
  const playConfirmFeedback = useCallback(() => {
    if (!isEnabled) return;
    enableAudioContext();
    
    playTone(440, 0.08, 0.05); // A4 - very soft
    triggerHaptic("soft");
  }, [isEnabled, enableAudioContext]);

  const toggleFeedback = useCallback(() => {
    setIsEnabled(prev => !prev);
  }, []);

  return {
    isEnabled,
    toggleFeedback,
    playSendFeedback,
    playNewConversationFeedback,
    playConfirmFeedback,
    enableAudioContext,
  };
};
