import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Clock, Sparkles } from 'lucide-react';
import { useBreathingHistory, type BreathingSession } from '@/hooks/useBreathingHistory';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';

const formatSessionDate = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isToday(date)) {
    return `Today, ${format(date, 'h:mm a')}`;
  }
  if (isYesterday(date)) {
    return `Yesterday, ${format(date, 'h:mm a')}`;
  }
  return format(date, 'MMM d, h:mm a');
};

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (minutes === 0) return `${secs}s`;
  if (secs === 0) return `${minutes}m`;
  return `${minutes}m ${secs}s`;
};

interface SessionItemProps {
  session: BreathingSession;
  index: number;
}

const SessionItem = ({ session, index }: SessionItemProps) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.05, duration: 0.3 }}
    className="relative pl-6 pb-4 last:pb-0"
  >
    {/* Timeline line */}
    <div className="absolute left-1.5 top-2 bottom-0 w-px bg-gradient-to-b from-primary/30 to-transparent" />
    
    {/* Timeline dot */}
    <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-gradient-to-br from-primary/60 to-secondary/60 border border-primary/30 shadow-[0_0_8px_hsl(var(--primary)/0.3)]" />
    
    <div className="bg-muted/20 rounded-lg p-3 border border-border/20 hover:bg-muted/30 transition-colors">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-foreground/80">
          {session.pattern_name}
        </span>
        <span className="text-[10px] text-muted-foreground/60">
          {formatSessionDate(session.completed_at)}
        </span>
      </div>
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground/70">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDuration(session.duration_seconds)}
        </span>
        {session.ambient_sound && session.ambient_sound !== 'silence' && (
          <span className="capitalize">{session.ambient_sound}</span>
        )}
      </div>
    </div>
  </motion.div>
);

interface BreathingSessionHistoryProps {
  compact?: boolean;
}

export const BreathingSessionHistory = ({ compact = false }: BreathingSessionHistoryProps) => {
  const { sessions, isLoading } = useBreathingHistory();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Wind className="w-5 h-5 text-primary/50" />
        </motion.div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-6"
      >
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted/30 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-muted-foreground/50" />
        </div>
        <p className="text-xs text-muted-foreground/60 italic">
          Your breathing journey begins here
        </p>
      </motion.div>
    );
  }

  const displaySessions = compact ? sessions.slice(0, 5) : sessions;

  return (
    <div className={compact ? 'max-h-48 overflow-y-auto pr-1' : ''}>
      <AnimatePresence mode="popLayout">
        {displaySessions.map((session, index) => (
          <SessionItem key={session.id} session={session} index={index} />
        ))}
      </AnimatePresence>
      
      {compact && sessions.length > 5 && (
        <p className="text-[10px] text-muted-foreground/50 text-center mt-2 italic">
          +{sessions.length - 5} more moments of peace
        </p>
      )}
    </div>
  );
};

export default BreathingSessionHistory;
