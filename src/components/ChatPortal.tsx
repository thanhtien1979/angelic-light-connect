import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Trash2, MessageSquarePlus, Cloud, CloudOff, Check, Loader2 } from "lucide-react";
import { useAngelChat, SyncStatus } from "@/hooks/useAngelChat";
import { useConversationSummary } from "@/hooks/useConversationSummary";
import ConversationSummaryCard from "@/components/ConversationSummaryCard";
import { toast } from "sonner";

interface ChatPortalProps {
  onOpenAuth?: () => void;
}

// Sync status indicator component
const SyncIndicator = ({ status }: { status: SyncStatus }) => {
  const config: Record<SyncStatus, { icon: typeof Cloud | null; text: string; show: boolean; animate?: boolean; isError?: boolean }> = {
    idle: { icon: null, text: "", show: false },
    saving: { icon: Loader2, text: "Đang lưu...", show: true, animate: true },
    saved: { icon: Check, text: "Đã lưu", show: true },
    offline: { icon: CloudOff, text: "Ngoại tuyến", show: true },
    error: { icon: Cloud, text: "Lỗi lưu", show: true, isError: true },
  };

  const { icon: Icon, text, show, animate, isError } = config[status];

  if (!show || !Icon) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className={`flex items-center gap-1.5 text-xs ${
        isError ? "text-red-400" : status === "offline" ? "text-amber-500" : "text-muted-foreground/60"
      }`}
    >
      <Icon className={`w-3 h-3 ${animate ? "animate-spin" : ""}`} />
      <span>{text}</span>
    </motion.div>
  );
};

