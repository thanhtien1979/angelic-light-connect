import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sunrise, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGreetingHistory = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from("greeting_history")
          .select("*")
          .eq("user_id", user.id)
          .order("shown_date", { ascending: false })
          .limit(20);

        if (error) throw error;
        setGreetings(data || []);
      } catch (error) {
        console.error("Error fetching greeting history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGreetingHistory();
  }, [user?.id]);

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
            className="p-5 rounded-xl bg-gradient-to-br from-card/60 via-card/40 to-gold/5 border border-gold/20 hover:border-gold/30 transition-colors"
          >
            {/* Date */}
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-3.5 h-3.5 text-gold/70" />
              <span className="text-xs text-muted-foreground font-medium">
                {formatDate(entry.shown_date)}
              </span>
            </div>

            {/* Title */}
            <h4 className="font-serif text-foreground mb-2">
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