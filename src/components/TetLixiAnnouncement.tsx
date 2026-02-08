import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Sparkles, Info, X, Coins, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCamlyCoin } from "@/hooks/useCamlyCoin";
import { toast } from "sonner";

interface TetLixiAnnouncementProps {
  funMoneyAmount: number;
  onClaim?: () => void;
  onClose?: () => void;
}

const TetLixiAnnouncement = ({ 
  funMoneyAmount, 
  onClaim,
  onClose 
}: TetLixiAnnouncementProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);
  const { isAuthenticated } = useAuth();
  
  // Calculate Camly Coin based on 1 Fun Money = 1000 Camly Coin
  const camlyCoinAmount = funMoneyAmount * 1000;
  
  // Check if promotion is still valid (until Feb 8, 2026)
  const promotionEndDate = new Date('2026-02-08T23:59:59');
  const isPromotionActive = new Date() <= promotionEndDate;

  const handleClaim = async () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để nhận Lì xì!");
      return;
    }
    
    if (!isPromotionActive) {
      toast.error("Chương trình Lì xì đã kết thúc!");
      return;
    }

    setIsClaiming(true);
    
    try {
      // Simulate claim process - in real implementation, call edge function
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setHasClaimed(true);
      toast.success(`🎊 Chúc mừng! Bạn đã nhận ${camlyCoinAmount.toLocaleString()} Camly Coin!`);
      onClaim?.();
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setIsClaiming(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-0 bg-transparent">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 25%, #FFD700 50%, #DAA520 75%, #FFD700 100%)',
              boxShadow: '0 0 40px rgba(255, 215, 0, 0.5), inset 0 0 60px rgba(255, 255, 255, 0.3)',
            }}
          >
            {/* Metallic shimmer overlay */}
            <div 
              className="absolute inset-0 opacity-40"
              style={{
                background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.8) 50%, transparent 70%)',
                animation: 'shimmer 3s infinite',
              }}
            />
            
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 z-20 p-1.5 rounded-full bg-black/20 hover:bg-black/30 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Content */}
            <div className="relative z-10 p-6 text-center">
              {/* Decorative icons */}
              <div className="flex justify-center gap-2 mb-4">
                <motion.div
                  animate={{ rotate: [0, -10, 10, 0], y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <PartyPopper className="w-8 h-8 text-red-600" />
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Gift className="w-10 h-10 text-red-700" />
                </motion.div>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0], y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  <PartyPopper className="w-8 h-8 text-red-600" />
                </motion.div>
              </div>

              {/* Main title */}
              <h2 
                className="text-2xl font-bold mb-4"
                style={{
                  color: '#8B0000',
                  textShadow: '1px 1px 2px rgba(255,255,255,0.5)',
                }}
              >
                🧧 Chúc mừng bạn được Lì xì 🧧
              </h2>

              {/* Coin display */}
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-4 p-4 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(139,0,0,0.9) 0%, rgba(178,34,34,0.9) 100%)',
                  boxShadow: '0 4px 20px rgba(139,0,0,0.4)',
                }}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Coins className="w-8 h-8 text-yellow-300" />
                  <span 
                    className="text-3xl font-bold"
                    style={{
                      color: '#FFD700',
                      textShadow: '0 0 10px rgba(255,215,0,0.8)',
                    }}
                  >
                    {camlyCoinAmount.toLocaleString()}
                  </span>
                  <span className="text-yellow-200 text-lg font-semibold">Camly Coin</span>
                </div>
                
                <p className="text-yellow-100 text-sm">
                  dựa trên <span className="font-bold text-yellow-300">{funMoneyAmount.toLocaleString()}</span> Fun Money
                </p>
              </motion.div>

              {/* Program info */}
              <div 
                className="mb-4 p-3 rounded-lg text-sm"
                style={{
                  background: 'rgba(139,0,0,0.15)',
                  border: '1px solid rgba(139,0,0,0.3)',
                }}
              >
                <p className="font-semibold" style={{ color: '#8B0000' }}>
                  Chương trình Lì xì Tết
                </p>
                <p 
                  className="text-lg font-bold mt-1"
                  style={{ 
                    color: '#8B0000',
                    textShadow: '0 0 5px rgba(255,215,0,0.5)',
                  }}
                >
                  26.000.000.000 VND
                </p>
                <p className="text-xs mt-1" style={{ color: '#A52A2A' }}>
                  bằng Fun Money và Camly Coin
                </p>
              </div>

              {/* Promotion note */}
              <div 
                className="mb-5 p-2 rounded-lg flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(90deg, rgba(255,215,0,0.2), rgba(255,165,0,0.3), rgba(255,215,0,0.2))',
                  border: '1px dashed #DAA520',
                }}
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-medium" style={{ color: '#8B4513' }}>
                  1 Fun Money = 1.000 Camly Coin (đến 08/02/2026)
                </span>
                <Sparkles className="w-4 h-4 text-amber-600" />
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleClaim}
                  disabled={isClaiming || hasClaimed || !isPromotionActive}
                  className="flex-1 h-12 text-lg font-bold relative overflow-hidden"
                  style={{
                    background: hasClaimed 
                      ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                      : 'linear-gradient(135deg, #D4708A 0%, #E8A4B8 20%, #F5D0DC 40%, #FFFFFF 50%, #F5D0DC 60%, #E8A4B8 80%, #D4708A 100%)',
                    backgroundSize: '200% 100%',
                    animation: !hasClaimed ? 'buttonShimmer 2s ease-in-out infinite' : 'none',
                    boxShadow: '0 4px 15px rgba(212,112,138,0.5), inset 0 0 20px rgba(255,255,255,0.4)',
                    color: '#4A2F35',
                    border: '3px solid #8B4557',
                  }}
                >
                  {/* White sparkle overlay */}
                  <div 
                    className="absolute inset-0 opacity-60"
                    style={{
                      background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.9) 50%, transparent 70%)',
                      animation: 'shimmer 2s infinite',
                    }}
                  />
                  <span className="relative z-10 flex items-center justify-center">
                    {isClaiming ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles className="w-5 h-5" />
                      </motion.div>
                    ) : hasClaimed ? (
                      <>✓ Đã nhận</>
                    ) : (
                      <>
                        <Gift className="w-5 h-5 mr-2" />
                        Claim
                      </>
                    )}
                  </span>
                </Button>

                <Button
                  asChild
                  className="flex-1 h-12 font-semibold relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #D4708A 0%, #E8A4B8 20%, #F5D0DC 40%, #FFFFFF 50%, #F5D0DC 60%, #E8A4B8 80%, #D4708A 100%)',
                    backgroundSize: '200% 100%',
                    animation: 'buttonShimmer 2.5s ease-in-out infinite',
                    boxShadow: '0 4px 12px rgba(212,112,138,0.4), inset 0 0 15px rgba(255,255,255,0.3)',
                    color: '#4A2F35',
                    border: '3px solid #8B4557',
                  }}
                >
                  <Link to="/admin/mint-stats" className="flex items-center justify-center">
                    {/* White sparkle overlay */}
                    <div 
                      className="absolute inset-0 opacity-50"
                      style={{
                        background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.8) 50%, transparent 70%)',
                        animation: 'shimmer 2.5s infinite',
                      }}
                    />
                    <span className="relative z-10 flex items-center">
                      <Info className="w-5 h-5 mr-2" />
                      Thêm Thông Tin
                    </span>
                  </Link>
                </Button>
              </div>

              {/* Floating sparkles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, #FFD700, #FFA500)',
                    left: `${15 + i * 15}%`,
                    top: `${10 + (i % 3) * 20}%`,
                  }}
                  animate={{
                    y: [0, -10, 0],
                    opacity: [0.5, 1, 0.5],
                    scale: [1, 1.3, 1],
                  }}
                  transition={{
                    duration: 2 + i * 0.3,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>

            {/* Bottom decorative border */}
            <div 
              className="h-2"
              style={{
                background: 'linear-gradient(90deg, #8B0000, #DC143C, #8B0000)',
              }}
            />
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Add shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes buttonShimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>
    </AnimatePresence>
  );
};

export default TetLixiAnnouncement;
