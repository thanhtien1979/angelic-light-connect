import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface PromptOption {
  id: string;
  label: string;
  emoji?: string;
}

interface PromptCategory {
  id: string;
  title: string;
  emoji: string;
  options: PromptOption[];
  multiSelect?: boolean;
}

const promptCategories: PromptCategory[] = [
  {
    id: "subject",
    title: "Chủ Thể",
    emoji: "👤",
    options: [
      { id: "angel", label: "Thiên thần", emoji: "👼" },
      { id: "human", label: "Con người", emoji: "🧑" },
      { id: "deity", label: "Thần linh", emoji: "🙏" },
      { id: "spirit", label: "Tinh linh", emoji: "✨" },
      { id: "buddha", label: "Phật", emoji: "☸️" },
      { id: "fairy", label: "Tiên nữ", emoji: "🧚" },
    ],
  },
  {
    id: "gender",
    title: "Giới Tính",
    emoji: "⚧️",
    options: [
      { id: "female", label: "Nữ", emoji: "👩" },
      { id: "male", label: "Nam", emoji: "👨" },
      { id: "neutral", label: "Trung tính", emoji: "🌟" },
      { id: "divine", label: "Thần thánh", emoji: "✨" },
    ],
  },
  {
    id: "form",
    title: "Hình Dáng",
    emoji: "🎭",
    options: [
      { id: "portrait", label: "Chân dung", emoji: "🖼️" },
      { id: "fullbody", label: "Toàn thân", emoji: "🧍" },
      { id: "flying", label: "Đang bay", emoji: "🕊️" },
      { id: "meditating", label: "Thiền định", emoji: "🧘" },
      { id: "dancing", label: "Nhảy múa", emoji: "💃" },
      { id: "praying", label: "Cầu nguyện", emoji: "🙏" },
    ],
  },
  {
    id: "colors",
    title: "Màu Sắc",
    emoji: "🎨",
    multiSelect: true,
    options: [
      { id: "gold", label: "Vàng kim", emoji: "💛" },
      { id: "white", label: "Trắng tinh khiết", emoji: "🤍" },
      { id: "pink", label: "Hồng dịu dàng", emoji: "💗" },
      { id: "blue", label: "Xanh dương", emoji: "💙" },
      { id: "purple", label: "Tím huyền bí", emoji: "💜" },
      { id: "rainbow", label: "Cầu vồng", emoji: "🌈" },
      { id: "ethereal", label: "Ánh sáng mờ ảo", emoji: "✨" },
    ],
  },
  {
    id: "beings",
    title: "Muôn Loài",
    emoji: "🦋",
    multiSelect: true,
    options: [
      { id: "birds", label: "Chim muông", emoji: "🕊️" },
      { id: "butterflies", label: "Bướm", emoji: "🦋" },
      { id: "flowers", label: "Hoa", emoji: "🌸" },
      { id: "trees", label: "Cây cối", emoji: "🌳" },
      { id: "animals", label: "Thú vật", emoji: "🦌" },
      { id: "fish", label: "Cá", emoji: "🐟" },
      { id: "dragons", label: "Rồng", emoji: "🐉" },
      { id: "phoenix", label: "Phượng hoàng", emoji: "🔥" },
    ],
  },
  {
    id: "environment",
    title: "Cảnh Quan",
    emoji: "🏞️",
    options: [
      { id: "heaven", label: "Thiên đường", emoji: "☁️" },
      { id: "garden", label: "Vườn địa đàng", emoji: "🌺" },
      { id: "mountain", label: "Núi non", emoji: "⛰️" },
      { id: "ocean", label: "Đại dương", emoji: "🌊" },
      { id: "forest", label: "Rừng thiêng", emoji: "🌲" },
      { id: "cosmos", label: "Vũ trụ", emoji: "🌌" },
      { id: "temple", label: "Đền thờ", emoji: "🛕" },
      { id: "lotus_pond", label: "Ao sen", emoji: "🪷" },
    ],
  },
  {
    id: "atmosphere",
    title: "Không Khí",
    emoji: "🌅",
    options: [
      { id: "sunrise", label: "Bình minh", emoji: "🌅" },
      { id: "sunset", label: "Hoàng hôn", emoji: "🌇" },
      { id: "moonlight", label: "Ánh trăng", emoji: "🌙" },
      { id: "starlight", label: "Sao sáng", emoji: "⭐" },
      { id: "divine_light", label: "Hào quang", emoji: "✨" },
      { id: "misty", label: "Mây mù", emoji: "🌫️" },
    ],
  },
  {
    id: "style",
    title: "Phong Cách",
    emoji: "🖌️",
    options: [
      { id: "realistic", label: "Thực tế", emoji: "📷" },
      { id: "watercolor", label: "Màu nước", emoji: "🎨" },
      { id: "oil_painting", label: "Sơn dầu", emoji: "🖼️" },
      { id: "digital_art", label: "Nghệ thuật số", emoji: "💻" },
      { id: "anime", label: "Anime", emoji: "🎌" },
      { id: "classic", label: "Cổ điển", emoji: "🏛️" },
      { id: "fantasy", label: "Huyền ảo", emoji: "🔮" },
    ],
  },
];

