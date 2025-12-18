import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface MonthData {
  month: number;
  name: string;
  totalSeconds: number;
  intensity: number;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const MeditationYearWheel = () => {
  const { user } = useAuth();
  const [monthlyData, setMonthlyData] = useState<MonthData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchYearlyData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const currentYear = new Date().getFullYear();
        const startOfYear = `${currentYear}-01-01`;
        const endOfYear = `${currentYear}-12-31`;

        const { data, error } = await supabase
          .from('meditation_history')
          .select('duration_seconds, completed_at')
          .eq('user_id', user.id)
          .gte('completed_at', startOfYear)
          .lte('completed_at', endOfYear);

        if (error) throw error;

        // Group by month
        const monthTotals = new Map<number, number>();
        
        data?.forEach((entry) => {
          const month = new Date(entry.completed_at).getMonth();
          const current = monthTotals.get(month) || 0;
          monthTotals.set(month, current + entry.duration_seconds);
        });

        // Find max for normalization
        const maxSeconds = Math.max(...Array.from(monthTotals.values()), 1);

        // Build month data
        const months: MonthData[] = MONTH_NAMES.map((name, index) => {
          const totalSeconds = monthTotals.get(index) || 0;
          return {
            month: index,
            name,
            totalSeconds,
            intensity: totalSeconds / maxSeconds,
          };
        });

        setMonthlyData(months);
      } catch (error) {
        console.error('Error fetching yearly meditation data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchYearlyData();
  }, [user?.id]);

  const currentMonth = new Date().getMonth();
  const hasData = monthlyData.some(m => m.totalSeconds > 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-48 h-48 rounded-full bg-gradient-to-br from-primary/10 to-gold/10"
        />
      </div>
    );
  }

  return (
    <div className="relative py-8">
      {/* Ambient glow background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            opacity: [0.1, 0.2, 0.1],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-gradient-radial from-gold/20 via-rose-200/10 to-transparent blur-3xl"
        />
      </div>

      {/* Title */}
      <div className="text-center mb-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 mb-2"
        >
          <Sparkles className="w-4 h-4 text-gold/60" />
          <span className="text-xs uppercase tracking-widest text-muted-foreground/60">
            {new Date().getFullYear()}
          </span>
          <Sparkles className="w-4 h-4 text-gold/60" />
        </motion.div>
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-serif text-xl text-foreground/80"
        >
          Moments of Stillness
        </motion.h3>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xs text-muted-foreground/50 mt-1 italic"
        >
          Your presence across the seasons
        </motion.p>
      </div>

      {/* Circular Year Wheel */}
      <div className="relative flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative w-64 h-64 md:w-80 md:h-80"
        >
          {/* Central glow */}
          <motion.div
            animate={{
              boxShadow: [
                '0 0 60px hsl(var(--gold) / 0.15)',
                '0 0 80px hsl(var(--gold) / 0.25)',
                '0 0 60px hsl(var(--gold) / 0.15)',
              ],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-[30%] rounded-full bg-gradient-to-br from-gold/10 via-rose-100/10 to-lavender/10"
          />

          {/* Inner circle with soft light */}
          <div className="absolute inset-[35%] rounded-full bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border/20 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 rounded-full bg-gradient-to-br from-gold/40 to-rose-200/40"
            />
          </div>

          {/* Month segments */}
          {monthlyData.map((month, index) => {
            const angle = (index * 30) - 90;
            const radians = (angle * Math.PI) / 180;
            const radius = 45;
            const x = 50 + radius * Math.cos(radians);
            const y = 50 + radius * Math.sin(radians);

            const isCurrentMonth = index === currentMonth;
            const baseOpacity = 0.15;
            const intensity = month.intensity;

            return (
              <motion.div
                key={month.name}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.05 + 0.3, duration: 0.5 }}
                className="absolute"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {/* Month orb */}
                <motion.div
                  animate={
                    hasData && intensity > 0
                      ? {
                          opacity: [baseOpacity + intensity * 0.6, baseOpacity + intensity * 0.8, baseOpacity + intensity * 0.6],
                          scale: [1, 1 + intensity * 0.1, 1],
                        }
                      : {}
                  }
                  transition={{
                    duration: 3 + index * 0.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: index * 0.1,
                  }}
                  className={`
                    relative flex items-center justify-center
                    w-10 h-10 md:w-12 md:h-12 rounded-full
                    transition-all duration-500
                    ${isCurrentMonth ? 'ring-2 ring-gold/40 ring-offset-2 ring-offset-background' : ''}
                  `}
                  style={{
                    background: hasData && intensity > 0
                      ? `radial-gradient(circle, 
                          hsl(var(--gold) / ${0.1 + intensity * 0.4}), 
                          hsl(43 70% 85% / ${0.05 + intensity * 0.2}),
                          transparent
                        )`
                      : `radial-gradient(circle, hsl(var(--muted) / 0.1), transparent)`,
                    boxShadow: hasData && intensity > 0
                      ? `0 0 ${20 + intensity * 30}px hsl(var(--gold) / ${0.1 + intensity * 0.3})`
                      : 'none',
                  }}
                >
                  {/* Inner glow for high intensity months */}
                  {hasData && intensity > 0.5 && (
                    <motion.div
                      animate={{
                        opacity: [0.3, 0.6, 0.3],
                        scale: [0.8, 1, 0.8],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-2 rounded-full bg-gradient-to-br from-gold/30 to-rose-200/20"
                    />
                  )}

                  {/* Month label */}
                  <span
                    className={`
                      relative z-10 text-[10px] md:text-xs font-medium
                      ${isCurrentMonth ? 'text-gold' : hasData && intensity > 0.3 ? 'text-foreground/70' : 'text-muted-foreground/40'}
                    `}
                  >
                    {month.name}
                  </span>
                </motion.div>

                {/* Connecting line to center */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: hasData && intensity > 0 ? 0.1 + intensity * 0.2 : 0.05 }}
                  transition={{ delay: index * 0.05 + 0.5 }}
                  className="absolute w-px bg-gradient-to-t from-transparent via-gold/20 to-transparent"
                  style={{
                    height: '30px',
                    left: '50%',
                    bottom: '100%',
                    transform: `translateX(-50%) rotate(${angle + 90}deg)`,
                    transformOrigin: 'bottom center',
                  }}
                />
              </motion.div>
            );
          })}

          {/* Decorative outer ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border border-dashed border-border/10"
          />

          {/* Subtle outer glow ring */}
          <div className="absolute -inset-4 rounded-full border border-gold/5" />
        </motion.div>
      </div>

      {/* Gentle message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center mt-8 relative z-10"
      >
        {hasData ? (
          <p className="text-xs text-muted-foreground/50 italic max-w-xs mx-auto">
            Each glow reflects time spent in quiet presence. The light grows with your practice.
          </p>
        ) : (
          <p className="text-xs text-muted-foreground/50 italic max-w-xs mx-auto">
            Begin your journey. Each moment of stillness adds light to your year.
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default MeditationYearWheel;
