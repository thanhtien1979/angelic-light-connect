import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Trash2, Loader2, MessageCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { TestimonialComment } from "@/hooks/useTestimonials";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface TestimonialCommentsProps {
  testimonialId: string;
  commentsCount: number;
  fetchComments: (testimonialId: string) => Promise<TestimonialComment[]>;
  addComment: (testimonialId: string, content: string) => Promise<boolean>;
  deleteComment: (commentId: string) => Promise<boolean>;
}

const TestimonialComments = ({
  testimonialId,
  commentsCount,
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

  const loadComments = async () => {
    setIsLoading(true);
    const data = await fetchComments(testimonialId);
    setComments(data);
    setIsLoading(false);
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

  const handleDelete = async (commentId: string) => {
    const success = await deleteComment(commentId);
    if (success) {
      setComments(prev => prev.filter(c => c.id !== commentId));
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

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
                <ScrollArea className="max-h-60">
                  <div className="space-y-3 pr-4">
                    {comments.map((comment, index) => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex gap-3 group"
                      >
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarImage src={comment.profile?.avatar_url || ""} />
                          <AvatarFallback className="text-xs bg-primary/10">
                            {getInitials(comment.profile?.display_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground truncate">
                              {comment.profile?.display_name || "Linh hồn ẩn danh"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(comment.created_at), {
                                addSuffix: true,
                                locale: vi,
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-foreground/80 mt-0.5">
                            {comment.content}
                          </p>
                        </div>
                        {user?.id === comment.user_id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(comment.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                          >
                            <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                          </Button>
                        )}
                      </motion.div>
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
