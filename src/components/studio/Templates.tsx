import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Layout, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TemplatesProps {
  onSelectTemplate: (templatePrompt: string) => void;
  isGenerating: boolean;
}

interface Template {
  id: string;
  name: string;
  thumbnail: string;
  prompt: string;
  category: string;
}

const templates: Template[] = [
  // Quotes & Affirmations
  {
    id: "quote-angel",
    name: "Quote Thiên Thần",
    thumbnail: "linear-gradient(135deg, #FFE5D9 0%, #FFCAD4 50%, #F4ACB7 100%)",
    prompt: "Beautiful angelic quote card design, soft pink and gold colors, elegant typography space in center, divine light rays, floating feathers, heavenly clouds background, delicate border with wings motif",
    category: "quotes"
  },
  {
    id: "quote-zen",
    name: "Quote Thiền",
    thumbnail: "linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 50%, #A5D6A7 100%)",
    prompt: "Zen meditation quote card, minimalist design, soft green and white, lotus flower decoration, peaceful atmosphere, bamboo elements, space for text in center, Japanese inspired aesthetics",
    category: "quotes"
  },
  {
    id: "quote-galaxy",
    name: "Quote Vũ Trụ",
    thumbnail: "linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)",
    prompt: "Cosmic inspirational quote card, deep space background, stars and galaxies, purple and blue nebula colors, golden text space, mystical atmosphere, celestial elements",
    category: "quotes"
  },
  {
    id: "quote-sunrise",
    name: "Quote Bình Minh",
    thumbnail: "linear-gradient(135deg, #FFE259 0%, #FFA751 50%, #FF7B54 100%)",
    prompt: "Sunrise motivational quote card, warm orange and yellow gradient sky, silhouette of mountains, hopeful atmosphere, rays of light, elegant space for inspirational text",
    category: "quotes"
  },

  // Greeting Cards
  {
    id: "card-birthday",
    name: "Sinh Nhật",
    thumbnail: "linear-gradient(135deg, #F093FB 0%, #F5576C 50%, #FF6B6B 100%)",
    prompt: "Beautiful birthday greeting card design, celebration theme, balloons and confetti, cake with candles, festive colors, space for birthday message, joyful decorations",
    category: "cards"
  },
  {
    id: "card-lunar",
    name: "Tết Nguyên Đán",
    thumbnail: "linear-gradient(135deg, #C62828 0%, #B71C1C 50%, #FFD700 100%)",
    prompt: "Vietnamese Lunar New Year greeting card, red and gold colors, mai flower blossoms, lanterns, dragon decorations, lucky coins, space for wishes, traditional patterns",
    category: "cards"
  },
  {
    id: "card-christmas",
    name: "Giáng Sinh",
    thumbnail: "linear-gradient(135deg, #1E5631 0%, #2E7D32 50%, #C62828 100%)",
    prompt: "Christmas greeting card design, snow falling, Christmas tree with lights, red and green colors, Santa elements, festive decorations, space for holiday message",
    category: "cards"
  },
  {
    id: "card-thanks",
    name: "Cảm Ơn",
    thumbnail: "linear-gradient(135deg, #8E24AA 0%, #7B1FA2 50%, #9C27B0 100%)",
    prompt: "Thank you card design, elegant purple and white theme, beautiful flower arrangement, grateful atmosphere, decorative border, space for thank you message, soft and warm feeling",
    category: "cards"
  },

  // Social Media
  {
    id: "social-avatar",
    name: "Avatar Hào Quang",
    thumbnail: "linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)",
    prompt: "Profile avatar frame design, golden halo around circular space, angelic wings on sides, divine light emanating, spiritual symbols, celestial decorations, perfect for profile picture",
    category: "social"
  },
  {
    id: "social-story",
    name: "Story Thiên Thần",
    thumbnail: "linear-gradient(135deg, #667EEA 0%, #764BA2 50%, #F093FB 100%)",
    prompt: "Instagram story template, vertical format, angelic theme, soft pastel colors, decorative frame with wings, space for photo or text, ethereal atmosphere, floating feathers",
    category: "social"
  },
  {
    id: "social-banner",
    name: "Banner Tâm Linh",
    thumbnail: "linear-gradient(135deg, #11998E 0%, #38EF7D 50%, #00F260 100%)",
    prompt: "Social media banner design, wide horizontal format, spiritual theme, chakra colors, mandala decorations, sacred geometry patterns, space for text and branding",
    category: "social"
  },
  {
    id: "social-poster",
    name: "Poster Sự Kiện",
    thumbnail: "linear-gradient(135deg, #DA4453 0%, #89216B 100%)",
    prompt: "Event poster template, meditation or spiritual event theme, elegant design, space for event details, divine lighting, mystical atmosphere, eye-catching layout",
    category: "social"
  }
];

export default function Templates({ onSelectTemplate, isGenerating }: TemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [activeCategory, setActiveCategory] = useState("quotes");

  const filteredTemplates = templates.filter(t => t.category === activeCategory);

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate.prompt);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Layout className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Mẫu thiết kế</h3>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Chọn mẫu có sẵn để bắt đầu sáng tạo nhanh hơn
      </p>

      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid grid-cols-3 h-auto">
          <TabsTrigger value="quotes" className="text-xs py-2">
            💬 Quotes
          </TabsTrigger>
          <TabsTrigger value="cards" className="text-xs py-2">
            💌 Thiệp
          </TabsTrigger>
          <TabsTrigger value="social" className="text-xs py-2">
            📱 Social
          </TabsTrigger>
        </TabsList>

        {["quotes", "cards", "social"].map(category => (
          <TabsContent key={category} value={category} className="mt-4">
            <div className="grid grid-cols-2 gap-3">
              {filteredTemplates.map(template => (
                <motion.button
                  key={template.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedTemplate(template)}
                  className={`relative rounded-xl overflow-hidden aspect-[4/3] text-center transition-all ${
                    selectedTemplate?.id === template.id
                      ? "ring-2 ring-primary ring-offset-2"
                      : "hover:shadow-lg"
                  }`}
                  style={{ background: template.thumbnail }}
                >
                  <div className="absolute inset-0 bg-black/20 flex items-end justify-center pb-3">
                    <span className="text-sm text-white font-medium drop-shadow-md px-2">
                      {template.name}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {selectedTemplate && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/5 rounded-lg p-4"
        >
          <p className="text-sm mb-3">
            <span className="font-medium">Mẫu đã chọn:</span>{" "}
            {selectedTemplate.name}
          </p>
          <Button
            onClick={handleUseTemplate}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-primary to-rose-soft"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang tạo...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Sử dụng mẫu này
              </>
            )}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
