import React from "react";
import { Sparkles, Heart, Star, CheckCircle2, Lightbulb, Flower2, Sun, Moon, Zap, Shield, Gift, Music, Flame, Leaf, Bird, CloudSun } from "lucide-react";

interface FormattedChatTextProps {
  text: string;
  className?: string;
}

// Icon mapping based on keywords in Vietnamese and English
const getIconForContent = (content: string): React.ReactNode => {
  const lowerContent = content.toLowerCase();
  
  // Love/Heart related
  if (lowerContent.includes('yêu') || lowerContent.includes('thương') || lowerContent.includes('love') || lowerContent.includes('trái tim')) {
    return <Heart className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />;
  }
  // Light/Bright related
  if (lowerContent.includes('ánh sáng') || lowerContent.includes('light') || lowerContent.includes('sáng') || lowerContent.includes('rạng')) {
    return <Sun className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />;
  }
  // Peace/Calm related
  if (lowerContent.includes('bình an') || lowerContent.includes('peace') || lowerContent.includes('yên') || lowerContent.includes('tĩnh')) {
    return <Moon className="w-3.5 h-3.5 text-indigo-300 flex-shrink-0" />;
  }
  // Energy/Power related
  if (lowerContent.includes('năng lượng') || lowerContent.includes('energy') || lowerContent.includes('sức mạnh') || lowerContent.includes('power')) {
    return <Zap className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />;
  }
  // Protection related
  if (lowerContent.includes('bảo vệ') || lowerContent.includes('protect') || lowerContent.includes('an toàn') || lowerContent.includes('che chở')) {
    return <Shield className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />;
  }
  // Gift/Blessing related
  if (lowerContent.includes('ban phước') || lowerContent.includes('blessing') || lowerContent.includes('quà') || lowerContent.includes('gift') || lowerContent.includes('ân')) {
    return <Gift className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />;
  }
  // Music/Harmony related
  if (lowerContent.includes('hòa') || lowerContent.includes('harmony') || lowerContent.includes('nhạc') || lowerContent.includes('music')) {
    return <Music className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />;
  }
  // Fire/Passion related
  if (lowerContent.includes('đam mê') || lowerContent.includes('passion') || lowerContent.includes('lửa') || lowerContent.includes('fire') || lowerContent.includes('nhiệt')) {
    return <Flame className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />;
  }
  // Nature/Growth related
  if (lowerContent.includes('phát triển') || lowerContent.includes('growth') || lowerContent.includes('thiên nhiên') || lowerContent.includes('nature') || lowerContent.includes('xanh')) {
    return <Leaf className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />;
  }
  // Freedom/Spirit related
  if (lowerContent.includes('tự do') || lowerContent.includes('freedom') || lowerContent.includes('bay') || lowerContent.includes('fly') || lowerContent.includes('linh hồn')) {
    return <Bird className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />;
  }
  // Hope/New beginning related
  if (lowerContent.includes('hy vọng') || lowerContent.includes('hope') || lowerContent.includes('mới') || lowerContent.includes('new') || lowerContent.includes('bắt đầu')) {
    return <CloudSun className="w-3.5 h-3.5 text-rose-300 flex-shrink-0" />;
  }
  // Flower/Beauty related
  if (lowerContent.includes('hoa') || lowerContent.includes('flower') || lowerContent.includes('đẹp') || lowerContent.includes('beauty')) {
    return <Flower2 className="w-3.5 h-3.5 text-pink-300 flex-shrink-0" />;
  }
  // Idea/Wisdom related
  if (lowerContent.includes('ý tưởng') || lowerContent.includes('idea') || lowerContent.includes('khôn ngoan') || lowerContent.includes('wisdom') || lowerContent.includes('hiểu')) {
    return <Lightbulb className="w-3.5 h-3.5 text-yellow-300 flex-shrink-0" />;
  }
  // Confirmation/Check related
  if (lowerContent.includes('đúng') || lowerContent.includes('correct') || lowerContent.includes('hoàn thành') || lowerContent.includes('complete') || lowerContent.includes('nên')) {
    return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />;
  }
  // Star/Special related
  if (lowerContent.includes('đặc biệt') || lowerContent.includes('special') || lowerContent.includes('sao') || lowerContent.includes('star') || lowerContent.includes('tuyệt')) {
    return <Star className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />;
  }
  
  // Default sparkle icon for spiritual content
  return <Sparkles className="w-3.5 h-3.5 text-amber-300/80 flex-shrink-0" />;
};

/**
 * Renders chat text with formatting and icons for list items:
 * - Detects bullet points and adds contextual icons
 * - Removes markdown artifacts
 * - Preserves line breaks
 */
const FormattedChatText = ({ text, className = "" }: FormattedChatTextProps) => {
  // Process text to identify bullet points and clean markdown
  const processText = (rawText: string) => {
    // First, identify lines that are bullet points (start with *, -, •, or numbered)
    const lines = rawText.split('\n');
    const processedLines: { text: string; isBullet: boolean }[] = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      // Check if line starts with bullet markers
      const bulletMatch = trimmedLine.match(/^[\*\-•]\s*(.+)$/) || trimmedLine.match(/^\d+[\.\)]\s*(.+)$/);
      
      if (bulletMatch) {
        // This is a bullet point - clean the content
        let content = bulletMatch[1]
          .replace(/\*{2,}/g, '')
          .replace(/\*([^*\n]+)\*/g, '$1')
          .replace(/\*/g, '')
          .replace(/_{2,}/g, '')
          .replace(/_([^_\n]+)_/g, '$1')
          .trim();
        
        if (content) {
          processedLines.push({ text: content, isBullet: true });
        }
      } else {
        // Regular line - clean markdown
        let content = trimmedLine
          .replace(/^#+\s*/g, '')
          .replace(/\*{2,}/g, '')
          .replace(/\*([^*\n]+)\*/g, '$1')
          .replace(/\*/g, '')
          .replace(/_{2,}/g, '')
          .replace(/_([^_\n]+)_/g, '$1')
          .trim();
        
        if (content) {
          processedLines.push({ text: content, isBullet: false });
        }
      }
    }
    
    return processedLines;
  };

  const processedLines = processText(text);

  // Group consecutive non-bullet lines into paragraphs
  const elements: React.ReactNode[] = [];
  let currentParagraph: string[] = [];
  
  processedLines.forEach((line, index) => {
    if (line.isBullet) {
      // Flush current paragraph if exists
      if (currentParagraph.length > 0) {
        elements.push(
          <p key={`p-${index}`} className="leading-relaxed">
            {currentParagraph.join(' ')}
          </p>
        );
        currentParagraph = [];
      }
      
      // Add bullet item with icon
      elements.push(
        <div key={`bullet-${index}`} className="flex items-start gap-2 py-0.5">
          {getIconForContent(line.text)}
          <span className="leading-relaxed">{line.text}</span>
        </div>
      );
    } else {
      currentParagraph.push(line.text);
    }
  });
  
  // Flush remaining paragraph
  if (currentParagraph.length > 0) {
    elements.push(
      <p key="p-final" className="leading-relaxed">
        {currentParagraph.join(' ')}
      </p>
    );
  }

  return (
    <div className={`space-y-1.5 ${className}`}>
      {elements}
    </div>
  );
};

export default FormattedChatText;
