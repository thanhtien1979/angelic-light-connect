import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  UserPlus,
  Heart,
  MessageCircle,
  Sparkles,
  Check,
  CheckCheck,
  Trash2,
  X,
  Bookmark,
} from "lucide-react";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SkeletonNotification } from "@/components/ui/skeleton";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "follow":
      return UserPlus;
    case "like":
      return Heart;
    case "comment":
      return MessageCircle;
    case "message":
      return MessageCircle;
    case "save":
      return Bookmark;
    case "gift_received":
      return Sparkles; // Will use 🎁 emoji in display
    default:
      return Sparkles;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case "follow":
      return "text-gold bg-gold/20";
    case "like":
      return "text-rose-500 bg-rose-500/20";
    case "comment":
      return "text-sky-500 bg-sky-500/20";
    case "message":
      return "text-emerald-500 bg-emerald-500/20";
    case "save":
      return "text-amber-500 bg-amber-500/20";
    case "gift_received":
      return "text-pink-500 bg-gradient-to-r from-pink-500/20 to-gold/20";
    default:
      return "text-violet-500 bg-violet-500/20";
  }
};

const formatTimeAgo = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút`;
  if (diffHours < 24) return `${diffHours} giờ`;
  if (diffDays < 7) return `${diffDays} ngày`;

  return date.toLocaleDateString("vi-VN");
};

const NotificationItem = ({
  notification,
  onMarkAsRead,
  onDelete,
  onClick,
}: {
  notification: Notification;
  onMarkAsRead: () => void;
  onDelete: () => void;
  onClick: () => void;
}) => {
  const Icon = getNotificationIcon(notification.type);
  const colorClass = getNotificationColor(notification.type);

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className={`p-3 rounded-xl transition-colors cursor-pointer group ${
        notification.is_read ? "bg-transparent hover:bg-muted/30" : "bg-gold/5 hover:bg-gold/10"
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="relative">
          {notification.actor_profile ? (
            <Avatar className="w-10 h-10 ring-2 ring-border/50">
              <AvatarImage src={notification.actor_profile.avatar_url || ""} />
              <AvatarFallback className="bg-muted text-sm">
                {getInitials(notification.actor_profile.display_name)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
              <Icon className="w-5 h-5" />
            </div>
          )}
          {!notification.is_read && (
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-gold border-2 border-card" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p
            className={`text-sm leading-tight ${
              notification.is_read ? "text-muted-foreground" : "text-foreground font-medium"
            }`}
          >
            {notification.message || notification.title}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatTimeAgo(notification.created_at)}
          </p>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!notification.is_read && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead();
              }}
              className="p-1.5 rounded-full hover:bg-muted transition-colors"
              title="Đánh dấu đã đọc"
            >
              <Check className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 rounded-full hover:bg-red-500/10 transition-colors"
            title="Xóa thông báo"
          >
            <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-red-500" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export const NotificationsDropdown = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.type === "follow" && notification.actor_id) {
      navigate(`/user/${notification.actor_id}`);
    } else if (notification.type === "message" && notification.actor_id) {
      navigate(`/friends`);
    } else if ((notification.type === "like" || notification.type === "comment" || notification.type === "save") && notification.reference_id) {
      navigate(`/community`);
    } else if (notification.type === "gift_received" && notification.actor_id) {
      navigate(`/user/${notification.actor_id}`);
    }

    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-gold text-[10px] font-bold text-white flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 sm:w-96 p-0 border-border/50 bg-card/95 backdrop-blur-xl"
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-gold" />
            <h3 className="font-semibold text-foreground">Thông báo</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-gold/20 text-gold text-xs font-medium">
                {unreadCount} mới
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Đọc tất cả
            </button>
          )}
        </div>

        {/* Notifications List */}
        <ScrollArea className="max-h-[400px]">
          {isLoading ? (
            <div className="p-3 space-y-2">
              <SkeletonNotification />
              <SkeletonNotification />
              <SkeletonNotification />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 px-4">
              <div className="p-3 rounded-full bg-muted/50 w-fit mx-auto mb-3">
                <Bell className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Chưa có thông báo nào
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              <AnimatePresence>
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={() => markAsRead(notification.id)}
                    onDelete={() => deleteNotification(notification.id)}
                    onClick={() => handleNotificationClick(notification)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsDropdown;
