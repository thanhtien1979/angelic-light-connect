import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ThumbsUp, Laugh, Frown, Angry } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface UniverseMessageReactionsProps {
  messageId: string;
  likesCount: number;
  onReactionChange?: () => void;
}

const REACTION_TYPES = [
  { type: "like", emoji: "👍", icon: ThumbsUp, color: "text-blue-500", label: "Thích" },
  { type: "love", emoji: "❤️", icon: Heart, color: "text-red-500", label: "Yêu thích" },
  { type: "haha", emoji: "😂", icon: Laugh, color: "text-yellow-500", label: "Haha" },
  { type: "wow", emoji: "😮", icon: null, color: "text-yellow-500", label: "Wow" },
  { type: "sad", emoji: "😢", icon: Frown, color: "text-yellow-500", label: "Buồn" },
  { type: "angry", emoji: "😡", icon: Angry, color: "text-orange-500", label: "Phẫn nộ" },
];

const UniverseMessageReactions = ({ 
  messageId, 
  likesCount, 
  onReactionChange 
}: UniverseMessageReactionsProps) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user's current reaction and all reaction counts
  useEffect(() => {
    const fetchReactions = async () => {
      if (!user) return;

      try {
        // Get user's reaction
        const { data: userLike } = await supabase
          .from("universe_message_likes" as any)
          .select("*")
          .eq("message_id", messageId)
          .eq("user_id", user.id)
          .single();

        if (userLike) {
          setUserReaction((userLike as any).reaction_type || "like");
        } else {
          setUserReaction(null);
        }

        // Get all reactions count (simplified - just use likes_count for now)
        setReactionCounts({ like: likesCount });
      } catch {
        // No reaction found
        setUserReaction(null);
      }
    };

    fetchReactions();
  }, [messageId, user, likesCount]);

  const handleReaction = async (reactionType: string) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để thả cảm xúc");
      return;
    }

    setIsLoading(true);
    setIsOpen(false);

    try {
      if (userReaction === reactionType) {
        // Remove reaction
        await supabase
          .from("universe_message_likes" as any)
          .delete()
          .eq("message_id", messageId)
          .eq("user_id", user.id);

        // Update likes count
        await supabase
          .from("universe_messages" as any)
          .update({ likes_count: Math.max(0, likesCount - 1) })
          .eq("id", messageId);

        setUserReaction(null);
      } else if (userReaction) {
        // Change reaction (update existing)
        await supabase
          .from("universe_message_likes" as any)
          .update({ reaction_type: reactionType })
          .eq("message_id", messageId)
          .eq("user_id", user.id);

        setUserReaction(reactionType);
      } else {
        // Add new reaction
        await supabase.from("universe_message_likes" as any).insert({
          message_id: messageId,
          user_id: user.id,
          reaction_type: reactionType,
        });

        // Update likes count
        await supabase
          .from("universe_messages" as any)
          .update({ likes_count: likesCount + 1 })
          .eq("id", messageId);

        setUserReaction(reactionType);
      }

      onReactionChange?.();
    } catch (error) {
      console.error("Reaction error:", error);
      toast.error("Không thể thả cảm xúc");
    } finally {
      setIsLoading(false);
    }
  };

  const currentReaction = REACTION_TYPES.find(r => r.type === userReaction);
  const totalCount = likesCount;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={isLoading}
          className={`${
            userReaction 
              ? currentReaction?.color || "text-rose-500" 
              : "text-muted-foreground hover:text-rose-500"
          } transition-colors`}
        >
          {currentReaction ? (
            <span className="text-lg mr-1">{currentReaction.emoji}</span>
          ) : (
            <Heart className="w-4 h-4 mr-1" />
          )}
          {totalCount > 0 && totalCount}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-2" 
        side="top" 
        align="start"
        sideOffset={5}
      >
        <motion.div 
          className="flex gap-1"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {REACTION_TYPES.map((reaction) => (
            <motion.button
              key={reaction.type}
              whileHover={{ scale: 1.3, y: -5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleReaction(reaction.type)}
              className={`p-2 rounded-full transition-colors ${
                userReaction === reaction.type 
                  ? "bg-primary/20" 
                  : "hover:bg-muted"
              }`}
              title={reaction.label}
            >
              <span className="text-2xl">{reaction.emoji}</span>
            </motion.button>
          ))}
        </motion.div>
      </PopoverContent>
    </Popover>
  );
};

export default UniverseMessageReactions;
