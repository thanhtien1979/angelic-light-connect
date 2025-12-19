import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Coins, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useCamlyCoin } from "@/hooks/useCamlyCoin";
import { useAuth } from "@/hooks/useAuth";

interface LowCreditWarningProps {
  threshold?: number;
  showBanner?: boolean;
}

export default function LowCreditWarning({ 
  threshold = 5, 
  showBanner = true 
}: LowCreditWarningProps) {
  const { user } = useAuth();
  const { balance, isLoading } = useCamlyCoin();
  const [dismissed, setDismissed] = useState(false);
  const [hasShownToast, setHasShownToast] = useState(false);

  const isLowCredits = !isLoading && user && balance.total_coins < threshold && balance.total_coins >= 0;

  useEffect(() => {
    // Reset dismissed state when balance changes significantly
    if (balance.total_coins >= threshold) {
      setDismissed(false);
      setHasShownToast(false);
    }
  }, [balance.total_coins, threshold]);

  if (!showBanner || !isLowCredits || dismissed || isLoading) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="relative bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-500/30 rounded-lg p-4"
      >
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-background/50 transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-amber-500/20 flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-foreground mb-1">
              Credits sắp hết!
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              Bạn chỉ còn <span className="font-semibold text-amber-600">{balance.total_coins}</span> credits. 
              Nạp thêm để tiếp tục tạo hình ảnh thiêng liêng.
            </p>
            
            <Link to="/credits">
              <Button size="sm" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90">
                <Coins className="w-4 h-4 mr-2" />
                Nạp Credits
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
