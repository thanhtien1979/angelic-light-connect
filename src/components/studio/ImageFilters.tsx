import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface ImageFiltersProps {
  imageUrl: string;
  onApply: (canvas: HTMLCanvasElement) => void;
  onCancel: () => void;
}

interface FilterSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  filter: string;
}

const presetFilters = [
  { id: "none", name: "Gốc", filter: "none", emoji: "📷" },
  { id: "vintage", name: "Vintage", filter: "sepia(0.4) contrast(1.1) brightness(0.9)", emoji: "🎞️" },
  { id: "noir", name: "Noir", filter: "grayscale(1) contrast(1.3)", emoji: "🎬" },
  { id: "vivid", name: "Rực Rỡ", filter: "saturate(1.5) contrast(1.1)", emoji: "🌈" },
  { id: "warm", name: "Ấm Áp", filter: "sepia(0.2) saturate(1.3) brightness(1.05)", emoji: "☀️" },
  { id: "cool", name: "Mát Lạnh", filter: "saturate(0.8) hue-rotate(180deg) brightness(1.05)", emoji: "❄️" },
  { id: "dreamy", name: "Mơ Màng", filter: "contrast(0.9) brightness(1.1) saturate(1.2) blur(0.5px)", emoji: "☁️" },
  { id: "dramatic", name: "Ấn Tượng", filter: "contrast(1.4) brightness(0.95) saturate(0.9)", emoji: "🎭" },
  { id: "ethereal", name: "Thiên Thần", filter: "brightness(1.15) contrast(0.95) saturate(0.85) sepia(0.1)", emoji: "👼" },
  { id: "sunset", name: "Hoàng Hôn", filter: "sepia(0.3) saturate(1.4) hue-rotate(-10deg)", emoji: "🌅" },
  { id: "moonlight", name: "Ánh Trăng", filter: "brightness(0.9) contrast(1.1) saturate(0.7) sepia(0.15)", emoji: "🌙" },
  { id: "golden", name: "Vàng Ánh", filter: "sepia(0.4) saturate(1.3) brightness(1.1)", emoji: "✨" }
];

const defaultSettings: FilterSettings = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
  filter: "none"
};

export default function ImageFilters({ imageUrl, onApply, onCancel }: ImageFiltersProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [settings, setSettings] = useState<FilterSettings>(defaultSettings);
  const [selectedPreset, setSelectedPreset] = useState<string>("none");
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
      drawCanvas();
    };
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    if (imageLoaded) {
      drawCanvas();
    }
  }, [settings, imageLoaded]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = imageRef.current;
    
    if (!canvas || !ctx || !img) return;

    canvas.width = img.width;
    canvas.height = img.height;
    
    // Build filter string
    let filterString = settings.filter === "none" ? "" : settings.filter;
    const adjustments = [];
    
    if (settings.brightness !== 100) {
      adjustments.push(`brightness(${settings.brightness / 100})`);
    }
    if (settings.contrast !== 100) {
      adjustments.push(`contrast(${settings.contrast / 100})`);
    }
    if (settings.saturation !== 100) {
      adjustments.push(`saturate(${settings.saturation / 100})`);
    }
    if (settings.blur > 0) {
      adjustments.push(`blur(${settings.blur}px)`);
    }

    if (adjustments.length > 0) {
      filterString = filterString 
        ? `${filterString} ${adjustments.join(" ")}`
        : adjustments.join(" ");
    }

    ctx.filter = filterString || "none";
    ctx.drawImage(img, 0, 0);
    ctx.filter = "none";
  };

  const applyPreset = (presetId: string) => {
    const preset = presetFilters.find(p => p.id === presetId);
    if (preset) {
      setSelectedPreset(presetId);
      setSettings(prev => ({ 
        ...prev, 
        filter: preset.filter,
        brightness: 100,
        contrast: 100,
        saturation: 100,
        blur: 0
      }));
    }
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    setSelectedPreset("none");
  };

  const handleApply = () => {
    if (canvasRef.current) {
      onApply(canvasRef.current);
    }
  };

  return (
    <div className="space-y-4">
      {/* Canvas Preview */}
      <div className="relative border rounded-lg overflow-hidden bg-muted/20">
        <canvas
          ref={canvasRef}
          className="w-full h-auto"
        />
      </div>

      {/* Preset Filters */}
      <div className="space-y-2">
        <span className="text-sm font-medium">Bộ lọc có sẵn</span>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {presetFilters.map(preset => (
            <motion.button
              key={preset.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => applyPreset(preset.id)}
              className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                selectedPreset === preset.id
                  ? "bg-primary/20 ring-2 ring-primary"
                  : "bg-muted/30 hover:bg-muted/50"
              }`}
            >
              <span className="text-xl mb-1">{preset.emoji}</span>
              <span className="text-xs">{preset.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Manual Adjustments */}
      <div className="space-y-4 bg-muted/20 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Điều chỉnh thủ công</span>
          <Button size="sm" variant="ghost" onClick={resetSettings}>
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Độ sáng</span>
              <span className="text-muted-foreground">{settings.brightness}%</span>
            </div>
            <Slider
              value={[settings.brightness]}
              onValueChange={([value]) => setSettings(prev => ({ ...prev, brightness: value }))}
              min={50}
              max={150}
              step={5}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Độ tương phản</span>
              <span className="text-muted-foreground">{settings.contrast}%</span>
            </div>
            <Slider
              value={[settings.contrast]}
              onValueChange={([value]) => setSettings(prev => ({ ...prev, contrast: value }))}
              min={50}
              max={150}
              step={5}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Độ bão hòa</span>
              <span className="text-muted-foreground">{settings.saturation}%</span>
            </div>
            <Slider
              value={[settings.saturation]}
              onValueChange={([value]) => setSettings(prev => ({ ...prev, saturation: value }))}
              min={0}
              max={200}
              step={5}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Làm mờ</span>
              <span className="text-muted-foreground">{settings.blur}px</span>
            </div>
            <Slider
              value={[settings.blur]}
              onValueChange={([value]) => setSettings(prev => ({ ...prev, blur: value }))}
              min={0}
              max={10}
              step={0.5}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Hủy
        </Button>
        <Button onClick={handleApply} className="flex-1 bg-gradient-to-r from-primary to-rose-soft">
          <Sparkles className="w-4 h-4 mr-2" />
          Áp dụng
        </Button>
      </div>
    </div>
  );
}
