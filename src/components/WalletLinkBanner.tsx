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
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md mx-4"
        >
          <div className="relative overflow-hidden bg-gradient-to-r from-primary/20 via-gold/15 to-primary/20 backdrop-blur-xl rounded-2xl border border-gold/30 shadow-[0_10px_40px_hsla(45,100%,70%,0.2)] p-4">
            {/* Animated background glow */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-gold/10 via-gold/20 to-gold/10"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              style={{ backgroundSize: "200% 100%" }}
            />

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-background/50 hover:bg-background/80 transition-colors text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative flex items-start gap-4">
              {/* Icon */}
              <motion.div
                className="flex-shrink-0 p-3 rounded-xl bg-gold/20 border border-gold/30"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Wallet className="w-6 h-6 text-gold" />
              </motion.div>

              {/* Content */}
              <div className="flex-1 pr-6">
                <h3 className="font-serif text-sm font-medium text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-gold" />
                  Liên kết ví để nhận Happy Camly Coin
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Kết nối ví MetaMask để lưu trữ Camly Coin và rút về ví của bạn trong tương lai!
                </p>

                {/* Connect button */}
                <motion.button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-3 flex items-center gap-2 px-4 py-2 rounded-full bg-gold/20 hover:bg-gold/30 border border-gold/40 text-gold text-xs font-medium transition-all disabled:opacity-50"
                >
                  {isConnecting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles className="w-4 h-4" />
                      </motion.div>
                      Đang kết nối...
                    </>
                  ) : (
                    <>
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                        alt="MetaMask"
                        className="w-4 h-4"
                      />
                      Kết nối MetaMask
                      <ArrowRight className="w-3 h-3" />
                    </>
                  )}
                </motion.button>
                {/* Don't remind button */}
                <button
                  onClick={handleDismissPermanently}
                  className="mt-2 text-xs text-muted-foreground/70 hover:text-muted-foreground transition-colors underline underline-offset-2"
                >
                  Không nhắc lại
                </button>
              </div>
            </div>

            {/* Decorative elements */}
            <motion.div
              className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-gold/10 blur-2xl"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WalletLinkBanner;
