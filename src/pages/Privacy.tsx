import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { usePrivacyData } from "@/hooks/usePrivacyData";
import {
  ArrowLeft,
  Shield,
  Download,
  Trash2,
  AlertTriangle,
  MessageCircle,
  Mail,
  Users,
  Flower2,
  Wind,
  PenLine,
  Image,
  Sunrise,
  Heart,
  Sparkles,
  CheckCircle2,
  Loader2,
  FileJson,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import SacredGeometryWatermark from "@/components/SacredGeometryWatermark";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  MessageCircle,
  Mail,
  Users,
  Flower2,
  Wind,
  PenLine,
  Image,
  Sunrise,
  Heart,
  Sparkles,
};

const Privacy = () => {
  const { user, signOut } = useAuth();
  const {
    categories,
    totalRecords,
    isLoading,
    isExporting,
    isDeleting,
    exportAllData,
    deleteDataByCategory,
    deleteAllUserData,
  } = usePrivacyData();

  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState("");
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);

  const handleDeleteCategory = async (categoryKey: string) => {
    setDeletingCategory(categoryKey);
    await deleteDataByCategory(categoryKey);
    setDeletingCategory(null);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmEmail !== user?.email) {
      toast.error("Email không khớp");
      return;
    }

    const success = await deleteAllUserData();
    if (success) {
      setTimeout(() => {
        signOut();
        window.location.href = "/";
      }, 2000);
    }
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Người dùng";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 relative">
      <SacredGeometryWatermark />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/profile" className="p-2 rounded-full hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground/70" />
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-semibold text-foreground">Quyền Riêng Tư & Dữ Liệu</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* GDPR Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-start gap-3"
        >
          <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-foreground">
              <strong>Quyền của bạn theo GDPR:</strong> Bạn có quyền xem, tải xuống và xóa tất cả dữ liệu cá nhân của mình. 
              Chúng tôi cam kết bảo vệ quyền riêng tư của bạn.
            </p>
          </div>
        </motion.div>

        {/* Data Overview */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="backdrop-blur-sm bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                Tổng Quan Dữ Liệu
              </CardTitle>
              <CardDescription>
                Xin chào {displayName}, dưới đây là tổng quan về dữ liệu của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-muted/30 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-muted/30">
                    <span className="text-sm text-muted-foreground">Tổng số bản ghi</span>
                    <span className="text-2xl font-bold text-primary">{totalRecords.toLocaleString()}</span>
                  </div>

                  <div className="grid gap-3">
                    {categories.map((category, index) => {
                      const IconComponent = iconMap[category.icon] || CheckCircle2;
                      const percentage = totalRecords > 0 ? (category.count / totalRecords) * 100 : 0;

                      return (
                        <motion.div
                          key={category.key}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
                        >
                          <div className="p-2 rounded-full bg-primary/10">
                            <IconComponent className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-foreground truncate">
                                {category.name}
                              </span>
                              <span className="text-sm text-muted-foreground ml-2">
                                {category.count.toLocaleString()}
                              </span>
                            </div>
                            <Progress value={percentage} className="h-1.5" />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.section>

        {/* Data Export */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="backdrop-blur-sm bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif">
                <Download className="w-5 h-5 text-primary" />
                Xuất Dữ Liệu (GDPR Điều 20)
              </CardTitle>
              <CardDescription>
                Tải xuống tất cả dữ liệu cá nhân của bạn dưới dạng JSON
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-primary/10">
                    <FileJson className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Tất cả dữ liệu của bạn</p>
                    <p className="text-sm text-muted-foreground">
                      Bao gồm: tin nhắn, lịch sử thiền, suy ngẫm, hình ảnh, v.v.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={exportAllData}
                  disabled={isExporting || isLoading}
                  className="gap-2"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang xuất...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Tải xuống
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Selective Data Deletion */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="backdrop-blur-sm bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif">
                <Trash2 className="w-5 h-5 text-destructive" />
                Xóa Dữ Liệu Chọn Lọc
              </CardTitle>
              <CardDescription>
                Xóa từng loại dữ liệu riêng biệt. Hành động này không thể hoàn tác!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-muted/30 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                categories
                  .filter((cat) => cat.count > 0)
                  .map((category) => {
                    const IconComponent = iconMap[category.icon] || CheckCircle2;
                    const isCurrentlyDeleting = deletingCategory === category.key || isDeleting === category.key;

                    return (
                      <div
                        key={category.key}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-border/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-destructive/10">
                            <IconComponent className="w-4 h-4 text-destructive" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{category.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {category.count.toLocaleString()} bản ghi • {category.description}
                            </p>
                          </div>
                        </div>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive border-destructive/30 hover:bg-destructive/10"
                              disabled={isCurrentlyDeleting}
                            >
                              {isCurrentlyDeleting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-destructive" />
                                Xác nhận xóa {category.name}?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Bạn sắp xóa <strong>{category.count.toLocaleString()}</strong> bản ghi. 
                                Hành động này không thể hoàn tác. Bạn có chắc chắn muốn tiếp tục?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteCategory(category.key)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Xóa vĩnh viễn
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    );
                  })
              )}

              {!isLoading && categories.filter((cat) => cat.count > 0).length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-primary/50" />
                  <p>Không có dữ liệu để xóa</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.section>

        <Separator className="bg-border/50" />

        {/* Account Deletion - Danger Zone */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="backdrop-blur-sm bg-destructive/5 border-destructive/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Vùng Nguy Hiểm
              </CardTitle>
              <CardDescription>
                Xóa toàn bộ tài khoản và dữ liệu. Hành động này KHÔNG THỂ hoàn tác!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-foreground">
                    <p className="font-medium mb-2">Khi xóa tài khoản, tất cả dữ liệu sau sẽ bị xóa vĩnh viễn:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Tất cả tin nhắn và cuộc trò chuyện</li>
                      <li>Lịch sử thiền định và bài tập thở</li>
                      <li>Suy ngẫm và nhật ký ánh sáng</li>
                      <li>Hình ảnh đã tạo</li>
                      <li>Kết nối bạn bè</li>
                      <li>Điểm Camly Coin</li>
                    </ul>
                  </div>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full gap-2">
                      <Trash2 className="w-4 h-4" />
                      Xóa tài khoản và toàn bộ dữ liệu
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                        Xác nhận xóa tài khoản?
                      </AlertDialogTitle>
                      <AlertDialogDescription asChild>
                        <div className="space-y-4">
                          <p>
                            Đây là hành động cuối cùng và không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn.
                          </p>
                          <div className="space-y-2">
                            <Label htmlFor="confirm-email">
                              Nhập email <strong>{user?.email}</strong> để xác nhận:
                            </Label>
                            <Input
                              id="confirm-email"
                              type="email"
                              placeholder="Nhập email của bạn"
                              value={deleteConfirmEmail}
                              onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                              className="border-destructive/50 focus:border-destructive"
                            />
                          </div>
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setDeleteConfirmEmail("")}>
                        Hủy
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        disabled={deleteConfirmEmail !== user?.email || isDeleting === 'all'}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        {isDeleting === 'all' ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Đang xóa...
                          </>
                        ) : (
                          'Xác nhận xóa tài khoản'
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center py-8 text-sm text-muted-foreground"
        >
          <p>
            Nếu bạn có thắc mắc về quyền riêng tư, vui lòng liên hệ với chúng tôi.
          </p>
          <p className="mt-2">
            © {new Date().getFullYear()} Camly - Bảo vệ quyền riêng tư của bạn
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export default Privacy;
