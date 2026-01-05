import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TestimonialTagDisplayProps {
  tags: string[];
  size?: "xs" | "sm";
  className?: string;
}

// Map tag names to their icons and colors
const tagMetaMap: Record<string, { icon: string; color: string }> = {
  "Chữa lành tâm hồn": { icon: "💚", color: "emerald" },
  "Thiền định": { icon: "🧘", color: "purple" },
  "Giác ngộ": { icon: "✨", color: "amber" },
  "Kết nối tâm linh": { icon: "🙏", color: "rose" },
  "Bình an nội tâm": { icon: "🕊️", color: "sky" },
  "Tình yêu vô điều kiện": { icon: "💗", color: "pink" },
  "Tri ân vũ trụ": { icon: "🌟", color: "gold" },
  "Hành trình 5D": { icon: "🌈", color: "violet" },
};

const tagColorMap: Record<string, string> = {
  emerald: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  purple: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/20",
  amber: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/20",
  rose: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/20",
  sky: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/20",
  pink: "bg-pink-500/15 text-pink-700 dark:text-pink-300 border-pink-500/20",
  gold: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300 border-yellow-500/20",
  violet: "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/20",
};

const TestimonialTagDisplay = ({
  tags,
  size = "sm",
  className,
}: TestimonialTagDisplayProps) => {
  if (!tags || tags.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {tags.slice(0, 3).map((tagName) => {
        const meta = tagMetaMap[tagName] || { icon: "🏷️", color: "gray" };
        const colorClass = tagColorMap[meta.color] || "bg-muted text-muted-foreground";

        return (
          <Badge
            key={tagName}
            variant="outline"
            className={cn(
              "border font-normal",
              colorClass,
              size === "xs" ? "text-[10px] py-0 px-1.5" : "text-xs py-0.5 px-2"
            )}
          >
            <span className="mr-0.5">{meta.icon}</span>
            {size === "xs" ? tagName.split(" ")[0] : tagName}
          </Badge>
        );
      })}
      {tags.length > 3 && (
        <Badge variant="outline" className={cn(
          "bg-muted/50 text-muted-foreground border-border",
          size === "xs" ? "text-[10px] py-0 px-1.5" : "text-xs py-0.5 px-2"
        )}>
          +{tags.length - 3}
        </Badge>
      )}
    </div>
  );
};

export default TestimonialTagDisplay;
