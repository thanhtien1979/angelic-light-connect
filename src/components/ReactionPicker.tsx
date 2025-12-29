import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export type ReactionType = "heart" | "pray" | "sparkle" | "dove" | "star" | "angel";

interface ReactionCount {
  type: ReactionType;
  count: number;
}

interface ReactionPickerProps {
  momentId: string;
  currentReaction?: ReactionType | null;
  reactionCounts: ReactionCount[];
  onReact: (momentId: string, reactionType: ReactionType) => void;
  onRemoveReaction: (momentId: string) => void;
  disabled?: boolean;
}

const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: "heart", emoji: "❤️", label: "Yêu thích" },
  { type: "pray", emoji: "🙏", label: "Cầu nguyện" },
  { type: "sparkle", emoji: "✨", label: "Lung linh" },
  { type: "dove", emoji: "🕊️", label: "Bình an" },
  { type: "star", emoji: "💫", label: "Kỳ diệu" },
  { type: "angel", emoji: "😇", label: "Thiên thần" },
];

const ReactionPicker = ({
  momentId,
  currentReaction,
  reactionCounts,
  onReact,
  onRemoveReaction,
  disabled = false,
}: ReactionPickerProps) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  const handleMouseDown = () => {
    const timer = setTimeout(() => {
      setIsPickerOpen(true);
    }, 500);
    setLongPressTimer(timer);
  };

  const handleMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleClick = () => {
    if (isPickerOpen) return;
    
    if (currentReaction) {
      onRemoveReaction(momentId);
    } else {
      onReact(momentId, "heart");
    }
  };

  const handleReactionSelect = (type: ReactionType) => {
    if (currentReaction === type) {
      onRemoveReaction(momentId);
    } else {
      onReact(momentId, type);
    }
    setIsPickerOpen(false);
  };

  const totalReactions = reactionCounts.reduce((sum, r) => sum + r.count, 0);
  const currentEmoji = currentReaction 
    ? REACTIONS.find(r => r.type === currentReaction)?.emoji 
    : null;

  return (
    <div className="relative">
      {/* Main reaction button */}
      <div className="flex items-center gap-2">
        <motion.button
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          onClick={handleClick}
          disabled={disabled}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all",
            currentReaction
              ? "bg-rose-500/20 text-rose-600"
              : "bg-muted/50 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {currentEmoji ? (
            <span className="text-base">{currentEmoji}</span>
          ) : (
            <Heart className="w-4 h-4" />
          )}
        </motion.button>

        {/* Reaction counts display */}
        {totalReactions > 0 && (
          <div className="flex items-center gap-1">
            {reactionCounts
              .filter(r => r.count > 0)
              .slice(0, 3)
              .map(({ type, count }) => {
                const reaction = REACTIONS.find(r => r.type === type);
                return (
                  <span key={type} className="text-xs text-muted-foreground">
                    {reaction?.emoji}
                  </span>
                );
              })}
            <span className="text-xs text-muted-foreground ml-1">
              {totalReactions}
            </span>
          </div>
        )}
      </div>

      {/* Reaction picker popup */}
      <AnimatePresence>
        {isPickerOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsPickerOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-0 mb-2 z-50 flex items-center gap-1 px-2 py-1.5 bg-card/95 backdrop-blur-sm rounded-full border border-border shadow-lg"
            >
              {REACTIONS.map(({ type, emoji, label }) => (
                <motion.button
                  key={type}
                  onClick={() => handleReactionSelect(type)}
                  whileHover={{ scale: 1.3, y: -4 }}
                  whileTap={{ scale: 0.9 }}
                  className={cn(
                    "text-xl p-1 rounded-full transition-colors hover:bg-muted",
                    currentReaction === type && "bg-primary/20"
                  )}
                  title={label}
                >
                  {emoji}
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReactionPicker;
