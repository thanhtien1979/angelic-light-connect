import { motion } from "framer-motion";
import { Sparkles, Heart, Star, Lightbulb } from "lucide-react";

interface ConversationSummaryCardProps {
  summary: string;
  keyThemes?: string[] | null;
  emotionalTone?: string | null;
  compact?: boolean;
}

const themeIcons: Record<string, typeof Heart> = {
  love: Heart,
  wisdom: Lightbulb,
  healing: Sparkles,
  default: Star,
};

const ConversationSummaryCard = ({
  summary,
  keyThemes,
  emotionalTone,
  compact = false,
}: ConversationSummaryCardProps) => {
  // Safe fallbacks for all props
  const safeSummary = typeof summary === "string" ? summary : "";
  const safeThemes = Array.isArray(keyThemes) ? keyThemes.filter(t => typeof t === "string") : [];
  const safeTone = typeof emotionalTone === "string" ? emotionalTone : null;

  // Don't render if no valid summary content
  if (!safeSummary) {
    return null;
  }

  const ThemeIcon = themeIcons[safeThemes[0]?.toLowerCase()] || themeIcons.default;

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 py-3 rounded-xl bg-gradient-to-r from-gold-light/20 to-gold/10 border border-gold-light/30"
      >
        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded-full bg-gold/20 flex-shrink-0 mt-0.5">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground/80 mb-1">Tóm tắt cuộc trò chuyện</p>
            <p className="text-sm text-foreground/90 line-clamp-2">{safeSummary}</p>
            {safeThemes.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {safeThemes.slice(0, 3).map((theme, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 text-xs rounded-full bg-gold/20 text-gold-dark border border-gold-light/30"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl bg-gradient-to-br from-gold-light/30 via-gold/15 to-primary/10 border border-gold-light/40 shadow-lg shadow-gold/10"
    >
      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-gold to-gold-light shadow-lg shadow-gold/30">
          <ThemeIcon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-serif text-lg text-foreground">Hành Trình Của Bạn</h4>
            {safeTone && (
              <span className="px-2.5 py-0.5 text-xs rounded-full bg-primary/20 text-primary border border-primary/30">
                {safeTone}
              </span>
            )}
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed mb-3">{safeSummary}</p>
          {safeThemes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {safeThemes.map((theme, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="px-3 py-1 text-xs rounded-full bg-gold/25 text-gold-dark border border-gold-light/40 font-medium"
                >
                  ✨ {theme}
                </motion.span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ConversationSummaryCard;
