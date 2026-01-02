import { memo } from 'react';
import { Check } from 'lucide-react';
import { ANGEL_STYLES, type AngelStyle } from './types';
import { AngelSVGMap } from './AngelSVGs';

/**
 * AngelStyleGallery - Allows users to choose between angel designs
 */

interface AngelStyleGalleryProps {
  currentStyle: AngelStyle;
  onStyleChange: (style: AngelStyle) => void;
  sparklesEnabled: boolean;
  onSparklesChange: (enabled: boolean) => void;
  trailEnabled: boolean;
  onTrailChange: (enabled: boolean) => void;
}

const AngelStyleGallery = memo(({
  currentStyle,
  onStyleChange,
  sparklesEnabled,
  onSparklesChange,
  trailEnabled,
  onTrailChange,
}: AngelStyleGalleryProps) => {
  return (
    <div className="space-y-4">
      {/* Style selection */}
      <div>
        <h4 className="text-sm font-medium text-foreground/80 mb-3">Angel Style</h4>
        <div className="grid grid-cols-2 gap-3">
          {ANGEL_STYLES.map((style) => {
            const AngelSVG = AngelSVGMap[style.id];
            const isSelected = currentStyle === style.id;
            
            return (
              <button
                key={style.id}
                onClick={() => onStyleChange(style.id)}
                className={`
                  relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200
                  ${isSelected 
                    ? 'border-primary bg-primary/10 shadow-lg' 
                    : 'border-border/50 hover:border-primary/50 hover:bg-accent/50'
                  }
                `}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
                
                {/* Angel preview */}
                <div 
                  className="w-14 h-14 flex items-center justify-center mb-2 rounded-full"
                  style={{
                    background: `radial-gradient(circle, ${style.glowColor} 0%, transparent 70%)`,
                  }}
                >
                  <div style={{ transform: `scale(${style.scale})` }}>
                    <AngelSVG />
                  </div>
                </div>
                
                {/* Style info */}
                <span className="text-sm font-medium text-foreground">{style.name}</span>
                <span className="text-xs text-muted-foreground text-center mt-1">
                  {style.description}
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
            className={`
              relative w-11 h-6 rounded-full transition-colors duration-200
              ${sparklesEnabled ? 'bg-primary' : 'bg-muted'}
            `}
          >
            <span
              className={`
                absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md
                transition-transform duration-200
                ${sparklesEnabled ? 'translate-x-5' : 'translate-x-0'}
              `}
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
            className={`
              relative w-11 h-6 rounded-full transition-colors duration-200
              ${trailEnabled ? 'bg-primary' : 'bg-muted'}
            `}
          >
            <span
              className={`
                absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md
                transition-transform duration-200
                ${trailEnabled ? 'translate-x-5' : 'translate-x-0'}
              `}
            />
          </button>
        </label>
      </div>
    </div>
  );
});

AngelStyleGallery.displayName = 'AngelStyleGallery';

export default AngelStyleGallery;
