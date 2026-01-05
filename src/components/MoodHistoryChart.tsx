import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Calendar, Flame } from 'lucide-react';
import { useMoodTracker, MOOD_LABELS } from '@/hooks/useMoodTracker';
import { format, subDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export const MoodHistoryChart = () => {
  const { entries, getWeeklyStats, getMonthlyStats, isLoading } = useMoodTracker();

  const weeklyStats = getWeeklyStats();
  const monthlyStats = getMonthlyStats();

  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const entry = entries.find(e => e.entry_date === dateStr);
      days.push({
        date,
        dateStr,
        dayName: format(date, 'EEE', { locale: vi }),
        entry
      });
    }
    return days;
  }, [entries]);

  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-xl border border-primary/20">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="h-24 bg-muted rounded" />
        </div>
      </div>
    );
  }

  const getTrendIcon = () => {
    if (!weeklyStats) return <Minus className="w-4 h-4" />;
    if (weeklyStats.trend > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (weeklyStats.trend < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-yellow-500" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-xl border border-primary/20 shadow-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">7 ngày qua</h3>
        </div>
        {monthlyStats && monthlyStats.streakDays > 1 && (
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-orange-500/20 text-orange-500">
            <Flame className="w-4 h-4" />
            <span className="text-sm font-medium">{monthlyStats.streakDays} ngày liên tiếp</span>
          </div>
        )}
      </div>

      {/* 7-day Chart */}
      <div className="flex items-end justify-between gap-2 h-32 mb-4">
        {last7Days.map((day, index) => {
          const moodScore = day.entry?.mood_score || 0;
          const moodInfo = moodScore ? MOOD_LABELS[moodScore as keyof typeof MOOD_LABELS] : null;
          const height = moodScore ? (moodScore / 5) * 100 : 10;

          return (
            <motion.div
              key={day.dateStr}
              className="flex-1 flex flex-col items-center gap-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="relative w-full flex items-end justify-center" style={{ height: '100px' }}>
                <motion.div
                  className={cn(
                    'w-full max-w-[40px] rounded-t-lg transition-all',
                    moodScore
                      ? `bg-gradient-to-t ${moodInfo?.color}`
                      : 'bg-muted/30'
                  )}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: index * 0.1, duration: 0.5, ease: 'easeOut' }}
                />
                {moodInfo && (
                  <motion.span
                    className="absolute -top-6 text-lg"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                  >
                    {moodInfo.emoji}
                  </motion.span>
                )}
              </div>
              <span className={cn(
                'text-xs',
                index === 6 ? 'text-primary font-medium' : 'text-muted-foreground'
              )}>
                {day.dayName}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Stats */}
      {weeklyStats && (
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-primary/10">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">
              {MOOD_LABELS[Math.round(weeklyStats.avgMood) as keyof typeof MOOD_LABELS]?.emoji || '😐'}
            </p>
            <p className="text-xs text-muted-foreground">Trung bình</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              {getTrendIcon()}
              <span className="text-lg font-bold text-foreground">
                {Math.abs(weeklyStats.trend).toFixed(1)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Xu hướng</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{weeklyStats.entryCount}/7</p>
            <p className="text-xs text-muted-foreground">Đã ghi</p>
          </div>
        </div>
      )}

      {/* Top Emotions */}
      {weeklyStats?.topEmotions && weeklyStats.topEmotions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-primary/10">
          <p className="text-xs text-muted-foreground mb-2">Cảm xúc thường gặp:</p>
          <div className="flex flex-wrap gap-2">
            {weeklyStats.topEmotions.map(emotion => {
              const emotionData = {
                grateful: { emoji: '🙏', label: 'Biết ơn' },
                peaceful: { emoji: '☮️', label: 'Bình an' },
                anxious: { emoji: '😰', label: 'Lo lắng' },
                stressed: { emoji: '😫', label: 'Căng thẳng' },
                tired: { emoji: '😴', label: 'Mệt mỏi' },
                energetic: { emoji: '⚡', label: 'Năng lượng' },
                hopeful: { emoji: '🌟', label: 'Hy vọng' },
                lonely: { emoji: '💔', label: 'Cô đơn' },
                loved: { emoji: '💕', label: 'Yêu thương' },
                inspired: { emoji: '✨', label: 'Cảm hứng' },
                confused: { emoji: '😕', label: 'Bối rối' },
                motivated: { emoji: '💪', label: 'Động lực' }
              }[emotion] || { emoji: '•', label: emotion };

              return (
                <span
                  key={emotion}
                  className="px-2 py-1 rounded-full bg-primary/10 text-xs flex items-center gap-1"
                >
                  {emotionData.emoji} {emotionData.label}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {!weeklyStats && (
        <div className="text-center py-4 text-muted-foreground">
          <p>Chưa có dữ liệu. Bắt đầu ghi lại cảm xúc của bạn!</p>
        </div>
      )}
    </motion.div>
  );
};

export default MoodHistoryChart;
