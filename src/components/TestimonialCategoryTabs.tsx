import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useTestimonialTags } from "@/hooks/useTestimonialTags";
import { cn } from "@/lib/utils";

interface TestimonialCategoryTabsProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  testimonialCounts?: Record<string, number>;
  showDetailLinks?: boolean;
}

const TestimonialCategoryTabs = ({
  selectedCategory,
  onCategoryChange,
  testimonialCounts = {},
  showDetailLinks = true,
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
            <div key={tag.id} className="flex-shrink-0 flex items-center gap-1">
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onCategoryChange(tag.name)}
                className={cn(
                  "px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center gap-2",
                  isSelected
                    ? "bg-gradient-to-r from-primary to-gold text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-card/80 border border-border/50 text-foreground hover:border-primary/50 hover:bg-card",
                  showDetailLinks && count > 0 ? "rounded-r-lg" : ""
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
              
              {/* Detail link */}
              {showDetailLinks && count > 0 && (
                <Link 
                  to={`/testimonials/category/${encodeURIComponent(tag.name)}`}
                  className={cn(
                    "p-3 rounded-full transition-all duration-300",
                    isSelected
                      ? "bg-primary/80 text-primary-foreground hover:bg-primary"
                      : "bg-card/80 border border-border/50 text-muted-foreground hover:text-primary hover:border-primary/50"
                  )}
                  title={`Xem chi tiết ${tag.name}`}
                >
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TestimonialCategoryTabs;
