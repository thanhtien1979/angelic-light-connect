import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import type { SyncStatus } from '@/contexts/AngelPresenceContext';
import { cn } from '@/lib/utils';

interface SyncIndicatorProps {
  status: SyncStatus;
  className?: string;
}

export function SyncIndicator({ status, className }: SyncIndicatorProps) {
  if (status === 'idle') return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 8 }}
        transition={{ duration: 0.2 }}
        className={cn(
          'flex items-center gap-1.5 text-xs',
          className
        )}
      >
        {status === 'saving' && (
          <>
            <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
            <span className="text-muted-foreground">Đang lưu…</span>
          </>
        )}
        {status === 'success' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center"
            >
              <Check className="w-2.5 h-2.5 text-green-500" />
            </motion.div>
            <span className="text-green-600 dark:text-green-400">Đã lưu</span>
          </>
        )}
        {status === 'error' && (
          <>
            <AlertCircle className="w-3 h-3 text-amber-500" />
            <span className="text-amber-600 dark:text-amber-400">Sẽ thử lại</span>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
