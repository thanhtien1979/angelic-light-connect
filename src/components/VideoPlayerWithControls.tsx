import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize2, AlertCircle, Loader2, PictureInPicture2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface VideoPlayerWithControlsProps {
  src: string;
  className?: string;
}

const VideoPlayerWithControls = ({ src, className = "" }: VideoPlayerWithControlsProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [bufferedProgress, setBufferedProgress] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [useNativeControls, setUseNativeControls] = useState(false);
  const [isPiPActive, setIsPiPActive] = useState(false);
  const [isPiPSupported, setIsPiPSupported] = useState(false);
  const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);

  // Check PiP support
  useEffect(() => {
    setIsPiPSupported(
      'pictureInPictureEnabled' in document && 
      (document as any).pictureInPictureEnabled
    );
  }, []);

  // PiP event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnterPiP = () => {
      setIsPiPActive(true);
      toast.success("Đã bật Picture-in-Picture");
    };

    const handleLeavePiP = () => {
      setIsPiPActive(false);
    };

    video.addEventListener('enterpictureinpicture', handleEnterPiP);
    video.addEventListener('leavepictureinpicture', handleLeavePiP);

    return () => {
      video.removeEventListener('enterpictureinpicture', handleEnterPiP);
      video.removeEventListener('leavepictureinpicture', handleLeavePiP);
    };
  }, []);

  const togglePiP = async () => {
    if (!videoRef.current) return;

    try {
      if (isPiPActive) {
        await document.exitPictureInPicture();
      } else {
        await (videoRef.current as any).requestPictureInPicture();
      }
    } catch (error) {
      console.error("PiP error:", error);
      toast.error("Không thể bật Picture-in-Picture");
    }
  };

  const togglePlay = useCallback(async () => {
    if (!videoRef.current) return;
    
    try {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        setIsBuffering(true);
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          await playPromise;
          setIsPlaying(true);
        }
        setIsBuffering(false);
      }
    } catch (error) {
      console.error("Play error:", error);
      setIsBuffering(false);
      // Fallback to native controls if custom controls fail
      setUseNativeControls(true);
    }
  }, [isPlaying]);

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (value: number[]) => {
    if (!videoRef.current) return;
    const newVolume = value[0];
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleSeek = (value: number[]) => {
    if (!videoRef.current || !isLoaded) return;
    const seekTime = value[0];
    videoRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const toggleFullscreen = async () => {
    try {
      if (!containerRef.current && !videoRef.current) return;
      
      const element = containerRef.current || videoRef.current;
      
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (element) {
        if (element.requestFullscreen) {
          await element.requestFullscreen();
        } else if ((element as any).webkitRequestFullscreen) {
          await (element as any).webkitRequestFullscreen();
        } else if ((element as any).msRequestFullscreen) {
          await (element as any).msRequestFullscreen();
        } else if (videoRef.current && (videoRef.current as any).webkitEnterFullscreen) {
          await (videoRef.current as any).webkitEnterFullscreen();
        }
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      updateBufferProgress();
    }
  };

  const updateBufferProgress = () => {
    if (!videoRef.current || !duration) return;
    const buffered = videoRef.current.buffered;
    if (buffered.length > 0) {
      const bufferedEnd = buffered.end(buffered.length - 1);
      const progress = (bufferedEnd / duration) * 100;
      setBufferedProgress(progress);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const videoDuration = videoRef.current.duration;
      if (videoDuration && isFinite(videoDuration) && videoDuration > 0) {
        setDuration(videoDuration);
        setIsLoaded(true);
        setIsLoading(false);
        setHasError(false);
      }
    }
  };

  const handleCanPlay = () => {
    if (videoRef.current) {
      const videoDuration = videoRef.current.duration;
      if (videoDuration && isFinite(videoDuration) && videoDuration > 0) {
        setDuration(videoDuration);
        setIsLoaded(true);
        setIsLoading(false);
        setHasError(false);
      }
    }
    setIsBuffering(false);
  };

  const handleDurationChange = () => {
    if (videoRef.current) {
      const videoDuration = videoRef.current.duration;
      if (videoDuration && isFinite(videoDuration) && videoDuration > 0) {
        setDuration(videoDuration);
        setIsLoaded(true);
      }
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleWaiting = () => {
    setIsBuffering(true);
  };

  const handlePlaying = () => {
    setIsBuffering(false);
    setIsLoading(false);
  };

  const handleProgress = () => {
    updateBufferProgress();
  };

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error("Video error:", e);
    setHasError(true);
    setIsLoading(false);
    setUseNativeControls(true);
  };

  const formatTime = (time: number) => {
    if (!time || !isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
    hideControlsTimeout.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handleMouseLeave = () => {
    if (isPlaying) {
      setShowControls(false);
    }
  };

  useEffect(() => {
    return () => {
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
    };
  }, []);

  // If using native controls, render simple video element
  if (useNativeControls) {
    return (
      <div className={`relative bg-black rounded-xl overflow-hidden ${className}`}>
        <video
          ref={videoRef}
          src={src}
          controls
          controlsList="nodownload"
          playsInline
          preload="auto"
          className="w-full max-h-[500px] object-contain"
        >
          <source src={src} type="video/mp4" />
          Trình duyệt của bạn không hỗ trợ video.
        </video>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative group bg-black rounded-xl overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full max-h-[500px] object-contain cursor-pointer"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onCanPlay={handleCanPlay}
        onDurationChange={handleDurationChange}
        onEnded={handleVideoEnd}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={handleError}
        onWaiting={handleWaiting}
        onPlaying={handlePlaying}
        onProgress={handleProgress}
        playsInline
        preload="auto"
      >
        <source src={src} type="video/mp4" />
        Trình duyệt của bạn không hỗ trợ video.
      </video>

      {/* Loading spinner */}
      {(isLoading || isBuffering) && !hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
          <Loader2 className="w-12 h-12 text-white animate-spin mb-2" />
          <p className="text-white text-sm">
            {isLoading ? "Đang tải video..." : "Đang buffering..."}
          </p>
          {bufferedProgress > 0 && (
            <div className="w-32 mt-2">
              <Progress value={bufferedProgress} className="h-1" />
            </div>
          )}
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white">
          <AlertCircle className="w-12 h-12 mb-2 text-red-400" />
          <p className="text-sm">Không thể tải video</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setUseNativeControls(true)}
            className="mt-2 text-white border-white/30 hover:bg-white/10"
          >
            Thử lại với trình phát mặc định
          </Button>
        </div>
      )}

      {/* Play button overlay when paused and not loading/error */}
      {!isPlaying && !hasError && !isLoading && !isBuffering && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity"
        >
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
            <Play className="w-8 h-8 text-gray-900 ml-1" fill="currentColor" />
          </div>
        </button>
      )}

      {/* Controls overlay */}
      {!hasError && (
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
            showControls || !isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Progress bar with buffer indicator */}
          <div className="mb-3 relative">
            {/* Buffer progress (background) */}
            <div className="absolute inset-0 h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white/40 transition-all duration-300"
                style={{ width: `${bufferedProgress}%` }}
              />
            </div>
            {/* Playback progress */}
            <Slider
              value={[currentTime]}
              max={duration || 1}
              step={0.1}
              onValueChange={handleSeek}
              className="cursor-pointer relative z-10"
              disabled={!isLoaded}
            />
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {/* Play/Pause */}
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                className="h-8 w-8 text-white hover:bg-white/20"
                disabled={isBuffering}
              >
                {isBuffering ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-5 h-5" fill="currentColor" />
                ) : (
                  <Play className="w-5 h-5" fill="currentColor" />
                )}
              </Button>

              {/* Volume */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="h-8 w-8 text-white hover:bg-white/20"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </Button>
                <div className="w-20 hidden sm:block">
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    max={1}
                    step={0.1}
                    onValueChange={handleVolumeChange}
                    className="cursor-pointer"
                  />
                </div>
              </div>

              {/* Time */}
              <span className="text-white text-sm ml-2">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {/* Switch to native controls */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUseNativeControls(true)}
                className="text-xs text-white/70 hover:text-white hover:bg-white/20 hidden sm:inline-flex"
              >
                Trình phát mặc định
              </Button>
              
              {/* Picture-in-Picture */}
              {isPiPSupported && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={togglePiP}
                  className={`h-8 w-8 text-white hover:bg-white/20 ${isPiPActive ? 'bg-white/30' : ''}`}
                  title="Picture-in-Picture"
                >
                  <PictureInPicture2 className="w-5 h-5" />
                </Button>
              )}
              
              {/* Fullscreen */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="h-8 w-8 text-white hover:bg-white/20"
              >
                <Maximize2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayerWithControls;
