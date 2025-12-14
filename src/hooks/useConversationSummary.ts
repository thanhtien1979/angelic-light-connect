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
  const { user, isAuthenticated } = useAuth();

  // Fetch existing summary on mount
  useEffect(() => {
    const fetchSummary = async () => {
      try {
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

        const { data, error } = await query.single();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching summary:", error);
        }

        if (data) {
          setSummary(data as ConversationSummary);
        }
      } catch (error) {
        console.error("Failed to fetch summary:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [isAuthenticated, user]);

  // Update or create summary
  const updateSummary = useCallback(async (
    newSummary: string,
    keyThemes: string[],
    emotionalTone: string,
    messageCount: number
  ) => {
    try {
      const sessionId = isAuthenticated && user ? user.id : getSessionId();
      const userId = isAuthenticated && user ? user.id : null;

      const summaryData = {
        session_id: sessionId,
        user_id: userId,
        summary: newSummary,
        key_themes: keyThemes,
        emotional_tone: emotionalTone,
        message_count: messageCount,
      };

      const { data, error } = await supabase
        .from("conversation_summaries")
        .upsert(summaryData, {
          onConflict: "session_id,user_id",
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setSummary(data as ConversationSummary);
      }
    } catch (error) {
      console.error("Failed to update summary:", error);
    }
  }, [isAuthenticated, user]);

  // Clear summary (when starting new conversation)
  const clearSummary = useCallback(() => {
    setSummary(null);
  }, []);

  return { summary, isLoading, updateSummary, clearSummary };
};
