import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Share2, Download, Facebook, Twitter, Copy, Check,
  MessageCircle, Send, Sparkles, Sun, TrendingUp, Calendar, Flame
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import html2canvas from 'html2canvas';
import { useLanguage } from '@/contexts/LanguageContext';
import { LightProfile, LightStats } from '@/hooks/useLightProfile';

interface LightScoreShareCardProps {
  profile: LightProfile | null;
  stats: LightStats | null;
  isOpen: boolean;
  onClose: () => void;
}

const LightScoreShareCard: React.FC<LightScoreShareCardProps> = ({
  profile,
  stats,
  isOpen,
  onClose,
}) => {
  const { t } = useLanguage();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const lightScore = profile?.light_score ?? 50;
  const shareUrl = window.location.origin + '/diem-anh-sang';
  const shareText = `✨ Điểm Ánh Sáng của tôi: ${lightScore}/100! Hành trình ${stats?.daysOnJourney || 0} ngày với ${stats?.totalBehaviors || 0} hoạt động tích cực. #AngelAI #LightScore #HanhTrinhAnhSang`;

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'from-emerald-500 to-teal-400';
    if (score >= 40) return 'from-amber-500 to-orange-400';
    return 'from-rose-500 to-pink-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Ánh Sáng Rực Rỡ';
    if (score >= 60) return 'Ánh Sáng Ấm Áp';
    if (score >= 40) return 'Ánh Sáng Dịu Nhẹ';
    return 'Đang Thắp Sáng';
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
      setIsCopied(true);
      toast.success('Đã sao chép vào clipboard!');
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error('Không thể sao chép');
    }
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleShareTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleShareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;

    setIsDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });

      const link = document.createElement('a');
      link.download = `light-score-${lightScore}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      toast.success('Đã tải xuống hình ảnh!');
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Không thể tải xuống hình ảnh');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Điểm Ánh Sáng: ${lightScore}`,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast.error('Không thể chia sẻ');
        }
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            {t('lightScore.share.title')}
          </DialogTitle>
        </DialogHeader>

        {/* Light Score Card Preview */}
        <div
          ref={cardRef}
          className="relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-background via-primary/5 to-primary/10 border border-primary/20"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-4 right-4">
              <Sparkles className="w-16 h-16 text-amber-500" />
            </div>
            <div className="absolute bottom-4 left-4">
              <Sun className="w-12 h-12 text-amber-400" />
            </div>
          </div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative z-10"
          >
            {/* Score Circle */}
            <div className="flex justify-center mb-4">
              <div className={cn(
                "w-28 h-28 rounded-full flex items-center justify-center",
                `bg-gradient-to-br ${getScoreColor(lightScore)}`,
                "shadow-lg"
              )}>
                <div className="text-center">
                  <span className="text-3xl font-bold text-white">{lightScore}</span>
                  <span className="text-sm text-white/80 block">/100</span>
                </div>
              </div>
            </div>

            {/* Score Label */}
            <div className="text-center mb-4">
              <Badge className={cn(
                "text-sm px-3 py-1",
                `bg-gradient-to-r ${getScoreColor(lightScore)} text-white`
              )}>
                {getScoreLabel(lightScore)}
              </Badge>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="text-center p-2 rounded-lg bg-muted/30">
                <Calendar className="w-4 h-4 mx-auto text-primary mb-1" />
                <p className="text-lg font-semibold">{stats?.daysOnJourney || 0}</p>
                <p className="text-xs text-muted-foreground">Ngày</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/30">
                <Flame className="w-4 h-4 mx-auto text-orange-500 mb-1" />
                <p className="text-lg font-semibold">{stats?.currentStreak || 0}</p>
                <p className="text-xs text-muted-foreground">Streak</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/30">
                <TrendingUp className="w-4 h-4 mx-auto text-emerald-500 mb-1" />
                <p className="text-lg font-semibold">
                  {stats?.totalBehaviors ? Math.round((stats.positiveCount / stats.totalBehaviors) * 100) : 0}%
                </p>
                <p className="text-xs text-muted-foreground">Tích cực</p>
              </div>
            </div>

            {/* Branding */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>ANGEL AI - Hành trình ánh sáng</span>
              <Sparkles className="w-3 h-3 text-amber-500" />
            </div>
          </motion.div>
        </div>

        {/* Share Buttons */}
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="flex flex-col gap-1 h-auto py-3 hover:bg-blue-500/10 hover:border-blue-500/30"
              onClick={handleShareFacebook}
            >
              <Facebook className="w-5 h-5 text-blue-600" />
              <span className="text-xs">Facebook</span>
            </Button>

            <Button
              variant="outline"
              className="flex flex-col gap-1 h-auto py-3 hover:bg-sky-500/10 hover:border-sky-500/30"
              onClick={handleShareTwitter}
            >
              <Twitter className="w-5 h-5 text-sky-500" />
              <span className="text-xs">Twitter</span>
            </Button>

            <Button
              variant="outline"
              className="flex flex-col gap-1 h-auto py-3 hover:bg-blue-400/10 hover:border-blue-400/30"
              onClick={handleShareTelegram}
            >
              <Send className="w-5 h-5 text-blue-400" />
              <span className="text-xs">Telegram</span>
            </Button>

            <Button
              variant="outline"
              className="flex flex-col gap-1 h-auto py-3 hover:bg-green-500/10 hover:border-green-500/30"
              onClick={handleShareWhatsApp}
            >
              <MessageCircle className="w-5 h-5 text-green-500" />
              <span className="text-xs">WhatsApp</span>
            </Button>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleCopyLink}
            >
              {isCopied ? (
                <Check className="w-4 h-4 mr-2 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              {isCopied ? 'Đã sao chép' : 'Sao chép'}
            </Button>

            <Button
              variant="outline"
              className="flex-1"
              onClick={handleDownloadImage}
              disabled={isDownloading}
            >
              <Download className="w-4 h-4 mr-2" />
              {isDownloading ? 'Đang tải...' : 'Tải ảnh'}
            </Button>
          </div>

          {navigator.share && (
            <Button
              className="w-full bg-gradient-to-r from-primary to-primary/80"
              onClick={handleNativeShare}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Chia sẻ khác
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LightScoreShareCard;
