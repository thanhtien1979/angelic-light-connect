import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface Comment {
  id: string;
  moment_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

interface MomentCommentsProps {
  momentId: string;
  isOpen: boolean;
  onClose: () => void;
}

const MomentComments = ({ momentId, isOpen, onClose }: MomentCommentsProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (isOpen && momentId) {
      fetchComments();
      subscribeToComments();
    }
    
    return () => {
      supabase.removeChannel(supabase.channel(`comments-${momentId}`));
    };
  }, [isOpen, momentId]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("moment_comments")
        .select("*")
        .eq("moment_id", momentId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Fetch profiles for comments
      const userIds = [...new Set(data?.map(c => c.user_id) || [])];
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name, avatar_url")
          .in("id", userIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
        
        const commentsWithProfiles = (data || []).map(c => ({
          ...c,
          profile: profileMap.get(c.user_id),
        }));
        
        setComments(commentsWithProfiles);
      } else {
        setComments(data || []);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("Không thể tải bình luận");
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToComments = () => {
    const channel = supabase
      .channel(`comments-${momentId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "moment_comments",
          filter: `moment_id=eq.${momentId}`,
        },
        async (payload) => {
          const newComment = payload.new as Comment;
          
          // Fetch profile for new comment
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, display_name, avatar_url")
            .eq("id", newComment.user_id)
            .maybeSingle();
          
          setComments(prev => [...prev, { ...newComment, profile: profile || undefined }]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "moment_comments",
          filter: `moment_id=eq.${momentId}`,
        },
        (payload) => {
          setComments(prev => prev.filter(c => c.id !== payload.old.id));
        }
      )
      .subscribe();

    return channel;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Vui lòng đăng nhập để bình luận");
      return;
    }
    
    if (!newComment.trim()) return;
    
    if (newComment.trim().length > 500) {
      toast.error("Bình luận không được quá 500 ký tự");
      return;
    }

    setIsSending(true);
    try {
      const { error } = await supabase
        .from("moment_comments")
        .insert({
          moment_id: momentId,
          user_id: user.id,
          content: newComment.trim(),
        });

      if (error) throw error;
      
      setNewComment("");
      toast.success("Đã gửi bình luận ✨");
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error("Không thể gửi bình luận");
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from("moment_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;
      
      setComments(prev => prev.filter(c => c.id !== commentId));
      toast.success("Đã xóa bình luận");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Không thể xóa bình luận");
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full sm:max-w-lg max-h-[80vh] bg-card rounded-t-2xl sm:rounded-2xl border border-border shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-gold" />
              <h3 className="font-semibold text-foreground">Bình luận</h3>
              <span className="text-sm text-muted-foreground">({comments.length})</span>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-24" />
                      <div className="h-3 bg-muted rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">Chưa có bình luận nào</p>
                <p className="text-sm text-muted-foreground/70">Hãy là người đầu tiên chia sẻ cảm nghĩ!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 group"
                >
                  <Avatar className="w-8 h-8 ring-1 ring-border">
                    <AvatarImage src={comment.profile?.avatar_url || ""} />
                    <AvatarFallback className="text-xs bg-gradient-to-br from-gold/20 to-rose-500/20">
                      {getInitials(comment.profile?.display_name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground truncate">
                        {comment.profile?.display_name || "Người dùng"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), { 
                          addSuffix: true, 
                          locale: vi 
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/80 break-words">{comment.content}</p>
                  </div>
                  
                  {user?.id === comment.user_id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(comment.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </motion.div>
              ))
            )}
          </div>

          {/* Input */}
          {user ? (
            <form onSubmit={handleSubmit} className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Viết bình luận của bạn..."
                  maxLength={500}
                  className="flex-1 border-gold/20 focus:border-gold/50"
                />
                <Button
                  type="submit"
                  disabled={isSending || !newComment.trim()}
                  className="bg-gradient-to-r from-gold to-amber-500 hover:from-gold/90 hover:to-amber-500/90 text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1 text-right">
                {newComment.length}/500
              </p>
            </form>
          ) : (
            <div className="p-4 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                Đăng nhập để bình luận
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MomentComments;
