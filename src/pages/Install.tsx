import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Smartphone, Share, MoreVertical, Plus, Check, Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import NavigationHeader from '@/components/NavigationHeader';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const Install = () => {
  const { t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
      <NavigationHeader />
      
      <div className="container max-w-2xl mx-auto px-4 py-8 pt-24">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại trang chủ</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl overflow-hidden shadow-2xl shadow-primary/30">
            <img 
              src="/pwa-512x512.png" 
              alt="Angel AI Icon" 
              className="w-full h-full object-cover"
            />
          </div>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
            Cài đặt Angel AI
          </h1>
          <p className="text-muted-foreground">
            Thêm Angel AI vào màn hình chính để truy cập nhanh hơn
          </p>
        </motion.div>

        {isInstalled ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <Card className="bg-green-500/10 border-green-500/30">
              <CardContent className="p-6">
                <Check className="w-16 h-16 mx-auto text-green-500 mb-4" />
                <h2 className="text-xl font-semibold text-green-500 mb-2">
                  Đã cài đặt thành công!
                </h2>
                <p className="text-muted-foreground">
                  Angel AI đã được thêm vào màn hình chính của bạn
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Install Button for supported browsers */}
            {isInstallable && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Button
                  onClick={handleInstallClick}
                  size="lg"
                  className="w-full h-14 text-lg bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg shadow-primary/30"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Cài đặt ngay
                </Button>
              </motion.div>
            )}

            {/* iOS Instructions */}
            {isIOS && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="overflow-hidden border-primary/20">
                  <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 p-4 border-b border-primary/10">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/20">
                        <Smartphone className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-semibold">Hướng dẫn cho iPhone/iPad</h3>
                    </div>
                  </div>
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                        1
                      </div>
                      <div>
                        <p className="font-medium">Nhấn nút Chia sẻ</p>
                        <div className="flex items-center gap-2 mt-1 text-muted-foreground text-sm">
                          <Share className="w-4 h-4" />
                          <span>Ở thanh dưới cùng của Safari</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                        2
                      </div>
                      <div>
                        <p className="font-medium">Cuộn xuống và chọn</p>
                        <div className="flex items-center gap-2 mt-1 text-muted-foreground text-sm">
                          <Plus className="w-4 h-4" />
                          <span>"Thêm vào MH chính" (Add to Home Screen)</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                        3
                      </div>
                      <div>
                        <p className="font-medium">Nhấn "Thêm"</p>
                        <p className="text-muted-foreground text-sm mt-1">
                          Ở góc phải trên cùng
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Android Instructions */}
            {isAndroid && !isInstallable && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="overflow-hidden border-primary/20">
                  <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 p-4 border-b border-primary/10">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/20">
                        <Smartphone className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-semibold">Hướng dẫn cho Android</h3>
                    </div>
                  </div>
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                        1
                      </div>
                      <div>
                        <p className="font-medium">Nhấn nút Menu</p>
                        <div className="flex items-center gap-2 mt-1 text-muted-foreground text-sm">
                          <MoreVertical className="w-4 h-4" />
                          <span>3 chấm ở góc phải trên của Chrome</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                        2
                      </div>
                      <div>
                        <p className="font-medium">Chọn "Cài đặt ứng dụng"</p>
                        <p className="text-muted-foreground text-sm mt-1">
                          Hoặc "Add to Home screen"
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                        3
                      </div>
                      <div>
                        <p className="font-medium">Nhấn "Cài đặt"</p>
                        <p className="text-muted-foreground text-sm mt-1">
                          Xác nhận để thêm vào màn hình chính
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Desktop Instructions */}
            {!isIOS && !isAndroid && !isInstallable && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="overflow-hidden border-primary/20">
                  <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 p-4 border-b border-primary/10">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/20">
                        <Smartphone className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-semibold">Hướng dẫn cài đặt</h3>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <p className="text-muted-foreground">
                      Mở trang này trên điện thoại di động để cài đặt ứng dụng, 
                      hoặc tìm nút cài đặt trong thanh địa chỉ của trình duyệt.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-primary/10 bg-gradient-to-br from-background to-primary/5">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Lợi ích khi cài đặt</h3>
                  </div>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      Truy cập nhanh từ màn hình chính
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      Hoạt động offline khi mất mạng
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      Tải trang nhanh hơn
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      Trải nghiệm toàn màn hình như app native
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      Tự động cập nhật phiên bản mới
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Install;
