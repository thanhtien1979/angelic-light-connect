import React from "react";
import { Sparkles, Heart, Star, CheckCircle2, Lightbulb, Flower2, Sun, Moon, Zap, Shield } from "lucide-react";

interface FormattedChatTextProps {
  text: string;
  className?: string;
}

// Icon mapping based on keywords in Vietnamese and English
const getIconForContent = (content: string) => {
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
  
  // Default sparkle icon
  return <Sparkles className="w-3.5 h-3.5 text-amber-300/80 flex-shrink-0" />;
};

/**
 * Renders chat text with formatting and icons for list items
 */
const FormattedChatText = ({ text, className = "" }: FormattedChatTextProps) => {
  if (!text) {
    return null;
  }

  // Process text to identify bullet points and clean markdown
  const lines = text.split('\n');
  const elements: React.ReactElement[] = [];
  let currentParagraph: string[] = [];
  let elementIndex = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Check if line starts with bullet markers
    const bulletMatch = trimmedLine.match(/^[\*\-•]\s*(.+)$/) || trimmedLine.match(/^\d+[\.\)]\s*(.+)$/);
    
    if (bulletMatch) {
      // Flush current paragraph if exists
      if (currentParagraph.length > 0) {
        elements.push(
          <p key={`p-${elementIndex++}`} className="leading-relaxed">
            {currentParagraph.join(' ')}
          </p>
        );
        currentParagraph = [];
      }
      
      // Clean the bullet content
      const content = bulletMatch[1]
        .replace(/\*{2,}/g, '')
        .replace(/\*([^*\n]+)\*/g, '$1')
        .replace(/\*/g, '')
        .replace(/_{2,}/g, '')
        .replace(/_([^_\n]+)_/g, '$1')
        .trim();
      
      if (content) {
        elements.push(
          <div key={`bullet-${elementIndex++}`} className="flex items-start gap-2 py-0.5">
            {getIconForContent(content)}
            <span className="leading-relaxed">{content}</span>
          </div>
        );
      }
    } else if (trimmedLine) {
      // Regular line - clean markdown and add to paragraph
      const content = trimmedLine
        .replace(/^#+\s*/g, '')
        .replace(/\*{2,}/g, '')
        .replace(/\*([^*\n]+)\*/g, '$1')
        .replace(/\*/g, '')
        .replace(/_{2,}/g, '')
        .replace(/_([^_\n]+)_/g, '$1')
        .trim();
      
      if (content) {
        currentParagraph.push(content);
      }
    }
  }
  
  // Flush remaining paragraph
  if (currentParagraph.length > 0) {
    elements.push(
      <p key={`p-${elementIndex++}`} className="leading-relaxed">
        {currentParagraph.join(' ')}
      </p>
    );
  }

  if (elements.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-1.5 ${className}`}>
      {elements}
    </div>
  );
};

export default FormattedChatText;
