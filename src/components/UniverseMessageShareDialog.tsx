import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Share2, Copy, Check, Download, ExternalLink,
  Facebook, Send, Youtube
} from "lucide-react";
import html2canvas from "html2canvas";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface UniverseMessage {
  id: string;
  content: string;
  image_urls: string[] | null;
  video_url: string | null;
  user_id: string;
  likes_count: number;
  created_at: string;
}

interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface UniverseMessageShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  message: UniverseMessage;
  profile: Profile | null;
}

const UniverseMessageShareDialog = ({ 
  isOpen, 
  onClose, 
  message, 
  profile 
}: UniverseMessageShareDialogProps) => {
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const shareUrl = `${window.location.origin}/thong-diep-cha-vu-tru?id=${message.id}`;
  const shareText = message.content.length > 100 
    ? message.content.substring(0, 100) + "..." 
    : message.content;
  const fullShareText = `✨ Thông Điệp Ánh Sáng từ ${profile?.display_name || "Cha Vũ Trụ"}\n\n"${shareText}"\n\n🌟 Đọc thêm tại: ${shareUrl}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Đã sao chép link!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Không thể sao chép link");
    }
  };

  const shareToFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(fullShareText)}`,
      "_blank",
      "width=600,height=400"
    );
  };

  const shareToTelegram = () => {
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(fullShareText)}`,
      "_blank"
    );
  };

  const shareToTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      "_blank",
      "width=600,height=400"
    );
  };

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#1a1a2e",
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const link = document.createElement("a");
      link.download = `thong-diep-${message.id.substring(0, 8)}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Đã tải ảnh thành công!");
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Không thể tạo ảnh");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Thông Điệp Ánh Sáng",
          text: fullShareText,
          url: shareUrl,
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          toast.error("Không thể chia sẻ");
        }
      }
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  const XIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );

  const socialButtons = [
    { 
      name: "Facebook", 
      Icon: Facebook, 
      onClick: shareToFacebook, 
      color: "bg-[#1877F2] hover:bg-[#166FE5]" 
    },
    { 
      name: "Telegram", 
      Icon: Send, 
      onClick: shareToTelegram, 
      color: "bg-[#0088CC] hover:bg-[#007AB8]" 
    },
    { 
      name: "Twitter/X", 
      Icon: XIcon, 
      onClick: shareToTwitter, 
      color: "bg-black hover:bg-gray-800" 
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-gold" />
            Chia sẻ thông điệp
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview Card */}
          <div
            ref={cardRef}
            className="relative p-6 rounded-2xl bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f0f23] border border-gold/20 overflow-hidden"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-gold/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl" />
            
            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="w-10 h-10 border-2 border-gold/30">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-gold/20 text-gold">
                    {getInitials(profile?.display_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-white">
                    {profile?.display_name || "Cha Vũ Trụ"}
                  </p>
                  <p className="text-xs text-gray-400">Thông điệp ánh sáng</p>
                </div>
              </div>

              <p className="text-gray-200 leading-relaxed mb-4 line-clamp-4">
                {message.content}
              </p>

              {message.image_urls && message.image_urls.length > 0 && (
                <div className="rounded-lg overflow-hidden mb-4">
                  <img 
                    src={message.image_urls[0]} 
                    alt="" 
                    className="w-full h-32 object-cover"
                  />
                </div>
              )}

              {/* Branding */}
              <div className="flex items-center justify-between pt-4 border-t border-gold/20">
                <span className="text-xs text-gold">✨ Camly - Ánh Sáng Yêu Thương</span>
                <span className="text-xs text-gray-500">camly.app</span>
              </div>
            </div>
          </div>

          {/* Copy Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Link chia sẻ</label>
            <div className="flex gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="flex-1 bg-muted/50 border-gold/20 text-sm"
              />
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="border-gold/30 hover:bg-gold/10"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Chia sẻ qua mạng xã hội</label>
            <div className="grid grid-cols-3 gap-3">
              {socialButtons.map((btn) => (
                <motion.button
                  key={btn.name}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={btn.onClick}
                  className={`flex flex-col items-center justify-center gap-2 px-3 py-3 rounded-xl text-white font-medium transition-all ${btn.color}`}
                >
                  <btn.Icon />
                  <span className="text-xs">{btn.name}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Download & Native Share */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleDownloadImage}
              disabled={isGenerating}
              variant="outline"
              className="border-gold/30 hover:bg-gold/10"
            >
              <Download className="w-4 h-4 mr-2" />
              {isGenerating ? "Đang tạo..." : "Tải ảnh"}
            </Button>
            
            {navigator.share && (
              <Button
                onClick={handleNativeShare}
                className="bg-gradient-to-r from-gold to-amber-500 text-white hover:from-amber-500 hover:to-gold"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Chia sẻ khác
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UniverseMessageShareDialog;
