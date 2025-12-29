import { motion } from "framer-motion";
import { Search, SlidersHorizontal, Sparkles, Clock, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SortBy } from "@/hooks/useTestimonials";

interface TestimonialFiltersProps {
  sortBy: SortBy;
  setSortBy: (sortBy: SortBy) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
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
}: TestimonialFiltersProps) => {
  const currentSort = sortOptions.find(opt => opt.value === sortBy) || sortOptions[0];
  const SortIcon = currentSort.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-8"
    >
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

      {/* Sort dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2 min-w-[160px] justify-between">
            <div className="flex items-center gap-2">
              <SortIcon className="w-4 h-4 text-primary" />
              <span>{currentSort.label}</span>
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
    </motion.div>
  );
};

export default TestimonialFilters;
