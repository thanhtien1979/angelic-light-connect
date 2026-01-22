import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLightProfile } from "@/hooks/useLightProfile";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import NavigationHeader from "@/components/NavigationHeader";
import {
  LightScoreHero,
  LightStatsCards,
  LightEnergyCharts,
  LightMilestones,
  LightBehaviorTimeline,
} from "@/components/light-dashboard";

const LightScore = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, isLoading: authLoading } = useAuth();
  const {
    profile,
    behaviors,
    interventions,
    dailyEnergy,
    monthlyEnergy,
    stats,
    milestones,
    isLoading,
    acknowledgeIntervention,
  } = useLightProfile();

  // Redirect if not authenticated
  if (!authLoading && !user) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <NavigationHeader />

      <main className="container mx-auto px-4 pt-24 pb-12 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              {t("lightScore.title")}
            </h1>
            <p className="text-muted-foreground text-sm">{t("lightScore.subtitle")}</p>
          </div>
        </motion.div>

        {isLoading || authLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-80 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Hero Section with Score */}
            <LightScoreHero profile={profile} stats={stats} />

            {/* Stats Cards */}
            <LightStatsCards stats={stats} />

            {/* Angel Messages (Interventions) */}
            <AnimatePresence>
              {interventions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-500" />
                        {t("lightScore.angelMessage")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {interventions.map((intervention) => (
                        <motion.div
                          key={intervention.id}
                          layout
                          className="relative p-4 rounded-xl bg-background/60 border border-amber-500/20"
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6"
                            onClick={() => acknowledgeIntervention(intervention.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          <p className="text-sm pr-8 leading-relaxed">
                            {intervention.angel_message}
                          </p>
                          <Badge variant="outline" className="mt-2 text-xs">
                            {intervention.intervention_type === "elevate" && "Nâng đỡ"}
                            {intervention.intervention_type === "remind" && "Nhắc nhở"}
                            {intervention.intervention_type === "filter" && "Lọc nhẹ"}
                          </Badge>
                        </motion.div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Energy Charts with Tabs */}
            <LightEnergyCharts
              dailyEnergy={dailyEnergy}
              monthlyEnergy={monthlyEnergy}
              stats={stats}
            />

            {/* Milestones Grid */}
            <LightMilestones milestones={milestones} />

            {/* Behavior Timeline with Filter */}
            <LightBehaviorTimeline behaviors={behaviors} />
          </div>
        )}
      </main>
    </div>
  );
};

export default LightScore;
