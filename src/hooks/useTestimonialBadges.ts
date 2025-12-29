import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type BadgeType = "first_story" | "popular" | "viral" | "conversational" | "featured";

export interface TestimonialBadge {
  id: string;
  user_id: string;
  badge_type: BadgeType;
  testimonial_id: string | null;
  unlocked_at: string;
}

export interface BadgeInfo {
  type: BadgeType;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const BADGE_INFO: Record<BadgeType, BadgeInfo> = {
  first_story: {
    type: "first_story",
    name: "Người Tiên Phong",
    description: "Chia sẻ câu chuyện đầu tiên",
    icon: "🌟",
    color: "from-amber-400 to-orange-500",
  },
  popular: {
    type: "popular",
    name: "Được Yêu Thích",
    description: "Nhận 10+ tim",
    icon: "❤️",
    color: "from-pink-400 to-rose-500",
  },
  viral: {
    type: "viral",
    name: "Lan Tỏa",
    description: "Nhận 50+ tim",
    icon: "🔥",
    color: "from-orange-400 to-red-500",
  },
  conversational: {
    type: "conversational",
    name: "Tạo Thảo Luận",
    description: "Nhận 20+ bình luận",
    icon: "💬",
    color: "from-blue-400 to-indigo-500",
  },
  featured: {
    type: "featured",
    name: "Nổi Bật",
    description: "Được chọn làm nổi bật",
    icon: "⭐",
    color: "from-yellow-400 to-amber-500",
  },
};

export const useTestimonialBadges = (userId?: string) => {
  const { user } = useAuth();
  const [badges, setBadges] = useState<TestimonialBadge[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const targetUserId = userId || user?.id;

  const fetchBadges = useCallback(async () => {
    if (!targetUserId) {
      setBadges([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_testimonial_badges")
        .select("*")
        .eq("user_id", targetUserId)
        .order("unlocked_at", { ascending: false });

      if (error) throw error;
      
      // Type assertion since database returns string for enum
      setBadges((data || []).map(b => ({
        ...b,
        badge_type: b.badge_type as BadgeType,
      })));
    } catch (error) {
      console.error("Error fetching badges:", error);
      setBadges([]);
    } finally {
      setIsLoading(false);
    }
  }, [targetUserId]);

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  // Get unique badge types (user might have same badge for multiple testimonials)
  const uniqueBadgeTypes = [...new Set(badges.map(b => b.badge_type))];
  const badgeInfoList = uniqueBadgeTypes.map(type => BADGE_INFO[type]);

  return {
    badges,
    badgeInfoList,
    isLoading,
    refetch: fetchBadges,
  };
};
