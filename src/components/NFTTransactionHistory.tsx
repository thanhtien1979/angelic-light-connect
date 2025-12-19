import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Loader2,
  Hash,
  Wallet,
  Image as ImageIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNFT } from "@/hooks/useNFT";
import { useAuth } from "@/hooks/useAuth";

export default function NFTTransactionHistory() {
  const { user } = useAuth();
  const { transactions, isLoadingTransactions, fetchTransactions } = useNFT();

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user, fetchTransactions]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-amber-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30">Thành công</Badge>;
      case "pending":
        return <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">Đang xử lý</Badge>;
      case "failed":
        return <Badge className="bg-red-500/20 text-red-600 border-red-500/30">Thất bại</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const shortenHash = (hash: string) => {
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  if (!user) {
    return (
      <Card className="border-rose-soft/30 bg-white/80 backdrop-blur-sm">
        <CardContent className="py-8 text-center text-muted-foreground">
          Vui lòng đăng nhập để xem lịch sử giao dịch
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-rose-soft/30 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="w-5 h-5 text-primary" />
          Lịch Sử Giao Dịch NFT
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoadingTransactions ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>Chưa có giao dịch NFT nào</p>
            <p className="text-sm">Mint NFT đầu tiên của bạn ngay!</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            <AnimatePresence>
              {transactions.map((tx, index) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-lg bg-gradient-to-r from-rose-soft/10 to-primary/5 border border-rose-soft/20"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(tx.status)}
                        <span className="font-medium text-foreground">
                          Token #{tx.token_id}
                        </span>
                        {getStatusBadge(tx.status)}
                      </div>
                      
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Wallet className="w-3.5 h-3.5" />
                          <span className="font-mono text-xs">
                            {shortenHash(tx.wallet_address)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Hash className="w-3.5 h-3.5" />
                          <span className="font-mono text-xs">
                            {shortenHash(tx.transaction_hash)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 px-1"
                            onClick={() => {
                              // Open in block explorer (Sepolia testnet)
                              window.open(
                                `https://sepolia.etherscan.io/tx/${tx.transaction_hash}`,
                                "_blank"
                              );
                            }}
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs">
                          <span>Gas: {tx.gas_fee} ETH</span>
                          <span>{formatDate(tx.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
