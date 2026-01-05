import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, Sparkles, Clock, Heart, Tag, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { SortBy } from "@/hooks/useTestimonials";
import { useTestimonialTags, TestimonialTag } from "@/hooks/useTestimonialTags";
import TestimonialTagSelector from "./TestimonialTagSelector";
import { useState } from "react";

interface TestimonialFiltersProps {
  sortBy: SortBy;
  setSortBy: (sortBy: SortBy) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTags?: string[];
  onTagsChange?: (tags: string[]) => void;
}

const sortOptions = [
  { value: "featured" as SortBy, label: "Nổi bật", icon: Sparkles },
  { value: "newest" as SortBy, label: "Mới nhất", icon: Clock },
  { value: "mostLiked" as SortBy, label: "Nhiều tim nhất", icon: Heart },
];

const TestimonialFilters = ({
  sortBy,
  setSortBy,
  searchQuery,
  setSearchQuery,
  selectedTags = [],
  onTagsChange,
}: TestimonialFiltersProps) => {
  const { tags } = useTestimonialTags();
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  
  const currentSort = sortOptions.find(opt => opt.value === sortBy) || sortOptions[0];
  const SortIcon = currentSort.icon;

  const handleTagToggle = (tagName: string) => {
    if (!onTagsChange) return;
    
    if (selectedTags.includes(tagName)) {
      onTagsChange(selectedTags.filter(t => t !== tagName));
    } else {
      onTagsChange([...selectedTags, tagName]);
    }
  };

  const clearAllTags = () => {
    onTagsChange?.([]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-4 mb-8"
    >
      {/* Search and Sort Row */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm nhân chứng..."
            className="pl-10 bg-card/50 border-border/50"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Tag filter toggle */}
          {onTagsChange && (
            <Collapsible open={isTagsOpen} onOpenChange={setIsTagsOpen}>
              <CollapsibleTrigger asChild>
                <Button 
                  variant={selectedTags.length > 0 ? "default" : "outline"} 
                  className="gap-2"
                >
                  <Tag className="w-4 h-4" />
                  <span className="hidden sm:inline">Chủ đề</span>
                  {selectedTags.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {selectedTags.length}
                    </Badge>
                  )}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          )}

          {/* Sort dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 min-w-[140px] justify-between">
                <div className="flex items-center gap-2">
                  <SortIcon className="w-4 h-4 text-primary" />
                  <span className="hidden sm:inline">{currentSort.label}</span>
                </div>
                <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {sortOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={`gap-2 ${sortBy === option.value ? "bg-primary/10" : ""}`}
                  >
                    <Icon className={`w-4 h-4 ${sortBy === option.value ? "text-primary" : "text-muted-foreground"}`} />
                    {option.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tags Collapsible Section */}
      {onTagsChange && (
        <Collapsible open={isTagsOpen} onOpenChange={setIsTagsOpen}>
          <CollapsibleContent>
            <AnimatePresence>
              {isTagsOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-foreground">Lọc theo chủ đề tâm linh</p>
                      {selectedTags.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearAllTags}
                          className="text-muted-foreground hover:text-foreground gap-1 h-7 px-2"
                        >
                          <X className="w-3 h-3" />
                          Xóa bộ lọc
                        </Button>
                      )}
                    </div>
                    <TestimonialTagSelector
                      tags={tags}
                      selectedTags={selectedTags}
                      onTagToggle={handleTagToggle}
                      size="md"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Active tag filters preview (when collapsed) */}
      {!isTagsOpen && selectedTags.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-wrap items-center gap-2"
        >
          <span className="text-sm text-muted-foreground">Đang lọc:</span>
          {selectedTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-destructive/20"
              onClick={() => handleTagToggle(tag)}
            >
              {tag}
              <X className="w-3 h-3" />
            </Badge>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default TestimonialFilters;
