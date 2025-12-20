import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, UserPlus, MessageCircle, Heart, Sparkles, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useFriendships } from '@/hooks/useFriendships';
import { usePrivateMessages } from '@/hooks/usePrivateMessages';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  type: 'friend_request' | 'message' | 'friend_accepted';
  title: string;
  message: string;
  avatar?: string | null;
  time: string;
  read: boolean;
  actionData?: any;
}

const NotificationCenter = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const { pendingRequests, acceptFriendRequest, rejectFriendRequest } = useFriendships();
  const { conversations, getTotalUnread } = usePrivateMessages();

  // Build notifications from pending requests and unread messages
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const notifs: Notification[] = [];

    // Add friend requests
    pendingRequests.forEach((req) => {
      notifs.push({
        id: `friend-${req.id}`,
        type: 'friend_request',
        title: 'Lời mời kết bạn',
        message: `${req.requester?.display_name || 'Ai đó'} muốn kết bạn với bạn`,
        avatar: req.requester?.avatar_url,
        time: req.created_at,
        read: false,
        actionData: { friendshipId: req.id, requesterId: req.requester_id },
      });
    });

    // Add unread messages
    conversations
      .filter(conv => conv.unreadCount > 0)
      .forEach((conv) => {
        notifs.push({
          id: `msg-${conv.friendId}`,
          type: 'message',
          title: 'Tin nhắn mới',
          message: `${conv.friendName}: ${conv.lastMessage}`,
          avatar: conv.friendAvatar,
          time: conv.lastMessageTime,
          read: false,
          actionData: { friendId: conv.friendId },
        });
      });

    // Sort by time
    notifs.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    setNotifications(notifs);
  }, [user, pendingRequests, conversations]);

  const totalUnread = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'friend_request':
        return <UserPlus className="w-4 h-4 text-pink-500" />;
      case 'message':
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'friend_accepted':
        return <Heart className="w-4 h-4 text-rose-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-gold" />;
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMins = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} giờ trước`;
    return format(date, 'dd/MM', { locale: vi });
  };

  const handleNotificationClick = (notif: Notification) => {
    if (notif.type === 'friend_request') {
      navigate('/friends');
    } else if (notif.type === 'message') {
      navigate('/friends');
    }
    setIsOpen(false);
  };

  const handleAcceptFriend = async (e: React.MouseEvent, friendshipId: string) => {
    e.stopPropagation();
    await acceptFriendRequest(friendshipId);
  };

  const handleRejectFriend = async (e: React.MouseEvent, friendshipId: string) => {
    e.stopPropagation();
    await rejectFriendRequest(friendshipId);
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!user) return null;

  return (
    <div className="relative">
      {/* Bell Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative p-2 rounded-full bg-background/80 backdrop-blur border border-border/50 hover:bg-muted/50 transition-colors"
      >
        <Bell className="w-5 h-5 text-foreground" />
        {totalUnread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
          >
            {totalUnread > 9 ? '9+' : totalUnread}
          </motion.span>
        )}
      </motion.button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-80 sm:w-96 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-pink-200 z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-pink-400 to-rose-500 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  <span className="font-bold">Thông báo</span>
                  {totalUnread > 0 && (
                    <Badge className="bg-white text-pink-500 text-xs">
                      {totalUnread} mới
                    </Badge>
                  )}
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Notifications List */}
              <ScrollArea className="max-h-[400px]">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Bell className="w-12 h-12 text-pink-300 mb-3" />
                    <p className="text-pink-600 font-medium">Không có thông báo</p>
                    <p className="text-pink-400 text-sm">Bạn đã xem hết tất cả!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-pink-100">
                    {notifications.map((notif) => (
                      <motion.div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-4 cursor-pointer hover:bg-pink-50 transition-colors ${
                          !notif.read ? 'bg-pink-50/50' : ''
                        }`}
                        whileHover={{ x: 4 }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative">
                            <Avatar className="w-10 h-10 ring-2 ring-pink-200">
                              <AvatarImage src={notif.avatar || ''} />
                              <AvatarFallback className="bg-gradient-to-br from-pink-400 to-rose-500 text-white text-xs">
                                {getInitials(notif.message.split(':')[0])}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 p-0.5 bg-white rounded-full">
                              {getIcon(notif.type)}
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-sm text-pink-800">
                                {notif.title}
                              </p>
                              <span className="text-xs text-pink-400">
                                {formatTime(notif.time)}
                              </span>
                            </div>
                            <p className="text-sm text-pink-600 truncate">
                              {notif.message}
                            </p>
                            
                            {/* Action buttons for friend requests */}
                            {notif.type === 'friend_request' && (
                              <div className="flex gap-2 mt-2">
                                <Button
                                  size="sm"
                                  onClick={(e) => handleAcceptFriend(e, notif.actionData.friendshipId)}
                                  className="h-7 px-3 bg-gradient-to-r from-pink-400 to-rose-500 hover:from-pink-500 hover:to-rose-600 text-white text-xs"
                                >
                                  <Check className="w-3 h-3 mr-1" />
                                  Chấp nhận
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => handleRejectFriend(e, notif.actionData.friendshipId)}
                                  className="h-7 px-3 border-pink-300 text-pink-600 hover:bg-pink-100 text-xs"
                                >
                                  <X className="w-3 h-3 mr-1" />
                                  Từ chối
                                </Button>
                              </div>
                            )}
                          </div>

                          {!notif.read && (
                            <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-3 border-t border-pink-100 bg-pink-50/50">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      navigate('/friends');
                      setIsOpen(false);
                    }}
                    className="w-full text-pink-600 hover:text-pink-700 hover:bg-pink-100"
                  >
                    Xem tất cả
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;
