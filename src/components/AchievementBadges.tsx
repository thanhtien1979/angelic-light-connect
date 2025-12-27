import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Lock, Star, Medal, Crown, Gem } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAchievements, Achievement, ACHIEVEMENTS } from '@/hooks/useAchievements';
import { cn } from '@/lib/utils';

interface AchievementBadgesProps {
  userId?: string;
  compact?: boolean;
}

const tierColors = {
  bronze: 'from-amber-600 to-amber-400',
  silver: 'from-slate-400 to-slate-200',
  gold: 'from-yellow-500 to-yellow-300',
  diamond: 'from-cyan-400 to-purple-400',
};

const tierIcons = {
  bronze: Medal,
  silver: Star,
  gold: Crown,
  diamond: Gem,
};

const categoryLabels = {
  meditation: 'Thiền định',
  breathing: 'Hơi thở',
  social: 'Xã hội',
  reflection: 'Suy ngẫm',
  general: 'Tổng quát',
};

const AchievementCard: React.FC<{
  achievement: Achievement;
  isUnlocked: boolean;
  progress: number;
  onClick: () => void;
}> = ({ achievement, isUnlocked, progress, onClick }) => {
  const TierIcon = tierIcons[achievement.tier];
  
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className={cn(
        "relative overflow-hidden transition-all duration-300",
        isUnlocked 
          ? "bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30" 
          : "bg-muted/30 border-muted"
      )}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center text-2xl",
              isUnlocked 
                ? `bg-gradient-to-br ${tierColors[achievement.tier]}` 
                : "bg-muted"
            )}>
              {isUnlocked ? achievement.icon : <Lock className="w-5 h-5 text-muted-foreground" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className={cn(
                  "font-medium truncate",
                  isUnlocked ? "text-foreground" : "text-muted-foreground"
                )}>
                  {achievement.name}
                </h4>
                <TierIcon className={cn(
                  "w-4 h-4 flex-shrink-0",
                  isUnlocked ? "text-primary" : "text-muted-foreground/50"
                )} />
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {achievement.description}
              </p>
              {!isUnlocked && (
                <Progress value={progress} className="h-1 mt-2" />
              )}
            </div>
          </div>
          {isUnlocked && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute top-2 right-2"
            >
              <Badge variant="secondary" className="text-xs bg-primary/20">
                ✓ Đã mở khóa
              </Badge>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

const AchievementBadges: React.FC<AchievementBadgesProps> = ({ userId, compact = false }) => {
  const { achievements, isUnlocked, getAchievementProgress, unlockedAchievements, isLoading } = useAchievements(userId);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const unlockedCount = unlockedAchievements.length;
  const totalCount = achievements.length;

  const filteredAchievements = activeCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === activeCategory);

  // Compact mode - show only unlocked badges
  if (compact) {
    const unlocked = achievements.filter(a => isUnlocked(a.id));
    
    if (unlocked.length === 0) {
      return (
        <div className="text-center text-muted-foreground text-sm py-4">
          Chưa có huy hiệu nào
        </div>
      );
    }

    return (
      <div className="flex flex-wrap gap-2">
        {unlocked.slice(0, 6).map(achievement => (
          <motion.div
            key={achievement.id}
            whileHover={{ scale: 1.1 }}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-lg",
              `bg-gradient-to-br ${tierColors[achievement.tier]}`
            )}
            title={achievement.name}
          >
            {achievement.icon}
          </motion.div>
        ))}
        {unlocked.length > 6 && (
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-muted text-sm font-medium">
            +{unlocked.length - 6}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="w-5 h-5 text-primary" />
              Thành tựu
            </CardTitle>
            <Badge variant="outline" className="text-primary">
              {unlockedCount}/{totalCount}
            </Badge>
          </div>
          <Progress 
            value={(unlockedCount / totalCount) * 100} 
            className="h-2 mt-2" 
          />
        </CardHeader>
        <CardContent className="pt-0">
          <Tabs defaultValue="all" onValueChange={setActiveCategory}>
            <TabsList className="w-full justify-start overflow-x-auto flex-nowrap mb-4">
              <TabsTrigger value="all" className="text-xs">Tất cả</TabsTrigger>
              <TabsTrigger value="meditation" className="text-xs">Thiền định</TabsTrigger>
              <TabsTrigger value="breathing" className="text-xs">Hơi thở</TabsTrigger>
              <TabsTrigger value="social" className="text-xs">Xã hội</TabsTrigger>
              <TabsTrigger value="reflection" className="text-xs">Suy ngẫm</TabsTrigger>
              <TabsTrigger value="general" className="text-xs">Tổng quát</TabsTrigger>
            </TabsList>

            <TabsContent value={activeCategory} className="mt-0">
              {isLoading ? (
                <div className="grid grid-cols-1 gap-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2">
                  <AnimatePresence mode="popLayout">
                    {filteredAchievements
                      .sort((a, b) => {
                        const aUnlocked = isUnlocked(a.id);
                        const bUnlocked = isUnlocked(b.id);
                        if (aUnlocked && !bUnlocked) return -1;
                        if (!aUnlocked && bUnlocked) return 1;
                        return 0;
                      })
                      .map(achievement => (
                        <motion.div
                          key={achievement.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                        >
                          <AchievementCard
                            achievement={achievement}
                            isUnlocked={isUnlocked(achievement.id)}
                            progress={getAchievementProgress(achievement)}
                            onClick={() => setSelectedAchievement(achievement)}
                          />
                        </motion.div>
                      ))}
                  </AnimatePresence>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Achievement Detail Dialog */}
      <Dialog open={!!selectedAchievement} onOpenChange={() => setSelectedAchievement(null)}>
        <DialogContent className="sm:max-w-md">
          {selectedAchievement && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center text-3xl",
                    isUnlocked(selectedAchievement.id)
                      ? `bg-gradient-to-br ${tierColors[selectedAchievement.tier]}`
                      : "bg-muted"
                  )}>
                    {isUnlocked(selectedAchievement.id) 
                      ? selectedAchievement.icon 
                      : <Lock className="w-6 h-6 text-muted-foreground" />
                    }
                  </div>
                  <div>
                    <h3 className="text-xl">{selectedAchievement.name}</h3>
                    <Badge variant="outline" className="mt-1">
                      {categoryLabels[selectedAchievement.category]}
                    </Badge>
                  </div>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <p className="text-muted-foreground">
                  {selectedAchievement.description}
                </p>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Cấp độ:</span>
                  <Badge className={cn(
                    "capitalize",
                    `bg-gradient-to-r ${tierColors[selectedAchievement.tier]} text-white`
                  )}>
                    {selectedAchievement.tier === 'bronze' && 'Đồng'}
                    {selectedAchievement.tier === 'silver' && 'Bạc'}
                    {selectedAchievement.tier === 'gold' && 'Vàng'}
                    {selectedAchievement.tier === 'diamond' && 'Kim cương'}
                  </Badge>
                </div>

                {!isUnlocked(selectedAchievement.id) && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Tiến độ:</span>
                      <span className="font-medium">
                        {Math.round(getAchievementProgress(selectedAchievement))}%
                      </span>
                    </div>
                    <Progress 
                      value={getAchievementProgress(selectedAchievement)} 
                      className="h-2" 
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      Yêu cầu: {selectedAchievement.requirement}
                    </p>
                  </div>
                )}

                {isUnlocked(selectedAchievement.id) && (
                  <div className="text-center py-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="inline-flex items-center gap-2 text-primary"
                    >
                      <Trophy className="w-5 h-5" />
                      <span className="font-medium">Đã mở khóa!</span>
                    </motion.div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AchievementBadges;
