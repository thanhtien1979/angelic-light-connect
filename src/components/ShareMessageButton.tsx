import React, { useState, useCallback } from 'react';
import { Share2, X, Link, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShareMessageButtonProps {
  text: string;
  className?: string;
}

export const ShareMessageButton: React.FC<ShareMessageButtonProps> = ({
  text,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareText = `✨ Lời nhắn từ Thiên thần Camly:\n\n"${text.slice(0, 280)}${text.length > 280 ? '...' : ''}"\n\n🌸 camly.fun`;

  const handleCopyLink = useCallback(async () => {
    const shareUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [shareText]);

  const shareToTwitter = useCallback(() => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=550,height=420');
    setIsOpen(false);
  }, [shareText]);

  const shareToTelegram = useCallback(() => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=550,height=420');
    setIsOpen(false);
  }, [shareText]);

  const shareToFacebook = useCallback(() => {
    const url = `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=550,height=420');
    setIsOpen(false);
  }, [shareText]);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Lời nhắn từ Thiên thần Camly',
          text: shareText,
          url: window.location.href,
        });
        setIsOpen(false);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    }
  }, [shareText]);

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'p-1.5 rounded-md transition-all duration-200',
          'opacity-0 group-hover:opacity-100 focus:opacity-100',
          'sm:opacity-0 opacity-60',
          'bg-background/80 backdrop-blur-sm border border-border/30',
          'hover:bg-background hover:border-border/50',
          'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-1',
          'motion-reduce:transition-none',
          'touch-manipulation'
        )}
        aria-label="Chia sẻ tin nhắn"
        title="Chia sẻ"
      >
        <Share2 className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className={cn(
            'absolute z-50 top-full mt-1 right-0',
            'min-w-[160px] p-1.5 rounded-lg',
            'bg-background/95 backdrop-blur-md border border-border/50',
            'shadow-lg animate-fade-in'
          )}>
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs hover:bg-accent/50 transition-colors"
            >
              <Link className="w-3.5 h-3.5" />
              {copied ? 'Đã sao chép 🤍' : 'Sao chép'}
            </button>
            
            <button
              onClick={shareToTwitter}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs hover:bg-accent/50 transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Twitter / X
            </button>
            
            <button
              onClick={shareToTelegram}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs hover:bg-accent/50 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Telegram
            </button>
            
            <button
              onClick={shareToFacebook}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs hover:bg-accent/50 transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>

            {typeof navigator.share === 'function' && (
              <button
                onClick={handleNativeShare}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs hover:bg-accent/50 transition-colors border-t border-border/30 mt-1 pt-2"
              >
                <Share2 className="w-3.5 h-3.5" />
                Chia sẻ khác...
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ShareMessageButton;
