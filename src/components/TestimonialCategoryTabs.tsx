import { motion } from "framer-motion";
import { useTestimonialTags } from "@/hooks/useTestimonialTags";
import { cn } from "@/lib/utils";

interface TestimonialCategoryTabsProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  testimonialCounts?: Record<string, number>;
}

const TestimonialCategoryTabs = ({
  selectedCategory,
  onCategoryChange,
  testimonialCounts = {},
}: TestimonialCategoryTabsProps) => {
  const { tags, isLoading } = useTestimonialTags();

  if (isLoading) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-12 w-32 rounded-full bg-muted animate-pulse flex-shrink-0"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Gradient fade edges */}
      <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide px-2">
        {/* All categories tab */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onCategoryChange(null)}
          className={cn(
            "flex-shrink-0 px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center gap-2",
            selectedCategory === null
              ? "bg-gradient-to-r from-primary to-gold text-primary-foreground shadow-lg shadow-primary/25"
              : "bg-card/80 border border-border/50 text-foreground hover:border-primary/50 hover:bg-card"
          )}
        >
          <span className="text-lg">✨</span>
          <span>Tất cả</span>
        </motion.button>

        {/* Category tabs */}
        {tags.map((tag, index) => {
          const count = testimonialCounts[tag.name] || 0;
          const isSelected = selectedCategory === tag.name;
          
          return (
            <motion.button
              key={tag.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onCategoryChange(tag.name)}
              className={cn(
                "flex-shrink-0 px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center gap-2",
                isSelected
                  ? "bg-gradient-to-r from-primary to-gold text-primary-foreground shadow-lg shadow-primary/25"
                  : "bg-card/80 border border-border/50 text-foreground hover:border-primary/50 hover:bg-card"
              )}
            >
              <span className="text-lg">{tag.icon || "🌟"}</span>
              <span>{tag.name}</span>
              {count > 0 && (
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  isSelected 
                    ? "bg-white/20" 
                    : "bg-primary/10 text-primary"
                )}>
                  {count}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default TestimonialCategoryTabs;
