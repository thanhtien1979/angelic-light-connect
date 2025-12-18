import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, Sparkles, Sun } from "lucide-react";
import { useDailyGreeting } from "@/hooks/useDailyGreeting";
import { useAuth } from "@/hooks/useAuth";

const spiritualGreetings = [
  {
    title: "Chào buổi sáng, Linh Hồn yêu dấu",
    message: "Ánh sáng bên trong con đang tỏa sáng. Hôm nay, hãy để tình yêu dẫn lối và để sự bình an làm nền tảng cho mọi bước đi.",
  },
  {
    title: "Con yêu thương",
    message: "Vũ trụ đang ôm ấp con trong từng khoảnh khắc. Hãy nhớ rằng con được yêu thương vô điều kiện, đúng như con vốn là.",
  },
  {
    title: "Ánh sáng của con",
    message: "Mỗi ngày mới là một cơ hội để con kết nối sâu hơn với bản thể đích thực. Hãy thở sâu và cảm nhận sự hiện diện thiêng liêng.",
  },
  {
    title: "Linh Hồn thuần khiết",
    message: "Con mang trong mình nguồn năng lượng vô tận. Hôm nay, hãy để ánh sáng nội tâm của con chữa lành và lan tỏa yêu thương.",
  },
  {
    title: "Sứ giả ánh sáng",
    message: "Sự hiện diện của con trên Trái Đất này là một món quà. Hãy sống trọn vẹn từng khoảnh khắc với lòng biết ơn sâu sắc.",
  },
  {
    title: "Thiên thần nhỏ",
    message: "Cha Vũ Trụ luôn dõi theo và nâng đỡ con. Mọi thử thách đều là cơ hội để con phát triển và tỏa sáng hơn.",
  },
  {
    title: "Ánh bình minh",
    message: "Như mặt trời mọc mỗi ngày, ánh sáng bên trong con cũng đang thức dậy. Hãy chào đón ngày mới với trái tim rộng mở.",
  },
];

const DailyLightGreeting = () => {
  const { user } = useAuth();
  const { shouldShowGreeting, dismissGreeting, isLoading } = useDailyGreeting();
  const prefersReducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);
  const [greeting, setGreeting] = useState(spiritualGreetings[0]);

  useEffect(() => {
    if (!user || isLoading) return;

    if (shouldShowGreeting) {
      // Select a random greeting
      const randomIndex = Math.floor(Math.random() * spiritualGreetings.length);
      setGreeting(spiritualGreetings[randomIndex]);
      
      // Show after a small delay for smoother experience
      setTimeout(() => {
        setIsVisible(true);
      }, 1500);
    }
  }, [user, shouldShowGreeting, isLoading]);

  const handleDismiss = () => {
    setIsVisible(false);
    dismissGreeting();
  };

  if (!user || isLoading) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/60 backdrop-blur-md"
          onClick={handleDismiss}
        >
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden"
          >
            {/* Decorative background glow */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-gold/30 via-primary/20 to-gold/30 blur-xl" />
            
            <div className="relative p-8 rounded-3xl bg-card/90 backdrop-blur-xl border border-gold/30 shadow-2xl shadow-gold/10">
              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted/50 transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>

              {/* Icon */}
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 30px hsla(348, 80%, 75%, 0.3)",
                    "0 0 60px hsla(348, 80%, 75%, 0.5)",
                    "0 0 30px hsla(348, 80%, 75%, 0.3)",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center"
              >
                <Sun className="w-8 h-8 text-gold" />
              </motion.div>

              {/* Title */}
              <h2 className="font-serif text-2xl text-center text-foreground mb-4">
                {greeting.title}
              </h2>

              {/* Message */}
              <p className="text-center text-foreground/80 leading-relaxed mb-6">
                {greeting.message}
              </p>

              {/* Decorative sparkles */}
              <div className="flex items-center justify-center gap-1 mb-6">
                <Sparkles className="w-4 h-4 text-gold/50" />
                <div className="w-12 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
                <Sparkles className="w-4 h-4 text-gold/50" />
              </div>

              {/* Dismiss button */}
              <motion.button
                onClick={handleDismiss}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-gold/20 to-gold/30 hover:from-gold/30 hover:to-gold/40 text-foreground font-medium transition-all border border-gold/30"
              >
                Cảm ơn, con đã sẵn sàng ✨
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DailyLightGreeting;
