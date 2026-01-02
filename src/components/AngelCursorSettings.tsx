import { useRef } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, Maximize, Minimize, Upload, Trash2, Video } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useAngelCursorPreference, AngelCursorColor, AngelCursorSize } from "@/hooks/useAngelCursorPreference";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

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
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { 
    cursorColor, 
    setCursorColor, 
    cursorSize, 
    setCursorSize, 
    isEnabled, 
    setIsEnabled,
    customVideoUrl,
    uploadCustomVideo,
    removeCustomVideo,
    isLoading,
    isUploading
  } = useAngelCursorPreference();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadCustomVideo(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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

      {/* Custom Video Upload */}
      {user && (
        <div className={cn(
          "space-y-3 transition-opacity duration-300",
          !isEnabled && "opacity-50 pointer-events-none"
        )}>
          <Label className="text-xs text-muted-foreground pl-11">Video thiên thần tùy chỉnh</Label>
          <div className="pl-11 space-y-2">
            {customVideoUrl ? (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border/50">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-black/20">
                  <video 
                    src={customVideoUrl} 
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={{ mixBlendMode: 'multiply' }}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-foreground font-medium">Video tùy chỉnh</p>
                  <p className="text-xs text-muted-foreground">Đang sử dụng</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={removeCustomVideo}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <motion.button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || !isEnabled}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg",
                  "border-2 border-dashed border-border/50",
                  "hover:border-primary/50 hover:bg-primary/5",
                  "transition-all duration-200",
                  isUploading && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="p-2 rounded-full bg-primary/10">
                  {isUploading ? (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div className="text-left">
                  <p className="text-xs font-medium text-foreground">
                    {isUploading ? "Đang tải lên..." : "Tải lên video thiên thần"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Video MP4, WebM (tối đa 10MB)
                  </p>
                </div>
              </motion.button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
      )}

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
