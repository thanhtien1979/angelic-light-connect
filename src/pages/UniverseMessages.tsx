import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Heart, Sparkles, MessageCircle, Sun, Users, Send,
  Search, RefreshCw, Share2, Image, Video, X, Loader2, Play,
  MoreHorizontal, Trash2, Edit2, BookOpen, Star, Check
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import NavigationHeader from "@/components/NavigationHeader";
import { compressImage } from "@/lib/imageCompression";
import MomentImageGallery from "@/components/MomentImageGallery";
import UniverseMessageReactions from "@/components/UniverseMessageReactions";
import UniverseMessageShareDialog from "@/components/UniverseMessageShareDialog";
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
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface UniverseMessage {
  id: string;
  content: string;
  image_urls: string[] | null;
  video_url: string | null;
  user_id: string;
  likes_count: number;
  created_at: string;
}

interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

const MAX_IMAGES = 5;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

const UniverseMessages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<UniverseMessage[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Create post state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [postImages, setPostImages] = useState<{ file: File; preview: string }[]>([]);
  const [postVideo, setPostVideo] = useState<{ file: File; preview: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Edit state
  const [editingMessage, setEditingMessage] = useState<UniverseMessage | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  
  // Share state
  const [shareMessage, setShareMessage] = useState<UniverseMessage | null>(null);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("universe_messages" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      setMessages((data as unknown as UniverseMessage[]) || []);
      
      // Fetch profiles
      if (data && data.length > 0) {
        const userIds = [...new Set((data as any[]).map(m => m.user_id))];
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, display_name, avatar_url")
          .in("id", userIds);
        
        if (profilesData) {
          const profileMap: Record<string, Profile> = {};
          profilesData.forEach(p => {
            profileMap[p.id] = p;
          });
          setProfiles(profileMap);
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Không thể tải thông điệp");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("universe-messages-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "universe_messages",
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMessages]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchMessages();
  };

  // Handle image selection
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: { file: File; preview: string }[] = [];
    for (let i = 0; i < files.length && postImages.length + newImages.length < MAX_IMAGES; i++) {
      const file = files[i];
      if (file.type.startsWith("image/")) {
        try {
          const compressed = await compressImage(file, {
            maxWidth: 1920,
            maxHeight: 1080,
            quality: 0.85,
          });
          newImages.push({
            file: compressed,
            preview: URL.createObjectURL(compressed),
          });
        } catch {
          newImages.push({
            file,
            preview: URL.createObjectURL(file),
          });
        }
      }
    }
    
    setPostImages(prev => [...prev, ...newImages]);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  // Handle video selection
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Vui lòng chọn file video");
      return;
    }

    if (file.size > MAX_VIDEO_SIZE) {
      toast.error("Video không được vượt quá 50MB");
      return;
    }

    setPostVideo({
      file,
      preview: URL.createObjectURL(file),
    });
    setPostImages([]); // Clear images when video is selected
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setPostImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const removeVideo = () => {
    if (postVideo) {
      URL.revokeObjectURL(postVideo.preview);
      setPostVideo(null);
    }
  };

  // Upload file to storage
  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${user?.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from("universe-messages")
      .upload(fileName, file);
    
    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("universe-messages")
      .getPublicUrl(data.path);
    
    return urlData.publicUrl;
  };

  // Submit post
  const handleSubmit = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để đăng bài");
      return;
    }

    if (!postContent.trim() && postImages.length === 0 && !postVideo) {
      toast.error("Vui lòng nhập nội dung hoặc thêm hình ảnh/video");
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      let imageUrls: string[] = [];
      let videoUrl: string | null = null;

      // Upload images
      if (postImages.length > 0) {
        const totalFiles = postImages.length;
        for (let i = 0; i < postImages.length; i++) {
          const url = await uploadFile(postImages[i].file, "images");
          if (url) imageUrls.push(url);
          setUploadProgress(((i + 1) / totalFiles) * 80);
        }
      }

      // Upload video
      if (postVideo) {
        videoUrl = await uploadFile(postVideo.file, "videos");
        setUploadProgress(80);
      }

      // Create message
      const { error } = await supabase.from("universe_messages" as any).insert({
        user_id: user.id,
        content: postContent.trim(),
        image_urls: imageUrls.length > 0 ? imageUrls : null,
        video_url: videoUrl,
      });

      if (error) throw error;

      setUploadProgress(100);
      toast.success("Đã đăng thông điệp thành công! ✨");
      
      // Reset form
      setPostContent("");
      setPostImages([]);
      setPostVideo(null);
      setIsCreateOpen(false);
      fetchMessages();
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Không thể đăng thông điệp");
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  // Like message
  const handleLike = async (messageId: string) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để thích bài viết");
      return;
    }

    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from("universe_message_likes" as any)
        .select("id")
        .eq("message_id", messageId)
        .eq("user_id", user.id)
        .single();

      if (existingLike) {
        // Unlike
        await supabase
          .from("universe_message_likes" as any)
          .delete()
          .eq("id", (existingLike as any).id);
        
        const currentMsg = messages.find(m => m.id === messageId);
        if (currentMsg) {
          await supabase
            .from("universe_messages" as any)
            .update({ likes_count: currentMsg.likes_count - 1 })
            .eq("id", messageId);
        }
      } else {
        // Like
        await supabase.from("universe_message_likes" as any).insert({
          message_id: messageId,
          user_id: user.id,
        });
        
        const currentMsg = messages.find(m => m.id === messageId);
        if (currentMsg) {
          await supabase
            .from("universe_messages" as any)
            .update({ likes_count: currentMsg.likes_count + 1 })
            .eq("id", messageId);
        }
      }

      fetchMessages();
    } catch (error) {
      console.error("Like error:", error);
    }
  };

  // Delete message
  const handleDelete = async (messageId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("universe_messages" as any)
        .delete()
        .eq("id", messageId)
        .eq("user_id", user.id);

      if (error) throw error;
      toast.success("Đã xóa thông điệp");
      fetchMessages();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Không thể xóa thông điệp");
    }
  };

  // Edit message
  const handleStartEdit = (message: UniverseMessage) => {
    setEditingMessage(message);
    setEditContent(message.content);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!user || !editingMessage) return;
    if (!editContent.trim()) {
      toast.error("Nội dung không được để trống");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("universe_messages" as any)
        .update({ content: editContent.trim(), updated_at: new Date().toISOString() })
        .eq("id", editingMessage.id)
        .eq("user_id", user.id);

      if (error) throw error;
      toast.success("Đã cập nhật thông điệp! ✨");
      setIsEditing(false);
      setEditingMessage(null);
      setEditContent("");
      fetchMessages();
    } catch (error) {
      console.error("Edit error:", error);
      toast.error("Không thể cập nhật thông điệp");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingMessage(null);
    setEditContent("");
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  const filteredMessages = messages.filter(msg => 
    msg.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/95">
      <NavigationHeader />
      
      <main className="container max-w-4xl mx-auto px-4 pt-20 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gold via-amber-500 to-gold bg-clip-text text-transparent">
                ✨ Thông Điệp Của Cha Vũ Trụ
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Nơi chia sẻ những thông điệp ánh sáng từ Nguồn
              </p>
            </div>
          </div>

          {/* Search and actions */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm thông điệp..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="bg-gradient-to-r from-gold to-amber-500 text-white hover:from-gold/90 hover:to-amber-500/90"
            >
              <Send className="w-4 h-4 mr-2" />
              Đăng Thông Điệp
            </Button>
          </div>
        </motion.div>

        {/* Messages List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gold" />
          </div>
        ) : filteredMessages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Sun className="w-16 h-16 mx-auto text-gold/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">Chưa có thông điệp nào</h3>
            <p className="text-muted-foreground mb-4">Hãy là người đầu tiên chia sẻ thông điệp ánh sáng!</p>
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="bg-gradient-to-r from-gold to-amber-500 text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              Đăng Thông Điệp
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {filteredMessages.map((msg, index) => {
                const profile = profiles[msg.user_id];
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card/80 backdrop-blur-sm rounded-2xl p-5 border border-gold/10 shadow-lg"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border-2 border-gold/30">
                          <AvatarImage src={profile?.avatar_url || ""} />
                          <AvatarFallback className="bg-gold/20 text-gold">
                            {getInitials(profile?.display_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="font-medium text-foreground">
                            {profile?.display_name || "Người dùng"}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(msg.created_at), {
                              addSuffix: true,
                              locale: vi,
                            })}
                          </p>
                        </div>
                      </div>
                      
                      {user?.id === msg.user_id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleStartEdit(msg)}
                            >
                              <Edit2 className="w-4 h-4 mr-2" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(msg.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>

                    {/* Content */}
                    {msg.content && (
                      <p className="text-foreground whitespace-pre-wrap mb-4 text-justify leading-relaxed">
                        {msg.content}
                      </p>
                    )}

                    {/* Images */}
                    {msg.image_urls && msg.image_urls.length > 0 && (
                      <div className="mb-4">
                        <MomentImageGallery images={msg.image_urls} />
                      </div>
                    )}

                    {/* Video */}
                    {msg.video_url && (
                      <div className="mb-4 rounded-xl overflow-hidden bg-black">
                        <video
                          src={msg.video_url}
                          controls
                          controlsList="nodownload"
                          playsInline
                          preload="auto"
                          className="w-full max-h-[500px] object-contain"
                          onError={(e) => {
                            console.error("Video load error:", e);
                          }}
                        >
                          <source src={msg.video_url} type="video/mp4" />
                          Trình duyệt của bạn không hỗ trợ video.
                        </video>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-border/50">
                      <UniverseMessageReactions
                        messageId={msg.id}
                        likesCount={msg.likes_count}
                        onReactionChange={fetchMessages}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShareMessage(msg)}
                        className="text-muted-foreground hover:text-blue-500"
                      >
                        <Share2 className="w-4 h-4 mr-1" />
                        Chia sẻ
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Create Post Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gold" />
              Đăng Thông Điệp Mới
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Textarea
              placeholder="Chia sẻ thông điệp ánh sáng của bạn..."
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="min-h-[120px] resize-none"
              maxLength={2000}
            />
            <div className="flex justify-end text-xs text-muted-foreground">
              {postContent.length}/2000
            </div>

            {/* Image previews */}
            {postImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {postImages.map((img, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                    <img
                      src={img.preview}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Video preview */}
            {postVideo && (
              <div className="relative rounded-lg overflow-hidden">
                <video
                  src={postVideo.preview}
                  className="w-full max-h-[200px] object-contain bg-black/5"
                  controls
                />
                <button
                  onClick={removeVideo}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Upload progress */}
            {isSubmitting && uploadProgress > 0 && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-center text-muted-foreground">
                  Đang tải lên... {Math.round(uploadProgress)}%
                </p>
              </div>
            )}

            {/* Media buttons */}
            <div className="flex items-center gap-2">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoSelect}
                className="hidden"
              />
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => imageInputRef.current?.click()}
                disabled={postImages.length >= MAX_IMAGES || !!postVideo || isSubmitting}
              >
                <Image className="w-4 h-4 mr-2" />
                Ảnh ({postImages.length}/{MAX_IMAGES})
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => videoInputRef.current?.click()}
                disabled={!!postVideo || postImages.length > 0 || isSubmitting}
              >
                <Video className="w-4 h-4 mr-2" />
                Video
              </Button>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || (!postContent.trim() && postImages.length === 0 && !postVideo)}
              className="w-full bg-gradient-to-r from-gold to-amber-500 text-white hover:from-gold/90 hover:to-amber-500/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang đăng...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Đăng Thông Điệp
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Message Dialog */}
      <Dialog open={isEditing} onOpenChange={(open) => !open && handleCancelEdit()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-gold" />
              Chỉnh sửa Thông Điệp
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Textarea
              placeholder="Chỉnh sửa thông điệp của bạn..."
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[150px] resize-none"
              maxLength={2000}
            />
            <div className="flex justify-end text-xs text-muted-foreground">
              {editContent.length}/2000
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={isSubmitting || !editContent.trim()}
                className="bg-gradient-to-r from-gold to-amber-500 text-white hover:from-gold/90 hover:to-amber-500/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Lưu thay đổi
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      {shareMessage && (
        <UniverseMessageShareDialog
          isOpen={!!shareMessage}
          onClose={() => setShareMessage(null)}
          message={shareMessage}
          profile={profiles[shareMessage.user_id] || null}
        />
      )}
    </div>
  );
};

export default UniverseMessages;
