import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Type, 
  Bold, 
  Italic, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Palette,
  Sparkles,
  RotateCcw,
  Move
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";

interface TextOverlayProps {
  imageUrl: string;
  onApply: (canvas: HTMLCanvasElement) => void;
  onCancel: () => void;
}

interface TextLayer {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  align: "left" | "center" | "right";
  bold: boolean;
  italic: boolean;
  effect: "none" | "glow" | "shadow" | "gradient" | "outline";
}

const fonts = [
  { value: "Playfair Display", label: "Playfair Display" },
  { value: "Dancing Script", label: "Dancing Script" },
  { value: "Pacifico", label: "Pacifico" },
  { value: "Great Vibes", label: "Great Vibes" },
  { value: "Lobster", label: "Lobster" },
  { value: "Raleway", label: "Raleway" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Open Sans", label: "Open Sans" },
];

const colors = [
  "#FFFFFF", "#000000", "#FFD700", "#FF6B6B", "#4ECDC4",
  "#A855F7", "#F472B6", "#60A5FA", "#34D399", "#FBBF24"
];

const mantras = [
  "Thiên Thần Luôn Bên Bạn",
  "Ánh Sáng Dẫn Lối",
  "Bình An Trong Tâm",
  "Yêu Thương Vô Điều Kiện",
  "Ơn Trời Ban Phước",
  "Hạnh Phúc Là Lựa Chọn",
];

export default function TextOverlay({ imageUrl, onApply, onCancel }: TextOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [textLayers, setTextLayers] = useState<TextLayer[]>([{
    id: "1",
    text: "",
    x: 50,
    y: 50,
    fontSize: 32,
    fontFamily: "Playfair Display",
    color: "#FFFFFF",
    align: "center",
    bold: false,
    italic: false,
    effect: "shadow"
  }]);
  const [activeLayerId, setActiveLayerId] = useState("1");
  const [isDragging, setIsDragging] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const activeLayer = textLayers.find(l => l.id === activeLayerId);

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
  }, [textLayers, imageLoaded]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = imageRef.current;
    
    if (!canvas || !ctx || !img) return;

    canvas.width = img.width;
    canvas.height = img.height;
    
    ctx.drawImage(img, 0, 0);

    textLayers.forEach(layer => {
      if (!layer.text) return;

      const fontStyle = `${layer.italic ? "italic" : ""} ${layer.bold ? "bold" : ""} ${layer.fontSize}px "${layer.fontFamily}"`;
      ctx.font = fontStyle;
      ctx.textAlign = layer.align;

      const x = (layer.x / 100) * canvas.width;
      const y = (layer.y / 100) * canvas.height;

      // Apply effects
      switch (layer.effect) {
        case "glow":
          ctx.shadowColor = layer.color;
          ctx.shadowBlur = 20;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          ctx.fillStyle = layer.color;
          ctx.fillText(layer.text, x, y);
          ctx.fillText(layer.text, x, y);
          break;
        case "shadow":
          ctx.shadowColor = "rgba(0,0,0,0.7)";
          ctx.shadowBlur = 10;
          ctx.shadowOffsetX = 4;
          ctx.shadowOffsetY = 4;
          ctx.fillStyle = layer.color;
          ctx.fillText(layer.text, x, y);
          break;
        case "gradient":
          const gradient = ctx.createLinearGradient(x - 100, y, x + 100, y);
          gradient.addColorStop(0, "#FFD700");
          gradient.addColorStop(0.5, "#FF6B6B");
          gradient.addColorStop(1, "#A855F7");
          ctx.shadowColor = "rgba(0,0,0,0.5)";
          ctx.shadowBlur = 5;
          ctx.fillStyle = gradient;
          ctx.fillText(layer.text, x, y);
          break;
        case "outline":
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = 4;
          ctx.strokeText(layer.text, x, y);
          ctx.fillStyle = layer.color;
          ctx.fillText(layer.text, x, y);
          break;
        default:
          ctx.fillStyle = layer.color;
          ctx.fillText(layer.text, x, y);
      }

      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    });
  };

  const updateActiveLayer = (updates: Partial<TextLayer>) => {
    setTextLayers(prev => prev.map(layer =>
      layer.id === activeLayerId ? { ...layer, ...updates } : layer
    ));
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    
    const x = ((e.clientX - rect.left) * scaleX / canvasRef.current.width) * 100;
    const y = ((e.clientY - rect.top) * scaleY / canvasRef.current.height) * 100;

    updateActiveLayer({ x, y });
  };

  const handleApply = () => {
    if (canvasRef.current) {
      onApply(canvasRef.current);
    }
  };

  const addNewLayer = () => {
    const newId = String(textLayers.length + 1);
    setTextLayers(prev => [...prev, {
      id: newId,
      text: "",
      x: 50,
      y: 30 + (textLayers.length * 15),
      fontSize: 28,
      fontFamily: "Playfair Display",
      color: "#FFFFFF",
      align: "center",
      bold: false,
      italic: false,
      effect: "shadow"
    }]);
    setActiveLayerId(newId);
  };

  return (
    <div className="space-y-4">
      {/* Canvas Preview */}
      <div ref={containerRef} className="relative border rounded-lg overflow-hidden bg-muted/20">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full h-auto cursor-crosshair"
        />
        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          Click để đặt vị trí chữ
        </div>
      </div>

      {/* Text Input */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Nhập văn bản của bạn..."
            value={activeLayer?.text || ""}
            onChange={(e) => updateActiveLayer({ text: e.target.value })}
            className="flex-1"
          />
          <Button variant="outline" size="icon" onClick={addNewLayer}>
            <Type className="w-4 h-4" />
          </Button>
        </div>

        {/* Mantra Suggestions */}
        <div className="flex flex-wrap gap-1">
          {mantras.map((mantra, i) => (
            <button
              key={i}
              onClick={() => updateActiveLayer({ text: mantra })}
              className="text-xs px-2 py-1 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
            >
              {mantra}
            </button>
          ))}
        </div>
      </div>

      {/* Font & Size */}
      <div className="grid grid-cols-2 gap-3">
        <Select
          value={activeLayer?.fontFamily}
          onValueChange={(value) => updateActiveLayer({ fontFamily: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Font" />
          </SelectTrigger>
          <SelectContent>
            {fonts.map(font => (
              <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                {font.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Size:</span>
          <Slider
            value={[activeLayer?.fontSize || 32]}
            onValueChange={([value]) => updateActiveLayer({ fontSize: value })}
            min={12}
            max={120}
            step={2}
            className="flex-1"
          />
          <span className="text-xs w-8">{activeLayer?.fontSize}</span>
        </div>
      </div>

      {/* Text Style */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={activeLayer?.bold ? "default" : "outline"}
          size="sm"
          onClick={() => updateActiveLayer({ bold: !activeLayer?.bold })}
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          variant={activeLayer?.italic ? "default" : "outline"}
          size="sm"
          onClick={() => updateActiveLayer({ italic: !activeLayer?.italic })}
        >
          <Italic className="w-4 h-4" />
        </Button>
        <div className="w-px bg-border" />
        <Button
          variant={activeLayer?.align === "left" ? "default" : "outline"}
          size="sm"
          onClick={() => updateActiveLayer({ align: "left" })}
        >
          <AlignLeft className="w-4 h-4" />
        </Button>
        <Button
          variant={activeLayer?.align === "center" ? "default" : "outline"}
          size="sm"
          onClick={() => updateActiveLayer({ align: "center" })}
        >
          <AlignCenter className="w-4 h-4" />
        </Button>
        <Button
          variant={activeLayer?.align === "right" ? "default" : "outline"}
          size="sm"
          onClick={() => updateActiveLayer({ align: "right" })}
        >
          <AlignRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Colors */}
      <div className="space-y-2">
        <span className="text-sm font-medium">Màu sắc</span>
        <div className="flex gap-2 flex-wrap">
          {colors.map(color => (
            <button
              key={color}
              onClick={() => updateActiveLayer({ color })}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                activeLayer?.color === color ? "border-primary scale-110" : "border-transparent"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Effects */}
      <div className="space-y-2">
        <span className="text-sm font-medium">Hiệu ứng chữ</span>
        <div className="grid grid-cols-5 gap-2">
          {[
            { value: "none", label: "Không" },
            { value: "shadow", label: "Bóng" },
            { value: "glow", label: "Phát sáng" },
            { value: "gradient", label: "Gradient" },
            { value: "outline", label: "Viền" },
          ].map(effect => (
            <Button
              key={effect.value}
              variant={activeLayer?.effect === effect.value ? "default" : "outline"}
              size="sm"
              onClick={() => updateActiveLayer({ effect: effect.value as TextLayer["effect"] })}
              className="text-xs"
            >
              {effect.label}
            </Button>
          ))}
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
