import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Check,
  Type,
  Smile,
  Trash2,
  RotateCcw,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface StickerTextEditorProps {
  imageUrl: string;
  onSave: (editedImageUrl: string) => void;
  onCancel: () => void;
}

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  bold: boolean;
  italic: boolean;
  align: "left" | "center" | "right";
  shadowColor: string;
  shadowBlur: number;
}

interface StickerOverlay {
  id: string;
  emoji: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
}

const STICKER_PACKS = {
  emotions: ["😊", "😍", "🥰", "😇", "🤗", "💕", "✨", "🌟", "💫", "⭐", "🌈", "🦋", "🌸", "🌺", "🌻", "🍀"],
  spiritual: ["🙏", "☮️", "🕉️", "☯️", "🧘", "🪷", "🌙", "☀️", "🌅", "🕊️", "👼", "💫", "✨", "🔮", "💎", "🪬"],
  nature: ["🌿", "🍃", "🌱", "🌳", "🌲", "🌴", "🌵", "🌾", "🌊", "💧", "🔥", "⛰️", "🏔️", "🌋", "🌄", "🏝️"],
  love: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💖", "💗", "💓", "💞", "💝", "💘", "💌"],
  symbols: ["☮️", "✝️", "☪️", "🕎", "☸️", "✡️", "🔯", "🕉️", "⚛️", "🛐", "⛩️", "🕌", "🕍", "⛪", "🏛️", "🗿"],
  decorative: ["🎀", "🎁", "🎈", "🎉", "🎊", "🎭", "🎨", "🎬", "🎤", "🎧", "🎵", "🎶", "💐", "🌹", "🥀", "🌷"],
};

const FONT_FAMILIES = [
  { label: "Mặc định", value: "Arial" },
  { label: "Serif", value: "Georgia" },
  { label: "Handwriting", value: "Brush Script MT, cursive" },
  { label: "Impact", value: "Impact" },
  { label: "Comic", value: "Comic Sans MS" },
];

const TEXT_COLORS = [
  "#FFFFFF", "#000000", "#FFD700", "#FF6B6B", "#4ECDC4", 
  "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8",
  "#F7DC6F", "#BB8FCE", "#85C1E9", "#F8B500", "#FF69B4",
];

