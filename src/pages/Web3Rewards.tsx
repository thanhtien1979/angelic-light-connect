import { useState } from "react";
import { motion } from "framer-motion";
import { Wallet, Coins, ArrowDownToLine, History, Shield, Clock, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import NavigationHeader from "@/components/NavigationHeader";
import Footer from "@/components/Footer";
import Web3ClaimModal from "@/components/Web3ClaimModal";
import WalletConnectDialog from "@/components/WalletConnectDialog";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";
import { useWeb3Rewards } from "@/hooks/useWeb3Rewards";
import AuthModal from "@/components/AuthModal";

const NETWORK_EXPLORERS: Record<string, { name: string; explorer: string }> = {
  bsc: { name: "BNB Chain", explorer: "https://bscscan.com/tx/" },
  ethereum: { name: "Ethereum", explorer: "https://etherscan.io/tx/" },
  polygon: { name: "Polygon", explorer: "https://polygonscan.com/tx/" },
};

const Web3Rewards = () => {
  const { user } = useAuth();
  const {
    walletAddress,
    isConnecting,
    connectingProvider,
    isDialogOpen,
    setIsDialogOpen,
    connectWithProvider,
  } = useWallet();

  const {
    claimHistory,
    isLoadingHistory,
    isClaiming,
    todayClaimCount,
    claimableBalance,
    canClaim,
    claimToWallet,
    MAX_CLAIMS_PER_DAY,
    MIN_CLAIM_AMOUNT,
  } = useWeb3Rewards();

  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const claimCheck = canClaim();

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-2">
            🌟 Web3 Rewards
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Claim Camly Coin rewards trực tiếp vào ví blockchain của bạn
          </p>
        </motion.div>

        {/* Auth check */}
        {!user && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Vui lòng đăng nhập để sử dụng Web3 Rewards</p>
            <Button onClick={() => setShowAuth(true)}>Đăng nhập</Button>
            <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
          </motion.div>
        )}

        {user && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Balance */}
              <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1">
                    <Coins className="w-4 h-4" /> Số dư CAMLY
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-foreground">
                    {claimableBalance.toLocaleString("vi-VN")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Có thể claim on-chain</p>
                </CardContent>
              </Card>

              {/* Wallet */}
              <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1">
                    <Wallet className="w-4 h-4" /> Ví Web3
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {walletAddress ? (
                    <>
                      <p className="text-sm font-mono text-foreground truncate">
                        {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
                      </p>
                      <Badge variant="outline" className="mt-1 text-emerald-500 border-emerald-500/30">
                        Đã kết nối
                      </Badge>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">Chưa kết nối</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-1"
                        onClick={() => setIsDialogOpen(true)}
                      >
                        Kết nối ví
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Claims today */}
              <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> Claims hôm nay
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-foreground">
                    {todayClaimCount}/{MAX_CLAIMS_PER_DAY}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Tối thiểu {MIN_CLAIM_AMOUNT} CAMLY/lần</p>
                </CardContent>
              </Card>
            </div>

            {/* Claim Button */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/25">
              <CardContent className="p-6 text-center">
                <ArrowDownToLine className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="text-lg font-serif font-semibold mb-2">Claim to Wallet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Chuyển CAMLY từ off-chain sang ví blockchain
                </p>
                <Button
                  size="lg"
                  onClick={() => setShowClaimModal(true)}
                  disabled={!claimCheck.ok || isClaiming}
                  className="min-w-[200px]"
                >
                  {isClaiming ? "Đang xử lý..." : "Claim Now"}
                </Button>
                {!claimCheck.ok && claimCheck.reason && (
                  <p className="text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {claimCheck.reason}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Security Note */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/30">
              <Shield className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">Bảo mật & Lưu ý</p>
                <p>• Hiện tại sử dụng simulated blockchain. Token CAMLY sẽ được phân phối thực khi smart contract được triển khai.</p>
                <p>• Tối đa {MAX_CLAIMS_PER_DAY} lần claim/ngày, cooldown 60 giây giữa mỗi lần.</p>
                <p>• Mọi giao dịch được ghi nhận bất biến trong reward ledger.</p>
              </div>
            </div>

            {/* Claim History */}
            <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <History className="w-5 h-5" />
                  Lịch sử Claim
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingHistory ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-lg" />
                    ))}
                  </div>
                ) : claimHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Chưa có giao dịch claim nào</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {claimHistory.map((tx) => {
                      const net = tx.network ? NETWORK_EXPLORERS[tx.network] : null;
                      return (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/20"
                        >
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-foreground">
                              {tx.amount.toLocaleString("vi-VN")} CAMLY
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {net && <span>{net.name}</span>}
                              <span>•</span>
                              <span>{new Date(tx.created_at).toLocaleDateString("vi-VN")}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={tx.status === "completed" ? "default" : "secondary"}
                              className={tx.status === "completed" ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/30" : ""}
                            >
                              {tx.status === "completed" ? "Thành công" : tx.status}
                            </Badge>
                            {tx.transaction_hash && net && (
                              <a
                                href={`${net.explorer}${tx.transaction_hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:text-primary/80"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <Footer />

      {/* Modals */}
      {walletAddress && (
        <Web3ClaimModal
          open={showClaimModal}
          onOpenChange={setShowClaimModal}
          walletAddress={walletAddress}
          claimableBalance={claimableBalance}
          minClaim={MIN_CLAIM_AMOUNT}
          onClaim={claimToWallet}
        />
      )}

      <WalletConnectDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onConnect={connectWithProvider}
        isConnecting={isConnecting}
        connectingProvider={connectingProvider}
      />
    </div>
  );
};

export default Web3Rewards;
