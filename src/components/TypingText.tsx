import { useState, useEffect, useRef, memo } from "react";

interface TypingTextProps {
  text: string;
  className?: string;
  speed?: number; // ms per character
  delay?: number; // initial delay before starting
  onComplete?: () => void;
}

const TypingText = memo(({ 
  text, 
  className = "", 
  speed = 40, 
  delay = 0,
  onComplete 
}: TypingTextProps) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const frameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const indexRef = useRef<number>(0);

  useEffect(() => {
    setDisplayedText("");
    setIsComplete(false);
    indexRef.current = 0;
    lastTimeRef.current = 0;

    const startTimeout = setTimeout(() => {
      const animate = (time: number) => {
        if (lastTimeRef.current === 0) lastTimeRef.current = time;
        
        const elapsed = time - lastTimeRef.current;
        
        if (elapsed >= speed) {
          if (indexRef.current < text.length) {
            indexRef.current++;
            setDisplayedText(text.slice(0, indexRef.current));
            lastTimeRef.current = time;
            frameRef.current = requestAnimationFrame(animate);
          } else {
            setIsComplete(true);
            onComplete?.();
          }
        } else {
          frameRef.current = requestAnimationFrame(animate);
        }
      };
      
      frameRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(startTimeout);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [text, speed, delay, onComplete]);

  return (
    <span className={className}>
      {displayedText}
      {!isComplete && (
        <span
          className="inline-block w-0.5 h-[1em] bg-current ml-0.5 align-middle animate-pulse"
        />
      )}
    </span>
  );
});

TypingText.displayName = "TypingText";

export default TypingText;
