import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2, Trash2, Clock, Music } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { AMBIENT_SOUNDS, AmbientSoundType } from "@/hooks/useAmbientSound";

interface MeditationSession {
  id: string;
  duration_seconds: number;
  theme: string | null;
  ambient_sound: string | null;
  completed_at: string;
}

const MeditationHistoryLog = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<MeditationSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchSessions = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("meditation_history")
          .select("*")
          .eq("user_id", user.id)
          .order("completed_at", { ascending: false })
          .limit(20);

        if (error) throw error;
        setSessions(data || []);
      } catch (error) {
        console.error("Error fetching meditation history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, [user?.id]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("meditation_history")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setSessions(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error("Error deleting meditation session:", error);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs} giây`;
    if (secs === 0) return `${mins} phút`;
    return `${mins} phút ${secs} giây`;
  };

  const getAmbientSoundName = (sound: string | null): string => {
    if (!sound) return "Tĩnh lặng";
    const found = AMBIENT_SOUNDS.find(s => s.id === sound);
    return found ? found.nameVi : "Tĩnh lặng";
  };

  const getAmbientSoundIcon = (sound: string | null): string => {
    if (!sound) return "🤫";
    const found = AMBIENT_SOUNDS.find(s => s.id === sound);
    return found ? found.icon : "🤫";
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin mb-2 text-gold/60" />
        <p className="text-sm">Đang tải...</p>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-gold/20 to-gold/10 flex items-center justify-center">
          <Sparkles className="w-7 h-7 text-gold/50" />
        </div>
        <p className="text-sm text-muted-foreground">
          Chưa có khoảnh khắc tĩnh lặng nào được ghi lại
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Mỗi lần thiền định là một hạt giống ánh sáng
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((session, index) => (
        <motion.div
          key={session.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="group p-4 rounded-xl bg-gradient-to-br from-gold/5 via-card/60 to-rose-100/5 dark:to-rose-900/5 border border-gold/10 hover:border-gold/20 transition-colors"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Date */}
              <p className="text-xs text-muted-foreground/70 mb-1">
                {format(new Date(session.completed_at), "EEEE, d MMMM yyyy", { locale: vi })}
              </p>
              
              {/* Theme if available */}
              {session.theme && (
                <p className="text-sm text-foreground/90 font-medium truncate mb-2">
                  {session.theme}
                </p>
              )}
              
              {/* Details */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDuration(session.duration_seconds)}
                </span>
                <span className="flex items-center gap-1">
                  <span>{getAmbientSoundIcon(session.ambient_sound)}</span>
                  {getAmbientSoundName(session.ambient_sound)}
                </span>
              </div>
            </div>
            
            {/* Delete button - visible on hover */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(session.id)}
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      ))}
      
      {/* Gentle closing message */}
      <div className="flex items-center justify-center gap-2 pt-4">
        <div className="w-8 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
        <Sparkles className="w-3 h-3 text-gold/30" />
        <div className="w-8 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      </div>
    </div>
  );
};

export default MeditationHistoryLog;
