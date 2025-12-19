import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Coins, 
  Sparkles, 
  Zap, 
  Crown, 
  ArrowLeft,
  Check,
  Mail,
  MessageCircle,
  CreditCard,
  Building2,
  History,
  Copy,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import NavigationHeader from "@/components/NavigationHeader";
import Footer from "@/components/Footer";
import CreditTransactionHistory from "@/components/CreditTransactionHistory";
import { useAuth } from "@/hooks/useAuth";
import { useCamlyCoin } from "@/hooks/useCamlyCoin";
import { toast } from "sonner";

const creditPackages = [
  {
    id: "starter",
    name: "Starter",
    credits: 50,
    price: 49000,
    pricePerCredit: 980,
    icon: Sparkles,
    color: "from-blue-500 to-cyan-500",
    popular: false,
    features: [
      "50 lần tạo ảnh AI",
      "Hỗ trợ email",
      "Không hết hạn"
    ]
  },
  {
    id: "popular",
    name: "Popular",
    credits: 150,
    price: 129000,
    pricePerCredit: 860,
    icon: Zap,
    color: "from-primary to-rose-soft",
    popular: true,
    features: [
      "150 lần tạo ảnh AI",
      "Hỗ trợ ưu tiên",
      "Không hết hạn",
      "Tiết kiệm 12%"
    ]
  },
  {
    id: "premium",
    name: "Premium",
    credits: 500,
    price: 349000,
    pricePerCredit: 698,
    icon: Crown,
    color: "from-amber-500 to-orange-500",
    popular: false,
    features: [
      "500 lần tạo ảnh AI",
      "Hỗ trợ VIP 24/7",
      "Không hết hạn",
      "Tiết kiệm 29%"
    ]
  }
];

