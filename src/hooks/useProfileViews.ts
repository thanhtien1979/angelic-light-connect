import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ProfileView {
  id: string;
  viewer_id: string;
  viewed_at: string;
  viewer_profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

export const useProfileViews = () => {
  const { user } = useAuth();
  const [views, setViews] = useState<ProfileView[]>([]);
  const [viewCount, setViewCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch profile views
  const fetchViews = useCallback(async () => {
    if (!user?.id) {
      setViews([]);
      setViewCount(0);
      setIsLoading(false);
      return;
    }

    try {
      // Get views from last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from("profile_views")
        .select("id, viewer_id, viewed_at")
        .eq("profile_id", user.id)
        .gte("viewed_at", thirtyDaysAgo.toISOString())
        .order("viewed_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      // Fetch viewer profiles
      const viewerIds = [...new Set((data || []).map(v => v.viewer_id))];
      
      if (viewerIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name, avatar_url")
          .in("id", viewerIds);

        const profileMap = new Map(
          (profiles || []).map(p => [p.id, { display_name: p.display_name, avatar_url: p.avatar_url }])
        );

        const viewsWithProfiles = (data || []).map(view => ({
          ...view,
          viewer_profile: profileMap.get(view.viewer_id),
        }));

        setViews(viewsWithProfiles);
      } else {
        setViews(data || []);
      }

      setViewCount(data?.length || 0);

      // Calculate unread (views from last 24 hours)
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      const recentViews = (data || []).filter(
        v => new Date(v.viewed_at) > oneDayAgo
      );
      setUnreadCount(recentViews.length);

    } catch (error) {
      console.error("Error fetching profile views:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Log a profile view via Edge Function (rate limited)
  const logProfileView = async (profileId: string) => {
    if (!user?.id || user.id === profileId) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/log-profile-view`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ profile_id: profileId }),
        }
      );

      if (!response.ok && response.status !== 429) {
        console.error("Error logging profile view:", await response.text());
      }
    } catch (error) {
      // Silently fail - this is not critical
      console.error("Error logging profile view:", error);
    }
  };

  // Clear unread count
  const markAsRead = () => {
    setUnreadCount(0);
  };

  useEffect(() => {
    fetchViews();
  }, [fetchViews]);

  // Realtime subscription for new views
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel("profile-views")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "profile_views",
          filter: `profile_id=eq.${user.id}`,
        },
        () => {
          fetchViews();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchViews]);

  return {
    views,
    viewCount,
    unreadCount,
    isLoading,
    logProfileView,
    markAsRead,
    refetch: fetchViews,
  };
};

export default useProfileViews;
