import { memo, useMemo } from 'react';
import { Check, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ANGEL_PRESETS, detectCurrentPreset, type AngelPreset } from './presets';
import type { AngelStyle, AngelColor } from './types';
import { AngelSVGMap } from './AngelSVGs';

interface PresetThemeSelectorProps {
  currentStyle: AngelStyle;
  currentColor: AngelColor;
  sparklesEnabled: boolean;
  trailEnabled: boolean;
  onApplyPreset: (preset: AngelPreset) => void;
}

const PresetThemeSelector = memo(({
  currentStyle,
  currentColor,
  sparklesEnabled,
  trailEnabled,
  onApplyPreset,
}: PresetThemeSelectorProps) => {
  const activePresetId = useMemo(
    () => detectCurrentPreset(currentStyle, currentColor, sparklesEnabled, trailEnabled),
    [currentStyle, currentColor, sparklesEnabled, trailEnabled]
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Wand2 className="w-4 h-4 text-muted-foreground" />
        <h4 className="text-sm font-medium text-foreground/80">Theme Presets</h4>
        {activePresetId === null && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground">
            Custom
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {ANGEL_PRESETS.map((preset) => {
          const isActive = activePresetId === preset.id;
          const AngelSVG = AngelSVGMap[preset.style] || AngelSVGMap['classic'];
          
          return (
            <button
              key={preset.id}
              onClick={() => onApplyPreset(preset)}
              className={cn(
                "relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200",
                isActive 
                  ? "border-primary bg-primary/10 shadow-lg" 
                  : "border-border/50 hover:border-primary/50 hover:bg-accent/30"
              )}
            >
              {/* Selection indicator */}
              {isActive && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
              
              {/* Angel mini preview with preset glow */}
              <div 
                className="w-12 h-12 flex items-center justify-center mb-2 rounded-full transition-all duration-300"
                style={{
                  background: `radial-gradient(circle, ${preset.previewGlow} 0%, transparent 70%)`,
                  boxShadow: isActive ? `0 0 20px ${preset.previewGlow}` : undefined,
                }}
              >
                <div className="scale-75">
                  <AngelSVG />
                </div>
              </div>
              
              {/* Preset info */}
              <span className={cn(
                "text-sm font-medium",
                isActive ? "text-primary" : "text-foreground"
              )}>
                {preset.name}
              </span>
              <span className="text-xs text-muted-foreground text-center mt-1 line-clamp-2">
                {preset.description}
              </span>
              
              {/* Effect indicators */}
              <div className="flex gap-1.5 mt-2">
                {preset.sparklesEnabled && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted/50 text-muted-foreground">
                    ✨ sparkles
                  </span>
                )}
                {preset.trailEnabled && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted/50 text-muted-foreground">
                    ✧ trail
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
});

PresetThemeSelector.displayName = 'PresetThemeSelector';

export default PresetThemeSelector;
