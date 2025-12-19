import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, ExternalLink, AlertCircle } from "lucide-react";
import { toast } from "sonner";

// Wallet configurations
export const WALLET_PROVIDERS = {
  metamask: {
    name: "MetaMask",
    icon: "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg",
    downloadUrl: "https://metamask.io/download/",
    description: "Ví phổ biến nhất cho Ethereum",
    color: "from-orange-500 to-amber-500",
  },
  trust: {
    name: "Trust Wallet",
    icon: "https://trustwallet.com/assets/images/media/assets/trust_platform.svg",
    downloadUrl: "https://trustwallet.com/download",
    description: "Ví đa chuỗi bảo mật cao",
    color: "from-blue-500 to-cyan-500",
  },
  bitget: {
    name: "Bitget Wallet",
    icon: "https://raw.githubusercontent.com/nicefuture/logos/main/bitget-wallet-logo.png",
    downloadUrl: "https://web3.bitget.com/",
    description: "Ví Web3 của sàn Bitget",
    color: "from-emerald-500 to-teal-500",
  },
  coinbase: {
    name: "Coinbase Wallet",
    icon: "https://altcoinsbox.com/wp-content/uploads/2022/12/coinbase-logo.webp",
    downloadUrl: "https://www.coinbase.com/wallet/downloads",
    description: "Ví của sàn Coinbase",
    color: "from-blue-600 to-indigo-600",
  },
  okx: {
    name: "OKX Wallet",
    icon: "https://static.okx.com/cdn/assets/imgs/226/E82A3D5D84E4B6EB.png",
    downloadUrl: "https://www.okx.com/web3",
    description: "Ví Web3 của sàn OKX",
    color: "from-gray-700 to-gray-900",
  },
} as const;

export type WalletProviderId = keyof typeof WALLET_PROVIDERS;

interface WalletConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (providerId: WalletProviderId) => Promise<void>;
  isConnecting: boolean;
  connectingProvider: WalletProviderId | null;
}

export const WalletConnectDialog = ({
  open,
  onOpenChange,
  onConnect,
  isConnecting,
  connectingProvider,
}: WalletConnectDialogProps) => {
  const [hoveredWallet, setHoveredWallet] = useState<WalletProviderId | null>(null);

  const handleConnect = async (providerId: WalletProviderId) => {
    try {
      await onConnect(providerId);
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const detectWalletProvider = (providerId: WalletProviderId): boolean => {
    if (typeof window.ethereum === "undefined") return false;
    
    // Cast to any to access provider-specific properties
    const ethereum = window.ethereum as Record<string, unknown>;
    
    switch (providerId) {
      case "metamask":
        return ethereum.isMetaMask === true;
      case "trust":
        return ethereum.isTrust === true || ethereum.isTrustWallet === true;
      case "bitget":
        return ethereum.isBitKeep === true || ethereum.isBitget === true;
      case "coinbase":
        return ethereum.isCoinbaseWallet === true || ethereum.isCoinbaseBrowser === true;
      case "okx":
        return ethereum.isOkxWallet === true || ethereum.isOKExWallet === true;
      default:
        return false;
    }
  };

  const getWalletStatus = (providerId: WalletProviderId) => {
    const isDetected = detectWalletProvider(providerId);
    // If ethereum exists but no specific provider detected, MetaMask is likely available
    const hasEthereum = typeof window.ethereum !== "undefined";
    
    if (isDetected) return "detected";
    if (providerId === "metamask" && hasEthereum) return "detected";
    return "not-installed";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] bg-card/95 backdrop-blur-xl border-primary/30">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-amber-500"
            />
            Kết nối Ví Web3
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Chọn ví blockchain để kết nối với Camly Angel
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <AnimatePresence>
            {Object.entries(WALLET_PROVIDERS).map(([id, wallet], index) => {
              const providerId = id as WalletProviderId;
              const status = getWalletStatus(providerId);
              const isCurrentlyConnecting = isConnecting && connectingProvider === providerId;

              return (
                <motion.button
                  key={id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onHoverStart={() => setHoveredWallet(providerId)}
                  onHoverEnd={() => setHoveredWallet(null)}
                  onClick={() => {
                    if (status === "not-installed") {
                      window.open(wallet.downloadUrl, "_blank");
                      toast.info(`Đang mở trang tải ${wallet.name}...`);
                    } else {
                      handleConnect(providerId);
                    }
                  }}
                  disabled={isConnecting}
                  className={`
                    w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-300
                    ${hoveredWallet === providerId 
                      ? `bg-gradient-to-r ${wallet.color} bg-opacity-10 border-primary/50 shadow-lg` 
                      : "bg-muted/30 border-border/50 hover:border-primary/30"
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  {/* Wallet Icon */}
                  <div className="relative w-12 h-12 rounded-xl bg-background/80 flex items-center justify-center overflow-hidden">
                    <img 
                      src={wallet.icon} 
                      alt={wallet.name}
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/32?text=?";
                      }}
                    />
                    {status === "detected" && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center"
                      >
                        <span className="text-[8px] text-white">✓</span>
                      </motion.div>
                    )}
                  </div>

                  {/* Wallet Info */}
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{wallet.name}</span>
                      {status === "detected" && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500">
                          Đã cài
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {wallet.description}
                    </p>
                  </div>

                  {/* Action */}
                  <div className="flex items-center">
                    {isCurrentlyConnecting ? (
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    ) : status === "not-installed" ? (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span className="hidden sm:inline">Cài đặt</span>
                        <ExternalLink className="w-4 h-4" />
                      </div>
                    ) : (
                      <motion.div
                        animate={hoveredWallet === providerId ? { x: [0, 4, 0] } : {}}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        className="text-primary"
                      >
                        →
                      </motion.div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Info */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 border border-border/30">
          <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Kết nối ví để nhận Happy Camly Coin, mint NFT và lưu trữ tác phẩm nghệ thuật trên blockchain. 
            Ví của bạn sẽ không bị yêu cầu quyền chuyển tiền.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletConnectDialog;
