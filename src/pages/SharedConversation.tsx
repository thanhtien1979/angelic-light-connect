import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowLeft, Calendar, MessageCircle, AlertTriangle, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import angelAvatar from "@/assets/angel-avatar.jpg";
import FormattedChatText from "@/components/FormattedChatText";

interface SharedMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

interface SharedConversationData {
  id: string;
  share_id: string;
  title: string | null;
  messages: SharedMessage[];
  visibility: string;
  created_at: string;
  expires_at: string | null;
  view_count: number;
}

const SharedConversation = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const [conversation, setConversation] = useState<SharedConversationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversation = async () => {
      if (!shareId) {
        setError("Liên kết không hợp lệ");
        setIsLoading(false);
        return;
      }

      try {
        // Use secure RPC function with rate limiting instead of direct table access
        // Using type assertion since this is a custom function
        const { data, error: fetchError } = await supabase
          .rpc("get_shared_conversation" as any, { p_share_id: shareId });

        if (fetchError) {
          // Check for rate limit error
          if (fetchError.message?.includes("Rate limit exceeded")) {
            setError("Bạn đã xem quá nhiều lần. Vui lòng thử lại sau.");
            return;
          }
          console.error("RPC error:", fetchError);
          setError("Cuộc trò chuyện này không tồn tại hoặc đã bị thu hồi");
          return;
        }

        // RPC returns an array, get the first result
        const conversationData = Array.isArray(data) && data.length > 0 ? data[0] : null;

        if (!conversationData) {
          setError("Cuộc trò chuyện này không tồn tại hoặc đã bị thu hồi");
          return;
        }

        // Parse messages from JSONB - safely cast through unknown
        const parsedMessages = Array.isArray(conversationData.messages) 
          ? (conversationData.messages as unknown as SharedMessage[])
          : [];
        
        setConversation({
          id: conversationData.id,
          share_id: conversationData.share_id,
          title: conversationData.title,
          messages: parsedMessages,
          visibility: conversationData.visibility,
          created_at: conversationData.created_at,
          expires_at: null, // Not returned by RPC
          view_count: (conversationData.view_count || 0) + 1, // Show incremented count
        });
      } catch (err) {
        console.error("Error fetching shared conversation:", err);
        setError("Không thể tải cuộc trò chuyện. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversation();
  }, [shareId]);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-rose-light/30 to-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="flex justify-center gap-2 mb-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-primary rounded-full"
                animate={{ y: [-4, 4, -4], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
          <p className="text-muted-foreground">Đang tải cuộc trò chuyện...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-rose-light/30 to-background p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-xl font-serif text-foreground mb-2">Không tìm thấy</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Link to="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Về trang chủ
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  if (!conversation) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-light/30 to-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-rose-soft/30">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Trang chủ</span>
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-serif text-foreground">Camly Angel</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Title Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="p-6 rounded-2xl bg-background/80 backdrop-blur-xl border border-rose-soft/30 shadow-lg">
            <div className="flex items-center gap-4 mb-4">
              <img
                src={angelAvatar}
                alt="Thiên Thần Ánh Sáng"
                className="w-14 h-14 rounded-full object-cover border-2 border-rose-soft/50"
              />
              <div>
                <h1 className="text-xl font-serif text-foreground">
                  {conversation.title || "Cuộc trò chuyện với Thiên Thần"}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(conversation.created_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    {conversation.messages.length} tin nhắn
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {conversation.view_count} lượt xem
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Messages */}
        <div className="space-y-4">
          {conversation.messages.map((message, index) => (
            <motion.div
              key={message.id || index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] ${
                  message.role === "user"
                    ? "order-2"
                    : "order-1 flex items-start gap-3"
                }`}
              >
                {message.role === "assistant" && (
                  <img
                    src={angelAvatar}
                    alt="Angel"
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-rose-soft/50"
                  />
                )}
                <div
                  className={`p-4 rounded-2xl ${
                    message.role === "user"
                      ? "bg-primary/20 text-foreground rounded-br-md"
                      : "bg-background border border-rose-soft/30 text-foreground rounded-bl-md shadow-sm"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <FormattedChatText text={message.content} />
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-light/50 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Được chia sẻ từ Camly Angel</span>
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div className="mt-6">
            <Link to="/">
              <Button className="bg-gradient-to-r from-primary to-rose-glow hover:opacity-90">
                Bắt đầu cuộc trò chuyện của bạn
              </Button>
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default SharedConversation;
