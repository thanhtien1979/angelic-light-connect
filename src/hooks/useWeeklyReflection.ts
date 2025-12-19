import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { startOfWeek, format, parseISO, isSameWeek } from 'date-fns';

const WEEKLY_REFLECTION_KEY = 'breathing-weekly-reflection';
const WEEKLY_REFLECTION_DISMISSED_KEY = 'breathing-weekly-reflection-dismissed';

interface WeeklyReflectionState {
  lastPromptWeek: string | null;
  lastDismissedWeek: string | null;
}

// Gentle, spiritual reflection prompts
const REFLECTION_PROMPTS = [
  "This week, how did your breath support you?",
  "What did you notice when you returned to your breath?",
  "In moments of stillness, what arose within you?",
  "How did presence feel in your body this week?",
  "What did your breath teach you about letting go?",
  "When you paused to breathe, what did you find?",
  "How did returning to your breath change your days?",
  "What inner spaces did your breath reveal?",
];

export const useWeeklyReflection = () => {
  const { user } = useAuth();
  const [showPrompt, setShowPrompt] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [state, setState] = useState<WeeklyReflectionState>(() => {
    try {
      const stored = localStorage.getItem(WEEKLY_REFLECTION_KEY);
      return stored ? JSON.parse(stored) : { lastPromptWeek: null, lastDismissedWeek: null };
    } catch {
      return { lastPromptWeek: null, lastDismissedWeek: null };
    }
  });

  const getCurrentWeek = useCallback(() => {
    return format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  }, []);

  const getRandomPrompt = useCallback(() => {
    const index = Math.floor(Math.random() * REFLECTION_PROMPTS.length);
    return REFLECTION_PROMPTS[index];
  }, []);

  // Check if we should show the reflection prompt
  const checkShouldShowPrompt = useCallback(() => {
    if (!user) return false;
    
    const currentWeek = getCurrentWeek();
    
    // Already shown this week
    if (state.lastPromptWeek === currentWeek) return false;
    
    // Already dismissed this week
    if (state.lastDismissedWeek === currentWeek) return false;
    
    return true;
  }, [user, state, getCurrentWeek]);

  // Initialize prompt check
  useEffect(() => {
    if (checkShouldShowPrompt()) {
      // Small delay to let user settle into the page
      const timer = setTimeout(() => {
        setCurrentPrompt(getRandomPrompt());
        setShowPrompt(true);
        
        // Mark as shown
        const currentWeek = getCurrentWeek();
        const newState = { ...state, lastPromptWeek: currentWeek };
        setState(newState);
        localStorage.setItem(WEEKLY_REFLECTION_KEY, JSON.stringify(newState));
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [checkShouldShowPrompt, getRandomPrompt, getCurrentWeek, state]);

  const dismissPrompt = useCallback(() => {
    setShowPrompt(false);
    
    const currentWeek = getCurrentWeek();
    const newState = { ...state, lastDismissedWeek: currentWeek };
    setState(newState);
    localStorage.setItem(WEEKLY_REFLECTION_KEY, JSON.stringify(newState));
  }, [getCurrentWeek, state]);

  const closePrompt = useCallback(() => {
    setShowPrompt(false);
  }, []);

  return {
    showPrompt,
    currentPrompt,
    dismissPrompt,
    closePrompt,
  };
};
