import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Calendar, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface SavedGreeting {
  id: string;
  greeting_history_id: string;
  greeting_title: string;
  greeting_message: string;
  shown_date: string;
}

const SavedGreetings = () => {
  const { user } = useAuth();
  const [savedGreetings, setSavedGreetings] = useState<SavedGreeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSavedGreetings = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from("saved_greetings")
          .select(`
            id,
            greeting_history_id,
            greeting_history (
              greeting_title,
              greeting_message,
              shown_date
            )
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const formatted = data?.map((item: any) => ({
          id: item.id,
          greeting_history_id: item.greeting_history_id,
          greeting_title: item.greeting_history?.greeting_title || "",
          greeting_message: item.greeting_history?.greeting_message || "",
          shown_date: item.greeting_history?.shown_date || "",
        })) || [];

        setSavedGreetings(formatted);
      } catch (error) {
        console.error("Error fetching saved greetings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedGreetings();
  }, [user?.id]);

  const unsaveGreeting = async (id: string) => {
    // Optimistic update
    setSavedGreetings(prev => prev.filter(g => g.id !== id));

    try {
      await supabase
        .from("saved_greetings")
        .delete()
        .eq("id", id);
    } catch (error) {
      console.error("Error unsaving greeting:", error);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return format(date, "d MMMM, yyyy", { locale: vi });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="p-4 rounded-xl bg-muted/20 animate-pulse h-20" />
        ))}
      </div>
    );
  }

  if (savedGreetings.length === 0) {
    return (
      <div className="p-6 rounded-xl bg-muted/10 text-center border border-border/30">
        <Heart className="w-8 h-8 mx-auto text-rose-300/40 mb-2" />
        <p className="text-muted-foreground text-sm">
          Chưa có lời chào được lưu
        </p>
        <p className="text-muted-foreground/60 text-xs mt-1">
          Nhấn vào biểu tượng trái tim để lưu những lời chào ý nghĩa
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {savedGreetings.map((entry, index) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: index * 0.05 }}
            className="relative p-4 rounded-xl bg-gradient-to-br from-rose-50/50 via-card/40 to-gold/5 dark:from-rose-900/10 dark:via-card/40 border border-rose-200/30 dark:border-rose-400/20 group"
          >
            {/* Unsave button */}
            <button
              onClick={() => unsaveGreeting(entry.id)}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-rose-100/50 dark:hover:bg-rose-900/30 transition-colors"
              aria-label="Bỏ lưu"
            >
              <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
            </button>

            {/* Date */}
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-3 h-3 text-rose-300/70" />
              <span className="text-xs text-muted-foreground">
                {formatDate(entry.shown_date)}
              </span>
            </div>

            {/* Title */}
            <h4 className="font-serif text-sm text-foreground mb-1.5 pr-8">
              {entry.greeting_title}
            </h4>

            {/* Message */}
            <p className="text-xs text-foreground/60 leading-relaxed line-clamp-2">
              {entry.greeting_message}
            </p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default SavedGreetings;