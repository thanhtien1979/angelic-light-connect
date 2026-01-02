import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useAngelCursorPreference, AngelCursorColor } from "@/hooks/useAngelCursorPreference";
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

const AngelCursorSettings = () => {
  const { cursorColor, setCursorColor, isLoading } = useAngelCursorPreference();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-pink-500/20">
          <Sparkles className="w-4 h-4 text-pink-400" />
        </div>
        <div>
          <Label className="text-sm font-medium text-foreground">
            Màu Thiên Thần Cursor
          </Label>
          <p className="text-xs text-muted-foreground">
            Chọn màu thiên thần bay theo chuột
          </p>
        </div>
      </div>

      <div className="flex gap-3 pl-11">
        {colorOptions.map((option) => (
          <motion.button
            key={option.value}
            onClick={() => setCursorColor(option.value)}
            disabled={isLoading}
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
  );
};

export default AngelCursorSettings;
