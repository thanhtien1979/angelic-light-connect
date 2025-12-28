import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const useSavedMoments = () => {
  const { user } = useAuth();
  const [savedMomentIds, setSavedMomentIds] = useState<Set<string>>(new Set());
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

  useEffect(() => {
    fetchSavedMoments();
  }, [fetchSavedMoments]);

  const toggleSave = useCallback(
    async (momentId: string) => {
      if (!user) {
        toast.error("Vui lòng đăng nhập để lưu khoảnh khắc");
        return;
      }

      const isSaved = savedMomentIds.has(momentId);

      try {
        if (isSaved) {
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
    isLoading,
    toggleSave,
    isSaved,
    refetch: fetchSavedMoments,
  };
};
