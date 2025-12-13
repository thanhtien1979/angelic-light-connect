import { useState, useRef, useEffect, useCallback } from "react";

// Using a free ambient audio URL (royalty-free meditation music)
const AMBIENT_AUDIO_URL = "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3";

export const useMeditationAudio = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isLoaded, setIsLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const audio = new Audio(AMBIENT_AUDIO_URL);
    audio.loop = true;
    audio.volume = 0;
    audio.preload = "auto";
    
    audio.addEventListener("canplaythrough", () => setIsLoaded(true));
    audio.addEventListener("error", (e) => {
      console.error("Audio load error:", e);
      setIsLoaded(false);
    });

    audioRef.current = audio;

    return () => {
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      audio.pause();
      audio.src = "";
    };
  }, []);

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

  const fadeOut = useCallback((duration: number = 2000) => {
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

  return {
    isPlaying,
    isLoaded,
    volume,
    play,
    pause,
    toggle,
    setVolume: setAudioVolume,
  };
};
