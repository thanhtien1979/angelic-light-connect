import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface RealtimePayload {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: Record<string, any>;
  old: Record<string, any>;
}

export const useTestimonialRealtime = (
  testimonialId?: string,
  onNewReaction?: (reaction: any) => void,
  onNewComment?: (comment: any) => void
) => {
  const { user } = useAuth();

  const handleReactionChange = useCallback(async (payload: RealtimePayload) => {
    if (payload.eventType === "INSERT" && payload.new) {
      // Don't notify for own reactions
      if (payload.new.user_id === user?.id) return;

      // Get reactor's profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", payload.new.user_id)
        .single();

      const name = profile?.display_name || "Một linh hồn";
      const reactionEmoji = getReactionEmoji(payload.new.reaction_type);

      toast.success(`${name} đã ${reactionEmoji} nhân chứng của bạn`, {
        icon: reactionEmoji,
        duration: 3000,
      });

      onNewReaction?.(payload.new);
    }
  }, [user, onNewReaction]);

  const handleCommentChange = useCallback(async (payload: RealtimePayload) => {
    if (payload.eventType === "INSERT" && payload.new) {
      // Don't notify for own comments
      if (payload.new.user_id === user?.id) return;

      // Get commenter's profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", payload.new.user_id)
        .single();

      const name = profile?.display_name || "Một linh hồn";
      const isReply = payload.new.parent_id !== null;

      toast.success(
        isReply 
          ? `${name} đã trả lời bình luận của bạn` 
          : `${name} đã bình luận về nhân chứng của bạn`,
        {
          icon: "💬",
          duration: 3000,
        }
      );

      onNewComment?.(payload.new);
    }
  }, [user, onNewComment]);

  useEffect(() => {
    if (!testimonialId) return;

    // Subscribe to reactions
    const reactionsChannel = supabase
      .channel(`testimonial-reactions-${testimonialId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "testimonial_reactions",
          filter: `testimonial_id=eq.${testimonialId}`,
        },
        (payload) => handleReactionChange(payload as any)
      )
      .subscribe();

    // Subscribe to comments
    const commentsChannel = supabase
      .channel(`testimonial-comments-${testimonialId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "testimonial_comments",
          filter: `testimonial_id=eq.${testimonialId}`,
        },
        (payload) => handleCommentChange(payload as any)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(reactionsChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, [testimonialId, handleReactionChange, handleCommentChange]);
};

// Subscribe to all testimonial notifications for a user
export const useUserTestimonialNotifications = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Get user's testimonials first
    const subscribeToUserTestimonials = async () => {
      const { data: userTestimonials } = await supabase
        .from("testimonials")
        .select("id")
        .eq("user_id", user.id);

      if (!userTestimonials || userTestimonials.length === 0) return;

      const testimonialIds = userTestimonials.map(t => t.id);

      // Subscribe to reactions on user's testimonials
      const reactionsChannel = supabase
        .channel(`user-testimonial-reactions-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "testimonial_reactions",
          },
          async (payload) => {
            const newReaction = payload.new as any;
            
            // Check if this is for user's testimonial
            if (!testimonialIds.includes(newReaction.testimonial_id)) return;
            if (newReaction.user_id === user.id) return;

            // Get reactor's profile
            const { data: profile } = await supabase
              .from("profiles")
              .select("display_name")
              .eq("id", newReaction.user_id)
              .single();

            const name = profile?.display_name || "Một linh hồn";
            const emoji = getReactionEmoji(newReaction.reaction_type);

            toast.success(`${name} đã ${emoji} nhân chứng của bạn`, {
              icon: emoji,
              duration: 4000,
            });
          }
        )
        .subscribe();

      // Subscribe to comments on user's testimonials
      const commentsChannel = supabase
        .channel(`user-testimonial-comments-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "testimonial_comments",
          },
          async (payload) => {
            const newComment = payload.new as any;
            
            // Check if this is for user's testimonial
            if (!testimonialIds.includes(newComment.testimonial_id)) return;
            if (newComment.user_id === user.id) return;

            // Get commenter's profile
            const { data: profile } = await supabase
              .from("profiles")
              .select("display_name")
              .eq("id", newComment.user_id)
              .single();

            const name = profile?.display_name || "Một linh hồn";
            const isReply = newComment.parent_id !== null;

            toast.success(
              isReply 
                ? `${name} đã trả lời bình luận` 
                : `${name} đã bình luận về nhân chứng của bạn`,
              {
                icon: "💬",
                duration: 4000,
              }
            );
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(reactionsChannel);
        supabase.removeChannel(commentsChannel);
      };
    };

    subscribeToUserTestimonials();
  }, [user]);
};

function getReactionEmoji(type: string): string {
  const emojis: Record<string, string> = {
    heart: "❤️",
    pray: "🙏",
    sparkle: "✨",
    angel: "😇",
    dove: "🕊️",
    star: "💫",
  };
  return emojis[type] || "❤️";
}
