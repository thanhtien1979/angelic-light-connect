import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { ReactionType } from "@/components/ReactionPicker";

interface ReactionCount {
  type: ReactionType;
  count: number;
}

interface MomentReactionsState {
  [momentId: string]: {
    userReaction: ReactionType | null;
    counts: ReactionCount[];
  };
}

export const useMomentReactions = (momentIds: string[]) => {
  const { user } = useAuth();
  const [reactionsState, setReactionsState] = useState<MomentReactionsState>({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch reactions for all moments
  const fetchReactions = useCallback(async () => {
    if (momentIds.length === 0) {
      setIsLoading(false);
      return;
    }

    try {
      // Fetch all reactions for these moments
      const { data: allReactions, error } = await supabase
        .from("moment_reactions")
        .select("moment_id, user_id, reaction_type")
        .in("moment_id", momentIds);

      if (error) throw error;

      // Process reactions
      const newState: MomentReactionsState = {};
      
      momentIds.forEach(momentId => {
        const momentReactions = allReactions?.filter(r => r.moment_id === momentId) || [];
        
        // Count by type
        const countMap: { [key: string]: number } = {};
        let userReaction: ReactionType | null = null;
        
        momentReactions.forEach(r => {
          countMap[r.reaction_type] = (countMap[r.reaction_type] || 0) + 1;
          if (r.user_id === user?.id) {
            userReaction = r.reaction_type as ReactionType;
          }
        });

        const counts: ReactionCount[] = Object.entries(countMap).map(([type, count]) => ({
          type: type as ReactionType,
          count,
        }));

        newState[momentId] = { userReaction, counts };
      });

      setReactionsState(newState);
    } catch (error) {
      console.error("Error fetching reactions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [momentIds, user?.id]);

  useEffect(() => {
    fetchReactions();
  }, [fetchReactions]);

  // Subscribe to realtime changes
  useEffect(() => {
    if (momentIds.length === 0) return;

    const channel = supabase
      .channel("moment-reactions-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "moment_reactions",
        },
        (payload) => {
          const momentId = (payload.new as any)?.moment_id || (payload.old as any)?.moment_id;
          if (momentIds.includes(momentId)) {
            fetchReactions();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [momentIds, fetchReactions]);

  // Add or update reaction
  const addReaction = useCallback(async (momentId: string, reactionType: ReactionType) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để thả cảm xúc");
      return;
    }

    // Optimistic update
    setReactionsState(prev => {
      const current = prev[momentId] || { userReaction: null, counts: [] };
      const oldReaction = current.userReaction;
      
      // Remove old reaction count
      let newCounts = current.counts.map(c => 
        c.type === oldReaction ? { ...c, count: Math.max(0, c.count - 1) } : c
      );
      
      // Add new reaction count
      const existingIndex = newCounts.findIndex(c => c.type === reactionType);
      if (existingIndex >= 0) {
        newCounts[existingIndex] = { ...newCounts[existingIndex], count: newCounts[existingIndex].count + 1 };
      } else {
        newCounts.push({ type: reactionType, count: 1 });
      }

      return {
        ...prev,
        [momentId]: {
          userReaction: reactionType,
          counts: newCounts.filter(c => c.count > 0),
        },
      };
    });

    try {
      // Upsert reaction (handles both insert and update)
      const { error } = await supabase
        .from("moment_reactions")
        .upsert(
          {
            moment_id: momentId,
            user_id: user.id,
            reaction_type: reactionType,
          },
          { onConflict: "moment_id,user_id" }
        );

      if (error) throw error;
    } catch (error) {
      console.error("Error adding reaction:", error);
      toast.error("Không thể thả cảm xúc");
      fetchReactions(); // Revert on error
    }
  }, [user, fetchReactions]);

  // Remove reaction
  const removeReaction = useCallback(async (momentId: string) => {
    if (!user) return;

    const currentReaction = reactionsState[momentId]?.userReaction;
    if (!currentReaction) return;

    // Optimistic update
    setReactionsState(prev => {
      const current = prev[momentId];
      if (!current) return prev;

      const newCounts = current.counts.map(c =>
        c.type === currentReaction ? { ...c, count: Math.max(0, c.count - 1) } : c
      ).filter(c => c.count > 0);

      return {
        ...prev,
        [momentId]: {
          userReaction: null,
          counts: newCounts,
        },
      };
    });

    try {
      const { error } = await supabase
        .from("moment_reactions")
        .delete()
        .eq("moment_id", momentId)
        .eq("user_id", user.id);

      if (error) throw error;
    } catch (error) {
      console.error("Error removing reaction:", error);
      toast.error("Không thể xóa cảm xúc");
      fetchReactions(); // Revert on error
    }
  }, [user, reactionsState, fetchReactions]);

  return {
    reactionsState,
    isLoading,
    addReaction,
    removeReaction,
    refetch: fetchReactions,
  };
};
