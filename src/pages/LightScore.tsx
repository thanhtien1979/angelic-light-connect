import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sun, TrendingUp, TrendingDown, Minus, Sparkles, MessageCircle, Heart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLightProfile } from "@/hooks/useLightProfile";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import NavigationHeader from "@/components/NavigationHeader";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const LightScore = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, isLoading: authLoading } = useAuth();
  const { profile, behaviors, interventions, dailyEnergy, isLoading, acknowledgeIntervention } = useLightProfile();

  // Redirect if not authenticated
  if (!authLoading && !user) {
    navigate("/");
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-emerald-500";
    if (score >= 40) return "text-amber-500";
    return "text-rose-500";
  };

  const getScoreGradient = (score: number) => {
    if (score >= 70) return "from-emerald-400 to-teal-500";
    if (score >= 40) return "from-amber-400 to-orange-500";
    return "from-rose-400 to-red-500";
  };

  const getEnergyIcon = (direction: string) => {
    switch (direction) {
      case "ascending":
        return <TrendingUp className="w-5 h-5 text-emerald-500" />;
      case "descending":
        return <TrendingDown className="w-5 h-5 text-rose-500" />;
      default:
        return <Minus className="w-5 h-5 text-amber-500" />;
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

  const getBehaviorIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageCircle className="w-4 h-4" />;
      case "moment":
        return <Heart className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const getSentimentBadge = (score: number) => {
    if (score > 0.3) return { text: t("lightScore.positive"), variant: "default" as const, className: "bg-emerald-500/20 text-emerald-600 border-emerald-500/30" };
    if (score < -0.3) return { text: t("lightScore.negative"), variant: "outline" as const, className: "bg-rose-500/20 text-rose-600 border-rose-500/30" };
    return { text: t("lightScore.neutral"), variant: "secondary" as const, className: "bg-amber-500/20 text-amber-600 border-amber-500/30" };
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  const lightScore = profile?.light_score ?? 50;
  const energyDirection = profile?.energy_direction ?? "stable";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <NavigationHeader />

      <main className="container mx-auto px-4 pt-24 pb-12 max-w-2xl">
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
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Light Score Circle */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-primary/20 bg-card/80 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-8 flex flex-col items-center">
                  <div className="relative w-48 h-48 mb-6">
                    {/* Background circle */}
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-muted/20"
                      />
                      {/* Progress circle */}
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="url(#scoreGradient)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${lightScore * 2.83} 283`}
                        initial={{ strokeDasharray: "0 283" }}
                        animate={{ strokeDasharray: `${lightScore * 2.83} 283` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      />
                      <defs>
                        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor={lightScore >= 70 ? "#34d399" : lightScore >= 40 ? "#fbbf24" : "#f87171"} />
                          <stop offset="100%" stopColor={lightScore >= 70 ? "#14b8a6" : lightScore >= 40 ? "#f97316" : "#ef4444"} />
                        </linearGradient>
                      </defs>
                    </svg>
                    {/* Center content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Sun className={`w-8 h-8 mb-1 ${getScoreColor(lightScore)}`} />
                      <motion.span
                        className={`text-4xl font-bold ${getScoreColor(lightScore)}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        {lightScore}
                      </motion.span>
                      <span className="text-muted-foreground text-sm">/100</span>
                    </div>
                  </div>

                  {/* Energy Direction */}
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50">
                    {getEnergyIcon(energyDirection)}
                    <span className="text-sm font-medium">{getEnergyText(energyDirection)}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Angel Messages (Interventions) */}
            <AnimatePresence>
              {interventions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: 0.2 }}
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
                          <p className="text-sm pr-8 leading-relaxed">{intervention.angel_message}</p>
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

            {/* 7-Day Energy Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{t("lightScore.chart7Days")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {dailyEnergy.length > 0 ? (
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dailyEnergy}>
                          <defs>
                            <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis
                            dataKey="date"
                            tickFormatter={(val) => formatDate(val)}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                          />
                          <YAxis
                            domain={[-1, 1]}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                            width={30}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                            labelFormatter={(val) => formatDate(val as string)}
                            formatter={(value: number) => [value.toFixed(2), t("lightScore.avgEnergy")]}
                          />
                          <Area
                            type="monotone"
                            dataKey="avgScore"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            fill="url(#energyGradient)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-muted-foreground">
                      {t("lightScore.noChartData")}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Behaviors */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{t("lightScore.recentBehaviors")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {behaviors.length > 0 ? (
                    <ScrollArea className="h-64">
                      <div className="space-y-3 pr-4">
                        {behaviors.slice(0, 10).map((behavior) => {
                          const sentiment = getSentimentBadge(behavior.sentiment_score);
                          return (
                            <motion.div
                              key={behavior.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-primary/10">
                                  {getBehaviorIcon(behavior.behavior_type)}
                                </div>
                                <div>
                                  <p className="text-sm font-medium capitalize">{behavior.behavior_type}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatDate(behavior.analyzed_at)} • {formatTime(behavior.analyzed_at)}
                                  </p>
                                </div>
                              </div>
                              <Badge variant={sentiment.variant} className={sentiment.className}>
                                {sentiment.text}
                              </Badge>
                            </motion.div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="h-32 flex items-center justify-center text-muted-foreground">
                      {t("lightScore.noBehaviors")}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

export default LightScore;
