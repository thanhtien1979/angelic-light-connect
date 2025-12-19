import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GenerationResult {
  imageUrl: string;
  description?: string;
}

type ParsedFnError = {
  status?: number;
  message?: string;
  code?: string;
};

const parseFunctionError = (fnError: unknown): ParsedFnError => {
  const anyErr = fnError as any;
  const status = anyErr?.context?.status as number | undefined;
  const body = anyErr?.context?.body as unknown;

  let message: string | undefined;
  let code: string | undefined;

  if (typeof body === "string") {
    try {
      const parsed = JSON.parse(body);
      message = parsed?.error;
      code = parsed?.error_code ?? parsed?.errorCode;
    } catch {
      // ignore
    }
  } else if (body && typeof body === "object") {
    message = (body as any).error;
    code = (body as any).error_code ?? (body as any).errorCode;
  }

  // Fallback to SDK error message
  message = message || anyErr?.message;

  return { status, message, code };
};

export function useImageGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsCredits, setNeedsCredits] = useState(false);

  const handleKnownHttpErrors = useCallback(
    (parsed: ParsedFnError) => {
      if (parsed.status === 402 || parsed.code === "PAYMENT_REQUIRED") {
        const msg =
          parsed.message ||
          "Bạn đã hết AI credits. Vui lòng nạp thêm credits để tiếp tục tạo/chỉnh sửa ảnh.";
        setNeedsCredits(true);
        setError(msg);
        toast.error(msg);
        return true;
      }

      if (parsed.status === 429 || parsed.code === "RATE_LIMITED") {
        const msg =
          parsed.message || "Bạn đang gửi quá nhiều yêu cầu. Vui lòng thử lại sau.";
        setError(msg);
        toast.error(msg);
        return true;
      }

      return false;
    },
    [],
  );

  const generateImage = async (prompt: string): Promise<GenerationResult | null> => {
    if (!prompt.trim()) {
      toast.error("Vui lòng nhập mô tả hình ảnh");
      return null;
    }

    setIsGenerating(true);
    setError(null);
    setNeedsCredits(false);

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "generate-image",
        {
          body: { prompt },
        },
      );

      if (fnError) {
        const parsed = parseFunctionError(fnError);
        if (handleKnownHttpErrors(parsed)) return null;
        console.error("Function error:", fnError);
        throw new Error(parsed.message || "Lỗi khi gọi API");
      }

      if (data?.error) {
        const msg =
          typeof data.error === "string" ? data.error : "Lỗi khi tạo hình ảnh";
        setError(msg);
        toast.error(msg);
        return null;
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

  const editImage = async (
    prompt: string,
    imageBase64: string,
  ): Promise<GenerationResult | null> => {
    if (!prompt.trim()) {
      toast.error("Vui lòng nhập hướng dẫn chỉnh sửa");
      return null;
    }

    setIsGenerating(true);
    setError(null);
    setNeedsCredits(false);

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "generate-image",
        {
          body: { prompt, editImage: imageBase64 },
        },
      );

      if (fnError) {
        const parsed = parseFunctionError(fnError);
        if (handleKnownHttpErrors(parsed)) return null;
        console.error("Function error:", fnError);
        throw new Error(parsed.message || "Lỗi khi gọi API");
      }

      if (data?.error) {
        const msg =
          typeof data.error === "string" ? data.error : "Lỗi khi chỉnh sửa hình ảnh";
        setError(msg);
        toast.error(msg);
        return null;
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
    setNeedsCredits(false);
  };

  return {
    isGenerating,
    generatedImage,
    error,
    needsCredits,
    generateImage,
    editImage,
    clearImage,
  };
}

