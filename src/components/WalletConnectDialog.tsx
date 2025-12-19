import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, ExternalLink, AlertCircle, Wallet } from "lucide-react";
import { toast } from "sonner";

// Wallet provider type
export type WalletProviderId = "metamask" | "trust" | "bitget" | "coinbase" | "okx";

// Wallet configurations
const WALLET_LIST = [
  {
    id: "metamask" as WalletProviderId,
    name: "MetaMask",
    icon: "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg",
    downloadUrl: "https://metamask.io/download/",
    description: "Ví phổ biến nhất cho Ethereum",
    color: "from-orange-500 to-amber-500",
  },
  {
    id: "trust" as WalletProviderId,
    name: "Trust Wallet",
    icon: "https://trustwallet.com/assets/images/media/assets/trust_platform.svg",
    downloadUrl: "https://trustwallet.com/download",
    description: "Ví đa chuỗi bảo mật cao",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "bitget" as WalletProviderId,
    name: "Bitget Wallet",
    icon: "https://img.bitgetimg.com/image/third/1698716547255.png",
    downloadUrl: "https://web3.bitget.com/",
    description: "Ví Web3 của sàn Bitget",
    color: "from-emerald-500 to-teal-500",
  },
  {
    id: "coinbase" as WalletProviderId,
    name: "Coinbase Wallet",
    icon: "https://altcoinsbox.com/wp-content/uploads/2022/12/coinbase-logo.webp",
    downloadUrl: "https://www.coinbase.com/wallet/downloads",
    description: "Ví của sàn Coinbase",
    color: "from-blue-600 to-indigo-600",
  },
  {
    id: "okx" as WalletProviderId,
    name: "OKX Wallet",
    icon: "https://static.okx.com/cdn/assets/imgs/226/E82A3D5D84E4B6EB.png",
    downloadUrl: "https://www.okx.com/web3",
    description: "Ví Web3 của sàn OKX",
    color: "from-gray-600 to-gray-800",
  },
];

interface WalletConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (providerId: WalletProviderId) => Promise<void>;
  isConnecting: boolean;
  connectingProvider: WalletProviderId | null;
}

const detectWalletProvider = (providerId: WalletProviderId): boolean => {
  if (typeof window === "undefined" || typeof window.ethereum === "undefined") return false;
  
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
  const hasEthereum = typeof window !== "undefined" && typeof window.ethereum !== "undefined";
  
  if (isDetected) return "detected";
  if (providerId === "metamask" && hasEthereum) return "detected";
  return "not-installed";
};

export function WalletConnectDialog({
  open,
  onOpenChange,
  onConnect,
  isConnecting,
  connectingProvider,
}: WalletConnectDialogProps) {
  
  const handleConnect = async (wallet: typeof WALLET_LIST[0]) => {
    const status = getWalletStatus(wallet.id);
    
    if (status === "not-installed") {
      window.open(wallet.downloadUrl, "_blank");
      toast.info(`Đang mở trang tải ${wallet.name}...`);
      return;
    }
    
    try {
      await onConnect(wallet.id);
      onOpenChange(false);
    } catch {
      // Error handled in hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] bg-card/95 backdrop-blur-xl border-primary/30">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Kết nối Ví Web3
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Chọn ví blockchain để kết nối với Camly Angel
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <AnimatePresence mode="wait">
            {WALLET_LIST.map((wallet, index) => {
              const status = getWalletStatus(wallet.id);
              const isCurrentlyConnecting = isConnecting && connectingProvider === wallet.id;

              return (
                <motion.button
                  key={wallet.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleConnect(wallet)}
                  disabled={isConnecting}
                  className={`
                    w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-300
                    bg-muted/30 border-border/50 hover:border-primary/40 hover:bg-muted/50
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  {/* Wallet Icon */}
                  <div className="relative w-12 h-12 rounded-xl bg-background/80 flex items-center justify-center overflow-hidden border border-border/30">
                    <img 
                      src={wallet.icon} 
                      alt={wallet.name}
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    {status === "detected" && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                        <span className="text-[8px] text-white font-bold">✓</span>
                      </div>
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
                      <span className="text-primary text-lg">→</span>
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
}

export default WalletConnectDialog;
