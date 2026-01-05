import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { attemptSilentRefresh } from "@/hooks/useTokenRefresh";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LogIn, LogOut, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface SessionExpiredDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SessionExpiredDialog = ({ isOpen, onClose }: SessionExpiredDialogProps) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      const success = await attemptSilentRefresh(false);
      if (success) {
        toast.success("Đã kết nối lại thành công!");
        onClose();
      } else {
        toast.error("Không thể kết nối lại. Vui lòng đăng nhập lại.");
      }
    } finally {
      setIsRetrying(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onClose();
    window.location.reload();
  };

  const handleReLogin = async () => {
    await supabase.auth.signOut();
    onClose();
    // Redirect to home page where they can log in again
    window.location.href = "/";
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-gradient-to-br from-background via-background to-primary/5 border-primary/20">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground flex items-center gap-2">
            <span className="text-2xl">⏰</span>
            Phiên đăng nhập đã hết hạn
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            Phiên đăng nhập của bạn đã hết hạn. Bạn có thể thử kết nối lại hoặc đăng nhập lại.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-muted hover:bg-muted/80 text-muted-foreground"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </AlertDialogCancel>
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium h-10 px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Đang thử...' : 'Thử lại'}
          </button>
          <AlertDialogAction 
            onClick={handleReLogin}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <LogIn className="w-4 h-4" />
            Đăng nhập lại
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
