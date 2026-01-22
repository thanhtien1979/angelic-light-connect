import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { DailyEnergy, LightStats } from "@/hooks/useLightProfile";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";

interface LightEnergyChartsProps {
  dailyEnergy: DailyEnergy[];
  monthlyEnergy: DailyEnergy[];
  stats: LightStats | null;
}

const LightEnergyCharts = ({ dailyEnergy, monthlyEnergy, stats }: LightEnergyChartsProps) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("7days");

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  };

  // Distribution data for pie chart
  const distributionData = [
    { name: t("lightScore.positive"), value: stats?.positiveCount ?? 0, color: "#10b981" },
    { name: t("lightScore.neutral"), value: stats?.neutralCount ?? 0, color: "#f59e0b" },
    { name: t("lightScore.negative"), value: stats?.negativeCount ?? 0, color: "#ef4444" },
  ].filter((d) => d.value > 0);

  // Weekly comparison data
  const getWeeklyComparison = () => {
    if (monthlyEnergy.length < 7) return [];

    const thisWeek = monthlyEnergy.slice(-7);
    const lastWeek = monthlyEnergy.slice(-14, -7);

    const thisWeekAvg = thisWeek.length > 0
      ? thisWeek.reduce((sum, d) => sum + d.avgScore, 0) / thisWeek.length
      : 0;
    const lastWeekAvg = lastWeek.length > 0
      ? lastWeek.reduce((sum, d) => sum + d.avgScore, 0) / lastWeek.length
      : 0;

    return [
      { name: t("lightScore.lastWeek"), value: Math.round(lastWeekAvg * 100) / 100 },
      { name: t("lightScore.thisWeek"), value: Math.round(thisWeekAvg * 100) / 100 },
    ];
  };

  const renderAreaChart = (data: DailyEnergy[]) => (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
        />
        <YAxis
          domain={[-1, 1]}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          width={35}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            fontSize: "12px",
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
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{t("lightScore.energyTrend")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="7days">{t("lightScore.tab7Days")}</TabsTrigger>
              <TabsTrigger value="30days">{t("lightScore.tab30Days")}</TabsTrigger>
              <TabsTrigger value="distribution">{t("lightScore.tabDistribution")}</TabsTrigger>
              <TabsTrigger value="compare">{t("lightScore.tabTrend")}</TabsTrigger>
            </TabsList>

            <TabsContent value="7days" className="mt-0">
              {dailyEnergy.length > 0 ? (
                renderAreaChart(dailyEnergy)
              ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  {t("lightScore.noChartData")}
                </div>
              )}
            </TabsContent>

            <TabsContent value="30days" className="mt-0">
              {monthlyEnergy.length > 0 ? (
                renderAreaChart(monthlyEnergy)
              ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  {t("lightScore.noChartData")}
                </div>
              )}
            </TabsContent>

            <TabsContent value="distribution" className="mt-0">
              {distributionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  {t("lightScore.noChartData")}
                </div>
              )}
            </TabsContent>

            <TabsContent value="compare" className="mt-0">
              {getWeeklyComparison().length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={getWeeklyComparison()} layout="vertical">
                    <XAxis type="number" domain={[-1, 1]} tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  {t("lightScore.noChartData")}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default LightEnergyCharts;
