import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ArtStylesProps {
  imageUrl: string;
  onApply: (styledPrompt: string) => Promise<void>;
  isProcessing: boolean;
}

const artStyles = [
  {
    id: "anime",
    name: "Anime",
    emoji: "🎌",
    prompt: "in beautiful anime art style, vibrant colors, detailed cel shading",
    preview: "linear-gradient(135deg, #FF6B9D 0%, #C44DFF 100%)"
  },
  {
    id: "watercolor",
    name: "Watercolor",
    emoji: "🎨",
    prompt: "as a beautiful watercolor painting, soft edges, artistic brush strokes, ethereal",
    preview: "linear-gradient(135deg, #74EBD5 0%, #ACB6E5 100%)"
  },
  {
    id: "oil-painting",
    name: "Oil Painting",
    emoji: "🖼️",
    prompt: "as a classical oil painting, rich textures, dramatic lighting, masterpiece quality",
    preview: "linear-gradient(135deg, #8B5A2B 0%, #DAA520 100%)"
  },
  {
    id: "sketch",
    name: "Pencil Sketch",
    emoji: "✏️",
    prompt: "as a detailed pencil sketch, fine lines, artistic shading, high contrast",
    preview: "linear-gradient(135deg, #333333 0%, #AAAAAA 100%)"
  },
  {
    id: "3d-render",
    name: "3D Render",
    emoji: "🎮",
    prompt: "as a high quality 3D render, realistic materials, cinematic lighting, octane render",
    preview: "linear-gradient(135deg, #667EEA 0%, #764BA2 100%)"
  },
  {
    id: "pixel-art",
    name: "Pixel Art",
    emoji: "👾",
    prompt: "as retro pixel art, 16-bit style, nostalgic gaming aesthetic",
    preview: "linear-gradient(135deg, #00C9FF 0%, #92FE9D 100%)"
  },
  {
    id: "comic",
    name: "Comic Book",
    emoji: "💥",
    prompt: "in comic book style, bold outlines, halftone dots, dynamic composition",
    preview: "linear-gradient(135deg, #FF512F 0%, #F09819 100%)"
  },
  {
    id: "angel",
    name: "Thiên Thần",
    emoji: "👼",
    prompt: "divine angelic style, ethereal glow, heavenly light, spiritual aura, sacred beauty",
    preview: "linear-gradient(135deg, #FFE259 0%, #FFA751 100%)"
  },
  {
    id: "dreamy",
    name: "Dreamy",
    emoji: "☁️",
    prompt: "dreamy fantasy style, soft glow, magical atmosphere, pastel colors, whimsical",
    preview: "linear-gradient(135deg, #E8CBC0 0%, #636FA4 100%)"
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    emoji: "🌃",
    prompt: "cyberpunk style, neon lights, futuristic, rain-soaked streets, high tech low life",
    preview: "linear-gradient(135deg, #00F5A0 0%, #00D9F5 50%, #F500D9 100%)"
  },
  {
    id: "ghibli",
    name: "Studio Ghibli",
    emoji: "🌸",
    prompt: "in Studio Ghibli animation style, whimsical, peaceful, nature-inspired, heartwarming",
    preview: "linear-gradient(135deg, #96E6A1 0%, #D4FC79 100%)"
  },
  {
    id: "impressionist",
    name: "Impressionist",
    emoji: "🌻",
    prompt: "in impressionist style, visible brushstrokes, light and movement, Monet-inspired",
    preview: "linear-gradient(135deg, #FFECD2 0%, #FCB69F 100%)"
  }
];

export default function ArtStyles({ imageUrl, onApply, isProcessing }: ArtStylesProps) {
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  const handleApplyStyle = async () => {
    if (!selectedStyle) return;
    const style = artStyles.find(s => s.id === selectedStyle);
    if (style) {
      await onApply(`Transform this image ${style.prompt}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Wand2 className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Chọn phong cách nghệ thuật</h3>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Chuyển đổi ảnh của bạn sang các phong cách nghệ thuật độc đáo
      </p>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {artStyles.map((style) => (
          <motion.button
            key={style.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedStyle(style.id)}
            className={`relative rounded-xl overflow-hidden p-3 text-center transition-all ${
              selectedStyle === style.id
                ? "ring-2 ring-primary ring-offset-2"
                : "hover:shadow-lg"
            }`}
            style={{ background: style.preview }}
          >
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative z-10">
              <span className="text-2xl block mb-1">{style.emoji}</span>
              <span className="text-xs text-white font-medium drop-shadow-md">
                {style.name}
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      {selectedStyle && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/5 rounded-lg p-4"
        >
          <p className="text-sm mb-3">
            <span className="font-medium">Phong cách đã chọn:</span>{" "}
            {artStyles.find(s => s.id === selectedStyle)?.name}
          </p>
          <Button
            onClick={handleApplyStyle}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-primary to-rose-soft"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang chuyển đổi...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Áp dụng phong cách
              </>
            )}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
