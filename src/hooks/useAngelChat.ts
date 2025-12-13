import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/angel-chat`;
const SESSION_ID_KEY = "angel_chat_session_id";
const SESSION_SECRET_KEY = "angel_chat_session_secret";

// Generate a cryptographically secure random string
const generateSecureId = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
};

export const useAngelChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const sessionValidated = useRef(false);

  // Get or create anonymous session credentials
  const getSessionCredentials = useCallback(() => {
    let sessionId = localStorage.getItem(SESSION_ID_KEY);
    let sessionSecret = localStorage.getItem(SESSION_SECRET_KEY);

    if (!sessionId || !sessionSecret) {
      sessionId = generateSecureId();
      sessionSecret = generateSecureId();
      localStorage.setItem(SESSION_ID_KEY, sessionId);
      localStorage.setItem(SESSION_SECRET_KEY, sessionSecret);
    }

    return { sessionId, sessionSecret };
  }, []);

  // Initialize and validate anonymous session
  const initializeAnonymousSession = useCallback(async () => {
    if (isAuthenticated) return true;

    const { sessionId, sessionSecret } = getSessionCredentials();

    try {
      // Check if session exists
      const { data: existingSession } = await supabase
        .from("anonymous_sessions")
        .select("session_id")
        .eq("session_id", sessionId)
        .eq("session_secret", sessionSecret)
        .maybeSingle();

      if (!existingSession) {
        // Create new session
        const { error: insertError } = await supabase
          .from("anonymous_sessions")
          .insert({ session_id: sessionId, session_secret: sessionSecret });

        if (insertError) {
          // Session might already exist with different secret, regenerate
          const newSessionId = generateSecureId();
          const newSessionSecret = generateSecureId();
          localStorage.setItem(SESSION_ID_KEY, newSessionId);
          localStorage.setItem(SESSION_SECRET_KEY, newSessionSecret);

          await supabase
            .from("anonymous_sessions")
            .insert({ session_id: newSessionId, session_secret: newSessionSecret });
        }
      }

      // Validate session context for RLS
      const { sessionId: currentId, sessionSecret: currentSecret } = getSessionCredentials();
      const { data: isValid } = await supabase.rpc("set_session_context", {
        p_session_id: currentId,
        p_session_secret: currentSecret,
      });

      sessionValidated.current = !!isValid;
      return !!isValid;
    } catch (error) {
      console.error("Failed to initialize anonymous session:", error);
      return false;
    }
  }, [isAuthenticated, getSessionCredentials]);

  // Validate session before each DB operation (for anonymous users)
  const ensureSessionContext = useCallback(async () => {
    if (isAuthenticated) return true;
    if (!sessionValidated.current) {
      return await initializeAnonymousSession();
    }

    const { sessionId, sessionSecret } = getSessionCredentials();
    const { data: isValid } = await supabase.rpc("set_session_context", {
      p_session_id: sessionId,
      p_session_secret: sessionSecret,
    });

    sessionValidated.current = !!isValid;
    return !!isValid;
  }, [isAuthenticated, initializeAnonymousSession, getSessionCredentials]);

  // Restore previous messages on mount
  useEffect(() => {
    const restoreMessages = async () => {
      try {
        if (isAuthenticated && user) {
          // Authenticated user: query by user_id
          const { data, error } = await supabase
            .from("chat_messages")
            .select("id, role, content")
            .eq("user_id", user.id)
            .order("created_at", { ascending: true });

          if (error) throw error;

          if (data && data.length > 0) {
            setMessages(
              data.map((m) => ({
                id: m.id,
                role: m.role as "user" | "assistant",
                content: m.content,
              }))
            );
          }
        } else {
          // Anonymous user: validate session first, then query
          const isValid = await initializeAnonymousSession();
          if (!isValid) {
            setIsRestoring(false);
            return;
          }

          const { sessionId } = getSessionCredentials();
          const { data, error } = await supabase
            .from("chat_messages")
            .select("id, role, content")
            .eq("session_id", sessionId)
            .is("user_id", null)
            .order("created_at", { ascending: true });

          if (error) throw error;

          if (data && data.length > 0) {
            setMessages(
              data.map((m) => ({
                id: m.id,
                role: m.role as "user" | "assistant",
                content: m.content,
              }))
            );
          }
        }
      } catch (error) {
        console.error("Failed to restore messages:", error);
      } finally {
        setIsRestoring(false);
      }
    };

    restoreMessages();
  }, [isAuthenticated, user, initializeAnonymousSession, getSessionCredentials]);

  // Clear messages when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      // Reset session validation when auth state changes
      sessionValidated.current = false;
    }
  }, [isAuthenticated]);

  // Save a message to the database
  const saveMessage = async (role: "user" | "assistant", content: string): Promise<string | null> => {
    try {
      if (isAuthenticated && user) {
        // Authenticated user
        const { data, error } = await supabase
          .from("chat_messages")
          .insert({
            session_id: user.id,
            user_id: user.id,
            role,
            content,
          })
          .select("id")
          .single();

        if (error) throw error;
        return data?.id || null;
      } else {
        // Anonymous user: ensure session context is set
        const isValid = await ensureSessionContext();
        if (!isValid) return null;

        const { sessionId } = getSessionCredentials();
        const { data, error } = await supabase
          .from("chat_messages")
          .insert({
            session_id: sessionId,
            user_id: null,
            role,
            content,
          })
          .select("id")
          .single();

        if (error) throw error;
        return data?.id || null;
      }
    } catch (error) {
      console.error("Failed to save message:", error);
      return null;
    }
  };

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessageId = await saveMessage("user", content.trim());
    
    const userMessage: Message = {
      id: userMessageId || Date.now().toString(),
      role: "user",
      content: content.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    let assistantContent = "";
    let assistantMessageId: string | null = null;

    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [
          ...prev,
          { id: assistantMessageId || `assistant-${Date.now()}`, role: "assistant", content: assistantContent },
        ];
      });
    };

    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to connect to Angel AI");
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) updateAssistant(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Save the complete assistant message to database
      if (assistantContent) {
        assistantMessageId = await saveMessage("assistant", assistantContent);
        if (assistantMessageId) {
          setMessages((prev) =>
            prev.map((m, i) =>
              i === prev.length - 1 && m.role === "assistant"
                ? { ...m, id: assistantMessageId! }
                : m
            )
          );
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error(error instanceof Error ? error.message : "Không thể kết nối với Angel AI");
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
      
      // Delete the user message from DB if chat failed
      if (userMessageId) {
        await ensureSessionContext();
        await supabase.from("chat_messages").delete().eq("id", userMessageId);
      }
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, isAuthenticated, user, ensureSessionContext, getSessionCredentials]);

  const clearMessages = useCallback(async () => {
    try {
      if (isAuthenticated && user) {
        await supabase.from("chat_messages").delete().eq("user_id", user.id);
      } else {
        const isValid = await ensureSessionContext();
        if (isValid) {
          const { sessionId } = getSessionCredentials();
          await supabase
            .from("chat_messages")
            .delete()
            .eq("session_id", sessionId)
            .is("user_id", null);
        }
      }
      setMessages([]);
    } catch (error) {
      console.error("Failed to clear messages:", error);
      toast.error("Không thể xóa tin nhắn");
    }
  }, [isAuthenticated, user, ensureSessionContext, getSessionCredentials]);

  return { messages, isLoading, isRestoring, sendMessage, clearMessages, isAuthenticated };
};
