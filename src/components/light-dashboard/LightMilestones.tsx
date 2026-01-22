import { motion } from "framer-motion";
import {
  Sparkles,
  Flame,
  Heart,
  Users,
  Sun,
  Calendar,
  Shield,
  Crown,
  Lock,
  Check,
  Share2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { LightMilestone } from "@/hooks/useLightProfile";

interface LightMilestonesProps {
  milestones: LightMilestone[];
  onShareMilestone?: (milestone: LightMilestone) => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  sparkles: Sparkles,
  flame: Flame,
  heart: Heart,
  users: Users,
  sun: Sun,
  calendar: Calendar,
  shield: Shield,
  crown: Crown,
};

const LightMilestones = ({ milestones, onShareMilestone }: LightMilestonesProps) => {
  const { t } = useLanguage();

  const getProgress = (milestone: LightMilestone) => {
    return Math.min((milestone.current / milestone.requirement) * 100, 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            {t("lightScore.milestones")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {milestones.map((milestone, index) => {
              const IconComponent = iconMap[milestone.icon] || Sparkles;
              const progress = getProgress(milestone);

              return (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className={`relative p-4 rounded-xl border transition-all ${
                    milestone.achieved
                      ? "bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30"
                      : "bg-muted/30 border-border/50"
                  }`}
                >
                  {/* Achievement badge & share button */}
                  {milestone.achieved && (
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      {onShareMilestone && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-6 h-6 rounded-full hover:bg-amber-500/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            onShareMilestone(milestone);
                          }}
                        >
                          <Share2 className="w-3 h-3 text-amber-600" />
                        </Button>
                      )}
                      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        milestone.achieved
                          ? "bg-amber-500/20"
                          : "bg-muted"
                      }`}
                    >
                      {milestone.achieved ? (
                        <IconComponent className="w-5 h-5 text-amber-500" />
                      ) : (
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4
                        className={`font-medium text-sm truncate ${
                          milestone.achieved ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {milestone.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {milestone.description}
                      </p>

                      {!milestone.achieved && (
                        <div className="mt-2">
                          <Progress value={progress} className="h-1.5" />
                          <p className="text-xs text-muted-foreground mt-1">
                            {milestone.current}/{milestone.requirement}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default LightMilestones;
