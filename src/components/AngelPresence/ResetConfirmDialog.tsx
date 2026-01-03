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
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface ResetConfirmDialogProps {
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ResetConfirmDialog({ onConfirm, isLoading }: ResetConfirmDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
          disabled={isLoading}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Đặt lại mặc định
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-primary" />
            Đặt lại Angel Presence?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            Điều này sẽ đặt lại tất cả cài đặt Angel Presence về mặc định. 
            Hình ảnh tùy chỉnh của bạn sẽ được giữ nguyên nhưng sẽ chuyển về thiên thần mặc định.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="text-muted-foreground">
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-primary hover:bg-primary/90"
          >
            Đặt lại
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
