import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sunrise, Calendar, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";

interface GreetingEntry {
  id: string;
  greeting_title: string;
  greeting_message: string;
  shown_date: string;
  created_at: string;
}

const GreetingHistory = () => {
  const { user } = useAuth();
  const [greetings, setGreetings] = useState<GreetingEntry[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      try {
        // Fetch greeting history
        const { data: historyData, error: historyError } = await supabase
          .from("greeting_history")
          .select("*")
          .eq("user_id", user.id)
          .order("shown_date", { ascending: false })
          .limit(20);

        if (historyError) throw historyError;
        setGreetings(historyData || []);

        // Fetch saved greeting IDs
        const { data: savedData, error: savedError } = await supabase
          .from("saved_greetings")
          .select("greeting_history_id")
          .eq("user_id", user.id);

        if (savedError) throw savedError;
        setSavedIds(new Set(savedData?.map(s => s.greeting_history_id) || []));
      } catch (error) {
        console.error("Error fetching greeting data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const toggleSave = async (greetingId: string) => {
    if (!user?.id) return;

    const isSaved = savedIds.has(greetingId);
    
    // Optimistic update
    const newSavedIds = new Set(savedIds);
    if (isSaved) {
      newSavedIds.delete(greetingId);
    } else {
      newSavedIds.add(greetingId);
    }
    setSavedIds(newSavedIds);

    try {
      if (isSaved) {
        await supabase
          .from("saved_greetings")
          .delete()
          .eq("user_id", user.id)
          .eq("greeting_history_id", greetingId);
      } else {
        await supabase
          .from("saved_greetings")
          .insert({ user_id: user.id, greeting_history_id: greetingId });
        toast.success("Đã lưu lời chào ánh sáng", { duration: 2000 });
      }
    } catch (error) {
      // Revert on error
      setSavedIds(savedIds);
      console.error("Error toggling save:", error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, "'Buổi sáng ngày' d MMMM", { locale: vi });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 rounded-xl bg-muted/20 animate-pulse h-24" />
        ))}
      </div>
    );
  }

  if (greetings.length === 0) {
    return (
      <div className="p-8 rounded-xl bg-muted/10 text-center border border-border/30">
        <Sunrise className="w-10 h-10 mx-auto text-gold/40 mb-3" />
        <p className="text-muted-foreground text-sm">
          Chưa có lời chào ánh sáng nào được ghi nhận
        </p>
        <p className="text-muted-foreground/70 text-xs mt-1">
          Mỗi sáng, một thông điệp mới sẽ được gửi đến bạn
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {greetings.map((entry, index) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative p-5 rounded-xl bg-gradient-to-br from-card/60 via-card/40 to-gold/5 border border-gold/20 hover:border-gold/30 transition-colors group"
          >
            {/* Save button */}
            <button
              onClick={() => toggleSave(entry.id)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gold/10 transition-colors"
              aria-label={savedIds.has(entry.id) ? "Bỏ lưu" : "Lưu lời chào"}
            >
              <Heart 
                className={`w-4 h-4 transition-colors ${
                  savedIds.has(entry.id) 
                    ? "text-rose-400 fill-rose-400" 
                    : "text-muted-foreground/50 group-hover:text-rose-300"
                }`} 
              />
            </button>

            {/* Date */}
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-3.5 h-3.5 text-gold/70" />
              <span className="text-xs text-muted-foreground font-medium">
                {formatDate(entry.shown_date)}
              </span>
            </div>

            {/* Title */}
            <h4 className="font-serif text-foreground mb-2 pr-8">
              {entry.greeting_title}
            </h4>

            {/* Message */}
            <p className="text-sm text-foreground/70 leading-relaxed">
              {entry.greeting_message}
            </p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default GreetingHistory;