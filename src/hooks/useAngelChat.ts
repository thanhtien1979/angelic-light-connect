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
const ANALYZE_LIGHT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-light-behavior`;
const EXTRACT_MEMORY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-user-memory`;
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

// Analyze user message for light behavior (non-blocking)
const analyzeLightBehavior = async (
  userId: string,
  content: string,
  behaviorType: "message" | "reaction" | "comment" | "testimonial" | "moment"
): Promise<void> => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;
    
    if (!accessToken) return;

    await fetch(ANALYZE_LIGHT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        user_id: userId,
        content,
        behavior_type: behaviorType,
      }),
    });
  } catch {
    // Non-critical, don't throw
  }
};

// Extract and save user memories from conversation (non-blocking)
const extractUserMemory = async (
  messages: Array<{ role: string; content: string }>
): Promise<void> => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;
    
    if (!accessToken || messages.length < 4) return; // Need at least 2 exchanges

    await fetch(EXTRACT_MEMORY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ messages }),
    });
  } catch {
    // Non-critical, don't throw
  }
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

  // SECURITY: Restore messages ONLY for authenticated users
  // Anonymous users cannot access chat history (privacy-first architecture)
  useEffect(() => {
    const restoreMessages = async () => {
      try {
        // Only authenticated users can restore messages
        if (isAuthenticated && user) {
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
        }
        // Anonymous users start with empty chat (no persistence)
      } catch {
        // SECURITY: Don't log error details that might contain sensitive info
      } finally {
        setIsRestoring(false);
      }
    };

    restoreMessages();
  }, [isAuthenticated, user]);

  // SECURITY: Save messages ONLY for authenticated users
  // Messages are private by default (visibility = 'private')
  const saveMessage = async (
    role: "user" | "assistant", 
    content: string,
    retries = 3
  ): Promise<string | null> => {
    // SECURITY: Only authenticated users can save messages
    if (!isAuthenticated || !user) {
      return null;
    }

    if (!isOnline) {
      setSyncStatus("offline");
      return null;
    }

    setSyncStatus("saving");
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // Insert with privacy defaults (visibility = 'private', public_consent = false)
        const { data, error } = await supabase
          .from("chat_messages")
          .insert({
            session_id: user.id,
            user_id: user.id,
            role,
            content,
            // visibility defaults to 'private' in database
            // public_consent defaults to false in database
          })
          .select("id")
          .single();

        if (error) throw error;
        setSyncStatus("saved");
        setTimeout(() => setSyncStatus("idle"), 2000);
        return data?.id || null;
      } catch {
        // SECURITY: Don't log message content
        if (attempt === retries) {
          setSyncStatus("error");
          setTimeout(() => setSyncStatus("idle"), 3000);
          return null;
        }
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
      // SECURITY: Require authentication for AI chat
      if (!isAuthenticated || !user) {
        toast.error("Vui lòng đăng nhập để sử dụng Angel AI");
        setMessages((prev) => prev.filter((m) => m.id !== tempUserMessageId));
        setIsLoading(false);
        return;
      }

      // Get the user's access token for authenticated API calls
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      if (!accessToken) {
        toast.error("Vui lòng đăng nhập lại");
        setMessages((prev) => prev.filter((m) => m.id !== tempUserMessageId));
        setIsLoading(false);
        return;
      }

      const requestBody: { messages: Array<{ role: string; content: string }>; images?: Array<{ type: "image"; base64: string; mimeType: string }> } = {
        messages: [...messages, userMessage].map((m) => ({
          role: m.role,
          content: m.content,
        })),
      };

      if (hasImages) {
        requestBody.images = images;
      }

      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
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

      // Analyze user message for light score (non-blocking)
      if (trimmedContent && user) {
        analyzeLightBehavior(user.id, trimmedContent, "message").catch((err) => {
          console.error("Light analysis failed (non-critical):", err);
        });
      }

      // Extract user memory every 5 messages (non-blocking)
      const totalMessages = messages.length + 2; // +2 for new user and assistant message
      if (totalMessages % 5 === 0 && user) {
        const allMessages = [...messages, userMessage, { id: tempAssistantId, role: "assistant" as const, content: assistantContent }];
        extractUserMemory(allMessages.map(m => ({ role: m.role, content: m.content }))).catch((err) => {
          console.error("Memory extraction failed (non-critical):", err);
        });
      }
    } catch (error) {
      // SECURITY: Don't log error details that might contain sensitive info
      toast.error(error instanceof Error ? error.message : "Không thể kết nối với Angel AI");
      
      const userMessageId = await saveUserMessagePromise;
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMessageId && m.id !== userMessageId));
      
      if (userMessageId) {
        await supabase.from("chat_messages").delete().eq("id", userMessageId);
      }
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, isAuthenticated, user]);

  // SECURITY: Edit message only for authenticated owner
  const editMessage = useCallback(async (messageId: string, newContent: string): Promise<boolean> => {
    if (!newContent.trim() || !isAuthenticated || !user) return false;

    try {
      // Update in database (RLS ensures user can only update own messages)
      const { error } = await supabase
        .from("chat_messages")
        .update({ content: newContent.trim() })
        .eq("id", messageId)
        .eq("user_id", user.id); // Double-check ownership

      if (error) throw error;

      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, content: newContent.trim() } : m))
      );

      return true;
    } catch {
      toast.error("Không thể chỉnh sửa tin nhắn");
      return false;
    }
  }, [isAuthenticated, user]);

  // SECURITY: Clear messages only for authenticated owner
  const clearMessages = useCallback(async () => {
    try {
      if (isAuthenticated && user) {
        await supabase.from("chat_messages").delete().eq("user_id", user.id);
        setMessages([]);
      }
      // Anonymous users just clear local state (nothing in DB)
      setMessages([]);
    } catch {
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
