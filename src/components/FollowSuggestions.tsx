import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserPlus, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useFollow } from "@/hooks/useFollow";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SkeletonList } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

interface SuggestedUser {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  moments_count: number;
  mutual_friends: number;
}

export const FollowSuggestions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState<SuggestedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      fetchSuggestions();
    }
  }, [user]);

  const fetchSuggestions = async () => {
    if (!user) return;

    try {
      // Get users the current user is already following
      const { data: followingData } = await supabase
        .from("user_follows")
        .select("following_id")
        .eq("follower_id", user.id);

      const followingSet = new Set(followingData?.map((f) => f.following_id) || []);
      setFollowingIds(followingSet);

      // Get users who have shared moments (active users)
      const { data: momentUsers } = await supabase
        .from("shared_light_moments")
        .select("user_id")
        .neq("user_id", user.id);

      // Count moments per user
      const userMomentCounts: Record<string, number> = {};
      momentUsers?.forEach((m) => {
        userMomentCounts[m.user_id] = (userMomentCounts[m.user_id] || 0) + 1;
      });

      // Get unique user IDs not already followed
      const potentialUserIds = Object.keys(userMomentCounts).filter(
        (id) => !followingSet.has(id)
      );

      if (potentialUserIds.length === 0) {
        setSuggestions([]);
        setIsLoading(false);
        return;
      }

      // Get friends of friends (mutual connections)
      const { data: friendsFollowing } = await supabase
        .from("user_follows")
        .select("following_id, follower_id")
        .in("follower_id", Array.from(followingSet));

      const mutualCounts: Record<string, number> = {};
      friendsFollowing?.forEach((f) => {
        if (potentialUserIds.includes(f.following_id)) {
          mutualCounts[f.following_id] = (mutualCounts[f.following_id] || 0) + 1;
        }
      });

      // Get profiles for potential users
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in("id", potentialUserIds.slice(0, 10));

      // Build suggestions with scoring
      const suggestedUsers: SuggestedUser[] = (profiles || [])
        .map((profile) => ({
          id: profile.id,
          display_name: profile.display_name,
          avatar_url: profile.avatar_url,
          moments_count: userMomentCounts[profile.id] || 0,
          mutual_friends: mutualCounts[profile.id] || 0,
        }))
        .sort((a, b) => {
          // Score based on mutual friends and activity
          const scoreA = a.mutual_friends * 3 + a.moments_count;
          const scoreB = b.mutual_friends * 3 + b.moments_count;
          return scoreB - scoreA;
        })
        .slice(0, 5);

      setSuggestions(suggestedUsers);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = async (userId: string) => {
    if (!user) return;

    try {
      await supabase.from("user_follows").insert({
        follower_id: user.id,
        following_id: userId,
      });

      setFollowingIds((prev) => new Set(prev).add(userId));
      setSuggestions((prev) => prev.filter((s) => s.id !== userId));
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user || isLoading) {
    return (
      <div className="p-4 rounded-2xl bg-card/60 border border-border/50">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-gold/20">
            <Sparkles className="w-4 h-4 text-gold" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">Gợi ý theo dõi</h3>
            <p className="text-xs text-muted-foreground">
              Những linh hồn bạn có thể biết
            </p>
          </div>
        </div>
        <SkeletonList count={3} compact />
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-2xl bg-card/60 border border-border/50"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-gold/20">
          <Sparkles className="w-4 h-4 text-gold" />
        </div>
        <div>
          <h3 className="font-medium text-foreground">Gợi ý theo dõi</h3>
          <p className="text-xs text-muted-foreground">
            Những linh hồn bạn có thể biết
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {suggestions.map((suggestion) => (
          <motion.div
            key={suggestion.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <button
              onClick={() => navigate(`/user/${suggestion.id}`)}
              className="flex items-center gap-3 flex-1 min-w-0"
            >
              <Avatar className="w-10 h-10 ring-2 ring-gold/20">
                <AvatarImage src={suggestion.avatar_url || ""} />
                <AvatarFallback className="bg-gradient-to-br from-gold/30 to-rose-500/30 text-foreground text-sm">
                  {getInitials(suggestion.display_name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 text-left">
                <p className="font-medium text-sm text-foreground truncate">
                  {suggestion.display_name || "Linh hồn ẩn danh"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {suggestion.moments_count} khoảnh khắc
                  {suggestion.mutual_friends > 0 &&
                    ` • ${suggestion.mutual_friends} bạn chung`}
                </p>
              </div>
            </button>

            <Button
              size="sm"
              onClick={() => handleFollow(suggestion.id)}
              className="bg-gold/20 hover:bg-gold/30 text-gold border-0"
            >
              <UserPlus className="w-4 h-4" />
            </Button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default FollowSuggestions;
