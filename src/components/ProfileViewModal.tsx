import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, Video, Phone, Flag, ShieldOff, Calendar, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface ProfileData {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  is_online?: boolean;
  created_at?: string;
}

interface ProfileViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileData | null;
  onChat?: () => void;
  onVideoCall?: () => void;
  onAudioCall?: () => void;
  onReport?: () => void;
  onBlock?: () => void;
  isFriend?: boolean;
}

export const ProfileViewModal = ({
  isOpen,
  onClose,
  profile,
  onChat,
  onVideoCall,
  onAudioCall,
  onReport,
  onBlock,
  isFriend = false,
}: ProfileViewModalProps) => {
  if (!profile) return null;

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const memberSince = profile.created_at 
    ? formatDistanceToNow(new Date(profile.created_at), { addSuffix: true, locale: vi })
    : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-card rounded-2xl border border-border shadow-2xl overflow-hidden"
          >
            {/* Header with gradient background */}
            <div className="relative h-24 bg-gradient-to-br from-primary/30 via-rose-500/20 to-amber-500/20">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute top-2 right-2 bg-background/50 hover:bg-background/80 backdrop-blur-sm"
              >
                <X className="w-4 h-4" />
              </Button>
              
              {/* Avatar positioned at bottom of header */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                <div className="relative">
                  <Avatar className="w-20 h-20 ring-4 ring-card shadow-lg">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-rose-400 to-pink-500 text-white text-xl font-semibold">
                      {getInitials(profile.display_name)}
                    </AvatarFallback>
                  </Avatar>
                  {profile.is_online && (
                    <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full ring-2 ring-card" />
                  )}
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="pt-14 pb-4 px-6 text-center">
              <h3 className="text-xl font-semibold text-foreground">
                {profile.display_name || "Người dùng"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {profile.is_online ? (
                  <span className="text-green-500 flex items-center justify-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Đang online
                  </span>
                ) : (
                  "Offline"
                )}
              </p>
              
              {memberSince && (
                <div className="flex items-center justify-center gap-1 mt-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>Tham gia {memberSince}</span>
                </div>
              )}
              
              {isFriend && (
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                    Bạn bè ánh sáng
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            {isFriend && (
              <div className="px-6 pb-4">
                <div className="grid grid-cols-3 gap-2">
                  {onChat && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onChat}
                      className="flex flex-col h-auto py-3 gap-1 border-primary/30 hover:bg-primary/10"
                    >
                      <MessageCircle className="w-5 h-5 text-primary" />
                      <span className="text-xs">Chat</span>
                    </Button>
                  )}
                  {onVideoCall && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onVideoCall}
                      className="flex flex-col h-auto py-3 gap-1 border-blue-500/30 hover:bg-blue-500/10"
                    >
                      <Video className="w-5 h-5 text-blue-500" />
                      <span className="text-xs">Video</span>
                    </Button>
                  )}
                  {onAudioCall && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onAudioCall}
                      className="flex flex-col h-auto py-3 gap-1 border-green-500/30 hover:bg-green-500/10"
                    >
                      <Phone className="w-5 h-5 text-green-500" />
                      <span className="text-xs">Gọi</span>
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Footer Actions */}
            <div className="px-6 pb-6 flex gap-2">
              {onReport && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onReport}
                  className="flex-1 text-muted-foreground hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                >
                  <Flag className="w-4 h-4 mr-1" />
                  Báo cáo
                </Button>
              )}
              {onBlock && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBlock}
                  className="flex-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <ShieldOff className="w-4 h-4 mr-1" />
                  Chặn
                </Button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProfileViewModal;
