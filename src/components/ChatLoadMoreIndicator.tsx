import { motion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";

interface ChatLoadMoreIndicatorProps {
  isLoading: boolean;
  hasMore: boolean;
}

const ChatLoadMoreIndicator = ({ isLoading, hasMore }: ChatLoadMoreIndicatorProps) => {
  if (!isLoading && hasMore) {
    return null; // Will be triggered by scroll, no need to show anything
  }

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex items-center justify-center gap-2 py-4"
      >
        <Loader2 className="w-4 h-4 text-primary animate-spin" />
        <span className="text-sm text-muted-foreground">Đang tải tin nhắn cũ...</span>
      </motion.div>
    );
  }

  // No more messages to load
  if (!hasMore) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center gap-2 py-4"
      >
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-rose-soft/30 to-transparent" />
        <div className="flex items-center gap-2 px-4">
          <Sparkles className="w-3 h-3 text-primary/60" />
          <span className="text-xs text-muted-foreground/70 italic">
            Đây là khởi đầu của hành trình ✨
          </span>
          <Sparkles className="w-3 h-3 text-primary/60" />
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-rose-soft/30 to-transparent" />
      </motion.div>
    );
  }

  return null;
};

export default ChatLoadMoreIndicator;
