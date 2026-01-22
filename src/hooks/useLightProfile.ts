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

export interface LightStats {
  totalBehaviors: number;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  avgSentiment: number;
  currentStreak: number;
  longestStreak: number;
  firstActivityDate: string | null;
  daysOnJourney: number;
}

export interface LightMilestone {
  id: string;
  type: "score" | "streak" | "behavior" | "journey";
  title: string;
  description: string;
  achieved: boolean;
  achievedAt?: string;
  icon: string;
  requirement: number;
  current: number;
}

export function useLightProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<LightProfile | null>(null);
  const [behaviors, setBehaviors] = useState<LightBehavior[]>([]);
  const [interventions, setInterventions] = useState<LightIntervention[]>([]);
  const [dailyEnergy, setDailyEnergy] = useState<DailyEnergy[]>([]);
  const [monthlyEnergy, setMonthlyEnergy] = useState<DailyEnergy[]>([]);
  const [stats, setStats] = useState<LightStats | null>(null);
  const [milestones, setMilestones] = useState<LightMilestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const calculateMilestones = useCallback((
    lightScore: number,
    currentStats: LightStats | null,
    totalBehaviors: number
  ): LightMilestone[] => {
    const milestoneDefs = [
      {
        id: "first_light",
        type: "behavior" as const,
        title: "Tia Sáng Đầu Tiên",
        description: "Gửi tin nhắn đầu tiên đến Angel",
        icon: "sparkles",
        requirement: 1,
        getValue: () => totalBehaviors,
      },
      {
        id: "week_streak",
        type: "streak" as const,
        title: "7 Ngày Ánh Sáng",
        description: "Duy trì năng lượng tích cực 7 ngày liên tục",
        icon: "flame",
        requirement: 7,
        getValue: () => currentStats?.currentStreak || 0,
      },
      {
        id: "stable_soul",
        type: "score" as const,
        title: "Tâm Hồn Ổn Định",
        description: "Đạt Light Score ≥ 70 điểm",
        icon: "heart",
        requirement: 70,
        getValue: () => lightScore,
      },
      {
        id: "angel_friend",
        type: "behavior" as const,
        title: "Người Bạn Của Angel",
        description: "Tương tác với Angel 100 lần",
        icon: "users",
        requirement: 100,
        getValue: () => totalBehaviors,
      },
      {
        id: "radiant_light",
        type: "score" as const,
        title: "Ánh Sáng Rực Rỡ",
        description: "Đạt Light Score 90+ điểm",
        icon: "sun",
        requirement: 90,
        getValue: () => lightScore,
      },
      {
        id: "month_journey",
        type: "journey" as const,
        title: "30 Ngày Hành Trình",
        description: "Tham gia hành trình 30 ngày",
        icon: "calendar",
        requirement: 30,
        getValue: () => currentStats?.daysOnJourney || 0,
      },
      {
        id: "peaceful_warrior",
        type: "streak" as const,
        title: "Chiến Binh Bình An",
        description: "Streak 30 ngày năng lượng tích cực",
        icon: "shield",
        requirement: 30,
        getValue: () => currentStats?.longestStreak || 0,
      },
      {
        id: "light_master",
        type: "behavior" as const,
        title: "Bậc Thầy Ánh Sáng",
        description: "Tương tác với Angel 500 lần",
        icon: "crown",
        requirement: 500,
        getValue: () => totalBehaviors,
      },
    ];

    return milestoneDefs.map((def) => {
      const current = def.getValue();
      return {
        id: def.id,
        type: def.type,
        title: def.title,
        description: def.description,
        icon: def.icon,
        requirement: def.requirement,
        current,
        achieved: current >= def.requirement,
      };
    });
  }, []);

  const fetchLightProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setBehaviors([]);
      setInterventions([]);
      setDailyEnergy([]);
      setMonthlyEnergy([]);
      setStats(null);
      setMilestones([]);
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

      // Fetch recent behaviors (last 50)
      const { data: behaviorsData, error: behaviorsError } = await supabase
        .from("light_behaviors")
        .select("*")
        .eq("user_id", user.id)
        .order("analyzed_at", { ascending: false })
        .limit(50);

      if (behaviorsError) throw behaviorsError;
      const allBehaviors = (behaviorsData || []) as LightBehavior[];
      setBehaviors(allBehaviors);

      // Calculate 7-day energy
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: chartData7, error: chartError7 } = await supabase
        .from("light_behaviors")
        .select("sentiment_score, analyzed_at")
        .eq("user_id", user.id)
        .gte("analyzed_at", sevenDaysAgo.toISOString())
        .order("analyzed_at", { ascending: true });

      if (chartError7) throw chartError7;

      // Group by date for 7-day chart
      const grouped7: Record<string, { total: number; count: number }> = {};
      (chartData7 || []).forEach((item: { sentiment_score: number; analyzed_at: string }) => {
        const date = new Date(item.analyzed_at).toISOString().split("T")[0];
        if (!grouped7[date]) {
          grouped7[date] = { total: 0, count: 0 };
        }
        grouped7[date].total += item.sentiment_score;
        grouped7[date].count += 1;
      });

      const daily7 = Object.entries(grouped7).map(([date, { total, count }]) => ({
        date,
        avgScore: Math.round((total / count) * 100) / 100,
        count,
      }));
      setDailyEnergy(daily7);

      // Calculate 30-day energy
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: chartData30, error: chartError30 } = await supabase
        .from("light_behaviors")
        .select("sentiment_score, analyzed_at")
        .eq("user_id", user.id)
        .gte("analyzed_at", thirtyDaysAgo.toISOString())
        .order("analyzed_at", { ascending: true });

      if (chartError30) throw chartError30;

      // Group by date for 30-day chart
      const grouped30: Record<string, { total: number; count: number }> = {};
      (chartData30 || []).forEach((item: { sentiment_score: number; analyzed_at: string }) => {
        const date = new Date(item.analyzed_at).toISOString().split("T")[0];
        if (!grouped30[date]) {
          grouped30[date] = { total: 0, count: 0 };
        }
        grouped30[date].total += item.sentiment_score;
        grouped30[date].count += 1;
      });

      const monthly = Object.entries(grouped30).map(([date, { total, count }]) => ({
        date,
        avgScore: Math.round((total / count) * 100) / 100,
        count,
      }));
      setMonthlyEnergy(monthly);

      // Calculate stats
      const { data: allBehaviorsData, error: allBehaviorsError } = await supabase
        .from("light_behaviors")
        .select("sentiment_score, analyzed_at")
        .eq("user_id", user.id)
        .order("analyzed_at", { ascending: true });

      if (allBehaviorsError) throw allBehaviorsError;

      const allData = allBehaviorsData || [];
      const totalBehaviors = allData.length;
      const positiveCount = allData.filter((b) => b.sentiment_score > 0.3).length;
      const neutralCount = allData.filter((b) => b.sentiment_score >= -0.3 && b.sentiment_score <= 0.3).length;
      const negativeCount = allData.filter((b) => b.sentiment_score < -0.3).length;
      const avgSentiment = totalBehaviors > 0
        ? allData.reduce((sum, b) => sum + b.sentiment_score, 0) / totalBehaviors
        : 0;

      // Calculate streaks
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      
      const behaviorsByDate = new Map<string, number[]>();
      allData.forEach((b) => {
        const date = new Date(b.analyzed_at).toISOString().split("T")[0];
        if (!behaviorsByDate.has(date)) {
          behaviorsByDate.set(date, []);
        }
        behaviorsByDate.get(date)!.push(b.sentiment_score);
      });

      const sortedDates = Array.from(behaviorsByDate.keys()).sort();
      let previousDate: Date | null = null;

      sortedDates.forEach((dateStr) => {
        const scores = behaviorsByDate.get(dateStr)!;
        const dayAvg = scores.reduce((a, b) => a + b, 0) / scores.length;
        const currentDate = new Date(dateStr);

        if (dayAvg > 0) {
          if (previousDate) {
            const diffDays = Math.floor((currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
              tempStreak++;
            } else {
              tempStreak = 1;
            }
          } else {
            tempStreak = 1;
          }
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 0;
        }
        previousDate = currentDate;
      });

      // Check if current streak is still active
      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      
      if (sortedDates.includes(today) || sortedDates.includes(yesterday)) {
        currentStreak = tempStreak;
      }

      const firstActivityDate = allData.length > 0 ? allData[0].analyzed_at : null;
      const daysOnJourney = firstActivityDate
        ? Math.floor((Date.now() - new Date(firstActivityDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
        : 0;

      const calculatedStats: LightStats = {
        totalBehaviors,
        positiveCount,
        neutralCount,
        negativeCount,
        avgSentiment: Math.round(avgSentiment * 100) / 100,
        currentStreak,
        longestStreak,
        firstActivityDate,
        daysOnJourney,
      };
      setStats(calculatedStats);

      // Calculate milestones
      const lightScore = profileData?.light_score ?? 50;
      const calculatedMilestones = calculateMilestones(lightScore, calculatedStats, totalBehaviors);
      setMilestones(calculatedMilestones);

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
  }, [user, calculateMilestones]);

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
    monthlyEnergy,
    stats,
    milestones,
    isLoading,
    refetch: fetchLightProfile,
    acknowledgeIntervention,
  };
}
