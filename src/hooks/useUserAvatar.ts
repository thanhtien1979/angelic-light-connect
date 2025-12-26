import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export const useUserAvatar = () => {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch current avatar from profiles
  useEffect(() => {
    if (!user) {
      setAvatarUrl(null);
      return;
    }

    const fetchAvatar = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", user.id)
        .single();

      if (!error && data?.avatar_url) {
        setAvatarUrl(data.avatar_url);
      }
    };

    fetchAvatar();
  }, [user]);

  const uploadAvatar = useCallback(async (file: File) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để tải lên ảnh đại diện");
      return null;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return null;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ảnh phải nhỏ hơn 2MB");
      return null;
    }

    setIsUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        toast.error("Không thể tải lên ảnh. Vui lòng thử lại.");
        return null;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        });

      if (updateError) {
        console.error("Profile update error:", updateError);
        toast.error("Không thể cập nhật hồ sơ. Vui lòng thử lại.");
        return null;
      }

      setAvatarUrl(publicUrl);
      toast.success("Đã cập nhật ảnh đại diện!");
      return publicUrl;
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại.");
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [user]);

  const removeAvatar = useCallback(async () => {
    if (!user) return;

    try {
      // Update profile to remove avatar
      await supabase
        .from("profiles")
        .update({ avatar_url: null, updated_at: new Date().toISOString() })
        .eq("id", user.id);

      setAvatarUrl(null);
      toast.success("Đã xóa ảnh đại diện");
    } catch (error) {
      console.error("Remove avatar error:", error);
      toast.error("Không thể xóa ảnh đại diện");
    }
  }, [user]);

  return {
    avatarUrl,
    isUploading,
    uploadAvatar,
    removeAvatar,
  };
};
