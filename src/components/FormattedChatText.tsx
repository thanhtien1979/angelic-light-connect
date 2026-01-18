import React from "react";

interface FormattedChatTextProps {
  text: string;
  className?: string;
}

/**
 * Renders chat text with basic formatting support:
 * - **text** or __text__ for bold
 * - *text* or _text_ for italic
 * - Line breaks preserved
 * - Removes markdown headers (#) and excess asterisks
 * - Adds proper paragraph breaks for better readability
 */
const FormattedChatText = ({ text, className = "" }: FormattedChatTextProps) => {
  // Clean up all markdown artifacts
  const cleanText = text
    .replace(/^#+\s*/gm, '') // Remove # headers
    .replace(/\*{2,}/g, '') // Remove multiple asterisks (bold markers)
    .replace(/\*([^*\n]+)\*/g, '$1') // Remove single asterisks around text
    .replace(/_{2,}/g, '') // Remove multiple underscores
    .replace(/_([^_\n]+)_/g, '$1') // Remove single underscores around text
    .replace(/\s{3,}/g, '\n\n') // Convert 3+ spaces to paragraph break
    .replace(/([.!?:])\s+(?=[A-ZÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬĐÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴ])/g, '$1\n\n') // Add paragraph break after sentence endings before capital letters
    .trim();

  // Split by double newlines for paragraphs, single newlines for line breaks
  const paragraphs = cleanText.split(/\n\n+/);

  return (
    <div className={`space-y-3 ${className}`}>
      {paragraphs.map((paragraph, pIndex) => {
        const lines = paragraph.split('\n');
        
        return (
          <p key={pIndex} className="first-letter:ml-4 leading-relaxed">
            {lines.map((line, lineIndex) => (
              <React.Fragment key={lineIndex}>
                <span>{line}</span>
                {lineIndex < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
};

export default FormattedChatText;
