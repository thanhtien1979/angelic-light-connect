import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { startOfWeek, startOfMonth, format, differenceInCalendarDays, parseISO } from 'date-fns';

export interface BreathingStats {
  weeklyMinutes: number;
  weeklySessions: number;
  monthlyMinutes: number;
  monthlySessions: number;
  presenceDays: number; // Consecutive days streak
  lastPracticeDate: string | null;
}

const PRESENCE_INDICATOR_KEY = 'breathing-presence-indicator-visible';

export const useBreathingStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<BreathingStats>({
    weeklyMinutes: 0,
    weeklySessions: 0,
    monthlyMinutes: 0,
    monthlySessions: 0,
    presenceDays: 0,
    lastPracticeDate: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPresenceIndicator, setShowPresenceIndicator] = useState(() => {
    const stored = localStorage.getItem(PRESENCE_INDICATOR_KEY);
    return stored !== 'false'; // Default to true
  });

  const togglePresenceIndicator = useCallback((show: boolean) => {
    setShowPresenceIndicator(show);
    localStorage.setItem(PRESENCE_INDICATOR_KEY, show ? 'true' : 'false');
  }, []);

  const fetchStats = useCallback(async () => {
    if (!user) {
      setStats({
        weeklyMinutes: 0,
        weeklySessions: 0,
        monthlyMinutes: 0,
        monthlySessions: 0,
        presenceDays: 0,
        lastPracticeDate: null,
      });
      return;
    }

    setIsLoading(true);
    try {
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
      const monthStart = startOfMonth(now);

      // Fetch all sessions for the current month (includes week data)
      const { data, error } = await supabase
        .from('breathing_session_history')
        .select('duration_seconds, completed_at')
        .eq('user_id', user.id)
        .gte('completed_at', monthStart.toISOString())
        .order('completed_at', { ascending: false });

      if (error) throw error;

      // Calculate weekly and monthly stats
      let weeklyMinutes = 0;
      let weeklySessions = 0;
      let monthlyMinutes = 0;
      let monthlySessions = 0;

      data?.forEach(session => {
        const sessionDate = new Date(session.completed_at);
        const minutes = Math.round(session.duration_seconds / 60);
        
        monthlyMinutes += minutes;
        monthlySessions++;

        if (sessionDate >= weekStart) {
          weeklyMinutes += minutes;
          weeklySessions++;
        }
      });

      // Calculate presence streak (consecutive days)
      const { data: allSessions, error: streakError } = await supabase
        .from('breathing_session_history')
        .select('completed_at')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(100);

      if (streakError) throw streakError;

      let presenceDays = 0;
      let lastPracticeDate: string | null = null;

      if (allSessions && allSessions.length > 0) {
        // Get unique dates
        const uniqueDates = [...new Set(
          allSessions.map(s => format(parseISO(s.completed_at), 'yyyy-MM-dd'))
        )].sort().reverse();

        lastPracticeDate = uniqueDates[0];
        const today = format(now, 'yyyy-MM-dd');
        const yesterday = format(new Date(now.getTime() - 86400000), 'yyyy-MM-dd');

        // Check if streak is active (practiced today or yesterday)
        if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
          presenceDays = 1;
          
          for (let i = 1; i < uniqueDates.length; i++) {
            const currentDate = parseISO(uniqueDates[i - 1]);
            const prevDate = parseISO(uniqueDates[i]);
            const daysDiff = differenceInCalendarDays(currentDate, prevDate);
            
            if (daysDiff === 1) {
              presenceDays++;
            } else {
              break;
            }
          }
        }
      }

      setStats({
        weeklyMinutes,
        weeklySessions,
        monthlyMinutes,
        monthlySessions,
        presenceDays,
        lastPracticeDate,
      });
    } catch (error) {
      console.error('Error fetching breathing stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    showPresenceIndicator,
    togglePresenceIndicator,
    refreshStats: fetchStats,
  };
};
