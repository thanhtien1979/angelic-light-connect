import { useState, useRef, useCallback, useEffect } from "react";

export type AmbientSoundType = 
  | "silence" 
  | "singing-bowl" 
  | "wind" 
  | "water" 
  | "forest"
  | "rain"
  | "ocean"
  | "temple-bells"
  | "night";

interface AmbientSoundOption {
  id: AmbientSoundType;
  name: string;
  nameVi: string;
  icon: string;
  audioUrl?: string;
}

// High-quality ambient audio files from free CDN sources
export const AMBIENT_SOUNDS: AmbientSoundOption[] = [
  { id: "silence", name: "Silence", nameVi: "Tĩnh lặng", icon: "🤫" },
  { 
    id: "singing-bowl", 
    name: "Singing Bowl", 
    nameVi: "Chuông bát", 
    icon: "🔔",
    audioUrl: "https://cdn.pixabay.com/audio/2024/11/04/audio_4956b1e816.mp3"
  },
  { 
    id: "wind", 
    name: "Wind", 
    nameVi: "Gió", 
    icon: "🌬️",
    audioUrl: "https://cdn.pixabay.com/audio/2022/05/16/audio_1d51bbfd3d.mp3"
  },
  { 
    id: "water", 
    name: "Water", 
    nameVi: "Suối", 
    icon: "💧",
    audioUrl: "https://cdn.pixabay.com/audio/2024/04/11/audio_149acae47b.mp3"
  },
  { 
    id: "forest", 
    name: "Forest", 
    nameVi: "Rừng", 
    icon: "🌿",
    audioUrl: "https://cdn.pixabay.com/audio/2022/08/31/audio_419263fc12.mp3"
  },
  { 
    id: "rain", 
    name: "Light Rain", 
    nameVi: "Mưa nhẹ", 
    icon: "🌧️",
    audioUrl: "https://cdn.pixabay.com/audio/2022/05/13/audio_257112220f.mp3"
  },
  { 
    id: "ocean", 
    name: "Ocean Waves", 
    nameVi: "Sóng biển", 
    icon: "🌊",
    audioUrl: "https://cdn.pixabay.com/audio/2024/06/05/audio_96e7c82c3a.mp3"
  },
  { 
    id: "temple-bells", 
    name: "Temple Bells", 
    nameVi: "Chuông chùa", 
    icon: "🛕",
    audioUrl: "https://cdn.pixabay.com/audio/2022/10/30/audio_1bf4957317.mp3"
  },
  { 
    id: "night", 
    name: "Night Nature", 
    nameVi: "Đêm tĩnh", 
    icon: "🌙",
    audioUrl: "https://cdn.pixabay.com/audio/2022/02/07/audio_f8a7c19695.mp3"
  },
];

const STORAGE_KEY = "meditation-ambient-sound";
const VOLUME_KEY = "meditation-ambient-volume";

export const useAmbientSound = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSound, setSelectedSound] = useState<AmbientSoundType>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored as AmbientSoundType) || "silence";
  });
  const [volume, setVolume] = useState(() => {
    const stored = localStorage.getItem(VOLUME_KEY);
    return stored ? parseFloat(stored) : 0.2; // Low, non-intrusive default
  });

  // Save preferences
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, selectedSound);
  }, [selectedSound]);

  useEffect(() => {
    localStorage.setItem(VOLUME_KEY, volume.toString());
  }, [volume]);

  // Update volume in real-time
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const clearFadeInterval = useCallback(() => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
  }, []);

  const fadeIn = useCallback((audio: HTMLAudioElement, targetVolume: number, duration: number = 2000) => {
    clearFadeInterval();
    audio.volume = 0;
    const steps = 40;
    const stepTime = duration / steps;
    const volumeStep = targetVolume / steps;
    let currentStep = 0;

    fadeIntervalRef.current = setInterval(() => {
      currentStep++;
      audio.volume = Math.min(volumeStep * currentStep, targetVolume);
      if (currentStep >= steps) {
        clearFadeInterval();
      }
    }, stepTime);
  }, [clearFadeInterval]);

  const fadeOut = useCallback((audio: HTMLAudioElement, duration: number = 1000): Promise<void> => {
    return new Promise((resolve) => {
      clearFadeInterval();
      const startVolume = audio.volume;
      const steps = 20;
      const stepTime = duration / steps;
      const volumeStep = startVolume / steps;
      let currentStep = 0;

      fadeIntervalRef.current = setInterval(() => {
        currentStep++;
        audio.volume = Math.max(startVolume - volumeStep * currentStep, 0);
        if (currentStep >= steps) {
          clearFadeInterval();
          audio.pause();
          resolve();
        }
      }, stepTime);
    });
  }, [clearFadeInterval]);

  const stopSound = useCallback(async () => {
    clearFadeInterval();
    
    if (audioRef.current) {
      try {
        await fadeOut(audioRef.current, 800);
      } catch (e) {
        audioRef.current.pause();
      }
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    
    setIsPlaying(false);
  }, [clearFadeInterval, fadeOut]);

  const playSound = useCallback(async (soundType: AmbientSoundType) => {
    await stopSound();
    
    if (soundType === "silence") {
      return;
    }

    const soundOption = AMBIENT_SOUNDS.find(s => s.id === soundType);
    if (!soundOption?.audioUrl) {
      console.warn("No audio URL for sound:", soundType);
      return;
    }

    setIsLoading(true);

    try {
      const audio = new Audio();
      audio.src = soundOption.audioUrl;
      audio.loop = true;
      audio.preload = "auto";
      audio.crossOrigin = "anonymous";
      
      audioRef.current = audio;

      // Wait for audio to be ready
      await new Promise<void>((resolve, reject) => {
        const handleCanPlay = () => {
          audio.removeEventListener("canplaythrough", handleCanPlay);
          audio.removeEventListener("error", handleError);
          resolve();
        };
        
        const handleError = (e: Event) => {
          audio.removeEventListener("canplaythrough", handleCanPlay);
          audio.removeEventListener("error", handleError);
          reject(new Error("Failed to load audio"));
        };

        audio.addEventListener("canplaythrough", handleCanPlay);
        audio.addEventListener("error", handleError);
        audio.load();
      });

      await audio.play();
      fadeIn(audio, volume);
      setIsPlaying(true);
    } catch (error) {
      console.error("Error playing ambient sound:", error);
      audioRef.current = null;
    } finally {
      setIsLoading(false);
    }
  }, [volume, stopSound, fadeIn]);

  const toggleSound = useCallback(() => {
    if (isPlaying) {
      stopSound();
    } else {
      playSound(selectedSound);
    }
  }, [isPlaying, selectedSound, playSound, stopSound]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearFadeInterval();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [clearFadeInterval]);

  return {
    isPlaying,
    isLoading,
    selectedSound,
    setSelectedSound,
    volume,
    setVolume,
    playSound,
    stopSound,
    toggleSound,
    ambientSounds: AMBIENT_SOUNDS,
  };
};
