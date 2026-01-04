import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Share2, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Download, 
  Copy, 
  Check, 
  Loader2, 
  AlertTriangle,
  Eye,
  EyeOff,
  Trash2,
  X
} from "lucide-react";
import html2canvas from "html2canvas";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import angelAvatar from "@/assets/angel-avatar.jpg";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ShareConversationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
}

const ShareConversationDialog = ({ isOpen, onClose, messages }: ShareConversationDialogProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"image" | "link">("image");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [visibility, setVisibility] = useState<"unlisted" | "public">("unlisted");
  const [generatedShareUrl, setGeneratedShareUrl] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [userSharedLinks, setUserSharedLinks] = useState<Array<{ id: string; share_id: string; created_at: string; visibility: string }>>([]);
  const [isLoadingLinks, setIsLoadingLinks] = useState(false);
  const chatContentRef = useRef<HTMLDivElement>(null);

  // Generate secure share ID
  const generateShareId = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const array = new Uint8Array(12);
    crypto.getRandomValues(array);
    for (let i = 0; i < 12; i++) {
      result += chars[array[i] % chars.length];
    }
    return result;
  };

  // Load user's existing shared links
  const loadUserSharedLinks = async () => {
    if (!user) return;
    setIsLoadingLinks(true);
    try {
      const { data, error } = await supabase
        .from("shared_conversations")
        .select("id, share_id, created_at, visibility")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      
      if (!error && data) {
        setUserSharedLinks(data);
      }
    } catch (err) {
      console.error("Error loading shared links:", err);
    } finally {
      setIsLoadingLinks(false);
    }
  };

  // Export as image
  const handleExportImage = async () => {
    if (!chatContentRef.current) return;
    
    setIsGeneratingImage(true);
    try {
      const canvas = await html2canvas(chatContentRef.current, {
        backgroundColor: "#fff8f8",
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: 600,
        windowHeight: chatContentRef.current.scrollHeight,
      });
      
      const dataUrl = canvas.toDataURL("image/png");
      
      // Try native share API on mobile
      if (navigator.share && navigator.canShare) {
        try {
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], "angel-conversation.png", { type: "image/png" });
          
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: "Cuộc trò chuyện với Thiên Thần",
            });
            toast.success("Đã chia sẻ hình ảnh thành công! 🌸");
            return;
          }
        } catch (shareErr) {
          // Fallback to download if share fails
          console.log("Share failed, falling back to download:", shareErr);
        }
      }
      
      // Fallback: download
      const link = document.createElement("a");
      link.download = `angel-conversation-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Đã tải xuống hình ảnh! 📸");
    } catch (err) {
      console.error("Error generating image:", err);
      toast.error("Không thể tạo hình ảnh. Vui lòng thử lại.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Create share link
  const handleCreateShareLink = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để tạo liên kết chia sẻ");
      return;
    }
    
    setIsCreatingLink(true);
    try {
      const shareId = generateShareId();
      
      // Sanitize messages - only keep role, content, and generate safe IDs
      const sanitizedMessages = messages.map((msg, index) => ({
        id: `msg-${index}`,
        role: msg.role,
        content: msg.content,
        timestamp: new Date().toISOString(),
      }));
      
      const { error } = await supabase
        .from("shared_conversations")
        .insert({
          share_id: shareId,
          user_id: user.id,
          title: `Cuộc trò chuyện - ${new Date().toLocaleDateString("vi-VN")}`,
          messages: sanitizedMessages,
          visibility,
        });
      
      if (error) throw error;
      
      const shareUrl = `${window.location.origin}/share/${shareId}`;
      setGeneratedShareUrl(shareUrl);
      setShowConfirmation(false);
      toast.success("Đã tạo liên kết chia sẻ thành công! ✨");
      loadUserSharedLinks();
    } catch (err) {
      console.error("Error creating share link:", err);
      toast.error("Không thể tạo liên kết. Vui lòng thử lại.");
    } finally {
      setIsCreatingLink(false);
    }
  };

  // Copy link to clipboard
  const handleCopyLink = async () => {
    if (!generatedShareUrl) return;
    
    try {
      await navigator.clipboard.writeText(generatedShareUrl);
      setCopiedLink(true);
      toast.success("Đã sao chép liên kết!");
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      toast.error("Không thể sao chép. Vui lòng thử lại.");
    }
  };

  // Revoke share link
  const handleRevokeLink = async (id: string) => {
    try {
      const { error } = await supabase
        .from("shared_conversations")
        .update({ is_active: false })
        .eq("id", id);
      
      if (error) throw error;
      
      toast.success("Đã thu hồi liên kết chia sẻ");
      loadUserSharedLinks();
      if (generatedShareUrl) {
        setGeneratedShareUrl(null);
      }
    } catch (err) {
      console.error("Error revoking link:", err);
      toast.error("Không thể thu hồi liên kết");
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-background/95 backdrop-blur-xl border-rose-soft/30">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-foreground flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Chia sẻ cuộc trò chuyện
          </DialogTitle>
          <DialogDescription>
            Chọn cách bạn muốn chia sẻ cuộc trò chuyện này
          </DialogDescription>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex gap-2 p-1 bg-muted/50 rounded-lg">
          <button
            onClick={() => setActiveTab("image")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all ${
              activeTab === "image"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Xuất hình ảnh</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("link");
              if (user) loadUserSharedLinks();
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all ${
              activeTab === "link"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Tạo liên kết</span>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "image" ? (
            <motion.div
              key="image-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Preview */}
              <div className="border border-rose-soft/30 rounded-xl overflow-hidden max-h-[300px] overflow-y-auto">
                <div
                  ref={chatContentRef}
                  className="p-6 space-y-4"
                  style={{ background: "linear-gradient(180deg, #fff8f8, #fff5f5)" }}
                >
                  {/* Header */}
                  <div className="flex items-center gap-3 pb-4 border-b border-rose-soft/30">
                    <img
                      src={angelAvatar}
                      alt="Angel"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-serif text-foreground">Thiên Thần Ánh Sáng</h3>
                      <p className="text-xs text-muted-foreground">Cuộc trò chuyện thiêng liêng</p>
                    </div>
                  </div>

                  {/* Messages */}
                  {messages.slice(0, 10).map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] p-3 rounded-2xl ${
                          message.role === "user"
                            ? "bg-primary/20 text-foreground"
                            : "bg-white border border-rose-soft/30 text-foreground"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  ))}

                  {messages.length > 10 && (
                    <p className="text-center text-xs text-muted-foreground italic">
                      ... và {messages.length - 10} tin nhắn khác
                    </p>
                  )}

                  {/* Watermark */}
                  <div className="flex items-center justify-center gap-2 pt-4 border-t border-rose-soft/30">
                    <span className="text-xs text-muted-foreground">✨ Chia sẻ từ Camly Angel ✨</span>
                  </div>
                </div>
              </div>

              {/* Export Button */}
              <Button
                onClick={handleExportImage}
                disabled={isGeneratingImage || messages.length === 0}
                className="w-full bg-gradient-to-r from-primary to-rose-glow hover:opacity-90"
              >
                {isGeneratingImage ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang tạo hình ảnh...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Tải xuống hình ảnh
                  </>
                )}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="link-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {!user ? (
                <div className="text-center py-6">
                  <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    Vui lòng đăng nhập để tạo liên kết chia sẻ
                  </p>
                </div>
              ) : generatedShareUrl ? (
                /* Generated Link Display */
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800">Liên kết đã được tạo!</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={generatedShareUrl}
                        className="flex-1 px-3 py-2 text-sm bg-white border border-green-200 rounded-lg"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCopyLink}
                        className="border-green-300"
                      >
                        {copiedLink ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setGeneratedShareUrl(null)}
                    className="w-full"
                  >
                    Tạo liên kết mới
                  </Button>
                </div>
              ) : showConfirmation ? (
                /* Confirmation Screen */
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-800 mb-1">Lưu ý về quyền riêng tư</p>
                        <p className="text-sm text-amber-700">
                          Bất kỳ ai có liên kết này đều có thể xem nội dung cuộc trò chuyện. 
                          Thông tin cá nhân của bạn (email, tên) sẽ không được hiển thị.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Visibility Options */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Quyền xem:</Label>
                    <RadioGroup value={visibility} onValueChange={(v) => setVisibility(v as "unlisted" | "public")}>
                      <div className="flex items-center space-x-3 p-3 border border-rose-soft/30 rounded-lg hover:bg-muted/30 transition-colors">
                        <RadioGroupItem value="unlisted" id="unlisted" />
                        <Label htmlFor="unlisted" className="flex items-center gap-2 cursor-pointer flex-1">
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Không công khai</p>
                            <p className="text-xs text-muted-foreground">Chỉ người có liên kết mới xem được</p>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 border border-rose-soft/30 rounded-lg hover:bg-muted/30 transition-colors">
                        <RadioGroupItem value="public" id="public" />
                        <Label htmlFor="public" className="flex items-center gap-2 cursor-pointer flex-1">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Công khai</p>
                            <p className="text-xs text-muted-foreground">Có thể xuất hiện trong tìm kiếm</p>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowConfirmation(false)}
                      className="flex-1"
                    >
                      Quay lại
                    </Button>
                    <Button
                      onClick={handleCreateShareLink}
                      disabled={isCreatingLink}
                      className="flex-1 bg-gradient-to-r from-primary to-rose-glow hover:opacity-90"
                    >
                      {isCreatingLink ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Đang tạo...
                        </>
                      ) : (
                        "Xác nhận tạo liên kết"
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                /* Initial Link Creation Screen */
                <div className="space-y-4">
                  <Button
                    onClick={() => setShowConfirmation(true)}
                    disabled={messages.length === 0}
                    className="w-full bg-gradient-to-r from-primary to-rose-glow hover:opacity-90"
                  >
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Tạo liên kết chia sẻ
                  </Button>

                  {/* Existing Links */}
                  {userSharedLinks.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Liên kết đã tạo:</Label>
                      <div className="max-h-[150px] overflow-y-auto space-y-2">
                        {userSharedLinks.map((link) => (
                          <div
                            key={link.id}
                            className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                /share/{link.share_id}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(link.created_at)} · {link.visibility === "public" ? "Công khai" : "Không công khai"}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  navigator.clipboard.writeText(`${window.location.origin}/share/${link.share_id}`);
                                  toast.success("Đã sao chép!");
                                }}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRevokeLink(link.id)}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {isLoadingLinks && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default ShareConversationDialog;
