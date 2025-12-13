import { useState, useRef, useEffect, useCallback } from "react";

export interface AudioTrack {
  id: string;
  name: string;
  nameVi: string;
  url: string;
  duration?: string;
}

// Royalty-free meditation audio tracks
export const AUDIO_TRACKS: AudioTrack[] = [
  {
    id: "divine-harmony",
    name: "Divine Harmony",
    nameVi: "Hòa Âm Thiêng Liêng",
    url: "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3",
  },
  {
    id: "healing-light",
    name: "Healing Light",
    nameVi: "Ánh Sáng Chữa Lành",
    url: "https://cdn.pixabay.com/audio/2022/03/10/audio_4dedf5bf94.mp3",
  },
  {
    id: "cosmic-peace",
    name: "Cosmic Peace",
    nameVi: "Bình Yên Vũ Trụ",
    url: "https://cdn.pixabay.com/audio/2022/08/02/audio_884fe92c21.mp3",
  },
  {
    id: "sacred-journey",
    name: "Sacred Journey",
    nameVi: "Hành Trình Linh Thiêng",
    url: "https://cdn.pixabay.com/audio/2022/10/25/audio_946bc6eb3d.mp3",
  },
];

export const useMeditationAudio = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack>(AUDIO_TRACKS[0]);
  const [isChangingTrack, setIsChangingTrack] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<number | null>(null);

  const loadTrack = useCallback((track: AudioTrack) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }

    const audio = new Audio(track.url);
    audio.loop = true;
    audio.volume = 0;
    audio.preload = "auto";
    
    audio.addEventListener("canplaythrough", () => {
      setIsLoaded(true);
      setIsChangingTrack(false);
    });
    
    audio.addEventListener("error", (e) => {
      console.error("Audio load error:", e);
      setIsLoaded(false);
      setIsChangingTrack(false);
    });

    audioRef.current = audio;
  }, []);

  useEffect(() => {
    loadTrack(AUDIO_TRACKS[0]);

    return () => {
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, [loadTrack]);

  const fadeIn = useCallback((targetVolume: number, duration: number = 2000) => {
    if (!audioRef.current) return;
    
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    
    const audio = audioRef.current;
    const startVolume = audio.volume;
    const volumeDiff = targetVolume - startVolume;
    const steps = 50;
    const stepTime = duration / steps;
    const volumeStep = volumeDiff / steps;
    let currentStep = 0;

    fadeIntervalRef.current = window.setInterval(() => {
      currentStep++;
      audio.volume = Math.min(Math.max(startVolume + volumeStep * currentStep, 0), 1);
      
      if (currentStep >= steps) {
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
        audio.volume = targetVolume;
      }
    }, stepTime);
  }, []);

  const fadeOut = useCallback((duration: number = 2000, callback?: () => void) => {
    if (!audioRef.current) return;
    
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    
    const audio = audioRef.current;
    const startVolume = audio.volume;
    const steps = 50;
    const stepTime = duration / steps;
    const volumeStep = startVolume / steps;
    let currentStep = 0;

    fadeIntervalRef.current = window.setInterval(() => {
      currentStep++;
      audio.volume = Math.max(startVolume - volumeStep * currentStep, 0);
      
      if (currentStep >= steps) {
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
        audio.pause();
        audio.volume = 0;
        setIsPlaying(false);
        callback?.();
      }
    }, stepTime);
  }, []);

  const play = useCallback(async () => {
    if (!audioRef.current || !isLoaded) return;
    
    try {
      await audioRef.current.play();
      setIsPlaying(true);
      fadeIn(volume);
    } catch (error) {
      console.error("Playback error:", error);
    }
  }, [isLoaded, volume, fadeIn]);

  const pause = useCallback(() => {
    if (!audioRef.current) return;
    fadeOut();
  }, [fadeOut]);

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const setAudioVolume = useCallback((newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current && isPlaying) {
      audioRef.current.volume = newVolume;
    }
  }, [isPlaying]);

  const selectTrack = useCallback((track: AudioTrack) => {
    if (track.id === currentTrack.id) return;

    setIsChangingTrack(true);
    setIsLoaded(false);

    const switchToNewTrack = () => {
      setCurrentTrack(track);
      loadTrack(track);
      
      // Auto-play the new track after it loads
      const checkAndPlay = setInterval(() => {
        if (audioRef.current && isLoaded) {
          clearInterval(checkAndPlay);
          play();
        }
      }, 100);

      // Safety timeout
      setTimeout(() => clearInterval(checkAndPlay), 5000);
    };

    if (isPlaying) {
      fadeOut(1000, switchToNewTrack);
    } else {
      switchToNewTrack();
    }
  }, [currentTrack, isPlaying, fadeOut, loadTrack, isLoaded, play]);

  return {
    isPlaying,
    isLoaded,
    volume,
    currentTrack,
    tracks: AUDIO_TRACKS,
    isChangingTrack,
    play,
    pause,
    toggle,
    setVolume: setAudioVolume,
    selectTrack,
  };
};
