import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface GroupChat {
  id: string;
  name: string;
  avatar_url: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  memberCount?: number;
  lastMessage?: string;
  lastMessageTime?: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

export interface GroupMessage {
  id: string;
  group_id: string;
  sender_id: string;
  content: string;
  image_url: string | null;
  sticker_id: string | null;
  file_url: string | null;
  file_name: string | null;
  file_type: string | null;
  created_at: string;
  sender_profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

export const useGroupChat = (selectedGroupId?: string) => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<GroupChat[]>([]);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Fetch user's groups
  const fetchGroups = useCallback(async () => {
    if (!user) {
      setGroups([]);
      return;
    }

    try {
      // Get groups where user is a member
      const { data: memberData, error: memberError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      const groupIds = (memberData || []).map(m => m.group_id);
      
      if (groupIds.length === 0) {
        setGroups([]);
        return;
      }

      const { data: groupsData, error: groupsError } = await supabase
        .from('group_chats')
        .select('*')
        .in('id', groupIds)
        .order('updated_at', { ascending: false });

      if (groupsError) throw groupsError;

      // Get member counts and last messages
      const enrichedGroups = await Promise.all(
        (groupsData || []).map(async (group) => {
          const { count } = await supabase
            .from('group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id);

          const { data: lastMsg } = await supabase
            .from('group_messages')
            .select('content, created_at')
            .eq('group_id', group.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...group,
            memberCount: count || 0,
            lastMessage: lastMsg?.content || '',
            lastMessageTime: lastMsg?.created_at || group.created_at,
          };
        })
      );

      setGroups(enrichedGroups);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  }, [user]);

  // Fetch messages for selected group
  const fetchMessages = useCallback(async () => {
    if (!user || !selectedGroupId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('group_messages')
        .select('*')
        .eq('group_id', selectedGroupId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Get sender profiles
      const senderIds = [...new Set((data || []).map(m => m.sender_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .in('id', senderIds);

      const profileMap = new Map(
        (profiles || []).map(p => [p.id, p])
      );

      const messagesWithProfiles = (data || []).map(msg => ({
        ...msg,
        sender_profile: profileMap.get(msg.sender_id) || undefined,
      }));

      setMessages(messagesWithProfiles);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [user, selectedGroupId]);

  // Fetch group members
  const fetchMembers = useCallback(async () => {
    if (!user || !selectedGroupId) {
      setMembers([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', selectedGroupId);

      if (error) throw error;

      // Get member profiles
      const userIds = (data || []).map(m => m.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .in('id', userIds);

      const profileMap = new Map(
        (profiles || []).map(p => [p.id, p])
      );

      const membersWithProfiles = (data || []).map(member => ({
        ...member,
        role: member.role as 'admin' | 'member',
        profile: profileMap.get(member.user_id) || undefined,
      }));

      setMembers(membersWithProfiles);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  }, [user, selectedGroupId]);

  // Create a new group
  const createGroup = async (name: string, memberIds: string[]) => {
    if (!user || !name.trim()) return null;

    try {
      // Create the group
      const { data: group, error: groupError } = await supabase
        .from('group_chats')
        .insert({
          name: name.trim(),
          created_by: user.id,
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Add creator as admin
      await supabase.from('group_members').insert({
        group_id: group.id,
        user_id: user.id,
        role: 'admin',
      });

      // Add other members
      if (memberIds.length > 0) {
        const memberInserts = memberIds.map(userId => ({
          group_id: group.id,
          user_id: userId,
          role: 'member',
        }));
        await supabase.from('group_members').insert(memberInserts);
      }

      toast.success('Đã tạo nhóm thành công! 🎉');
      fetchGroups();
      return group;
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Không thể tạo nhóm');
      return null;
    }
  };

  // Send a message to group
  const sendMessage = async (content: string, stickerId?: string) => {
    if (!user || !selectedGroupId || (!content.trim() && !stickerId)) return false;

    try {
      setSending(true);

      const { error } = await supabase.from('group_messages').insert({
        group_id: selectedGroupId,
        sender_id: user.id,
        content: stickerId ? '🎭 Sticker' : content.trim(),
        sticker_id: stickerId || null,
      });

      if (error) throw error;

      // Update group's updated_at
      await supabase
        .from('group_chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedGroupId);

      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Không thể gửi tin nhắn');
      return false;
    } finally {
      setSending(false);
    }
  };

  // Send image message
  const sendImageMessage = async (imageUrl: string) => {
    if (!user || !selectedGroupId) return false;

    try {
      setSending(true);

      const { error } = await supabase.from('group_messages').insert({
        group_id: selectedGroupId,
        sender_id: user.id,
        content: '📷 Hình ảnh',
        image_url: imageUrl,
      });

      if (error) throw error;

      await supabase
        .from('group_chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedGroupId);

      return true;
    } catch (error) {
      console.error('Error sending image:', error);
      toast.error('Không thể gửi hình ảnh');
      return false;
    } finally {
      setSending(false);
    }
  };

  // Send file message
  const sendFileMessage = async (fileUrl: string, fileName: string, fileType: string) => {
    if (!user || !selectedGroupId) return false;

    try {
      setSending(true);

      const { error } = await supabase.from('group_messages').insert({
        group_id: selectedGroupId,
        sender_id: user.id,
        content: `📎 ${fileName}`,
        file_url: fileUrl,
        file_name: fileName,
        file_type: fileType,
      });

      if (error) throw error;

      await supabase
        .from('group_chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedGroupId);

      return true;
    } catch (error) {
      console.error('Error sending file:', error);
      toast.error('Không thể gửi file');
      return false;
    } finally {
      setSending(false);
    }
  };

  // Add member to group
  const addMember = async (userId: string) => {
    if (!user || !selectedGroupId) return false;

    try {
      const { error } = await supabase.from('group_members').insert({
        group_id: selectedGroupId,
        user_id: userId,
        role: 'member',
      });

      if (error) throw error;

      toast.success('Đã thêm thành viên!');
      fetchMembers();
      return true;
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error('Không thể thêm thành viên');
      return false;
    }
  };

  // Remove member from group
  const removeMember = async (userId: string) => {
    if (!user || !selectedGroupId) return false;

    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', selectedGroupId)
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('Đã xóa thành viên!');
      fetchMembers();
      return true;
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Không thể xóa thành viên');
      return false;
    }
  };

  // Leave group
  const leaveGroup = async (groupId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Đã rời khỏi nhóm!');
      fetchGroups();
      return true;
    } catch (error) {
      console.error('Error leaving group:', error);
      toast.error('Không thể rời khỏi nhóm');
      return false;
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  useEffect(() => {
    fetchMessages();
    fetchMembers();
  }, [fetchMessages, fetchMembers]);

  // Realtime subscription
  useEffect(() => {
    if (!user || !selectedGroupId) return;

    const channel = supabase
      .channel(`group-messages-${selectedGroupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=eq.${selectedGroupId}`,
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedGroupId, fetchMessages]);

  return {
    groups,
    messages,
    members,
    loading,
    sending,
    createGroup,
    sendMessage,
    sendImageMessage,
    sendFileMessage,
    addMember,
    removeMember,
    leaveGroup,
    refetchGroups: fetchGroups,
    refetchMessages: fetchMessages,
  };
};