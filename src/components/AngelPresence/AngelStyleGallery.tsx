import { memo } from 'react';
import { Check, Eye } from 'lucide-react';
import { ANGEL_STYLES, ANGEL_COLORS, type AngelStyle, type AngelColor } from './types';
import { AngelSVGMap } from './AngelSVGs';
import { cn } from '@/lib/utils';
import AngelPresence from './index';

/**
 * AngelStyleGallery - Allows users to choose between angel designs and colors
 * Includes live preview that reflects current settings
 */

interface AngelStyleGalleryProps {
  currentStyle: AngelStyle;
  onStyleChange: (style: AngelStyle) => void;
  currentColor: AngelColor;
  onColorChange: (color: AngelColor) => void;
  sparklesEnabled: boolean;
  onSparklesChange: (enabled: boolean) => void;
  trailEnabled: boolean;
  onTrailChange: (enabled: boolean) => void;
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
}: AngelStyleGalleryProps) => {
  // Get current color config for glow preview
  const currentColorConfig = ANGEL_COLORS.find(c => c.id === currentColor) || ANGEL_COLORS[0];
  
  return (
    <div className="space-y-6">
      {/* Live Preview Section */}
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="w-4 h-4 text-muted-foreground" />
          <h4 className="text-sm font-medium text-foreground/80">Live Preview</h4>
        </div>
        <div 
          className="rounded-2xl border border-border/30 bg-gradient-to-b from-background/50 to-muted/20 p-2"
          style={{
            boxShadow: `0 0 30px ${currentColorConfig.glowColor.replace('0.6', '0.15')}`,
          }}
        >
          <AngelPresence
            enabled={true}
            style={currentStyle}
            color={currentColor}
            sparklesEnabled={sparklesEnabled}
            trailEnabled={trailEnabled}
            previewMode={true}
            previewSize={140}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Your angel companion as it appears on site
        </p>
      </div>

      {/* Style selection */}
      <div className="pt-4 border-t border-border/30">
        <h4 className="text-sm font-medium text-foreground/80 mb-3">Angel Style</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {ANGEL_STYLES.map((style) => {
            const AngelSVG = AngelSVGMap[style.id];
            const isSelected = currentStyle === style.id;
            
            return (
              <button
                key={style.id}
                onClick={() => onStyleChange(style.id)}
                className={cn(
                  "relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200",
                  isSelected 
                    ? "border-primary bg-primary/10 shadow-lg" 
                    : "border-border/50 hover:border-primary/50 hover:bg-accent/50"
                )}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
                
                {/* Angel preview with current color glow */}
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
                
                {/* Style info */}
                <span className="text-sm font-medium text-foreground">{style.name}</span>
                <span className="text-xs text-muted-foreground text-center mt-1 line-clamp-2">
                  {style.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Color selection */}
      <div className="pt-2 border-t border-border/50">
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
      <div className="space-y-3 pt-2 border-t border-border/50">
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
