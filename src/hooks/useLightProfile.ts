import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface LightProfile {
  id: string;
  user_id: string;
  light_score: number;
  energy_direction: "ascending" | "stable" | "descending";
  warning_level: number;
  last_light_check: string | null;
  created_at: string;
  updated_at: string;
}

export interface LightBehavior {
  id: string;
  user_id: string;
  behavior_type: string;
  sentiment_score: number;
  energy_type: string;
  context: Record<string, unknown> | null;
  analyzed_at: string;
}

export interface LightIntervention {
  id: string;
  user_id: string;
  intervention_type: string;
  level: number;
  reason: string;
  angel_message: string;
  acknowledged: boolean;
  created_at: string;
}

export interface DailyEnergy {
  date: string;
  avgScore: number;
  count: number;
}

export function useLightProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<LightProfile | null>(null);
  const [behaviors, setBehaviors] = useState<LightBehavior[]>([]);
  const [interventions, setInterventions] = useState<LightIntervention[]>([]);
  const [dailyEnergy, setDailyEnergy] = useState<DailyEnergy[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLightProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setBehaviors([]);
      setInterventions([]);
      setDailyEnergy([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      // Fetch light profile
      const { data: profileData, error: profileError } = await supabase
        .from("user_light_profile")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      setProfile(profileData as LightProfile | null);

      // Fetch recent behaviors (last 30)
      const { data: behaviorsData, error: behaviorsError } = await supabase
        .from("light_behaviors")
        .select("*")
        .eq("user_id", user.id)
        .order("analyzed_at", { ascending: false })
        .limit(30);

      if (behaviorsError) throw behaviorsError;
      setBehaviors((behaviorsData || []) as LightBehavior[]);

      // Calculate daily energy for chart (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: chartData, error: chartError } = await supabase
        .from("light_behaviors")
        .select("sentiment_score, analyzed_at")
        .eq("user_id", user.id)
        .gte("analyzed_at", sevenDaysAgo.toISOString())
        .order("analyzed_at", { ascending: true });

      if (chartError) throw chartError;

      // Group by date and calculate average
      const grouped: Record<string, { total: number; count: number }> = {};
      (chartData || []).forEach((item: { sentiment_score: number; analyzed_at: string }) => {
        const date = new Date(item.analyzed_at).toISOString().split("T")[0];
        if (!grouped[date]) {
          grouped[date] = { total: 0, count: 0 };
        }
        grouped[date].total += item.sentiment_score;
        grouped[date].count += 1;
      });

      const daily = Object.entries(grouped).map(([date, { total, count }]) => ({
        date,
        avgScore: Math.round((total / count) * 100) / 100,
        count,
      }));

      setDailyEnergy(daily);

      // Fetch unacknowledged interventions
      const { data: interventionsData, error: interventionsError } = await supabase
        .from("light_interventions")
        .select("*")
        .eq("user_id", user.id)
        .eq("acknowledged", false)
        .order("triggered_at", { ascending: false })
        .limit(5);

      if (interventionsError) throw interventionsError;
      setInterventions((interventionsData || []) as LightIntervention[]);
    } catch (error) {
      console.error("Error fetching light profile:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const acknowledgeIntervention = useCallback(
    async (interventionId: string) => {
      if (!user) return;

      try {
        const { error } = await supabase
          .from("light_interventions")
          .update({ acknowledged: true, acknowledged_at: new Date().toISOString() })
          .eq("id", interventionId)
          .eq("user_id", user.id);

        if (error) throw error;

        setInterventions((prev) => prev.filter((i) => i.id !== interventionId));
      } catch (error) {
        console.error("Error acknowledging intervention:", error);
      }
    },
    [user]
  );

  useEffect(() => {
    fetchLightProfile();
  }, [fetchLightProfile]);

  return {
    profile,
    behaviors,
    interventions,
    dailyEnergy,
    isLoading,
    refetch: fetchLightProfile,
    acknowledgeIntervention,
  };
}
