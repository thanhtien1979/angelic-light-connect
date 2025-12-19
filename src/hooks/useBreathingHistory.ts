import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface BreathingSession {
  id: string;
  pattern_name: string;
  duration_seconds: number;
  ambient_sound: string | null;
  completed_at: string;
}

export const useBreathingHistory = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<BreathingSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!user) {
      setSessions([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('breathing_session_history')
        .select('id, pattern_name, duration_seconds, ambient_sound, completed_at')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching breathing history:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const saveSession = useCallback(async (
    patternName: string,
    durationSeconds: number,
    ambientSound?: string
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('breathing_session_history')
        .insert({
          user_id: user.id,
          pattern_name: patternName,
          duration_seconds: durationSeconds,
          ambient_sound: ambientSound || null,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Refresh the list
      await fetchHistory();
      return data;
    } catch (error) {
      console.error('Error saving breathing session:', error);
      return null;
    }
  }, [user, fetchHistory]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    sessions,
    isLoading,
    saveSession,
    refreshHistory: fetchHistory,
  };
};
