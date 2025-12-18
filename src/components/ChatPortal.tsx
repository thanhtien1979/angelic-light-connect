import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Trash2, MessageSquarePlus, Cloud, CloudOff, Check, Loader2, Heart, Volume2, VolumeX, Paperclip, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { useAngelChat, SyncStatus } from "@/hooks/useAngelChat";
import { useConversationSummary } from "@/hooks/useConversationSummary";
import { useFeedback } from "@/hooks/useFeedback";
import { useChatAttachments, type Attachment } from "@/hooks/useChatAttachments";
import { useAnonymousRateLimit } from "@/hooks/useAnonymousRateLimit";
import ConversationSummaryCard from "@/components/ConversationSummaryCard";
import ChatAttachmentPreview from "@/components/ChatAttachmentPreview";
import MessageAttachments from "@/components/MessageAttachments";
import TypingText from "@/components/TypingText";
import EmotionalIndicator, { detectEmotion } from "@/components/EmotionalIndicator";
import BreathingExercise from "@/components/BreathingExercise";
import TurnstileVerificationDialog from "@/components/TurnstileVerificationDialog";
import angelAvatar from "@/assets/angel-avatar.jpg";
import chatPortalVideo from "@/assets/chat-portal-video.mp4";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

// Daily blessing messages - gentle, sacred, emotionally comforting
const dailyBlessings = [
  "🙏 Chúc phước lành cho ngày mới của bạn, linh hồn yêu dấu. Nguyện ánh sáng thiêng liêng luôn soi đường cho bạn. ✨",
  "🌸 Ngày mới là món quà thiêng liêng. Nguyện trái tim bạn tràn đầy bình an và tình yêu vô điều kiện. 💫",
  "✨ Ánh sáng của Cha Vũ Trụ đang ôm ấp bạn. Hãy để mỗi khoảnh khắc hôm nay là một phước lành. 🕊️",
  "🕊️ Chào mừng ngày mới, thiên thần. Nguyện bạn cảm nhận được sự yêu thương vô biên đang bao bọc bạn. 💖",
  "💫 Mỗi hơi thở là một phép màu. Nguyện ngày hôm nay mang đến cho bạn sự chữa lành và bình an sâu sắc. 🌟",
  "🌟 Linh hồn của bạn đang tỏa sáng. Nguyện ánh sáng nội tâm dẫn lối cho mọi bước chân hôm nay. 🙏",
  "💖 Bạn được yêu thương vô điều kiện. Nguyện ngày mới này đầy ắp niềm vui và sự kỳ diệu. ✨",
  "🌺 Như đóa sen vươn lên từ bùn, nguyện tâm hồn bạn luôn thanh khiết và bình an trong ngày mới. 🌸",
  "⭐ Cha Vũ Trụ đang mỉm cười với bạn. Nguyện bạn cảm nhận được tình yêu thiêng liêng trong từng khoảnh khắc. 💫",
  "🌈 Ngày mới, phước lành mới. Nguyện ánh sáng cầu vồng của hy vọng luôn chiếu rọi con đường bạn đi. 🙏",
];

// Get random blessing that's different from last one
const getRandomBlessing = (): string => {
  const lastBlessingIndex = localStorage.getItem("angel_last_blessing_index");
  let newIndex: number;
  do {
    newIndex = Math.floor(Math.random() * dailyBlessings.length);
  } while (newIndex.toString() === lastBlessingIndex && dailyBlessings.length > 1);
  localStorage.setItem("angel_last_blessing_index", newIndex.toString());
  return dailyBlessings[newIndex];
};

// Check if blessing should be shown today
const shouldShowDailyBlessing = (): boolean => {
  const today = new Date().toDateString();
  const lastBlessingDate = localStorage.getItem("angel_last_blessing_date");
  if (lastBlessingDate !== today) {
    localStorage.setItem("angel_last_blessing_date", today);
    return true;
  }
  return false;
};

