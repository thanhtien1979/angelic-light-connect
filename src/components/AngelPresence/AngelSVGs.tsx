import { memo, useRef, useEffect, useState } from 'react';
import type { AngelStyle, VideoSources, VideoQuality } from './types';
import fairyAngelImage from '@/assets/fairy-angel-cursor.png';
import fairyBlueImage from '@/assets/fairy-blue.png';
import fairyRedImage from '@/assets/fairy-red.png';
import fairyPinkImage from '@/assets/fairy-pink.png';
import fairyMintImage from '@/assets/fairy-mint.png';
// New fairy images
import fairyGoldImage from '@/assets/fairy-gold.png';
import fairyYellowImage from '@/assets/fairy-yellow.png';
import fairyGreenImage from '@/assets/fairy-green.png';
import fairyTinkerImage from '@/assets/fairy-tinker.png';
import fairyCuteImage from '@/assets/fairy-cute.webp';
// More fairy images
import fairyStarImage from '@/assets/fairy-star.png';
import fairyLeafImage from '@/assets/fairy-leaf.png';
import fairySunnyImage from '@/assets/fairy-sunny.png';
import fairyButterflyImage from '@/assets/fairy-butterfly.webp';
import fairySpringImage from '@/assets/fairy-spring.webp';
import fairyHeartImage from '@/assets/fairy-heart.png';
import fairyLoveImage from '@/assets/fairy-love.png';
import fairyLavenderImage from '@/assets/fairy-lavender.png';
// Additional fairy images
import fairyRosemaryImage from '@/assets/fairy-rosemary.png';
import fairyButterflyGoldImage from '@/assets/fairy-butterfly-gold.png';
import fairySunflowerImage from '@/assets/fairy-sunflower.png';
import fairyPeachImage from '@/assets/fairy-peach.png';
import fairyLimeImage from '@/assets/fairy-lime.png';
// MP4 video sources (fallback)
import fairyVideoMp4 from '@/assets/angel-cursor-video.mp4';
import celestialVideoMp4 from '@/assets/celestial-video.mp4';
import starlightSeraphMp4 from '@/assets/starlight-seraph-video.mp4';
import auroraGuardianMp4 from '@/assets/aurora-guardian-video.mp4';
import nebulaMessengerMp4 from '@/assets/nebula-messenger-video.mp4';
import grokAngel1Mp4 from '@/assets/grok-angel-1.mp4';
import grokAngel2Mp4 from '@/assets/grok-angel-2.mp4';
import grokAngel3Mp4 from '@/assets/grok-angel-3.mp4';
// Poster images for video angels
import fairyVideoPoster from '@/assets/posters/fairy-video-poster.png';
import celestialVideoPoster from '@/assets/posters/celestial-video-poster.png';
import starlightSeraphPoster from '@/assets/posters/starlight-seraph-poster.png';
import auroraGuardianPoster from '@/assets/posters/aurora-guardian-poster.png';
import nebulaMessengerPoster from '@/assets/posters/nebula-messenger-poster.png';
import grokAngel1Poster from '@/assets/posters/grok-angel-poster.png';
import grokAngel2Poster from '@/assets/posters/grok-angel-2-poster.png';
import grokAngel3Poster from '@/assets/posters/grok-angel-3-poster.png';

// Video sources configuration with quality variants
// When WebM files with alpha are available, add webmHighSrc/webmPerfSrc properties
// When WebM files with alpha are available, add webmHighSrc/webmPerfSrc properties
export const VIDEO_SOURCES: Record<string, VideoSources> = {
  'fairy-video': {
    // webmHighSrc: fairyVideoWebmHigh, // Add when WebM with alpha is available
    // webmPerfSrc: fairyVideoWebmPerf, // Add when WebM performance version is available
    mp4HighSrc: fairyVideoMp4,
    mp4PerfSrc: fairyVideoMp4, // Use same for now, replace with lower res version
    posterSrc: fairyVideoPoster,
  },
  'celestial-video': {
    mp4HighSrc: celestialVideoMp4,
    mp4PerfSrc: celestialVideoMp4,
    posterSrc: celestialVideoPoster,
  },
  'starlight-seraph': {
    mp4HighSrc: starlightSeraphMp4,
    mp4PerfSrc: starlightSeraphMp4,
    posterSrc: starlightSeraphPoster,
  },
  'aurora-guardian': {
    mp4HighSrc: auroraGuardianMp4,
    mp4PerfSrc: auroraGuardianMp4,
    posterSrc: auroraGuardianPoster,
  },
  'nebula-messenger': {
    mp4HighSrc: nebulaMessengerMp4,
    mp4PerfSrc: nebulaMessengerMp4,
    posterSrc: nebulaMessengerPoster,
  },
  'grok-angel-1': {
    mp4HighSrc: grokAngel1Mp4,
    mp4PerfSrc: grokAngel1Mp4,
    posterSrc: grokAngel1Poster,
  },
  'grok-angel-2': {
    mp4HighSrc: grokAngel2Mp4,
    mp4PerfSrc: grokAngel2Mp4,
    posterSrc: grokAngel2Poster,
  },
  'grok-angel-3': {
    mp4HighSrc: grokAngel3Mp4,
    mp4PerfSrc: grokAngel3Mp4,
    posterSrc: grokAngel3Poster,
  },
};

