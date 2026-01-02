import { useState, useEffect, useCallback, useRef } from 'react';
import { useSoundSettingsContext } from '@/contexts/SoundSettingsContext';

// Get or create audio context
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
};

// Play a gentle bell/chime sound that fades out smoothly
const playCompletionChime = (volume: number = 0.15) => {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;
    const duration = 3; // 3 seconds total for a gentle fade

    // Create a gentle bell-like tone using multiple harmonics
    const fundamentalFreq = 528; // Solfeggio frequency - known for healing properties
    const harmonics = [1, 2, 3, 4]; // Harmonic series
    const harmonicGains = [1, 0.5, 0.25, 0.125]; // Decreasing amplitude for each harmonic

    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(volume, now + 0.1); // Soft attack
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + duration); // Long fade out

    harmonics.forEach((harmonic, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(fundamentalFreq * harmonic, now);
      
      gain.gain.setValueAtTime(harmonicGains[i], now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration * (1 - i * 0.15));
      
      osc.connect(gain);
      gain.connect(masterGain);
      
      osc.start(now);
      osc.stop(now + duration);
    });

    // Add a subtle second chime slightly delayed
    setTimeout(() => {
      const secondChime = ctx.createOscillator();
      const secondGain = ctx.createGain();
      const now2 = ctx.currentTime;
      
      secondChime.type = 'sine';
      secondChime.frequency.setValueAtTime(fundamentalFreq * 1.5, now2); // Perfect fifth above
      
      secondGain.gain.setValueAtTime(0, now2);
      secondGain.gain.linearRampToValueAtTime(volume * 0.5, now2 + 0.1);
      secondGain.gain.exponentialRampToValueAtTime(0.001, now2 + 2);
      
      secondChime.connect(secondGain);
      secondGain.connect(ctx.destination);
      
      secondChime.start(now2);
      secondChime.stop(now2 + 2);
    }, 400);

  } catch (error) {
    console.warn('Could not play completion sound:', error);
  }
};

export const useBreathingCompletionSound = () => {
  const [isEnabled, setIsEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('breathing_completion_sound_enabled');
      return stored !== null ? stored === 'true' : true; // Default to enabled
    }
    return true;
  });

  const hasPlayedRef = useRef(false);

  // Get global sound settings
  let globalSoundAllowed = true;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { isSoundAllowed } = useSoundSettingsContext();
    globalSoundAllowed = isSoundAllowed("meditationAudio");
  } catch {
    // Context not available, allow sound by default
    globalSoundAllowed = true;
  }

  useEffect(() => {
    localStorage.setItem('breathing_completion_sound_enabled', String(isEnabled));
  }, [isEnabled]);

  const toggleSound = useCallback(() => {
    setIsEnabled(prev => !prev);
  }, []);

  const playCompletionSound = useCallback(() => {
    // Check both local and global settings
    if (isEnabled && globalSoundAllowed && !hasPlayedRef.current) {
      hasPlayedRef.current = true;
      playCompletionChime(0.12); // Very soft volume
      // Reset after a short delay to allow playing again
      setTimeout(() => {
        hasPlayedRef.current = false;
      }, 1000);
    }
  }, [isEnabled, globalSoundAllowed]);

  // Enable audio context on user interaction
  const enableAudioContext = useCallback(() => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
  }, []);

  return {
    isEnabled,
    toggleSound,
    playCompletionSound,
    enableAudioContext,
  };
};
