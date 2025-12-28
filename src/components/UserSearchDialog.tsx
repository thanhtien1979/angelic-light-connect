import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Users, UserPlus, Loader2, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useFollow } from "@/hooks/useFollow";
import { useFriendships } from "@/hooks/useFriendships";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface UserResult {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface UserSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onStartChat?: (userId: string) => void;
}

const UserResultItem = ({ 
  user, 
  currentUserId,
  onViewProfile,
  onStartChat,
  isFriend,
}: { 
  user: UserResult; 
  currentUserId: string | undefined;
  onViewProfile: (userId: string) => void;
  onStartChat?: (userId: string) => void;
  isFriend: boolean;
}) => {
  const { isFollowing, isLoading, toggleFollow } = useFollow(user.id);
  const isOwnProfile = currentUserId === user.id;

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors"
    >
      <button
        onClick={() => onViewProfile(user.id)}
        className="flex items-center gap-3 flex-1 text-left"
      >
        <Avatar className="w-10 h-10 ring-2 ring-gold/20">
          <AvatarImage src={user.avatar_url || ""} />
          <AvatarFallback className="bg-gradient-to-br from-gold/20 to-rose-500/20 text-sm">
            {getInitials(user.display_name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-foreground">
            {user.display_name || "Linh hồn ẩn danh"}
          </p>
        </div>
      </button>
      
      {!isOwnProfile && currentUserId && (
        <div className="flex items-center gap-2">
          {isFriend && onStartChat && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onStartChat(user.id);
              }}
              className="border-gold/30 hover:bg-gold/10"
            >
              <MessageCircle className="w-3 h-3 mr-1" />
              Nhắn tin
            </Button>
          )}
          <Button
            size="sm"
            variant={isFollowing ? "outline" : "default"}
            onClick={(e) => {
              e.stopPropagation();
              toggleFollow();
            }}
            disabled={isLoading}
            className={isFollowing 
              ? "border-gold/30 hover:bg-gold/10" 
              : "bg-gradient-to-r from-gold to-amber-500 text-white hover:from-amber-500 hover:to-gold"
            }
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : isFollowing ? (
              "Đang theo dõi"
            ) : (
              <>
                <UserPlus className="w-3 h-3 mr-1" />
                Theo dõi
              </>
            )}
          </Button>
        </div>
      )}
    </motion.div>
  );
};

const UserSearchDialog = ({ isOpen, onClose, onStartChat }: UserSearchDialogProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { friends } = useFriendships();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const isFriend = (userId: string) => {
    return friends.some(f => 
      (f.requester_id === userId || f.addressee_id === userId) && 
      f.status === "accepted"
    );
  };

  const searchUsers = useCallback(async (query: string) => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .ilike("display_name", `%${query.trim()}%`)
        .limit(20);

      if (error) throw error;

      setResults(data || []);
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error("Không thể tìm kiếm người dùng");
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchUsers]);

  const handleViewProfile = (userId: string) => {
    onClose();
    navigate(`/user/${userId}`);
  };

  const handleClose = () => {
    setSearchQuery("");
    setResults([]);
    setHasSearched(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gold" />
            Tìm kiếm người dùng
          </DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Nhập tên người dùng..."
            className="pl-10 pr-10 border-gold/20 focus:border-gold/50"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto min-h-[200px] max-h-[400px]">
          {isSearching ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-gold animate-spin" />
            </div>
          ) : hasSearched && results.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Không tìm thấy người dùng nào</p>
              <p className="text-sm text-muted-foreground/70">Thử tìm với tên khác</p>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-1 py-2">
              <AnimatePresence>
                {results.map((u) => (
                  <UserResultItem
                    key={u.id}
                    user={u}
                    currentUserId={user?.id}
                    onViewProfile={handleViewProfile}
                    onStartChat={onStartChat}
                    isFriend={isFriend(u.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Tìm kiếm bạn bè</p>
              <p className="text-sm text-muted-foreground/70">Nhập ít nhất 2 ký tự để bắt đầu</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserSearchDialog;
