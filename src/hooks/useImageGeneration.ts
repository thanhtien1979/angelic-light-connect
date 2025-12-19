import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GenerationResult {
  imageUrl: string;
  description?: string;
}

export function useImageGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateImage = async (prompt: string): Promise<GenerationResult | null> => {
    if (!prompt.trim()) {
      toast.error("Vui lòng nhập mô tả hình ảnh");
      return null;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-image", {
        body: { prompt },
      });

      if (fnError) {
        console.error("Function error:", fnError);
        throw new Error(fnError.message || "Lỗi khi gọi API");
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setGeneratedImage(data.imageUrl);
      toast.success("Đã tạo hình ảnh thành công!");
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Lỗi không xác định";
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const editImage = async (prompt: string, imageBase64: string): Promise<GenerationResult | null> => {
    if (!prompt.trim()) {
      toast.error("Vui lòng nhập hướng dẫn chỉnh sửa");
      return null;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-image", {
        body: { prompt, editImage: imageBase64 },
      });

      if (fnError) {
        console.error("Function error:", fnError);
        throw new Error(fnError.message || "Lỗi khi gọi API");
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setGeneratedImage(data.imageUrl);
      toast.success("Đã chỉnh sửa hình ảnh thành công!");
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Lỗi không xác định";
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const clearImage = () => {
    setGeneratedImage(null);
    setError(null);
  };

  return {
    isGenerating,
    generatedImage,
    error,
    generateImage,
    editImage,
    clearImage,
  };
}
