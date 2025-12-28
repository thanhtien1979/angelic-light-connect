import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface SavedMoment {
  id: string;
  spiritual_message: string;
  moment_type: string;
  display_name: string | null;
  likes_count: number;
  created_at: string;
  user_id: string;
  image_url?: string | null;
}

export const useSavedMoments = () => {
  const { user } = useAuth();
  const [savedMomentIds, setSavedMomentIds] = useState<Set<string>>(new Set());
  const [savedMoments, setSavedMoments] = useState<SavedMoment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSavedMoments = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("saved_moments")
        .select("moment_id")
        .eq("user_id", user.id);

      if (error) throw error;

      setSavedMomentIds(new Set(data?.map((s) => s.moment_id) || []));
    } catch (error) {
      console.error("Error fetching saved moments:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const fetchSavedMomentsWithDetails = useCallback(async () => {
    if (!user) return [];

    setIsLoading(true);
    try {
      // Get saved moment IDs
      const { data: savedData, error: savedError } = await supabase
        .from("saved_moments")
        .select("moment_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (savedError) throw savedError;

      if (!savedData || savedData.length === 0) {
        setSavedMoments([]);
        return [];
      }

      const momentIds = savedData.map((s) => s.moment_id);

      // Get full moment details
      const { data: moments, error: momentsError } = await supabase
        .from("shared_light_moments")
        .select("*")
        .in("id", momentIds);

      if (momentsError) throw momentsError;

      setSavedMoments(moments || []);
      return moments || [];
    } catch (error) {
      console.error("Error fetching saved moments with details:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSavedMoments();
  }, [fetchSavedMoments]);

  const toggleSave = useCallback(
    async (momentId: string) => {
      if (!user) {
        toast.error("Vui lòng đăng nhập để lưu khoảnh khắc");
        return;
      }

      const isSavedNow = savedMomentIds.has(momentId);

      try {
        if (isSavedNow) {
          const { error } = await supabase
            .from("saved_moments")
            .delete()
            .eq("user_id", user.id)
            .eq("moment_id", momentId);

          if (error) throw error;

          setSavedMomentIds((prev) => {
            const next = new Set(prev);
            next.delete(momentId);
            return next;
          });
          setSavedMoments((prev) => prev.filter((m) => m.id !== momentId));
          toast.success("Đã bỏ lưu khoảnh khắc");
        } else {
          const { error } = await supabase.from("saved_moments").insert({
            user_id: user.id,
            moment_id: momentId,
          });

          if (error) throw error;

          setSavedMomentIds((prev) => new Set(prev).add(momentId));
          toast.success("Đã lưu khoảnh khắc ✨");
        }
      } catch (error) {
        console.error("Error toggling save:", error);
        toast.error("Không thể thực hiện thao tác");
      }
    },
    [user, savedMomentIds]
  );

  const isSaved = useCallback(
    (momentId: string) => savedMomentIds.has(momentId),
    [savedMomentIds]
  );

  return {
    savedMomentIds,
    savedMoments,
    isLoading,
    toggleSave,
    isSaved,
    refetch: fetchSavedMoments,
    fetchSavedMomentsWithDetails,
  };
};