export default function Credits() {
  const { user } = useAuth();
  const { 
    balance, 
    formatCoins, 
    isLoading, 
    createPayment, 
    transactions, 
    fetchTransactions,
    isLoadingTransactions 
  } = useCamlyCoin();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user, fetchTransactions]);

  const handlePurchase = async (packageId: string) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để nạp credits");
      return;
    }

    setSelectedPackage(packageId);
    setIsCreatingPayment(true);

    const result = await createPayment(packageId, "bank_transfer");
    
    setIsCreatingPayment(false);

    if (result) {
      setPaymentInfo(result);
      setShowPaymentDialog(true);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Đã sao chép!");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND"
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-rose-light/5 to-background">
      <NavigationHeader />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại trang chủ
          </Link>
          
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/30">
              <Coins className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-foreground">
              Nạp AI Credits
            </h1>
          </div>
          <p className="text-muted-foreground max-w-xl mx-auto mb-6">
            Nạp thêm credits để tiếp tục tạo những hình ảnh thiêng liêng và đẹp đẽ
          </p>

          {/* Current Balance */}
          {user && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-full px-6 py-3"
            >
              <Coins className="w-5 h-5 text-amber-600" />
              <span className="text-lg font-medium">
                Số dư hiện tại: <span className="text-amber-600 font-bold">{isLoading ? "..." : formatCoins(balance.total_coins)}</span> Credits
              </span>
            </motion.div>
          )}
        </motion.div>

        <Tabs defaultValue="packages" className="max-w-5xl mx-auto">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="packages" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Gói Credits
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Lịch sử
            </TabsTrigger>
          </TabsList>

          <TabsContent value="packages">
            {/* Credit Packages */}
            <div className="grid md:grid-cols-3 gap-6 mb-16">
              {creditPackages.map((pkg, index) => {
                const Icon = pkg.icon;
                return (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card 
                      className={`relative h-full border-2 transition-all hover:shadow-lg ${
                        pkg.popular 
                          ? "border-primary shadow-primary/20 shadow-lg" 
                          : "border-border/50 hover:border-primary/50"
                      }`}
                    >
                      {pkg.popular && (
                        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                          Phổ biến nhất
                        </Badge>
                      )}
                      
                      <CardHeader className="text-center pb-2">
                        <div className={`mx-auto p-4 rounded-full bg-gradient-to-br ${pkg.color} mb-4`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                        <CardDescription>
                          <span className="text-3xl font-bold text-foreground">{pkg.credits}</span>
                          <span className="text-muted-foreground ml-1">credits</span>
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="space-y-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-foreground">
                            {formatPrice(pkg.price)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ~{formatPrice(pkg.pricePerCredit)}/credit
                          </div>
                        </div>

                        <ul className="space-y-3">
                          {pkg.features.map((feature, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm">
                              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <Button
                          onClick={() => handlePurchase(pkg.id)}
                          disabled={isCreatingPayment && selectedPackage === pkg.id}
                          className={`w-full ${
                            pkg.popular 
                              ? "bg-gradient-to-r from-primary to-rose-soft hover:opacity-90" 
                              : ""
                          }`}
                          variant={pkg.popular ? "default" : "outline"}
                        >
                          {isCreatingPayment && selectedPackage === pkg.id ? (
                            "Đang xử lý..."
                          ) : (
                            <>
                              <Building2 className="w-4 h-4 mr-2" />
                              Thanh toán
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Payment Methods Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="max-w-2xl mx-auto mb-8"
            >
              <Card className="border-border/50">
                <CardHeader className="text-center">
                  <CardTitle className="text-lg">Phương thức thanh toán</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap justify-center gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <span className="text-sm">Chuyển khoản ngân hàng</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg opacity-50">
                    <CreditCard className="w-5 h-5 text-pink-600" />
                    <span className="text-sm">MoMo (Sắp có)</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg opacity-50">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <span className="text-sm">VNPay (Sắp có)</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="border-rose-soft/30 bg-gradient-to-br from-rose-soft/5 to-primary/5">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2">
                    <MessageCircle className="w-5 h-5 text-primary" />
                    Cần hỗ trợ?
                  </CardTitle>
                  <CardDescription>
                    Liên hệ với chúng tôi nếu bạn có bất kỳ câu hỏi nào về việc nạp credits
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => window.open("mailto:support@camly.app", "_blank")}
                    className="flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    support@camly.app
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => toast.info("Tính năng chat đang được phát triển")}
                    className="flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Chat với Admin
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Lịch sử giao dịch
                </CardTitle>
                <CardDescription>
                  Xem tất cả các giao dịch nạp tiền, sử dụng và thưởng credits
                </CardDescription>
              </CardHeader>
              <CardContent>
                {user ? (
                  <CreditTransactionHistory 
                    transactions={transactions} 
                    isLoading={isLoadingTransactions} 
                  />
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                      Vui lòng đăng nhập để xem lịch sử giao dịch
                    </p>
                    <Link to="/">
                      <Button>Đăng nhập</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Thông tin chuyển khoản
            </DialogTitle>
            <DialogDescription>
              Vui lòng chuyển khoản theo thông tin bên dưới
            </DialogDescription>
          </DialogHeader>

          {paymentInfo && (
            <div className="space-y-4">
              {/* VietQR Code */}
              <div className="flex flex-col items-center bg-white rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-3">Quét mã QR để thanh toán nhanh</p>
                <img
                  src={`https://img.vietqr.io/image/${paymentInfo.bankInfo.bankCode || 'MB'}-${paymentInfo.bankInfo.accountNumber}-compact2.png?amount=${paymentInfo.bankInfo.amount}&addInfo=${encodeURIComponent(paymentInfo.paymentReference)}&accountName=${encodeURIComponent(paymentInfo.bankInfo.accountName)}`}
                  alt="VietQR Code"
                  className="w-48 h-48 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <p className="text-xs text-muted-foreground mt-2">Hỗ trợ mọi ứng dụng ngân hàng</p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Ngân hàng:</span>
                  <span className="font-medium">{paymentInfo.bankInfo.bankName}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Số tài khoản:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium">{paymentInfo.bankInfo.accountNumber}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(paymentInfo.bankInfo.accountNumber, "account")}
                    >
                      {copiedField === "account" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Tên TK:</span>
                  <span className="font-medium">{paymentInfo.bankInfo.accountName}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Số tiền:</span>
                  <span className="font-bold text-primary">
                    {formatPrice(paymentInfo.bankInfo.amount)}
                  </span>
                </div>

                <div className="pt-2 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Nội dung CK:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium text-amber-600">
                        {paymentInfo.paymentReference}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(paymentInfo.paymentReference, "ref")}
                      >
                        {copiedField === "ref" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                <p className="text-sm text-amber-700">
                  <strong>Lưu ý:</strong> Vui lòng ghi đúng nội dung chuyển khoản để hệ thống tự động cộng credits cho bạn.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowPaymentDialog(false)}
                >
                  Đóng
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    const pkg = creditPackages.find(p => p.id === selectedPackage);
                    const subject = encodeURIComponent(`Xác nhận thanh toán - ${paymentInfo.paymentReference}`);
                    const body = encodeURIComponent(
                      `Xin chào Admin,\n\nTôi đã chuyển khoản nạp gói ${pkg?.name} với ${pkg?.credits} credits.\n\nMã giao dịch: ${paymentInfo.paymentReference}\nEmail tài khoản: ${user?.email}\n\nXin cảm ơn!`
                    );
                    window.open(`mailto:support@camly.app?subject=${subject}&body=${body}`, "_blank");
                  }}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Gửi xác nhận
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
