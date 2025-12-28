import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Heart, Sparkles, BookOpen, MessageCircle, Leaf, Sun, Users,
  Search, Filter, TrendingUp, Eye, ChevronDown, RefreshCw, MessageSquare, Share2, PenLine, Bookmark
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import FriendshipManager from "@/components/FriendshipManager";
import PrivateChat from "@/components/PrivateChat";
import VideoCallModal from "@/components/VideoCallModal";
import ProfileViewModal from "@/components/ProfileViewModal";
import MomentComments from "@/components/MomentComments";
import MomentShareDialog from "@/components/MomentShareDialog";
import CreateMomentDialog from "@/components/CreateMomentDialog";
import FollowSuggestions from "@/components/FollowSuggestions";
import NotificationsDropdown from "@/components/NotificationsDropdown";
import { CommunityLeaderboard } from "@/components/CommunityLeaderboard";
import { useSavedMoments } from "@/hooks/useSavedMoments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useVideoCall } from "@/hooks/useVideoCall";

interface SharedMoment {
  id: string;
  spiritual_message: string;
  moment_type: string;
  display_name: string | null;
  likes_count: number;
  created_at: string;
  user_id: string;
  image_url?: string | null;
}

interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface CommunityStats {
  totalMembers: number;
  totalMoments: number;
  totalLikes: number;
}

type MomentCategory = "all" | "meditation_completion" | "reflection_note" | "chat_message" | "daily_login" | "saved";

const getCategoryIcon = (type: string) => {
  switch (type) {
    case "meditation_completion":
      return Leaf;
    case "reflection_note":
      return BookOpen;
    case "chat_message":
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
    case "chat_message":
      return "Angel AI";
    case "daily_login":
      return "Đăng Nhập";
    default:
      return "Chữa Lành";
  }
};

const getCategoryColor = (type: string) => {
  switch (type) {
    case "meditation_completion":
      return "bg-emerald-500/15 text-emerald-700 border-emerald-500/30";
    case "reflection_note":
      return "bg-rose-500/15 text-rose-700 border-rose-500/30";
    case "chat_message":
      return "bg-sky-500/15 text-sky-700 border-sky-500/30";
    case "daily_login":
      return "bg-amber-500/15 text-amber-700 border-amber-500/30";
    default:
      return "bg-gold/15 text-gold border-gold/30";
  }
};

const MomentCard = ({ 
  moment, 
  onLike, 
  hasLiked,
  profile,
  onViewProfile,
  onOpenComments,
  onShare,
  commentsCount = 0,
  onToggleSave,
  isSaved = false,
}: { 
  moment: SharedMoment; 
  onLike: (id: string) => void;
  hasLiked: boolean;
  profile?: Profile | null;
  onViewProfile: (userId: string) => void;
  onOpenComments: (momentId: string) => void;
  onShare: (moment: SharedMoment) => void;
  commentsCount?: number;
  onToggleSave: (id: string) => void;
  isSaved?: boolean;
}) => {
  const navigate = useNavigate();
  const CategoryIcon = getCategoryIcon(moment.moment_type);
  const categoryLabel = getCategoryLabel(moment.moment_type);
  const categoryColor = getCategoryColor(moment.moment_type);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    
    return date.toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "long",
    });
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleProfileClick = () => {
    navigate(`/user/${moment.user_id}`);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl bg-card/60 backdrop-blur-sm border border-border/50 hover:border-gold/30 transition-all duration-300 hover:shadow-lg hover:shadow-gold/5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleProfileClick}
            className="group relative"
          >
            <Avatar className="w-10 h-10 ring-2 ring-gold/30 group-hover:ring-gold/60 transition-all">
              <AvatarImage src={profile?.avatar_url || ""} />
              <AvatarFallback className="bg-gradient-to-br from-gold/30 to-rose-500/30 text-foreground text-sm">
                {getInitials(profile?.display_name || moment.display_name)}
              </AvatarFallback>
            </Avatar>
            <Eye className="absolute -bottom-1 -right-1 w-4 h-4 text-gold opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <div>
            <button
              onClick={handleProfileClick}
              className="text-sm font-medium text-foreground hover:text-gold transition-colors"
            >
              {profile?.display_name || moment.display_name || "Linh hồn ẩn danh"}
            </button>
            <p className="text-xs text-muted-foreground">{formatDate(moment.created_at)}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${categoryColor}`}>
          <CategoryIcon className="w-3 h-3" />
          {categoryLabel}
        </span>
      </div>

      {/* Image if exists */}
      {moment.image_url && (
        <div className="mb-4 rounded-xl overflow-hidden">
          <img
            src={moment.image_url}
            alt="Moment"
            className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      {/* Content */}
      <p className="text-foreground/90 leading-relaxed mb-4 font-serif text-[15px]">
        "{moment.spiritual_message}"
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border/30">
        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => onOpenComments(moment.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 text-muted-foreground hover:bg-gold/10 hover:text-gold transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="text-xs font-medium">{commentsCount}</span>
          </motion.button>
          
          <motion.button
            onClick={() => onShare(moment)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 text-muted-foreground hover:bg-sky-500/10 hover:text-sky-500 transition-all"
          >
            <Share2 className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            onClick={() => onToggleSave(moment.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
              isSaved
                ? "bg-amber-500/20 text-amber-600"
                : "bg-muted/50 text-muted-foreground hover:bg-amber-500/10 hover:text-amber-500"
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? "fill-amber-500" : ""}`} />
          </motion.button>
        </div>
        
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

