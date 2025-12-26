import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  is_online?: boolean;
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
      
      // Get all other user IDs
      const otherUserIds = (data || []).map(f => 
        f.requester_id === user.id ? f.addressee_id : f.requester_id
      );

      // Batch fetch profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .in('id', otherUserIds);

      // Batch fetch presence
      const { data: presenceData } = await supabase
        .from('user_presence')
        .select('user_id, is_online')
        .in('user_id', otherUserIds);

      const profileMap = new Map(
        (profiles || []).map(p => [p.id, p])
      );
      const presenceMap = new Map(
        (presenceData || []).map(p => [p.user_id, p.is_online])
      );

      // Build friendships with profiles and presence
      for (const friendship of data || []) {
        const otherUserId = friendship.requester_id === user.id 
          ? friendship.addressee_id 
          : friendship.requester_id;
        
        const profile = profileMap.get(otherUserId);
        const isOnline = presenceMap.get(otherUserId) || false;

        const profileWithPresence = profile ? {
          ...profile,
          is_online: isOnline,
        } : undefined;

        friendshipsWithProfiles.push({
          ...friendship,
          status: friendship.status as 'pending' | 'accepted' | 'rejected',
          requester: friendship.requester_id === user.id ? undefined : profileWithPresence,
          addressee: friendship.addressee_id === user.id ? undefined : profileWithPresence,
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
      // Get blocked users first
      const { data: blockedData } = await supabase
        .from('blocked_users')
        .select('blocked_id, blocker_id')
        .or(`blocker_id.eq.${user?.id},blocked_id.eq.${user?.id}`);

      const blockedIds = new Set<string>();
      (blockedData || []).forEach(b => {
        if (b.blocker_id === user?.id) blockedIds.add(b.blocked_id);
        if (b.blocked_id === user?.id) blockedIds.add(b.blocker_id);
      });

      // Get users with profile_visibility = 'nobody' (they should not appear in search)
      const { data: privateProfiles } = await supabase
        .from('privacy_settings')
        .select('user_id')
        .eq('profile_visibility', 'nobody');

      const privateUserIds = new Set(
        (privateProfiles || []).map(p => p.user_id)
      );

      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .ilike('display_name', `%${query}%`)
        .limit(20);

      if (error) throw error;
      
      // Filter out current user, blocked users, existing friendships, and private profiles
      const existingFriendIds = new Set([
        ...friends.map(f => f.requester_id === user?.id ? f.addressee_id : f.requester_id),
        ...pendingRequests.map(f => f.requester_id),
        ...sentRequests.map(f => f.addressee_id)
      ]);
      
      return (data || []).filter(p => 
        p.id !== user?.id && 
        !blockedIds.has(p.id) &&
        !existingFriendIds.has(p.id) &&
        !privateUserIds.has(p.id)
      );
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchFriendships();
  }, [fetchFriendships]);

  // Track previous pending requests count to detect new ones
  const prevPendingCountRef = useRef<number>(0);
  const isInitialLoadRef = useRef<boolean>(true);

  // Update ref when pending requests change
  useEffect(() => {
    if (isInitialLoadRef.current) {
      prevPendingCountRef.current = pendingRequests.length;
      isInitialLoadRef.current = false;
      return;
    }

    // Check if we have new pending requests
    if (pendingRequests.length > prevPendingCountRef.current) {
      const newRequest = pendingRequests[0]; // Most recent request
      const senderName = newRequest?.requester?.display_name || 'Ai đó';
      
      // Show notification toast
      toast.success(
        `💌 ${senderName} đã gửi lời mời kết bạn!`,
        {
          description: 'Nhấn vào đây để xem lời mời',
          duration: 5000,
          action: {
            label: 'Xem',
            onClick: () => {
              window.location.href = '/community';
            },
          },
        }
      );
    }

    prevPendingCountRef.current = pendingRequests.length;
  }, [pendingRequests]);

  // Realtime subscription with notification
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('friendships-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'friendships',
          filter: `addressee_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New friend request received:', payload);
          // Just refresh - notification is handled by useFriendRequestSound
          fetchFriendships();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'friendships',
          filter: `requester_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('Friend request updated:', payload);
          
          if (payload.new.status === 'accepted') {
            const { data: profile } = await supabase
              .from('profiles')
              .select('display_name')
              .eq('id', payload.new.addressee_id)
              .maybeSingle();
            
            const friendName = profile?.display_name || 'Ai đó';
            
            toast.success(
              `🎉 ${friendName} đã chấp nhận lời mời kết bạn!`,
              {
                description: 'Giờ các bạn có thể nhắn tin với nhau',
                duration: 5000,
              }
            );
          }
          
          fetchFriendships();
        }
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
