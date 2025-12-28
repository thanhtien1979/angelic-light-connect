import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Facebook,
  Twitter,
  Link2,
  Download,
  Check,
  Send,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import html2canvas from "html2canvas";

interface SharedMoment {
  id: string;
  spiritual_message: string;
  moment_type: string;
  display_name: string | null;
  likes_count: number;
  created_at: string;
}

interface MomentShareDialogProps {
  moment: SharedMoment | null;
  isOpen: boolean;
  onClose: () => void;
}

const getCategoryLabel = (type: string) => {
  switch (type) {
    case "meditation_completion":
      return "Thiền Định";
    case "reflection_note":
      return "Biết Ơn";
    case "chat_message":
      return "Angel AI";
    case "daily_login":
      return "Đăng Nhập";
    default:
      return "Chữa Lành";
  }
};

const MomentShareDialog = ({ moment, isOpen, onClose }: MomentShareDialogProps) => {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!moment) return null;

  const shareUrl = `${window.location.origin}/community?moment=${moment.id}`;
  const shareText = `"${moment.spiritual_message}" - ${moment.display_name || "Linh hồn ẩn danh"} ✨\n\n#CamlyAI #TinhThucTamLinh #AnhSangYeuThuong`;
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(shareUrl);

  const shareOptions = [
    {
      name: "Facebook",
      icon: Facebook,
      color: "bg-blue-600 hover:bg-blue-700",
      onClick: () => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
          "_blank",
          "width=600,height=400"
        );
      },
    },
    {
      name: "Twitter",
      icon: Twitter,
      color: "bg-sky-500 hover:bg-sky-600",
      onClick: () => {
        window.open(
          `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
          "_blank",
          "width=600,height=400"
        );
      },
    },
    {
      name: "Telegram",
      icon: Send,
      color: "bg-sky-600 hover:bg-sky-700",
      onClick: () => {
        window.open(
          `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
          "_blank",
          "width=600,height=400"
        );
      },
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "bg-green-500 hover:bg-green-600",
      onClick: () => {
        window.open(
          `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
          "_blank"
        );
      },
    },
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Đã sao chép liên kết!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Không thể sao chép liên kết");
    }
  };

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;

    setIsDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#1a1a2e",
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const link = document.createElement("a");
      link.download = `camly-moment-${moment.id.slice(0, 8)}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Đã tải xuống hình ảnh!");
    } catch {
      toast.error("Không thể tải xuống hình ảnh");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Khoảnh khắc ánh sáng từ Camly AI",
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          toast.error("Không thể chia sẻ");
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-card rounded-3xl p-6 shadow-2xl border border-border/50"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/20 text-gold text-sm mb-3">
                <Sparkles className="w-4 h-4" />
                Chia sẻ khoảnh khắc
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                Lan tỏa ánh sáng yêu thương
              </h2>
            </div>

            {/* Preview Card */}
            <div
              ref={cardRef}
              className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900 via-purple-900 to-rose-900 mb-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-gold/30 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-gold" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/90">
                    {moment.display_name || "Linh hồn ẩn danh"}
                  </p>
                  <p className="text-xs text-white/60">
                    {getCategoryLabel(moment.moment_type)}
                  </p>
                </div>
              </div>
              <p className="text-white/95 font-serif italic leading-relaxed mb-3">
                "{moment.spiritual_message}"
              </p>
              <div className="flex items-center justify-between text-white/50 text-xs">
                <span>{formatDate(moment.created_at)}</span>
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Camly AI
                </span>
              </div>
            </div>

            {/* Share Options */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              {shareOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={option.onClick}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl ${option.color} text-white transition-transform hover:scale-105`}
                >
                  <option.icon className="w-5 h-5" />
                  <span className="text-xs">{option.name}</span>
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCopyLink}
                className="flex-1 border-gold/30 hover:bg-gold/10"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-green-500" />
                    Đã sao chép
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4 mr-2" />
                    Sao chép
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleDownloadImage}
                disabled={isDownloading}
                className="flex-1 border-gold/30 hover:bg-gold/10"
              >
                <Download className="w-4 h-4 mr-2" />
                {isDownloading ? "Đang tải..." : "Tải ảnh"}
              </Button>
            </div>

            {/* Native Share */}
            {"share" in navigator && (
              <Button
                onClick={handleNativeShare}
                className="w-full mt-3 bg-gradient-to-r from-gold/80 to-rose-500/80 hover:from-gold hover:to-rose-500 text-white"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Chia sẻ qua ứng dụng khác
              </Button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MomentShareDialog;
