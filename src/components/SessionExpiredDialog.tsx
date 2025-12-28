import { supabase } from "@/integrations/supabase/client";
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
import { LogIn, LogOut } from "lucide-react";

interface SessionExpiredDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SessionExpiredDialog = ({ isOpen, onClose }: SessionExpiredDialogProps) => {
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
            Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại để tiếp tục sử dụng các tính năng.
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
