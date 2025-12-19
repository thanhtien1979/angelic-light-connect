import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Coins, 
  Sparkles, 
  Zap, 
  Crown, 
  ArrowLeft,
  Check,
  Mail,
  MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import NavigationHeader from "@/components/NavigationHeader";
import Footer from "@/components/Footer";
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
  const { balance, formatCoins, isLoading } = useCamlyCoin();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const handlePurchase = (packageId: string) => {
    setSelectedPackage(packageId);
    const pkg = creditPackages.find(p => p.id === packageId);
    if (pkg) {
      // Open email with pre-filled subject
      const subject = encodeURIComponent(`Nạp AI Credits - Gói ${pkg.name} (${pkg.credits} credits)`);
      const body = encodeURIComponent(
        `Xin chào Admin,\n\nTôi muốn nạp gói ${pkg.name} với ${pkg.credits} credits.\n\nEmail tài khoản: ${user?.email || "[Email của bạn]"}\n\nXin cảm ơn!`
      );
      window.open(`mailto:support@camly.app?subject=${subject}&body=${body}`, "_blank");
      toast.success("Đã mở email để liên hệ Admin. Vui lòng gửi email để hoàn tất!");
    }
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
                Số dư hiện tại: <span className="text-amber-600 font-bold">{isLoading ? "..." : formatCoins(balance.total_coins)}</span> Camly Coins
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* Credit Packages */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
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
                      className={`w-full ${
                        pkg.popular 
                          ? "bg-gradient-to-r from-primary to-rose-soft hover:opacity-90" 
                          : ""
                      }`}
                      variant={pkg.popular ? "default" : "outline"}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Liên hệ mua
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

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
      </main>

      <Footer />
    </div>
  );
}
