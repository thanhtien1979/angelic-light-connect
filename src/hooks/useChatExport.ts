import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface ExportMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface ExportData {
  exported_at: string;
  user_display_name?: string;
  total_messages: number;
  messages: ExportMessage[];
}

export const useChatExport = () => {
  const { user, isAuthenticated } = useAuth();
  const [isExporting, setIsExporting] = useState(false);

  // Fetch all messages from database
  const fetchAllMessages = useCallback(async (): Promise<ExportMessage[]> => {
    if (!isAuthenticated || !user) {
      return [];
    }

    const { data, error } = await supabase
      .from("chat_messages")
      .select("id, role, content, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error("Không thể tải lịch sử chat");
    }

    return (data || []).map((m) => ({
      id: m.id,
      role: m.role as "user" | "assistant",
      content: m.content,
      created_at: m.created_at,
    }));
  }, [isAuthenticated, user]);

  // Format date for display
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Generate filename with timestamp
  const generateFilename = (extension: string): string => {
    const now = new Date();
    const timestamp = now.toISOString().split("T")[0];
    return `angel-ai-chat-${timestamp}.${extension}`;
  };

  // Download file helper
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export as JSON
  const exportAsJSON = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để xuất lịch sử chat");
      return false;
    }

    setIsExporting(true);
    try {
      const messages = await fetchAllMessages();
      
      if (messages.length === 0) {
        toast.error("Không có tin nhắn để xuất");
        return false;
      }

      const exportData: ExportData = {
        exported_at: new Date().toISOString(),
        user_display_name: user?.user_metadata?.display_name,
        total_messages: messages.length,
        messages,
      };

      const jsonContent = JSON.stringify(exportData, null, 2);
      const filename = generateFilename("json");
      downloadFile(jsonContent, filename, "application/json");
      
      toast.success(`Đã xuất ${messages.length} tin nhắn ✨`, {
        description: `File: ${filename}`,
      });
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể xuất lịch sử chat");
      return false;
    } finally {
      setIsExporting(false);
    }
  }, [isAuthenticated, user, fetchAllMessages]);

  // Export as TXT
  const exportAsText = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để xuất lịch sử chat");
      return false;
    }

    setIsExporting(true);
    try {
      const messages = await fetchAllMessages();
      
      if (messages.length === 0) {
        toast.error("Không có tin nhắn để xuất");
        return false;
      }

      const displayName = user?.user_metadata?.display_name || "Bạn";
      const exportDate = formatDate(new Date().toISOString());
      
      let textContent = `=== Angel AI - Lịch sử trò chuyện ===\n`;
      textContent += `Xuất ngày: ${exportDate}\n`;
      textContent += `Tổng số tin nhắn: ${messages.length}\n`;
      textContent += `${"=".repeat(40)}\n\n`;

      for (const message of messages) {
        const sender = message.role === "user" ? displayName : "Angel AI";
        const time = formatDate(message.created_at);
        textContent += `[${time}] ${sender}:\n`;
        textContent += `${message.content}\n\n`;
      }

      textContent += `${"=".repeat(40)}\n`;
      textContent += `Xuất bởi Angel AI - Ánh sáng thiêng liêng 🌸\n`;

      const filename = generateFilename("txt");
      downloadFile(textContent, filename, "text/plain;charset=utf-8");
      
      toast.success(`Đã xuất ${messages.length} tin nhắn ✨`, {
        description: `File: ${filename}`,
      });
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể xuất lịch sử chat");
      return false;
    } finally {
      setIsExporting(false);
    }
  }, [isAuthenticated, user, fetchAllMessages]);

  return {
    isExporting,
    exportAsJSON,
    exportAsText,
    isAuthenticated,
  };
};
