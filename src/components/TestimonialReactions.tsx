import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ReactionCount {
  reaction_type: string;
  count: number;
}

interface TestimonialReactionsProps {
  testimonialId: string;
  className?: string;
}

const REACTION_TYPES = [
  { type: "heart", emoji: "❤️", label: "Yêu thương" },
  { type: "pray", emoji: "🙏", label: "Cầu nguyện" },
  { type: "sparkle", emoji: "✨", label: "Ánh sáng" },
  { type: "angel", emoji: "😇", label: "Thiên thần" },
  { type: "dove", emoji: "🕊️", label: "Bình an" },
  { type: "star", emoji: "💫", label: "Kỳ diệu" },
];

const TestimonialReactions = ({ testimonialId, className }: TestimonialReactionsProps) => {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<ReactionCount[]>([]);
  const [userReactions, setUserReactions] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  // Fetch reactions
  const fetchReactions = async () => {
    try {
      const { data, error } = await supabase
        .from("testimonial_reactions")
        .select("reaction_type")
        .eq("testimonial_id", testimonialId);

      if (error) throw error;

      // Count reactions by type
      const counts: Record<string, number> = {};
      data?.forEach(r => {
        counts[r.reaction_type] = (counts[r.reaction_type] || 0) + 1;
      });

      setReactions(
        Object.entries(counts).map(([reaction_type, count]) => ({
          reaction_type,
          count,
        }))
      );
    } catch (error) {
      console.error("Error fetching reactions:", error);
    }
  };

  // Fetch user's reactions
  const fetchUserReactions = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from("testimonial_reactions")
        .select("reaction_type")
        .eq("testimonial_id", testimonialId)
        .eq("user_id", user.id);

      if (data) {
        setUserReactions(new Set(data.map(r => r.reaction_type)));
      }
    } catch (error) {
      console.error("Error fetching user reactions:", error);
    }
  };

  useEffect(() => {
    fetchReactions();
    fetchUserReactions();
  }, [testimonialId, user]);

  const toggleReaction = async (reactionType: string) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để thả cảm xúc");
      return;
    }

    setIsLoading(true);

    try {
      const hasReaction = userReactions.has(reactionType);

      if (hasReaction) {
        // Remove reaction
        await supabase
          .from("testimonial_reactions")
          .delete()
          .eq("testimonial_id", testimonialId)
          .eq("user_id", user.id)
          .eq("reaction_type", reactionType);

        setUserReactions(prev => {
          const next = new Set(prev);
          next.delete(reactionType);
          return next;
        });
      } else {
        // Add reaction
        await supabase
          .from("testimonial_reactions")
          .insert({
            testimonial_id: testimonialId,
            user_id: user.id,
            reaction_type: reactionType,
          } as any);

        setUserReactions(prev => new Set(prev).add(reactionType));
      }

      await fetchReactions();
      setShowPicker(false);
    } catch (error) {
      console.error("Error toggling reaction:", error);
      toast.error("Không thể thả cảm xúc");
    } finally {
      setIsLoading(false);
    }
  };

  const totalReactions = reactions.reduce((sum, r) => sum + r.count, 0);

  return (
    <div className={cn("relative", className)}>
      {/* Existing reactions display */}
      <div className="flex items-center gap-1 flex-wrap">
        {reactions
          .sort((a, b) => b.count - a.count)
          .slice(0, 4)
          .map((reaction) => {
            const reactionInfo = REACTION_TYPES.find(r => r.type === reaction.reaction_type);
            const isUserReaction = userReactions.has(reaction.reaction_type);
            
            return (
              <motion.button
                key={reaction.reaction_type}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleReaction(reaction.reaction_type)}
                disabled={isLoading}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors",
                  isUserReaction
                    ? "bg-primary/20 border border-primary/40"
                    : "bg-muted/50 hover:bg-muted border border-transparent"
                )}
              >
                <span>{reactionInfo?.emoji || "❤️"}</span>
                <span className="text-muted-foreground">{reaction.count}</span>
              </motion.button>
            );
          })}

        {/* Add reaction button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowPicker(!showPicker)}
          className="flex items-center justify-center w-7 h-7 rounded-full bg-muted/50 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <span className="text-sm">+</span>
        </motion.button>

        {totalReactions > 0 && (
          <span className="text-xs text-muted-foreground ml-1">
            {totalReactions} cảm xúc
          </span>
        )}
      </div>

      {/* Reaction picker */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full left-0 mb-2 p-2 bg-background/95 backdrop-blur-sm rounded-xl border border-border shadow-lg z-10"
          >
            <div className="flex gap-1">
              {REACTION_TYPES.map((reaction) => {
                const isActive = userReactions.has(reaction.type);
                return (
                  <motion.button
                    key={reaction.type}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleReaction(reaction.type)}
                    disabled={isLoading}
                    className={cn(
                      "flex flex-col items-center p-2 rounded-lg transition-colors",
                      isActive ? "bg-primary/20" : "hover:bg-muted"
                    )}
                    title={reaction.label}
                  >
                    <span className="text-xl">{reaction.emoji}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TestimonialReactions;
