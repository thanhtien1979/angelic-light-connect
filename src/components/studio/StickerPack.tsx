import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Trash2, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";

interface StickerPackProps {
  imageUrl: string;
  onApply: (canvas: HTMLCanvasElement) => void;
  onCancel: () => void;
}

interface PlacedSticker {
  id: string;
  emoji: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

const stickerCategories = {
  angels: {
    name: "Thiên Thần",
    stickers: ["👼", "😇", "🌟", "✨", "💫", "⭐", "🌙", "☀️", "🕊️", "🦋", "🌈", "💖"]
  },
  spiritual: {
    name: "Tâm Linh",
    stickers: ["🙏", "☯️", "🕉️", "✝️", "☪️", "🔯", "📿", "🧘", "💎", "🔮", "👁️", "🪬"]
  },
  nature: {
    name: "Thiên Nhiên",
    stickers: ["🌸", "🌺", "🌷", "🌹", "🌻", "🌼", "🍀", "🌿", "🌴", "🌊", "🏔️", "🌅"]
  },
  hearts: {
    name: "Trái Tim",
    stickers: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🤍", "🖤", "💝", "💗", "💓", "💕"]
  },
  light: {
    name: "Ánh Sáng",
    stickers: ["🌟", "⚡", "🔥", "💥", "✨", "🌈", "🌀", "🎇", "🎆", "💫", "⭐", "🌠"]
  },
  sacred: {
    name: "Linh Thiêng",
    stickers: ["🕯️", "⛪", "🛕", "🕌", "🪷", "📖", "🎐", "🪭", "🎋", "🎍", "🧿", "🌙"]
  }
};

export default function StickerPack({ imageUrl, onApply, onCancel }: StickerPackProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [placedStickers, setPlacedStickers] = useState<PlacedSticker[]>([]);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("angels");
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const selectedSticker = placedStickers.find(s => s.id === selectedStickerId);

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
  }, [placedStickers, imageLoaded]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = imageRef.current;
    
    if (!canvas || !ctx || !img) return;

    canvas.width = img.width;
    canvas.height = img.height;
    
    ctx.drawImage(img, 0, 0);

    // Draw stickers
    placedStickers.forEach(sticker => {
      const x = (sticker.x / 100) * canvas.width;
      const y = (sticker.y / 100) * canvas.height;
      const fontSize = 48 * sticker.scale;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((sticker.rotation * Math.PI) / 180);
      ctx.font = `${fontSize}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(sticker.emoji, 0, 0);
      ctx.restore();
    });
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Check if clicking on existing sticker
    const clickedSticker = placedStickers.find(s => {
      const dx = Math.abs(s.x - x);
      const dy = Math.abs(s.y - y);
      return dx < 5 && dy < 5;
    });

    if (clickedSticker) {
      setSelectedStickerId(clickedSticker.id);
    } else {
      setSelectedStickerId(null);
    }
  };

  const addSticker = (emoji: string) => {
    const newSticker: PlacedSticker = {
      id: Date.now().toString(),
      emoji,
      x: 50,
      y: 50,
      scale: 1,
      rotation: 0
    };
    setPlacedStickers(prev => [...prev, newSticker]);
    setSelectedStickerId(newSticker.id);
  };

  const updateSelectedSticker = (updates: Partial<PlacedSticker>) => {
    if (!selectedStickerId) return;
    setPlacedStickers(prev => prev.map(s =>
      s.id === selectedStickerId ? { ...s, ...updates } : s
    ));
  };

  const deleteSelectedSticker = () => {
    if (!selectedStickerId) return;
    setPlacedStickers(prev => prev.filter(s => s.id !== selectedStickerId));
    setSelectedStickerId(null);
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
          onClick={handleCanvasClick}
          className="w-full h-auto cursor-pointer"
        />
        {selectedStickerId && (
          <div className="absolute top-2 right-2 flex gap-1">
            <Button size="icon" variant="secondary" onClick={deleteSelectedSticker}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Sticker Controls */}
      {selectedSticker && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-muted/30 rounded-lg p-3 space-y-3"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{selectedSticker.emoji}</span>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <ZoomOut className="w-4 h-4 text-muted-foreground" />
                <Slider
                  value={[selectedSticker.scale]}
                  onValueChange={([value]) => updateSelectedSticker({ scale: value })}
                  min={0.5}
                  max={3}
                  step={0.1}
                />
                <ZoomIn className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-muted-foreground" />
                <Slider
                  value={[selectedSticker.rotation]}
                  onValueChange={([value]) => updateSelectedSticker({ rotation: value })}
                  min={-180}
                  max={180}
                  step={5}
                />
                <span className="text-xs w-10">{selectedSticker.rotation}°</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {[10, 30, 50, 70, 90].map(pos => (
              <Button
                key={pos}
                size="sm"
                variant="outline"
                onClick={() => updateSelectedSticker({ x: pos })}
                className="text-xs"
              >
                X:{pos}%
              </Button>
            ))}
          </div>
          <div className="grid grid-cols-5 gap-2">
            {[10, 30, 50, 70, 90].map(pos => (
              <Button
                key={pos}
                size="sm"
                variant="outline"
                onClick={() => updateSelectedSticker({ y: pos })}
                className="text-xs"
              >
                Y:{pos}%
              </Button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Sticker Categories */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid grid-cols-6 h-auto">
          {Object.entries(stickerCategories).map(([key, category]) => (
            <TabsTrigger key={key} value={key} className="text-xs py-2">
              {category.stickers[0]}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {Object.entries(stickerCategories).map(([key, category]) => (
          <TabsContent key={key} value={key} className="mt-3">
            <p className="text-sm font-medium mb-2">{category.name}</p>
            <div className="grid grid-cols-6 gap-2">
              {category.stickers.map((sticker, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => addSticker(sticker)}
                  className="text-2xl p-2 rounded-lg hover:bg-primary/10 transition-colors"
                >
                  {sticker}
                </motion.button>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Hủy
        </Button>
        <Button 
          onClick={handleApply} 
          className="flex-1 bg-gradient-to-r from-primary to-rose-soft"
          disabled={placedStickers.length === 0}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Áp dụng ({placedStickers.length})
        </Button>
      </div>
    </div>
  );
}