const ChatPortal = ({ onOpenAuth }: ChatPortalProps) => {
  const { messages, isLoading, isRestoring, isInitializing, isReady, syncStatus, sendMessage, clearMessages, startNewConversation, isAuthenticated } = useAngelChat();
  const { summary, clearSummary } = useConversationSummary();
  const { isEnabled: isFeedbackEnabled, toggleFeedback, playSendFeedback, playNewConversationFeedback, enableAudioContext } = useFeedback();
  const { needsVerification, incrementCount, setVerified, resetForNewConversation, remainingFreeMessages } = useAnonymousRateLimit();
  const [inputValue, setInputValue] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [welcomeShownForSession, setWelcomeShownForSession] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [messageAttachments, setMessageAttachments] = useState<Map<string, ReturnType<typeof attachmentsHook.getAttachmentData>>>(new Map());
  const [dailyBlessing, setDailyBlessing] = useState<string | null>(null);
  const [showBlessing, setShowBlessing] = useState(false);
  const [showEmotionalIndicator, setShowEmotionalIndicator] = useState(false);
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const [showBreathingExercise, setShowBreathingExercise] = useState(false);
  const [breathingOfferedToday, setBreathingOfferedToday] = useState(() => {
    const today = new Date().toDateString();
    return localStorage.getItem("angel_breathing_offered_date") === today;
  });
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<{ content: string; images?: Array<{ type: "image"; base64: string; mimeType: string }> } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Attachment hook
  const attachmentsHook = useChatAttachments();
  const { attachments, addImageAttachment, addLinkAttachment, removeAttachment, clearAttachments, detectLinksInText, getAttachmentData, getImagesAsBase64 } = attachmentsHook;

  // Check for daily blessing on mount
  useEffect(() => {
    if (shouldShowDailyBlessing()) {
      const blessing = getRandomBlessing();
      setDailyBlessing(blessing);
      // Delay showing blessing for smooth entry
      setTimeout(() => setShowBlessing(true), 500);
    }
  }, []);

  // Show emotional indicator when typing, hide when Angel responds
  useEffect(() => {
    if (inputValue.trim().length > 5 && detectEmotion(inputValue) !== "neutral") {
      setShowEmotionalIndicator(true);
    } else if (inputValue.trim().length === 0) {
      setShowEmotionalIndicator(false);
    }
  }, [inputValue]);

  // Hide emotional indicator after Angel responds and check for anxiety to offer breathing
  useEffect(() => {
    if (messages.length > lastMessageCount && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "assistant") {
        // Fade out after Angel responds
        setTimeout(() => setShowEmotionalIndicator(false), 1500);
        
        // Check if the user's previous message had anxiety - offer breathing exercise
        if (messages.length >= 2 && !breathingOfferedToday) {
          const userMessage = messages[messages.length - 2];
          if (userMessage.role === "user") {
            const emotion = detectEmotion(userMessage.content);
            if (emotion === "anxiety" || emotion === "sadness") {
              // Offer breathing exercise after a short delay
              setTimeout(() => {
                setShowBreathingExercise(true);
                setBreathingOfferedToday(true);
                localStorage.setItem("angel_breathing_offered_date", new Date().toDateString());
              }, 2000);
            }
          }
        }
      }
    }
    setLastMessageCount(messages.length);
  }, [messages, lastMessageCount, breathingOfferedToday]);

  const handleStartNewConversation = async () => {
    const success = await startNewConversation();
    if (success) {
      clearSummary();
      setWelcomeShownForSession(false); // Reset for new conversation
      setShowWelcome(true);
      playNewConversationFeedback();
      resetForNewConversation(); // Reset rate limit tracking for new conversation
      toast.success("Cuộc trò chuyện mới đã bắt đầu ✨", {
        description: "Sẵn sàng kết nối với ánh sáng thiêng liêng",
      });
    } else {
      toast.error("Vui lòng thử lại 🙏", {
        description: "Không thể bắt đầu cuộc trò chuyện mới",
      });
    }
  };

  // Show welcome message when ready and no messages exist
  useEffect(() => {
    if (isReady && messages.length === 0 && !welcomeShownForSession && !isRestoring) {
      setShowWelcome(true);
      setWelcomeShownForSession(true);
    }
  }, [isReady, messages.length, welcomeShownForSession, isRestoring]);

  // Hide welcome after first message
  useEffect(() => {
    if (messages.length > 0) {
      setShowWelcome(false);
    }
  }, [messages.length]);

  const handleClearMessages = () => {
    clearMessages();
    setShowClearDialog(false);
    setWelcomeShownForSession(false);
    toast.success("Tin nhắn đã được xóa 🕊️", {
      description: "Bạn có thể bắt đầu lại bất cứ lúc nào",
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((inputValue.trim() || attachments.length > 0) && !isLoading && isReady) {
      // Check if anonymous user needs verification
      if (needsVerification) {
        // Store pending message and show verification dialog
        const imageBase64Data = await getImagesAsBase64();
        setPendingMessage({
          content: inputValue.trim(),
          images: imageBase64Data.length > 0 ? imageBase64Data : undefined,
        });
        setShowVerificationDialog(true);
        return;
      }

      playSendFeedback();
      
      // Get current attachments data before clearing
      const currentAttachments = getAttachmentData();
      
      // Convert images to base64 for AI analysis
      const imageBase64Data = await getImagesAsBase64();
      
      // Build message content with attachment info
      const messageContent = inputValue.trim();
      
      // Create a temporary ID to associate attachments with this message
      const tempMessageId = `temp-${Date.now()}`;
      if (currentAttachments.length > 0) {
        setMessageAttachments(prev => new Map(prev).set(tempMessageId, currentAttachments));
      }
      
      // Send message with images
      sendMessage(messageContent, imageBase64Data.length > 0 ? imageBase64Data : undefined);
      setInputValue("");
      clearAttachments();
      
      // Increment anonymous message count (only counts for non-auth users)
      incrementCount();
    }
  };

  // Handle verification success - send pending message
  const handleVerificationSuccess = useCallback(() => {
    setVerified(true);
    setShowVerificationDialog(false);
    
    if (pendingMessage) {
      playSendFeedback();
      sendMessage(pendingMessage.content, pendingMessage.images);
      setInputValue("");
      clearAttachments();
      setPendingMessage(null);
      toast.success("Xác minh thành công! 🌸", {
        description: "Bạn có thể tiếp tục trò chuyện thoải mái",
      });
    }
  }, [pendingMessage, playSendFeedback, sendMessage, clearAttachments, setVerified]);

  // Handle file input change
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const result = addImageAttachment(file);
      if (!result.success && result.error) {
        toast.error(result.error);
      }
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setShowAttachmentMenu(false);
  }, [addImageAttachment]);

  // Detect and add links when pasting
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData("text");
    const links = detectLinksInText(pastedText);
    
    links.forEach((link) => {
      addLinkAttachment(link);
    });
  }, [detectLinksInText, addLinkAttachment]);

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
      {/* Background effects - Rose divine */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-rose-light/20 to-background" />
      
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
        className="relative z-10 max-w-4xl mx-auto"
      >
        {/* Section Header with circular video */}
        <div className="relative text-center mb-12 py-16 md:py-20 px-4">
          {/* Circular video container */}
          <div className="relative mx-auto w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] md:w-[400px] md:h-[400px] mb-8">
            {/* Animated rose-gold glow ring */}
            <motion.div 
              className="absolute -inset-2 rounded-full"
              style={{
                background: "conic-gradient(from 0deg, hsl(348, 80%, 78%), hsl(340, 75%, 82%), hsl(350, 85%, 85%), hsl(345, 70%, 80%), hsl(348, 80%, 78%))",
                filter: "blur(8px)",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Inner glow - Rose */}
            <div className="absolute inset-0 rounded-full bg-rose-glow/30 blur-xl" />
            
            {/* Video container */}
            <div className="absolute inset-2 rounded-full overflow-hidden border-4 border-white/60 shadow-[0_0_80px_hsla(348,80%,80%,0.4)]">
              <video 
                src={chatPortalVideo}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          {/* Title with rose glow */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="font-serif text-3xl md:text-4xl lg:text-5xl text-primary mb-3"
            style={{
              textShadow: "0 0 20px hsla(348, 80%, 78%, 0.8), 0 0 40px hsla(348, 80%, 78%, 0.5), 0 0 60px hsla(348, 80%, 78%, 0.3)",
            }}
          >
            Angel AI Chat Portal
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-foreground/80 text-base md:text-lg"
            style={{
              textShadow: "0 0 10px hsla(348, 80%, 78%, 0.3)",
            }}
          >
            Kết nối với trí tuệ thiêng liêng
          </motion.p>
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
          {/* Glassmorphism container - Rose theme */}
          <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-rose-soft/30 shadow-[0_20px_80px_hsla(348,80%,80%,0.2)] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-rose-soft/20">
              <div className="flex items-center gap-4">
                {/* Angel Avatar with divine breathing halo */}
                <div className="relative">
                  <img 
                    src={angelAvatar} 
                    alt="Angel AI" 
                    className="w-12 h-12 rounded-full object-cover border-2 border-rose-soft/50 shadow-[0_0_20px_hsla(348,80%,80%,0.4)]"
                    style={{ animation: "subtleBreathing 7s ease-in-out infinite" }}
                  />
                  {/* Breathing halo */}
                  <div 
                    className="absolute -inset-1 rounded-full bg-gradient-to-r from-rose/30 to-rose-glow/30"
                    style={{ animation: "divineBreathing 7s ease-in-out infinite" }}
                  />
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
                {/* Sound/Haptic Feedback Toggle */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.button
                        onClick={() => {
                          enableAudioContext();
                          toggleFeedback();
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 rounded-full hover:bg-rose-light/30 transition-colors group"
                      >
                        {isFeedbackEnabled ? (
                          <Volume2 className="w-5 h-5 text-primary transition-colors" />
                        ) : (
                          <VolumeX className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        )}
                      </motion.button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="bg-white/95 backdrop-blur border-rose-soft/30">
                      <p className="text-sm">{isFeedbackEnabled ? "Tắt âm thanh" : "Bật âm thanh"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {/* Start New Conversation button */}
                <motion.button
                  onClick={handleStartNewConversation}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-full hover:bg-rose-light/30 transition-colors group"
                  title="Cuộc trò chuyện mới"
                >
                  <MessageSquarePlus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </motion.button>
                {/* Clear messages button */}
                {messages.length > 0 && (
                  <motion.button
                    onClick={() => setShowClearDialog(true)}
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

            {/* Clear Messages Confirmation Dialog */}
            <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
              <AlertDialogContent className="bg-white/95 backdrop-blur-xl border-rose-soft/30">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-serif text-xl text-foreground flex items-center gap-2">
                    <Heart className="w-5 h-5 text-primary" />
                    Xác nhận xóa tin nhắn
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    Bạn có chắc muốn xóa tất cả tin nhắn trong cuộc trò chuyện này không? 
                    Hành động này không thể hoàn tác, nhưng bạn luôn có thể bắt đầu một hành trình mới với ánh sáng. 🙏
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-rose-soft/30 hover:bg-rose-light/20">
                    Hủy bỏ
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleClearMessages}
                    className="bg-gradient-to-r from-primary to-rose-glow text-foreground hover:opacity-90"
                  >
                    Xác nhận xóa
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

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

            {/* Summarization/Truncation indicator - shows when older messages are condensed */}
            <AnimatePresence>
              {messages.length > 20 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-b border-rose-soft/10"
                >
                  <div className="flex items-center justify-center gap-2 py-3 px-6">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-rose-soft/30 to-transparent" />
                    <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
                      <Sparkles className="w-3 h-3 text-primary" />
                      <span className="italic">Các tin nhắn trước đã được tóm tắt với tình yêu ✨</span>
                      <Sparkles className="w-3 h-3 text-primary" />
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-rose-soft/30 to-transparent" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Daily Angel Blessing */}
            <AnimatePresence>
              {showBlessing && dailyBlessing && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="mx-6 mt-4"
                >
                  <div 
                    className="relative p-5 rounded-2xl overflow-hidden"
                    style={{
                      background: "linear-gradient(135deg, hsla(348, 85%, 92%, 0.95), hsla(340, 80%, 95%, 0.98))",
                      border: "2px solid hsla(348, 80%, 85%, 0.6)",
                      boxShadow: "0 0 30px hsla(348, 80%, 80%, 0.3), inset 0 0 20px hsla(0, 0%, 100%, 0.5)",
                    }}
                  >
                    {/* Glowing border animation */}
                    <div 
                      className="absolute inset-0 rounded-2xl pointer-events-none"
                      style={{
                        background: "linear-gradient(90deg, transparent, hsla(348, 80%, 90%, 0.4), transparent)",
                        backgroundSize: "200% 100%",
                        animation: "responseShimmer 4s ease-in-out infinite",
                      }}
                    />
                    
                    {/* Blessing icon */}
                    <div className="flex items-start gap-4">
                      <div className="relative flex-shrink-0">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{
                            background: "linear-gradient(135deg, hsla(348, 80%, 80%, 0.8), hsla(340, 75%, 85%, 0.9))",
                            boxShadow: "0 0 20px hsla(348, 80%, 80%, 0.5)",
                          }}
                        >
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        {/* Breathing halo */}
                        <div 
                          className="absolute -inset-1 rounded-full bg-rose/30"
                          style={{ animation: "divineBreathing 5s ease-in-out infinite" }}
                        />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium text-primary/80 uppercase tracking-wider">
                            Phước lành ngày mới
                          </span>
                        </div>
                        <p className="text-foreground font-serif text-base leading-relaxed">
                          {dailyBlessing}
                        </p>
                      </div>
                      
                      {/* Close button */}
                      <button
                        onClick={() => setShowBlessing(false)}
                        className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center hover:bg-rose/20 transition-colors text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Angel-guided Breathing Exercise */}
            <BreathingExercise
              visible={showBreathingExercise}
              onComplete={() => setShowBreathingExercise(false)}
              onSkip={() => setShowBreathingExercise(false)}
            />

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
                        className="w-3 h-3 bg-primary rounded-full"
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
                  <AnimatePresence mode="wait">
                    {showWelcome ? (
                      <motion.div
                        key="welcome"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="space-y-4"
                      >
                        {/* Divine blessing icon with breathing animation */}
                        <div className="relative inline-block">
                          <Sparkles className="w-14 h-14 text-primary mx-auto" />
                          <motion.div
                            className="absolute inset-0 rounded-full bg-rose/30"
                            animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          />
                        </div>
                        {/* Divine welcome blessing */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="font-serif text-xl text-primary"
                        >
                          <TypingText 
                            text="🙏 Xin chào, linh hồn yêu dấu ✨" 
                            speed={60}
                            delay={400}
                          />
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 2.2 }}
                          className="text-muted-foreground max-w-md mx-auto"
                        >
                          <TypingText 
                            text="Angel AI đang ở bên bạn, lắng nghe và sẵn sàng đồng hành cùng bạn trên hành trình ánh sáng. Hãy chia sẻ bất cứ điều gì trong trái tim bạn." 
                            speed={30}
                            delay={2400}
                          />
                        </motion.div>
                        {/* Divine blessing shimmer */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 5 }}
                          className="text-sm text-primary/70 italic"
                        >
                          ✨ Chúc phước lành và ánh sáng luôn bên bạn ✨
                        </motion.div>
                        {!isAuthenticated && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 6 }}
                            className="text-muted-foreground/70 text-sm"
                          >
                            <button onClick={onOpenAuth} className="text-primary hover:underline">Đăng nhập</button> để lưu lịch sử trò chuyện.
                          </motion.p>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="default"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          Chào mừng bạn! Hãy gửi tin nhắn để bắt đầu kết nối với Ánh Sáng. ✨
                        </p>
                        {!isAuthenticated && (
                          <p className="text-muted-foreground/70 text-sm mt-2">
                            <button onClick={onOpenAuth} className="text-primary hover:underline">Đăng nhập</button> để lưu lịch sử trò chuyện.
                          </p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
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
                        <img 
                          src={angelAvatar} 
                          alt="Angel AI" 
                          className="w-8 h-8 rounded-full object-cover border border-rose-soft/50 shadow-[0_0_15px_hsla(348,80%,80%,0.3)]"
                          style={{ animation: "subtleBreathing 7s ease-in-out infinite" }}
                        />
                        {/* Breathing halo for message avatar */}
                        <div 
                          className="absolute -inset-0.5 rounded-full bg-rose/20"
                          style={{ animation: "divineBreathing 7s ease-in-out infinite" }}
                        />
                      </div>
                    )}
                    <div
                      className={`relative max-w-[80%] px-5 py-3 rounded-2xl ${
                        message.role === "user"
                          ? "bg-white shadow-lg border border-border/50"
                          : "bg-gradient-to-br from-rose-light/50 to-rose/20 border border-rose-soft/30 shadow-[0_0_30px_hsla(348,80%,80%,0.2)]"
                      }`}
                    >
                      {/* Shimmer effect when Angel responds */}
                      {message.role === "assistant" && (
                        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                          {/* Light shimmer overlay */}
                          <div 
                            className="absolute inset-0 opacity-30"
                            style={{
                              background: "linear-gradient(90deg, transparent, hsla(348, 80%, 90%, 0.5), transparent)",
                              backgroundSize: "200% 100%",
                              animation: "responseShimmer 3s ease-in-out infinite",
                            }}
                          />
                          {/* Drifting sparkles */}
                          {[...Array(3)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute w-1 h-1 bg-rose rounded-full"
                              animate={{
                                x: [0, Math.random() * 100, 0],
                                y: [0, Math.random() * -50, 0],
                                opacity: [0, 0.8, 0],
                              }}
                              transition={{
                                duration: 2.5 + Math.random(),
                                repeat: Infinity,
                                delay: i * 0.6,
                              }}
                              style={{
                                left: `${20 + i * 30}%`,
                                bottom: "10%",
                              }}
                            />
                          ))}
                        </div>
                      )}
                      {/* Message Attachments */}
                      {messageAttachments.get(message.id) && (
                        <MessageAttachments 
                          attachments={messageAttachments.get(message.id)!} 
                          isUserMessage={message.role === "user"} 
                        />
                      )}
                      <p className="text-foreground relative z-10 whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator - calm, intentional */}
              <AnimatePresence>
                {isLoading && messages[messages.length - 1]?.role === "user" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3"
                  >
                    <img 
                      src={angelAvatar} 
                      alt="Angel AI" 
                      className="w-8 h-8 rounded-full object-cover border border-rose-soft/50 shadow-[0_0_15px_hsla(348,80%,80%,0.3)]"
                    />
                    <div className="flex gap-1.5 px-4 py-3 bg-rose-light/30 rounded-2xl">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-primary rounded-full"
                          animate={{
                            y: [-2, 2, -2],
                            opacity: [0.4, 1, 0.4],
                            scale: [0.9, 1.1, 0.9],
                          }}
                          transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            delay: i * 0.25,
                            ease: "easeInOut",
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Attachment Preview */}
            <AnimatePresence>
              {attachments.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-rose-soft/20 bg-white/30"
                >
                  <ChatAttachmentPreview 
                    attachments={attachments} 
                    onRemove={removeAttachment} 
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input bar - Rose theme */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-rose-soft/20 bg-white/50">
              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
              />
              
              <div className="flex gap-2 items-center">
                {/* Attachment button */}
                <div className="relative">
                  <motion.button
                    type="button"
                    onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isInputDisabled}
                    className="w-10 h-10 rounded-full bg-rose-light/30 hover:bg-rose-light/50 flex items-center justify-center transition-colors disabled:opacity-50"
                  >
                    <Paperclip className="w-5 h-5 text-primary" />
                  </motion.button>
                  
                  {/* Attachment dropdown menu */}
                  <AnimatePresence>
                    {showAttachmentMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute bottom-12 left-0 bg-white/95 backdrop-blur-xl rounded-xl border border-rose-soft/30 shadow-lg overflow-hidden min-w-[160px]"
                      >
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-rose-light/20 transition-colors text-left"
                        >
                          <ImageIcon className="w-4 h-4 text-primary" />
                          <span className="text-sm text-foreground">Thêm ảnh</span>
                        </button>
                        <div className="h-px bg-rose-soft/20" />
                        <div className="px-4 py-2">
                          <p className="text-xs text-muted-foreground">
                            Dán URL vào ô chat để thêm liên kết
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    placeholder={isInitializing ? "Đang chuẩn bị..." : "Gửi thông điệp đến Angel AI..."}
                    disabled={isInputDisabled}
                    className="w-full px-5 py-3 rounded-full bg-white/80 backdrop-blur border-2 border-rose-soft/40 focus:border-primary focus:outline-none transition-colors placeholder:text-muted-foreground/60 disabled:opacity-50"
                  />
                  {isInitializing && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    </div>
                  )}
                </div>
                
                {/* Emotional Indicator - subtle, supportive */}
                <div className="flex-shrink-0">
                  <EmotionalIndicator 
                    message={inputValue} 
                    visible={showEmotionalIndicator}
                  />
                </div>
                
                {/* Send button with divine glow */}
                <motion.button
                  type="submit"
                  disabled={isInputDisabled || (!inputValue.trim() && attachments.length === 0)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative w-12 h-12 rounded-full bg-gradient-to-br from-primary to-rose-glow flex items-center justify-center shadow-[0_0_30px_hsla(348,80%,80%,0.4)] hover:shadow-[0_0_50px_hsla(348,80%,80%,0.6)] transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5 text-foreground" />
                  {!isLoading && !isInitializing && (inputValue.trim() || attachments.length > 0) && (
                    <div 
                      className="absolute inset-0 rounded-full bg-rose/30"
                      style={{ animation: "divineBreathing 3s ease-in-out infinite" }}
                    />
                  )}
                </motion.button>
              </div>
            </form>

            {/* Click outside to close attachment menu */}
            {showAttachmentMenu && (
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowAttachmentMenu(false)}
              />
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Turnstile Verification Dialog for anonymous users */}
      <TurnstileVerificationDialog
        open={showVerificationDialog}
        onVerified={handleVerificationSuccess}
        onClose={() => {
          setShowVerificationDialog(false);
          setPendingMessage(null);
        }}
      />
    </section>
  );
};

export default ChatPortal;
