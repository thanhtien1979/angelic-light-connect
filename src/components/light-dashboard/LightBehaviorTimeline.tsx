import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Heart, Sparkles, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";
import { LightBehavior } from "@/hooks/useLightProfile";

interface LightBehaviorTimelineProps {
  behaviors: LightBehavior[];
}

type FilterType = "all" | "positive" | "neutral" | "negative";

const LightBehaviorTimeline = ({ behaviors }: LightBehaviorTimelineProps) => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<FilterType>("all");
  const [showCount, setShowCount] = useState(10);

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
    if (score > 0.3)
      return {
        text: t("lightScore.positive"),
        className: "bg-emerald-500/20 text-emerald-600 border-emerald-500/30",
      };
    if (score < -0.3)
      return {
        text: t("lightScore.negative"),
        className: "bg-rose-500/20 text-rose-600 border-rose-500/30",
      };
    return {
      text: t("lightScore.neutral"),
      className: "bg-amber-500/20 text-amber-600 border-amber-500/30",
    };
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  const filteredBehaviors = behaviors.filter((b) => {
    if (filter === "all") return true;
    if (filter === "positive") return b.sentiment_score > 0.3;
    if (filter === "negative") return b.sentiment_score < -0.3;
    return b.sentiment_score >= -0.3 && b.sentiment_score <= 0.3;
  });

  const displayedBehaviors = filteredBehaviors.slice(0, showCount);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{t("lightScore.recentBehaviors")}</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1.5">
                  <Filter className="w-3.5 h-3.5" />
                  {filter === "all" && t("lightScore.filterAll")}
                  {filter === "positive" && t("lightScore.positive")}
                  {filter === "neutral" && t("lightScore.neutral")}
                  {filter === "negative" && t("lightScore.negative")}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilter("all")}>
                  {t("lightScore.filterAll")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("positive")}>
                  {t("lightScore.positive")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("neutral")}>
                  {t("lightScore.neutral")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("negative")}>
                  {t("lightScore.negative")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          {displayedBehaviors.length > 0 ? (
            <>
              <ScrollArea className="h-72">
                <div className="space-y-2 pr-4">
                  <AnimatePresence mode="popLayout">
                    {displayedBehaviors.map((behavior, index) => {
                      const sentiment = getSentimentBadge(behavior.sentiment_score);
                      return (
                        <motion.div
                          key={behavior.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ delay: index * 0.02 }}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-primary/10">
                              {getBehaviorIcon(behavior.behavior_type)}
                            </div>
                            <div>
                              <p className="text-sm font-medium capitalize">
                                {behavior.behavior_type}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(behavior.analyzed_at)} •{" "}
                                {formatTime(behavior.analyzed_at)}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className={sentiment.className}>
                            {sentiment.text}
                          </Badge>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </ScrollArea>

              {filteredBehaviors.length > showCount && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-3"
                  onClick={() => setShowCount((prev) => prev + 10)}
                >
                  {t("lightScore.showMore")}
                </Button>
              )}
            </>
          ) : (
            <div className="h-32 flex items-center justify-center text-muted-foreground">
              {t("lightScore.noBehaviors")}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default LightBehaviorTimeline;
