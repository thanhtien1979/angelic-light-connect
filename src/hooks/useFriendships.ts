import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  requester?: Profile;
  addressee?: Profile;
}

export const useFriendships = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
  const [sentRequests, setSentRequests] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFriendships = useCallback(async () => {
    if (!user) {
      setFriends([]);
      setPendingRequests([]);
      setSentRequests([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch all friendships where user is involved
      const { data, error } = await supabase
        .from('friendships')
        .select('*')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      if (error) throw error;

      const friendshipsWithProfiles: Friendship[] = [];
      
      // Fetch profiles for each friendship
      for (const friendship of data || []) {
        const otherUserId = friendship.requester_id === user.id 
          ? friendship.addressee_id 
          : friendship.requester_id;
        
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url')
          .eq('id', otherUserId)
          .maybeSingle();

        friendshipsWithProfiles.push({
          ...friendship,
          status: friendship.status as 'pending' | 'accepted' | 'rejected',
          requester: friendship.requester_id === user.id ? undefined : profileData || undefined,
          addressee: friendship.addressee_id === user.id ? undefined : profileData || undefined,
        });
      }

      // Separate into categories
      const accepted = friendshipsWithProfiles.filter(f => f.status === 'accepted');
      const pending = friendshipsWithProfiles.filter(
        f => f.status === 'pending' && f.addressee_id === user.id
      );
      const sent = friendshipsWithProfiles.filter(
        f => f.status === 'pending' && f.requester_id === user.id
      );

      setFriends(accepted);
      setPendingRequests(pending);
      setSentRequests(sent);
    } catch (error) {
      console.error('Error fetching friendships:', error);
      toast.error('Không thể tải danh sách bạn bè');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const sendFriendRequest = async (addresseeId: string) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để gửi lời mời kết bạn');
      return false;
    }

    if (addresseeId === user.id) {
      toast.error('Không thể gửi lời mời cho chính mình');
      return false;
    }

    try {
      const { error } = await supabase
        .from('friendships')
        .insert({
          requester_id: user.id,
          addressee_id: addresseeId,
          status: 'pending'
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('Lời mời kết bạn đã tồn tại');
        } else {
          throw error;
        }
        return false;
      }

      toast.success('Đã gửi lời mời kết bạn! ✨');
      await fetchFriendships();
      return true;
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Không thể gửi lời mời kết bạn');
      return false;
    }
  };

  const acceptFriendRequest = async (friendshipId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', friendshipId)
        .eq('addressee_id', user.id);

      if (error) throw error;

      toast.success('Đã chấp nhận lời mời kết bạn! 💛');
      await fetchFriendships();
      return true;
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast.error('Không thể chấp nhận lời mời');
      return false;
    }
  };

  const rejectFriendRequest = async (friendshipId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'rejected' })
        .eq('id', friendshipId)
        .eq('addressee_id', user.id);

      if (error) throw error;

      toast.success('Đã từ chối lời mời kết bạn');
      await fetchFriendships();
      return true;
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      toast.error('Không thể từ chối lời mời');
      return false;
    }
  };

  const cancelFriendRequest = async (friendshipId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId)
        .eq('requester_id', user.id);

      if (error) throw error;

      toast.success('Đã hủy lời mời kết bạn');
      await fetchFriendships();
      return true;
    } catch (error) {
      console.error('Error canceling friend request:', error);
      toast.error('Không thể hủy lời mời');
      return false;
    }
  };

  const unfriend = async (friendshipId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;

      toast.success('Đã hủy kết bạn');
      await fetchFriendships();
      return true;
    } catch (error) {
      console.error('Error unfriending:', error);
      toast.error('Không thể hủy kết bạn');
      return false;
    }
  };

  const searchUsers = async (query: string): Promise<Profile[]> => {
    if (!query.trim() || query.length < 2) return [];

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .ilike('display_name', `%${query}%`)
        .limit(10);

      if (error) throw error;
      
      // Filter out current user
      return (data || []).filter(p => p.id !== user?.id);
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchFriendships();
  }, [fetchFriendships]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('friendships-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friendships',
          filter: `requester_id=eq.${user.id}`
        },
        () => fetchFriendships()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friendships',
          filter: `addressee_id=eq.${user.id}`
        },
        () => fetchFriendships()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchFriendships]);

  return {
    friends,
    pendingRequests,
    sentRequests,
    loading,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    unfriend,
    searchUsers,
    refetch: fetchFriendships
  };
};
