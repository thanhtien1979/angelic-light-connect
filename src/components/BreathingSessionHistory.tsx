import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Clock, Sparkles, X } from 'lucide-react';
import { useBreathingHistory, type BreathingSession } from '@/hooks/useBreathingHistory';
import { format, isToday, isYesterday } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
  onRelease: (session: BreathingSession) => void;
}

const SessionItem = ({ session, index, onRelease }: SessionItemProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ 
        opacity: 0, 
        scale: 0.95,
        filter: 'blur(4px)',
        transition: { duration: 0.4, ease: 'easeOut' }
      }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="relative pl-6 pb-4 last:pb-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Timeline line */}
      <div className="absolute left-1.5 top-2 bottom-0 w-px bg-gradient-to-b from-primary/30 to-transparent" />
      
      {/* Timeline dot */}
      <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-gradient-to-br from-primary/60 to-secondary/60 border border-primary/30 shadow-[0_0_8px_hsl(var(--primary)/0.3)]" />
      
      <div className="bg-muted/20 rounded-lg p-3 border border-border/20 hover:bg-muted/30 transition-colors relative group">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-foreground/80">
            {session.pattern_name}
          </span>
          <div className="flex items-center gap-2">
            <AnimatePresence>
              {isHovered && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => onRelease(session)}
                  className="p-1 rounded-full hover:bg-muted/50 text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors"
                  aria-label="Release this moment"
                >
                  <X className="w-3 h-3" />
                </motion.button>
              )}
            </AnimatePresence>
            <span className="text-[10px] text-muted-foreground/60">
              {formatSessionDate(session.completed_at)}
            </span>
          </div>
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
};

interface BreathingSessionHistoryProps {
  compact?: boolean;
}

export const BreathingSessionHistory = ({ compact = false }: BreathingSessionHistoryProps) => {
  const { sessions, isLoading, deleteSession } = useBreathingHistory();
  const [sessionToRelease, setSessionToRelease] = useState<BreathingSession | null>(null);
  const [isReleasing, setIsReleasing] = useState(false);

  const handleRelease = async () => {
    if (!sessionToRelease) return;
    
    setIsReleasing(true);
    await deleteSession(sessionToRelease.id);
    setIsReleasing(false);
    setSessionToRelease(null);
  };

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
    <>
      <div className={compact ? 'max-h-48 overflow-y-auto pr-1' : ''}>
        <AnimatePresence mode="popLayout">
          {displaySessions.map((session, index) => (
            <SessionItem 
              key={session.id} 
              session={session} 
              index={index}
              onRelease={setSessionToRelease}
            />
          ))}
        </AnimatePresence>
        
        {compact && sessions.length > 5 && (
          <p className="text-[10px] text-muted-foreground/50 text-center mt-2 italic">
            +{sessions.length - 5} more moments of peace
          </p>
        )}
      </div>

      {/* Release Confirmation Dialog */}
      <AlertDialog open={!!sessionToRelease} onOpenChange={(open) => !open && setSessionToRelease(null)}>
        <AlertDialogContent className="bg-card/95 backdrop-blur-xl border-border/40 max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-foreground/90 font-medium">
              Release this moment?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-muted-foreground/70 text-sm italic">
              Like a breath returning to the air, this moment will gently dissolve from your journal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {sessionToRelease && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto my-2 px-4 py-3 rounded-lg bg-muted/20 border border-border/20 text-center"
            >
              <p className="text-xs font-medium text-foreground/70">{sessionToRelease.pattern_name}</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">
                {formatSessionDate(sessionToRelease.completed_at)} · {formatDuration(sessionToRelease.duration_seconds)}
              </p>
            </motion.div>
          )}

          <AlertDialogFooter className="flex-row justify-center gap-3 sm:justify-center">
            <AlertDialogCancel 
              className="mt-0 bg-muted/30 border-border/30 hover:bg-muted/50 text-foreground/70"
              disabled={isReleasing}
            >
              Keep
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRelease}
              disabled={isReleasing}
              className="bg-gradient-to-br from-primary/80 to-primary hover:from-primary hover:to-primary/90 text-primary-foreground"
            >
              {isReleasing ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Wind className="w-4 h-4" />
                </motion.div>
              ) : (
                'Release'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BreathingSessionHistory;
