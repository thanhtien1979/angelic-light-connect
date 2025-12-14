import { useState, useCallback } from "react";

export interface ImageAttachment {
  id: string;
  type: "image";
  file: File;
  previewUrl: string;
}

export interface LinkAttachment {
  id: string;
  type: "link";
  url: string;
  displayUrl: string;
}

export type Attachment = ImageAttachment | LinkAttachment;

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// URL regex pattern for detecting links
const URL_PATTERN = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;

export const useChatAttachments = () => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const addImageAttachment = useCallback((file: File): { success: boolean; error?: string } => {
    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return { success: false, error: "Chỉ hỗ trợ định dạng JPG, PNG, WEBP" };
    }

    // Validate file size
    if (file.size > MAX_IMAGE_SIZE) {
      return { success: false, error: "Kích thước ảnh tối đa là 5MB" };
    }

    const id = `img-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const previewUrl = URL.createObjectURL(file);

    setAttachments((prev) => [
      ...prev,
      { id, type: "image", file, previewUrl },
    ]);

    return { success: true };
  }, []);

  const addLinkAttachment = useCallback((url: string): void => {
    // Check if link already exists
    const existingLink = attachments.find(
      (a) => a.type === "link" && a.url === url
    );
    if (existingLink) return;

    const id = `link-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    
    // Create a shortened display URL
    let displayUrl = url;
    try {
      const urlObj = new URL(url);
      displayUrl = urlObj.hostname + (urlObj.pathname !== "/" ? urlObj.pathname.slice(0, 30) : "");
      if (urlObj.pathname.length > 30) displayUrl += "...";
    } catch {
      displayUrl = url.slice(0, 40) + (url.length > 40 ? "..." : "");
    }

    setAttachments((prev) => [
      ...prev,
      { id, type: "link", url, displayUrl },
    ]);
  }, [attachments]);

  const removeAttachment = useCallback((id: string) => {
    setAttachments((prev) => {
      const attachment = prev.find((a) => a.id === id);
      // Revoke object URL for images to free memory
      if (attachment?.type === "image") {
        URL.revokeObjectURL(attachment.previewUrl);
      }
      return prev.filter((a) => a.id !== id);
    });
  }, []);

  const clearAttachments = useCallback(() => {
    // Revoke all object URLs
    attachments.forEach((a) => {
      if (a.type === "image") {
        URL.revokeObjectURL(a.previewUrl);
      }
    });
    setAttachments([]);
  }, [attachments]);

  const detectLinksInText = useCallback((text: string): string[] => {
    const matches = text.match(URL_PATTERN);
    return matches || [];
  }, []);

  const getAttachmentData = useCallback(() => {
    return attachments.map((a) => {
      if (a.type === "image") {
        return { type: "image" as const, previewUrl: a.previewUrl, fileName: a.file.name };
      }
      return { type: "link" as const, url: a.url, displayUrl: a.displayUrl };
    });
  }, [attachments]);

  return {
    attachments,
    addImageAttachment,
    addLinkAttachment,
    removeAttachment,
    clearAttachments,
    detectLinksInText,
    getAttachmentData,
  };
};
