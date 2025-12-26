import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, Loader2, User, Check } from "lucide-react";
import { useUserAvatar } from "@/hooks/useUserAvatar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const EditProfileModal = ({ isOpen, onClose, onSuccess }: EditProfileModalProps) => {
  const { user } = useAuth();
  const { avatarUrl, isUploading, uploadAvatar, removeAvatar } = useUserAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [displayName, setDisplayName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Load current display name
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;
      
      const { data } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .maybeSingle();
      
      if (data?.display_name) {
        setDisplayName(data.display_name);
      } else {
        setDisplayName(user.email?.split("@")[0] || "");
      }
    };

    if (isOpen) {
      loadProfile();
      setPreviewUrl(null);
    }
  }, [user, isOpen]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    await uploadAvatar(file);
  };

  const handleSave = async () => {
    if (!user?.id) return;
    
    const trimmedName = displayName.trim();
    if (!trimmedName) {
      toast.error("Vui lòng nhập tên hiển thị");
      return;
    }

    if (trimmedName.length < 2) {
      toast.error("Tên hiển thị phải có ít nhất 2 ký tự");
      return;
    }

    if (trimmedName.length > 50) {
      toast.error("Tên hiển thị không được quá 50 ký tự");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          display_name: trimmedName,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success("Đã cập nhật hồ sơ!");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Không thể cập nhật hồ sơ. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  const currentAvatarUrl = previewUrl || avatarUrl;
  const initials = displayName.slice(0, 2).toUpperCase() || "??";

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Chỉnh sửa hồ sơ</h3>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <Avatar className="w-24 h-24 ring-2 ring-primary/30 ring-offset-2 ring-offset-background">
                  <AvatarImage src={currentAvatarUrl || undefined} alt={displayName} />
                  <AvatarFallback className="bg-primary/20 text-primary text-2xl font-serif">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                
                {/* Upload overlay */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6 text-white" />
                  )}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Camera className="w-4 h-4 mr-2" />
                  )}
                  Đổi ảnh
                </Button>
                {currentAvatarUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeAvatar}
                    className="text-muted-foreground"
                  >
                    Xóa ảnh
                  </Button>
                )}
              </div>
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="display-name" className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                Tên hiển thị
              </Label>
              <Input
                id="display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Nhập tên hiển thị..."
                maxLength={50}
                className="bg-background/50"
              />
              <p className="text-xs text-muted-foreground">
                Đây là tên mà bạn bè sẽ thấy khi tìm kiếm và nhắn tin
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || isUploading}
              className="bg-primary hover:bg-primary/90"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Lưu thay đổi
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditProfileModal;
