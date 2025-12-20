import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Flag } from 'lucide-react';
import { useUserReports, ReportReason } from '@/hooks/useUserReports';

const REPORT_REASONS_MAP: Record<ReportReason, string> = {
  spam: 'Spam hoặc quảng cáo',
  harassment: 'Quấy rối hoặc bắt nạt',
  inappropriate_content: 'Nội dung không phù hợp',
  fake_account: 'Tài khoản giả mạo',
  other: 'Lý do khác'
};

interface ReportUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

const ReportUserDialog = ({ isOpen, onClose, userId, userName }: ReportUserDialogProps) => {
  const [reason, setReason] = useState<ReportReason>('spam');
  const [description, setDescription] = useState('');
  const { reportUser, loading } = useUserReports();

  const handleSubmit = async () => {
    const success = await reportUser(userId, reason, description);
    if (success) {
      setReason('spam');
      setDescription('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-border">
        <DialogHeader>
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
            <Flag className="w-5 h-5" />
            <DialogTitle>Báo cáo người dùng</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            Báo cáo <span className="font-semibold text-foreground">{userName}</span> vì vi phạm quy tắc cộng đồng
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Lý do báo cáo</Label>
            <RadioGroup value={reason} onValueChange={(v) => setReason(v as ReportReason)}>
              {(Object.keys(REPORT_REASONS_MAP) as ReportReason[]).map((key) => (
                <div key={key} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value={key} id={key} />
                  <Label htmlFor={key} className="cursor-pointer text-sm">
                    {REPORT_REASONS_MAP[key]}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Mô tả thêm (tùy chọn)</Label>
            <Textarea
              placeholder="Chia sẻ thêm chi tiết để chúng tôi hiểu rõ hơn..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px] resize-none"
            />
          </div>

          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Chúng tôi sẽ xem xét báo cáo của bạn và có hành động phù hợp. 
              Cảm ơn bạn đã giúp giữ cho cộng đồng được an toàn.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
          >
            {loading ? 'Đang gửi...' : 'Gửi báo cáo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportUserDialog;
