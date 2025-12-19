import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PatternRecommendation {
  patternId: string;
  reason: string;
  greeting: string;
}

const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' | 'night' => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

export const usePatternRecommendation = () => {
  const { user } = useAuth();
  const [recommendation, setRecommendation] = useState<PatternRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const fetchRecommendation = useCallback(async () => {
    if (!user || hasLoaded) return;

    setIsLoading(true);
    try {
      // Fetch recent practice history
      const { data: sessions } = await supabase
        .from('breathing_session_history')
        .select('pattern_name, duration_seconds, completed_at')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(10);

      const recentPatterns = sessions?.map(s => s.pattern_name) || [];
      const totalSessions = sessions?.length || 0;
      const averageDuration = totalSessions > 0
        ? Math.round((sessions?.reduce((acc, s) => acc + s.duration_seconds, 0) || 0) / totalSessions / 60)
        : 0;

      // Fetch recent emotional context from reflections
      const { data: reflections } = await supabase
        .from('reflection_notes')
        .select('content')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      const emotionalContext = reflections?.[0]?.content?.slice(0, 100);

      // Call the AI recommendation edge function
      const { data, error } = await supabase.functions.invoke('recommend-breathing-pattern', {
        body: {
          timeOfDay: getTimeOfDay(),
          recentPatterns,
          totalSessions,
          averageDuration,
          emotionalContext,
        },
      });

      if (error) throw error;

      if (data && data.patternId) {
        setRecommendation(data);
      }
    } catch (error) {
      console.error('Error fetching pattern recommendation:', error);
      // Provide a gentle fallback
      setRecommendation({
        patternId: getTimeOfDay() === 'morning' ? 'peaceful-flow' : 
                   getTimeOfDay() === 'evening' ? 'calm-rest' : 
                   'gentle-wave',
        reason: 'A gentle rhythm to guide your breath in this moment.',
        greeting: getTimeOfDay() === 'morning' ? 'Good morning, may peace be with you.' :
                  getTimeOfDay() === 'afternoon' ? 'A peaceful afternoon to you.' :
                  getTimeOfDay() === 'evening' ? 'As evening arrives, find your calm.' :
                  'The night welcomes your stillness.',
      });
    } finally {
      setIsLoading(false);
      setHasLoaded(true);
    }
  }, [user, hasLoaded]);

  const clearRecommendation = useCallback(() => {
    setRecommendation(null);
  }, []);

  const refreshRecommendation = useCallback(() => {
    setHasLoaded(false);
    fetchRecommendation();
  }, [fetchRecommendation]);

  return {
    recommendation,
    isLoading,
    fetchRecommendation,
    clearRecommendation,
    refreshRecommendation,
  };
};
