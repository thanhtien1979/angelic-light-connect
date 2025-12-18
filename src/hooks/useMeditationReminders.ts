import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ReminderSettings {
  reminders_enabled: boolean;
  preferred_times: string[];
  last_reminder_shown: string | null;
}

const GENTLE_REMINDERS = [
  "If you have a quiet moment, a slow breath might feel supportive.",
  "Whenever you're ready, stillness is here for you.",
  "A gentle pause awaits, if it feels right.",
  "Your breath is always with you, offering peace.",
  "Perhaps a moment of presence would feel nourishing.",
  "If rest calls to you, it's okay to answer.",
  "A few soft breaths might bring some ease.",
  "Stillness is patient. It waits for you.",
];

export const useMeditationReminders = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<ReminderSettings>({
    reminders_enabled: false,
    preferred_times: [],
    last_reminder_shown: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [shouldShowReminder, setShouldShowReminder] = useState(false);
  const [currentReminder, setCurrentReminder] = useState('');

  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const getCurrentHour = () => {
    const now = new Date();
    return now.getHours().toString().padStart(2, '0') + ':00';
  };

  const isWithinReminderWindow = useCallback((preferredTimes: string[]) => {
    const currentHour = getCurrentHour();
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return preferredTimes.some(time => {
      const [hours] = time.split(':').map(Number);
      const targetMinutes = hours * 60;
      // Show reminder within 30 minutes of preferred time
      return Math.abs(currentMinutes - targetMinutes) <= 30;
    });
  }, []);

  const fetchSettings = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('meditation_reminders')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching reminder settings:', error);
        return;
      }

      if (data) {
        setSettings({
          reminders_enabled: data.reminders_enabled,
          preferred_times: data.preferred_times || [],
          last_reminder_shown: data.last_reminder_shown,
        });

        // Check if we should show a reminder
        const today = getTodayDate();
        if (
          data.reminders_enabled &&
          data.last_reminder_shown !== today &&
          isWithinReminderWindow(data.preferred_times || [])
        ) {
          const randomReminder = GENTLE_REMINDERS[Math.floor(Math.random() * GENTLE_REMINDERS.length)];
          setCurrentReminder(randomReminder);
          setShouldShowReminder(true);
        }
      }
    } catch (error) {
      console.error('Error fetching reminder settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, isWithinReminderWindow]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = async (newSettings: Partial<ReminderSettings>) => {
    if (!user) return;

    const updatedSettings = { ...settings, ...newSettings };

    try {
      const { error } = await supabase
        .from('meditation_reminders')
        .upsert({
          user_id: user.id,
          reminders_enabled: updatedSettings.reminders_enabled,
          preferred_times: updatedSettings.preferred_times,
          last_reminder_shown: updatedSettings.last_reminder_shown,
        }, { onConflict: 'user_id' });

      if (error) throw error;

      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating reminder settings:', error);
    }
  };

  const toggleReminders = async (enabled: boolean) => {
    await updateSettings({ reminders_enabled: enabled });
  };

  const addPreferredTime = async (time: string) => {
    if (settings.preferred_times.includes(time)) return;
    await updateSettings({
      preferred_times: [...settings.preferred_times, time].sort(),
    });
  };

  const removePreferredTime = async (time: string) => {
    await updateSettings({
      preferred_times: settings.preferred_times.filter(t => t !== time),
    });
  };

  const dismissReminder = async () => {
    setShouldShowReminder(false);
    await updateSettings({ last_reminder_shown: getTodayDate() });
  };

  return {
    settings,
    isLoading,
    shouldShowReminder,
    currentReminder,
    toggleReminders,
    addPreferredTime,
    removePreferredTime,
    dismissReminder,
  };
};
