import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/angel-chat`;

// Get or create a persistent session ID
const getSessionId = (): string => {
  const key = "angel-chat-session-id";
  let sessionId = localStorage.getItem(key);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(key, sessionId);
  }
  return sessionId;
};

export const useAngelChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);
  const sessionId = getSessionId();

  // Restore previous messages on mount
  useEffect(() => {
    const restoreMessages = async () => {
      try {
        const { data, error } = await supabase
          .from("chat_messages")
          .select("id, role, content")
          .eq("session_id", sessionId)
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
      } catch (error) {
        console.error("Failed to restore messages:", error);
      } finally {
        setIsRestoring(false);
      }
    };

    restoreMessages();
  }, [sessionId]);

  // Save a message to the database
  const saveMessage = async (role: "user" | "assistant", content: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .insert({
          session_id: sessionId,
          role,
          content,
        })
        .select("id")
        .single();

      if (error) throw error;
      return data?.id || null;
    } catch (error) {
      console.error("Failed to save message:", error);
      return null;
    }
  };

  // Update assistant message in database
  const updateMessage = async (id: string, content: string) => {
    try {
      await supabase
        .from("chat_messages")
        .update({ content })
        .eq("id", id);
    } catch (error) {
      console.error("Failed to update message:", error);
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

    const updateAssistant = async (chunk: string) => {
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
  }, [messages, isLoading, sessionId]);

  const clearMessages = useCallback(async () => {
    try {
      await supabase.from("chat_messages").delete().eq("session_id", sessionId);
      setMessages([]);
    } catch (error) {
      console.error("Failed to clear messages:", error);
      toast.error("Không thể xóa tin nhắn");
    }
  }, [sessionId]);

  return { messages, isLoading, isRestoring, sendMessage, clearMessages };
};
