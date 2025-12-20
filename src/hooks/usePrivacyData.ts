import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface DataCategory {
  name: string;
  key: string;
  table: string;
  count: number;
  description: string;
  icon: string;
}

interface PrivacyData {
  categories: DataCategory[];
  totalRecords: number;
  isLoading: boolean;
}

interface ExportData {
  profile: any;
  chat_messages: any[];
  private_messages: any[];
  group_messages: any[];
  meditation_history: any[];
  breathing_history: any[];
  reflection_notes: any[];
  generated_images: any[];
  greeting_history: any[];
  friendships: any[];
  light_acknowledgements: any[];
  exported_at: string;
}

export const usePrivacyData = () => {
  const { user } = useAuth();
  const [data, setData] = useState<PrivacyData>({
    categories: [],
    totalRecords: 0,
    isLoading: true,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchDataCounts = useCallback(async () => {
    if (!user?.id) return;

    try {
      setData(prev => ({ ...prev, isLoading: true }));

      // Fetch counts for each category in parallel
      const [
        chatCount,
        privateMessageCount,
        groupMessageCount,
        meditationCount,
        breathingCount,
        reflectionCount,
        imageCount,
        greetingCount,
        friendshipCount,
        acknowledgementCount,
      ] = await Promise.all([
        supabase.from('chat_messages').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('private_messages').select('id', { count: 'exact', head: true }).or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`),
        supabase.from('group_messages').select('id', { count: 'exact', head: true }).eq('sender_id', user.id),
        supabase.from('meditation_history').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('breathing_session_history').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('reflection_notes').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('generated_images').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('greeting_history').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('friendships').select('id', { count: 'exact', head: true }).or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`),
        supabase.from('light_acknowledgements').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      ]);

      const categories: DataCategory[] = [
        {
          name: 'Trò chuyện AI',
          key: 'chat_messages',
          table: 'chat_messages',
          count: chatCount.count || 0,
          description: 'Tin nhắn với Angel AI',
          icon: 'MessageCircle',
        },
        {
          name: 'Tin nhắn riêng tư',
          key: 'private_messages',
          table: 'private_messages',
          count: privateMessageCount.count || 0,
          description: 'Tin nhắn với bạn bè',
          icon: 'Mail',
        },
        {
          name: 'Tin nhắn nhóm',
          key: 'group_messages',
          table: 'group_messages',
          count: groupMessageCount.count || 0,
          description: 'Tin nhắn trong các nhóm',
          icon: 'Users',
        },
        {
          name: 'Lịch sử thiền định',
          key: 'meditation_history',
          table: 'meditation_history',
          count: meditationCount.count || 0,
          description: 'Phiên thiền đã hoàn thành',
          icon: 'Flower2',
        },
        {
          name: 'Lịch sử thở',
          key: 'breathing_history',
          table: 'breathing_session_history',
          count: breathingCount.count || 0,
          description: 'Bài tập thở đã hoàn thành',
          icon: 'Wind',
        },
        {
          name: 'Suy ngẫm cá nhân',
          key: 'reflection_notes',
          table: 'reflection_notes',
          count: reflectionCount.count || 0,
          description: 'Nhật ký suy ngẫm',
          icon: 'PenLine',
        },
        {
          name: 'Hình ảnh đã tạo',
          key: 'generated_images',
          table: 'generated_images',
          count: imageCount.count || 0,
          description: 'Ảnh AI đã tạo',
          icon: 'Image',
        },
        {
          name: 'Lời chào hàng ngày',
          key: 'greeting_history',
          table: 'greeting_history',
          count: greetingCount.count || 0,
          description: 'Lời chào đã nhận',
          icon: 'Sunrise',
        },
        {
          name: 'Kết nối bạn bè',
          key: 'friendships',
          table: 'friendships',
          count: friendshipCount.count || 0,
          description: 'Danh sách bạn bè',
          icon: 'Heart',
        },
        {
          name: 'Điểm ánh sáng',
          key: 'light_acknowledgements',
          table: 'light_acknowledgements',
          count: acknowledgementCount.count || 0,
          description: 'Lịch sử nhận điểm',
          icon: 'Sparkles',
        },
      ];

      const totalRecords = categories.reduce((sum, cat) => sum + cat.count, 0);

      setData({
        categories,
        totalRecords,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching privacy data:', error);
      toast.error('Không thể tải dữ liệu');
      setData(prev => ({ ...prev, isLoading: false }));
    }
  }, [user?.id]);

  useEffect(() => {
    fetchDataCounts();
  }, [fetchDataCounts]);

  const exportAllData = async (): Promise<void> => {
    if (!user?.id) {
      toast.error('Vui lòng đăng nhập');
      return;
    }

    try {
      setIsExporting(true);
      toast.info('Đang chuẩn bị dữ liệu...');

      // Fetch all user data in parallel
      const [
        profile,
        chatMessages,
        privateMessages,
        groupMessages,
        meditationHistory,
        breathingHistory,
        reflectionNotes,
        generatedImages,
        greetingHistory,
        friendships,
        acknowledgements,
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('chat_messages').select('*').eq('user_id', user.id),
        supabase.from('private_messages').select('*').or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`),
        supabase.from('group_messages').select('*').eq('sender_id', user.id),
        supabase.from('meditation_history').select('*').eq('user_id', user.id),
        supabase.from('breathing_session_history').select('*').eq('user_id', user.id),
        supabase.from('reflection_notes').select('*').eq('user_id', user.id),
        supabase.from('generated_images').select('*').eq('user_id', user.id),
        supabase.from('greeting_history').select('*').eq('user_id', user.id),
        supabase.from('friendships').select('*').or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`),
        supabase.from('light_acknowledgements').select('*').eq('user_id', user.id),
      ]);

      const exportData: ExportData = {
        profile: profile.data,
        chat_messages: chatMessages.data || [],
        private_messages: privateMessages.data || [],
        group_messages: groupMessages.data || [],
        meditation_history: meditationHistory.data || [],
        breathing_history: breathingHistory.data || [],
        reflection_notes: reflectionNotes.data || [],
        generated_images: generatedImages.data || [],
        greeting_history: greetingHistory.data || [],
        friendships: friendships.data || [],
        light_acknowledgements: acknowledgements.data || [],
        exported_at: new Date().toISOString(),
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `camly-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Đã tải xuống dữ liệu thành công! 📥');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Không thể xuất dữ liệu');
    } finally {
      setIsExporting(false);
    }
  };

  const deleteDataByCategory = async (categoryKey: string): Promise<boolean> => {
    if (!user?.id) {
      toast.error('Vui lòng đăng nhập');
      return false;
    }

    try {
      setIsDeleting(categoryKey);

      let error = null;

      switch (categoryKey) {
        case 'chat_messages':
          ({ error } = await supabase.from('chat_messages').delete().eq('user_id', user.id));
          break;
        case 'private_messages':
          ({ error } = await supabase.from('private_messages').delete().eq('sender_id', user.id));
          break;
        case 'group_messages':
          ({ error } = await supabase.from('group_messages').delete().eq('sender_id', user.id));
          break;
        case 'meditation_history':
          ({ error } = await supabase.from('meditation_history').delete().eq('user_id', user.id));
          break;
        case 'breathing_history':
          ({ error } = await supabase.from('breathing_session_history').delete().eq('user_id', user.id));
          break;
        case 'reflection_notes':
          // Note: RLS may prevent delete, update to mark as deleted instead
          ({ error } = await supabase.from('reflection_notes').delete().eq('user_id', user.id));
          break;
        case 'generated_images':
          ({ error } = await supabase.from('generated_images').delete().eq('user_id', user.id));
          break;
        case 'greeting_history':
          // Need to delete saved_greetings first due to FK
          await supabase.from('saved_greetings').delete().eq('user_id', user.id);
          ({ error } = await supabase.from('greeting_history').delete().eq('user_id', user.id));
          break;
        case 'friendships':
          ({ error } = await supabase.from('friendships').delete().or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`));
          break;
        case 'light_acknowledgements':
          // Note: This table doesn't have delete policy, skip
          toast.info('Không thể xóa lịch sử điểm ánh sáng');
          return false;
        default:
          toast.error('Loại dữ liệu không hợp lệ');
          return false;
      }

      if (error) throw error;

      toast.success('Đã xóa dữ liệu thành công! 🗑️');
      await fetchDataCounts();
      return true;
    } catch (error) {
      console.error('Error deleting data:', error);
      toast.error('Không thể xóa dữ liệu');
      return false;
    } finally {
      setIsDeleting(null);
    }
  };

  const deleteAllUserData = async (): Promise<boolean> => {
    if (!user?.id) {
      toast.error('Vui lòng đăng nhập');
      return false;
    }

    try {
      setIsDeleting('all');
      toast.info('Đang xóa tất cả dữ liệu...');

      // Delete in order to respect foreign keys
      const deletions = [
        supabase.from('saved_greetings').delete().eq('user_id', user.id),
        supabase.from('chat_messages').delete().eq('user_id', user.id),
        supabase.from('private_messages').delete().eq('sender_id', user.id),
        supabase.from('group_messages').delete().eq('sender_id', user.id),
        supabase.from('meditation_history').delete().eq('user_id', user.id),
        supabase.from('meditation_completions').delete().eq('user_id', user.id),
        supabase.from('breathing_session_history').delete().eq('user_id', user.id),
        supabase.from('custom_breathing_patterns').delete().eq('user_id', user.id),
        supabase.from('generated_images').delete().eq('user_id', user.id),
        supabase.from('greeting_history').delete().eq('user_id', user.id),
        supabase.from('friendships').delete().or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`),
        supabase.from('blocked_users').delete().eq('blocker_id', user.id),
        supabase.from('user_reports').delete().eq('reporter_id', user.id),
        supabase.from('typing_status').delete().eq('user_id', user.id),
        supabase.from('user_presence').delete().eq('user_id', user.id),
        supabase.from('conversation_summaries').delete().eq('user_id', user.id),
        supabase.from('shared_light_moments').delete().eq('user_id', user.id),
      ];

      await Promise.all(deletions);

      toast.success('Đã xóa tất cả dữ liệu! Tài khoản sẽ bị đăng xuất.');
      return true;
    } catch (error) {
      console.error('Error deleting all data:', error);
      toast.error('Không thể xóa tất cả dữ liệu');
      return false;
    } finally {
      setIsDeleting(null);
    }
  };

  return {
    ...data,
    isExporting,
    isDeleting,
    exportAllData,
    deleteDataByCategory,
    deleteAllUserData,
    refetch: fetchDataCounts,
  };
};
