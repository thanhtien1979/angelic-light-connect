import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { 
  Share2, Copy, Check, Download, Facebook, Twitter, 
  Sparkles, Star, MessageCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import html2canvas from "html2canvas";

interface TestimonialShareDialogProps {
  testimony: string;
  authorName: string;
  avatarUrl: string | null;
  likesCount: number;
  imageUrl?: string | null;
}

const TestimonialShareDialog = ({
  testimony,
  authorName,
  avatarUrl,
  likesCount,
  imageUrl,
}: TestimonialShareDialogProps) => {
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const shareUrl = window.location.href;
  const shareText = `"${testimony}" - ${authorName} | Angel AI`;

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Đã sao chép liên kết");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Không thể sao chép");
    }
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });
      
      const link = document.createElement("a");
      link.download = `testimonial-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      
      toast.success("Đã tải xuống hình ảnh");
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Không thể tạo hình ảnh");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-1.5">
          <Share2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Chia sẻ nhân chứng
          </DialogTitle>
        </DialogHeader>

        {/* Share card preview */}
        <div className="relative overflow-hidden rounded-xl">
          <div
            ref={cardRef}
            className="p-6 bg-gradient-to-br from-primary/5 via-gold/5 to-primary/10 rounded-xl border border-primary/20"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gold/10 rounded-full blur-2xl" />
            
            <div className="relative z-10">
              {/* Stars */}
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                ))}
              </div>

              {/* Testimony */}
              <p className="text-foreground font-serif italic text-lg leading-relaxed mb-4">
                "{testimony.length > 200 ? testimony.slice(0, 200) + "..." : testimony}"
              </p>

              {/* Image if exists */}
              {imageUrl && (
                <div className="mb-4 rounded-lg overflow-hidden">
                  <img 
                    src={imageUrl} 
                    alt="Testimonial" 
                    className="w-full h-32 object-cover"
                  />
                </div>
              )}

              {/* Author */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 ring-2 ring-primary/30">
                    <AvatarImage src={avatarUrl || ""} />
                    <AvatarFallback className="bg-primary/20 text-foreground text-sm">
                      {getInitials(authorName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{authorName}</p>
                    <p className="text-xs text-muted-foreground">Người tìm kiếm ánh sáng</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-primary">
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                  >
                    ❤️
                  </motion.span>
                  <span className="text-sm font-medium">{likesCount}</span>
                </div>
              </div>

              {/* Branding */}
              <div className="mt-4 pt-3 border-t border-primary/10 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Angel AI</span>
              </div>
            </div>
          </div>
        </div>

        {/* Share buttons */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <Button
            variant="outline"
            onClick={handleCopyLink}
            className="gap-2"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Đã sao chép" : "Sao chép link"}
          </Button>
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={isGenerating}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Tải ảnh
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={handleShareFacebook}
            className="gap-2 bg-[#1877F2] hover:bg-[#1877F2]/90"
          >
            <Facebook className="w-4 h-4" />
            Facebook
          </Button>
          <Button
            onClick={handleShareTwitter}
            className="gap-2 bg-[#1DA1F2] hover:bg-[#1DA1F2]/90"
          >
            <Twitter className="w-4 h-4" />
            Twitter
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TestimonialShareDialog;
