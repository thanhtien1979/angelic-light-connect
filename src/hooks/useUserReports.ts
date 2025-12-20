import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export type ReportReason = 
  | 'spam'
  | 'harassment'
  | 'inappropriate_content'
  | 'fake_account'
  | 'other';

export const REPORT_REASONS: Record<ReportReason, string> = {
  spam: 'Spam hoặc quảng cáo',
  harassment: 'Quấy rối hoặc bắt nạt',
  inappropriate_content: 'Nội dung không phù hợp',
  fake_account: 'Tài khoản giả mạo',
  other: 'Lý do khác'
};

export const useUserReports = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const reportUser = async (
    reportedId: string, 
    reason: ReportReason, 
    description?: string
  ): Promise<boolean> => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để báo cáo');
      return false;
    }

    if (reportedId === user.id) {
      toast.error('Không thể tự báo cáo mình');
      return false;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from('user_reports')
        .insert({
          reporter_id: user.id,
          reported_id: reportedId,
          reason,
          description
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('Bạn đã báo cáo người dùng này rồi');
        } else {
          throw error;
        }
        return false;
      }

      toast.success('Đã gửi báo cáo! Cảm ơn bạn 🙏', {
        description: 'Chúng tôi sẽ xem xét và xử lý sớm nhất'
      });
      return true;
    } catch (error) {
      console.error('Error reporting user:', error);
      toast.error('Không thể gửi báo cáo');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    reportUser,
    loading,
    REPORT_REASONS
  };
};
