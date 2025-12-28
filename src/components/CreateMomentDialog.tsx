import { useState } from "react";
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
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { z } from "zod";

interface CreateMomentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
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

const CreateMomentDialog = ({ isOpen, onClose, onSuccess }: CreateMomentDialogProps) => {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ message?: string; type?: string }>({});

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

    try {
      // Fetch user profile for display name
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single();

      const { error } = await supabase.from("shared_light_moments").insert({
        user_id: user.id,
        spiritual_message: message.trim(),
        moment_type: selectedType,
        display_name: profile?.display_name || null,
        likes_count: 0,
      });

      if (error) throw error;

      toast.success("Đã chia sẻ khoảnh khắc ánh sáng của bạn!");
      setMessage("");
      setSelectedType("");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error creating moment:", error);
      toast.error("Không thể chia sẻ khoảnh khắc. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setMessage("");
      setSelectedType("");
      setErrors({});
      onClose();
    }
  };

  const selectedMomentType = momentTypes.find((t) => t.value === selectedType);

  return (
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
            <div className="mb-6">
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
                className="min-h-[120px] resize-none border-gold/20 focus:border-gold/50 bg-muted/30"
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

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !user}
              className="w-full bg-gradient-to-r from-gold/80 to-rose-500/80 hover:from-gold hover:to-rose-500 text-white py-6"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang chia sẻ...
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
  );
};

export default CreateMomentDialog;
