import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, ChevronRight, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useMoodTracker, MOOD_LABELS, EMOTION_OPTIONS, ACTIVITY_OPTIONS } from '@/hooks/useMoodTracker';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MoodTrackerWidgetProps {
  compact?: boolean;
  onComplete?: () => void;
}

export const MoodTrackerWidget = ({ compact = false, onComplete }: MoodTrackerWidgetProps) => {
  const { todayEntry, saveMoodEntry, isSaving, hasTodayEntry } = useMoodTracker();
  const [step, setStep] = useState<'mood' | 'emotions' | 'activities' | 'note' | 'done'>(
    hasTodayEntry ? 'done' : 'mood'
  );
  const [selectedMood, setSelectedMood] = useState<number>(todayEntry?.mood_score || 3);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>(todayEntry?.emotions || []);
  const [selectedActivities, setSelectedActivities] = useState<string[]>(todayEntry?.activities || []);
  const [note, setNote] = useState(todayEntry?.note || '');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleMoodSelect = (mood: number) => {
    setSelectedMood(mood);
  };

  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions(prev => 
      prev.includes(emotion) 
        ? prev.filter(e => e !== emotion)
        : [...prev, emotion]
    );
  };

  const toggleActivity = (activity: string) => {
    setSelectedActivities(prev => 
      prev.includes(activity) 
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    );
  };

  const handleNext = () => {
    if (step === 'mood') setStep('emotions');
    else if (step === 'emotions') setStep('activities');
    else if (step === 'activities') setStep('note');
    else if (step === 'note') handleSave();
  };

  const handleBack = () => {
    if (step === 'emotions') setStep('mood');
    else if (step === 'activities') setStep('emotions');
    else if (step === 'note') setStep('activities');
  };

  const handleSave = async () => {
    const result = await saveMoodEntry(selectedMood, selectedEmotions, selectedActivities, note);
    if (result) {
      toast.success('Đã lưu cảm xúc của bạn ✨');
      setStep('done');
      onComplete?.();
    } else {
      toast.error('Không thể lưu. Vui lòng thử lại.');
    }
  };

  const handleEdit = () => {
    setStep('mood');
  };

  const moodInfo = MOOD_LABELS[selectedMood as keyof typeof MOOD_LABELS];

  if (compact && hasTodayEntry && !isExpanded) {
    return (
      <motion.button
        onClick={() => setIsExpanded(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 hover:border-primary/50 transition-all"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="text-xl">{moodInfo.emoji}</span>
        <span className="text-sm text-foreground/80">Hôm nay: {moodInfo.text}</span>
        <ChevronRight className="w-4 h-4 text-primary" />
      </motion.button>
    );
  }

  if (step === 'done' && !isExpanded) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{moodInfo.emoji}</span>
            <div>
              <p className="text-sm text-muted-foreground">Cảm xúc hôm nay</p>
              <p className="font-medium text-foreground">{moodInfo.text}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleEdit}>
            Chỉnh sửa
          </Button>
        </div>

        {selectedEmotions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {selectedEmotions.map(emotion => {
              const emotionData = EMOTION_OPTIONS.find(e => e.value === emotion);
              return (
                <span key={emotion} className="text-xs px-2 py-1 rounded-full bg-primary/10">
                  {emotionData?.emoji} {emotionData?.label}
                </span>
              );
            })}
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-xl border border-primary/20 shadow-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Bạn cảm thấy thế nào?</h3>
        </div>
        {isExpanded && (
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(false)}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Progress */}
      <div className="flex gap-1 mb-6">
        {['mood', 'emotions', 'activities', 'note'].map((s, i) => (
          <div
            key={s}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors',
              ['mood', 'emotions', 'activities', 'note'].indexOf(step) >= i
                ? 'bg-primary'
                : 'bg-muted'
            )}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Mood Selection */}
        {step === 'mood' && (
          <motion.div
            key="mood"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="flex justify-center gap-2">
              {Object.entries(MOOD_LABELS).map(([score, data]) => (
                <motion.button
                  key={score}
                  onClick={() => handleMoodSelect(Number(score))}
                  className={cn(
                    'w-14 h-14 rounded-xl flex items-center justify-center text-2xl transition-all',
                    selectedMood === Number(score)
                      ? `bg-gradient-to-br ${data.color} shadow-lg scale-110`
                      : 'bg-muted/50 hover:bg-muted'
                  )}
                  whileHover={{ scale: selectedMood === Number(score) ? 1.1 : 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {data.emoji}
                </motion.button>
              ))}
            </div>
            <p className="text-center text-muted-foreground">{moodInfo.text}</p>
          </motion.div>
        )}

        {/* Step 2: Emotions */}
        {step === 'emotions' && (
          <motion.div
            key="emotions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-3"
          >
            <p className="text-sm text-muted-foreground text-center">
              Chọn các cảm xúc bạn đang trải qua
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {EMOTION_OPTIONS.map(emotion => (
                <motion.button
                  key={emotion.value}
                  onClick={() => toggleEmotion(emotion.value)}
                  className={cn(
                    'px-3 py-2 rounded-full text-sm flex items-center gap-1 transition-all',
                    selectedEmotions.includes(emotion.value)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50 hover:bg-muted text-foreground'
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>{emotion.emoji}</span>
                  <span>{emotion.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 3: Activities */}
        {step === 'activities' && (
          <motion.div
            key="activities"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-3"
          >
            <p className="text-sm text-muted-foreground text-center">
              Hoạt động nào ảnh hưởng đến tâm trạng của bạn?
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {ACTIVITY_OPTIONS.map(activity => (
                <motion.button
                  key={activity.value}
                  onClick={() => toggleActivity(activity.value)}
                  className={cn(
                    'px-3 py-2 rounded-full text-sm flex items-center gap-1 transition-all',
                    selectedActivities.includes(activity.value)
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-muted/50 hover:bg-muted text-foreground'
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>{activity.emoji}</span>
                  <span>{activity.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 4: Note */}
        {step === 'note' && (
          <motion.div
            key="note"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-3"
          >
            <p className="text-sm text-muted-foreground text-center">
              Ghi chú thêm (tùy chọn)
            </p>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Hôm nay bạn muốn chia sẻ điều gì..."
              className="min-h-[100px] bg-muted/30 border-primary/20 focus:border-primary/50"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={step === 'mood'}
          className={step === 'mood' ? 'invisible' : ''}
        >
          Quay lại
        </Button>
        <Button
          onClick={handleNext}
          disabled={isSaving}
          className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
        >
          {isSaving ? (
            <Sparkles className="w-4 h-4 animate-spin" />
          ) : step === 'note' ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Lưu
            </>
          ) : (
            <>
              Tiếp
              <ChevronRight className="w-4 h-4 ml-1" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
};

export default MoodTrackerWidget;
