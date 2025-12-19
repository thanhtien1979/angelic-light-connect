import { motion } from 'framer-motion';
import { Wind, Sparkles, Leaf } from 'lucide-react';
import { useBreathingStats } from '@/hooks/useBreathingStats';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const BreathingStatistics = () => {
  const { stats, isLoading, showPresenceIndicator, togglePresenceIndicator } = useBreathingStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Wind className="w-6 h-6 text-primary/50" />
        </motion.div>
      </div>
    );
  }

  const hasAnyData = stats.monthlySessions > 0 || stats.weeklySessions > 0;

  if (!hasAnyData) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-8"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
          <Wind className="w-7 h-7 text-primary/40" />
        </div>
        <p className="text-sm text-muted-foreground/70 italic max-w-xs mx-auto">
          Your breathing journey awaits. Each moment of presence begins with a single breath.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Presence Continuity Indicator */}
      {showPresenceIndicator && stats.presenceDays > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[hsl(45,50%,70%)]/10 via-primary/5 to-[hsl(350,40%,75%)]/10 border border-[hsl(45,50%,70%)]/20 p-5"
        >
          {/* Soft ambient glow */}
          <div className="absolute inset-0 bg-gradient-radial from-[hsl(45,50%,70%)]/5 to-transparent opacity-50" />
          
          <div className="relative flex items-center gap-4">
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="w-14 h-14 rounded-full bg-gradient-to-br from-[hsl(45,50%,70%)]/30 to-[hsl(350,40%,75%)]/20 flex items-center justify-center shadow-[0_0_20px_hsl(45,50%,70%,0.2)]"
            >
              <Leaf className="w-6 h-6 text-[hsl(45,50%,60%)]" />
            </motion.div>
            
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-1">
                Days of Returning
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-light text-foreground/90">{stats.presenceDays}</span>
                <span className="text-sm text-muted-foreground/50 italic">
                  {stats.presenceDays === 1 ? 'day of presence' : 'days of presence'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Weekly & Monthly Reflections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* This Week */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="relative overflow-hidden rounded-xl bg-card/30 border border-border/30 p-5"
        >
          {/* Flowing gradient bar */}
          <div className="absolute top-0 left-0 right-0 h-1">
            <motion.div
              className="h-full bg-gradient-to-r from-primary/40 via-[hsl(200,60%,60%)]/40 to-primary/40"
              style={{ 
                width: `${Math.min((stats.weeklyMinutes / 30) * 100, 100)}%`,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((stats.weeklyMinutes / 30) * 100, 100)}%` }}
              transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
            />
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Wind className="w-4 h-4 text-primary/70" />
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-2">
                This Week
              </p>
              
              {stats.weeklySessions > 0 ? (
                <>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    You returned to your breath{' '}
                    <span className="font-medium text-primary">{stats.weeklySessions}</span>
                    {stats.weeklySessions === 1 ? ' time' : ' times'}
                  </p>
                  <p className="text-xs text-muted-foreground/50 mt-1 italic">
                    {stats.weeklyMinutes} {stats.weeklyMinutes === 1 ? 'minute' : 'minutes'} of presence
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground/60 italic">
                  A new week awaits your presence
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* This Month */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="relative overflow-hidden rounded-xl bg-card/30 border border-border/30 p-5"
        >
          {/* Flowing gradient bar */}
          <div className="absolute top-0 left-0 right-0 h-1">
            <motion.div
              className="h-full bg-gradient-to-r from-[hsl(45,50%,60%)]/40 via-[hsl(350,40%,70%)]/40 to-[hsl(45,50%,60%)]/40"
              style={{ 
                width: `${Math.min((stats.monthlyMinutes / 120) * 100, 100)}%`,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((stats.monthlyMinutes / 120) * 100, 100)}%` }}
              transition={{ duration: 1.5, ease: 'easeOut', delay: 0.6 }}
            />
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-[hsl(45,50%,60%)]/10">
              <Sparkles className="w-4 h-4 text-[hsl(45,50%,60%)]/70" />
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-2">
                This Month
              </p>
              
              {stats.monthlySessions > 0 ? (
                <>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    You spent time returning to stillness{' '}
                    <span className="font-medium text-[hsl(45,50%,55%)]">{stats.monthlySessions}</span>
                    {stats.monthlySessions === 1 ? ' time' : ' times'}
                  </p>
                  <p className="text-xs text-muted-foreground/50 mt-1 italic">
                    {stats.monthlyMinutes} {stats.monthlyMinutes === 1 ? 'minute' : 'minutes'} of breath awareness
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground/60 italic">
                  A new month of possibilities
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Presence Indicator Toggle */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex items-center justify-between pt-4 border-t border-border/20"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-muted/30">
            <Leaf className="w-4 h-4 text-muted-foreground/50" />
          </div>
          <div>
            <Label htmlFor="presence-indicator" className="text-sm font-medium text-foreground/80 cursor-pointer">
              Show Days of Returning
            </Label>
            <p className="text-xs text-muted-foreground/50">
              Display continuity of practice gently
            </p>
          </div>
        </div>
        <Switch
          id="presence-indicator"
          checked={showPresenceIndicator}
          onCheckedChange={togglePresenceIndicator}
          className="data-[state=checked]:bg-[hsl(45,50%,60%)]"
        />
      </motion.div>
    </motion.div>
  );
};

export default BreathingStatistics;