const StatsCard = ({ stats, isLoading }: { stats: CommunityStats; isLoading: boolean }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="grid grid-cols-3 gap-4 p-4 rounded-2xl bg-gradient-to-r from-gold/10 via-rose-500/10 to-violet-500/10 border border-gold/20 mb-6"
  >
    <div className="text-center">
      <div className="flex items-center justify-center gap-1.5 mb-1">
        <Users className="w-4 h-4 text-gold" />
        <span className="text-lg font-bold text-foreground">
          {isLoading ? "..." : stats.totalMembers}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">Linh hồn tỉnh thức</p>
    </div>
    <div className="text-center border-x border-border/30">
      <div className="flex items-center justify-center gap-1.5 mb-1">
        <Sparkles className="w-4 h-4 text-rose-500" />
        <span className="text-lg font-bold text-foreground">
          {isLoading ? "..." : stats.totalMoments}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">Khoảnh khắc ánh sáng</p>
    </div>
    <div className="text-center">
      <div className="flex items-center justify-center gap-1.5 mb-1">
        <Heart className="w-4 h-4 text-pink-500" />
        <span className="text-lg font-bold text-foreground">
          {isLoading ? "..." : stats.totalLikes}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">Trái tim gửi tặng</p>
    </div>
  </motion.div>
);

