import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface TestimonialTag {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  sort_order: number;
}

export const useTestimonialTags = () => {
  const [tags, setTags] = useState<TestimonialTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTags = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("testimonial_tags")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;

      setTags(data || []);
    } catch (error) {
      console.error("Error fetching testimonial tags:", error);
      // Fallback hardcoded tags
      setTags([
        { id: "1", name: "Chữa lành tâm hồn", icon: "💚", color: "emerald", sort_order: 1 },
        { id: "2", name: "Thiền định", icon: "🧘", color: "purple", sort_order: 2 },
        { id: "3", name: "Giác ngộ", icon: "✨", color: "amber", sort_order: 3 },
        { id: "4", name: "Kết nối tâm linh", icon: "🙏", color: "rose", sort_order: 4 },
        { id: "5", name: "Bình an nội tâm", icon: "🕊️", color: "sky", sort_order: 5 },
        { id: "6", name: "Tình yêu vô điều kiện", icon: "💗", color: "pink", sort_order: 6 },
        { id: "7", name: "Tri ân vũ trụ", icon: "🌟", color: "gold", sort_order: 7 },
        { id: "8", name: "Hành trình 5D", icon: "🌈", color: "violet", sort_order: 8 },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  return {
    tags,
    isLoading,
    refetch: fetchTags,
  };
};
