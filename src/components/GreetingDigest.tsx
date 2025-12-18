import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Calendar, Loader2, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import DigestShareCard from "./DigestShareCard";

interface DigestData {
  digest: string | null;
  greetingCount: number;
  period: string;
  message?: string;
}

const GreetingDigest = () => {
  const { user } = useAuth();
  const [weeklyDigest, setWeeklyDigest] = useState<DigestData | null>(null);
  const [monthlyDigest, setMonthlyDigest] = useState<DigestData | null>(null);
  const [isLoadingWeekly, setIsLoadingWeekly] = useState(false);
  const [isLoadingMonthly, setIsLoadingMonthly] = useState(false);
  const [activeTab, setActiveTab] = useState("weekly");
  const [shareDigest, setShareDigest] = useState<{ digest: string; period: "weekly" | "monthly" } | null>(null);

  const fetchDigest = async (period: "weekly" | "monthly") => {
    if (!user?.id) return;

    const setLoading = period === "weekly" ? setIsLoadingWeekly : setIsLoadingMonthly;
    const setDigest = period === "weekly" ? setWeeklyDigest : setMonthlyDigest;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("greeting-digest", {
        body: { period },
      });

      if (error) throw error;
      setDigest(data);
    } catch (error) {
      console.error(`Error fetching ${period} digest:`, error);
      setDigest(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch digest when tab changes
  useEffect(() => {
    if (!user?.id) return;

    if (activeTab === "weekly" && !weeklyDigest && !isLoadingWeekly) {
      fetchDigest("weekly");
    } else if (activeTab === "monthly" && !monthlyDigest && !isLoadingMonthly) {
      fetchDigest("monthly");
    }
  }, [activeTab, user?.id]);

  const handleShare = (digest: string, period: "weekly" | "monthly") => {
    setShareDigest({ digest, period });
  };

  const renderDigestContent = (
    digest: DigestData | null, 
    isLoading: boolean, 
    periodLabel: string,
    period: "weekly" | "monthly"
  ) => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin mb-2 text-gold/60" />
          <p className="text-sm">Đang suy ngẫm...</p>
        </div>
      );
    }

    if (!digest || !digest.digest) {
      return (
        <div className="py-6 text-center">
          <Sparkles className="w-8 h-8 mx-auto text-gold/30 mb-2" />
          <p className="text-sm text-muted-foreground">
            {digest?.message || `Chưa đủ lời chào trong ${periodLabel} để tạo tổng kết`}
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Hãy quay lại sau khi nhận thêm những lời chào ánh sáng
          </p>
        </div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {/* Greeting count indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
            <Calendar className="w-3 h-3" />
            <span>Dựa trên {digest.greetingCount} lời chào {periodLabel}</span>
          </div>
          
          {/* Share button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleShare(digest.digest!, period)}
            className="h-8 px-2 text-gold hover:text-gold hover:bg-gold/10"
          >
            <Share2 className="w-4 h-4 mr-1" />
            <span className="text-xs">Chia sẻ</span>
          </Button>
        </div>

        {/* Digest message */}
        <div className="p-5 rounded-xl bg-gradient-to-br from-gold/10 via-card/60 to-rose-100/10 dark:to-rose-900/10 border border-gold/20">
          <p className="font-serif text-foreground/90 leading-relaxed whitespace-pre-wrap">
            {digest.digest}
          </p>
        </div>

        {/* Decorative element */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <div className="w-8 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
          <Sparkles className="w-3 h-3 text-gold/40" />
          <div className="w-8 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        </div>
      </motion.div>
    );
  };

  return (
    <>
      <div className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted/30">
            <TabsTrigger 
              value="weekly"
              className="data-[state=active]:bg-gold/20 data-[state=active]:text-foreground"
            >
              Tuần Qua
            </TabsTrigger>
            <TabsTrigger 
              value="monthly"
              className="data-[state=active]:bg-gold/20 data-[state=active]:text-foreground"
            >
              Tháng Qua
            </TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="mt-4">
            {renderDigestContent(weeklyDigest, isLoadingWeekly, "tuần qua", "weekly")}
          </TabsContent>

          <TabsContent value="monthly" className="mt-4">
            {renderDigestContent(monthlyDigest, isLoadingMonthly, "tháng qua", "monthly")}
          </TabsContent>
        </Tabs>
      </div>

      {/* Share Card Modal */}
      {shareDigest && (
        <DigestShareCard
          digest={shareDigest.digest}
          period={shareDigest.period}
          onClose={() => setShareDigest(null)}
        />
      )}
    </>
  );
};

export default GreetingDigest;