import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { compressImage, isImageFile } from "@/lib/imageCompression";

interface UploadResult {
  url: string;
  fileName: string;
  contentType: string;
  size: number;
}

interface UseR2UploadOptions {
  folder?: string;
  compress?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: string) => void;
}

export const useR2Upload = (options: UseR2UploadOptions = {}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadToR2 = async (file: File): Promise<UploadResult | null> => {
    setIsUploading(true);
    setProgress(0);

    try {
      let fileToUpload = file;

      // Compress image if enabled (default: true for images)
      const shouldCompress = options.compress !== false && isImageFile(file);
      if (shouldCompress) {
        setProgress(10);
        fileToUpload = await compressImage(file, {
          maxWidth: options.maxWidth,
          maxHeight: options.maxHeight,
          quality: options.quality,
        });
        setProgress(30);
      }

      const formData = new FormData();
      formData.append("file", fileToUpload);
      formData.append("folder", options.folder || "uploads");

      // Simulate progress for UX
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const { data, error } = await supabase.functions.invoke("upload-r2", {
        body: formData,
      });

      clearInterval(progressInterval);

      if (error) {
        throw new Error(error.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setProgress(100);
      
      const result: UploadResult = {
        url: data.url,
        fileName: data.fileName,
        contentType: data.contentType,
        size: data.size,
      };

      options.onSuccess?.(result);
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Upload failed";
      console.error("R2 upload error:", errorMessage);
      toast.error("Không thể tải lên file: " + errorMessage);
      options.onError?.(errorMessage);
      return null;

    } finally {
      setIsUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const uploadMultiple = async (files: File[]): Promise<UploadResult[]> => {
    const results: UploadResult[] = [];
    
    for (const file of files) {
      const result = await uploadToR2(file);
      if (result) {
        results.push(result);
      }
    }
    
    return results;
  };

  return {
    uploadToR2,
    uploadMultiple,
    isUploading,
    progress,
  };
};
