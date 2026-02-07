import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface GiftStats {
  totalSent: number;
  totalReceived: number;
  totalAmountSent: number;
  totalAmountReceived: number;
  lightScoreEarned: number;
  sponsorRank: number | null;
}

export const useGiftStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<GiftStats>({
    totalSent: 0,
    totalReceived: 0,
    totalAmountSent: 0,
    totalAmountReceived: 0,
    lightScoreEarned: 0,
    sponsorRank: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      // Fetch sent gifts
      const { data: sentGifts } = await supabase
        .from("gift_transactions")
        .select("amount, light_score_points")
        .eq("sender_id", user.id)
        .eq("status", "completed");

      // Fetch received gifts
      const { data: receivedGifts } = await supabase
        .from("gift_transactions")
        .select("amount")
        .eq("receiver_id", user.id)
        .eq("status", "completed");

      // Calculate totals
      const totalSent = sentGifts?.length || 0;
      const totalReceived = receivedGifts?.length || 0;
      const totalAmountSent = sentGifts?.reduce((sum, g) => sum + parseFloat(String(g.amount)), 0) || 0;
      const totalAmountReceived = receivedGifts?.reduce((sum, g) => sum + parseFloat(String(g.amount)), 0) || 0;
      const lightScoreEarned = sentGifts?.reduce((sum, g) => sum + (g.light_score_points || 0), 0) || 0;

      // Calculate rank among all sponsors
      const { data: allSenders } = await supabase
        .from("gift_transactions")
        .select("sender_id, amount")
        .eq("status", "completed");

      let sponsorRank: number | null = null;
      if (allSenders && totalAmountSent > 0) {
        const aggregated = new Map<string, number>();
        allSenders.forEach((tx) => {
          const current = aggregated.get(tx.sender_id) || 0;
          aggregated.set(tx.sender_id, current + parseFloat(String(tx.amount)));
        });

        const sorted = Array.from(aggregated.entries())
          .sort((a, b) => b[1] - a[1]);

        const userIndex = sorted.findIndex(([id]) => id === user.id);
        if (userIndex !== -1) {
          sponsorRank = userIndex + 1;
        }
      }

      setStats({
        totalSent,
        totalReceived,
        totalAmountSent,
        totalAmountReceived,
        lightScoreEarned,
        sponsorRank,
      });
    } catch (error) {
      console.error("Error fetching gift stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("gift_stats_realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "gift_transactions",
        },
        (payload) => {
          const tx = payload.new as { sender_id: string; receiver_id: string };
          if (tx.sender_id === user.id || tx.receiver_id === user.id) {
            fetchStats();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchStats]);

  return {
    stats,
    isLoading,
    refetch: fetchStats,
  };
};
