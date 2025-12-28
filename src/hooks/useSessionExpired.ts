import { useState, useCallback, useEffect } from "react";

// Global event system for session expired
type SessionExpiredListener = () => void;
const listeners: Set<SessionExpiredListener> = new Set();

export const triggerSessionExpired = () => {
  listeners.forEach((listener) => listener());
};

export const useSessionExpired = () => {
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  const showSessionExpired = useCallback(() => {
    setIsSessionExpired(true);
  }, []);

  const hideSessionExpired = useCallback(() => {
    setIsSessionExpired(false);
  }, []);

  useEffect(() => {
    listeners.add(showSessionExpired);
    return () => {
      listeners.delete(showSessionExpired);
    };
  }, [showSessionExpired]);

  return {
    isSessionExpired,
    showSessionExpired,
    hideSessionExpired,
  };
};
