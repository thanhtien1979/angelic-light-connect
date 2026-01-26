import { motion } from 'framer-motion';
import { useNinePath } from '@/hooks/useNinePath';
import { cn } from '@/lib/utils';

interface NinePathJourneyMapProps {
  onSelectStage: (stageId: number) => void;
}

const NinePathJourneyMap = ({ onSelectStage }: NinePathJourneyMapProps) => {
  const { stages, profile } = useNinePath();
  const currentStage = profile?.current_stage || 1;

  if (!stages) return null;

  // Calculate positions in a circle
  const getPosition = (index: number, total: number) => {
    const angle = (index * 360 / total) - 90; // Start from top
    const radius = 120; // Distance from center
    const x = Math.cos(angle * Math.PI / 180) * radius;
    const y = Math.sin(angle * Math.PI / 180) * radius;
    return { x, y };
  };

  return (
    <div className="space-y-6">
      {/* Circular Journey Map */}
      <div className="relative flex justify-center">
        <div className="relative w-80 h-80">
          {/* Center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.5 }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg"
            >
              <span className="text-3xl font-bold text-white">{currentStage}</span>
            </motion.div>
          </div>

          {/* Connection Lines */}
          <svg className="absolute inset-0 w-full h-full" viewBox="-160 -160 320 320">
            {stages.map((_, index) => {
              const pos1 = getPosition(index, 9);
              const pos2 = getPosition((index + 1) % 9, 9);
              return (
                <motion.line
                  key={`line-${index}`}
                  x1={pos1.x}
                  y1={pos1.y}
                  x2={pos2.x}
                  y2={pos2.y}
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-border"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                />
              );
            })}
          </svg>

          {/* Stage Nodes */}
          {stages.map((stage, index) => {
            const position = getPosition(index, 9);
            const isActive = stage.id === currentStage;
            const isPast = stage.id < currentStage;
            const isFuture = stage.id > currentStage;

            return (
              <motion.button
                key={stage.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.08, type: 'spring' }}
                onClick={() => onSelectStage(stage.id)}
                className={cn(
                  "absolute w-14 h-14 rounded-full flex items-center justify-center transition-all",
                  "hover:scale-110 hover:z-20 cursor-pointer",
                  isActive && "ring-4 ring-violet-500 ring-offset-2 ring-offset-background z-10",
                  isPast && "opacity-60",
                  isFuture && "opacity-40"
                )}
                style={{
                  left: `calc(50% + ${position.x}px - 28px)`,
                  top: `calc(50% + ${position.y}px - 28px)`,
                  backgroundColor: isActive ? stage.theme_color : `${stage.theme_color}40`,
                }}
              >
                <span className={cn(
                  "text-xl",
                  isActive ? "text-white" : ""
                )}>
                  {stage.icon}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Stage List */}
      <div className="grid grid-cols-3 gap-3">
        {stages.map((stage) => {
          const isActive = stage.id === currentStage;
          
          return (
            <motion.button
              key={stage.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectStage(stage.id)}
              className={cn(
                "p-3 rounded-xl border text-center transition-all",
                isActive 
                  ? "border-violet-500 bg-violet-500/10" 
                  : "border-border bg-card/50 hover:border-violet-500/50"
              )}
            >
              <div className="text-2xl mb-1">{stage.icon}</div>
              <div className="text-sm font-medium">{stage.id}. {stage.name_vi}</div>
              {isActive && (
                <div className="text-xs text-violet-500 mt-1">Hiện tại</div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default NinePathJourneyMap;
