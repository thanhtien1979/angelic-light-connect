import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, LogOut, Trash2, MessageCircle, Calendar, ChevronRight, Sparkles, BookOpen, PenLine, Star, Sun, Volume2, Sunrise, Heart } from "lucide-react";
import GreetingHistory from "@/components/GreetingHistory";
import SavedGreetings from "@/components/SavedGreetings";
import { CamlyCoinDisplay, CamlyCoinNotification } from "@/components/CamlyCoinDisplay";
import { LightJournal } from "@/components/LightJournal";
import { ReflectionModal } from "@/components/ReflectionModal";
import SacredGeometryWatermark from "@/components/SacredGeometryWatermark";
import { useCamlyCoin } from "@/hooks/useCamlyCoin";
import { useBlessingSound } from "@/hooks/useBlessingSound";
import { useDailyGreeting } from "@/hooks/useDailyGreeting";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ChatSession {
  date: string;
  messageCount: number;
  preview: string;
  messages: Array<{ role: string; content: string; created_at: string }>;
  summary?: string;
  keyThemes?: string[];
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const { balance, formatCoins, isLoading: coinLoading } = useCamlyCoin();
  const { isEnabled: soundEnabled, toggleSound } = useBlessingSound();
  const { greetingEnabled, toggleGreetingEnabled, markGreetingSeen } = useDailyGreeting();
  const prefersReducedMotion = useReducedMotion();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReflectionOpen, setIsReflectionOpen] = useState(false);
  const [coinNotification, setCoinNotification] = useState<{ show: boolean; coins: number; message: string }>({
    show: false,
    coins: 0,
    message: "",
  });

  // Mark greeting as seen when visiting Profile
  useEffect(() => {
    markGreetingSeen();
  }, [markGreetingSeen]);

  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from("chat_messages")
          .select("role, content, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true });

        if (error) throw error;

        // Group messages by date
        const sessionsByDate = new Map<string, ChatSession>();
        
        data?.forEach((msg) => {
          const date = new Date(msg.created_at).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });

          if (!sessionsByDate.has(date)) {
            sessionsByDate.set(date, {
              date,
              messageCount: 0,
              preview: "",
              messages: [],
            });
          }

          const session = sessionsByDate.get(date)!;
          session.messages.push(msg);
          session.messageCount++;
          
          if (msg.role === "user" && !session.preview) {
            session.preview = msg.content.slice(0, 80) + (msg.content.length > 80 ? "..." : "");
          }
        });

        setChatSessions(Array.from(sessionsByDate.values()).reverse());
      } catch (error) {
        console.error("Error fetching chat history:", error);
        toast.error("Không thể tải lịch sử trò chuyện");
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatHistory();
  }, [user?.id]);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const { error: deleteMessagesError } = await supabase
        .from("chat_messages")
        .delete()
        .eq("user_id", user?.id);

      if (deleteMessagesError) throw deleteMessagesError;

      await signOut();
      toast.success("Tài khoản đã được xóa");
      window.location.href = "/";
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Không thể xóa tài khoản. Vui lòng thử lại.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReflectionSuccess = (result: { coins: number; message: string }) => {
    setCoinNotification({
      show: true,
      coins: result.coins,
      message: result.message,
    });
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Người dùng";
  const avatarUrl = user?.user_metadata?.avatar_url;
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 relative">
      {/* Sacred Geometry Watermark */}
      <SacredGeometryWatermark />
      
      {/* Ambient Sacred Glow */}
      <div 
        className="fixed inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <div 
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-radial from-gold/[0.04] via-rose-200/[0.02] to-transparent animate-ambient-breath blur-3xl"
        />
        <div 
          className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] rounded-full bg-gradient-radial from-amber-100/[0.03] to-transparent animate-ambient-breath blur-3xl"
          style={{ animationDelay: "-5s" }}
        />
      </div>
      
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/" className="p-2 rounded-full hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground/70" />
          </Link>
          <h1 className="text-lg font-semibold text-foreground">Hồ Sơ Của Bạn</h1>
        </div>
      </header>

      <motion.main 
        initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-4xl mx-auto px-4 py-8 space-y-8"
      >
        {/* Profile Card with Camly Coin */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-card/80 via-card/60 to-primary/10 backdrop-blur-sm border border-border/50 shadow-lg"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Avatar & Name */}
            <div className="flex items-center gap-4 flex-1">
              <Avatar className="w-20 h-20 ring-2 ring-primary/30 ring-offset-2 ring-offset-background shadow-lg">
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback className="bg-primary/20 text-primary font-serif text-xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-serif font-semibold text-foreground truncate">{displayName}</h2>
                <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>

            {/* Total Light Accumulated */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="p-4 rounded-xl bg-gradient-to-br from-gold/20 via-gold-light/10 to-transparent border border-gold/30 text-center md:text-right"
            >
              <div className="flex items-center justify-center md:justify-end gap-2 mb-1">
                <Sun className="w-4 h-4 text-gold" />
                <span className="text-xs uppercase tracking-wider text-muted-foreground">Total Light Accumulated</span>
              </div>
              {coinLoading ? (
                <div className="h-8 w-24 bg-muted/30 rounded animate-pulse mx-auto md:ml-auto md:mr-0" />
              ) : (
                <motion.div
                  key={balance.total_coins}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="flex items-center justify-center md:justify-end gap-2"
                >
                  <Star className="w-5 h-5 text-gold fill-gold/30" />
                  <span className="text-2xl font-bold text-gold">
                    {balance.total_coins.toLocaleString("vi-VN")}
                  </span>
                  <Sparkles className="w-4 h-4 text-gold/70" />
                </motion.div>
              )}
              <p className="text-xs text-muted-foreground/70 mt-1">Happy Camly Coin</p>
            </motion.div>
          </div>
        </motion.section>

        {/* Light Journal Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 shadow-lg"
        >
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-gold/20">
                <BookOpen className="w-5 h-5 text-gold" />
              </div>
              <div>
                <h3 className="font-serif text-xl text-foreground">Nhật Ký Ánh Sáng</h3>
                <p className="text-xs text-muted-foreground">Hành trình tâm linh của bạn</p>
              </div>
            </div>
            
            {/* Write Reflection Button */}
            <Button
              onClick={() => setIsReflectionOpen(true)}
              className="bg-gradient-to-r from-gold/80 to-gold hover:from-gold hover:to-gold-dark text-background gap-2 shadow-lg shadow-gold/20"
            >
              <PenLine className="w-4 h-4" />
              <span className="hidden sm:inline">Viết Suy Ngẫm</span>
              <span className="sm:hidden">Viết</span>
            </Button>
          </div>

          {/* Light Journal Content */}
          <LightJournal showTitle={false} maxItems={10} showCoins={true} />
        </motion.section>

        {/* Greeting History Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-full bg-gold/20">
              <Heart className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h3 className="font-serif text-xl text-foreground">Lời Chào Ánh Sáng</h3>
              <p className="text-xs text-muted-foreground">Những thông điệp thiêng liêng mỗi sáng</p>
            </div>
          </div>
          <GreetingHistory />

          {/* Saved Greetings Sub-section */}
          <div className="mt-6 pt-6 border-t border-border/30">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-4 h-4 text-rose-400" />
              <h4 className="font-serif text-foreground">Lời Chào Đã Lưu</h4>
            </div>
            <SavedGreetings />
          </div>
        </motion.section>

        {/* Chat History */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Lịch Sử Trò Chuyện
          </h3>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-xl bg-muted/30 animate-pulse h-20" />
              ))}
            </div>
          ) : chatSessions.length === 0 ? (
            <div className="p-8 rounded-xl bg-muted/20 text-center">
              <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">Chưa có cuộc trò chuyện nào</p>
              <Link to="/#chat" className="mt-4 inline-block text-primary hover:underline">
                Bắt đầu trò chuyện với Angel AI
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {chatSessions.map((session, index) => (
                <motion.button
                  key={session.date}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedSession(session)}
                  className="w-full p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:bg-card/80 hover:border-primary/30 transition-all text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Calendar className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground">{session.date}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {session.messageCount} tin nhắn • {session.preview || "Cuộc trò chuyện"}
                        </p>
                        {session.keyThemes && session.keyThemes.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {session.keyThemes.slice(0, 2).map((theme, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-gold/15 text-foreground/80 border border-gold/30"
                              >
                                <Sparkles className="w-2.5 h-2.5 text-gold" />
                                {theme}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </motion.section>

        {/* Account Settings */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold text-foreground">Cài Đặt Tài Khoản</h3>

          {/* Spiritual Settings */}
          <div className="p-4 rounded-xl bg-card/50 border border-border/50 space-y-4">
            {/* Daily Greeting Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-gold/20">
                  <Sunrise className="w-4 h-4 text-gold" />
                </div>
                <div>
                  <Label htmlFor="daily-greeting" className="text-sm font-medium text-foreground cursor-pointer">
                    Daily Light Greeting
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Nhận lời chào nhẹ nhàng mỗi ngày dựa trên trạng thái ánh sáng
                  </p>
                </div>
              </div>
              <Switch
                id="daily-greeting"
                checked={greetingEnabled}
                onCheckedChange={toggleGreetingEnabled}
                className="data-[state=checked]:bg-gold"
              />
            </div>

            {/* Divider */}
            <div className="h-px bg-border/50" />

            {/* Sound Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-gold/20">
                  <Volume2 className="w-4 h-4 text-gold" />
                </div>
                <div>
                  <Label htmlFor="blessing-sound" className="text-sm font-medium text-foreground cursor-pointer">
                    Âm thanh ánh sáng
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Bật âm thanh nhẹ khi nhận Camly Coin
                  </p>
                </div>
              </div>
              <Switch
                id="blessing-sound"
                checked={soundEnabled}
                onCheckedChange={toggleSound}
                className="data-[state=checked]:bg-gold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4" />
              Đăng Xuất
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-12 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                >
                  <Trash2 className="w-4 h-4" />
                  Xóa Tài Khoản
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận xóa tài khoản?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Hành động này không thể hoàn tác. Tất cả dữ liệu và lịch sử trò chuyện của bạn sẽ bị xóa vĩnh viễn.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? "Đang xóa..." : "Xóa Tài Khoản"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </motion.section>
      </motion.main>

      {/* Chat Session Modal */}
      <AnimatePresence>
        {selectedSession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedSession(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[80vh] bg-card rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h4 className="font-semibold text-foreground">{selectedSession.date}</h4>
                <Button variant="ghost" size="sm" onClick={() => setSelectedSession(null)}>
                  Đóng
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedSession.messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted text-foreground rounded-bl-md"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p className="text-xs mt-1 opacity-60">
                        {new Date(msg.created_at).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reflection Modal */}
      <ReflectionModal
        isOpen={isReflectionOpen}
        onClose={() => setIsReflectionOpen(false)}
        onSuccess={handleReflectionSuccess}
      />

      {/* Coin Notification */}
      <CamlyCoinNotification
        show={coinNotification.show}
        coins={coinNotification.coins}
        message={coinNotification.message}
        onClose={() => setCoinNotification({ ...coinNotification, show: false })}
      />
    </div>
  );
};

export default Profile;
