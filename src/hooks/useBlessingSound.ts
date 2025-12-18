import { useState, useEffect, useCallback, useRef } from "react";

const BLESSING_SOUND_KEY = "camly_blessing_sound_enabled";

export const useBlessingSound = () => {
  const [isEnabled, setIsEnabled] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(BLESSING_SOUND_KEY) === "true";
  });
  
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    localStorage.setItem(BLESSING_SOUND_KEY, String(isEnabled));
  }, [isEnabled]);

  const playBlessingChime = useCallback(() => {
    if (!isEnabled) return;

    try {
      // Create or reuse AudioContext
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      const now = ctx.currentTime;

      // Create a gentle, bell-like chime
      const playTone = (frequency: number, startTime: number, duration: number, volume: number) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, startTime);
        
        // Gentle attack and long decay for bell-like quality
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(volume * 0.08, startTime + 0.02); // Very soft volume
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      // Play a gentle two-note chime (pentatonic harmony)
      playTone(523.25, now, 1.5, 1);        // C5 - main tone
      playTone(659.25, now + 0.1, 1.2, 0.6); // E5 - harmony
      playTone(783.99, now + 0.2, 1.0, 0.3); // G5 - soft overtone
      
    } catch (error) {
      console.log("Could not play blessing sound:", error);
    }
  }, [isEnabled]);

  const toggleSound = useCallback(() => {
    setIsEnabled(prev => !prev);
  }, []);

  return {
    isEnabled,
    setIsEnabled,
    toggleSound,
    playBlessingChime,
  };
};
