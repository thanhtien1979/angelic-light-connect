import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Send, Sparkles, Globe, Lock, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCamlyCoin } from "@/hooks/useCamlyCoin";
import { toast } from "sonner";

interface ReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (result: { coins: number; message: string }) => void;
}

export const ReflectionModal = ({ isOpen, onClose, onSuccess }: ReflectionModalProps) => {
  const { user } = useAuth();
  const { awardReflection } = useCamlyCoin();
  const [content, setContent] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);

  const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length;
  const isValid = wordCount >= 200;

  const handlePublicToggle = (checked: boolean) => {
    if (checked) {
      // Show consent dialog when enabling public sharing
      setShowConsentDialog(true);
    } else {
      setIsPublic(false);
      setConsentChecked(false);
    }
  };

  const handleConsentConfirm = () => {
    if (consentChecked) {
      setIsPublic(true);
      setShowConsentDialog(false);
    }
  };

  const handleConsentCancel = () => {
    setShowConsentDialog(false);
    setConsentChecked(false);
  };

  const handleSubmit = async () => {
    if (!user?.id || !isValid) return;

    // If public, require consent confirmation
    if (isPublic && !consentChecked) {
      setShowConsentDialog(true);
      return;
    }

    setIsSubmitting(true);
    setValidationMessage(null);

    try {
      // Get session for authenticated request
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.access_token) {
        toast.error("Vui lòng đăng nhập để gửi suy ngẫm");
        setIsSubmitting(false);
        return;
      }

      // Validate reflection with AI (authenticated)
      const validateResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/validate-reflection`,
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${sessionData.session.access_token}`
          },
          body: JSON.stringify({ content }),
        }
      );

      const validation = await validateResponse.json();

      if (!validation.approved) {
        setValidationMessage(validation.message);
        toast.error(validation.message);
        setIsSubmitting(false);
        return;
      }

      // Save reflection to database with consent confirmation
      const { data: reflectionData, error: saveError } = await supabase
        .from("reflection_notes")
        .insert({
          user_id: user.id,
          content,
          word_count: wordCount,
          sincerity_score: validation.sincerityScore,
          approved: true,
          is_public: isPublic,
          public_consent_confirmed: isPublic && consentChecked,
        })
        .select("id")
        .single();

      if (saveError) throw saveError;

      // Award coins with consent confirmation
      const result = await awardReflection(reflectionData.id, validation.message, isPublic, consentChecked);

      if (result?.success) {
        toast.success("Ánh sáng đã được ghi nhận! ✨");
        onSuccess?.({ coins: 1000, message: result.message });
        setContent("");
        setIsPublic(false);
        setConsentChecked(false);
        onClose();
      }
    } catch (error) {
      console.error("Reflection submission error:", error);
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-card rounded-2xl border border-gold/30 shadow-2xl shadow-gold/10 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gold/20 bg-gradient-to-r from-gold/10 to-transparent">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-gold/20">
                  <Heart className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-foreground">Viết Suy Ngẫm & Biết Ơn</h3>
                  <p className="text-xs text-muted-foreground">Chia sẻ những suy nghĩ từ trái tim</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-muted/50 transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Reward info */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-gold/10 border border-gold/20">
                <Sparkles className="w-4 h-4 text-gold" />
                <span className="text-sm text-foreground/80">
                  Nhận <span className="font-bold text-gold">+1,000 Happy Camly Coin</span> khi viết ít nhất 200 từ chân thành
                </span>
              </div>

              {/* Textarea */}
              <div className="relative">
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Hôm nay con cảm thấy biết ơn vì..."
                  className="min-h-[250px] resize-none border-gold/30 focus:border-gold/50 focus:ring-gold/20"
                />
                
                {/* Word count */}
                <div className={`absolute bottom-3 right-3 text-xs px-2 py-1 rounded-full ${
                  isValid 
                    ? "bg-green-500/20 text-green-600" 
                    : "bg-muted text-muted-foreground"
                }`}>
                  {wordCount}/200 từ
                </div>
              </div>

              {/* Validation message */}
              {validationMessage && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-amber-600 bg-amber-500/10 p-3 rounded-xl"
                >
                  {validationMessage}
                </motion.p>
              )}

              {/* Public toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <div className="flex items-center gap-2">
                  {isPublic ? (
                    <Globe className="w-4 h-4 text-sky" />
                  ) : (
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  )}
                  <Label htmlFor="public-toggle" className="text-sm">
                    {isPublic ? "Chia sẻ công khai" : "Chỉ mình tôi thấy"}
                  </Label>
                </div>
                <Switch
                  id="public-toggle"
                  checked={isPublic}
                  onCheckedChange={handlePublicToggle}
                />
              </div>

              {/* Public sharing warning */}
              {isPublic && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-700">
                    Bạn đã xác nhận chia sẻ công khai. Mọi người có thể xem nội dung này.
                  </p>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gold/20 bg-muted/20 flex items-center justify-end gap-3">
              <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                Hủy
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!isValid || isSubmitting}
                className="bg-gold hover:bg-gold-dark text-background"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Gửi với tình yêu
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Consent Dialog */}
      <AlertDialog open={showConsentDialog} onOpenChange={setShowConsentDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-sky" />
              Xác nhận chia sẻ công khai
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 text-left">
              <p>
                Khi bạn chia sẻ công khai, nội dung suy ngẫm của bạn sẽ:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Hiển thị cho tất cả người dùng trên nền tảng</li>
                <li>Có thể được xem bởi bất kỳ ai có quyền truy cập</li>
                <li>Không thể thu hồi hoàn toàn sau khi đã được xem</li>
              </ul>
              <div className="flex items-start gap-2 pt-2">
                <Checkbox
                  id="consent-check"
                  checked={consentChecked}
                  onCheckedChange={(checked) => setConsentChecked(checked === true)}
                />
                <Label htmlFor="consent-check" className="text-sm leading-tight cursor-pointer">
                  Tôi hiểu và đồng ý chia sẻ nội dung này công khai với cộng đồng
                </Label>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleConsentCancel}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConsentConfirm}
              disabled={!consentChecked}
              className="bg-sky hover:bg-sky/90"
            >
              Xác nhận chia sẻ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AnimatePresence>
  );
};
