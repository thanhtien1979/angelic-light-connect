import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, X, Users, Clock } from "lucide-react";
import { useProfileViews } from "@/hooks/useProfileViews";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

export const ProfileViewsNotification = () => {
  const { views, viewCount, unreadCount, isLoading, markAsRead } = useProfileViews();
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    markAsRead();
  };

  if (isLoading || viewCount === 0) return null;

  return (
    <>
      {/* Badge button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={handleOpen}
        className="relative p-3 rounded-xl bg-card/50 border border-border/50 hover:bg-card/80 transition-all group"
      >
        <Eye className="w-5 h-5 text-primary" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold bg-primary text-primary-foreground rounded-full"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
        <span className="sr-only">Xem lượt xem hồ sơ</span>
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/20">
                    <Eye className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Ai đã xem hồ sơ của bạn</h3>
                    <p className="text-xs text-muted-foreground">
                      {viewCount} lượt xem trong 30 ngày qua
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Content */}
              <div className="max-h-[60vh] overflow-y-auto">
                {views.length === 0 ? (
                  <div className="p-8 text-center">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground">Chưa có ai xem hồ sơ của bạn</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/50">
                    {views.map((view) => {
                      const displayName = view.viewer_profile?.display_name || "Người dùng";
                      const initials = displayName.slice(0, 2).toUpperCase();
                      const timeAgo = formatDistanceToNow(new Date(view.viewed_at), {
                        addSuffix: true,
                        locale: vi,
                      });

                      return (
                        <motion.div
                          key={view.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors"
                        >
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={view.viewer_profile?.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/20 text-primary text-sm">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">
                              {displayName}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {timeAgo}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer info */}
              <div className="p-3 border-t border-border bg-muted/30">
                <p className="text-xs text-center text-muted-foreground">
                  Chỉ những người xem hồ sơ của bạn mới hiển thị ở đây
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProfileViewsNotification;
