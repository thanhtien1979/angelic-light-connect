import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, Users, Loader2, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useFriendships } from "@/hooks/useFriendships";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface Saver {
  id: string;
  user_id: string;
  created_at: string;
  profile?: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

interface MomentSaversDialogProps {
  isOpen: boolean;
  onClose: () => void;
  momentId: string;
  onStartChat?: (userId: string) => void;
}

const MomentSaversDialog = ({ isOpen, onClose, momentId, onStartChat }: MomentSaversDialogProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { friends, sendFriendRequest } = useFriendships();
  const [savers, setSavers] = useState<Saver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && momentId) {
      fetchSavers();
    }
  }, [isOpen, momentId]);

  const fetchSavers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("saved_moments")
        .select("id, user_id, created_at")
        .eq("moment_id", momentId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles for savers
      const userIds = data?.map(s => s.user_id) || [];
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name, avatar_url")
          .in("id", userIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]));
        
        setSavers(
          (data || []).map(saver => ({
            ...saver,
            profile: profileMap.get(saver.user_id),
          }))
        );
      } else {
        setSavers([]);
      }
    } catch (error) {
      console.error("Error fetching savers:", error);
      toast.error("Không thể tải danh sách người lưu");
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleViewProfile = (userId: string) => {
    onClose();
    navigate(`/user/${userId}`);
  };

  const isFriend = (userId: string) => {
    return friends.some(f => 
      (f.requester_id === userId || f.addressee_id === userId) && 
      f.status === "accepted"
    );
  };

  const handleSendFriendRequest = async (userId: string) => {
    setSendingRequest(userId);
    await sendFriendRequest(userId);
    setSendingRequest(null);
  };

  const handleStartChat = (userId: string) => {
    if (onStartChat) {
      onStartChat(userId);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-500" />
            Người đã lưu
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-[200px] max-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-gold animate-spin" />
            </div>
          ) : savers.length === 0 ? (
            <div className="text-center py-8">
              <Bookmark className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Chưa có ai lưu khoảnh khắc này</p>
            </div>
          ) : (
            <div className="space-y-1 py-2">
              <AnimatePresence>
                {savers.map((saver) => (
                  <motion.div
                    key={saver.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <button
                      onClick={() => handleViewProfile(saver.user_id)}
                      className="flex items-center gap-3 flex-1 text-left"
                    >
                      <Avatar className="w-10 h-10 ring-2 ring-amber-500/20">
                        <AvatarImage src={saver.profile?.avatar_url || ""} />
                        <AvatarFallback className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-sm">
                          {getInitials(saver.profile?.display_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">
                          {saver.profile?.display_name || "Linh hồn ẩn danh"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(saver.created_at).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    </button>
                    
                    {user && saver.user_id !== user.id && (
                      <div className="flex items-center gap-2">
                        {isFriend(saver.user_id) ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStartChat(saver.user_id)}
                            className="border-gold/30 hover:bg-gold/10"
                          >
                            <MessageCircle className="w-3 h-3 mr-1" />
                            Nhắn tin
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleSendFriendRequest(saver.user_id)}
                            disabled={sendingRequest === saver.user_id}
                            className="bg-gradient-to-r from-gold to-amber-500 text-white hover:from-amber-500 hover:to-gold"
                          >
                            {sendingRequest === saver.user_id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <>
                                <Users className="w-3 h-3 mr-1" />
                                Kết bạn
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MomentSaversDialog;
