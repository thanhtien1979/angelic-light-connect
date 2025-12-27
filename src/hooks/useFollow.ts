import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const useFollow = (targetUserId?: string) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFollowStatus = useCallback(async () => {
    if (!user || !targetUserId) return;

    try {
      // Check if current user follows target
      const { data: followData } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .maybeSingle();

      setIsFollowing(!!followData);

      // Get followers count
      const { count: followers } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', targetUserId);

      // Get following count
      const { count: following } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', targetUserId);

      setFollowersCount(followers || 0);
      setFollowingCount(following || 0);
    } catch (error) {
      console.error('Error fetching follow status:', error);
    }
  }, [user, targetUserId]);

  useEffect(() => {
    fetchFollowStatus();
  }, [fetchFollowStatus]);

  // Real-time subscription
  useEffect(() => {
    if (!targetUserId) return;

    const channel = supabase
      .channel(`follows-${targetUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_follows',
          filter: `following_id=eq.${targetUserId}`
        },
        () => {
          fetchFollowStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [targetUserId, fetchFollowStatus]);

  const toggleFollow = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để theo dõi');
      return;
    }

    if (!targetUserId || user.id === targetUserId) return;

    setIsLoading(true);
    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);

        if (error) throw error;
        setIsFollowing(false);
        setFollowersCount(prev => Math.max(0, prev - 1));
        toast.success('Đã hủy theo dõi');
      } else {
        // Follow
        const { error } = await supabase
          .from('user_follows')
          .insert({
            follower_id: user.id,
            following_id: targetUserId
          });

        if (error) throw error;
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
        toast.success('Đã theo dõi');
      }
    } catch (error: any) {
      console.error('Error toggling follow:', error);
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isFollowing,
    followersCount,
    followingCount,
    isLoading,
    toggleFollow,
    refetch: fetchFollowStatus
  };
};

export const useFollowList = (userId?: string, type: 'followers' | 'following' = 'followers') => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchList = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      if (type === 'followers') {
        const { data } = await supabase
          .from('user_follows')
          .select('follower_id, created_at')
          .eq('following_id', userId)
          .order('created_at', { ascending: false });

        if (data) {
          const userIds = data.map(f => f.follower_id);
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, display_name, avatar_url')
            .in('id', userIds);

          setUsers(profiles || []);
        }
      } else {
        const { data } = await supabase
          .from('user_follows')
          .select('following_id, created_at')
          .eq('follower_id', userId)
          .order('created_at', { ascending: false });

        if (data) {
          const userIds = data.map(f => f.following_id);
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, display_name, avatar_url')
            .in('id', userIds);

          setUsers(profiles || []);
        }
      }
    } catch (error) {
      console.error('Error fetching follow list:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, type]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  return { users, isLoading, refetch: fetchList };
};
