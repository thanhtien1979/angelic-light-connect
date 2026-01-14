import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { 
  MessageCircle, Send, X, Loader2, Edit2, Trash2, CornerDownRight,
  MoreHorizontal, Heart, ThumbsUp, Laugh, Frown, Angry, Check
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Comment {
  id: string;
  message_id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
  reactions: Record<string, number>;
  userReaction?: string | null;
  replies?: Comment[];
}

interface UniverseMessageCommentsProps {
  messageId: string;
  commentsCount: number;
  onCommentsCountChange?: (count: number) => void;
}

const REACTION_TYPES = [
  { type: 'like', emoji: '👍', icon: ThumbsUp, color: 'text-blue-500', label: 'Thích' },
  { type: 'love', emoji: '❤️', icon: Heart, color: 'text-red-500', label: 'Yêu thích' },
  { type: 'haha', emoji: '😂', icon: Laugh, color: 'text-yellow-500', label: 'Haha' },
  { type: 'sad', emoji: '😢', icon: Frown, color: 'text-yellow-600', label: 'Buồn' },
  { type: 'angry', emoji: '😠', icon: Angry, color: 'text-orange-500', label: 'Phẫn nộ' },
];

const UniverseMessageComments = ({ 
  messageId, 
  commentsCount,
  onCommentsCountChange 
}: UniverseMessageCommentsProps) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [editContent, setEditContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const fetchComments = useCallback(async () => {
    if (!isOpen) return;
    setIsLoading(true);
    
    try {
      // Fetch all comments for this message
      const { data: commentsData, error } = await supabase
        .from("universe_message_comments" as any)
        .select("*")
        .eq("message_id", messageId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (!commentsData || commentsData.length === 0) {
        setComments([]);
        setIsLoading(false);
        return;
      }

      // Fetch profiles
      const userIds = [...new Set((commentsData as any[]).map(c => c.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in("id", userIds);

      const profileMap: Record<string, any> = {};
      profiles?.forEach(p => {
        profileMap[p.id] = p;
      });

      // Fetch reactions
      const commentIds = (commentsData as any[]).map(c => c.id);
      const { data: reactionsData } = await supabase
        .from("universe_message_comment_reactions" as any)
        .select("*")
        .in("comment_id", commentIds);

      // Process comments with reactions
      const processedComments: Comment[] = (commentsData as any[]).map(c => {
        const commentReactions = (reactionsData as any[] || []).filter(r => r.comment_id === c.id);
        const reactionCounts: Record<string, number> = {};
        let userReaction: string | null = null;

        commentReactions.forEach(r => {
          reactionCounts[r.reaction_type] = (reactionCounts[r.reaction_type] || 0) + 1;
          if (user && r.user_id === user.id) {
            userReaction = r.reaction_type;
          }
        });

        return {
          ...c,
          profile: profileMap[c.user_id],
          reactions: reactionCounts,
          userReaction,
        };
      });

      // Build nested structure
      const topLevelComments: Comment[] = [];
      const repliesMap: Record<string, Comment[]> = {};

      processedComments.forEach(c => {
        if (c.parent_id) {
          if (!repliesMap[c.parent_id]) {
            repliesMap[c.parent_id] = [];
          }
          repliesMap[c.parent_id].push(c);
        } else {
          topLevelComments.push(c);
        }
      });

      // Attach replies to parent comments
      topLevelComments.forEach(c => {
        c.replies = repliesMap[c.id] || [];
      });

      setComments(topLevelComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("Không thể tải bình luận");
    } finally {
      setIsLoading(false);
    }
  }, [messageId, isOpen, user]);

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, fetchComments]);

  // Realtime subscription
  useEffect(() => {
    if (!isOpen) return;

    const channel = supabase
      .channel(`comments-${messageId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "universe_message_comments",
          filter: `message_id=eq.${messageId}`,
        },
        () => {
          fetchComments();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "universe_message_comment_reactions",
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, messageId, fetchComments]);

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để bình luận");
      return;
    }

    const content = newComment.trim();
    if (!content) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("universe_message_comments" as any)
        .insert({
          message_id: messageId,
          user_id: user.id,
          content,
          parent_id: replyTo?.id || null,
        });

      if (error) throw error;

      setNewComment("");
      setReplyTo(null);
      toast.success("Đã đăng bình luận! ✨");
      fetchComments();
      onCommentsCountChange?.(commentsCount + 1);
    } catch (error) {
      console.error("Submit comment error:", error);
      toast.error("Không thể đăng bình luận");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!user || !editingComment) return;
    const content = editContent.trim();
    if (!content) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("universe_message_comments" as any)
        .update({ content })
        .eq("id", editingComment.id)
        .eq("user_id", user.id);

      if (error) throw error;

      setEditingComment(null);
      setEditContent("");
      toast.success("Đã cập nhật bình luận!");
      fetchComments();
    } catch (error) {
      console.error("Edit comment error:", error);
      toast.error("Không thể cập nhật bình luận");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("universe_message_comments" as any)
        .delete()
        .eq("id", commentId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Đã xóa bình luận");
      fetchComments();
      onCommentsCountChange?.(Math.max(0, commentsCount - 1));
    } catch (error) {
      console.error("Delete comment error:", error);
      toast.error("Không thể xóa bình luận");
    }
  };

  const handleReaction = async (commentId: string, reactionType: string) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để thả cảm xúc");
      return;
    }

    try {
      // Check existing reaction
      const { data: existing } = await supabase
        .from("universe_message_comment_reactions" as any)
        .select("*")
        .eq("comment_id", commentId)
        .eq("user_id", user.id)
        .single();

      if (existing) {
        if ((existing as any).reaction_type === reactionType) {
          // Remove reaction
          await supabase
            .from("universe_message_comment_reactions" as any)
            .delete()
            .eq("id", (existing as any).id);
        } else {
          // Update reaction
          await supabase
            .from("universe_message_comment_reactions" as any)
            .update({ reaction_type: reactionType })
            .eq("id", (existing as any).id);
        }
      } else {
        // Add reaction
        await supabase
          .from("universe_message_comment_reactions" as any)
          .insert({
            comment_id: commentId,
            user_id: user.id,
            reaction_type: reactionType,
          });
      }

      fetchComments();
    } catch (error) {
      console.error("Reaction error:", error);
    }
  };

  const startReply = (comment: Comment) => {
    setReplyTo(comment);
    setEditingComment(null);
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const startEdit = (comment: Comment) => {
    setEditingComment(comment);
    setEditContent(comment.content);
    setReplyTo(null);
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  const getTotalReactions = (reactions: Record<string, number>) => {
    return Object.values(reactions).reduce((sum, count) => sum + count, 0);
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <motion.div
      key={comment.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isReply ? 'ml-10 mt-2' : 'mb-4'}`}
    >
      <div className="flex gap-2">
        <Avatar className={`${isReply ? 'w-7 h-7' : 'w-9 h-9'} border border-gold/20`}>
          <AvatarImage src={comment.profile?.avatar_url || ""} />
          <AvatarFallback className="bg-gold/10 text-gold text-xs">
            {getInitials(comment.profile?.display_name)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="bg-muted/50 rounded-2xl px-3 py-2 inline-block max-w-full">
            <p className="font-medium text-sm">
              {comment.profile?.display_name || "Người dùng"}
            </p>
            <p className="text-sm whitespace-pre-wrap break-words">
              {comment.content}
            </p>
          </div>
          
          {/* Reactions display */}
          {getTotalReactions(comment.reactions) > 0 && (
            <div className="flex items-center gap-1 mt-1 ml-2">
              <div className="flex -space-x-1">
                {Object.entries(comment.reactions)
                  .filter(([_, count]) => count > 0)
                  .slice(0, 3)
                  .map(([type]) => {
                    const reactionDef = REACTION_TYPES.find(r => r.type === type);
                    return (
                      <span key={type} className="text-sm">
                        {reactionDef?.emoji}
                      </span>
                    );
                  })}
              </div>
              <span className="text-xs text-muted-foreground">
                {getTotalReactions(comment.reactions)}
              </span>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex items-center gap-3 mt-1 ml-2">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className={`text-xs font-medium hover:underline ${
                    comment.userReaction 
                      ? REACTION_TYPES.find(r => r.type === comment.userReaction)?.color || 'text-muted-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  {comment.userReaction 
                    ? REACTION_TYPES.find(r => r.type === comment.userReaction)?.label || 'Thích'
                    : 'Thích'}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-1" side="top">
                <div className="flex gap-1">
                  {REACTION_TYPES.map((reaction) => (
                    <motion.button
                      key={reaction.type}
                      whileHover={{ scale: 1.3 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleReaction(comment.id, reaction.type)}
                      className={`text-2xl p-1 rounded-full hover:bg-muted transition-colors ${
                        comment.userReaction === reaction.type ? 'bg-muted' : ''
                      }`}
                      title={reaction.label}
                    >
                      {reaction.emoji}
                    </motion.button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            
            <button
              onClick={() => startReply(comment)}
              className="text-xs font-medium text-muted-foreground hover:underline"
            >
              Phản hồi
            </button>
            
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), {
                addSuffix: true,
                locale: vi,
              })}
            </span>
            
            {comment.updated_at !== comment.created_at && (
              <span className="text-xs text-muted-foreground">(đã chỉnh sửa)</span>
            )}
            
            {user?.id === comment.user_id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-muted-foreground hover:text-foreground">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => startEdit(comment)}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Chỉnh sửa
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDelete(comment.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Xóa
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          
          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-2">
              {comment.replies.map(reply => renderComment(reply, true))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="text-muted-foreground hover:text-gold"
      >
        <MessageCircle className="w-4 h-4 mr-1" />
        {commentsCount > 0 ? commentsCount : ''} Bình luận
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-gold" />
              Bình luận ({commentsCount})
            </DialogTitle>
          </DialogHeader>

          {/* Comments list */}
          <div className="flex-1 overflow-y-auto min-h-[200px] max-h-[400px] py-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-gold" />
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>Chưa có bình luận nào</p>
                <p className="text-sm">Hãy là người đầu tiên bình luận!</p>
              </div>
            ) : (
              <AnimatePresence>
                {comments.map(comment => renderComment(comment))}
              </AnimatePresence>
            )}
          </div>

          {/* Reply indicator */}
          {replyTo && (
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
              <CornerDownRight className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Đang trả lời <span className="font-medium">{replyTo.profile?.display_name || "Người dùng"}</span>
              </span>
              <button
                onClick={() => setReplyTo(null)}
                className="ml-auto text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Edit mode */}
          {editingComment && (
            <div className="space-y-2 border-t pt-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Edit2 className="w-4 h-4" />
                <span>Chỉnh sửa bình luận</span>
                <button
                  onClick={() => {
                    setEditingComment(null);
                    setEditContent("");
                  }}
                  className="ml-auto hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[60px] resize-none"
                maxLength={1000}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingComment(null);
                    setEditContent("");
                  }}
                >
                  Hủy
                </Button>
                <Button
                  size="sm"
                  onClick={handleEdit}
                  disabled={isSubmitting || !editContent.trim()}
                  className="bg-gold hover:bg-gold/90 text-white"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Lưu
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* New comment input */}
          {!editingComment && user && (
            <div className="flex gap-2 border-t pt-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gold/10 text-gold text-xs">
                  {getInitials(user?.email?.split("@")[0] || null)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2">
                <Textarea
                  ref={textareaRef}
                  placeholder={replyTo ? `Trả lời ${replyTo.profile?.display_name || "Người dùng"}...` : "Viết bình luận..."}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[40px] max-h-[100px] resize-none flex-1"
                  maxLength={1000}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                />
                <Button
                  size="icon"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !newComment.trim()}
                  className="bg-gold hover:bg-gold/90 text-white shrink-0"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {!user && (
            <div className="text-center py-3 border-t text-muted-foreground">
              <p className="text-sm">Vui lòng đăng nhập để bình luận</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UniverseMessageComments;
