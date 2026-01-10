import { memo, useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { Check, Eye, Upload, Trash2, ImageIcon, Play, Zap, Sparkles, ChevronDown, RotateCcw } from 'lucide-react';
import { ANGEL_STYLES, ANGEL_COLORS, type AngelStyle, type AngelColor, type VideoQuality } from './types';
import { AngelSVGMap, VIDEO_SOURCES, getVideoSourcesForQuality, type VideoAngelStyleId } from './AngelSVGs';
import { cn } from '@/lib/utils';
import AngelPresence from './index';
import { Button } from '@/components/ui/button';
import PresetThemeSelector from './PresetThemeSelector';
import type { AngelPreset } from './presets';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

/**
 * AngelStyleGallery - Allows users to choose between angel designs and colors
 * Includes live preview that reflects current settings and preset themes
 */

// Default styles that cannot be deleted
const DEFAULT_STYLES: AngelStyle[] = ['classic', 'cherub', 'seraph', 'guardian', 'joy', 'peace', 'healing', 'fairy'];

interface AngelStyleGalleryProps {
  currentStyle: AngelStyle;
  onStyleChange: (style: AngelStyle) => void;
  currentColor: AngelColor;
  onColorChange: (color: AngelColor) => void;
  sparklesEnabled: boolean;
  onSparklesChange: (enabled: boolean) => void;
  trailEnabled: boolean;
  onTrailChange: (enabled: boolean) => void;
  videoQuality: VideoQuality;
  onVideoQualityChange: (quality: VideoQuality) => void;
  customImageUrl?: string;
  onCustomImageUpload?: (file: File) => void;
  onCustomImageRemove?: () => void;
  isUploading?: boolean;
  isLoggedIn?: boolean;
  hiddenStyles?: AngelStyle[];
  onDeleteStyle?: (styleId: AngelStyle) => void;
  onRestoreStyle?: (styleId: AngelStyle) => void;
}

const AngelStyleGallery = memo(({
  currentStyle,
  onStyleChange,
  currentColor,
  onColorChange,
  sparklesEnabled,
  onSparklesChange,
  trailEnabled,
  onTrailChange,
  videoQuality,
  onVideoQualityChange,
  customImageUrl,
  onCustomImageUpload,
  onCustomImageRemove,
  isUploading = false,
  isLoggedIn = false,
  hiddenStyles = [],
  onDeleteStyle,
  onRestoreStyle,
}: AngelStyleGalleryProps) => {
  const [isHiddenListOpen, setIsHiddenListOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hoverVideoRef = useRef<HTMLVideoElement>(null);
  const [hoveredVideoStyle, setHoveredVideoStyle] = useState<string | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Check for reduced motion preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mq.matches);
      
      const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, []);
  
  // Get current color config for glow preview
  const currentColorConfig = ANGEL_COLORS.find(c => c.id === currentColor) || ANGEL_COLORS[0];
  
  // Separate static and video angel styles, filtering out hidden ones
  const { staticStyles, videoStyles, hiddenStaticStyles, hiddenVideoStyles } = useMemo(() => {
    const staticStyles = ANGEL_STYLES.filter(s => !s.isVideo && !hiddenStyles.includes(s.id));
    const videoStyles = ANGEL_STYLES.filter(s => s.isVideo && !hiddenStyles.includes(s.id));
    const hiddenStaticStyles = ANGEL_STYLES.filter(s => !s.isVideo && hiddenStyles.includes(s.id));
    const hiddenVideoStyles = ANGEL_STYLES.filter(s => s.isVideo && hiddenStyles.includes(s.id));
    return { staticStyles, videoStyles, hiddenStaticStyles, hiddenVideoStyles };
  }, [hiddenStyles]);
  
  // Handle restore click
  const handleRestoreStyle = useCallback((e: React.MouseEvent, styleId: AngelStyle) => {
    e.stopPropagation();
    if (onRestoreStyle) {
      onRestoreStyle(styleId);
    }
  }, [onRestoreStyle]);
  
  // Check if a style can be deleted (not a default style)
  const canDeleteStyle = useCallback((styleId: AngelStyle) => {
    return !DEFAULT_STYLES.includes(styleId);
  }, []);
  
  // Handle delete click with confirmation
  const handleDeleteStyle = useCallback((e: React.MouseEvent, styleId: AngelStyle) => {
    e.stopPropagation(); // Prevent selecting the style
    if (onDeleteStyle && canDeleteStyle(styleId)) {
      onDeleteStyle(styleId);
    }
  }, [onDeleteStyle, canDeleteStyle]);
  
  // Throttled hover handlers to prevent flicker
  const handleVideoHover = useCallback((styleId: string) => {
    if (prefersReducedMotion) return;
    
    // Clear any pending timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    // Small delay to prevent rapid start/stop
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredVideoStyle(styleId);
    }, 100);
  }, [prefersReducedMotion]);
  
  const handleVideoLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredVideoStyle(null);
    
    // Stop and reset the video
    if (hoverVideoRef.current) {
      hoverVideoRef.current.pause();
      hoverVideoRef.current.currentTime = 0;
    }
  }, []);
  
  // Play hover video when hoveredVideoStyle changes
  useEffect(() => {
    if (hoveredVideoStyle && hoverVideoRef.current) {
      hoverVideoRef.current.play().catch(() => {});
    }
  }, [hoveredVideoStyle]);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onCustomImageUpload) {
      onCustomImageUpload(file);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Apply a preset theme - updates all settings at once
  const handleApplyPreset = (preset: AngelPreset) => {
    // Clear custom image when applying preset
    if (customImageUrl && onCustomImageRemove) {
      onCustomImageRemove();
    }
    // Apply all preset settings
    onStyleChange(preset.style);
    onColorChange(preset.color);
    onSparklesChange(preset.sparklesEnabled);
    onTrailChange(preset.trailEnabled);
  };
  
  return (
    <div className="space-y-6">
      {/* Live Preview Section - Larger, more prominent */}
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="w-4 h-4 text-muted-foreground" />
          <h4 className="text-sm font-medium text-foreground/80">Live Preview</h4>
        </div>
        <div 
          className="rounded-2xl border border-border/30 bg-gradient-to-b from-background/50 to-muted/20 p-3"
          style={{
            boxShadow: `0 0 40px ${currentColorConfig.glowColor.replace('0.6', '0.12')}`,
          }}
        >
          <AngelPresence
            enabled={true}
            style={currentStyle}
            color={currentColor}
            sparklesEnabled={sparklesEnabled}
            trailEnabled={trailEnabled}
            imageUrl={customImageUrl}
            previewMode={true}
            previewSize={160}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Watch your angel companion move along a gentle path
        </p>
      </div>

      {/* Preset Themes Section */}
      <div className="pt-4 border-t border-border/30">
        <PresetThemeSelector
          currentStyle={currentStyle}
          currentColor={currentColor}
          sparklesEnabled={sparklesEnabled}
          trailEnabled={trailEnabled}
          onApplyPreset={handleApplyPreset}
        />
      </div>

      {/* Static Angel Styles */}
      <div className="pt-4 border-t border-border/30">
        <h4 className="text-sm font-medium text-foreground/80 mb-3">Angel Style</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {staticStyles.map((style) => {
            const AngelSVG = AngelSVGMap[style.id];
            const isSelected = currentStyle === style.id && !customImageUrl;
            
            return (
              <button
                key={style.id}
                onClick={() => {
                  onStyleChange(style.id);
                  if (customImageUrl && onCustomImageRemove) {
                    onCustomImageRemove();
                  }
                }}
                className={cn(
                  "relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 group/card",
                  isSelected 
                    ? "border-primary bg-primary/10 shadow-lg" 
                    : "border-border/50 hover:border-primary/50 hover:bg-accent/50"
                )}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
                
                {/* Delete button - only for non-default styles */}
                {canDeleteStyle(style.id) && onDeleteStyle && (
                  <button
                    onClick={(e) => handleDeleteStyle(e, style.id)}
                    className="absolute top-2 left-2 w-6 h-6 bg-destructive/80 hover:bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 z-10"
                    title="Xóa thiên thần này"
                  >
                    <Trash2 className="w-3 h-3 text-destructive-foreground" />
                  </button>
                )}
                
                <div 
                  className="w-14 h-14 flex items-center justify-center mb-2 rounded-full transition-all duration-300"
                  style={{
                    background: `radial-gradient(circle, ${currentColorConfig.glowColor} 0%, transparent 70%)`,
                  }}
                >
                  <div style={{ transform: `scale(${style.scale})` }}>
                    <AngelSVG />
                  </div>
                </div>
                
                <span className="text-sm font-medium text-foreground">{style.name}</span>
                <span className="text-xs text-muted-foreground text-center mt-1 line-clamp-2">
                  {style.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Video Angel Styles */}
      <div className="pt-4 border-t border-border/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-muted-foreground" />
            <h4 className="text-sm font-medium text-foreground/80">Video Angels</h4>
            {!prefersReducedMotion && (
              <span className="text-[10px] text-muted-foreground">(hover to preview)</span>
            )}
          </div>
        </div>
        
        {/* Video Quality Toggle */}
        <div className="mb-4 p-3 rounded-lg bg-muted/30 border border-border/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-foreground/70">Video Quality</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onVideoQualityChange('high')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border-2 transition-all duration-200 text-sm",
                videoQuality === 'high'
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border/50 hover:border-primary/50 text-muted-foreground hover:text-foreground"
              )}
            >
              <Sparkles className="w-4 h-4" />
              <div className="text-left">
                <div className="font-medium">High Quality</div>
                <div className="text-[10px] opacity-70">Sharper visuals</div>
              </div>
            </button>
            <button
              onClick={() => onVideoQualityChange('performance')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border-2 transition-all duration-200 text-sm",
                videoQuality === 'performance'
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border/50 hover:border-primary/50 text-muted-foreground hover:text-foreground"
              )}
            >
              <Zap className="w-4 h-4" />
              <div className="text-left">
                <div className="font-medium">Performance</div>
                <div className="text-[10px] opacity-70">Smoother playback</div>
              </div>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {videoStyles.map((style) => {
            const isSelected = currentStyle === style.id && !customImageUrl;
            const videoSources = VIDEO_SOURCES[style.id as VideoAngelStyleId];
            const posterSrc = videoSources?.posterSrc;
            const isHovered = hoveredVideoStyle === style.id;
            
            return (
              <button
                key={style.id}
                onClick={() => {
                  onStyleChange(style.id);
                  if (customImageUrl && onCustomImageRemove) {
                    onCustomImageRemove();
                  }
                }}
                onMouseEnter={() => handleVideoHover(style.id)}
                onMouseLeave={handleVideoLeave}
                onFocus={() => handleVideoHover(style.id)}
                onBlur={handleVideoLeave}
                className={cn(
                  "relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 group/card",
                  isSelected 
                    ? "border-primary bg-primary/10 shadow-lg" 
                    : "border-border/50 hover:border-primary/50 hover:bg-accent/50"
                )}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
                
                {/* Delete button - only for non-default styles */}
                {canDeleteStyle(style.id) && onDeleteStyle && (
                  <button
                    onClick={(e) => handleDeleteStyle(e, style.id)}
                    className="absolute top-2 right-8 w-6 h-6 bg-destructive/80 hover:bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 z-10"
                    title="Xóa thiên thần này"
                  >
                    <Trash2 className="w-3 h-3 text-destructive-foreground" />
                  </button>
                )}
                
                {/* Video badge */}
                <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-background/80 backdrop-blur-sm rounded text-[10px] font-medium text-muted-foreground flex items-center gap-0.5">
                  <Play className="w-2.5 h-2.5" />
                  VIDEO
                </div>
                
                {/* Poster thumbnail with hover video preview - khung tròn + nền trắng */}
                <div 
                  className="w-12 h-12 flex items-center justify-center mb-2 rounded-full overflow-hidden transition-all duration-300"
                  style={{
                    background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(250,250,250,0.98) 50%, rgba(245,245,245,0.95) 100%)',
                    boxShadow: '0 0 0 2px rgba(200,200,200,0.4), 0 0 10px rgba(255,255,255,0.5)',
                  }}
                >
                  {isHovered && videoSources && !prefersReducedMotion ? (
                    <video
                      ref={isHovered ? hoverVideoRef : null}
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="metadata"
                      className="w-12 h-12 object-cover rounded-full transition-opacity duration-200"
                      style={{ 
                        opacity: isHovered ? 1 : 0,
                        mixBlendMode: 'multiply',
                      }}
                    >
                      {videoSources.webmHighSrc && (
                        <source src={videoSources.webmHighSrc} type="video/webm" />
                      )}
                      <source src={videoSources.mp4HighSrc} type="video/mp4" />
                    </video>
                  ) : posterSrc ? (
                    <img 
                      src={posterSrc} 
                      alt={style.name}
                      className="w-12 h-12 object-cover rounded-full transition-opacity duration-200"
                      style={{ mixBlendMode: 'multiply' }}
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full flex items-center justify-center">
                      <Play className="w-5 h-5 text-amber-800/60" />
                    </div>
                  )}
                </div>
                
                <span className="text-sm font-medium text-foreground">{style.name}</span>
                <span className="text-xs text-muted-foreground text-center mt-1 line-clamp-2">
                  {style.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hidden Angels Section - Collapsible */}
      {(hiddenStaticStyles.length > 0 || hiddenVideoStyles.length > 0) && (
        <Collapsible open={isHiddenListOpen} onOpenChange={setIsHiddenListOpen}>
          <div className="pt-4 border-t border-border/30">
            <CollapsibleTrigger asChild>
              <button className="w-full flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-muted-foreground" />
                  <h4 className="text-sm font-medium text-foreground/80">
                    Đã ẩn ({hiddenStaticStyles.length + hiddenVideoStyles.length})
                  </h4>
                </div>
                <ChevronDown className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform duration-200",
                  isHiddenListOpen && "rotate-180"
                )} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {/* Hidden static styles */}
                {hiddenStaticStyles.map((style) => {
                  const AngelSVG = AngelSVGMap[style.id];
                  
                  return (
                    <div
                      key={style.id}
                      className="relative flex flex-col items-center p-4 rounded-xl border-2 border-border/30 bg-muted/30 opacity-60 hover:opacity-100 transition-all duration-200 group/card"
                    >
                      {/* Restore button */}
                      <button
                        onClick={(e) => handleRestoreStyle(e, style.id)}
                        className="absolute top-2 right-2 w-7 h-7 bg-primary/80 hover:bg-primary rounded-full flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 z-10"
                        title="Khôi phục thiên thần"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-primary-foreground" />
                      </button>
                      
                      <div 
                        className="w-12 h-12 flex items-center justify-center mb-2 rounded-full transition-all duration-300 grayscale group-hover/card:grayscale-0"
                        style={{
                          background: `radial-gradient(circle, ${currentColorConfig.glowColor} 0%, transparent 70%)`,
                        }}
                      >
                        <div style={{ transform: `scale(${style.scale * 0.85})` }}>
                          <AngelSVG />
                        </div>
                      </div>
                      
                      <span className="text-sm font-medium text-muted-foreground group-hover/card:text-foreground">{style.name}</span>
                    </div>
                  );
                })}
                
                {/* Hidden video styles */}
                {hiddenVideoStyles.map((style) => {
                  const videoSources = VIDEO_SOURCES[style.id as VideoAngelStyleId];
                  const posterSrc = videoSources?.posterSrc;
                  
                  return (
                    <div
                      key={style.id}
                      className="relative flex flex-col items-center p-4 rounded-xl border-2 border-border/30 bg-muted/30 opacity-60 hover:opacity-100 transition-all duration-200 group/card"
                    >
                      {/* Video badge */}
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-background/80 backdrop-blur-sm rounded text-[10px] font-medium text-muted-foreground flex items-center gap-0.5">
                        <Play className="w-2.5 h-2.5" />
                        VIDEO
                      </div>
                      
                      {/* Restore button */}
                      <button
                        onClick={(e) => handleRestoreStyle(e, style.id)}
                        className="absolute top-2 right-2 w-7 h-7 bg-primary/80 hover:bg-primary rounded-full flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 z-10"
                        title="Khôi phục thiên thần"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-primary-foreground" />
                      </button>
                      
                      <div 
                        className="w-12 h-12 flex items-center justify-center mb-2 rounded-full overflow-hidden transition-all duration-300 grayscale group-hover/card:grayscale-0"
                        style={{
                          background: 'radial-gradient(circle, rgba(255,223,140,0.95) 0%, rgba(218,165,32,0.9) 40%, rgba(184,134,11,0.85) 100%)',
                        }}
                      >
                        {posterSrc ? (
                          <img 
                            src={posterSrc} 
                            alt={style.name}
                            className="w-12 h-12 object-cover rounded-full"
                            style={{ mixBlendMode: 'multiply' }}
                            loading="lazy"
                          />
                        ) : (
                          <Play className="w-5 h-5 text-amber-800/60" />
                        )}
                      </div>
                      
                      <span className="text-sm font-medium text-muted-foreground group-hover/card:text-foreground">{style.name}</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Nhấn vào nút khôi phục để hiện lại thiên thần
              </p>
            </CollapsibleContent>
          </div>
        </Collapsible>
      )}

      {isLoggedIn && (
        <div className="pt-4 border-t border-border/30">
          <h4 className="text-sm font-medium text-foreground/80 mb-3">Custom Angel Image</h4>
          
          {customImageUrl ? (
            <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 border-2 border-primary">
              {/* Custom image preview */}
              <div 
                className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center"
                style={{
                  background: `radial-gradient(circle, ${currentColorConfig.glowColor} 0%, transparent 70%)`,
                }}
              >
                <img 
                  src={customImageUrl} 
                  alt="Custom angel" 
                  className="w-12 h-12 object-contain"
                />
              </div>
              
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Custom Image Active</p>
                <p className="text-xs text-muted-foreground">Your custom angel is following your cursor</p>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={onCustomImageRemove}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-xl",
                "border-2 border-dashed border-border/50",
                "hover:border-primary/50 hover:bg-primary/5",
                "transition-all duration-200",
                isUploading && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="p-3 rounded-full bg-muted/50">
                {isUploading ? (
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">
                  {isUploading ? 'Uploading...' : 'Upload Custom Image'}
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG only, max 2MB, transparent background recommended
                </p>
              </div>
            </button>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png"
            onChange={handleFileChange}
            className="hidden"
          />
          
          <p className="text-xs text-muted-foreground mt-2 flex items-start gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>For best results, use a PNG image with transparent background, sized around 48-64px.</span>
          </p>
        </div>
      )}

      {/* Color selection */}
      <div className="pt-4 border-t border-border/30">
        <h4 className="text-sm font-medium text-foreground/80 mb-3">Angel Glow Color</h4>
        <div className="flex flex-wrap gap-3">
          {ANGEL_COLORS.map((color) => {
            const isSelected = currentColor === color.id;
            
            return (
              <button
                key={color.id}
                onClick={() => onColorChange(color.id)}
                className={cn(
                  "group relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 min-w-[72px]",
                  isSelected 
                    ? "border-primary bg-primary/5 shadow-md" 
                    : "border-border/30 hover:border-primary/40 hover:bg-accent/30"
                )}
                title={color.name}
              >
                {/* Color swatch with glow effect */}
                <div 
                  className={cn(
                    "w-10 h-10 rounded-full transition-all duration-300 relative",
                    isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  )}
                  style={{
                    background: `radial-gradient(circle at 30% 30%, hsl(${color.hsl}) 0%, hsl(${color.hsl} / 0.7) 60%, hsl(${color.hsl} / 0.4) 100%)`,
                    boxShadow: isSelected 
                      ? `0 0 20px ${color.glowColor}, 0 0 40px ${color.glowColor}`
                      : `0 0 10px ${color.glowColor}`,
                  }}
                >
                  {/* Selection check */}
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check className="w-4 h-4 text-foreground drop-shadow-md" />
                    </div>
                  )}
                </div>
                
                {/* Color name */}
                <span className={cn(
                  "text-xs text-center transition-colors",
                  isSelected ? "text-foreground font-medium" : "text-muted-foreground"
                )}>
                  {color.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Effect toggles */}
      <div className="space-y-3 pt-4 border-t border-border/30">
        <h4 className="text-sm font-medium text-foreground/80">Effects</h4>
        
        {/* Sparkles toggle */}
        <label className="flex items-center justify-between cursor-pointer group">
          <div>
            <span className="text-sm text-foreground">Sparkle Particles</span>
            <p className="text-xs text-muted-foreground">Gentle sparkles around the angel</p>
          </div>
          <button
            role="switch"
            aria-checked={sparklesEnabled}
            onClick={() => onSparklesChange(!sparklesEnabled)}
            className={cn(
              "relative w-11 h-6 rounded-full transition-colors duration-200",
              sparklesEnabled ? "bg-primary" : "bg-muted"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200",
                sparklesEnabled ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        </label>
        
        {/* Trail toggle */}
        <label className="flex items-center justify-between cursor-pointer group">
          <div>
            <span className="text-sm text-foreground">Light Trail</span>
            <p className="text-xs text-muted-foreground">Soft trail following movement</p>
          </div>
          <button
            role="switch"
            aria-checked={trailEnabled}
            onClick={() => onTrailChange(!trailEnabled)}
            className={cn(
              "relative w-11 h-6 rounded-full transition-colors duration-200",
              trailEnabled ? "bg-primary" : "bg-muted"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200",
                trailEnabled ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        </label>
      </div>
    </div>
  );
});

AngelStyleGallery.displayName = 'AngelStyleGallery';

export default AngelStyleGallery;
