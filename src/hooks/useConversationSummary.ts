import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ConversationSummary {
  id: string;
  session_id: string;
  summary: string;
  key_themes: string[];
  emotional_tone: string | null;
  message_count: number;
  updated_at: string;
}

const SESSION_ID_KEY = "angel_chat_session_id";

const getSessionId = () => {
  return localStorage.getItem(SESSION_ID_KEY) || "";
};

export const useConversationSummary = () => {
  const [summary, setSummary] = useState<ConversationSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Fetch existing summary on mount - wrapped in try/catch
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setHasError(false);
        let query = supabase
          .from("conversation_summaries")
          .select("*");

        if (isAuthenticated && user) {
          query = query.eq("user_id", user.id);
        } else {
          const sessionId = getSessionId();
          if (!sessionId) {
            setIsLoading(false);
            return;
          }
          query = query.eq("session_id", sessionId).is("user_id", null);
        }

        const { data, error } = await query.maybeSingle();

        if (error) {
          // Log silently for debugging, don't expose to user
          console.error("[Summary] Fetch error:", error.message);
          setHasError(true);
          // Don't throw - allow chat to continue without summary
        }

        if (data) {
          // Safely handle potentially malformed data
          setSummary({
            id: data.id || "",
            session_id: data.session_id || "",
            summary: data.summary || "",
            key_themes: Array.isArray(data.key_themes) ? data.key_themes : [],
            emotional_tone: data.emotional_tone || null,
            message_count: typeof data.message_count === "number" ? data.message_count : 0,
            updated_at: data.updated_at || "",
          });
        }
      } catch (error) {
        // Silent logging for debugging
        console.error("[Summary] Unexpected fetch error:", error);
        setHasError(true);
        // Don't rethrow - chat experience should continue uninterrupted
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [isAuthenticated, user]);

  // Update or create summary - fully wrapped with error handling
  const updateSummary = useCallback(async (
    newSummary: string,
    keyThemes: string[],
    emotionalTone: string,
    messageCount: number
  ) => {
    // Validate inputs before attempting database operation
    if (!newSummary || typeof newSummary !== "string") {
      console.warn("[Summary] Invalid summary data, skipping save");
      return;
    }

    try {
      const sessionId = isAuthenticated && user ? user.id : getSessionId();
      
      // Don't attempt save if no valid session
      if (!sessionId) {
        console.warn("[Summary] No session ID available, skipping save");
        return;
      }

      const userId = isAuthenticated && user ? user.id : null;

      const summaryData = {
        session_id: sessionId,
        user_id: userId,
        summary: newSummary.slice(0, 5000), // Truncate to prevent DB errors
        key_themes: Array.isArray(keyThemes) ? keyThemes.slice(0, 10) : [],
        emotional_tone: emotionalTone?.slice(0, 200) || null,
        message_count: Math.max(0, messageCount),
      };

      const { data, error } = await supabase
        .from("conversation_summaries")
        .upsert(summaryData, {
          onConflict: "session_id,user_id",
        })
        .select()
        .maybeSingle();

      if (error) {
        // Log silently for debugging
        console.error("[Summary] Upsert error:", error.message);
        // Don't throw - chat should continue without blocking
        return;
      }

      if (data) {
        setSummary({
          id: data.id || "",
          session_id: data.session_id || "",
          summary: data.summary || "",
          key_themes: Array.isArray(data.key_themes) ? data.key_themes : [],
          emotional_tone: data.emotional_tone || null,
          message_count: typeof data.message_count === "number" ? data.message_count : 0,
          updated_at: data.updated_at || "",
        });
      }
    } catch (error) {
      // Silent logging - never block chat experience
      console.error("[Summary] Unexpected save error:", error);
      // Don't rethrow - allow chat to continue seamlessly
    }
  }, [isAuthenticated, user]);

  // Clear summary (when starting new conversation)
  const clearSummary = useCallback(() => {
    setSummary(null);
    setHasError(false);
  }, []);

  return { summary, isLoading, hasError, updateSummary, clearSummary };
};
