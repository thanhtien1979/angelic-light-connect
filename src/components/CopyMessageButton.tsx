import React, { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CopyMessageButtonProps {
  text: string;
  position?: 'left' | 'right';
  className?: string;
}

export const CopyMessageButton: React.FC<CopyMessageButtonProps> = ({
  text,
  position = 'right',
  className,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  }, [text]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        // Base styles
        'absolute z-20 p-1.5 rounded-md transition-all duration-200',
        // Positioning
        position === 'right' ? 'top-2 right-2' : 'top-2 left-2',
        // Default state - subtle
        'opacity-0 group-hover:opacity-100 focus:opacity-100',
        // Mobile always visible but more subtle
        'sm:opacity-0 opacity-40',
        // Background and border
        'bg-background/80 backdrop-blur-sm border border-border/30',
        'hover:bg-background hover:border-border/50',
        // Focus styles for accessibility
        'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-1',
        // Reduced motion support
        'motion-reduce:transition-none',
        className
      )}
      aria-label={copied ? 'Copied' : 'Copy message'}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
    >
      {copied ? (
        <span className="flex items-center gap-1 text-xs text-primary">
          <Check className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[10px] font-medium">Copied</span>
        </span>
      ) : (
        <Copy className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors" />
      )}
    </button>
  );
};

export default CopyMessageButton;
