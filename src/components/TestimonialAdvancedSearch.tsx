import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Calendar, Filter, X, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import TestimonialTagSelector from "@/components/TestimonialTagSelector";
import { TestimonialTag } from "@/hooks/useTestimonialTags";

interface AdvancedSearchFilters {
  query: string;
  tags: string[];
  dateFrom?: Date;
  dateTo?: Date;
}

interface TestimonialAdvancedSearchProps {
  tags: TestimonialTag[];
  onSearch: (filters: AdvancedSearchFilters) => void;
  initialFilters?: AdvancedSearchFilters;
}

const TestimonialAdvancedSearch = ({
  tags,
  onSearch,
  initialFilters,
}: TestimonialAdvancedSearchProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState(initialFilters?.query || "");
  const [selectedTags, setSelectedTags] = useState<string[]>(initialFilters?.tags || []);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(initialFilters?.dateFrom);
  const [dateTo, setDateTo] = useState<Date | undefined>(initialFilters?.dateTo);

  const activeFiltersCount = [
    query.trim() ? 1 : 0,
    selectedTags.length,
    dateFrom ? 1 : 0,
    dateTo ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const handleSearch = () => {
    onSearch({
      query,
      tags: selectedTags,
      dateFrom,
      dateTo,
    });
  };

  const handleClearAll = () => {
    setQuery("");
    setSelectedTags([]);
    setDateFrom(undefined);
    setDateTo(undefined);
    onSearch({ query: "", tags: [] });
  };

  const handleTagToggle = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter(t => t !== tagName));
    } else {
      setSelectedTags([...selectedTags, tagName]);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Main search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Tìm kiếm theo nội dung, tên người chia sẻ..."
            className="pl-10"
          />
        </div>
        
        <Button onClick={handleSearch} className="gap-2">
          <Search className="w-4 h-4" />
          Tìm
        </Button>

        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-2"
        >
          <Filter className="w-4 h-4" />
          Lọc
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {activeFiltersCount}
            </Badge>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
        </Button>
      </div>

      {/* Active filters badges */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Bộ lọc:</span>
          
          {query.trim() && (
            <Badge variant="secondary" className="gap-1">
              Từ khóa: "{query}"
              <button onClick={() => setQuery("")} className="ml-1 hover:text-destructive">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          
          {selectedTags.map(tag => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <button onClick={() => handleTagToggle(tag)} className="ml-1 hover:text-destructive">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          
          {dateFrom && (
            <Badge variant="secondary" className="gap-1">
              Từ: {format(dateFrom, "dd/MM/yyyy")}
              <button onClick={() => setDateFrom(undefined)} className="ml-1 hover:text-destructive">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          
          {dateTo && (
            <Badge variant="secondary" className="gap-1">
              Đến: {format(dateTo, "dd/MM/yyyy")}
              <button onClick={() => setDateTo(undefined)} className="ml-1 hover:text-destructive">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          <Button variant="ghost" size="sm" onClick={handleClearAll} className="text-xs h-7">
            Xóa tất cả
          </Button>
        </div>
      )}

      {/* Expanded filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 border border-border/30 rounded-xl bg-card/50 backdrop-blur-sm space-y-4">
              {/* Tags filter */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Chủ đề</p>
                <TestimonialTagSelector
                  tags={tags}
                  selectedTags={selectedTags}
                  onTagToggle={handleTagToggle}
                />
              </div>

              {/* Date range filter */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Khoảng thời gian</p>
                <div className="flex gap-2 flex-wrap">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Calendar className="w-4 h-4" />
                        {dateFrom ? format(dateFrom, "dd/MM/yyyy", { locale: vi }) : "Từ ngày"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={dateFrom}
                        onSelect={setDateFrom}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Calendar className="w-4 h-4" />
                        {dateTo ? format(dateTo, "dd/MM/yyyy", { locale: vi }) : "Đến ngày"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={dateTo}
                        onSelect={setDateTo}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Apply button */}
              <div className="flex justify-end">
                <Button onClick={handleSearch} className="gap-2">
                  <Search className="w-4 h-4" />
                  Áp dụng bộ lọc
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TestimonialAdvancedSearch;
