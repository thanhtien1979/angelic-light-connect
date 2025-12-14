import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface TypingTextProps {
  text: string;
  className?: string;
  speed?: number; // ms per character
  delay?: number; // initial delay before starting
  onComplete?: () => void;
}

const TypingText = ({ 
  text, 
  className = "", 
  speed = 40, 
  delay = 0,
  onComplete 
}: TypingTextProps) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayedText("");
    setIsComplete(false);

    const startTimeout = setTimeout(() => {
      let currentIndex = 0;
      
      const typingInterval = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
          setIsComplete(true);
          onComplete?.();
        }
      }, speed);

      return () => clearInterval(typingInterval);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [text, speed, delay, onComplete]);

  return (
    <span className={className}>
      {displayedText}
      {!isComplete && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="inline-block w-0.5 h-[1em] bg-current ml-0.5 align-middle"
        />
      )}
    </span>
  );
};

export default TypingText;
