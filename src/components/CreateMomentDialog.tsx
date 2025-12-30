import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sparkles,
  Leaf,
  BookOpen,
  MessageCircle,
  Sun,
  Send,
  Loader2,
  ImagePlus,
  Trash2,
  Edit3,
  Plus,
  Check,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { z } from "zod";
import { compressImage } from "@/lib/imageCompression";
import ImageCropEditor from "@/components/ImageCropEditor";
import { Progress } from "@/components/ui/progress";

interface CreateMomentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
  isCompressed: boolean;
  originalSize: number;
  compressedSize?: number;
}

const momentTypes = [
  {
    value: "breathing_reflection",
    label: "Chữa Lành",
    icon: Sparkles,
    color: "from-gold/20 to-amber-500/20 border-gold/40",
    description: "Chia sẻ khoảnh khắc bình yên",
  },
  {
    value: "meditation_completion",
    label: "Thiền Định",
    icon: Leaf,
    color: "from-emerald-500/20 to-green-500/20 border-emerald-500/40",
    description: "Chia sẻ trải nghiệm thiền",
  },
  {
    value: "reflection_note",
    label: "Biết Ơn",
    icon: BookOpen,
    color: "from-rose-500/20 to-pink-500/20 border-rose-500/40",
    description: "Ghi lại lòng biết ơn",
  },
  {
    value: "chat_message",
    label: "Angel AI",
    icon: MessageCircle,
    color: "from-sky-500/20 to-blue-500/20 border-sky-500/40",
    description: "Chia sẻ từ trò chuyện",
  },
  {
    value: "daily_login",
    label: "Đăng Nhập",
    icon: Sun,
    color: "from-amber-500/20 to-orange-500/20 border-amber-500/40",
    description: "Chào ngày mới",
  },
];

const momentSchema = z.object({
  message: z
    .string()
    .trim()
    .min(10, "Nội dung cần ít nhất 10 ký tự")
    .max(1000, "Nội dung không được quá 1000 ký tự"),
  type: z.string().min(1, "Vui lòng chọn loại khoảnh khắc"),
});

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB before compression
const MAX_IMAGES = 5;

