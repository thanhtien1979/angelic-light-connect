import { motion } from "framer-motion";
import { Activity, TrendingUp, Flame, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { LightStats } from "@/hooks/useLightProfile";

interface LightStatsCardsProps {
  stats: LightStats | null;
  isLoading?: boolean;
}

const LightStatsCards = ({ stats, isLoading }: LightStatsCardsProps) => {
  const { t } = useLanguage();

  const statCards = [
    {
      icon: Activity,
      label: t("lightScore.totalActivities"),
      value: stats?.totalBehaviors ?? 0,
      color: "text-violet-500",
      bgColor: "bg-violet-500/10",
      borderColor: "border-violet-500/20",
    },
    {
      icon: TrendingUp,
      label: t("lightScore.positiveRate"),
      value: stats && stats.totalBehaviors > 0
        ? `${Math.round((stats.positiveCount / stats.totalBehaviors) * 100)}%`
        : "0%",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
    },
    {
      icon: Flame,
      label: t("lightScore.currentStreak"),
      value: stats?.currentStreak ?? 0,
      suffix: t("lightScore.days"),
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
    },
    {
      icon: Calendar,
      label: t("lightScore.daysOnJourney"),
      value: stats?.daysOnJourney ?? 0,
      suffix: t("lightScore.days"),
      color: "text-sky-500",
      bgColor: "bg-sky-500/10",
      borderColor: "border-sky-500/20",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="p-4">
              <div className="animate-pulse space-y-3">
                <div className="w-10 h-10 rounded-full bg-muted" />
                <div className="h-4 w-16 bg-muted rounded" />
                <div className="h-6 w-12 bg-muted rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className={`border ${stat.borderColor} bg-card/80 backdrop-blur-sm hover:shadow-lg transition-shadow`}>
            <CardContent className="p-4">
              <div className={`w-10 h-10 rounded-full ${stat.bgColor} flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">{stat.value}</span>
                {stat.suffix && (
                  <span className="text-sm text-muted-foreground">{stat.suffix}</span>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default LightStatsCards;
