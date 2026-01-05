import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TestimonialTag } from "@/hooks/useTestimonialTags";
import { cn } from "@/lib/utils";

interface TestimonialTagSelectorProps {
  tags: TestimonialTag[];
  selectedTags: string[];
  onTagToggle: (tagName: string) => void;
  multiSelect?: boolean;
  size?: "sm" | "md";
  className?: string;
}

const tagColorMap: Record<string, string> = {
  emerald: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30",
  purple: "bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30 hover:bg-purple-500/30",
  amber: "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/30",
  rose: "bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30 hover:bg-rose-500/30",
  sky: "bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-500/30 hover:bg-sky-500/30",
  pink: "bg-pink-500/20 text-pink-700 dark:text-pink-300 border-pink-500/30 hover:bg-pink-500/30",
  gold: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30 hover:bg-yellow-500/30",
  violet: "bg-violet-500/20 text-violet-700 dark:text-violet-300 border-violet-500/30 hover:bg-violet-500/30",
};

const selectedColorMap: Record<string, string> = {
  emerald: "bg-emerald-500 text-white border-emerald-600",
  purple: "bg-purple-500 text-white border-purple-600",
  amber: "bg-amber-500 text-white border-amber-600",
  rose: "bg-rose-500 text-white border-rose-600",
  sky: "bg-sky-500 text-white border-sky-600",
  pink: "bg-pink-500 text-white border-pink-600",
  gold: "bg-yellow-500 text-white border-yellow-600",
  violet: "bg-violet-500 text-white border-violet-600",
};

const TestimonialTagSelector = ({
  tags,
  selectedTags,
  onTagToggle,
  multiSelect = true,
  size = "md",
  className,
}: TestimonialTagSelectorProps) => {
  const isSelected = (tagName: string) => selectedTags.includes(tagName);

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {tags.map((tag, index) => {
        const selected = isSelected(tag.name);
        const colorClass = tag.color 
          ? (selected ? selectedColorMap[tag.color] : tagColorMap[tag.color])
          : (selected ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80");

        return (
          <motion.div
            key={tag.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03 }}
          >
            <Badge
              variant="outline"
              className={cn(
                "cursor-pointer transition-all duration-200 border",
                colorClass,
                size === "sm" ? "text-xs py-0.5 px-2" : "text-sm py-1 px-3",
                selected && "ring-2 ring-offset-1 ring-primary/50"
              )}
              onClick={() => onTagToggle(tag.name)}
            >
              <span className="mr-1">{tag.icon}</span>
              {tag.name}
              {selected && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-1"
                >
                  <Check className="w-3 h-3 inline" />
                </motion.span>
              )}
            </Badge>
          </motion.div>
        );
      })}
    </div>
  );
};

export default TestimonialTagSelector;
