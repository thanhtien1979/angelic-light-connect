import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Share2, Copy, Check, ExternalLink, 
  Facebook, Twitter, Send, MessageCircle as TelegramIcon
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ProfileShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  displayName: string | null;
}

const ProfileShareDialog = ({ isOpen, onClose, userId, displayName }: ProfileShareDialogProps) => {
  const [copied, setCopied] = useState(false);
  
  const profileUrl = `${window.location.origin}/user/${userId}`;
  const shareText = `Hãy xem hồ sơ của ${displayName || "người dùng này"} trên Camly - Cộng đồng chữa lành và thức tỉnh ✨`;
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast.success("Đã sao chép link!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Không thể sao chép link");
    }
  };

  const shareToFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}&quote=${encodeURIComponent(shareText)}`,
      "_blank",
      "width=600,height=400"
    );
  };

  const shareToTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(profileUrl)}&text=${encodeURIComponent(shareText)}`,
      "_blank",
      "width=600,height=400"
    );
  };

  const shareToTelegram = () => {
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(profileUrl)}&text=${encodeURIComponent(shareText)}`,
      "_blank"
    );
  };

  const shareToWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareText + "\n" + profileUrl)}`,
      "_blank"
    );
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Hồ sơ của ${displayName || "người dùng"}`,
          text: shareText,
          url: profileUrl,
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          toast.error("Không thể chia sẻ");
        }
      }
    }
  };

  const socialButtons = [
    { 
      name: "Facebook", 
      icon: Facebook, 
      onClick: shareToFacebook, 
      color: "bg-[#1877F2] hover:bg-[#166FE5]" 
    },
    { 
      name: "Twitter", 
      icon: Twitter, 
      onClick: shareToTwitter, 
      color: "bg-[#1DA1F2] hover:bg-[#1A91DA]" 
    },
    { 
      name: "Telegram", 
      icon: TelegramIcon, 
      onClick: shareToTelegram, 
      color: "bg-[#0088CC] hover:bg-[#007AB8]" 
    },
    { 
      name: "WhatsApp", 
      icon: Send, 
      onClick: shareToWhatsApp, 
      color: "bg-[#25D366] hover:bg-[#22C35E]" 
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-gold" />
            Chia sẻ hồ sơ
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Link hồ sơ công khai</label>
            <div className="flex gap-2">
              <Input
                value={profileUrl}
                readOnly
                className="flex-1 bg-muted/50 border-gold/20"
              />
              <Button
                onClick={handleCopy}
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
            <div className="grid grid-cols-2 gap-3">
              {socialButtons.map((btn) => (
                <motion.button
                  key={btn.name}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={btn.onClick}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white font-medium transition-all ${btn.color}`}
                >
                  <btn.icon className="w-5 h-5" />
                  {btn.name}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Native Share (mobile) */}
          {navigator.share && (
            <Button
              onClick={handleNativeShare}
              className="w-full bg-gradient-to-r from-gold to-amber-500 text-white hover:from-amber-500 hover:to-gold"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Chia sẻ thêm...
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileShareDialog;
