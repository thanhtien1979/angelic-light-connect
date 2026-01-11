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

  // Parse and render formatted text
  const renderFormattedText = (content: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let remaining = content;
    let keyIndex = 0;

    while (remaining.length > 0) {
      // Match bold (**text** or __text__)
      const boldMatch = remaining.match(/^(\*\*|__)(.+?)\1/);
      if (boldMatch) {
        parts.push(
          <strong key={keyIndex++} className="font-semibold">
            {boldMatch[2]}
          </strong>
        );
        remaining = remaining.slice(boldMatch[0].length);
        continue;
      }

      // Match italic (*text* or _text_) - but not inside words
      const italicMatch = remaining.match(/^(\*|_)([^*_]+?)\1(?![a-zA-Z0-9])/);
      if (italicMatch) {
        parts.push(
          <em key={keyIndex++} className="italic">
            {italicMatch[2]}
          </em>
        );
        remaining = remaining.slice(italicMatch[0].length);
        continue;
      }

      // Find next potential format marker
      const nextMarker = remaining.search(/(\*\*|__|\*|_)/);
      
      if (nextMarker === -1) {
        // No more markers, add rest as plain text
        parts.push(<span key={keyIndex++}>{remaining}</span>);
        break;
      } else if (nextMarker === 0) {
        // Marker at start but didn't match pattern, treat as plain text
        parts.push(<span key={keyIndex++}>{remaining[0]}</span>);
        remaining = remaining.slice(1);
      } else {
        // Add text before next marker
        parts.push(<span key={keyIndex++}>{remaining.slice(0, nextMarker)}</span>);
        remaining = remaining.slice(nextMarker);
      }
    }

    return parts;
  };

  // Split by line breaks and render each line
  const lines = cleanText.split('\n');

  return (
    <span className={className}>
      {lines.map((line, lineIndex) => (
        <React.Fragment key={lineIndex}>
          {renderFormattedText(line)}
          {lineIndex < lines.length - 1 && <br />}
        </React.Fragment>
      ))}
    </span>
  );
};

export default FormattedChatText;
