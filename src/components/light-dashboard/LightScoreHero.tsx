import { motion } from "framer-motion";
import { Sun, TrendingUp, TrendingDown, Minus, Flame, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { LightProfile, LightStats } from "@/hooks/useLightProfile";

interface LightScoreHeroProps {
  profile: LightProfile | null;
  stats: LightStats | null;
}

const LightScoreHero = ({ profile, stats }: LightScoreHeroProps) => {
  const { t } = useLanguage();

  const lightScore = profile?.light_score ?? 50;
  const energyDirection = profile?.energy_direction ?? "stable";

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-emerald-500";
    if (score >= 40) return "text-amber-500";
    return "text-rose-500";
  };

  const getGradientColors = (score: number) => {
    if (score >= 70) return { start: "#34d399", end: "#14b8a6" };
    if (score >= 40) return { start: "#fbbf24", end: "#f97316" };
    return { start: "#f87171", end: "#ef4444" };
  };

  const getEnergyIcon = (direction: string) => {
    switch (direction) {
      case "ascending":
        return <TrendingUp className="w-4 h-4 text-emerald-500" />;
      case "descending":
        return <TrendingDown className="w-4 h-4 text-rose-500" />;
      default:
        return <Minus className="w-4 h-4 text-amber-500" />;
    }
  };

  const getEnergyText = (direction: string) => {
    switch (direction) {
      case "ascending":
        return t("lightScore.ascending");
      case "descending":
        return t("lightScore.descending");
      default:
        return t("lightScore.stable");
    }
  };

  const colors = getGradientColors(lightScore);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-primary/20 bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
            {/* Score Circle */}
            <div className="relative w-40 h-40 md:w-48 md:h-48 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  className="text-muted/20"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="url(#heroScoreGradient)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${lightScore * 2.83} 283`}
                  initial={{ strokeDasharray: "0 283" }}
                  animate={{ strokeDasharray: `${lightScore * 2.83} 283` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="heroScoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={colors.start} />
                    <stop offset="100%" stopColor={colors.end} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Sun className={`w-7 h-7 mb-1 ${getScoreColor(lightScore)}`} />
                <motion.span
                  className={`text-4xl md:text-5xl font-bold ${getScoreColor(lightScore)}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {lightScore}
                </motion.span>
                <span className="text-muted-foreground text-sm">/100</span>
              </div>
            </div>

            {/* Info Section */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent mb-2">
                {t("lightScore.dashboard")}
              </h2>
              <p className="text-muted-foreground mb-4">{t("lightScore.dashboardDesc")}</p>

              {/* Quick Stats */}
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <Badge
                  variant="outline"
                  className="px-3 py-1.5 flex items-center gap-1.5 bg-background/50"
                >
                  {getEnergyIcon(energyDirection)}
                  <span>{getEnergyText(energyDirection)}</span>
                </Badge>

                {stats && stats.currentStreak > 0 && (
                  <Badge
                    variant="outline"
                    className="px-3 py-1.5 flex items-center gap-1.5 bg-orange-500/10 border-orange-500/30 text-orange-600"
                  >
                    <Flame className="w-4 h-4" />
                    <span>
                      {stats.currentStreak} {t("lightScore.daysStreak")}
                    </span>
                  </Badge>
                )}

                {stats && stats.daysOnJourney > 0 && (
                  <Badge
                    variant="outline"
                    className="px-3 py-1.5 flex items-center gap-1.5 bg-sky-500/10 border-sky-500/30 text-sky-600"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>
                      {stats.daysOnJourney} {t("lightScore.days")}
                    </span>
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default LightScoreHero;
