import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface BlockedUser {
  id: string;
  blocker_id: string;
  blocked_id: string;
  reason: string | null;
  created_at: string;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

export const useBlockedUsers = () => {
  const { user } = useAuth();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [blockedByUsers, setBlockedByUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBlockedUsers = useCallback(async () => {
    if (!user) {
      setBlockedUsers([]);
      setBlockedByUsers([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch users I blocked
      const { data: blocked, error } = await supabase
        .from('blocked_users')
        .select('*')
        .eq('blocker_id', user.id);

      if (error) throw error;

      // Fetch profiles for blocked users
      if (blocked && blocked.length > 0) {
        const blockedIds = blocked.map(b => b.blocked_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url')
          .in('id', blockedIds);

        const blockedWithProfiles = blocked.map(b => ({
          ...b,
          profile: profiles?.find(p => p.id === b.blocked_id)
        }));

        setBlockedUsers(blockedWithProfiles);
      } else {
        setBlockedUsers([]);
      }

      // We can't directly query who blocked us due to RLS, 
      // but we can check if messages fail to send
    } catch (error) {
      console.error('Error fetching blocked users:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBlockedUsers();
  }, [fetchBlockedUsers]);

  const blockUser = async (userId: string, reason?: string) => {
    if (!user || userId === user.id) return false;

    try {
      const { error } = await supabase
        .from('blocked_users')
        .insert({
          blocker_id: user.id,
          blocked_id: userId,
          reason: reason || null
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('Người dùng này đã bị chặn');
          return false;
        }
        throw error;
      }

      toast.success('Đã chặn người dùng');
      await fetchBlockedUsers();
      return true;
    } catch (error) {
      console.error('Error blocking user:', error);
      toast.error('Không thể chặn người dùng');
      return false;
    }
  };

  const unblockUser = async (blockedId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .eq('blocker_id', user.id)
        .eq('blocked_id', blockedId);

      if (error) throw error;

      toast.success('Đã bỏ chặn người dùng');
      await fetchBlockedUsers();
      return true;
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast.error('Không thể bỏ chặn người dùng');
      return false;
    }
  };

  const isBlocked = useCallback((userId: string) => {
    return blockedUsers.some(b => b.blocked_id === userId);
  }, [blockedUsers]);

  const isBlockedBy = useCallback((userId: string) => {
    return blockedByUsers.includes(userId);
  }, [blockedByUsers]);

  return {
    blockedUsers,
    loading,
    blockUser,
    unblockUser,
    isBlocked,
    isBlockedBy,
    refetch: fetchBlockedUsers
  };
};
