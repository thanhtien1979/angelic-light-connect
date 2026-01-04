import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, X, Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";

const WalletLinkBanner = () => {
  const { user } = useAuth();
  const { walletAddress, isLoading, connectWallet, isConnecting } = useWallet();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  // Check if banner was dismissed today or permanently
  useEffect(() => {
    const dismissedPermanently = localStorage.getItem("wallet_banner_dismissed_permanently");
    if (dismissedPermanently === "true") {
      setIsDismissed(true);
      return;
    }
    
    const dismissedDate = localStorage.getItem("wallet_banner_dismissed_date");
    const today = new Date().toDateString();
    
    if (dismissedDate === today) {
      setIsDismissed(true);
    }
  }, []);

  // Show banner after a delay for logged in users without wallet
  useEffect(() => {
    if (user && !walletAddress && !isLoading && !isDismissed) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 3000); // Show after 3 seconds
      return () => clearTimeout(timer);
    } else {
      setShowBanner(false);
    }
  }, [user, walletAddress, isLoading, isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setShowBanner(false);
    localStorage.setItem("wallet_banner_dismissed_date", new Date().toDateString());
  };

  const handleDismissPermanently = () => {
    setIsDismissed(true);
    setShowBanner(false);
    localStorage.setItem("wallet_banner_dismissed_permanently", "true");
  };

  const handleConnect = () => {
    connectWallet();
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, x: 20, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-20 right-4 z-40 w-72"
        >
          <div className="relative overflow-hidden bg-gradient-to-br from-background/95 via-background/90 to-gold/5 backdrop-blur-lg rounded-xl border border-gold/20 shadow-lg p-3">
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-1.5 right-1.5 p-1 rounded-full bg-background/50 hover:bg-background/80 transition-colors text-muted-foreground hover:text-foreground"
            >
              <X className="w-3 h-3" />
            </button>

            <div className="relative flex items-center gap-2.5">
              {/* Icon */}
              <motion.div
                className="flex-shrink-0 p-2 rounded-lg bg-gold/15 border border-gold/20"
                animate={{ rotate: [0, 3, -3, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Wallet className="w-4 h-4 text-gold" />
              </motion.div>

              {/* Content */}
              <div className="flex-1 pr-4">
                <h3 className="text-xs font-medium text-foreground flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-gold" />
                  Liên kết ví nhận Camly Coin
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                  Kết nối MetaMask để lưu trữ coin
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-2.5">
              <motion.button
                onClick={handleConnect}
                disabled={isConnecting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold/20 hover:bg-gold/30 border border-gold/30 text-gold text-[10px] font-medium transition-all disabled:opacity-50"
              >
                {isConnecting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-3 h-3" />
                    </motion.div>
                    Đang kết nối...
                  </>
                ) : (
                  <>
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                      alt="MetaMask"
                      className="w-3 h-3"
                    />
                    Kết nối
                    <ArrowRight className="w-2.5 h-2.5" />
                  </>
                )}
              </motion.button>
              <button
                onClick={handleDismissPermanently}
                className="text-[9px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
              >
                Ẩn
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WalletLinkBanner;
