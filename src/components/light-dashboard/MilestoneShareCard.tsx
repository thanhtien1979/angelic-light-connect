import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Share2, Download, Facebook, Twitter, Copy, Check,
  MessageCircle, Send, Sparkles, Crown, Flame, Heart,
  Users, Sun, Calendar, Shield
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
import { LightMilestone } from '@/hooks/useLightProfile';

interface MilestoneShareCardProps {
  milestone: LightMilestone | null;
  isOpen: boolean;
  onClose: () => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  sparkles: Sparkles,
  flame: Flame,
  heart: Heart,
  users: Users,
  sun: Sun,
  calendar: Calendar,
  shield: Shield,
  crown: Crown,
};

const typeColors: Record<string, string> = {
  score: 'from-emerald-500 to-teal-400',
  streak: 'from-orange-500 to-amber-400',
  behavior: 'from-purple-500 to-pink-400',
  journey: 'from-blue-500 to-cyan-400',
};

const typeLabels: Record<string, string> = {
  score: 'Điểm Sáng',
  streak: 'Chuỗi Ngày',
  behavior: 'Hoạt Động',
  journey: 'Hành Trình',
};

const MilestoneShareCard: React.FC<MilestoneShareCardProps> = ({
  milestone,
  isOpen,
  onClose,
}) => {
  const { t } = useLanguage();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!milestone) return null;

  const shareUrl = window.location.origin + '/diem-anh-sang';
  const shareText = `🏆 Tôi vừa đạt được cột mốc "${milestone.title}" trên ANGEL AI! ${milestone.description} ✨ #AngelAI #Milestone #HanhTrinhAnhSang`;

  const IconComponent = iconMap[milestone.icon] || Sparkles;
  const gradientColor = typeColors[milestone.type] || 'from-amber-500 to-orange-400';
  const typeLabel = typeLabels[milestone.type] || 'Thành Tựu';

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
      link.download = `milestone-${milestone.id}.png`;
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
          title: `Cột mốc: ${milestone.title}`,
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
            {t('lightScore.share.milestone')}
          </DialogTitle>
        </DialogHeader>

        {/* Milestone Card Preview */}
        <div
          ref={cardRef}
          className="relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-background via-primary/5 to-primary/10 border border-primary/20"
        >
          {/* Decorative sparkles */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-3 right-3">
              <Crown className="w-12 h-12 text-amber-500" />
            </div>
            <div className="absolute bottom-3 left-3">
              <Sparkles className="w-10 h-10 text-amber-400" />
            </div>
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
          </div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative z-10 text-center"
          >
            {/* Type Badge */}
            <Badge className={cn(
              "mb-4 text-sm",
              `bg-gradient-to-r ${gradientColor} text-white`
            )}>
              🏆 {typeLabel}
            </Badge>

            {/* Icon Circle */}
            <div className="mb-4">
              <div className={cn(
                "w-24 h-24 mx-auto rounded-full flex items-center justify-center",
                `bg-gradient-to-br ${gradientColor}`,
                "shadow-lg shadow-amber-500/20"
              )}>
                <IconComponent className="w-12 h-12 text-white" />
              </div>
            </div>

            {/* Milestone Title */}
            <h3 className="text-xl font-bold text-foreground mb-2">
              {milestone.title}
            </h3>

            {/* Milestone Description */}
            <p className="text-sm text-muted-foreground mb-4 max-w-xs mx-auto">
              {milestone.description}
            </p>

            {/* Achievement Status */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                Đã hoàn thành
              </span>
            </div>

            {/* Branding */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-4">
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

export default MilestoneShareCard;
