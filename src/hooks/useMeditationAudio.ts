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
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentPlaylist, setCurrentPlaylist] = useState<MeditationPlaylist>(getSavedPlaylist);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isChangingTrack, setIsChangingTrack] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);
  const [shufflePosition, setShufflePosition] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<number | null>(null);
  const pendingAutoPlayRef = useRef<boolean>(false);

  const currentTrack = currentPlaylist.tracks[currentTrackIndex];

  // Save playlist preference to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PLAYLIST_ID, currentPlaylist.id);
  }, [currentPlaylist.id]);

  // Save volume preference to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VOLUME, volume.toString());
  }, [volume]);

  const loadTrack = useCallback((track: AudioTrack, looping: boolean = false) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }

    setIsLoading(true);
    setLoadError(null);

    const audio = new Audio(track.url);
    audio.loop = looping;
    audio.volume = 0;
    audio.preload = "auto";
    
    audio.addEventListener("canplaythrough", () => {
      setIsLoaded(true);
      setIsLoading(false);
      setLoadError(null);
      setIsChangingTrack(false);
    });
    
    audio.addEventListener("error", (e) => {
      console.error("Audio load error:", e);
      setIsLoaded(false);
      setIsLoading(false);
      setLoadError("Bài thiền này sẽ sớm được hoàn thiện");
      setIsChangingTrack(false);
      pendingAutoPlayRef.current = false;
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

  // Handle track ended - play next track automatically
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      // Set pending auto-play before changing track
      pendingAutoPlayRef.current = true;
      
      if (isShuffled && shuffledIndices.length > 0) {
        // In shuffle mode, move to next position in shuffled order
        const nextShufflePos = (shufflePosition + 1) % shuffledIndices.length;
        setShufflePosition(nextShufflePos);
        setCurrentTrackIndex(shuffledIndices[nextShufflePos]);
      } else {
        // Normal sequential playback
        if (currentTrackIndex < currentPlaylist.tracks.length - 1) {
          setCurrentTrackIndex(prev => prev + 1);
        } else {
          // Loop back to first track
          setCurrentTrackIndex(0);
        }
      }
    };

    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [currentTrackIndex, currentPlaylist.tracks.length, isShuffled, shuffledIndices, shufflePosition]);

  // Load track when index changes
  useEffect(() => {
    const track = currentPlaylist.tracks[currentTrackIndex];
    if (track) {
      setIsChangingTrack(true);
      setIsLoaded(false);
      loadTrack(track, isLooping);
    }
  }, [currentTrackIndex, currentPlaylist, loadTrack, isLooping]);

  // Update loop state on audio element when isLooping changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = isLooping;
    }
  }, [isLooping]);

  const toggleLoop = useCallback(() => {
    setIsLooping(prev => !prev);
  }, []);

  // Generate shuffled indices for the current playlist
  const generateShuffledIndices = useCallback((trackCount: number, currentIndex: number) => {
    const indices = Array.from({ length: trackCount }, (_, i) => i);
    // Fisher-Yates shuffle
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    // Move current track to the front so we don't immediately skip
    const currentPos = indices.indexOf(currentIndex);
    if (currentPos > 0) {
      [indices[0], indices[currentPos]] = [indices[currentPos], indices[0]];
    }
    return indices;
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffled(prev => {
      if (!prev) {
        // Turning shuffle ON - generate new shuffled order
        const newIndices = generateShuffledIndices(currentPlaylist.tracks.length, currentTrackIndex);
        setShuffledIndices(newIndices);
        setShufflePosition(0);
      } else {
        // Turning shuffle OFF - reset
        setShuffledIndices([]);
        setShufflePosition(0);
      }
      return !prev;
    });
  }, [currentPlaylist.tracks.length, currentTrackIndex, generateShuffledIndices]);

  // Reset shuffle when playlist changes
  useEffect(() => {
    if (isShuffled) {
      const newIndices = generateShuffledIndices(currentPlaylist.tracks.length, currentTrackIndex);
      setShuffledIndices(newIndices);
      setShufflePosition(0);
    }
  }, [currentPlaylist.id]);

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

  // Auto-play when track loads and pending
  useEffect(() => {
    if (isLoaded && pendingAutoPlayRef.current && audioRef.current) {
      pendingAutoPlayRef.current = false;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        fadeIn(volume);
      }).catch(console.error);
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

  const selectTrack = useCallback((trackIndex: number, autoPlay: boolean = false) => {
    if (trackIndex === currentTrackIndex && !autoPlay) return;
    
    const wasPlaying = isPlaying || autoPlay;
    setIsChangingTrack(true);
    setIsLoaded(false);

    const switchToNewTrack = () => {
      setCurrentTrackIndex(trackIndex);
    };

    if (isPlaying && !autoPlay) {
      fadeOut(1000, switchToNewTrack);
    } else {
      switchToNewTrack();
    }

    // Schedule auto-play if needed
    if (wasPlaying) {
      pendingAutoPlayRef.current = true;
    }
  }, [currentTrackIndex, isPlaying, fadeOut]);

  const selectPlaylist = useCallback((playlist: MeditationPlaylist) => {
    if (playlist.id === currentPlaylist.id) return;
    
    const wasPlaying = isPlaying;
    setIsChangingTrack(true);
    setIsLoaded(false);

    const switchToNewPlaylist = () => {
      setCurrentPlaylist(playlist);
      setCurrentTrackIndex(0);
    };

    if (isPlaying) {
      fadeOut(1000, switchToNewPlaylist);
    } else {
      switchToNewPlaylist();
    }

    // Schedule auto-play if was playing
    if (wasPlaying) {
      pendingAutoPlayRef.current = true;
    }
  }, [currentPlaylist, isPlaying, fadeOut]);

  const nextTrack = useCallback(() => {
    const wasPlaying = isPlaying;
    
    if (isShuffled && shuffledIndices.length > 0) {
      const nextShufflePos = (shufflePosition + 1) % shuffledIndices.length;
      setShufflePosition(nextShufflePos);
      selectTrack(shuffledIndices[nextShufflePos]);
    } else {
      const nextIndex = (currentTrackIndex + 1) % currentPlaylist.tracks.length;
      selectTrack(nextIndex);
    }
    
    if (wasPlaying) {
      pendingAutoPlayRef.current = true;
    }
  }, [currentTrackIndex, currentPlaylist.tracks.length, selectTrack, isPlaying, isShuffled, shuffledIndices, shufflePosition]);

  const previousTrack = useCallback(() => {
    const wasPlaying = isPlaying;
    
    if (isShuffled && shuffledIndices.length > 0) {
      const prevShufflePos = shufflePosition === 0 
        ? shuffledIndices.length - 1 
        : shufflePosition - 1;
      setShufflePosition(prevShufflePos);
      selectTrack(shuffledIndices[prevShufflePos]);
    } else {
      const prevIndex = currentTrackIndex === 0 
        ? currentPlaylist.tracks.length - 1 
        : currentTrackIndex - 1;
      selectTrack(prevIndex);
    }
    
    if (wasPlaying) {
      pendingAutoPlayRef.current = true;
    }
  }, [currentTrackIndex, currentPlaylist.tracks.length, selectTrack, isPlaying, isShuffled, shuffledIndices, shufflePosition]);

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
    isLoading,
    loadError,
    volume,
    currentTrack,
    currentTrackIndex,
    currentPlaylist,
    playlists: MEDITATION_PLAYLISTS,
    isChangingTrack,
    currentTime,
    duration,
    isLooping,
    isShuffled,
    play,
    pause,
    toggle,
    toggleLoop,
    toggleShuffle,
    setVolume: setAudioVolume,
    selectTrack,
    selectPlaylist,
    nextTrack,
    previousTrack,
    seek,
    seekByPercent,
  };
};
