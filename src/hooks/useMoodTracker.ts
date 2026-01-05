import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export interface MoodEntry {
  id: string;
  user_id: string;
  mood_score: number;
  mood_label: string;
  emotions: string[];
  note?: string;
  activities: string[];
  ai_insight?: string;
  entry_date: string;
  created_at: string;
}

export type InsightType = 'daily' | 'weekly' | 'monthly';

export interface MoodInsight {
  id: string;
  user_id: string;
  insight_type: InsightType;
  insight_text: string;
  patterns_detected?: Record<string, unknown> | null;
  recommendations?: string[] | null;
  period_start: string;
  period_end: string;
  created_at: string;
}

export const MOOD_LABELS = {
  1: { label: 'very_sad', emoji: '😢', text: 'Rất buồn', color: 'from-blue-600 to-blue-800' },
  2: { label: 'sad', emoji: '😔', text: 'Buồn', color: 'from-blue-400 to-blue-600' },
  3: { label: 'neutral', emoji: '😐', text: 'Bình thường', color: 'from-yellow-400 to-yellow-600' },
  4: { label: 'happy', emoji: '😊', text: 'Vui', color: 'from-green-400 to-green-600' },
  5: { label: 'very_happy', emoji: '😄', text: 'Rất vui', color: 'from-pink-400 to-rose-500' }
} as const;

export const EMOTION_OPTIONS = [
  { value: 'grateful', label: 'Biết ơn', emoji: '🙏' },
  { value: 'peaceful', label: 'Bình an', emoji: '☮️' },
  { value: 'anxious', label: 'Lo lắng', emoji: '😰' },
  { value: 'stressed', label: 'Căng thẳng', emoji: '😫' },
  { value: 'tired', label: 'Mệt mỏi', emoji: '😴' },
  { value: 'energetic', label: 'Tràn năng lượng', emoji: '⚡' },
  { value: 'hopeful', label: 'Hy vọng', emoji: '🌟' },
  { value: 'lonely', label: 'Cô đơn', emoji: '💔' },
  { value: 'loved', label: 'Được yêu thương', emoji: '💕' },
  { value: 'inspired', label: 'Được truyền cảm hứng', emoji: '✨' },
  { value: 'confused', label: 'Bối rối', emoji: '😕' },
  { value: 'motivated', label: 'Có động lực', emoji: '💪' }
];

export const ACTIVITY_OPTIONS = [
  { value: 'meditation', label: 'Thiền', emoji: '🧘' },
  { value: 'exercise', label: 'Tập thể dục', emoji: '🏃' },
  { value: 'work', label: 'Làm việc', emoji: '💼' },
  { value: 'family', label: 'Gia đình', emoji: '👨‍👩‍👧' },
  { value: 'friends', label: 'Bạn bè', emoji: '👥' },
  { value: 'nature', label: 'Thiên nhiên', emoji: '🌿' },
  { value: 'reading', label: 'Đọc sách', emoji: '📚' },
  { value: 'music', label: 'Nghe nhạc', emoji: '🎵' },
  { value: 'creative', label: 'Sáng tạo', emoji: '🎨' },
  { value: 'rest', label: 'Nghỉ ngơi', emoji: '😌' },
  { value: 'prayer', label: 'Cầu nguyện', emoji: '🙏' },
  { value: 'learning', label: 'Học tập', emoji: '📖' }
];

export const useMoodTracker = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [todayEntry, setTodayEntry] = useState<MoodEntry | null>(null);
  const [insights, setInsights] = useState<MoodInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchEntries = useCallback(async (days = 30) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('entry_date', startDate)
        .order('entry_date', { ascending: false });

      if (error) throw error;
      
      setEntries(data || []);
      
      // Check for today's entry
      const today = format(new Date(), 'yyyy-MM-dd');
      const todayData = data?.find(e => e.entry_date === today);
      setTodayEntry(todayData || null);
    } catch (error) {
      console.error('Error fetching mood entries:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const fetchInsights = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('mood_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setInsights((data || []) as MoodInsight[]);
    } catch (error) {
      console.error('Error fetching mood insights:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchEntries();
    fetchInsights();
  }, [fetchEntries, fetchInsights]);

  const saveMoodEntry = async (
    moodScore: number,
    emotions: string[] = [],
    activities: string[] = [],
    note?: string
  ) => {
    if (!user) return null;

    setIsSaving(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const moodLabel = MOOD_LABELS[moodScore as keyof typeof MOOD_LABELS].label;

      // Use upsert to handle both create and update
      const { data, error } = await supabase
        .from('mood_entries')
        .upsert({
          user_id: user.id,
          mood_score: moodScore,
          mood_label: moodLabel,
          emotions,
          activities,
          note,
          entry_date: today
        }, {
          onConflict: 'user_id,entry_date'
        })
        .select()
        .single();

      if (error) throw error;
      
      setTodayEntry(data);
      await fetchEntries();
      return data;
    } catch (error) {
      console.error('Error saving mood entry:', error);
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const getWeeklyStats = useCallback(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
    
    const weekEntries = entries.filter(e => {
      const date = new Date(e.entry_date);
      return date >= weekStart && date <= weekEnd;
    });

    if (weekEntries.length === 0) return null;

    const avgMood = weekEntries.reduce((sum, e) => sum + e.mood_score, 0) / weekEntries.length;
    
    // Count emotions
    const emotionCounts: Record<string, number> = {};
    weekEntries.forEach(e => {
      e.emotions.forEach(emotion => {
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      });
    });

    // Top emotions
    const topEmotions = Object.entries(emotionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([emotion]) => emotion);

    return {
      avgMood: Math.round(avgMood * 10) / 10,
      entryCount: weekEntries.length,
      topEmotions,
      trend: weekEntries.length >= 2 
        ? weekEntries[0].mood_score - weekEntries[weekEntries.length - 1].mood_score
        : 0
    };
  }, [entries]);

  const getMonthlyStats = useCallback(() => {
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());
    
    const monthEntries = entries.filter(e => {
      const date = new Date(e.entry_date);
      return date >= monthStart && date <= monthEnd;
    });

    if (monthEntries.length === 0) return null;

    const avgMood = monthEntries.reduce((sum, e) => sum + e.mood_score, 0) / monthEntries.length;
    
    // Mood distribution
    const moodDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    monthEntries.forEach(e => {
      moodDistribution[e.mood_score]++;
    });

    return {
      avgMood: Math.round(avgMood * 10) / 10,
      entryCount: monthEntries.length,
      moodDistribution,
      streakDays: calculateStreak(monthEntries)
    };
  }, [entries]);

  const calculateStreak = (sortedEntries: MoodEntry[]) => {
    if (sortedEntries.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < sortedEntries.length; i++) {
      const expectedDate = format(subDays(today, i), 'yyyy-MM-dd');
      if (sortedEntries.some(e => e.entry_date === expectedDate)) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  return {
    entries,
    todayEntry,
    insights,
    isLoading,
    isSaving,
    saveMoodEntry,
    fetchEntries,
    fetchInsights,
    getWeeklyStats,
    getMonthlyStats,
    hasTodayEntry: !!todayEntry
  };
};
