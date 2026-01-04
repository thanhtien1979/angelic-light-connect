import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sun, TrendingUp, TrendingDown, Minus, ChevronRight, Sparkles } from "lucide-react";
import { useLightProfile } from "@/hooks/useLightProfile";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";

interface LightScoreWidgetProps {
  className?: string;
}

const LightScoreWidget = ({ className = "" }: LightScoreWidgetProps) => {
  const { profile, isLoading, interventions } = useLightProfile();
  const { t } = useLanguage();

  const lightScore = profile?.light_score ?? 50;
  const energyDirection = profile?.energy_direction ?? "stable";

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-emerald-500";
    if (score >= 40) return "text-amber-500";
    return "text-rose-500";
  };

  const getScoreGradient = (score: number) => {
    if (score >= 70) return "from-emerald-500/20 to-teal-500/20";
    if (score >= 40) return "from-amber-500/20 to-orange-500/20";
    return "from-rose-500/20 to-red-500/20";
  };

  const getEnergyIcon = () => {
    switch (energyDirection) {
      case "ascending":
        return <TrendingUp className="w-4 h-4 text-emerald-500" />;
      case "descending":
        return <TrendingDown className="w-4 h-4 text-rose-500" />;
      default:
        return <Minus className="w-4 h-4 text-amber-500" />;
    }
  };

  const getEnergyText = () => {
    switch (energyDirection) {
      case "ascending":
        return t("lightScore.ascending");
      case "descending":
        return t("lightScore.descending");
      default:
        return t("lightScore.stable");
    }
  };

  if (isLoading) {
    return (
      <div className={`p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 shadow-lg ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 shadow-lg ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-full bg-gradient-to-br ${getScoreGradient(lightScore)}`}>
            <Sun className={`w-5 h-5 ${getScoreColor(lightScore)}`} />
          </div>
          <div>
            <h3 className="font-serif text-xl text-foreground">{t("lightScore.title")}</h3>
            <p className="text-xs text-muted-foreground">{t("lightScore.subtitle")}</p>
          </div>
        </div>
        <Link
          to="/diem-anh-sang"
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          {t("common.view")} <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Score Display */}
      <div className={`p-4 rounded-xl bg-gradient-to-br ${getScoreGradient(lightScore)} border border-border/30`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mini Score Circle */}
            <div className="relative w-16 h-16">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="10"
                  className="text-muted/20"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="10"
                  strokeLinecap="round"
                  className={getScoreColor(lightScore)}
                  strokeDasharray={`${lightScore * 2.51} 251`}
                  initial={{ strokeDasharray: "0 251" }}
                  animate={{ strokeDasharray: `${lightScore * 2.51} 251` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-lg font-bold ${getScoreColor(lightScore)}`}>{lightScore}</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                {getEnergyIcon()}
                <span className="text-sm font-medium">{getEnergyText()}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                /100 {t("lightScore.title").toLowerCase()}
              </p>
            </div>
          </div>

          {/* Intervention indicator */}
          {interventions.length > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20 text-amber-600"
            >
              <Sparkles className="w-3 h-3" />
              <span className="text-xs font-medium">{interventions.length}</span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default LightScoreWidget;