const optionToPromptMap: Record<string, string> = {
  // Subjects
  angel: "a divine angel with beautiful wings",
  human: "a peaceful human figure",
  deity: "a majestic deity with divine presence",
  spirit: "a gentle ethereal spirit",
  buddha: "a serene Buddha with enlightened aura",
  fairy: "a graceful celestial fairy",
  
  // Gender
  female: "female",
  male: "male",
  neutral: "gender-neutral",
  divine: "divinely androgynous",
  
  // Form
  portrait: "close-up portrait",
  fullbody: "full body view",
  flying: "gracefully flying through the air",
  meditating: "in deep meditation pose",
  dancing: "dancing gracefully",
  praying: "in prayer position with hands together",
  
  // Colors
  gold: "golden radiant colors",
  white: "pure white luminous tones",
  pink: "soft pink gentle hues",
  blue: "serene blue tones",
  purple: "mystical purple shades",
  rainbow: "rainbow spectrum colors",
  ethereal: "ethereal glowing light",
  
  // Beings
  birds: "surrounded by peaceful doves",
  butterflies: "with beautiful butterflies",
  flowers: "among blooming flowers",
  trees: "near ancient sacred trees",
  animals: "with gentle woodland creatures",
  fish: "with swimming koi fish",
  dragons: "with a majestic dragon",
  phoenix: "with a rising phoenix",
  
  // Environment
  heaven: "in heavenly clouds above",
  garden: "in a paradise garden",
  mountain: "on a sacred mountain peak",
  ocean: "above a calm ocean",
  forest: "in an enchanted forest",
  cosmos: "in the cosmic universe with stars",
  temple: "in an ancient temple",
  lotus_pond: "near a serene lotus pond",
  
  // Atmosphere
  sunrise: "at beautiful sunrise",
  sunset: "during golden sunset",
  moonlight: "under soft moonlight",
  starlight: "beneath starry sky",
  divine_light: "with divine halo light",
  misty: "in mystical mist",
  
  // Style
  realistic: "ultra realistic photo style",
  watercolor: "watercolor painting style",
  oil_painting: "classical oil painting style",
  digital_art: "modern digital art style",
  anime: "beautiful anime art style",
  classic: "classical renaissance art style",
  fantasy: "fantasy art illustration style",
};

interface PromptBuilderProps {
  onPromptChange: (prompt: string) => void;
  basePrompt: string;
}

export default function PromptBuilder({ onPromptChange, basePrompt }: PromptBuilderProps) {
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [openCategories, setOpenCategories] = useState<string[]>(["subject"]);

  const toggleCategory = (categoryId: string) => {
    setOpenCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleOption = (categoryId: string, optionId: string, multiSelect: boolean) => {
    setSelections((prev) => {
      const current = prev[categoryId] || [];
      let updated: string[];

      if (multiSelect) {
        updated = current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId];
      } else {
        updated = current.includes(optionId) ? [] : [optionId];
      }

      const newSelections = { ...prev, [categoryId]: updated };
      
      // Generate prompt from selections
      setTimeout(() => generatePrompt(newSelections), 0);
      
      return newSelections;
    });
  };

  const generatePrompt = (currentSelections: Record<string, string[]>) => {
    const parts: string[] = [];

    // Build prompt in logical order
    const order = ["style", "form", "gender", "subject", "colors", "beings", "environment", "atmosphere"];
    
    order.forEach((categoryId) => {
      const selected = currentSelections[categoryId] || [];
      selected.forEach((optionId) => {
        const text = optionToPromptMap[optionId];
        if (text) {
          parts.push(text);
        }
      });
    });

    if (parts.length > 0) {
      const generatedPrompt = parts.join(", ");
      const finalPrompt = basePrompt 
        ? `${basePrompt}, ${generatedPrompt}`
        : generatedPrompt;
      onPromptChange(finalPrompt);
    }
  };

  const clearAll = () => {
    setSelections({});
    onPromptChange(basePrompt);
  };

  const hasSelections = Object.values(selections).some((arr) => arr.length > 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
          ✨ Tùy Chọn Sáng Tạo
        </h3>
        {hasSelections && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="text-xs h-7">
            Xóa tất cả
          </Button>
        )}
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {promptCategories.map((category) => (
          <Collapsible
            key={category.id}
            open={openCategories.includes(category.id)}
            onOpenChange={() => toggleCategory(category.id)}
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between h-9 px-3 hover:bg-rose-soft/20"
              >
                <span className="flex items-center gap-2 text-sm">
                  <span>{category.emoji}</span>
                  <span>{category.title}</span>
                  {(selections[category.id]?.length || 0) > 0 && (
                    <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                      {selections[category.id]?.length}
                    </span>
                  )}
                </span>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform",
                    openCategories.includes(category.id) && "rotate-180"
                  )}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap gap-1.5 p-2 pl-4"
              >
                {category.options.map((option) => {
                  const isSelected = selections[category.id]?.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      onClick={() => toggleOption(category.id, option.id, !!category.multiSelect)}
                      className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-all",
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-muted/50 hover:bg-muted text-foreground/80"
                      )}
                    >
                      {option.emoji && <span>{option.emoji}</span>}
                      <span>{option.label}</span>
                      {isSelected && <Check className="w-3 h-3" />}
                    </button>
                  );
                })}
              </motion.div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>

      {hasSelections && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-2"
        >
          <span className="font-medium">Đã chọn: </span>
          {Object.entries(selections)
            .filter(([, values]) => values.length > 0)
            .map(([categoryId, values]) => {
              const category = promptCategories.find((c) => c.id === categoryId);
              return values.map((v) => {
                const option = category?.options.find((o) => o.id === v);
                return option?.emoji ? `${option.emoji} ${option.label}` : option?.label;
              }).join(", ");
            })
            .join(" • ")}
        </motion.div>
      )}
    </div>
  );
}
