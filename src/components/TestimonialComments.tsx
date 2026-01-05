import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Trash2, Loader2, MessageCircle, Reply, ChevronDown, ChevronUp, Pin } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import ReportCommentDialog from "@/components/ReportCommentDialog";

export interface TestimonialComment {
  id: string;
  testimonial_id: string;
  user_id: string;
  content: string;
  created_at: string;
  parent_id?: string | null;
  is_pinned?: boolean;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
  replies?: TestimonialComment[];
}

interface TestimonialCommentsProps {
  testimonialId: string;
  commentsCount: number;
  testimonialOwnerId?: string;
  fetchComments: (testimonialId: string) => Promise<TestimonialComment[]>;
  addComment: (testimonialId: string, content: string, parentId?: string) => Promise<boolean>;
  deleteComment: (commentId: string) => Promise<boolean>;
}

const TestimonialComments = ({
  testimonialId,
  commentsCount,
  testimonialOwnerId,
  fetchComments,
  addComment,
  deleteComment,
}: TestimonialCommentsProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<TestimonialComment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState<TestimonialComment | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [isPinning, setIsPinning] = useState(false);

  const isOwner = user?.id === testimonialOwnerId;

  const loadComments = async () => {
    setIsLoading(true);
    const data = await fetchComments(testimonialId);
    
    // Organize comments into threads (parent comments with replies)
    const parentComments: TestimonialComment[] = [];
    const repliesMap: Record<string, TestimonialComment[]> = {};

    data.forEach(comment => {
      if (comment.parent_id) {
        if (!repliesMap[comment.parent_id]) {
          repliesMap[comment.parent_id] = [];
        }
        repliesMap[comment.parent_id].push(comment);
      } else {
        parentComments.push(comment);
      }
    });

    // Attach replies to parent comments and sort with pinned first
    const threaded = parentComments
      .map(parent => ({
        ...parent,
        replies: repliesMap[parent.id] || [],
      }))
      .sort((a, b) => {
        // Pinned comments first
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        return 0;
      });

    setComments(threaded);
    setIsLoading(false);
  };

  const handlePinComment = async (commentId: string, currentlyPinned: boolean) => {
    if (!isOwner) return;
    
    setIsPinning(true);
    try {
      // If pinning, unpin all other comments first
      if (!currentlyPinned) {
        const unpinResult = await (supabase
          .from("testimonial_comments") as any)
          .update({ is_pinned: false })
          .eq("testimonial_id", testimonialId)
          .eq("is_pinned", true);
        if (unpinResult.error) throw unpinResult.error;
      }

      // Toggle pin status
      const { error } = await (supabase
        .from("testimonial_comments") as any)
        .update({ is_pinned: !currentlyPinned })
        .eq("id", commentId);

      if (error) throw error;

      toast.success(!currentlyPinned ? "Đã ghim bình luận" : "Đã bỏ ghim bình luận");
      await loadComments();
    } catch (error) {
      console.error("Error pinning comment:", error);
      toast.error("Không thể ghim bình luận");
    } finally {
      setIsPinning(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadComments();
    }
  }, [isOpen, testimonialId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    const success = await addComment(testimonialId, newComment);
    if (success) {
      setNewComment("");
      await loadComments();
    }
    setIsSubmitting(false);
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !replyingTo) return;

    setIsSubmitting(true);
    const success = await addComment(testimonialId, replyContent, replyingTo.id);
    if (success) {
      setReplyContent("");
      setReplyingTo(null);
      // Expand replies for this comment
      setExpandedReplies(prev => new Set(prev).add(replyingTo.id));
      await loadComments();
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (commentId: string) => {
    const success = await deleteComment(commentId);
    if (success) {
      await loadComments();
    }
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const CommentItem = ({ comment, isReply = false }: { comment: TestimonialComment; isReply?: boolean }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-3 group relative",
        isReply && "ml-8 mt-2",
        comment.is_pinned && !isReply && "bg-primary/5 -mx-2 px-2 py-2 rounded-lg border border-primary/20"
      )}
    >
      {/* Pinned badge */}
      {comment.is_pinned && !isReply && (
        <Badge className="absolute -top-2 left-2 bg-primary/90 text-primary-foreground text-[10px] px-2 py-0.5">
          <Pin className="w-2.5 h-2.5 mr-1" />
          Đã ghim
        </Badge>
      )}

      <Avatar className={cn("flex-shrink-0", isReply ? "w-6 h-6" : "w-8 h-8")}>
        <AvatarImage src={comment.profile?.avatar_url || ""} />
        <AvatarFallback className={cn("bg-primary/10", isReply ? "text-[10px]" : "text-xs")}>
          {getInitials(comment.profile?.display_name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn("font-medium text-foreground truncate", isReply ? "text-xs" : "text-sm")}>
            {comment.profile?.display_name || "Linh hồn ẩn danh"}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.created_at), {
              addSuffix: true,
              locale: vi,
            })}
          </span>
        </div>
        <p className={cn("text-foreground/80 mt-0.5", isReply ? "text-xs" : "text-sm")}>
          {comment.content}
        </p>
        
        {/* Reply button (only for parent comments) */}
        {!isReply && user && (
          <button
            onClick={() => setReplyingTo(comment)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mt-1 transition-colors"
          >
            <Reply className="w-3 h-3" />
            Trả lời
          </button>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Pin button (only for owner, parent comments) */}
        {isOwner && !isReply && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handlePinComment(comment.id, !!comment.is_pinned)}
            disabled={isPinning}
            className="h-6 w-6"
            title={comment.is_pinned ? "Bỏ ghim" : "Ghim bình luận"}
          >
            <Pin className={cn(
              "w-3 h-3",
              comment.is_pinned ? "text-primary fill-primary" : "text-muted-foreground hover:text-primary"
            )} />
          </Button>
        )}

        {/* Report button (for other users' comments) */}
        {user && user.id !== comment.user_id && (
          <ReportCommentDialog
            commentId={comment.id}
            commentContent={comment.content}
          />
        )}

        {/* Delete button */}
        {user?.id === comment.user_id && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(comment.id)}
            className="h-6 w-6"
          >
            <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
          </Button>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="w-full">
      {/* Toggle button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="text-muted-foreground hover:text-foreground gap-1.5"
      >
        <MessageCircle className="w-4 h-4" />
        <span>{commentsCount}</span>
      </Button>

      {/* Comments panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-4 border-t border-border/30 pt-4">
              {/* Comments list */}
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : comments.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-4">
                  Chưa có bình luận nào. Hãy là người đầu tiên!
                </p>
              ) : (
                <ScrollArea className="max-h-80">
                  <div className="space-y-4 pr-4">
                    {comments.map((comment) => (
                      <div key={comment.id}>
                        <CommentItem comment={comment} />
                        
                        {/* Replies section */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-2">
                            <button
                              onClick={() => toggleReplies(comment.id)}
                              className="flex items-center gap-1 text-xs text-primary hover:underline ml-11"
                            >
                              {expandedReplies.has(comment.id) ? (
                                <>
                                  <ChevronUp className="w-3 h-3" />
                                  Ẩn {comment.replies.length} phản hồi
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-3 h-3" />
                                  Xem {comment.replies.length} phản hồi
                                </>
                              )}
                            </button>
                            
                            <AnimatePresence>
                              {expandedReplies.has(comment.id) && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="space-y-2 mt-2"
                                >
                                  {comment.replies.map((reply) => (
                                    <CommentItem key={reply.id} comment={reply} isReply />
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}

                        {/* Reply form for this comment */}
                        {replyingTo?.id === comment.id && (
                          <motion.form
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onSubmit={handleReply}
                            className="mt-2 ml-11 flex gap-2"
                          >
                            <Input
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              placeholder={`Trả lời ${comment.profile?.display_name || ""}...`}
                              className="flex-1 h-8 text-xs"
                              maxLength={300}
                              autoFocus
                            />
                            <Button
                              type="submit"
                              size="sm"
                              disabled={isSubmitting || !replyContent.trim()}
                              className="h-8"
                            >
                              {isSubmitting ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Send className="w-3 h-3" />
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setReplyingTo(null)}
                              className="h-8 text-xs"
                            >
                              Hủy
                            </Button>
                          </motion.form>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}

              {/* Add comment form */}
              {user && (
                <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
                  <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Viết bình luận..."
                    className="flex-1 h-9 text-sm"
                    maxLength={300}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSubmitting || !newComment.trim()}
                    className="h-9"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TestimonialComments;
