import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Wallet, ArrowRight, CheckCircle2, Loader2, ExternalLink, AlertCircle, Coins } from "lucide-react";

interface Web3ClaimModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletAddress: string;
  claimableBalance: number;
  minClaim: number;
  onClaim: (amount: number, network: string) => Promise<{
    success: boolean;
    tx_hash: string;
    amount_claimed: number;
    network: string;
    new_balance: number;
  } | null>;
}

const NETWORKS = [
  { id: "bsc", name: "BNB Chain (BSC)", symbol: "BNB", explorer: "https://bscscan.com/tx/" },
  { id: "ethereum", name: "Ethereum", symbol: "ETH", explorer: "https://etherscan.io/tx/" },
  { id: "polygon", name: "Polygon", symbol: "MATIC", explorer: "https://polygonscan.com/tx/" },
];

export function Web3ClaimModal({
  open,
  onOpenChange,
  walletAddress,
  claimableBalance,
  minClaim,
  onClaim,
}: Web3ClaimModalProps) {
  const [step, setStep] = useState<"input" | "confirm" | "success">("input");
  const [amount, setAmount] = useState("");
  const [network, setNetwork] = useState("bsc");
  const [countdown, setCountdown] = useState(3);
  const [isConfirming, setIsConfirming] = useState(false);
  const [result, setResult] = useState<{
    tx_hash: string;
    amount_claimed: number;
    network: string;
    new_balance: number;
  } | null>(null);

  // Reset on open
  useEffect(() => {
    if (open) {
      setStep("input");
      setAmount("");
      setNetwork("bsc");
      setCountdown(3);
      setResult(null);
    }
  }, [open]);

  // Countdown timer
  useEffect(() => {
    if (step !== "confirm") return;
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [step, countdown]);

  const parsedAmount = parseInt(amount) || 0;
  const isValidAmount = parsedAmount >= minClaim && parsedAmount <= claimableBalance;
  const selectedNetwork = NETWORKS.find((n) => n.id === network);

  const handleProceed = useCallback(() => {
    if (!isValidAmount) return;
    setStep("confirm");
    setCountdown(3);
  }, [isValidAmount]);

  const handleConfirm = useCallback(async () => {
    if (countdown > 0) return;
    setIsConfirming(true);
    const res = await onClaim(parsedAmount, network);
    setIsConfirming(false);

    if (res?.success) {
      setResult(res);
      setStep("success");
    }
  }, [countdown, onClaim, parsedAmount, network]);

  const setMax = useCallback(() => {
    setAmount(String(claimableBalance));
  }, [claimableBalance]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] bg-card/95 backdrop-blur-xl border-primary/30">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl flex items-center gap-2">
            <Coins className="w-5 h-5 text-primary" />
            {step === "success" ? "Claim Thành Công!" : "Claim CAMLY to Wallet"}
          </DialogTitle>
          <DialogDescription>
            {step === "input" && "Chuyển Camly Coin từ off-chain sang ví blockchain của bạn"}
            {step === "confirm" && "Xác nhận giao dịch claim"}
            {step === "success" && "Giao dịch đã được ghi nhận thành công"}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {/* Step 1: Input */}
          {step === "input" && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4 py-2"
            >
              {/* Amount */}
              <div className="space-y-2">
                <Label>Số lượng CAMLY</Label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder={`Tối thiểu ${minClaim}`}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min={minClaim}
                    max={claimableBalance}
                    className="pr-16"
                  />
                  <button
                    onClick={setMax}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-primary hover:text-primary/80 transition-colors px-2 py-1 rounded bg-primary/10"
                  >
                    MAX
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Số dư hiện có: <span className="font-medium text-foreground">{claimableBalance.toLocaleString("vi-VN")}</span> CAMLY
                </p>
              </div>

              {/* Network */}
              <div className="space-y-2">
                <Label>Mạng blockchain</Label>
                <Select value={network} onValueChange={setNetwork}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NETWORKS.map((n) => (
                      <SelectItem key={n.id} value={n.id}>
                        {n.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Wallet address */}
              <div className="p-3 rounded-lg bg-muted/30 border border-border/30 space-y-1">
                <p className="text-xs text-muted-foreground">Ví nhận</p>
                <p className="text-sm font-mono break-all text-foreground">
                  {walletAddress}
                </p>
              </div>

              <Button
                onClick={handleProceed}
                disabled={!isValidAmount}
                className="w-full"
              >
                Tiếp tục
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>

              {parsedAmount > 0 && !isValidAmount && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {parsedAmount < minClaim
                    ? `Tối thiểu ${minClaim} CAMLY`
                    : "Vượt quá số dư hiện có"}
                </p>
              )}
            </motion.div>
          )}

          {/* Step 2: Confirm */}
          {step === "confirm" && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4 py-2"
            >
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Số lượng</span>
                  <span className="text-lg font-bold text-foreground">{parsedAmount.toLocaleString("vi-VN")} CAMLY</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Mạng</span>
                  <span className="text-sm font-medium">{selectedNetwork?.name}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-sm text-muted-foreground">Ví nhận</span>
                  <span className="text-xs font-mono text-right max-w-[200px] break-all">{walletAddress}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep("input")}
                  className="flex-1"
                  disabled={isConfirming}
                >
                  Quay lại
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={countdown > 0 || isConfirming}
                  className="flex-1"
                >
                  {isConfirming ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-1" />
                      Đang xử lý...
                    </>
                  ) : countdown > 0 ? (
                    `Xác nhận (${countdown}s)`
                  ) : (
                    "Xác nhận Claim"
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Success */}
          {step === "success" && result && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4 py-2 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto"
              >
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </motion.div>

              <div>
                <p className="text-2xl font-bold text-foreground">
                  {result.amount_claimed.toLocaleString("vi-VN")} CAMLY
                </p>
                <p className="text-sm text-muted-foreground mt-1">đã được claim thành công</p>
              </div>

              <div className="p-3 rounded-lg bg-muted/30 border border-border/30 space-y-2 text-left">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">TX Hash</span>
                  <span className="font-mono">...{result.tx_hash.slice(-12)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Mạng</span>
                  <span>{selectedNetwork?.name}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Số dư mới</span>
                  <span className="font-medium">{result.new_balance.toLocaleString("vi-VN")} CAMLY</span>
                </div>
              </div>

              {selectedNetwork && (
                <a
                  href={`${selectedNetwork.explorer}${result.tx_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  Xem trên Explorer
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}

              <Button onClick={() => onOpenChange(false)} className="w-full">
                Đóng
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

export default Web3ClaimModal;
