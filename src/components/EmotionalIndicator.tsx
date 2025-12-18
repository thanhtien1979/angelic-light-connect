import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";

export type EmotionalTone = "neutral" | "sadness" | "anxiety" | "joy" | "gratitude" | "calm";

interface EmotionalIndicatorProps {
  message: string;
  visible: boolean;
  onFadeComplete?: () => void;
}

// Emotion detection keywords (Vietnamese)
const emotionKeywords: Record<EmotionalTone, string[]> = {
  sadness: [
    "buồn", "đau", "khóc", "mất", "cô đơn", "trống rỗng", "thất vọng", 
    "tuyệt vọng", "mệt mỏi", "kiệt sức", "nặng nề", "đau khổ", "nhớ",
    "chia tay", "mất mát", "khổ", "sầu", "u buồn", "tan vỡ", "rạn nứt"
  ],
  anxiety: [
    "lo", "sợ", "bất an", "căng thẳng", "stress", "hoang mang", "rối",
    "áp lực", "hồi hộp", "run", "không yên", "bồn chồn", "lo lắng",
    "hoảng", "panic", "bối rối", "không chắc", "sợ hãi", "ngại"
  ],
  joy: [
    "vui", "hạnh phúc", "sung sướng", "tuyệt vời", "amazing", "yêu đời",
    "phấn khởi", "hào hứng", "excited", "happy", "tươi", "cười", "hân hoan",
    "rạng rỡ", "sáng", "lạc quan", "hy vọng", "may mắn", "thích"
  ],
  gratitude: [
    "cảm ơn", "biết ơn", "tri ân", "cám ơn", "thank", "grateful",
    "trân trọng", "quý", "đánh giá cao", "phước", "ban", "ơn", "blessed"
  ],
  calm: [
    "bình an", "thanh thản", "yên bình", "tĩnh lặng", "hít thở", "thiền",
    "meditation", "relax", "thư giãn", "an nhiên", "an lạc", "tĩnh tâm",
    "nhẹ nhàng", "êm đềm", "hòa bình", "peace"
  ],
  neutral: []
};

// Detect emotional tone from message
export function detectEmotion(message: string): EmotionalTone {
  if (!message.trim()) return "neutral";
  
  const lowerMessage = message.toLowerCase();
  const emotionScores: Record<EmotionalTone, number> = {
    sadness: 0,
    anxiety: 0,
    joy: 0,
    gratitude: 0,
    calm: 0,
    neutral: 0
  };
  
  // Calculate scores based on keyword matches
  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    if (emotion === "neutral") continue;
    for (const keyword of keywords) {
      if (lowerMessage.includes(keyword)) {
        emotionScores[emotion as EmotionalTone] += 1;
      }
    }
  }
  
  // Find highest scoring emotion
  let maxScore = 0;
  let detectedEmotion: EmotionalTone = "neutral";
  
  for (const [emotion, score] of Object.entries(emotionScores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedEmotion = emotion as EmotionalTone;
    }
  }
  
  return maxScore > 0 ? detectedEmotion : "neutral";
}

// Emotion visual config - gentle symbols and colors
const emotionConfig: Record<EmotionalTone, {
  symbol: string;
  glowColor: string;
  bgGradient: string;
}> = {
  sadness: {
    symbol: "💧",
    glowColor: "hsla(210, 60%, 70%, 0.6)",
    bgGradient: "linear-gradient(135deg, hsla(210, 50%, 85%, 0.4), hsla(220, 45%, 90%, 0.3))"
  },
  anxiety: {
    symbol: "🌀",
    glowColor: "hsla(35, 70%, 65%, 0.5)",
    bgGradient: "linear-gradient(135deg, hsla(35, 60%, 85%, 0.4), hsla(40, 55%, 90%, 0.3))"
  },
  joy: {
    symbol: "☀️",
    glowColor: "hsla(45, 90%, 65%, 0.6)",
    bgGradient: "linear-gradient(135deg, hsla(45, 80%, 85%, 0.4), hsla(50, 75%, 90%, 0.3))"
  },
  gratitude: {
    symbol: "🙏",
    glowColor: "hsla(348, 70%, 75%, 0.6)",
    bgGradient: "linear-gradient(135deg, hsla(348, 60%, 88%, 0.4), hsla(340, 55%, 92%, 0.3))"
  },
  calm: {
    symbol: "🕊️",
    glowColor: "hsla(270, 40%, 80%, 0.5)",
    bgGradient: "linear-gradient(135deg, hsla(270, 30%, 92%, 0.4), hsla(280, 25%, 95%, 0.3))"
  },
  neutral: {
    symbol: "",
    glowColor: "transparent",
    bgGradient: "transparent"
  }
};

const EmotionalIndicator = ({ message, visible, onFadeComplete }: EmotionalIndicatorProps) => {
  const emotion = useMemo(() => detectEmotion(message), [message]);
  const config = emotionConfig[emotion];
  
  // Don't render if neutral or no valid emotion
  if (emotion === "neutral" || !config.symbol) {
    return null;
  }
  
  return (
    <AnimatePresence onExitComplete={onFadeComplete}>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.5 } }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative"
        >
          {/* Glow background */}
          <motion.div
            className="absolute -inset-1 rounded-full blur-md"
            style={{ background: config.glowColor }}
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.4, 0.6, 0.4]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* Symbol container */}
          <div 
            className="relative w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30"
            style={{ background: config.bgGradient }}
          >
            <span className="text-base">{config.symbol}</span>
          </div>
          
          {/* Subtle pulse ring */}
          <motion.div
            className="absolute inset-0 rounded-full border"
            style={{ borderColor: config.glowColor }}
            animate={{
              scale: [1, 1.4],
              opacity: [0.5, 0]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EmotionalIndicator;
