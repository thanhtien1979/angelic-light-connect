import React, { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CopyMessageButtonProps {
  text: string;
  position?: 'left' | 'right';
  className?: string;
}

// Fallback for Safari/older browsers
const fallbackCopyToClipboard = (text: string): boolean => {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  textarea.style.top = '-9999px';
  textarea.setAttribute('readonly', '');
  document.body.appendChild(textarea);
  
  // iOS Safari requires special handling
  const range = document.createRange();
  range.selectNodeContents(textarea);
  const selection = window.getSelection();
  if (selection) {
    selection.removeAllRanges();
    selection.addRange(range);
  }
  textarea.setSelectionRange(0, text.length);
  
  let success = false;
  try {
    success = document.execCommand('copy');
  } catch (err) {
    console.error('Fallback copy failed:', err);
  }
  
  document.body.removeChild(textarea);
  return success;
};

// Clean markdown formatting from text for copying
const cleanTextForCopy = (text: string): string => {
  return text
    .replace(/\*{2,}/g, '') // Remove multiple asterisks
    .replace(/\*([^*]+)\*/g, '$1') // Remove single asterisks around text
    .replace(/_{2,}/g, '') // Remove multiple underscores
    .replace(/_([^_]+)_/g, '$1') // Remove single underscores around text
    .replace(/^#+\s*/gm, '') // Remove markdown headers
    .replace(/^\s*[-•]\s*/gm, '• ') // Clean bullet points
    .replace(/\n{3,}/g, '\n\n') // Max 2 newlines
    .replace(/[ \t]{2,}/g, ' ') // Clean up extra spaces within lines
    .trim();
};

export const CopyMessageButton: React.FC<CopyMessageButtonProps> = ({
  text,
  position = 'right',
  className,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    const cleanedText = cleanTextForCopy(text);
    let success = false;
    
    // Try modern Clipboard API first
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try {
        await navigator.clipboard.writeText(cleanedText);
        success = true;
      } catch (err) {
        console.warn('Clipboard API failed, trying fallback:', err);
        success = fallbackCopyToClipboard(cleanedText);
      }
    } else {
      // Use fallback for Safari/older browsers
      success = fallbackCopyToClipboard(cleanedText);
    }
    
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }, [text]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        'absolute z-20 p-1.5 rounded-md transition-all duration-200',
        position === 'right' ? 'top-2 right-2' : 'top-2 left-2',
        'opacity-0 group-hover:opacity-100 focus:opacity-100',
        'sm:opacity-0 opacity-60',
        'bg-background/80 backdrop-blur-sm border border-border/30',
        'hover:bg-background hover:border-border/50',
        'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-1',
        'motion-reduce:transition-none',
        'touch-manipulation',
        className
      )}
      aria-label={copied ? 'Đã sao chép' : 'Sao chép tin nhắn'}
      title={copied ? 'Đã sao chép 🤍' : 'Sao chép'}
    >
      {copied ? (
        <span className="flex items-center gap-1 text-xs text-primary whitespace-nowrap">
          <Check className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="text-[10px] font-medium">Đã sao chép 🤍</span>
        </span>
      ) : (
        <Copy className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors" />
      )}
    </button>
  );
};

export default CopyMessageButton;
