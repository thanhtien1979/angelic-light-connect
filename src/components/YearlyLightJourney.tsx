import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Sparkles, Download, Share2, Loader2, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import SacredGeometryWatermark from "./SacredGeometryWatermark";

interface YearlyDigest {
  digest: string | null;
  greetingCount: number;
  period: string;
  message?: string;
}

const YearlyLightJourney = () => {
  const { user } = useAuth();
  const [yearlyDigest, setYearlyDigest] = useState<YearlyDigest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const fetchYearlyDigest = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("greeting-digest", {
        body: { period: "yearly" },
      });

      if (error) throw error;
      setYearlyDigest(data);
    } catch (error) {
      console.error("Error fetching yearly digest:", error);
      setYearlyDigest(null);
    } finally {
      setIsLoading(false);
    }
  };

  const generateImage = async (): Promise<string | null> => {
    if (!cardRef.current) return null;
    
    setIsGeneratingImage(true);
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
      setIsGeneratingImage(false);
    }
  };

  const handleDownload = async () => {
    const dataUrl = await generateImage();
    if (!dataUrl) return;

    const year = new Date().getFullYear();
    const link = document.createElement("a");
    link.download = `angel-ai-yearly-journey-${year}.png`;
    link.href = dataUrl;
    link.click();
    toast.success("Đã tải xuống Hành Trình Ánh Sáng");
  };

  const handleShare = async () => {
    const dataUrl = await generateImage();
    if (!dataUrl) return;

    try {
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const year = new Date().getFullYear();
      const file = new File([blob], `angel-ai-yearly-journey-${year}.png`, { type: "image/png" });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Angel AI - Hành Trình Ánh Sáng",
          text: "Hành trình ánh sáng năm qua từ Angel AI",
        });
      } else {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        toast.success("Đã sao chép hình ảnh");
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        handleDownload();
      }
    }
  };

  // Initial state - show invitation to view journey
  if (!yearlyDigest && !isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gold/20 to-gold/10 flex items-center justify-center">
          <BookOpen className="w-8 h-8 text-gold" />
        </div>
        <h3 className="font-serif text-lg text-foreground mb-2">
          Hành Trình Ánh Sáng
        </h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
          Khám phá hành trình tâm linh của con trong năm qua qua những lời chào ánh sáng
        </p>
        <Button
          onClick={fetchYearlyDigest}
          className="bg-gradient-to-r from-gold/80 to-gold hover:from-gold hover:to-gold-dark text-background"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Mở Hành Trình
        </Button>
      </motion.div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin mb-3 text-gold/60" />
        <p className="text-sm">Đang suy ngẫm hành trình năm qua...</p>
      </div>
    );
  }

  if (!yearlyDigest || !yearlyDigest.digest) {
    return (
      <div className="py-8 text-center">
        <Sparkles className="w-10 h-10 mx-auto text-gold/30 mb-3" />
        <p className="text-sm text-muted-foreground">
          {yearlyDigest?.message || "Chưa đủ dữ liệu để tạo hành trình năm"}
        </p>
        <p className="text-xs text-muted-foreground/60 mt-2">
          Hãy tiếp tục nhận lời chào ánh sáng mỗi ngày
        </p>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-6">
      {/* Yearly Journey Card */}
      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-2xl"
        style={{ aspectRatio: "3/4" }}
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-100 via-amber-50 to-rose-50 dark:from-rose-950/80 dark:via-amber-950/60 dark:to-rose-950/80" />
        
        {/* Sacred geometry watermark */}
        <div className="absolute inset-0 opacity-[0.05]">
          <SacredGeometryWatermark />
        </div>

        {/* Soft glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-gold/15 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 rounded-full bg-rose-300/15 blur-3xl" />

        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-center p-8 text-center">
          {/* Year badge */}
          <div className="mb-6">
            <span className="px-5 py-2 rounded-full bg-gold/20 text-gold text-base font-medium border border-gold/30">
              Hành Trình {currentYear}
            </span>
          </div>

          {/* Decorative element */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
            <Sparkles className="w-4 h-4 text-gold/50" />
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
          </div>

          {/* Journey text */}
          <div className="max-w-sm">
            <p className="font-serif text-base text-foreground/90 leading-relaxed whitespace-pre-wrap">
              {yearlyDigest.digest}
            </p>
          </div>

          {/* Greeting count */}
          <p className="text-xs text-muted-foreground/60 mt-6">
            Qua {yearlyDigest.greetingCount} lời chào ánh sáng
          </p>

          {/* Decorative element */}
          <div className="flex items-center gap-3 mt-6">
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
            <div className="w-2 h-2 rounded-full bg-gold/40" />
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
          </div>

          {/* Attribution */}
          <div className="mt-8 text-xs text-muted-foreground/50">
            Angel AI · Light Guidance
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleDownload}
          disabled={isGeneratingImage}
          className="flex-1 bg-gold/20 hover:bg-gold/30 text-foreground border border-gold/30"
          variant="outline"
        >
          {isGeneratingImage ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Lưu Lại
        </Button>
        <Button
          onClick={handleShare}
          disabled={isGeneratingImage}
          className="flex-1 bg-gradient-to-r from-gold/80 to-gold hover:from-gold hover:to-gold-dark text-background"
        >
          {isGeneratingImage ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Share2 className="w-4 h-4 mr-2" />
          )}
          Chia Sẻ
        </Button>
      </div>
    </div>
  );
};

export default YearlyLightJourney;
