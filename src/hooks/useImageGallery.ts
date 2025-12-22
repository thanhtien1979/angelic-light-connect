import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { compressImage } from "@/lib/imageCompression";

interface GeneratedImage {
  id: string;
  user_id: string;
  image_url: string;
  prompt: string;
  is_public: boolean;
  likes_count: number;
  created_at: string;
}

export function useImageGallery() {
  const { user } = useAuth();
  const [myImages, setMyImages] = useState<GeneratedImage[]>([]);
  const [publicImages, setPublicImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMyImages = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("generated_images")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMyImages((data as GeneratedImage[]) || []);
    } catch (err) {
      console.error("Error fetching images:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPublicImages = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("generated_images")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setPublicImages((data as GeneratedImage[]) || []);
    } catch (err) {
      console.error("Error fetching public images:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveImage = async (imageBase64: string, prompt: string): Promise<string | null> => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để lưu ảnh");
      return null;
    }

    try {
      // Convert base64 to blob
      const base64Data = imageBase64.split(",")[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "image/png" });
      
      // Create File object for compression
      const originalFile = new File([blob], `${Date.now()}.png`, { type: "image/png" });
      
      // Compress the image
      const compressedFile = await compressImage(originalFile, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.85,
        outputFormat: 'image/webp'
      });

      // Upload to R2 via edge function
      const formData = new FormData();
      formData.append("file", compressedFile);
      formData.append("folder", "generated-images");

      const { data: uploadData, error: uploadError } = await supabase.functions.invoke("upload-r2", {
        body: formData,
      });

      if (uploadError) throw uploadError;
      if (uploadData?.error) throw new Error(uploadData.error);

      const imageUrl = uploadData.url;

      // Save to database
      const { data: insertedData, error: dbError } = await supabase
        .from("generated_images")
        .insert({
          user_id: user.id,
          image_url: imageUrl,
          prompt,
          is_public: false,
        })
        .select("id")
        .single();

      if (dbError) throw dbError;

      toast.success("Đã lưu ảnh vào gallery!");
      fetchMyImages();
      return insertedData?.id || null;
    } catch (err) {
      console.error("Error saving image:", err);
      toast.error("Lỗi khi lưu ảnh");
      return null;
    }
  };

  const togglePublic = async (imageId: string, isPublic: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("generated_images")
        .update({ is_public: !isPublic })
        .eq("id", imageId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success(isPublic ? "Đã ẩn ảnh khỏi cộng đồng" : "Đã chia sẻ ảnh với cộng đồng!");
      fetchMyImages();
      fetchPublicImages();
    } catch (err) {
      console.error("Error toggling public:", err);
      toast.error("Lỗi khi cập nhật");
    }
  };

  const deleteImage = async (imageId: string, imageUrl: string) => {
    if (!user) return;

    try {
      // Note: R2 files are not deleted here - old Supabase files still work
      // For R2 files, we could add a delete-r2 edge function if needed
      
      const { error } = await supabase
        .from("generated_images")
        .delete()
        .eq("id", imageId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Đã xóa ảnh");
      fetchMyImages();
    } catch (err) {
      console.error("Error deleting image:", err);
      toast.error("Lỗi khi xóa ảnh");
    }
  };

  const likeImage = async (imageId: string) => {
    try {
      // Simple increment - in production you'd track who liked
      const image = publicImages.find((img) => img.id === imageId);
      if (!image) return;

      const { error } = await supabase
        .from("generated_images")
        .update({ likes_count: image.likes_count + 1 })
        .eq("id", imageId);

      if (error) throw error;
      fetchPublicImages();
    } catch (err) {
      console.error("Error liking image:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyImages();
    }
    fetchPublicImages();
  }, [user]);

  return {
    myImages,
    publicImages,
    isLoading,
    saveImage,
    togglePublic,
    deleteImage,
    likeImage,
    refetch: () => {
      fetchMyImages();
      fetchPublicImages();
    },
  };
}
