import { useState } from "react";
import { Flag, Loader2, AlertTriangle, Send } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface ReportCommentDialogProps {
  commentId: string;
  commentContent: string;
  onReported?: () => void;
}

const REPORT_REASONS = [
  { value: "spam", label: "Spam hoặc quảng cáo" },
  { value: "harassment", label: "Quấy rối hoặc bắt nạt" },
  { value: "hate_speech", label: "Ngôn từ thù địch" },
  { value: "inappropriate", label: "Nội dung không phù hợp" },
  { value: "misinformation", label: "Thông tin sai lệch" },
  { value: "other", label: "Lý do khác" },
];

const ReportCommentDialog = ({
  commentId,
  commentContent,
  onReported,
}: ReportCommentDialogProps) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để báo cáo");
      return;
    }

    if (!reason) {
      toast.error("Vui lòng chọn lý do báo cáo");
      return;
    }

    try {
      setIsSubmitting(true);

      const { error } = await (supabase
        .from("testimonial_comment_reports") as any)
        .insert({
          comment_id: commentId,
          reporter_id: user.id,
          reason,
          description: description.trim() || null,
        });

      if (error) throw error;

      toast.success("Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét nội dung này.");
      setIsOpen(false);
      setReason("");
      setDescription("");
      onReported?.();
    } catch (error: any) {
      console.error("Error reporting comment:", error);
      if (error.code === "23505") {
        toast.error("Bạn đã báo cáo bình luận này rồi");
      } else {
        toast.error("Không thể gửi báo cáo");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Báo cáo bình luận"
        >
          <Flag className="w-3 h-3 text-muted-foreground hover:text-destructive" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Báo cáo bình luận
          </DialogTitle>
          <DialogDescription>
            Vui lòng cho chúng tôi biết lý do bạn muốn báo cáo bình luận này.
          </DialogDescription>
        </DialogHeader>

        {/* Preview of reported comment */}
        <div className="p-3 bg-muted/50 rounded-lg border border-border/30">
          <p className="text-sm text-muted-foreground italic line-clamp-3">
            "{commentContent}"
          </p>
        </div>

        {/* Reason selection */}
        <RadioGroup value={reason} onValueChange={setReason} className="space-y-2">
          {REPORT_REASONS.map((r) => (
            <div key={r.value} className="flex items-center space-x-3">
              <RadioGroupItem value={r.value} id={r.value} />
              <Label htmlFor={r.value} className="text-sm cursor-pointer">
                {r.label}
              </Label>
            </div>
          ))}
        </RadioGroup>

        {/* Additional description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">
            Mô tả thêm (tùy chọn)
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Cung cấp thêm thông tin chi tiết..."
            className="resize-none"
            rows={3}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground text-right">
            {description.length}/500
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !reason}
            className="gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Gửi báo cáo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportCommentDialog;
