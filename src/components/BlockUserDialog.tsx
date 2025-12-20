import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldOff, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface BlockUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => Promise<void>;
  userName: string;
}

const BlockUserDialog = ({ isOpen, onClose, onConfirm, userName }: BlockUserDialogProps) => {
  const [reason, setReason] = useState('');
  const [isBlocking, setIsBlocking] = useState(false);

  const handleConfirm = async () => {
    setIsBlocking(true);
    try {
      await onConfirm(reason || undefined);
      setReason('');
      onClose();
    } finally {
      setIsBlocking(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <ShieldOff className="w-5 h-5" />
            Chặn người dùng
          </DialogTitle>
          <DialogDescription>
            Bạn có chắc muốn chặn <span className="font-semibold">{userName}</span>?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-700 dark:text-amber-300">
              <p className="font-medium mb-1">Khi bạn chặn người này:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Họ không thể gửi tin nhắn cho bạn</li>
                <li>Họ không thể gửi lời mời kết bạn</li>
                <li>Bạn sẽ không thấy họ trong kết quả tìm kiếm</li>
              </ul>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Lý do chặn (không bắt buộc)
            </label>
            <Textarea
              placeholder="Nhập lý do nếu muốn..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isBlocking}>
            Hủy
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            disabled={isBlocking}
          >
            {isBlocking ? 'Đang chặn...' : 'Chặn người dùng'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BlockUserDialog;
