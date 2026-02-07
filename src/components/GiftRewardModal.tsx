import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gift,
  Coins,
  DollarSign,
  Sparkles,
  Send,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import confetti from "canvas-confetti";

// Import coin avatars
import camlyCoinAvatar from "@/assets/camly-coin-avatar.png";
import funMoneyAvatar from "@/assets/fun-money-avatar.png";

type CoinType = "camly_coin" | "fun_money" | "bnb" | "usdt";

interface CoinOption {
  value: CoinType;
  label: string;
  icon: string;
  color: string;
  priority: number;
}

const coinOptions: CoinOption[] = [
  { value: "fun_money", label: "FUN MONEY", icon: funMoneyAvatar, color: "from-emerald-500 to-teal-500", priority: 1 },
  { value: "camly_coin", label: "CAMLY COIN", icon: camlyCoinAvatar, color: "from-gold to-amber-500", priority: 2 },
  { value: "bnb", label: "BNB", icon: "", color: "from-yellow-500 to-orange-500", priority: 3 },
  { value: "usdt", label: "USDT", icon: "", color: "from-green-500 to-emerald-500", priority: 4 },
];

interface ReceiverProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface GiftRewardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receiverId: string;
  receiverProfile?: ReceiverProfile | null;
  postId?: string; // Optional, if gift is from a post
  onSuccess?: () => void;
}