// Helper to get video sources based on quality setting
export function getVideoSourcesForQuality(styleId: string, quality: VideoQuality): { webmSrc?: string; mp4Src: string } {
  const sources = VIDEO_SOURCES[styleId];
  if (!sources) return { mp4Src: '' };
  
  if (quality === 'high') {
    return {
      webmSrc: sources.webmHighSrc,
      mp4Src: sources.mp4HighSrc,
    };
  } else {
    return {
      webmSrc: sources.webmPerfSrc,
      mp4Src: sources.mp4PerfSrc || sources.mp4HighSrc,
    };
  }
}

export type VideoAngelStyleId = keyof typeof VIDEO_SOURCES;

// Reusable video angel component with WebM alpha + MP4 fallback
interface VideoAngelProps {
  styleId: VideoAngelStyleId;
  size?: number;
  className?: string;
}

const VideoAngelComponent = memo(({ styleId, size = 68, className = '' }: VideoAngelProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mq.matches);
      
      const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, []);
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    if (prefersReducedMotion) {
      video.pause();
    } else {
      video.play().catch(() => {});
    }
  }, [prefersReducedMotion]);
  
  // Use high quality sources by default for the individual component
  // The actual quality is controlled via context in the main AngelPresence
  const qualitySources = getVideoSourcesForQuality(styleId, 'high');
  
  return (
    <div 
      className={`relative ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        // Viền vàng ánh kim subtle
        boxShadow: '0 0 0 2px rgba(218, 165, 32, 0.5), 0 0 15px rgba(255, 215, 0, 0.4), inset 0 0 10px rgba(255, 223, 140, 0.3)',
      }}
    >
      {/* Nền vàng ánh kim gradient */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,223,140,0.95) 0%, rgba(218,165,32,0.9) 40%, rgba(184,134,11,0.85) 100%)',
        }}
      />
      
      {/* Video với blend mode để hòa trộn */}
      <video 
        ref={videoRef}
        autoPlay={!prefersReducedMotion}
        loop
        muted
        playsInline
        preload="metadata"
        style={{ 
          width: size,
          height: size,
          objectFit: 'cover',
          borderRadius: '50%',
          pointerEvents: 'none',
          userSelect: 'none',
          position: 'relative',
          zIndex: 1,
          // Multiply blend để nền trắng biến mất, Screen cho nền đen
          mixBlendMode: 'multiply',
        }}
      >
        {/* WebM with alpha channel (if available) - browser tries this first */}
        {qualitySources.webmSrc && (
          <source src={qualitySources.webmSrc} type="video/webm" />
        )}
        {/* MP4 fallback */}
        <source src={qualitySources.mp4Src} type="video/mp4" />
      </video>
    </div>
  );
});
VideoAngelComponent.displayName = 'VideoAngelComponent';

/**
 * Angel SVG Components - Each represents a different angel style
 * All SVGs are designed to be calm, sacred, and non-intrusive
 */

export const ClassicAngelSVG = memo(() => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Halo */}
    <ellipse cx="24" cy="10" rx="8" ry="3" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" fill="none" />
    {/* Head */}
    <circle cx="24" cy="18" r="6" fill="rgba(255,245,238,0.95)" />
    {/* Body/Robe */}
    <path d="M18 24 L24 44 L30 24 Q24 28 18 24Z" fill="rgba(255,255,255,0.9)" />
    {/* Left Wing */}
    <path 
      d="M18 22 Q8 18 6 26 Q10 24 14 26 Q10 28 8 34 Q14 30 18 32 Q16 28 18 24Z" 
      fill="rgba(255,255,255,0.85)"
      stroke="rgba(255,255,255,0.4)"
      strokeWidth="0.5"
    />
    {/* Right Wing */}
    <path 
      d="M30 22 Q40 18 42 26 Q38 24 34 26 Q38 28 40 34 Q34 30 30 32 Q32 28 30 24Z" 
      fill="rgba(255,255,255,0.85)"
      stroke="rgba(255,255,255,0.4)"
      strokeWidth="0.5"
    />
  </svg>
));
ClassicAngelSVG.displayName = 'ClassicAngelSVG';

export const CherubSVG = memo(() => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Soft halo glow */}
    <ellipse cx="20" cy="10" rx="6" ry="2.5" stroke="rgba(255,250,230,0.8)" strokeWidth="1.5" fill="none" />
    {/* Round face */}
    <circle cx="20" cy="16" r="7" fill="rgba(255,240,230,0.95)" />
    {/* Rosy cheeks */}
    <circle cx="16" cy="17" r="1.5" fill="rgba(255,200,180,0.4)" />
    <circle cx="24" cy="17" r="1.5" fill="rgba(255,200,180,0.4)" />
    {/* Small body */}
    <ellipse cx="20" cy="30" rx="6" ry="8" fill="rgba(255,255,255,0.85)" />
    {/* Soft round wings */}
    <ellipse cx="10" cy="22" rx="6" ry="8" fill="rgba(255,255,255,0.75)" transform="rotate(-15 10 22)" />
    <ellipse cx="30" cy="22" rx="6" ry="8" fill="rgba(255,255,255,0.75)" transform="rotate(15 30 22)" />
  </svg>
));
CherubSVG.displayName = 'CherubSVG';

export const SeraphSVG = memo(() => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Radiant halo */}
    <ellipse cx="26" cy="10" rx="10" ry="4" stroke="rgba(255,255,240,0.95)" strokeWidth="2" fill="rgba(255,255,255,0.2)" />
    {/* Light-based face */}
    <circle cx="26" cy="18" r="5" fill="rgba(255,255,255,0.9)" />
    {/* Ethereal body */}
    <path d="M20 23 L26 48 L32 23 Q26 26 20 23Z" fill="rgba(255,255,255,0.8)" />
    {/* Multi-layered abstract wings - Left */}
    <path d="M20 20 Q6 14 4 24 Q8 22 12 25 Q6 28 4 36 Q12 30 18 34 Q14 28 18 22Z" 
          fill="rgba(255,255,255,0.7)" />
    <path d="M19 21 Q10 18 8 25 Q11 24 14 26 Q10 28 9 32 Q14 29 18 31Z" 
          fill="rgba(255,255,240,0.6)" />
    {/* Multi-layered abstract wings - Right */}
    <path d="M32 20 Q46 14 48 24 Q44 22 40 25 Q46 28 48 36 Q40 30 34 34 Q38 28 34 22Z" 
          fill="rgba(255,255,255,0.7)" />
    <path d="M33 21 Q42 18 44 25 Q41 24 38 26 Q42 28 43 32 Q38 29 34 31Z" 
          fill="rgba(255,255,240,0.6)" />
    {/* Light rays */}
    <line x1="26" y1="6" x2="26" y2="2" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
    <line x1="20" y1="7" x2="17" y2="4" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
    <line x1="32" y1="7" x2="35" y2="4" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
  </svg>
));
SeraphSVG.displayName = 'SeraphSVG';

export const GuardianAngelSVG = memo(() => (
  <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Protective halo */}
    <ellipse cx="28" cy="10" rx="9" ry="3.5" stroke="rgba(240,248,255,0.9)" strokeWidth="1.5" fill="none" />
    {/* Serene face */}
    <circle cx="28" cy="18" r="6" fill="rgba(255,248,245,0.95)" />
    {/* Tall flowing robe */}
    <path d="M20 24 L28 54 L36 24 Q28 30 20 24Z" fill="rgba(255,255,255,0.88)" />
    {/* Shoulder detail */}
    <ellipse cx="28" cy="26" rx="10" ry="3" fill="rgba(255,255,255,0.7)" />
    {/* Large protective wings - Left */}
    <path d="M20 22 Q4 16 2 28 Q8 24 14 28 Q6 32 4 42 Q14 34 20 40 Q16 32 20 24Z" 
          fill="rgba(255,255,255,0.82)"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="0.5" />
    {/* Large protective wings - Right */}
    <path d="M36 22 Q52 16 54 28 Q48 24 42 28 Q50 32 52 42 Q42 34 36 40 Q40 32 36 24Z" 
          fill="rgba(255,255,255,0.82)"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="0.5" />
    {/* Inner wing glow */}
    <path d="M22 25 Q12 22 10 30 Q14 28 18 30 Q14 32 12 36 Q18 33 22 35Z" 
          fill="rgba(240,248,255,0.4)" />
    <path d="M34 25 Q44 22 46 30 Q42 28 38 30 Q42 32 44 36 Q38 33 34 35Z" 
          fill="rgba(240,248,255,0.4)" />
  </svg>
));
GuardianAngelSVG.displayName = 'GuardianAngelSVG';

export const JoyAngelSVG = memo(() => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Radiant halo with subtle glow */}
    <ellipse cx="24" cy="9" rx="7" ry="2.5" stroke="rgba(255,250,240,0.9)" strokeWidth="1.5" fill="none" />
    <ellipse cx="24" cy="9" rx="5" ry="1.5" fill="rgba(255,255,255,0.3)" />
    {/* Joyful face */}
    <circle cx="24" cy="17" r="6" fill="rgba(255,248,240,0.95)" />
    {/* Smile */}
    <path d="M21 19 Q24 22 27 19" stroke="rgba(200,180,160,0.4)" strokeWidth="1" fill="none" strokeLinecap="round" />
    {/* Body - slightly dynamic pose */}
    <path d="M18 23 L22 42 L24 38 L26 42 L30 23 Q24 27 18 23Z" fill="rgba(255,255,255,0.88)" />
    {/* Uplifted wings - Left */}
    <path d="M18 20 Q6 12 4 20 Q8 18 12 22 Q8 24 6 30 Q12 26 16 30 Q14 26 18 22Z" 
          fill="rgba(255,255,255,0.85)"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="0.5" />
    {/* Uplifted wings - Right */}
    <path d="M30 20 Q42 12 44 20 Q40 18 36 22 Q40 24 42 30 Q36 26 32 30 Q34 26 30 22Z" 
          fill="rgba(255,255,255,0.85)"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="0.5" />
    {/* Joy sparkle accents */}
    <circle cx="10" cy="14" r="1.5" fill="rgba(255,255,255,0.6)" />
    <circle cx="38" cy="14" r="1.5" fill="rgba(255,255,255,0.6)" />
    <circle cx="24" cy="5" r="1" fill="rgba(255,255,255,0.5)" />
  </svg>
));
JoyAngelSVG.displayName = 'JoyAngelSVG';

export const PeaceAngelSVG = memo(() => (
  <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Calm halo - double ring */}
    <ellipse cx="25" cy="10" rx="8" ry="3" stroke="rgba(245,250,255,0.7)" strokeWidth="1" fill="none" />
    <ellipse cx="25" cy="10" rx="10" ry="4" stroke="rgba(245,250,255,0.4)" strokeWidth="0.5" fill="none" />
    {/* Serene face */}
    <circle cx="25" cy="18" r="5.5" fill="rgba(250,252,255,0.95)" />
    {/* Closed peaceful eyes */}
    <path d="M22 17 Q23 18 24 17" stroke="rgba(180,190,200,0.4)" strokeWidth="0.8" fill="none" strokeLinecap="round" />
    <path d="M26 17 Q27 18 28 17" stroke="rgba(180,190,200,0.4)" strokeWidth="0.8" fill="none" strokeLinecap="round" />
    {/* Flowing robe */}
    <path d="M19 23 L25 46 L31 23 Q25 28 19 23Z" fill="rgba(250,252,255,0.9)" />
    {/* Gentle extended wings - Left */}
    <path d="M19 21 Q5 18 3 26 Q9 23 15 27 Q7 30 5 38 Q13 32 19 36 Q15 30 19 24Z" 
          fill="rgba(245,250,255,0.8)"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="0.5" />
    {/* Gentle extended wings - Right */}
    <path d="M31 21 Q45 18 47 26 Q41 23 35 27 Q43 30 45 38 Q37 32 31 36 Q35 30 31 24Z" 
          fill="rgba(245,250,255,0.8)"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="0.5" />
    {/* Soft inner wing detail */}
    <path d="M20 24 Q12 22 10 28 Q14 26 18 29Z" fill="rgba(255,255,255,0.35)" />
    <path d="M30 24 Q38 22 40 28 Q36 26 32 29Z" fill="rgba(255,255,255,0.35)" />
  </svg>
));
PeaceAngelSVG.displayName = 'PeaceAngelSVG';

export const HealingAngelSVG = memo(() => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Gentle healing halo */}
    <ellipse cx="26" cy="10" rx="9" ry="3.5" stroke="rgba(250,255,250,0.85)" strokeWidth="1.5" fill="none" />
    {/* Soft glow center */}
    <ellipse cx="26" cy="10" rx="5" ry="2" fill="rgba(255,255,255,0.25)" />
    {/* Compassionate face */}
    <circle cx="26" cy="18" r="6" fill="rgba(252,255,250,0.95)" />
    {/* Gentle expression */}
    <ellipse cx="24" cy="17" rx="1" ry="0.5" fill="rgba(180,200,180,0.3)" />
    <ellipse cx="28" cy="17" rx="1" ry="0.5" fill="rgba(180,200,180,0.3)" />
    {/* Flowing healing robe */}
    <path d="M19 24 L26 48 L33 24 Q26 29 19 24Z" fill="rgba(250,255,250,0.88)" />
    {/* Hands reaching out */}
    <ellipse cx="16" cy="32" rx="2" ry="3" fill="rgba(252,255,250,0.7)" transform="rotate(-20 16 32)" />
    <ellipse cx="36" cy="32" rx="2" ry="3" fill="rgba(252,255,250,0.7)" transform="rotate(20 36 32)" />
    {/* Nurturing wings - Left */}
    <path d="M19 21 Q4 16 2 26 Q8 22 14 27 Q6 30 4 40 Q14 33 19 38 Q15 31 19 24Z" 
          fill="rgba(250,255,250,0.8)"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="0.5" />
    {/* Nurturing wings - Right */}
    <path d="M33 21 Q48 16 50 26 Q44 22 38 27 Q46 30 48 40 Q38 33 33 38 Q37 31 33 24Z" 
          fill="rgba(250,255,250,0.8)"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="0.5" />
    {/* Healing energy center */}
    <circle cx="26" cy="30" r="3" fill="rgba(255,255,255,0.3)" />
    <circle cx="26" cy="30" r="1.5" fill="rgba(255,255,255,0.5)" />
  </svg>
));
HealingAngelSVG.displayName = 'HealingAngelSVG';

const createFairyComponent = (imageSrc: string, displayName: string) => {
  const Component = memo(() => (
    <div className="relative motion-safe:animate-fairy-float">
      <img 
        src={imageSrc} 
        alt="" 
        className="w-16 h-16 object-contain motion-safe:animate-fairy-wings"
        style={{ 
          pointerEvents: 'none',
          userSelect: 'none',
          background: 'transparent',
        }}
        draggable={false}
      />
    </div>
  ));
  Component.displayName = displayName;
  return Component;
};

export const FairyAngelSVG = createFairyComponent(fairyAngelImage, 'FairyAngelSVG');
export const FairyBlueSVG = createFairyComponent(fairyBlueImage, 'FairyBlueSVG');
export const FairyRedSVG = createFairyComponent(fairyRedImage, 'FairyRedSVG');
export const FairyPinkSVG = createFairyComponent(fairyPinkImage, 'FairyPinkSVG');
export const FairyMintSVG = createFairyComponent(fairyMintImage, 'FairyMintSVG');
// New fairy components
export const FairyGoldSVG = createFairyComponent(fairyGoldImage, 'FairyGoldSVG');
export const FairyYellowSVG = createFairyComponent(fairyYellowImage, 'FairyYellowSVG');
export const FairyGreenSVG = createFairyComponent(fairyGreenImage, 'FairyGreenSVG');
export const FairyTinkerSVG = createFairyComponent(fairyTinkerImage, 'FairyTinkerSVG');
export const FairyCuteSVG = createFairyComponent(fairyCuteImage, 'FairyCuteSVG');
// More fairy components
export const FairyStarSVG = createFairyComponent(fairyStarImage, 'FairyStarSVG');
export const FairyLeafSVG = createFairyComponent(fairyLeafImage, 'FairyLeafSVG');
export const FairySunnySVG = createFairyComponent(fairySunnyImage, 'FairySunnySVG');
export const FairyButterflySVG = createFairyComponent(fairyButterflyImage, 'FairyButterflySVG');
export const FairySpringSVG = createFairyComponent(fairySpringImage, 'FairySpringSVG');
export const FairyHeartSVG = createFairyComponent(fairyHeartImage, 'FairyHeartSVG');
export const FairyLoveSVG = createFairyComponent(fairyLoveImage, 'FairyLoveSVG');
export const FairyLavenderSVG = createFairyComponent(fairyLavenderImage, 'FairyLavenderSVG');
// Additional fairy components
export const FairyRosemarySVG = createFairyComponent(fairyRosemaryImage, 'FairyRosemarySVG');
export const FairyButterflyGoldSVG = createFairyComponent(fairyButterflyGoldImage, 'FairyButterflyGoldSVG');
export const FairySunflowerSVG = createFairyComponent(fairySunflowerImage, 'FairySunflowerSVG');
export const FairyPeachSVG = createFairyComponent(fairyPeachImage, 'FairyPeachSVG');
export const FairyLimeSVG = createFairyComponent(fairyLimeImage, 'FairyLimeSVG');

// Video-based angel components using WebM alpha with MP4 fallback
export const FairyVideoSVG = memo(() => (
  <VideoAngelComponent styleId="fairy-video" size={64} className="motion-safe:animate-fairy-float" />
));
FairyVideoSVG.displayName = 'FairyVideoSVG';

export const CelestialVideoSVG = memo(() => (
  <VideoAngelComponent styleId="celestial-video" size={72} />
));
CelestialVideoSVG.displayName = 'CelestialVideoSVG';

export const StarlightSeraphSVG = memo(() => (
  <VideoAngelComponent styleId="starlight-seraph" size={68} />
));
StarlightSeraphSVG.displayName = 'StarlightSeraphSVG';

export const AuroraGuardianSVG = memo(() => (
  <VideoAngelComponent styleId="aurora-guardian" size={72} />
));
AuroraGuardianSVG.displayName = 'AuroraGuardianSVG';

export const NebulaMessengerSVG = memo(() => (
  <VideoAngelComponent styleId="nebula-messenger" size={70} />
));
NebulaMessengerSVG.displayName = 'NebulaMessengerSVG';

export const GrokAngel1SVG = memo(() => (
  <VideoAngelComponent styleId="grok-angel-1" size={68} />
));
GrokAngel1SVG.displayName = 'GrokAngel1SVG';

export const GrokAngel2SVG = memo(() => (
  <VideoAngelComponent styleId="grok-angel-2" size={70} />
));
GrokAngel2SVG.displayName = 'GrokAngel2SVG';

export const GrokAngel3SVG = memo(() => (
  <VideoAngelComponent styleId="grok-angel-3" size={68} />
));
GrokAngel3SVG.displayName = 'GrokAngel3SVG';

// Map styles to SVG components
export const AngelSVGMap: Record<AngelStyle, React.ComponentType> = {
  classic: ClassicAngelSVG,
  cherub: CherubSVG,
  seraph: SeraphSVG,
  guardian: GuardianAngelSVG,
  joy: JoyAngelSVG,
  peace: PeaceAngelSVG,
  healing: HealingAngelSVG,
  fairy: FairyAngelSVG,
  'fairy-blue': FairyBlueSVG,
  'fairy-red': FairyRedSVG,
  'fairy-pink': FairyPinkSVG,
  'fairy-mint': FairyMintSVG,
  'fairy-gold': FairyGoldSVG,
  'fairy-yellow': FairyYellowSVG,
  'fairy-green': FairyGreenSVG,
  'fairy-tinker': FairyTinkerSVG,
  'fairy-cute': FairyCuteSVG,
  'fairy-star': FairyStarSVG,
  'fairy-leaf': FairyLeafSVG,
  'fairy-sunny': FairySunnySVG,
  'fairy-butterfly': FairyButterflySVG,
  'fairy-spring': FairySpringSVG,
  'fairy-heart': FairyHeartSVG,
  'fairy-love': FairyLoveSVG,
  'fairy-lavender': FairyLavenderSVG,
  'fairy-rosemary': FairyRosemarySVG,
  'fairy-butterfly-gold': FairyButterflyGoldSVG,
  'fairy-sunflower': FairySunflowerSVG,
  'fairy-peach': FairyPeachSVG,
  'fairy-lime': FairyLimeSVG,
  'fairy-video': FairyVideoSVG,
  'celestial-video': CelestialVideoSVG,
  'starlight-seraph': StarlightSeraphSVG,
  'aurora-guardian': AuroraGuardianSVG,
  'nebula-messenger': NebulaMessengerSVG,
  'grok-angel-1': GrokAngel1SVG,
  'grok-angel-2': GrokAngel2SVG,
  'grok-angel-3': GrokAngel3SVG,
};
