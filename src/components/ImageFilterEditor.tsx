import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { X, Check, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface ImageFilterEditorProps {
  imageUrl: string;
  onSave: (editedImageUrl: string) => void;
  onCancel: () => void;
}

interface FilterPreset {
  id: string;
  name: string;
  filter: string;
  icon?: string;
}

const FILTER_PRESETS: FilterPreset[] = [
  { id: "normal", name: "Gốc", filter: "none" },
  { id: "clarendon", name: "Clarendon", filter: "contrast(1.2) saturate(1.35)" },
  { id: "gingham", name: "Gingham", filter: "brightness(1.05) hue-rotate(-10deg)" },
  { id: "moon", name: "Moon", filter: "grayscale(1) contrast(1.1) brightness(1.1)" },
  { id: "lark", name: "Lark", filter: "contrast(0.9) saturate(1.15) brightness(1.15)" },
  { id: "reyes", name: "Reyes", filter: "sepia(0.22) brightness(1.1) contrast(0.85) saturate(0.75)" },
  { id: "juno", name: "Juno", filter: "sepia(0.1) saturate(1.5) contrast(1.15)" },
  { id: "slumber", name: "Slumber", filter: "saturate(0.66) brightness(1.05) sepia(0.1)" },
  { id: "crema", name: "Crema", filter: "sepia(0.15) saturate(0.9) contrast(0.95)" },
  { id: "ludwig", name: "Ludwig", filter: "saturate(0.85) brightness(1.05) contrast(1.1)" },
  { id: "aden", name: "Aden", filter: "hue-rotate(-20deg) contrast(0.9) saturate(0.85) brightness(1.2)" },
  { id: "perpetua", name: "Perpetua", filter: "contrast(1.1) saturate(1.1) brightness(1.05)" },
  { id: "amaro", name: "Amaro", filter: "brightness(1.1) saturate(1.3) hue-rotate(-5deg)" },
  { id: "mayfair", name: "Mayfair", filter: "contrast(1.1) saturate(1.1) sepia(0.1)" },
  { id: "rise", name: "Rise", filter: "brightness(1.05) sepia(0.15) saturate(0.9) contrast(0.9)" },
  { id: "hudson", name: "Hudson", filter: "brightness(1.2) contrast(0.9) saturate(1.1)" },
  { id: "valencia", name: "Valencia", filter: "sepia(0.2) saturate(1.3) contrast(1.1) brightness(1.1)" },
  { id: "xpro2", name: "X-Pro II", filter: "sepia(0.25) contrast(1.3) saturate(1.2)" },
  { id: "lo-fi", name: "Lo-Fi", filter: "saturate(1.1) contrast(1.5)" },
  { id: "inkwell", name: "Inkwell", filter: "grayscale(1) brightness(1.1) contrast(1.2)" },
  { id: "hefe", name: "Hefe", filter: "saturate(1.4) contrast(1.1) brightness(1.05)" },
  { id: "nashville", name: "Nashville", filter: "sepia(0.25) contrast(1.15) brightness(1.05) saturate(1.2)" },
  { id: "stinson", name: "Stinson", filter: "contrast(0.75) saturate(0.85) brightness(1.15)" },
  { id: "vesper", name: "Vesper", filter: "sepia(0.35) saturate(1.2) contrast(1.15) brightness(1.05)" },
  { id: "earlybird", name: "Earlybird", filter: "sepia(0.25) contrast(1.15) saturate(0.9)" },
  { id: "brannan", name: "Brannan", filter: "sepia(0.4) contrast(1.25) saturate(0.7)" },
  { id: "sutro", name: "Sutro", filter: "sepia(0.4) contrast(1.2) saturate(0.9) brightness(0.9)" },
  { id: "toaster", name: "Toaster", filter: "sepia(0.25) contrast(1.3) brightness(0.95) saturate(1.3)" },
  { id: "walden", name: "Walden", filter: "sepia(0.35) saturate(1.6) hue-rotate(-10deg) brightness(1.1)" },
  { id: "1977", name: "1977", filter: "sepia(0.5) hue-rotate(-30deg) saturate(1.4) contrast(0.8)" },
  { id: "kelvin", name: "Kelvin", filter: "sepia(0.15) saturate(1.5) contrast(1.2) brightness(1.1)" },
  { id: "maven", name: "Maven", filter: "sepia(0.25) brightness(0.95) contrast(0.95) saturate(1.5)" },
  { id: "ginza", name: "Ginza", filter: "sepia(0.1) brightness(1.1) contrast(1.1) saturate(1.1)" },
  { id: "skyline", name: "Skyline", filter: "saturate(1.2) contrast(1.2) brightness(1.05)" },
  { id: "dogpatch", name: "Dogpatch", filter: "contrast(1.15) saturate(1.05) brightness(1.1)" },
  { id: "brooklyn", name: "Brooklyn", filter: "contrast(0.9) brightness(1.1) sepia(0.05)" },
  { id: "helena", name: "Helena", filter: "sepia(0.15) saturate(1.25) contrast(1.05)" },
  { id: "ashby", name: "Ashby", filter: "sepia(0.3) saturate(1.1) contrast(1.1) brightness(1.05)" },
  { id: "charmes", name: "Charmes", filter: "sepia(0.25) saturate(1.35) contrast(1.1)" },
];

const ImageFilterEditor = ({ imageUrl, onSave, onCancel }: ImageFilterEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("normal");
  const [intensity, setIntensity] = useState(100);
  
  // Manual adjustments
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [temperature, setTemperature] = useState(0);
  const [vignette, setVignette] = useState(0);
  const [showManualAdjust, setShowManualAdjust] = useState(false);

  // Load image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageRef.current = img;
      setIsLoaded(true);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Draw canvas with filters
  useEffect(() => {
    if (!isLoaded) return;
    drawCanvas();
  }, [isLoaded, selectedFilter, intensity, brightness, contrast, saturation, temperature, vignette]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const maxSize = 600;
    const scale = Math.min(maxSize / img.width, maxSize / img.height);
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Build filter string
    const preset = FILTER_PRESETS.find(f => f.id === selectedFilter);
    let filterString = "";
    
    // Add preset filter with intensity
    if (preset && preset.filter !== "none") {
      // Parse and scale filter values by intensity
      const intensityScale = intensity / 100;
      filterString = preset.filter.replace(/(\d+\.?\d*)/g, (match) => {
        const val = parseFloat(match);
        if (val > 1) {
          // Values like 1.2, 1.5 - scale the difference from 1
          return String(1 + (val - 1) * intensityScale);
        } else {
          // Values like 0.5, 0.9 - scale as is
          return String(val * intensityScale);
        }
      });
    }
    
    // Add manual adjustments
    const manualFilters = [];
    if (brightness !== 100) manualFilters.push(`brightness(${brightness}%)`);
    if (contrast !== 100) manualFilters.push(`contrast(${contrast}%)`);
    if (saturation !== 100) manualFilters.push(`saturate(${saturation}%)`);
    if (temperature !== 0) manualFilters.push(`sepia(${Math.abs(temperature)}%)`);
    
    if (filterString && manualFilters.length > 0) {
      ctx.filter = `${filterString} ${manualFilters.join(" ")}`;
    } else if (filterString) {
      ctx.filter = filterString;
    } else if (manualFilters.length > 0) {
      ctx.filter = manualFilters.join(" ");
    } else {
      ctx.filter = "none";
    }

    // Draw image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Apply vignette effect
    if (vignette > 0) {
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height) / 2
      );
      gradient.addColorStop(0.5, "rgba(0,0,0,0)");
      gradient.addColorStop(1, `rgba(0,0,0,${vignette / 100})`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [selectedFilter, intensity, brightness, contrast, saturation, temperature, vignette, isLoaded]);

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        onSave(url);
      }
    }, "image/jpeg", 0.92);
  };

  const resetAll = () => {
    setSelectedFilter("normal");
    setIntensity(100);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setTemperature(0);
    setVignette(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-4xl bg-card rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold" />
            <h3 className="font-medium text-foreground">Bộ lọc màu</h3>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={resetAll}>
              <RotateCcw className="w-4 h-4 mr-1" />
              Đặt lại
            </Button>
            <button onClick={onCancel} className="p-1.5 rounded-full hover:bg-muted">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col lg:flex-row">
            {/* Canvas Preview */}
            <div className="flex-1 flex items-center justify-center bg-black/50 p-4 min-h-[300px]">
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-[400px] rounded-lg"
              />
              {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Adjustment Panel */}
            {showManualAdjust && (
              <div className="w-full lg:w-72 p-4 border-t lg:border-t-0 lg:border-l border-border space-y-4">
                <h4 className="font-medium text-sm text-foreground">Điều chỉnh thủ công</h4>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Độ sáng</span>
                      <span className="text-foreground">{brightness}%</span>
                    </div>
                    <Slider
                      value={[brightness]}
                      onValueChange={([v]) => setBrightness(v)}
                      min={50}
                      max={150}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Độ tương phản</span>
                      <span className="text-foreground">{contrast}%</span>
                    </div>
                    <Slider
                      value={[contrast]}
                      onValueChange={([v]) => setContrast(v)}
                      min={50}
                      max={150}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Độ bão hòa</span>
                      <span className="text-foreground">{saturation}%</span>
                    </div>
                    <Slider
                      value={[saturation]}
                      onValueChange={([v]) => setSaturation(v)}
                      min={0}
                      max={200}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Viền tối</span>
                      <span className="text-foreground">{vignette}%</span>
                    </div>
                    <Slider
                      value={[vignette]}
                      onValueChange={([v]) => setVignette(v)}
                      min={0}
                      max={100}
                      step={1}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Filter Presets */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-foreground">Bộ lọc có sẵn</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowManualAdjust(!showManualAdjust)}
              >
                {showManualAdjust ? "Ẩn" : "Điều chỉnh thủ công"}
              </Button>
            </div>
            
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {FILTER_PRESETS.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={cn(
                    "flex-shrink-0 text-center transition-all",
                    selectedFilter === filter.id ? "scale-105" : "opacity-70 hover:opacity-100"
                  )}
                >
                  <div
                    className={cn(
                      "w-16 h-16 rounded-lg overflow-hidden border-2 mb-1",
                      selectedFilter === filter.id ? "border-gold" : "border-transparent"
                    )}
                  >
                    <img
                      src={imageUrl}
                      alt={filter.name}
                      className="w-full h-full object-cover"
                      style={{ filter: filter.filter }}
                    />
                  </div>
                  <span className={cn(
                    "text-xs",
                    selectedFilter === filter.id ? "text-gold font-medium" : "text-muted-foreground"
                  )}>
                    {filter.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Intensity slider */}
            {selectedFilter !== "normal" && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Cường độ bộ lọc</span>
                  <span className="text-foreground">{intensity}%</span>
                </div>
                <Slider
                  value={[intensity]}
                  onValueChange={([v]) => setIntensity(v)}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-border flex-shrink-0">
          <Button variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button onClick={handleSave} className="bg-gold text-black hover:bg-gold/90">
            <Check className="w-4 h-4 mr-1" />
            Áp dụng
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ImageFilterEditor;
