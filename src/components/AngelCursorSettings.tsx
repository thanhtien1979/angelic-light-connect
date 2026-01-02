import { motion } from "framer-motion";
import { Check, Sparkles, Maximize, Minimize } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAngelCursorPreference, AngelCursorColor, AngelCursorSize } from "@/hooks/useAngelCursorPreference";
import { cn } from "@/lib/utils";

const colorOptions: { value: AngelCursorColor; label: string; color: string; glow: string }[] = [
  { 
    value: 'pink', 
    label: 'Hồng', 
    color: 'bg-pink-300',
    glow: 'shadow-[0_0_15px_rgba(255,182,193,0.8)]'
  },
  { 
    value: 'gold', 
    label: 'Vàng', 
    color: 'bg-yellow-400',
    glow: 'shadow-[0_0_15px_rgba(255,215,0,0.8)]'
  },
  { 
    value: 'white', 
    label: 'Trắng', 
    color: 'bg-white',
    glow: 'shadow-[0_0_15px_rgba(255,255,255,0.9)]'
  },
  { 
    value: 'purple', 
    label: 'Tím', 
    color: 'bg-purple-300',
    glow: 'shadow-[0_0_15px_rgba(221,160,221,0.8)]'
  },
];

const sizeOptions: { value: AngelCursorSize; label: string; icon: typeof Minimize }[] = [
  { value: 'small', label: 'Nhỏ', icon: Minimize },
  { value: 'medium', label: 'Vừa', icon: Sparkles },
  { value: 'large', label: 'Lớn', icon: Maximize },
];

const AngelCursorSettings = () => {
  const { cursorColor, setCursorColor, cursorSize, setCursorSize, isEnabled, setIsEnabled, isLoading } = useAngelCursorPreference();

  return (
    <div className="space-y-4">
      {/* Toggle Enable/Disable */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-pink-500/20">
            <Sparkles className="w-4 h-4 text-pink-400" />
          </div>
          <div>
            <Label className="text-sm font-medium text-foreground">
              Thiên Thần Cursor
            </Label>
            <p className="text-xs text-muted-foreground">
              Thiên thần bay theo chuột của bạn
            </p>
          </div>
        </div>
        <Switch
          checked={isEnabled}
          onCheckedChange={setIsEnabled}
          disabled={isLoading}
        />
      </div>

      {/* Color Selection */}
      <div className={cn(
        "space-y-3 transition-opacity duration-300",
        !isEnabled && "opacity-50 pointer-events-none"
      )}>
        <Label className="text-xs text-muted-foreground pl-11">Màu thiên thần</Label>
        <div className="flex gap-3 pl-11">
          {colorOptions.map((option) => (
            <motion.button
              key={option.value}
              onClick={() => setCursorColor(option.value)}
              disabled={isLoading || !isEnabled}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "relative flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all",
                "border-2",
                cursorColor === option.value 
                  ? "border-primary bg-primary/10" 
                  : "border-transparent hover:border-border/50 hover:bg-card/50"
              )}
            >
              <div 
                className={cn(
                  "w-8 h-8 rounded-full transition-all",
                  option.color,
                  cursorColor === option.value && option.glow,
                  "flex items-center justify-center"
                )}
              >
                {cursorColor === option.value && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  >
                    <Check className="w-4 h-4 text-foreground/80" />
                  </motion.div>
                )}
              </div>
              <span className={cn(
                "text-xs transition-colors",
                cursorColor === option.value ? "text-foreground font-medium" : "text-muted-foreground"
              )}>
                {option.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Size Selection */}
      <div className={cn(
        "space-y-3 transition-opacity duration-300",
        !isEnabled && "opacity-50 pointer-events-none"
      )}>
        <Label className="text-xs text-muted-foreground pl-11">Kích thước</Label>
        <div className="flex gap-2 pl-11">
          {sizeOptions.map((option) => {
            const Icon = option.icon;
            return (
              <motion.button
                key={option.value}
                onClick={() => setCursorSize(option.value)}
                disabled={isLoading || !isEnabled}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg transition-all",
                  "border",
                  cursorSize === option.value 
                    ? "border-primary bg-primary/10 text-foreground" 
                    : "border-border/50 hover:border-border hover:bg-card/50 text-muted-foreground"
                )}
              >
                <Icon className={cn(
                  "w-4 h-4",
                  option.value === 'small' && "w-3 h-3",
                  option.value === 'large' && "w-5 h-5"
                )} />
                <span className="text-xs font-medium">{option.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AngelCursorSettings;
