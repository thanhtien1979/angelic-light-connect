import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Check,
  RotateCw,
  Crop,
  ZoomIn,
  ZoomOut,
  Move,
  FlipHorizontal,
  FlipVertical,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface ImageCropEditorProps {
  imageUrl: string;
  onSave: (editedImageUrl: string) => void;
  onCancel: () => void;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const ASPECT_RATIOS = [
  { label: "Tự do", value: null },
  { label: "1:1", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "16:9", value: 16 / 9 },
  { label: "3:4", value: 3 / 4 },
];

const ImageCropEditor = ({ imageUrl, onSave, onCancel }: ImageCropEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [cropMode, setCropMode] = useState(false);
  const [cropArea, setCropArea] = useState<CropArea | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Load image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageRef.current = img;
      setIsLoaded(true);
      drawCanvas();
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Draw canvas whenever transform changes
  useEffect(() => {
    if (isLoaded) {
      drawCanvas();
    }
  }, [rotation, zoom, flipH, flipV, brightness, contrast, pan, isLoaded]);

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

    // Save state
    ctx.save();

    // Apply transforms
    ctx.translate(canvas.width / 2 + pan.x, canvas.height / 2 + pan.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -zoom : zoom, flipV ? -zoom : zoom);

    // Apply filters
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

    // Draw image centered
    ctx.drawImage(
      img,
      -img.width * scale / 2,
      -img.height * scale / 2,
      img.width * scale,
      img.height * scale
    );

    // Restore state
    ctx.restore();

    // Draw crop overlay if in crop mode
    if (cropMode && cropArea) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.clearRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
      
      // Draw crop border
      ctx.strokeStyle = "#FFD700";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
    }
  }, [rotation, zoom, flipH, flipV, brightness, contrast, pan, cropMode, cropArea]);

  const handleRotate = (degrees: number) => {
    setRotation((prev) => (prev + degrees) % 360);
  };

  const handleZoom = (delta: number) => {
    setZoom((prev) => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (cropMode) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setDragStart({ x, y });
      setCropArea({ x, y, width: 0, height: 0 });
    } else {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (cropMode && cropArea) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      let width = x - dragStart.x;
      let height = y - dragStart.y;
      
      // Apply aspect ratio if set
      if (aspectRatio) {
        height = width / aspectRatio;
      }
      
      setCropArea({
        x: width < 0 ? x : dragStart.x,
        y: height < 0 ? y : dragStart.y,
        width: Math.abs(width),
        height: Math.abs(height),
      });
    } else if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const applyCrop = () => {
    if (!cropArea || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Get cropped image data
    const imageData = ctx.getImageData(
      cropArea.x,
      cropArea.y,
      cropArea.width,
      cropArea.height
    );

    // Create new canvas with cropped size
    const croppedCanvas = document.createElement("canvas");
    croppedCanvas.width = cropArea.width;
    croppedCanvas.height = cropArea.height;
    const croppedCtx = croppedCanvas.getContext("2d");
    if (!croppedCtx) return;

    croppedCtx.putImageData(imageData, 0, 0);

    // Update main canvas
    canvas.width = cropArea.width;
    canvas.height = cropArea.height;
    ctx.drawImage(croppedCanvas, 0, 0);

    setCropMode(false);
    setCropArea(null);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        onSave(url);
      }
    }, "image/jpeg", 0.9);
  };

  const resetAll = () => {
    setRotation(0);
    setZoom(1);
    setFlipH(false);
    setFlipV(false);
    setBrightness(100);
    setContrast(100);
    setPan({ x: 0, y: 0 });
    setCropMode(false);
    setCropArea(null);
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
        className="relative w-full max-w-3xl bg-card rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-medium text-foreground">Chỉnh sửa ảnh</h3>
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

        {/* Canvas Area */}
        <div
          ref={containerRef}
          className="relative flex items-center justify-center bg-black/50 p-4 min-h-[400px]"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-[400px] rounded-lg cursor-move"
            style={{ cursor: cropMode ? "crosshair" : "move" }}
          />
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 space-y-4 border-t border-border">
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant={cropMode ? "default" : "outline"}
              size="sm"
              onClick={() => setCropMode(!cropMode)}
            >
              <Crop className="w-4 h-4 mr-1" />
              Cắt
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleRotate(-90)}>
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleRotate(90)}>
              <RotateCw className="w-4 h-4" />
            </Button>
            <Button
              variant={flipH ? "default" : "outline"}
              size="sm"
              onClick={() => setFlipH(!flipH)}
            >
              <FlipHorizontal className="w-4 h-4" />
            </Button>
            <Button
              variant={flipV ? "default" : "outline"}
              size="sm"
              onClick={() => setFlipV(!flipV)}
            >
              <FlipVertical className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleZoom(-0.1)}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleZoom(0.1)}>
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>

          {/* Crop Aspect Ratio (when crop mode is active) */}
          {cropMode && (
            <div className="flex flex-wrap gap-2 justify-center">
              {ASPECT_RATIOS.map((ratio) => (
                <Button
                  key={ratio.label}
                  variant={aspectRatio === ratio.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAspectRatio(ratio.value)}
                >
                  {ratio.label}
                </Button>
              ))}
              {cropArea && cropArea.width > 10 && (
                <Button size="sm" onClick={applyCrop} className="bg-gold text-black hover:bg-gold/90">
                  <Check className="w-4 h-4 mr-1" />
                  Áp dụng cắt
                </Button>
              )}
            </div>
          )}

          {/* Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
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
              <div className="flex justify-between text-sm">
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
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-border">
          <Button variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button onClick={handleSave} className="bg-gold text-black hover:bg-gold/90">
            <Check className="w-4 h-4 mr-1" />
            Lưu ảnh
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ImageCropEditor;
