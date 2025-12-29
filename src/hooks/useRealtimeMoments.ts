import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseRealtimeMomentsOptions {
  onNewMoment?: (moment: any) => void;
  onMomentUpdate?: (moment: any) => void;
  onNewReaction?: (reaction: any) => void;
  onNewComment?: (comment: any) => void;
  enabled?: boolean;
}

export const useRealtimeMoments = ({
  onNewMoment,
  onMomentUpdate,
  onNewReaction,
  onNewComment,
  enabled = true,
}: UseRealtimeMomentsOptions) => {
  const audioContextRef = useRef<AudioContext | null>(null);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } catch (error) {
      console.error("Error playing notification sound:", error);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Subscribe to moments updates
    const momentsChannel = supabase
      .channel("realtime-moments")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "shared_light_moments",
        },
        (payload) => {
          if (onNewMoment) {
            onNewMoment(payload.new);
            playNotificationSound();
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "shared_light_moments",
        },
        (payload) => {
          if (onMomentUpdate) {
            onMomentUpdate(payload.new);
          }
        }
      )
      .subscribe();

    // Subscribe to reactions
    const reactionsChannel = supabase
      .channel("realtime-reactions")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "moment_reactions",
        },
        (payload) => {
          if (onNewReaction) {
            onNewReaction(payload.new);
          }
        }
      )
      .subscribe();

    // Subscribe to comments
    const commentsChannel = supabase
      .channel("realtime-comments")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "moment_comments",
        },
        (payload) => {
          if (onNewComment) {
            onNewComment(payload.new);
            playNotificationSound();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(momentsChannel);
      supabase.removeChannel(reactionsChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, [enabled, onNewMoment, onMomentUpdate, onNewReaction, onNewComment, playNotificationSound]);

  return { playNotificationSound };
};
