import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const useFriendRequestSound = () => {
  const { user } = useAuth();
  const audioContextRef = useRef<AudioContext | null>(null);
  const hasPlayedRef = useRef<Set<string>>(new Set());

  const playNotificationSound = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Create a pleasant notification chime
      const now = ctx.currentTime;
      
      // First note
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.frequency.setValueAtTime(880, now); // A5
      osc1.type = 'sine';
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc1.start(now);
      osc1.stop(now + 0.3);

      // Second note (harmony)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.setValueAtTime(1108.73, now + 0.1); // C#6
      osc2.type = 'sine';
      gain2.gain.setValueAtTime(0, now);
      gain2.gain.setValueAtTime(0.25, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.4);

      // Third note (resolution)
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.frequency.setValueAtTime(1318.51, now + 0.2); // E6
      osc3.type = 'sine';
      gain3.gain.setValueAtTime(0, now);
      gain3.gain.setValueAtTime(0.2, now + 0.2);
      gain3.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc3.start(now + 0.2);
      osc3.stop(now + 0.5);

    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('friend-request-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'friendships',
          filter: `addressee_id=eq.${user.id}`,
        },
        async (payload) => {
          const requestId = payload.new.id;
          
          // Avoid playing sound for same request multiple times
          if (hasPlayedRef.current.has(requestId)) return;
          hasPlayedRef.current.add(requestId);

          // Get requester info
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', payload.new.requester_id)
            .maybeSingle();

          playNotificationSound();
          
          toast.success(
            `💫 ${profile?.display_name || 'Một người bạn ánh sáng'} muốn kết bạn với bạn!`,
            {
              duration: 5000,
            }
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'private_messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        async (payload) => {
          const messageId = payload.new.id;
          
          if (hasPlayedRef.current.has(messageId)) return;
          hasPlayedRef.current.add(messageId);

          // Get sender info
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', payload.new.sender_id)
            .maybeSingle();

          playNotificationSound();
          
          toast.info(
            `💬 Tin nhắn mới từ ${profile?.display_name || 'Bạn bè'}`,
            {
              duration: 4000,
            }
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, playNotificationSound]);

  return { playNotificationSound };
};
