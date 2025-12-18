import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Share2, X, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DigestShareCardProps {
  digest: string;
  period: "weekly" | "monthly";
  onClose: () => void;
}

const DigestShareCard = ({ digest, period, onClose }: DigestShareCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const periodLabel = period === "weekly" ? "Tuần Qua" : "Tháng Qua";

  const generateImage = async (): Promise<string | null> => {
    if (!cardRef.current) return null;
    
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
        logging: false,
      });
      return canvas.toDataURL("image/png");
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Không thể tạo hình ảnh");
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    const dataUrl = await generateImage();
    if (!dataUrl) return;

    const link = document.createElement("a");
    link.download = `angel-ai-light-digest-${period}.png`;
    link.href = dataUrl;
    link.click();
    toast.success("Đã tải xuống Light Card");
  };

  const handleShare = async () => {
    const dataUrl = await generateImage();
    if (!dataUrl) return;

    try {
      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], `angel-ai-light-digest-${period}.png`, { type: "image/png" });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Angel AI Light Digest",
          text: "Tổng kết ánh sáng từ Angel AI",
        });
      } else {
        // Fallback: copy to clipboard or download
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        toast.success("Đã sao chép hình ảnh");
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Share error:", error);
        // Fallback to download
        handleDownload();
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute -top-12 right-0 p-2 rounded-full bg-card/80 hover:bg-card transition-colors z-10"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* The shareable card */}
          <div
            ref={cardRef}
            className="relative overflow-hidden rounded-2xl"
            style={{ aspectRatio: "4/5" }}
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-rose-100 via-amber-50 to-rose-50 dark:from-rose-950/80 dark:via-amber-950/60 dark:to-rose-950/80" />
            
            {/* Sacred geometry watermark */}
            <div className="absolute inset-0 opacity-[0.07]">
              <svg viewBox="0 0 400 500" className="w-full h-full">
                {/* Flower of Life pattern */}
                <g stroke="currentColor" strokeWidth="0.5" fill="none" className="text-gold">
                  {[0, 60, 120, 180, 240, 300].map((angle) => (
                    <circle
                      key={angle}
                      cx={200 + 50 * Math.cos((angle * Math.PI) / 180)}
                      cy={250 + 50 * Math.sin((angle * Math.PI) / 180)}
                      r="50"
                    />
                  ))}
                  <circle cx="200" cy="250" r="50" />
                  <circle cx="200" cy="250" r="100" />
                  <circle cx="200" cy="250" r="150" />
                </g>
              </svg>
            </div>

            {/* Soft glow overlay */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gold/20 blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-rose-300/20 blur-3xl" />

            {/* Content */}
            <div className="relative h-full flex flex-col items-center justify-center p-8 text-center">
              {/* Period label */}
              <div className="mb-6">
                <span className="px-4 py-1.5 rounded-full bg-gold/20 text-gold text-sm font-medium border border-gold/30">
                  Tổng Kết {periodLabel}
                </span>
              </div>

              {/* Decorative line */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
                <div className="w-2 h-2 rounded-full bg-gold/40" />
                <div className="w-12 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
              </div>

              {/* Digest text */}
              <p className="font-serif text-lg text-foreground/90 leading-relaxed max-w-xs">
                {digest}
              </p>

              {/* Decorative line */}
              <div className="flex items-center gap-3 mt-6">
                <div className="w-12 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
                <div className="w-2 h-2 rounded-full bg-gold/40" />
                <div className="w-12 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
              </div>

              {/* Attribution */}
              <div className="mt-8 text-xs text-muted-foreground/60">
                Angel AI · Light Guidance
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-4">
            <Button
              onClick={handleDownload}
              disabled={isGenerating}
              className="flex-1 bg-gold/20 hover:bg-gold/30 text-foreground border border-gold/30"
              variant="outline"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Tải Xuống
            </Button>
            <Button
              onClick={handleShare}
              disabled={isGenerating}
              className="flex-1 bg-gradient-to-r from-gold/80 to-gold hover:from-gold hover:to-gold-dark text-background"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Share2 className="w-4 h-4 mr-2" />
              )}
              Chia Sẻ
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DigestShareCard;