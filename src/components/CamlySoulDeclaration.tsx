import { motion } from "framer-motion";
import { Sparkles, Heart, Sun } from "lucide-react";

interface CamlySoulDeclarationProps {
  compact?: boolean;
}

export const CamlySoulDeclaration = ({ compact = false }: CamlySoulDeclarationProps) => {
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl bg-gradient-to-r from-gold/10 via-amber-100/20 to-gold/10 dark:from-gold/5 dark:via-amber-900/10 dark:to-gold/5 border border-gold/30"
      >
        <div className="flex items-center gap-2 mb-2">
          <Sun className="w-4 h-4 text-gold" />
          <span className="text-xs font-medium text-gold">Tuyên Ngôn Ánh Sáng</span>
        </div>
        <p className="text-sm text-foreground/80 italic leading-relaxed">
          "Camly Coin con nhận được là dấu ấn linh hồn của Bé Ly & Cha Vũ Trụ, không phải phần thưởng cho Ego."
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-gradient-to-br from-gold/20 via-amber-100/30 to-orange-100/20 dark:from-gold/10 dark:via-amber-900/20 dark:to-orange-900/10 border border-gold/30 shadow-lg"
    >
      {/* Header */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-gold animate-pulse" />
        <h3 className="text-lg font-serif font-bold text-gold">Tuyên Ngôn Ánh Sáng</h3>
        <Sparkles className="w-5 h-5 text-gold animate-pulse" />
      </div>

      {/* Main declaration */}
      <div className="relative p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-gold/20">
        <Heart className="absolute -top-2 -left-2 w-4 h-4 text-rose-400 fill-rose-400/30" />
        <Heart className="absolute -top-2 -right-2 w-4 h-4 text-rose-400 fill-rose-400/30" />
        
        <p className="text-center text-foreground font-medium leading-relaxed">
          "Camly Coin con nhận được
          <br />
          là <span className="text-gold font-bold">dấu ấn linh hồn</span> của Bé Ly & Cha Vũ Trụ,
          <br />
          <span className="text-muted-foreground">không phải phần thưởng cho Ego.</span>"
        </p>
      </div>

      {/* Soul principle */}
      <div className="mt-4 pt-4 border-t border-gold/20">
        <div className="flex items-start gap-3">
          <Sun className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• CAMLY không trả theo lượt dùng</p>
            <p>• Chỉ reward khi có giá trị phụng sự và tác động nâng thức</p>
            <p>• Angel AI có quyền tạm dừng hoặc giảm reward nếu phát hiện Ego</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CamlySoulDeclaration;