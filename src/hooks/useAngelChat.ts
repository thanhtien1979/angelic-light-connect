import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type SyncStatus = "idle" | "saving" | "saved" | "offline" | "error";

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
  const [isInitializing, setIsInitializing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { user, isAuthenticated } = useAuth();

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus("idle");
    };
    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus("offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

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

  // Save a message to the database with retry logic
  const saveMessage = async (
    role: "user" | "assistant", 
    content: string,
    retries = 3
  ): Promise<string | null> => {
    if (!isOnline) {
      setSyncStatus("offline");
      return null;
    }

    setSyncStatus("saving");
    
    for (let attempt = 1; attempt <= retries; attempt++) {
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
          setSyncStatus("saved");
          // Reset to idle after showing "saved" briefly
          setTimeout(() => setSyncStatus("idle"), 2000);
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
          setSyncStatus("saved");
          // Reset to idle after showing "saved" briefly
          setTimeout(() => setSyncStatus("idle"), 2000);
          return data?.id || null;
        }
      } catch (error) {
        console.error(`Failed to save message (attempt ${attempt}/${retries}):`, error);
        if (attempt === retries) {
          // On final failure, show error
          setSyncStatus("error");
          setTimeout(() => setSyncStatus("idle"), 3000);
          console.error("Message save failed after all retries:", { role, content });
          return null;
        }
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 500));
      }
    }
    return null;
  };

  const sendMessage = useCallback(async (
    content: string, 
    images?: Array<{ type: "image"; base64: string; mimeType: string }>
  ) => {
    if ((!content.trim() && (!images || images.length === 0)) || isLoading) return;

    const trimmedContent = content.trim();
    const hasImages = images && images.length > 0;
    
    // Create optimistic user message for immediate UI update
    const tempUserMessageId = `temp-${Date.now()}`;
    const userMessage: Message = {
      id: tempUserMessageId,
      role: "user",
      content: trimmedContent || (hasImages ? "[Hình ảnh đã gửi]" : ""),
    };

    // Update UI immediately
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Save user message to database immediately (don't wait for response)
    const saveUserMessagePromise = saveMessage("user", trimmedContent || "[Hình ảnh đã gửi]");
    
    // Update the message ID once saved
    saveUserMessagePromise.then((savedId) => {
      if (savedId) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempUserMessageId ? { ...m, id: savedId } : m))
        );
      }
    });

    let assistantContent = "";
    let assistantMessageId: string | null = null;
    const tempAssistantId = `assistant-${Date.now()}`;

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
          { id: tempAssistantId, role: "assistant", content: assistantContent },
        ];
      });
    };

    try {
      const requestBody: { messages: Array<{ role: string; content: string }>; images?: Array<{ type: "image"; base64: string; mimeType: string }> } = {
        messages: [...messages, userMessage].map((m) => ({
          role: m.role,
          content: m.content,
        })),
      };

      // Include images if present
      if (hasImages) {
        requestBody.images = images;
      }

      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify(requestBody),
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

      // Save the complete assistant message to database immediately
      if (assistantContent) {
        assistantMessageId = await saveMessage("assistant", assistantContent);
        if (assistantMessageId) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === tempAssistantId && m.role === "assistant"
                ? { ...m, id: assistantMessageId! }
                : m
            )
          );
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error(error instanceof Error ? error.message : "Không thể kết nối với Angel AI");
      
      // Wait for user message save to complete before potentially deleting
      const userMessageId = await saveUserMessagePromise;
      
      // Remove the optimistic user message from UI
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMessageId && m.id !== userMessageId));
      
      // Delete the user message from DB if chat failed
      if (userMessageId) {
        await supabase.from("chat_messages").delete().eq("id", userMessageId);
      }
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, isAuthenticated, user]);

  // Edit a user message
  const editMessage = useCallback(async (messageId: string, newContent: string): Promise<boolean> => {
    if (!newContent.trim()) return false;

    try {
      // Update in database
      const { error } = await supabase
        .from("chat_messages")
        .update({ content: newContent.trim() })
        .eq("id", messageId);

      if (error) throw error;

      // Update local state
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, content: newContent.trim() } : m))
      );

      return true;
    } catch (error) {
      console.error("Failed to edit message:", error);
      toast.error("Không thể chỉnh sửa tin nhắn");
      return false;
    }
  }, []);

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

  // Start a new conversation without deleting old messages
  const startNewConversation = useCallback(async (): Promise<boolean> => {
    setIsInitializing(true);
    
    try {
      // Generate a new session ID for anonymous users
      if (!isAuthenticated) {
        const newSessionId = generateSecureId();
        localStorage.setItem(SESSION_ID_KEY, newSessionId);
      }
      
      // Clear the current messages state (but keep them in the database)
      setMessages([]);
      
      // Small delay to ensure localStorage is synced and state is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      setIsInitializing(false);
      return true;
    } catch (error) {
      console.error("Failed to initialize new conversation:", error);
      setIsInitializing(false);
      return false;
    }
  }, [isAuthenticated]);

  // Check if chat is ready for interaction
  const isReady = !isRestoring && !isInitializing;

  return { 
    messages, 
    isLoading, 
    isRestoring, 
    isInitializing,
    isReady,
    syncStatus, 
    sendMessage, 
    editMessage,
    clearMessages, 
    startNewConversation, 
    isAuthenticated 
  };
};