const CreateMomentDialog = ({ isOpen, onClose, onSuccess }: CreateMomentDialogProps) => {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ message?: string; type?: string }>({});
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateId = () => `img-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const handleImageSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Check max images limit
    if (images.length + files.length > MAX_IMAGES) {
      toast.error(`Tối đa ${MAX_IMAGES} ảnh`);
      return;
    }

    // Validate and add images
    const validFiles: File[] = [];
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} không phải file ảnh`);
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error(`${file.name} vượt quá 10MB`);
        continue;
      }
      validFiles.push(file);
    }

    if (!validFiles.length) return;

    setIsCompressing(true);
    setCompressionProgress(0);

    const newImages: ImageItem[] = [];
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      setCompressionProgress(Math.round(((i + 0.5) / validFiles.length) * 100));

      try {
        // Compress image
        const compressedFile = await compressImage(file, {
          maxWidth: 1920,
          maxHeight: 1920,
          quality: 0.85,
          outputFormat: "image/webp",
        });

        const previewUrl = URL.createObjectURL(compressedFile);
        newImages.push({
          id: generateId(),
          file: compressedFile,
          previewUrl,
          isCompressed: compressedFile.size < file.size,
          originalSize: file.size,
          compressedSize: compressedFile.size,
        });

        setCompressionProgress(Math.round(((i + 1) / validFiles.length) * 100));
      } catch (error) {
        console.error("Compression error:", error);
        // Fallback to original file
        const previewUrl = URL.createObjectURL(file);
        newImages.push({
          id: generateId(),
          file,
          previewUrl,
          isCompressed: false,
          originalSize: file.size,
        });
      }
    }

    setImages((prev) => [...prev, ...newImages]);
    setIsCompressing(false);
    setCompressionProgress(0);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Show compression stats
    const totalSaved = newImages.reduce((acc, img) => {
      if (img.compressedSize) {
        return acc + (img.originalSize - img.compressedSize);
      }
      return acc;
    }, 0);
    
    if (totalSaved > 0) {
      toast.success(`Đã nén ảnh, tiết kiệm ${formatBytes(totalSaved)}`);
    }
  }, [images.length]);

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleRemoveImage = useCallback((id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) {
        URL.revokeObjectURL(img.previewUrl);
      }
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const handleEditImage = useCallback((id: string) => {
    setEditingImageId(id);
  }, []);

  const handleSaveEditedImage = useCallback(async (editedUrl: string) => {
    if (!editingImageId) return;

    try {
      // Convert blob URL to File
      const response = await fetch(editedUrl);
      const blob = await response.blob();
      const file = new File([blob], `edited-${Date.now()}.jpg`, { type: "image/jpeg" });

      setImages((prev) =>
        prev.map((img) =>
          img.id === editingImageId
            ? {
                ...img,
                file,
                previewUrl: editedUrl,
                compressedSize: file.size,
              }
            : img
        )
      );

      setEditingImageId(null);
      toast.success("Đã lưu chỉnh sửa ảnh");
    } catch (error) {
      console.error("Error saving edited image:", error);
      toast.error("Không thể lưu ảnh đã chỉnh sửa");
    }
  }, [editingImageId]);

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!user) return null;

    try {
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "webp";
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("moment-images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from("moment-images")
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error("Upload error:", error);
      return null;
    }
  };

  const handleSubmit = async () => {
    // Validate input
    const result = momentSchema.safeParse({ message, type: selectedType });
    if (!result.success) {
      const fieldErrors: { message?: string; type?: string } = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0] === "message") fieldErrors.message = issue.message;
        if (issue.path[0] === "type") fieldErrors.type = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (!user) {
      toast.error("Vui lòng đăng nhập để chia sẻ khoảnh khắc");
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setUploadProgress(0);

    try {
      // Upload all images
      const imageUrls: string[] = [];
      for (let i = 0; i < images.length; i++) {
        setUploadProgress(Math.round(((i + 0.5) / images.length) * 100));
        const url = await uploadImage(images[i].file);
        if (url) {
          imageUrls.push(url);
        }
        setUploadProgress(Math.round(((i + 1) / images.length) * 100));
      }

      // Fetch user profile for display name
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single();

      // Use first image as main image_url, store all URLs in the message if multiple
      const mainImageUrl = imageUrls[0] || null;
      let finalMessage = message.trim();
      
      // If multiple images, append image URLs to message as JSON metadata
      if (imageUrls.length > 1) {
        finalMessage = `${message.trim()}\n\n[IMAGES:${JSON.stringify(imageUrls)}]`;
      }

      const { error } = await supabase.from("shared_light_moments").insert({
        user_id: user.id,
        spiritual_message: finalMessage,
        moment_type: selectedType,
        display_name: profile?.display_name || null,
        likes_count: 0,
        image_url: mainImageUrl,
      });

      if (error) throw error;

      toast.success("Đã chia sẻ khoảnh khắc ánh sáng của bạn!");
      
      // Cleanup
      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
      setMessage("");
      setSelectedType("");
      setImages([]);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error creating moment:", error);
      toast.error("Không thể chia sẻ khoảnh khắc. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
      setMessage("");
      setSelectedType("");
      setImages([]);
      setErrors({});
      onClose();
    }
  };

  const selectedMomentType = momentTypes.find((t) => t.value === selectedType);
  const editingImage = images.find((img) => img.id === editingImageId);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg bg-card rounded-3xl p-6 shadow-2xl border border-border/50 max-h-[90vh] overflow-y-auto"
            >
              {/* Close button */}
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>

              {/* Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-gold/20 to-rose-500/20 border border-gold/30 text-gold text-sm mb-3">
                  <Sparkles className="w-4 h-4" />
                  Tạo khoảnh khắc mới
                </div>
                <h2 className="text-xl font-serif font-semibold text-foreground">
                  Chia sẻ ánh sáng của bạn
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Lan tỏa năng lượng tích cực đến cộng đồng
                </p>
              </div>

              {/* Moment Type Selection */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-foreground mb-3">
                  Chọn loại khoảnh khắc
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {momentTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = selectedType === type.value;
                    return (
                      <button
                        key={type.value}
                        onClick={() => {
                          setSelectedType(type.value);
                          setErrors((prev) => ({ ...prev, type: undefined }));
                        }}
                        className={`relative p-3 rounded-xl border-2 transition-all ${
                          isSelected
                            ? `bg-gradient-to-br ${type.color} border-current scale-[1.02]`
                            : "bg-muted/30 border-transparent hover:bg-muted/50"
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 mx-auto mb-1.5 ${
                            isSelected ? "text-foreground" : "text-muted-foreground"
                          }`}
                        />
                        <span
                          className={`text-xs font-medium ${
                            isSelected ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {type.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {errors.type && (
                  <p className="text-xs text-red-500 mt-2">{errors.type}</p>
                )}
                {selectedMomentType && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    {selectedMomentType.description}
                  </p>
                )}
              </div>

              {/* Message Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nội dung chia sẻ
                </label>
                <Textarea
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    setErrors((prev) => ({ ...prev, message: undefined }));
                  }}
                  placeholder="Chia sẻ suy nghĩ, cảm xúc hoặc trải nghiệm tâm linh của bạn..."
                  className="min-h-[100px] resize-none border-gold/20 focus:border-gold/50 bg-muted/30"
                  maxLength={1000}
                />
                <div className="flex justify-between items-center mt-2">
                  {errors.message ? (
                    <p className="text-xs text-red-500">{errors.message}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Tối thiểu 10 ký tự
                    </p>
                  )}
                  <span
                    className={`text-xs ${
                      message.length > 900 ? "text-amber-500" : "text-muted-foreground"
                    }`}
                  >
                    {message.length}/1000
                  </span>
                </div>
              </div>

              {/* Image Upload */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-foreground">
                    Hình ảnh ({images.length}/{MAX_IMAGES})
                  </label>
                  {images.length > 0 && (
                    <span className="text-xs text-emerald-500 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Đã nén tự động
                    </span>
                  )}
                </div>

                {/* Compression Progress */}
                {isCompressing && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Đang nén ảnh...</span>
                      <span>{compressionProgress}%</span>
                    </div>
                    <Progress value={compressionProgress} className="h-1.5" />
                  </div>
                )}

                {/* Image Grid */}
                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {images.map((img) => (
                      <div
                        key={img.id}
                        className="relative aspect-square rounded-xl overflow-hidden border border-border/50 group"
                      >
                        <img
                          src={img.previewUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                          <button
                            onClick={() => handleEditImage(img.id)}
                            className="p-1.5 rounded-full bg-white/90 hover:bg-white text-gray-700"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleRemoveImage(img.id)}
                            className="p-1.5 rounded-full bg-red-500/90 hover:bg-red-500 text-white"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {img.isCompressed && (
                          <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/90 text-white">
                            -{Math.round((1 - (img.compressedSize || 0) / img.originalSize) * 100)}%
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Add more button */}
                    {images.length < MAX_IMAGES && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isCompressing}
                        className="aspect-square rounded-xl border-2 border-dashed border-gold/30 hover:border-gold/50 hover:bg-gold/5 transition-all flex items-center justify-center disabled:opacity-50"
                      >
                        <Plus className="w-6 h-6 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                )}

                {/* Initial upload button */}
                {images.length === 0 && !isCompressing && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-gold/30 rounded-xl hover:border-gold/50 hover:bg-gold/5 transition-all flex flex-col items-center justify-center gap-2"
                  >
                    <ImagePlus className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Nhấn để chọn hình ảnh (tối đa {MAX_IMAGES})
                    </span>
                    <span className="text-xs text-muted-foreground/60">
                      Ảnh sẽ được nén tự động để tải nhanh hơn
                    </span>
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>

              {/* Upload Progress */}
              {isSubmitting && images.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Đang tải ảnh lên...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-1.5" />
                </div>
              )}

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !user || isCompressing}
                className="w-full bg-gradient-to-r from-gold/80 to-rose-500/80 hover:from-gold hover:to-rose-500 text-white py-6"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {uploadProgress > 0 ? `Đang tải ảnh (${uploadProgress}%)...` : "Đang chia sẻ..."}
                  </>
                ) : isCompressing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang nén ảnh...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Chia sẻ khoảnh khắc
                  </>
                )}
              </Button>

              {!user && (
                <p className="text-xs text-center text-amber-500 mt-3">
                  Vui lòng đăng nhập để chia sẻ khoảnh khắc
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Editor Modal */}
      <AnimatePresence>
        {editingImage && (
          <ImageCropEditor
            imageUrl={editingImage.previewUrl}
            onSave={handleSaveEditedImage}
            onCancel={() => setEditingImageId(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default CreateMomentDialog;
