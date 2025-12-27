import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Share2, Download, Facebook, Twitter, Copy, Check,
  MessageCircle, Send, Sparkles
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
import { Achievement } from '@/hooks/useAchievements';
import { cn } from '@/lib/utils';
import html2canvas from 'html2canvas';

interface AchievementShareDialogProps {
  achievement: Achievement | null;
  isOpen: boolean;
  onClose: () => void;
}

const tierColors = {
  bronze: 'from-amber-600 to-amber-400',
  silver: 'from-slate-400 to-slate-200',
  gold: 'from-yellow-500 to-yellow-300',
  diamond: 'from-cyan-400 to-purple-400',
};

const tierLabels = {
  bronze: 'Đồng',
  silver: 'Bạc',
  gold: 'Vàng',
  diamond: 'Kim cương',
};

const AchievementShareDialog: React.FC<AchievementShareDialogProps> = ({
  achievement,
  isOpen,
  onClose,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!achievement) return null;

  const shareText = `🏆 Tôi vừa mở khóa thành tựu "${achievement.name}" trên Camly! ${achievement.description} ✨ #Camly #Achievement #MindfulnessJourney`;
  const shareUrl = window.location.origin;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
      setIsCopied(true);
      toast.success('Đã sao chép vào clipboard!');
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
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
      link.download = `camly-achievement-${achievement.id}.png`;
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
          title: `Thành tựu: ${achievement.name}`,
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
            Chia sẻ thành tựu
          </DialogTitle>
        </DialogHeader>

        {/* Achievement Card Preview */}
        <div 
          ref={cardRef}
          className="relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-background via-primary/5 to-primary/10 border border-primary/20"
        >
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-4 right-4">
              <Sparkles className="w-20 h-20 text-gold" />
            </div>
          </div>
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative z-10 text-center"
          >
            <div className="mb-4">
              <div className={cn(
                "w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl shadow-lg",
                `bg-gradient-to-br ${tierColors[achievement.tier]}`
              )}>
                {achievement.icon}
              </div>
            </div>
            
            <Badge className={cn(
              "mb-3",
              `bg-gradient-to-r ${tierColors[achievement.tier]} text-white`
            )}>
              {tierLabels[achievement.tier]}
            </Badge>
            
            <h3 className="text-xl font-bold text-foreground mb-2">
              {achievement.name}
            </h3>
            
            <p className="text-sm text-muted-foreground mb-4">
              {achievement.description}
            </p>
            
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="w-3 h-3 text-gold" />
              <span>Camly - Hành trình ánh sáng</span>
              <Sparkles className="w-3 h-3 text-gold" />
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

export default AchievementShareDialog;
