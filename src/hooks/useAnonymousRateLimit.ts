import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";

const STORAGE_KEY_COUNT = "angel_anonymous_message_count";
const STORAGE_KEY_VERIFIED = "angel_turnstile_verified";
const STORAGE_KEY_SESSION = "angel_session_id";
const MAX_FREE_MESSAGES = 5;

export const useAnonymousRateLimit = () => {
  const { isAuthenticated } = useAuth();
  const [messageCount, setMessageCount] = useState(0);
  const [isVerified, setIsVerifiedState] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Initialize state from localStorage
  useEffect(() => {
    const storedCount = localStorage.getItem(STORAGE_KEY_COUNT);
    const storedVerified = localStorage.getItem(STORAGE_KEY_VERIFIED);
    const storedSession = localStorage.getItem(STORAGE_KEY_SESSION);
    
    if (storedCount) {
      setMessageCount(parseInt(storedCount, 10));
    }
    if (storedVerified === "true") {
      setIsVerifiedState(true);
    }
    if (storedSession) {
      setSessionId(storedSession);
    }
  }, []);

  // Reset count when session changes (new session = reset count)
  useEffect(() => {
    const currentSession = localStorage.getItem("angel_session_id");
    if (currentSession !== sessionId && sessionId !== null) {
      // Session changed, reset count but keep verification
      setMessageCount(0);
      localStorage.setItem(STORAGE_KEY_COUNT, "0");
    }
  }, [sessionId]);

  const incrementCount = useCallback(() => {
    if (isAuthenticated || isVerified) return; // Don't count for auth users or verified users
    
    const newCount = messageCount + 1;
    setMessageCount(newCount);
    localStorage.setItem(STORAGE_KEY_COUNT, newCount.toString());
  }, [isAuthenticated, isVerified, messageCount]);

  const setVerified = useCallback((verified: boolean) => {
    setIsVerifiedState(verified);
    localStorage.setItem(STORAGE_KEY_VERIFIED, verified.toString());
    // Reset count after verification to give fresh start
    if (verified) {
      setMessageCount(0);
      localStorage.setItem(STORAGE_KEY_COUNT, "0");
    }
  }, []);

  const resetForNewConversation = useCallback(() => {
    // Keep verification status, just note the new session
    const currentSession = localStorage.getItem("angel_session_id");
    setSessionId(currentSession);
  }, []);

  // Check if verification is needed
  const needsVerification = !isAuthenticated && !isVerified && messageCount >= MAX_FREE_MESSAGES;
  
  // Check if this message will trigger verification
  const willNeedVerification = !isAuthenticated && !isVerified && messageCount >= MAX_FREE_MESSAGES - 1;

  return {
    messageCount,
    isVerified,
    needsVerification,
    willNeedVerification,
    incrementCount,
    setVerified,
    resetForNewConversation,
    maxFreeMessages: MAX_FREE_MESSAGES,
    remainingFreeMessages: Math.max(0, MAX_FREE_MESSAGES - messageCount),
  };
};