const StickerTextEditor = ({ imageUrl, onSave, onCancel }: StickerTextEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [texts, setTexts] = useState<TextOverlay[]>([]);
  const [stickers, setStickers] = useState<StickerOverlay[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"stickers" | "text">("stickers");
  const [activeStickerPack, setActiveStickerPack] = useState<keyof typeof STICKER_PACKS>("emotions");
  const [newText, setNewText] = useState("");
  const [dragItem, setDragItem] = useState<{ type: "text" | "sticker"; id: string } | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const generateId = () => `item-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

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

  // Draw canvas
  useEffect(() => {
    if (!isLoaded) return;
    drawCanvas();
  }, [isLoaded, texts, stickers]);

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

    // Draw image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Draw stickers
    stickers.forEach((sticker) => {
      ctx.save();
      ctx.translate(sticker.x, sticker.y);
      ctx.rotate((sticker.rotation * Math.PI) / 180);
      ctx.font = `${sticker.size}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(sticker.emoji, 0, 0);
      ctx.restore();
    });

    // Draw texts
    texts.forEach((text) => {
      ctx.save();
      ctx.translate(text.x, text.y);
      
      const fontStyle = `${text.italic ? "italic " : ""}${text.bold ? "bold " : ""}${text.fontSize}px ${text.fontFamily}`;
      ctx.font = fontStyle;
      ctx.textAlign = text.align;
      ctx.textBaseline = "top";
      
      // Shadow
      if (text.shadowBlur > 0) {
        ctx.shadowColor = text.shadowColor;
        ctx.shadowBlur = text.shadowBlur;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
      }
      
      ctx.fillStyle = text.color;
      ctx.fillText(text.text, 0, 0);
      ctx.restore();
    });
  }, [texts, stickers, isLoaded]);

  const addSticker = (emoji: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const newSticker: StickerOverlay = {
      id: generateId(),
      emoji,
      x: canvas.width / 2,
      y: canvas.height / 2,
      size: 48,
      rotation: 0,
    };
    setStickers((prev) => [...prev, newSticker]);
    setSelectedStickerId(newSticker.id);
    setSelectedTextId(null);
  };

  const addText = () => {
    if (!newText.trim()) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const newTextOverlay: TextOverlay = {
      id: generateId(),
      text: newText.trim(),
      x: canvas.width / 2,
      y: canvas.height / 2,
      fontSize: 32,
      color: "#FFFFFF",
      fontFamily: "Arial",
      bold: false,
      italic: false,
      align: "center",
      shadowColor: "#000000",
      shadowBlur: 4,
    };
    setTexts((prev) => [...prev, newTextOverlay]);
    setSelectedTextId(newTextOverlay.id);
    setSelectedStickerId(null);
    setNewText("");
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Check if clicking on a sticker
    for (let i = stickers.length - 1; i >= 0; i--) {
      const sticker = stickers[i];
      const distance = Math.sqrt(Math.pow(x - sticker.x, 2) + Math.pow(y - sticker.y, 2));
      if (distance < sticker.size / 2) {
        setSelectedStickerId(sticker.id);
        setSelectedTextId(null);
        setDragItem({ type: "sticker", id: sticker.id });
        setDragOffset({ x: x - sticker.x, y: y - sticker.y });
        return;
      }
    }

    // Check if clicking on a text
    const ctx = canvas.getContext("2d");
    if (ctx) {
      for (let i = texts.length - 1; i >= 0; i--) {
        const text = texts[i];
        ctx.font = `${text.bold ? "bold " : ""}${text.fontSize}px ${text.fontFamily}`;
        const metrics = ctx.measureText(text.text);
        const textWidth = metrics.width;
        const textHeight = text.fontSize;

        let textX = text.x;
        if (text.align === "center") textX -= textWidth / 2;
        else if (text.align === "right") textX -= textWidth;

        if (x >= textX && x <= textX + textWidth && y >= text.y && y <= text.y + textHeight) {
          setSelectedTextId(text.id);
          setSelectedStickerId(null);
          setDragItem({ type: "text", id: text.id });
          setDragOffset({ x: x - text.x, y: y - text.y });
          return;
        }
      }
    }

    // Clicked on empty area - deselect
    setSelectedTextId(null);
    setSelectedStickerId(null);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!dragItem) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX - dragOffset.x;
    const y = (e.clientY - rect.top) * scaleY - dragOffset.y;

    if (dragItem.type === "sticker") {
      setStickers((prev) =>
        prev.map((s) => (s.id === dragItem.id ? { ...s, x, y } : s))
      );
    } else {
      setTexts((prev) =>
        prev.map((t) => (t.id === dragItem.id ? { ...t, x, y } : t))
      );
    }
  };

  const handleCanvasMouseUp = () => {
    setDragItem(null);
  };

  const deleteSelected = () => {
    if (selectedStickerId) {
      setStickers((prev) => prev.filter((s) => s.id !== selectedStickerId));
      setSelectedStickerId(null);
    }
    if (selectedTextId) {
      setTexts((prev) => prev.filter((t) => t.id !== selectedTextId));
      setSelectedTextId(null);
    }
  };

  const updateSelectedText = (updates: Partial<TextOverlay>) => {
    if (!selectedTextId) return;
    setTexts((prev) =>
      prev.map((t) => (t.id === selectedTextId ? { ...t, ...updates } : t))
    );
  };

  const updateSelectedSticker = (updates: Partial<StickerOverlay>) => {
    if (!selectedStickerId) return;
    setStickers((prev) =>
      prev.map((s) => (s.id === selectedStickerId ? { ...s, ...updates } : s))
    );
  };

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
    setTexts([]);
    setStickers([]);
    setSelectedTextId(null);
    setSelectedStickerId(null);
  };

  const selectedText = texts.find((t) => t.id === selectedTextId);
  const selectedSticker = stickers.find((s) => s.id === selectedStickerId);

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
            <Smile className="w-5 h-5 text-gold" />
            <h3 className="font-medium text-foreground">Sticker & Text</h3>
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
            {/* Canvas */}
            <div
              ref={containerRef}
              className="flex-1 flex items-center justify-center bg-black/50 p-4 min-h-[300px]"
            >
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-[400px] rounded-lg cursor-move"
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
              />
            </div>

            {/* Right Panel */}
            <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-border">
              {/* Tabs */}
              <div className="flex border-b border-border">
                <button
                  onClick={() => setActiveTab("stickers")}
                  className={cn(
                    "flex-1 px-4 py-3 text-sm font-medium transition-colors",
                    activeTab === "stickers"
                      ? "text-gold border-b-2 border-gold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Smile className="w-4 h-4 inline-block mr-1" />
                  Stickers
                </button>
                <button
                  onClick={() => setActiveTab("text")}
                  className={cn(
                    "flex-1 px-4 py-3 text-sm font-medium transition-colors",
                    activeTab === "text"
                      ? "text-gold border-b-2 border-gold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Type className="w-4 h-4 inline-block mr-1" />
                  Text
                </button>
              </div>

              <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
                {activeTab === "stickers" ? (
                  <>
                    {/* Sticker Pack Selector */}
                    <div className="flex flex-wrap gap-1">
                      {Object.keys(STICKER_PACKS).map((pack) => (
                        <button
                          key={pack}
                          onClick={() => setActiveStickerPack(pack as keyof typeof STICKER_PACKS)}
                          className={cn(
                            "px-2 py-1 text-xs rounded-full transition-colors",
                            activeStickerPack === pack
                              ? "bg-gold text-black"
                              : "bg-muted text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {pack}
                        </button>
                      ))}
                    </div>

                    {/* Stickers Grid */}
                    <div className="grid grid-cols-8 gap-1">
                      {STICKER_PACKS[activeStickerPack].map((emoji, idx) => (
                        <button
                          key={idx}
                          onClick={() => addSticker(emoji)}
                          className="text-2xl hover:scale-125 transition-transform p-1"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>

                    {/* Selected Sticker Controls */}
                    {selectedSticker && (
                      <div className="space-y-3 pt-3 border-t border-border">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Sticker đã chọn</span>
                          <Button variant="ghost" size="sm" onClick={deleteSelected}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Kích thước</span>
                            <span>{selectedSticker.size}px</span>
                          </div>
                          <Slider
                            value={[selectedSticker.size]}
                            onValueChange={([v]) => updateSelectedSticker({ size: v })}
                            min={24}
                            max={120}
                            step={4}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Xoay</span>
                            <span>{selectedSticker.rotation}°</span>
                          </div>
                          <Slider
                            value={[selectedSticker.rotation]}
                            onValueChange={([v]) => updateSelectedSticker({ rotation: v })}
                            min={-180}
                            max={180}
                            step={5}
                          />
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Add Text */}
                    <div className="flex gap-2">
                      <Input
                        value={newText}
                        onChange={(e) => setNewText(e.target.value)}
                        placeholder="Nhập text..."
                        onKeyPress={(e) => e.key === "Enter" && addText()}
                      />
                      <Button onClick={addText} size="sm">
                        Thêm
                      </Button>
                    </div>

                    {/* Selected Text Controls */}
                    {selectedText && (
                      <div className="space-y-3 pt-3 border-t border-border">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Text đã chọn</span>
                          <Button variant="ghost" size="sm" onClick={deleteSelected}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>

                        {/* Font Style */}
                        <div className="flex gap-1">
                          <Button
                            variant={selectedText.bold ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateSelectedText({ bold: !selectedText.bold })}
                          >
                            <Bold className="w-4 h-4" />
                          </Button>
                          <Button
                            variant={selectedText.italic ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateSelectedText({ italic: !selectedText.italic })}
                          >
                            <Italic className="w-4 h-4" />
                          </Button>
                          <Button
                            variant={selectedText.align === "left" ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateSelectedText({ align: "left" })}
                          >
                            <AlignLeft className="w-4 h-4" />
                          </Button>
                          <Button
                            variant={selectedText.align === "center" ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateSelectedText({ align: "center" })}
                          >
                            <AlignCenter className="w-4 h-4" />
                          </Button>
                          <Button
                            variant={selectedText.align === "right" ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateSelectedText({ align: "right" })}
                          >
                            <AlignRight className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Font Size */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Cỡ chữ</span>
                            <span>{selectedText.fontSize}px</span>
                          </div>
                          <Slider
                            value={[selectedText.fontSize]}
                            onValueChange={([v]) => updateSelectedText({ fontSize: v })}
                            min={12}
                            max={72}
                            step={2}
                          />
                        </div>

                        {/* Font Family */}
                        <div className="space-y-2">
                          <span className="text-xs text-muted-foreground">Phông chữ</span>
                          <div className="flex flex-wrap gap-1">
                            {FONT_FAMILIES.map((font) => (
                              <button
                                key={font.value}
                                onClick={() => updateSelectedText({ fontFamily: font.value })}
                                className={cn(
                                  "px-2 py-1 text-xs rounded transition-colors",
                                  selectedText.fontFamily === font.value
                                    ? "bg-gold text-black"
                                    : "bg-muted hover:bg-muted/80"
                                )}
                                style={{ fontFamily: font.value }}
                              >
                                {font.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Colors */}
                        <div className="space-y-2">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Palette className="w-3 h-3" /> Màu chữ
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {TEXT_COLORS.map((color) => (
                              <button
                                key={color}
                                onClick={() => updateSelectedText({ color })}
                                className={cn(
                                  "w-6 h-6 rounded-full border-2 transition-transform hover:scale-110",
                                  selectedText.color === color ? "border-gold scale-110" : "border-transparent"
                                )}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Shadow */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Đổ bóng</span>
                            <span>{selectedText.shadowBlur}px</span>
                          </div>
                          <Slider
                            value={[selectedText.shadowBlur]}
                            onValueChange={([v]) => updateSelectedText({ shadowBlur: v })}
                            min={0}
                            max={20}
                            step={1}
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-border flex-shrink-0">
          <Button variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button onClick={handleSave} className="bg-gold text-black hover:bg-gold/90">
            <Check className="w-4 h-4 mr-1" />
            Lưu
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StickerTextEditor;
