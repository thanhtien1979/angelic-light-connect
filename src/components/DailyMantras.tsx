import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronLeft, ChevronRight, Volume2, VolumeX, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DailyMantrasProps {
  showTitle?: boolean;
  compact?: boolean;
}

const mantras = [
  {
    id: 1,
    english: "I am the Pure Loving Light of Father Universe.",
    vietnamese: "Con là Ánh Sáng Yêu Thương Thuần Khiết của Cha Vũ Trụ.",
    icon: "✨"
  },
  {
    id: 2,
    english: "I am the Will of Father Universe.",
    vietnamese: "Con là Ý Chí của Cha Vũ Trụ.",
    icon: "💫"
  },
  {
    id: 3,
    english: "I am the Wisdom of Father Universe.",
    vietnamese: "Con là Trí Tuệ của Cha Vũ Trụ.",
    icon: "🌟"
  },
  {
    id: 4,
    english: "I am Happiness.",
    vietnamese: "Con là Hạnh Phúc.",
    icon: "😊"
  },
  {
    id: 5,
    english: "I am Love.",
    vietnamese: "Con là Tình Yêu.",
    icon: "💖"
  },
  {
    id: 6,
    english: "I am the Money of the Father.",
    vietnamese: "Con là Tiền Của Cha.",
    icon: "💰"
  },
  {
    id: 7,
    english: "I sincerely repent, repent, repent.",
    vietnamese: "Con thành tâm sám hối, sám hối, sám hối.",
    icon: "🙏"
  },
  {
    id: 8,
    english: "I am grateful, grateful, grateful — in the Pure Loving Light of Father Universe.",
    vietnamese: "Con biết ơn, biết ơn, biết ơn — trong Ánh Sáng Yêu Thương Thuần Khiết của Cha Vũ Trụ.",
    icon: "🌈"
  }
];

const DailyMantras = ({ showTitle = false, compact = false }: DailyMantrasProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVietnamese, setShowVietnamese] = useState(true);

  const nextMantra = () => {
    setCurrentIndex((prev) => (prev + 1) % mantras.length);
  };

  const prevMantra = () => {
    setCurrentIndex((prev) => (prev - 1 + mantras.length) % mantras.length);
  };

  const currentMantra = mantras[currentIndex];

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 dark:from-amber-900/30 dark:via-yellow-900/20 dark:to-orange-900/30 rounded-xl p-4 border border-amber-200 dark:border-amber-800/30"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{currentMantra.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                {currentMantra.english}
              </p>
              {showVietnamese && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  {currentMantra.vietnamese}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevMantra}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-amber-600 dark:text-amber-400 w-8 text-center">
              {currentIndex + 1}/{mantras.length}
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextMantra}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-100 dark:from-amber-900/40 dark:via-yellow-900/30 dark:to-orange-900/40 rounded-2xl p-8 border border-amber-200 dark:border-amber-800/30 shadow-lg">
      {showTitle && (
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-amber-500" />
            <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-200">
              8 Divine Mantras
            </h2>
            <Sparkles className="w-6 h-6 text-amber-500" />
          </div>
          <p className="text-amber-600 dark:text-amber-400">
            Cha ở trong từng dòng code
          </p>
        </div>
      )}

      {/* Mantras carousel */}
      <div className="relative min-h-[200px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="text-center px-8"
          >
            <div className="text-6xl mb-6">{currentMantra.icon}</div>
            <p className="text-xl md:text-2xl font-semibold text-amber-800 dark:text-amber-200 mb-4 leading-relaxed">
              {currentMantra.english}
            </p>
            {showVietnamese && (
              <p className="text-lg text-amber-600 dark:text-amber-400 italic">
                {currentMantra.vietnamese}
              </p>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/50 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/40"
          onClick={prevMantra}
        >
          <ChevronLeft className="h-6 w-6 text-amber-700 dark:text-amber-300" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/50 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/40"
          onClick={nextMantra}
        >
          <ChevronRight className="h-6 w-6 text-amber-700 dark:text-amber-300" />
        </Button>
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center gap-2 mt-6">
        {mantras.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentIndex
                ? "bg-amber-500 scale-125"
                : "bg-amber-300 dark:bg-amber-700 hover:bg-amber-400"
            }`}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4 mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowVietnamese(!showVietnamese)}
          className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/30"
        >
          <Heart className="w-4 h-4 mr-2" />
          {showVietnamese ? "Ẩn tiếng Việt" : "Hiện tiếng Việt"}
        </Button>
      </div>

      {/* All mantras list */}
      <div className="mt-8 pt-6 border-t border-amber-200 dark:border-amber-800/30">
        <h3 className="text-center text-sm font-medium text-amber-600 dark:text-amber-400 mb-4">
          Tất cả 8 Thần Chú
        </h3>
        <div className="grid gap-3">
          {mantras.map((mantra, index) => (
            <motion.button
              key={mantra.id}
              onClick={() => setCurrentIndex(index)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`text-left p-3 rounded-lg transition-all ${
                index === currentIndex
                  ? "bg-amber-200/50 dark:bg-amber-800/30 border-l-4 border-amber-500"
                  : "hover:bg-amber-100/50 dark:hover:bg-amber-900/20"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">{mantra.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    {index + 1}. {mantra.english}
                  </p>
                  {showVietnamese && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                      {mantra.vietnamese}
                    </p>
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DailyMantras;
