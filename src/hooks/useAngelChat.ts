import { useState, useCallback, useEffect } from "react";
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

// Generate a cryptographically secure random string (64 hex chars = 256 bits)
const generateSecureId = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
};

// Get or create anonymous session ID from localStorage
const getSessionId = () => {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = generateSecureId();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
};

export const useAngelChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);
  const { user, isAuthenticated } = useAuth();

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
          // Anonymous user: query by session_id stored in localStorage
          const sessionId = getSessionId();
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
  }, [isAuthenticated, user]);

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
        // Anonymous user
        const sessionId = getSessionId();
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
        await supabase.from("chat_messages").delete().eq("id", userMessageId);
      }
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, isAuthenticated, user]);

  const clearMessages = useCallback(async () => {
    try {
      if (isAuthenticated && user) {
        await supabase.from("chat_messages").delete().eq("user_id", user.id);
      } else {
        const sessionId = getSessionId();
        await supabase
          .from("chat_messages")
          .delete()
          .eq("session_id", sessionId)
          .is("user_id", null);
      }
      setMessages([]);
    } catch (error) {
      console.error("Failed to clear messages:", error);
      toast.error("Không thể xóa tin nhắn");
    }
  }, [isAuthenticated, user]);

  return { messages, isLoading, isRestoring, sendMessage, clearMessages, isAuthenticated };
};
