import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface PrivateMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  image_url?: string | null;
  is_read: boolean;
  created_at: string;
  sender_profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

export interface Conversation {
  friendId: string;
  friendName: string | null;
  friendAvatar: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

export const usePrivateMessages = (selectedFriendId?: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Fetch conversations list
  const fetchConversations = useCallback(async () => {
    if (!user) {
      setConversations([]);
      return;
    }

    try {
      // Get all messages where user is sender or receiver
      const { data: messagesData, error } = await supabase
        .from('private_messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by conversation partner
      const conversationMap = new Map<string, {
        messages: any[];
        unreadCount: number;
      }>();

      for (const msg of messagesData || []) {
        const friendId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        
        if (!conversationMap.has(friendId)) {
          conversationMap.set(friendId, { messages: [], unreadCount: 0 });
        }
        
        const conv = conversationMap.get(friendId)!;
        conv.messages.push(msg);
        
        if (!msg.is_read && msg.receiver_id === user.id) {
          conv.unreadCount++;
        }
      }

      // Get friend profiles and presence
      const friendIds = Array.from(conversationMap.keys());
      
      if (friendIds.length === 0) {
        setConversations([]);
        return;
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .in('id', friendIds);

      const { data: presenceData } = await supabase
        .from('user_presence')
        .select('user_id, is_online')
        .in('user_id', friendIds);

      const presenceMap = new Map(
        (presenceData || []).map(p => [p.user_id, p.is_online])
      );

      const profileMap = new Map(
        (profiles || []).map(p => [p.id, p])
      );

      const convList: Conversation[] = Array.from(conversationMap.entries()).map(([friendId, data]) => {
        const profile = profileMap.get(friendId);
        const lastMsg = data.messages[0];
        
        return {
          friendId,
          friendName: profile?.display_name || 'Người dùng',
          friendAvatar: profile?.avatar_url || null,
          lastMessage: lastMsg?.content || '',
          lastMessageTime: lastMsg?.created_at || '',
          unreadCount: data.unreadCount,
          isOnline: presenceMap.get(friendId) || false,
        };
      });

      // Sort by last message time
      convList.sort((a, b) => 
        new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      );

      setConversations(convList);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  }, [user]);

  // Fetch messages with a specific friend
  const fetchMessages = useCallback(async () => {
    if (!user || !selectedFriendId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('private_messages')
        .select('*')
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${selectedFriendId}),and(sender_id.eq.${selectedFriendId},receiver_id.eq.${user.id})`
        )
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

      // Mark unread messages as read
      const unreadIds = (data || [])
        .filter(m => !m.is_read && m.receiver_id === user.id)
        .map(m => m.id);

      if (unreadIds.length > 0) {
        await supabase
          .from('private_messages')
          .update({ is_read: true })
          .in('id', unreadIds);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [user, selectedFriendId]);

  // Send a text message
  const sendMessage = async (content: string) => {
    if (!user || !selectedFriendId || !content.trim()) return false;

    try {
      setSending(true);
      
      const { error } = await supabase
        .from('private_messages')
        .insert({
          sender_id: user.id,
          receiver_id: selectedFriendId,
          content: content.trim(),
        });

      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Không thể gửi tin nhắn');
      return false;
    } finally {
      setSending(false);
    }
  };

  // Send an image message
  const sendImageMessage = async (imageUrl: string, caption?: string) => {
    if (!user || !selectedFriendId) return false;

    try {
      setSending(true);
      
      const { error } = await supabase
        .from('private_messages')
        .insert({
          sender_id: user.id,
          receiver_id: selectedFriendId,
          content: caption || '📷 Hình ảnh',
          image_url: imageUrl,
        });

      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error sending image:', error);
      toast.error('Không thể gửi hình ảnh');
      return false;
    } finally {
      setSending(false);
    }
  };

  // Get total unread count
  const getTotalUnread = useCallback(() => {
    return conversations.reduce((sum, c) => sum + c.unreadCount, 0);
  }, [conversations]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Realtime subscription for messages
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('private-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'private_messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload) => {
          // Refresh messages if in conversation with sender
          if (selectedFriendId === payload.new.sender_id) {
            fetchMessages();
          }
          fetchConversations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'private_messages',
          filter: `sender_id=eq.${user.id}`,
        },
        () => {
          fetchMessages();
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedFriendId, fetchMessages, fetchConversations]);

  return {
    messages,
    conversations,
    loading,
    sending,
    sendMessage,
    sendImageMessage,
    getTotalUnread,
    refetchMessages: fetchMessages,
    refetchConversations: fetchConversations,
  };
};
