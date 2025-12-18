import { motion } from "framer-motion";
import { BookOpen, Sparkles, Heart, Music, Calendar, Globe, Lock, Share2 } from "lucide-react";
import { useCamlyCoin } from "@/hooks/useCamlyCoin";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const getTypeIcon = (type: string) => {
  switch (type) {
    case "meditation_completion":
      return Music;
    case "reflection_note":
      return Heart;
    default:
      return Sparkles;
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case "meditation_completion":
      return "Thiền định";
    case "reflection_note":
      return "Suy ngẫm";
    default:
      return "Ánh sáng";
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "meditation_completion":
      return "from-sky/30 to-blue-400/30 border-sky/40";
    case "reflection_note":
      return "from-rose-400/30 to-pink-400/30 border-rose-400/40";
    default:
      return "from-gold/30 to-gold-light/30 border-gold/40";
  }
};

interface LightJournalProps {
  showTitle?: boolean;
  maxItems?: number;
  showCoins?: boolean;
}

export const LightJournal = ({
  showTitle = true,
  maxItems = 10,
  showCoins = true,
}: LightJournalProps) => {
  const { acknowledgements, formatCoins, isLoading } = useCamlyCoin();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-muted/30 animate-pulse" />
        ))}
      </div>
    );
  }

  if (acknowledgements.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center p-8 rounded-2xl bg-muted/20 border border-muted/30"
      >
        <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground">Chưa có khoảnh khắc ánh sáng nào</p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Hãy thiền định hoặc viết suy ngẫm để nhận ánh sáng
        </p>
      </motion.div>
    );
  }

  const displayItems = acknowledgements.slice(0, maxItems);

  return (
    <div className="space-y-4">
      {showTitle && (
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-full bg-gold/20">
            <BookOpen className="w-5 h-5 text-gold" />
          </div>
          <h3 className="font-serif text-xl text-foreground">Nhật Ký Ánh Sáng</h3>
        </div>
      )}

      <div className="space-y-3">
        {displayItems.map((item, index) => {
          const TypeIcon = getTypeIcon(item.acknowledgement_type);
          const typeLabel = getTypeLabel(item.acknowledgement_type);
          const typeColor = getTypeColor(item.acknowledgement_type);
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 rounded-xl bg-gradient-to-r ${typeColor} backdrop-blur-sm border`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-background/50">
                  <TypeIcon className="w-4 h-4 text-foreground/70" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-foreground/70 bg-background/30 px-2 py-0.5 rounded-full">
                      {typeLabel}
                    </span>
                    {item.is_public ? (
                      <Globe className="w-3 h-3 text-sky/70" />
                    ) : (
                      <Lock className="w-3 h-3 text-muted-foreground/50" />
                    )}
                    {showCoins && (
                      <span className="ml-auto text-xs font-bold text-gold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        +{formatCoins(item.camly_coins)}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    "{item.spiritual_message}"
                  </p>
                  
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {format(new Date(item.created_at), "dd MMMM, yyyy 'lúc' HH:mm", { locale: vi })}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {acknowledgements.length > maxItems && (
        <p className="text-center text-sm text-muted-foreground">
          Và {acknowledgements.length - maxItems} khoảnh khắc khác...
        </p>
      )}
    </div>
  );
};

// Component for displaying shared moments publicly
export const SharedLightMoments = () => {
  // This would fetch from shared_light_moments table
  // Implementation depends on how public sharing is handled
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Share2 className="w-5 h-5 text-gold" />
        <h3 className="font-serif text-xl text-foreground">Khoảnh Khắc Được Chia Sẻ</h3>
      </div>
      <p className="text-muted-foreground text-sm">
        Các khoảnh khắc ánh sáng được chia sẻ từ cộng đồng
      </p>
    </div>
  );
};
