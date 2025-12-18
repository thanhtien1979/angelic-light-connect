import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Plus, X, Clock, Leaf } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useMeditationReminders } from '@/hooks/useMeditationReminders';

const AVAILABLE_TIMES = [
  { value: '06:00', label: 'Early morning (6 AM)' },
  { value: '09:00', label: 'Morning (9 AM)' },
  { value: '12:00', label: 'Midday (12 PM)' },
  { value: '15:00', label: 'Afternoon (3 PM)' },
  { value: '18:00', label: 'Evening (6 PM)' },
  { value: '21:00', label: 'Night (9 PM)' },
];

export const MeditationReminderSettings: React.FC = () => {
  const {
    settings,
    isLoading,
    toggleReminders,
    addPreferredTime,
    removePreferredTime,
  } = useMeditationReminders();

  const [showTimePicker, setShowTimePicker] = useState(false);

  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl bg-card/30 border border-border/20">
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-10 h-10 bg-muted/30 rounded-full" />
          <div className="h-4 bg-muted/30 rounded w-32" />
        </div>
      </div>
    );
  }

  const availableToAdd = AVAILABLE_TIMES.filter(
    t => !settings.preferred_times.includes(t.value)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-border/20"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 rounded-full bg-primary/10">
          <Leaf className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-medium text-foreground">Gentle Reminders</h3>
          <p className="text-sm text-muted-foreground">
            Soft invitations to moments of stillness
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/10">
          <div className="flex items-center gap-3">
            <Bell className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">Receive gentle reminders</span>
          </div>
          <Switch
            checked={settings.reminders_enabled}
            onCheckedChange={toggleReminders}
          />
        </div>

        {/* Preferred Times */}
        <AnimatePresence>
          {settings.reminders_enabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <p className="text-sm text-muted-foreground px-1">
                Choose times when a gentle reminder might feel welcome
              </p>

              {/* Selected Times */}
              {settings.preferred_times.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {settings.preferred_times.map(time => {
                    const timeInfo = AVAILABLE_TIMES.find(t => t.value === time);
                    return (
                      <motion.div
                        key={time}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20"
                      >
                        <Clock className="w-3 h-3 text-primary" />
                        <span className="text-sm text-foreground">
                          {timeInfo?.label || time}
                        </span>
                        <button
                          onClick={() => removePreferredTime(time)}
                          className="p-0.5 rounded-full hover:bg-primary/20 transition-colors"
                        >
                          <X className="w-3 h-3 text-muted-foreground" />
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Add Time Button */}
              {availableToAdd.length > 0 && (
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTimePicker(!showTimePicker)}
                    className="gap-2 border-dashed border-border/40 hover:border-primary/40"
                  >
                    <Plus className="w-3 h-3" />
                    Add a time
                  </Button>

                  <AnimatePresence>
                    {showTimePicker && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-10 mt-2 p-2 rounded-xl bg-card border border-border/30 shadow-lg min-w-[200px]"
                      >
                        {availableToAdd.map(time => (
                          <button
                            key={time.value}
                            onClick={() => {
                              addPreferredTime(time.value);
                              setShowTimePicker(false);
                            }}
                            className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            {time.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Gentle note */}
              <p className="text-xs text-muted-foreground/70 italic px-1 pt-2">
                Reminders are invitations, never obligations. 
                They appear only when you visit, and you can always choose to continue as you are.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