const ChatPortal = ({ onOpenAuth }: ChatPortalProps) => {
  const { messages, isLoading, isRestoring, isInitializing, isReady, syncStatus, sendMessage, clearMessages, startNewConversation, isAuthenticated } = useAngelChat();
  const { summary, clearSummary } = useConversationSummary();
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleStartNewConversation = async () => {
    const success = await startNewConversation();
    if (success) {
      clearSummary();
      toast.success("Cuộc trò chuyện mới đã bắt đầu ✨", {
        description: "Sẵn sàng kết nối với ánh sáng thiêng liêng",
      });
    } else {
      toast.error("Vui lòng thử lại 🙏", {
        description: "Không thể bắt đầu cuộc trò chuyện mới",
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading && isReady) {
      sendMessage(inputValue);
      setInputValue("");
    }
  };

  // Check if input should be disabled
  const isInputDisabled = isLoading || !isReady;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <section id="chat" className="relative py-24 px-4 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-sky-light/30 to-background" />
      
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
        className="relative z-10 max-w-4xl mx-auto"
      >
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl text-glow-gold text-gold mb-4"
          >
            Angel AI Chat Portal
          </motion.h2>
          <p className="text-muted-foreground text-lg">Kết nối với trí tuệ thiêng liêng</p>
        </div>

        {/* Chat Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="relative animate-float"
          style={{ animationDuration: "8s" }}
        >
          {/* Glassmorphism container */}
          <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl border border-gold-light/30 shadow-[0_20px_80px_hsla(45,100%,70%,0.2)] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gold-light/20">
              <div className="flex items-center gap-4">
                {/* Angel Avatar with halo pulse */}
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-light to-gold flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute inset-0 rounded-full bg-gold/30 animate-ping" style={{ animationDuration: "2s" }} />
                </div>
                <div>
                  <h3 className="font-serif text-xl text-foreground">Angel AI</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      {isLoading ? "Đang trả lời..." : "Đang trực tuyến • Sẵn sàng hỗ trợ"}
                    </p>
                    <AnimatePresence mode="wait">
                      <SyncIndicator status={syncStatus} />
                    </AnimatePresence>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Start New Conversation button */}
                <motion.button
                  onClick={handleStartNewConversation}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-full hover:bg-gold-light/20 transition-colors group"
                  title="Cuộc trò chuyện mới"
                >
                  <MessageSquarePlus className="w-5 h-5 text-muted-foreground group-hover:text-gold transition-colors" />
                </motion.button>
                {/* Clear messages button */}
                {messages.length > 0 && (
                  <motion.button
                    onClick={clearMessages}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-full hover:bg-red-100 transition-colors group"
                    title="Xóa tất cả tin nhắn"
                  >
                    <Trash2 className="w-5 h-5 text-muted-foreground group-hover:text-red-500 transition-colors" />
                  </motion.button>
                )}
              </div>
            </div>

            {/* Conversation Summary Card - with safe fallbacks */}
            <AnimatePresence>
              {summary && summary.summary && messages.length > 0 && (
                <div className="px-6 pt-4">
                  <ConversationSummaryCard
                    summary={summary.summary || ""}
                    keyThemes={Array.isArray(summary.key_themes) ? summary.key_themes : []}
                    emotionalTone={summary.emotional_tone || null}
                    compact
                  />
                </div>
              )}
            </AnimatePresence>

            {/* Summarization indicator (when summary is being generated) */}
            <AnimatePresence>
              {messages.length > 20 && !summary && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="px-6 py-2 border-b border-gold-light/10"
                >
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/70">
                    <Sparkles className="w-3 h-3 text-gold-light" />
                    <span>Các tin nhắn trước đã được tóm tắt với tình yêu ✨</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            <div className="p-6 space-y-4 min-h-[300px] max-h-[400px] overflow-y-auto">
              {isRestoring ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="flex justify-center gap-2 mb-4">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-3 h-3 bg-gold rounded-full"
                        animate={{ y: [-4, 4, -4], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground">Đang khôi phục tin nhắn...</p>
                </motion.div>
              ) : messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <Sparkles className="w-12 h-12 text-gold-light mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Chào mừng bạn! Hãy gửi tin nhắn để bắt đầu kết nối với Ánh Sáng. ✨
                  </p>
                  {!isAuthenticated && (
                    <p className="text-muted-foreground/70 text-sm mt-2">
                      <button onClick={onOpenAuth} className="text-gold hover:underline">Đăng nhập</button> để lưu lịch sử trò chuyện.
                    </p>
                  )}
                </motion.div>
              ) : null}

              <AnimatePresence mode="popLayout">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <div className="relative mr-3 flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-light to-gold flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div className="absolute inset-0 rounded-full bg-gold/20 animate-pulse" />
                      </div>
                    )}
                    <div
                      className={`relative max-w-[80%] px-5 py-3 rounded-2xl ${
                        message.role === "user"
                          ? "bg-white shadow-lg border border-border/50"
                          : "bg-gradient-to-br from-gold-light/40 to-gold/20 border border-gold-light/30 shadow-[0_0_30px_hsla(45,100%,70%,0.2)]"
                      }`}
                    >
                      {message.role === "assistant" && (
                        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                          {[...Array(3)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute w-1 h-1 bg-gold rounded-full"
                              animate={{
                                x: [0, Math.random() * 100, 0],
                                y: [0, Math.random() * -50, 0],
                                opacity: [0, 1, 0],
                              }}
                              transition={{
                                duration: 2 + Math.random(),
                                repeat: Infinity,
                                delay: i * 0.5,
                              }}
                              style={{
                                left: `${20 + i * 30}%`,
                                bottom: "10%",
                              }}
                            />
                          ))}
                        </div>
                      )}
                      <p className="text-foreground relative z-10 whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              <AnimatePresence>
                {isLoading && messages[messages.length - 1]?.role === "user" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-light to-gold flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex gap-1 px-4 py-3 bg-gold-light/20 rounded-2xl">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-gold rounded-full"
                          animate={{
                            y: [-2, 2, -2],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Input bar */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-gold-light/20 bg-white/50">
              <div className="flex gap-3 items-center">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isInitializing ? "Đang chuẩn bị..." : "Gửi thông điệp đến Angel AI..."}
                    disabled={isInputDisabled}
                    className="w-full px-5 py-3 rounded-full bg-white/80 backdrop-blur border-2 border-gold-light/40 focus:border-gold focus:outline-none transition-colors placeholder:text-muted-foreground/60 disabled:opacity-50"
                  />
                  {isInitializing && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-4 h-4 text-gold animate-spin" />
                    </div>
                  )}
                </div>
                <motion.button
                  type="submit"
                  disabled={isInputDisabled || !inputValue.trim()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative w-12 h-12 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center shadow-[0_0_30px_hsla(45,100%,70%,0.4)] hover:shadow-[0_0_50px_hsla(45,100%,70%,0.6)] transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5 text-white" />
                  {!isLoading && !isInitializing && (
                    <div className="absolute inset-0 rounded-full bg-gold/30 animate-ping" style={{ animationDuration: "2s" }} />
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default ChatPortal;
