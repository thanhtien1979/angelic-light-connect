import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Upload, Sparkles, Heart, Sun, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNinePath, NinePathDailyTask } from '@/hooks/useNinePath';
import NinePathProofDialog from './NinePathProofDialog';

const categoryConfig = {
  healing: {
    icon: Heart,
    label: 'Chữa Lành',
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
  },
  awakening: {
    icon: Sun,
    label: 'Thức Tỉnh',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
  },
  service: {
    icon: Users,
    label: 'Phụng Sự',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
  },
};

const verificationLabels = {
  self_claim: { label: 'Tự xác nhận', points: 10 },
  proof: { label: 'Có chứng minh', points: 25 },
  community_witness: { label: 'Cộng đồng xác nhận', points: 50 },
  impact_verified: { label: 'Đã xác minh tác động', points: 100 },
};

const NinePathDashboard = () => {
  const { 
    profile, 
    currentStage, 
    dailyTasks, 
    tasksLoading,
    completeTask,
    isCompletingTask,
  } = useNinePath();

  const [selectedTask, setSelectedTask] = useState<NinePathDailyTask | null>(null);

  const completedTasks = dailyTasks?.filter(t => t.is_completed).length || 0;
  const totalTasks = dailyTasks?.length || 0;
  const dailyProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  if (tasksLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Stage Hero */}
      {currentStage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card 
            className="overflow-hidden border-2"
            style={{ borderColor: `${currentStage.theme_color}40` }}
          >
            <div 
              className="absolute inset-0 opacity-10"
              style={{ 
                background: `linear-gradient(135deg, ${currentStage.theme_color}, transparent)` 
              }}
            />
            <CardContent className="relative pt-6">
              <div className="flex items-center gap-4">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                  style={{ backgroundColor: `${currentStage.theme_color}20` }}
                >
                  {currentStage.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{currentStage.id}</span>
                    <span className="text-lg font-medium">{currentStage.name_vi}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {currentStage.description_vi}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold" style={{ color: currentStage.theme_color }}>
                    {profile?.total_points || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">điểm ánh sáng</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Daily Progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-500" />
              Tiến độ hôm nay
            </span>
            <Badge variant="outline">{completedTasks}/{totalTasks}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={dailyProgress} className="h-2" />
        </CardContent>
      </Card>

      {/* Daily Tasks */}
      <div className="space-y-3">
        <h3 className="font-medium text-sm text-muted-foreground">
          Nhiệm vụ hôm nay
        </h3>
        
        {dailyTasks?.map((task, index) => {
          const config = categoryConfig[task.category];
          const Icon = config.icon;
          const verification = verificationLabels[task.verification_level];

          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={`transition-all ${
                  task.is_completed ? 'opacity-75' : ''
                } ${config.borderColor}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Category Icon */}
                    <div className={`p-2 rounded-lg ${config.bgColor}`}>
                      <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>

                    {/* Task Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">
                          {config.label}
                        </Badge>
                        {task.is_completed && (
                          <Badge className="text-xs bg-green-500/20 text-green-500 border-green-500/30">
                            +{task.points_earned} điểm
                          </Badge>
                        )}
                      </div>
                      <h4 className={`font-medium ${task.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                        {task.task_title}
                      </h4>
                      {task.task_description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {task.task_description}
                        </p>
                      )}
                      
                      {task.is_completed && (
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs">
                            {verification.label}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      {!task.is_completed ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => completeTask(task.id)}
                            disabled={isCompletingTask}
                            className="gap-1"
                          >
                            <Check className="w-4 h-4" />
                            <span className="hidden sm:inline">Xong</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => setSelectedTask(task)}
                            className="gap-1 bg-gradient-to-r from-violet-500 to-purple-600"
                          >
                            <Upload className="w-4 h-4" />
                            <span className="hidden sm:inline">Proof</span>
                          </Button>
                        </>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                          <Check className="w-4 h-4 text-green-500" />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        {(!dailyTasks || dailyTasks.length === 0) && (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center text-muted-foreground">
              <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Đang tải nhiệm vụ...</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Proof Dialog */}
      <NinePathProofDialog
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  );
};

export default NinePathDashboard;