export default function GiftRewardModal({
  open,
  onOpenChange,
  receiverId,
  receiverProfile,
  postId,
  onSuccess,
}: GiftRewardModalProps) {
  const { user } = useAuth();
  const [selectedCoin, setSelectedCoin] = useState<CoinType>("fun_money");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [profile, setProfile] = useState<ReceiverProfile | null>(receiverProfile || null);

  useEffect(() => {
    if (open && receiverId && !receiverProfile) {
      fetchReceiverProfile();
    } else if (receiverProfile) {
      setProfile(receiverProfile);
    }
  }, [open, receiverId, receiverProfile]);

  const fetchReceiverProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .eq("id", receiverId)
      .single();
    
    if (data) {
      setProfile(data);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const selectedCoinOption = coinOptions.find(c => c.value === selectedCoin);

  const handleAmountChange = (value: string) => {
    // Only allow numbers and decimals
    const cleaned = value.replace(/[^0-9.]/g, "");
    // Prevent multiple decimals
    const parts = cleaned.split(".");
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 8) return;
    setAmount(cleaned);
  };

  const handleConfirmClick = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Vui lòng nhập số tiền hợp lệ");
      return;
    }
    setShowConfirm(true);
  };

  const triggerCelebration = () => {
    // Confetti effect
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ["#FFD700", "#FF69B4", "#00CED1", "#9370DB"],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ["#FFD700", "#FF69B4", "#00CED1", "#9370DB"],
      });
    }, 250);
  };

  const handleSendGift = async () => {
    if (!user || !receiverId) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("gift_transactions")
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          amount: parseFloat(amount),
          coin_type: selectedCoin,
          message: message.trim() || null,
          post_id: postId || null,
          status: "completed",
        });

      if (error) throw error;

      setShowConfirm(false);
      setShowSuccess(true);
      triggerCelebration();

      // Reset form after delay
      setTimeout(() => {
        setShowSuccess(false);
        setAmount("");
        setMessage("");
        onOpenChange(false);
        onSuccess?.();
      }, 5000);

    } catch (error) {
      console.error("Error sending gift:", error);
      toast.error("Không thể gửi quà tặng. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setShowConfirm(false);
    setShowSuccess(false);
    setAmount("");
    setMessage("");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) resetModal(); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-md bg-gradient-to-b from-background to-background/95 border-gold/30">
        <AnimatePresence mode="wait">
          {showSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="py-8 text-center"
            >
              <motion.div
                animate={{ 
                  rotate: [0, -10, 10, -10, 10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 0.5 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center border-2 border-emerald-500/50"
              >
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </motion.div>
              
              <h3 className="text-2xl font-serif font-bold text-foreground mb-2">
                🎉 Chúc mừng!
              </h3>
              <p className="text-muted-foreground mb-4">
                Bạn đã gửi thành công
              </p>
              
              <div className="p-4 rounded-2xl bg-gradient-to-r from-gold/10 via-rose-500/10 to-violet-500/10 border border-gold/20 mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {selectedCoinOption?.icon && (
                    <img src={selectedCoinOption.icon} alt="" className="w-8 h-8 rounded-full" />
                  )}
                  <span className="text-2xl font-bold text-foreground">
                    {parseFloat(amount).toLocaleString("vi-VN")} {selectedCoinOption?.label}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  đến <span className="text-foreground font-medium">{profile?.display_name || "Linh hồn ánh sáng"}</span>
                </p>
              </div>

              <p className="text-sm text-gold">
                <Sparkles className="w-4 h-4 inline mr-1" />
                +{Math.max(1, Math.floor(parseFloat(amount) / 100))} Light Score Points
              </p>
            </motion.div>
          ) : showConfirm ? (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="py-4"
            >
              <DialogHeader className="mb-6">
                <DialogTitle className="text-center font-serif text-xl flex items-center justify-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  Xác nhận gửi quà tặng
                </DialogTitle>
              </DialogHeader>

              <div className="p-4 rounded-2xl bg-gradient-to-r from-gold/10 via-rose-500/10 to-violet-500/10 border border-gold/20 mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-12 h-12 ring-2 ring-gold/30">
                    <AvatarImage src={profile?.avatar_url || ""} />
                    <AvatarFallback className="bg-gradient-to-br from-gold/30 to-rose-500/30">
                      {getInitials(profile?.display_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm text-muted-foreground">Người nhận</p>
                    <p className="font-medium text-foreground">
                      {profile?.display_name || "Linh hồn ánh sáng"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-t border-border/30">
                  <span className="text-muted-foreground">Số tiền</span>
                  <div className="flex items-center gap-2">
                    {selectedCoinOption?.icon && (
                      <img src={selectedCoinOption.icon} alt="" className="w-6 h-6 rounded-full" />
                    )}
                    <span className="text-lg font-bold text-foreground">
                      {parseFloat(amount).toLocaleString("vi-VN")} {selectedCoinOption?.label}
                    </span>
                  </div>
                </div>

                {message && (
                  <div className="pt-3 border-t border-border/30">
                    <p className="text-sm text-muted-foreground mb-1">Lời nhắn</p>
                    <p className="text-foreground italic">"{message}"</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 border-border/50"
                  disabled={isLoading}
                >
                  Quay lại
                </Button>
                <Button
                  onClick={handleSendGift}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-pink-500 hover:to-rose-500"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Xác nhận gửi
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <DialogHeader className="mb-6">
                <DialogTitle className="text-center font-serif text-xl flex items-center justify-center gap-2">
                  <Gift className="w-5 h-5 text-rose-500" />
                  Tặng thưởng yêu thương
                </DialogTitle>
              </DialogHeader>

              {/* Receiver */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/50 mb-6">
                <Avatar className="w-12 h-12 ring-2 ring-gold/30">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-gradient-to-br from-gold/30 to-rose-500/30">
                    {getInitials(profile?.display_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-muted-foreground">Gửi đến</p>
                  <p className="font-medium text-foreground">
                    {profile?.display_name || "Linh hồn ánh sáng"}
                  </p>
                </div>
              </div>

              {/* Coin Selection */}
              <div className="space-y-2 mb-4">
                <Label>Chọn loại coin</Label>
                <Select value={selectedCoin} onValueChange={(v) => setSelectedCoin(v as CoinType)}>
                  <SelectTrigger className="bg-muted/30 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {coinOptions.map((coin) => (
                      <SelectItem key={coin.value} value={coin.value}>
                        <div className="flex items-center gap-2">
                          {coin.icon ? (
                            <img src={coin.icon} alt="" className="w-5 h-5 rounded-full" />
                          ) : (
                            <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${coin.color}`} />
                          )}
                          <span>{coin.label}</span>
                          {coin.priority === 1 && (
                            <span className="text-xs text-emerald-500 ml-auto">(Ưu tiên)</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Amount */}
              <div className="space-y-2 mb-4">
                <Label>Số lượng</Label>
                <div className="relative">
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="text-lg font-bold pr-20 bg-muted/30 border-border/50"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {selectedCoinOption?.label}
                  </span>
                </div>
              </div>

              {/* Quick amounts */}
              <div className="flex gap-2 mb-4">
                {[100, 500, 1000, 5000].map((val) => (
                  <button
                    key={val}
                    onClick={() => setAmount(val.toString())}
                    className="flex-1 px-3 py-2 text-sm rounded-lg bg-muted/50 border border-border/50 hover:bg-gold/10 hover:border-gold/30 transition-all"
                  >
                    {val.toLocaleString()}
                  </button>
                ))}
              </div>

              {/* Message */}
              <div className="space-y-2 mb-6">
                <Label>Lời nhắn (tùy chọn)</Label>
                <Textarea
                  placeholder="Gửi lời yêu thương đến người nhận..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={200}
                  className="bg-muted/30 border-border/50 resize-none"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground text-right">{message.length}/200</p>
              </div>

              {/* Submit */}
              <Button
                onClick={handleConfirmClick}
                disabled={!amount || parseFloat(amount) <= 0}
                className="w-full bg-gradient-to-r from-rose-500 via-pink-500 to-violet-500 text-white hover:from-violet-500 hover:via-pink-500 hover:to-rose-500 shadow-lg shadow-rose-500/25"
              >
                <Gift className="w-4 h-4 mr-2" />
                Tiếp tục tặng thưởng
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
