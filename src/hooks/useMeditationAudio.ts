import { useState, useRef, useEffect, useCallback } from "react";

const STORAGE_KEYS = {
  PLAYLIST_ID: "meditation_playlist_id",
  VOLUME: "meditation_volume",
};

export interface AudioTrack {
  id: string;
  name: string;
  nameVi: string;
  url: string;
  duration: string;
}

export interface MeditationPlaylist {
  id: string;
  name: string;
  nameVi: string;
  description: string;
  icon: "healing" | "love" | "cosmos" | "peace";
  tracks: AudioTrack[];
}

// Meditation playlists with multiple tracks each
export const MEDITATION_PLAYLISTS: MeditationPlaylist[] = [
  {
    id: "healing-light",
    name: "Healing Light",
    nameVi: "Ánh Sáng Chữa Lành",
    description: "Năng lượng chữa lành từ nguồn sáng thiêng liêng",
    icon: "healing",
    tracks: [
      {
        id: "healing-1",
        name: "Divine Harmony",
        nameVi: "Hòa Âm Thiêng Liêng",
        url: "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3",
        duration: "3:24",
      },
      {
        id: "healing-2",
        name: "Healing Waters",
        nameVi: "Dòng Nước Chữa Lành",
        url: "https://cdn.pixabay.com/audio/2022/03/10/audio_4dedf5bf94.mp3",
        duration: "2:58",
      },
      {
        id: "healing-3",
        name: "Light Embrace",
        nameVi: "Vòng Tay Ánh Sáng",
        url: "https://cdn.pixabay.com/audio/2024/11/14/audio_3760e5a498.mp3",
        duration: "3:12",
      },
    ],
  },
  {
    id: "divine-love",
    name: "Divine Love",
    nameVi: "Tình Yêu Thiêng Liêng",
    description: "Kết nối với tình yêu vô điều kiện của vũ trụ",
    icon: "love",
    tracks: [
      {
        id: "love-1",
        name: "Heart Opening",
        nameVi: "Mở Cửa Trái Tim",
        url: "https://cdn.pixabay.com/audio/2022/08/02/audio_884fe92c21.mp3",
        duration: "3:45",
      },
      {
        id: "love-2",
        name: "Unconditional",
        nameVi: "Vô Điều Kiện",
        url: "https://cdn.pixabay.com/audio/2022/10/25/audio_946bc6eb3d.mp3",
        duration: "2:34",
      },
      {
        id: "love-3",
        name: "Compassion Flow",
        nameVi: "Dòng Chảy Từ Bi",
        url: "https://cdn.pixabay.com/audio/2023/07/19/audio_e0c5e40d23.mp3",
        duration: "4:02",
      },
    ],
  },
  {
    id: "cosmic-connection",
    name: "Cosmic Connection",
    nameVi: "Kết Nối Vũ Trụ",
    description: "Hòa mình vào nguồn năng lượng của Cha Vũ Trụ",
    icon: "cosmos",
    tracks: [
      {
        id: "cosmos-1",
        name: "Starlight Path",
        nameVi: "Con Đường Sao",
        url: "https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3",
        duration: "3:56",
      },
      {
        id: "cosmos-2",
        name: "Universe Embrace",
        nameVi: "Vũ Trụ Ôm Ấp",
        url: "https://cdn.pixabay.com/audio/2022/05/16/audio_460b6cbb06.mp3",
        duration: "4:18",
      },
      {
        id: "cosmos-3",
        name: "Infinite Light",
        nameVi: "Ánh Sáng Vô Tận",
        url: "https://cdn.pixabay.com/audio/2021/08/04/audio_12b0c7443c.mp3",
        duration: "3:33",
      },
    ],
  },
  {
    id: "inner-peace",
    name: "Inner Peace",
    nameVi: "Bình Yên Nội Tại",
    description: "Tìm lại sự tĩnh lặng trong tâm hồn",
    icon: "peace",
    tracks: [
      {
        id: "peace-1",
        name: "Tranquil Mind",
        nameVi: "Tâm Trí Tĩnh Lặng",
        url: "https://cdn.pixabay.com/audio/2022/03/24/audio_45c0e3b805.mp3",
        duration: "3:08",
      },
      {
        id: "peace-2",
        name: "Stillness Within",
        nameVi: "Sự Tĩnh Lặng Bên Trong",
        url: "https://cdn.pixabay.com/audio/2022/02/23/audio_ea70ad08ed.mp3",
        duration: "2:45",
      },
      {
        id: "peace-3",
        name: "Serenity Garden",
        nameVi: "Vườn Thanh Tịnh",
        url: "https://cdn.pixabay.com/audio/2022/08/23/audio_78d9018f2e.mp3",
        duration: "3:52",
      },
    ],
  },
];

const getSavedPlaylist = (): MeditationPlaylist => {
  const savedId = localStorage.getItem(STORAGE_KEYS.PLAYLIST_ID);
  if (savedId) {
    const found = MEDITATION_PLAYLISTS.find(p => p.id === savedId);
    if (found) return found;
  }
  return MEDITATION_PLAYLISTS[0];
};

