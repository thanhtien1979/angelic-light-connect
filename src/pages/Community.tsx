import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Heart, Sparkles, BookOpen, MessageCircle, Leaf, Sun, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import FriendshipManager from "@/components/FriendshipManager";
import PrivateChat from "@/components/PrivateChat";
import VideoCallModal from "@/components/VideoCallModal";
import { Button } from "@/components/ui/button";
import { useVideoCall } from "@/hooks/useVideoCall";

interface SharedMoment {
  id: string;
  spiritual_message: string;
  moment_type: string;
  display_name: string | null;
  likes_count: number;
  created_at: string;
  user_id: string;
}

const getCategoryIcon = (type: string) => {
  switch (type) {
    case "meditation_completion":
      return Leaf;
    case "reflection_note":
      return BookOpen;
    case "angel_chat":
      return MessageCircle;
    default:
      return Sparkles;
  }
};

const getCategoryLabel = (type: string) => {
  switch (type) {
    case "meditation_completion":
      return "Thiền Định";
    case "reflection_note":
      return "Biết Ơn";
    case "angel_chat":
      return "Angel AI";
    default:
      return "Chữa Lành Nội Tâm";
  }
};

const getCategoryColor = (type: string) => {
  switch (type) {
    case "meditation_completion":
      return "bg-emerald-500/15 text-emerald-700 border-emerald-500/30";
    case "reflection_note":
      return "bg-rose-500/15 text-rose-700 border-rose-500/30";
    case "angel_chat":
      return "bg-sky-500/15 text-sky-700 border-sky-500/30";
    default:
      return "bg-gold/15 text-gold border-gold/30";
  }
};

const MomentCard = ({ moment, onLike, hasLiked }: { 
  moment: SharedMoment; 
  onLike: (id: string) => void;
  hasLiked: boolean;
}) => {
  const CategoryIcon = getCategoryIcon(moment.moment_type);
  const categoryLabel = getCategoryLabel(moment.moment_type);
  const categoryColor = getCategoryColor(moment.moment_type);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "long",
    });
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl bg-card/60 backdrop-blur-sm border border-border/50 hover:border-gold/30 transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${categoryColor}`}>
            <CategoryIcon className="w-3 h-3" />
            {categoryLabel}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">{formatDate(moment.created_at)}</span>
      </div>

      {/* Content */}
      <p className="text-foreground/90 leading-relaxed mb-4 font-serif text-[15px]">
        "{moment.spiritual_message}"
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border/30">
        <span className="text-xs text-muted-foreground">
          {moment.display_name || "Một linh hồn ẩn danh"}
        </span>
        
        <motion.button
          onClick={() => onLike(moment.id)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
            hasLiked
              ? "bg-rose-500/20 text-rose-600"
              : "bg-muted/50 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500"
          }`}
        >
          <Heart className={`w-4 h-4 ${hasLiked ? "fill-rose-500" : ""}`} />
          <span className="text-xs font-medium">{moment.likes_count}</span>
        </motion.button>
      </div>
    </motion.article>
  );
};

const Community = () => {
  const { user } = useAuth();
  const prefersReducedMotion = useReducedMotion();
  const [moments, setMoments] = useState<SharedMoment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [likedMoments, setLikedMoments] = useState<Set<string>>(new Set());
  const [isChatOpen, setIsChatOpen] = useState(false);

  const {
    callState,
    localStream,
    remoteStream,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleVideo,
    toggleAudio,
    toggleScreenShare,
  } = useVideoCall();

  const handleStartCall = (friendId: string, friendName: string, callType: 'video' | 'audio') => {
    initiateCall(friendId, friendName, callType);
  };

  useEffect(() => {
    const fetchMoments = async () => {
      try {
        const { data, error } = await supabase
          .from("shared_light_moments")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) throw error;
        setMoments(data || []);
      } catch (error) {
        console.error("Error fetching moments:", error);
        toast.error("Không thể tải khoảnh khắc ánh sáng");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMoments();

    // Load liked moments from localStorage
    const stored = localStorage.getItem("likedMoments");
    if (stored) {
      setLikedMoments(new Set(JSON.parse(stored)));
    }
  }, []);

  const handleLike = async (momentId: string) => {
    const newLiked = new Set(likedMoments);
    const isLiking = !newLiked.has(momentId);

    if (isLiking) {
      newLiked.add(momentId);
    } else {
      newLiked.delete(momentId);
    }

    setLikedMoments(newLiked);
    localStorage.setItem("likedMoments", JSON.stringify([...newLiked]));

    // Update UI optimistically
    setMoments(prev =>
      prev.map(m =>
        m.id === momentId
          ? { ...m, likes_count: m.likes_count + (isLiking ? 1 : -1) }
          : m
      )
    );

    // Update in database
    try {
      const moment = moments.find(m => m.id === momentId);
      if (moment) {
        await supabase
          .from("shared_light_moments")
          .update({ likes_count: moment.likes_count + (isLiking ? 1 : -1) })
          .eq("id", momentId);
      }
    } catch (error) {
      console.error("Error updating like:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 rounded-full hover:bg-muted transition-colors">
              <ArrowLeft className="w-5 h-5 text-foreground/70" />
            </Link>
            <div className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-gold" />
              <h1 className="text-lg font-semibold text-foreground">Khoảnh Khắc Ánh Sáng</h1>
            </div>
          </div>
          
          {user && (
            <Button
              onClick={() => setIsChatOpen(true)}
              className="bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat Bạn Bè
            </Button>
          )}
        </div>
      </header>

      <motion.main 
        initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="max-w-4xl mx-auto px-4 py-8"
      >
        {/* Friendship Manager Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <FriendshipManager />
        </motion.div>

        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-3">
            Tu học là giàu có – Thịnh vượng tự sinh
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Những khoảnh khắc ánh sáng được chia sẻ từ cộng đồng. Mỗi suy ngẫm là một ngọn nến thắp sáng cho nhau.
          </p>
        </motion.div>

        {/* Moments Grid */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-5 rounded-2xl bg-muted/30 animate-pulse h-36" />
            ))}
          </div>
        ) : moments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="p-4 rounded-full bg-gold/10 w-fit mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-gold" />
            </div>
            <h3 className="font-serif text-xl text-foreground mb-2">Chưa có khoảnh khắc nào</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Hãy là người đầu tiên chia sẻ ánh sáng của mình. Viết một suy ngẫm hoặc hoàn thành thiền định để bắt đầu.
            </p>
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 mt-6 px-6 py-2.5 rounded-full bg-gold/20 text-gold hover:bg-gold/30 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Viết Suy Ngẫm
            </Link>
          </motion.div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {moments.map((moment, index) => (
                <motion.div
                  key={moment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <MomentCard
                    moment={moment}
                    onLike={handleLike}
                    hasLiked={likedMoments.has(moment.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.main>

      {/* Private Chat */}
      <PrivateChat 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)}
        onStartCall={handleStartCall}
      />

      {/* Video Call Modal */}
      <VideoCallModal
        isOpen={callState.isActive}
        callState={callState}
        localStream={localStream}
        remoteStream={remoteStream}
        onAccept={acceptCall}
        onReject={rejectCall}
        onEnd={endCall}
        onToggleVideo={toggleVideo}
        onToggleAudio={toggleAudio}
        onToggleScreenShare={toggleScreenShare}
      />
    </div>
  );
};

export default Community;