const CategoryFilter = ({ 
  selected, 
  onChange,
  isLoggedIn = false,
}: { 
  selected: MomentCategory; 
  onChange: (cat: MomentCategory) => void;
  isLoggedIn?: boolean;
}) => {
  const categories: { value: MomentCategory; label: string; icon: typeof Sparkles; requiresAuth?: boolean }[] = [
    { value: "all", label: "Tất cả", icon: Sparkles },
    { value: "meditation_completion", label: "Thiền Định", icon: Leaf },
    { value: "reflection_note", label: "Biết Ơn", icon: BookOpen },
    { value: "chat_message", label: "Angel AI", icon: MessageCircle },
    { value: "saved", label: "Đã lưu", icon: Bookmark, requiresAuth: true },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {categories
        .filter((cat) => !cat.requiresAuth || isLoggedIn)
        .map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border transition-all ${
            selected === value
              ? value === "saved" 
                ? "bg-amber-500/20 border-amber-500/50 text-amber-600"
                : "bg-gold/20 border-gold/50 text-gold"
              : "bg-muted/30 border-border/50 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          }`}
        >
          <Icon className="w-3.5 h-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
};

const Community = () => {
  const { user } = useAuth();
  const prefersReducedMotion = useReducedMotion();
  const [moments, setMoments] = useState<SharedMoment[]>([]);
  const [profiles, setProfiles] = useState<Map<string, Profile>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [likedMoments, setLikedMoments] = useState<Set<string>>(new Set());
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<MomentCategory>("all");
  const [stats, setStats] = useState<CommunityStats>({ totalMembers: 0, totalMoments: 0, totalLikes: 0 });
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [selectedMomentForComments, setSelectedMomentForComments] = useState<string | null>(null);
  const [commentsCounts, setCommentsCounts] = useState<Map<string, number>>(new Map());
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [shareMoment, setShareMoment] = useState<SharedMoment | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toggleSave, isSaved, savedMoments, fetchSavedMomentsWithDetails } = useSavedMoments();
  const [savedMomentsProfiles, setSavedMomentsProfiles] = useState<Map<string, Profile>>(new Map());
  const ITEMS_PER_PAGE = 20;

  const handleViewProfile = async (userId: string) => {
    // Try to get from cache first
    const cachedProfile = profiles.get(userId);
    if (cachedProfile) {
      setSelectedProfile(cachedProfile);
      return;
    }
    
    // Fetch from database
    try {
      const { data } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .eq("id", userId)
        .single();
      
      if (data) {
        setSelectedProfile(data);
        setProfiles(prev => new Map(prev).set(data.id, data));
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

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

  const fetchStats = useCallback(async () => {
    try {
      // Get unique members
      const { data: membersData } = await supabase
        .from("shared_light_moments")
        .select("user_id");
      
      const uniqueMembers = new Set(membersData?.map(m => m.user_id) || []);
      
      // Get total moments count
      const { count: momentsCount } = await supabase
        .from("shared_light_moments")
        .select("*", { count: "exact", head: true });
      
      // Get total likes
      const { data: likesData } = await supabase
        .from("shared_light_moments")
        .select("likes_count");
      
      const totalLikes = likesData?.reduce((sum, m) => sum + (m.likes_count || 0), 0) || 0;
      
      setStats({
        totalMembers: uniqueMembers.size,
        totalMoments: momentsCount || 0,
        totalLikes,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  const fetchMoments = useCallback(async (pageNum: number, reset = false) => {
    try {
      if (reset) {
        setIsLoading(true);
        setPage(0);
        pageNum = 0;
      }

      let query = supabase
        .from("shared_light_moments")
        .select("*")
        .order("created_at", { ascending: false })
        .range(pageNum * ITEMS_PER_PAGE, (pageNum + 1) * ITEMS_PER_PAGE - 1);

      if (selectedCategory !== "all") {
        query = query.eq("moment_type", selectedCategory);
      }

      if (searchQuery.trim()) {
        query = query.ilike("spiritual_message", `%${searchQuery.trim()}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (reset) {
        setMoments(data || []);
      } else {
        setMoments(prev => [...prev, ...(data || [])]);
      }

      setHasMore((data?.length || 0) === ITEMS_PER_PAGE);

      // Fetch profiles for new moments
      const userIds = [...new Set(data?.map(m => m.user_id) || [])];
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, display_name, avatar_url")
          .in("id", userIds);

        if (profilesData) {
          setProfiles(prev => {
            const newMap = new Map(prev);
            profilesData.forEach(p => newMap.set(p.id, p));
            return newMap;
          });
        }
      }
    } catch (error) {
      console.error("Error fetching moments:", error);
      toast.error("Không thể tải khoảnh khắc ánh sáng");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedCategory, searchQuery]);

  // Initial load
  useEffect(() => {
    fetchMoments(0, true);
    fetchStats();

    // Load liked moments from localStorage
    const stored = localStorage.getItem("likedMoments");
    if (stored) {
      setLikedMoments(new Set(JSON.parse(stored)));
    }
  }, []);

  // Re-fetch when category changes
  useEffect(() => {
    if (selectedCategory === "saved") {
      // Fetch saved moments with full details
      fetchSavedMomentsWithDetails().then(async (moments) => {
        if (moments.length > 0) {
          const userIds = [...new Set(moments.map((m) => m.user_id))];
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("id, display_name, avatar_url")
            .in("id", userIds);
          
          if (profilesData) {
            const map = new Map<string, Profile>();
            profilesData.forEach((p) => map.set(p.id, p));
            setSavedMomentsProfiles(map);
          }
        }
      });
    } else {
      fetchMoments(0, true);
    }
  }, [selectedCategory]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("community-moments")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "shared_light_moments",
        },
        (payload) => {
          const newMoment = payload.new as SharedMoment;
          
          // Only add if matches current filter
          if (selectedCategory === "all" || newMoment.moment_type === selectedCategory) {
            setMoments(prev => [newMoment, ...prev]);
            setStats(prev => ({
              ...prev,
              totalMoments: prev.totalMoments + 1,
            }));
            
            // Fetch profile for new moment
            supabase
              .from("profiles")
              .select("id, display_name, avatar_url")
              .eq("id", newMoment.user_id)
              .single()
              .then(({ data }) => {
                if (data) {
                  setProfiles(prev => new Map(prev).set(data.id, data));
                }
              });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedCategory]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchMoments(0, true);
    fetchStats();
  };

  const handleSearch = () => {
    fetchMoments(0, true);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMoments(nextPage);
  };

  const handleLike = async (momentId: string) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để yêu thích");
      return;
    }

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

    setStats(prev => ({
      ...prev,
      totalLikes: prev.totalLikes + (isLiking ? 1 : -1),
    }));

    // Update in database using moment_likes table (triggers handle likes_count)
    try {
      if (isLiking) {
        await supabase.from("moment_likes").insert({
          user_id: user.id,
          moment_id: momentId,
        });
      } else {
        await supabase
          .from("moment_likes")
          .delete()
          .eq("user_id", user.id)
          .eq("moment_id", momentId);
      }
    } catch (error) {
      console.error("Error updating like:", error);
    }
  };

  // Get the moments to display based on selected category
  const displayMoments = selectedCategory === "saved" ? savedMoments : moments;
  const displayProfiles = selectedCategory === "saved" ? savedMomentsProfiles : profiles;

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
              <h1 className="text-lg font-semibold text-foreground">Những Linh Hồn Đã Tỉnh Thức</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
            {user && (
              <>
                <NotificationsDropdown />
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-gradient-to-r from-gold/80 to-amber-500/80 hover:from-gold hover:to-amber-500 text-white"
                >
                  <PenLine className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Tạo bài viết</span>
                </Button>
                <Button
                  onClick={() => setIsChatOpen(true)}
                  variant="outline"
                  className="border-gold/30 hover:bg-gold/10"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Chat</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <motion.main 
        initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="max-w-4xl mx-auto px-4 py-8"
      >
        {/* Community Stats */}
        <StatsCard stats={stats} isLoading={isLoading} />

        {/* Community Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <CommunityLeaderboard />
        </motion.div>

        {/* Follow Suggestions & Friendship Manager */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FollowSuggestions />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FriendshipManager />
          </motion.div>
        </div>

        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-3">
            Tu học là giàu có – Thịnh vượng tự sinh
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Những khoảnh khắc ánh sáng được chia sẻ từ cộng đồng. Mỗi suy ngẫm là một ngọn nến thắp sáng cho nhau.
          </p>
        </motion.div>

        {/* Search & Filter */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm trong các khoảnh khắc..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10 border-gold/20 focus:border-gold/50"
              />
            </div>
            <Button
              onClick={handleSearch}
              variant="outline"
              className="border-gold/30 hover:bg-gold/10 hover:border-gold/50"
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>
          
          <CategoryFilter 
            selected={selectedCategory} 
            onChange={setSelectedCategory}
            isLoggedIn={!!user}
          />
        </div>

        {/* Moments Grid */}
        {isLoading && moments.length === 0 ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-5 rounded-2xl bg-muted/30 animate-pulse h-40" />
            ))}
          </div>
        ) : displayMoments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="p-4 rounded-full bg-gold/10 w-fit mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-gold" />
            </div>
            <h3 className="font-serif text-xl text-foreground mb-2">
              {selectedCategory === "saved"
                ? "Chưa có khoảnh khắc nào được lưu"
                : searchQuery || selectedCategory !== "all" 
                  ? "Không tìm thấy khoảnh khắc nào"
                  : "Chưa có khoảnh khắc nào"}
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {selectedCategory === "saved"
                ? "Hãy lưu lại những khoảnh khắc yêu thích để xem lại sau."
                : searchQuery || selectedCategory !== "all"
                  ? "Thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác."
                  : "Hãy là người đầu tiên chia sẻ ánh sáng của mình. Viết một suy ngẫm hoặc hoàn thành thiền định để bắt đầu."}
            </p>
            {!searchQuery && selectedCategory === "all" && (
              <Link
                to="/profile"
                className="inline-flex items-center gap-2 mt-6 px-6 py-2.5 rounded-full bg-gold/20 text-gold hover:bg-gold/30 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                Viết Suy Ngẫm
              </Link>
            )}
          </motion.div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {displayMoments.map((moment, index) => (
                  <motion.div
                    key={moment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.05, 0.3) }}
                  >
                    <MomentCard
                      moment={moment}
                      onLike={handleLike}
                      hasLiked={likedMoments.has(moment.id)}
                      profile={displayProfiles.get(moment.user_id)}
                      onViewProfile={(userId) => handleViewProfile(userId)}
                      onOpenComments={(momentId) => setSelectedMomentForComments(momentId)}
                      onShare={(m) => setShareMoment(m)}
                      commentsCount={commentsCounts.get(moment.id) || 0}
                      onToggleSave={toggleSave}
                      isSaved={isSaved(moment.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Load More - only show for non-saved category */}
            {hasMore && selectedCategory !== "saved" && (
              <div className="text-center mt-8">
                <Button
                  onClick={handleLoadMore}
                  variant="outline"
                  className="border-gold/30 hover:bg-gold/10"
                >
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Tải thêm khoảnh khắc
                </Button>
              </div>
            )}
          </>
        )}
      </motion.main>

      {/* Moment Share Dialog */}
      <MomentShareDialog
        moment={shareMoment}
        isOpen={!!shareMoment}
        onClose={() => setShareMoment(null)}
      />

      {/* Moment Comments */}
      <MomentComments
        momentId={selectedMomentForComments || ""}
        isOpen={!!selectedMomentForComments}
        onClose={() => setSelectedMomentForComments(null)}
      />

      {/* Profile View Modal */}
      <ProfileViewModal
        profile={selectedProfile}
        isOpen={!!selectedProfile}
        onClose={() => setSelectedProfile(null)}
      />

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

      {/* Create Moment Dialog */}
      <CreateMomentDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={() => {
          fetchMoments(0, true);
          fetchStats();
        }}
      />
    </div>
  );
};

export default Community;