const getSavedVolume = (): number => {
  const savedVolume = localStorage.getItem(STORAGE_KEYS.VOLUME);
  if (savedVolume) {
    const parsed = parseFloat(savedVolume);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) return parsed;
  }
  return 0.7;
};

export const useMeditationAudio = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(getSavedVolume);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentPlaylist, setCurrentPlaylist] = useState<MeditationPlaylist>(getSavedPlaylist);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isChangingTrack, setIsChangingTrack] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<number | null>(null);

  const currentTrack = currentPlaylist.tracks[currentTrackIndex];

  // Save playlist preference to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PLAYLIST_ID, currentPlaylist.id);
  }, [currentPlaylist.id]);

  // Save volume preference to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VOLUME, volume.toString());
  }, [volume]);

  const loadTrack = useCallback((track: AudioTrack) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }

    const audio = new Audio(track.url);
    audio.loop = false;
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

    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration);
    });

    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime);
    });

    audioRef.current = audio;
    setCurrentTime(0);
    setDuration(0);
  }, []);

  // Handle track ended - play next track
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (currentTrackIndex < currentPlaylist.tracks.length - 1) {
        setCurrentTrackIndex(prev => prev + 1);
      } else {
        // Loop back to first track
        setCurrentTrackIndex(0);
      }
    };

    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [currentTrackIndex, currentPlaylist.tracks.length]);

  // Load track when index changes
  useEffect(() => {
    const track = currentPlaylist.tracks[currentTrackIndex];
    if (track) {
      setIsChangingTrack(true);
      setIsLoaded(false);
      loadTrack(track);
    }
  }, [currentTrackIndex, currentPlaylist, loadTrack]);

  // Initial load
  useEffect(() => {
    loadTrack(MEDITATION_PLAYLISTS[0].tracks[0]);

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

  const selectTrack = useCallback((trackIndex: number) => {
    if (trackIndex === currentTrackIndex) return;
    
    const wasPlaying = isPlaying;
    setIsChangingTrack(true);
    setIsLoaded(false);

    const switchToNewTrack = () => {
      setCurrentTrackIndex(trackIndex);
      
      if (wasPlaying) {
        // Auto-play after track loads
        const checkAndPlay = setInterval(() => {
          if (audioRef.current && !isChangingTrack) {
            clearInterval(checkAndPlay);
            play();
          }
        }, 100);
        setTimeout(() => clearInterval(checkAndPlay), 5000);
      }
    };

    if (isPlaying) {
      fadeOut(1000, switchToNewTrack);
    } else {
      switchToNewTrack();
    }
  }, [currentTrackIndex, isPlaying, isChangingTrack, fadeOut, play]);

  const selectPlaylist = useCallback((playlist: MeditationPlaylist) => {
    if (playlist.id === currentPlaylist.id) return;
    
    const wasPlaying = isPlaying;
    setIsChangingTrack(true);
    setIsLoaded(false);

    const switchToNewPlaylist = () => {
      setCurrentPlaylist(playlist);
      setCurrentTrackIndex(0);
      
      if (wasPlaying) {
        const checkAndPlay = setInterval(() => {
          if (audioRef.current && !isChangingTrack) {
            clearInterval(checkAndPlay);
            play();
          }
        }, 100);
        setTimeout(() => clearInterval(checkAndPlay), 5000);
      }
    };

    if (isPlaying) {
      fadeOut(1000, switchToNewPlaylist);
    } else {
      switchToNewPlaylist();
    }
  }, [currentPlaylist, isPlaying, isChangingTrack, fadeOut, play]);

  const nextTrack = useCallback(() => {
    const nextIndex = (currentTrackIndex + 1) % currentPlaylist.tracks.length;
    selectTrack(nextIndex);
  }, [currentTrackIndex, currentPlaylist.tracks.length, selectTrack]);

  const previousTrack = useCallback(() => {
    const prevIndex = currentTrackIndex === 0 
      ? currentPlaylist.tracks.length - 1 
      : currentTrackIndex - 1;
    selectTrack(prevIndex);
  }, [currentTrackIndex, currentPlaylist.tracks.length, selectTrack]);

  const seek = useCallback((time: number) => {
    if (audioRef.current && isLoaded) {
      const clampedTime = Math.max(0, Math.min(time, audioRef.current.duration || 0));
      audioRef.current.currentTime = clampedTime;
      setCurrentTime(clampedTime);
    }
  }, [isLoaded]);

  const seekByPercent = useCallback((percent: number) => {
    if (audioRef.current && isLoaded && duration > 0) {
      const time = (percent / 100) * duration;
      seek(time);
    }
  }, [isLoaded, duration, seek]);

  return {
    isPlaying,
    isLoaded,
    volume,
    currentTrack,
    currentTrackIndex,
    currentPlaylist,
    playlists: MEDITATION_PLAYLISTS,
    isChangingTrack,
    currentTime,
    duration,
    play,
    pause,
    toggle,
    setVolume: setAudioVolume,
    selectTrack,
    selectPlaylist,
    nextTrack,
    previousTrack,
    seek,
    seekByPercent,
  };
};
