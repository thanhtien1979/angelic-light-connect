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
  
  // Try multiple locations where Supabase SDK might put error info
  const status = anyErr?.status || anyErr?.context?.status as number | undefined;
  
  // Try to get body from various locations
  let body = anyErr?.context?.body || anyErr?.body;
  
  // For FunctionsHttpError, the message might contain the JSON body
  const errorMessage = anyErr?.message || "";
  
  let message: string | undefined;
  let code: string | undefined;

  // Try parsing from body first
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

  // Try extracting JSON from error message (Edge function returned 402: Payment Required, {...})
  if (!message && errorMessage) {
    const jsonMatch = errorMessage.match(/\{[^}]+\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        message = parsed?.error || message;
        code = parsed?.error_code ?? parsed?.errorCode ?? code;
      } catch {
        // ignore
      }
    }
  }

  // Check for status in error message
  let extractedStatus = status;
  if (!extractedStatus && errorMessage) {
    if (errorMessage.includes("402")) extractedStatus = 402;
    else if (errorMessage.includes("429")) extractedStatus = 429;
  }

  // Fallback to SDK error message
  message = message || errorMessage || "Lỗi không xác định";

  return { status: extractedStatus, message, code };
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

    // Check for valid user session before calling edge function
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      toast.error("Vui lòng đăng nhập để sử dụng tính năng này");
      setError("Chưa đăng nhập");
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

      // Handle error returned in data (4xx responses may come through data)
      if (data?.error || data?.error_code) {
        const parsed: ParsedFnError = {
          message: typeof data.error === "string" ? data.error : "Lỗi khi tạo hình ảnh",
          code: data.error_code,
        };
        if (handleKnownHttpErrors(parsed)) return null;
        setError(parsed.message!);
        toast.error(parsed.message!);
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

    // Check for valid user session before calling edge function
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      toast.error("Vui lòng đăng nhập để sử dụng tính năng này");
      setError("Chưa đăng nhập");
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

      // Handle error returned in data (4xx responses may come through data)
      if (data?.error || data?.error_code) {
        const parsed: ParsedFnError = {
          message: typeof data.error === "string" ? data.error : "Lỗi khi chỉnh sửa hình ảnh",
          code: data.error_code,
        };
        if (handleKnownHttpErrors(parsed)) return null;
        setError(parsed.message!);
        toast.error(parsed.message!);
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

