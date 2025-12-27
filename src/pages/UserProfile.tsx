import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Sparkles, Heart, BookOpen, Leaf, 
  Calendar, Award, Coins, MessageCircle, TrendingUp,
  Clock, Star, Sun
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface UserProfileData {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface UserStats {
  totalCoins: number;
  lifetimeCoins: number;
  totalMeditations: number;
  totalMeditationMinutes: number;
  totalReflections: number;
  totalBreathingSessions: number;
  totalSharedMoments: number;
  totalLikesReceived: number;
}

interface ActivityItem {
  id: string;
  type: "meditation" | "reflection" | "breathing" | "shared_moment";
  title: string;
  description: string;
  created_at: string;
  coins?: number;
}

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  const targetUserId = userId || currentUser?.id;

  useEffect(() => {
    if (targetUserId) {
      setIsOwnProfile(currentUser?.id === targetUserId);
      fetchProfileData();
    }
  }, [targetUserId, currentUser?.id]);

  const fetchProfileData = async () => {
    if (!targetUserId) return;
    
    setIsLoading(true);
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url, created_at")
        .eq("id", targetUserId)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch stats
      await fetchStats();
      
      // Fetch activities
      await fetchActivities();
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!targetUserId) return;

    try {
      // Coins
      const { data: coinsData } = await supabase
        .from("user_camly_coins")
        .select("total_coins, lifetime_coins")
        .eq("user_id", targetUserId)
        .maybeSingle();

      // Meditations
      const { data: meditationsData } = await supabase
        .from("meditation_history")
        .select("duration_seconds")
        .eq("user_id", targetUserId);

      // Reflections
      const { count: reflectionsCount } = await supabase
        .from("reflection_notes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", targetUserId);

      // Breathing sessions
      const { count: breathingCount } = await supabase
        .from("breathing_session_history")
        .select("*", { count: "exact", head: true })
        .eq("user_id", targetUserId);

      // Shared moments
      const { data: momentsData } = await supabase
        .from("shared_light_moments")
        .select("likes_count")
        .eq("user_id", targetUserId);

      const totalMeditationSeconds = meditationsData?.reduce((sum, m) => sum + m.duration_seconds, 0) || 0;
      const totalLikes = momentsData?.reduce((sum, m) => sum + (m.likes_count || 0), 0) || 0;

      setStats({
        totalCoins: coinsData?.total_coins || 0,
        lifetimeCoins: coinsData?.lifetime_coins || 0,
        totalMeditations: meditationsData?.length || 0,
        totalMeditationMinutes: Math.floor(totalMeditationSeconds / 60),
        totalReflections: reflectionsCount || 0,
        totalBreathingSessions: breathingCount || 0,
        totalSharedMoments: momentsData?.length || 0,
        totalLikesReceived: totalLikes,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchActivities = async () => {
    if (!targetUserId) return;

    try {
      const activities: ActivityItem[] = [];

      // Fetch recent meditations
      const { data: meditations } = await supabase
        .from("meditation_history")
        .select("id, duration_seconds, theme, completed_at")
        .eq("user_id", targetUserId)
        .order("completed_at", { ascending: false })
        .limit(5);

      meditations?.forEach(m => {
        activities.push({
          id: m.id,
          type: "meditation",
          title: "Hoàn thành thiền định",
          description: `${Math.floor(m.duration_seconds / 60)} phút${m.theme ? ` - ${m.theme}` : ""}`,
          created_at: m.completed_at,
        });
      });

      // Fetch recent reflections
      const { data: reflections } = await supabase
        .from("reflection_notes")
        .select("id, content, created_at, approved")
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: false })
        .limit(5);

      reflections?.forEach(r => {
        activities.push({
          id: r.id,
          type: "reflection",
          title: "Viết suy ngẫm biết ơn",
          description: r.content.slice(0, 80) + (r.content.length > 80 ? "..." : ""),
          created_at: r.created_at,
        });
      });

      // Fetch recent breathing sessions
      const { data: breathing } = await supabase
        .from("breathing_session_history")
        .select("id, pattern_name, duration_seconds, completed_at")
        .eq("user_id", targetUserId)
        .order("completed_at", { ascending: false })
        .limit(5);

      breathing?.forEach(b => {
        activities.push({
          id: b.id,
          type: "breathing",
          title: "Hoàn thành bài thở",
          description: `${b.pattern_name} - ${Math.floor(b.duration_seconds / 60)} phút`,
          created_at: b.completed_at,
        });
      });

      // Fetch shared moments
      const { data: moments } = await supabase
        .from("shared_light_moments")
        .select("id, spiritual_message, moment_type, created_at, likes_count")
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: false })
        .limit(5);

      moments?.forEach(m => {
        activities.push({
          id: m.id,
          type: "shared_moment",
          title: "Chia sẻ khoảnh khắc ánh sáng",
          description: m.spiritual_message.slice(0, 80) + (m.spiritual_message.length > 80 ? "..." : ""),
          created_at: m.created_at,
        });
      });

      // Sort by date
      activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setActivities(activities.slice(0, 20));
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "meditation":
        return <Leaf className="w-4 h-4 text-emerald-500" />;
      case "reflection":
        return <BookOpen className="w-4 h-4 text-rose-500" />;
      case "breathing":
        return <Sun className="w-4 h-4 text-sky-500" />;
      case "shared_moment":
        return <Sparkles className="w-4 h-4 text-gold" />;
    }
  };

  const getActivityColor = (type: ActivityItem["type"]) => {
    switch (type) {
      case "meditation":
        return "bg-emerald-500/10 border-emerald-500/30";
      case "reflection":
        return "bg-rose-500/10 border-rose-500/30";
      case "breathing":
        return "bg-sky-500/10 border-sky-500/30";
      case "shared_moment":
        return "bg-gold/10 border-gold/30";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-8 h-8 text-gold animate-spin mx-auto" />
          <p className="text-muted-foreground mt-2">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Không tìm thấy hồ sơ người dùng</p>
          <Link to="/" className="text-gold hover:underline mt-2 inline-block">
            Quay về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/community" className="p-2 rounded-full hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground/70" />
          </Link>
          <h1 className="text-lg font-semibold text-foreground">
            {isOwnProfile ? "Hồ sơ của tôi" : "Hồ sơ người dùng"}
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="relative inline-block mb-4">
            <Avatar className="w-24 h-24 ring-4 ring-gold/30 shadow-lg">
              <AvatarImage src={profile.avatar_url || ""} />
              <AvatarFallback className="bg-gradient-to-br from-gold/30 to-rose-500/30 text-2xl">
                {getInitials(profile.display_name)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2 p-2 rounded-full bg-gold/20 border border-gold/30">
              <Sparkles className="w-4 h-4 text-gold" />
            </div>
          </div>
          
          <h2 className="text-2xl font-serif font-semibold text-foreground mb-1">
            {profile.display_name || "Linh hồn ánh sáng"}
          </h2>
          
          <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>
              Tham gia {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true, locale: vi })}
            </span>
          </div>

          {isOwnProfile && (
            <Link to="/profile">
              <Button variant="outline" className="mt-4 border-gold/30 hover:bg-gold/10">
                Chỉnh sửa hồ sơ
              </Button>
            </Link>
          )}
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="bg-gradient-to-br from-gold/10 to-amber-500/10 border-gold/30">
            <CardContent className="p-4 text-center">
              <Coins className="w-6 h-6 text-gold mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">
                {stats?.totalCoins.toLocaleString() || 0}
              </p>
              <p className="text-xs text-muted-foreground">Camly Coins</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/30">
            <CardContent className="p-4 text-center">
              <Leaf className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">
                {stats?.totalMeditationMinutes || 0}
              </p>
              <p className="text-xs text-muted-foreground">Phút thiền định</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-rose-500/10 to-pink-500/10 border-rose-500/30">
            <CardContent className="p-4 text-center">
              <Heart className="w-6 h-6 text-rose-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">
                {stats?.totalLikesReceived || 0}
              </p>
              <p className="text-xs text-muted-foreground">Trái tim nhận được</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/30">
            <CardContent className="p-4 text-center">
              <Award className="w-6 h-6 text-violet-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">
                {(stats?.totalMeditations || 0) + (stats?.totalReflections || 0) + (stats?.totalBreathingSessions || 0)}
              </p>
              <p className="text-xs text-muted-foreground">Hoạt động hoàn thành</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Detailed Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="activity" className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-6">
              <TabsTrigger value="activity">
                <Clock className="w-4 h-4 mr-2" />
                Hoạt động gần đây
              </TabsTrigger>
              <TabsTrigger value="stats">
                <TrendingUp className="w-4 h-4 mr-2" />
                Thống kê chi tiết
              </TabsTrigger>
            </TabsList>

            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="w-5 h-5 text-gold" />
                    Hành trình ánh sáng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activities.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Chưa có hoạt động nào
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {activities.map((activity) => (
                        <motion.div
                          key={`${activity.type}-${activity.id}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-4 rounded-xl border ${getActivityColor(activity.type)}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-full bg-background/50">
                              {getActivityIcon(activity.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground">{activity.title}</p>
                              <p className="text-sm text-muted-foreground truncate">
                                {activity.description}
                              </p>
                              <p className="text-xs text-muted-foreground/70 mt-1">
                                {formatDistanceToNow(new Date(activity.created_at), {
                                  addSuffix: true,
                                  locale: vi,
                                })}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stats">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-emerald-500" />
                      Thiền định
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Số buổi thiền</span>
                      <span className="font-medium">{stats?.totalMeditations || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tổng thời gian</span>
                      <span className="font-medium">{stats?.totalMeditationMinutes || 0} phút</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-rose-500" />
                      Suy ngẫm biết ơn
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Số bài viết</span>
                      <span className="font-medium">{stats?.totalReflections || 0}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sun className="w-4 h-4 text-sky-500" />
                      Bài thở
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Số buổi thở</span>
                      <span className="font-medium">{stats?.totalBreathingSessions || 0}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-gold" />
                      Chia sẻ cộng đồng
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Khoảnh khắc chia sẻ</span>
                      <span className="font-medium">{stats?.totalSharedMoments || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Trái tim nhận được</span>
                      <span className="font-medium">{stats?.totalLikesReceived || 0}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Coins className="w-4 h-4 text-gold" />
                      Camly Coins
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Số dư hiện tại</span>
                      <Badge variant="outline" className="bg-gold/10 text-gold border-gold/30">
                        {stats?.totalCoins.toLocaleString() || 0} coins
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tổng coins kiếm được</span>
                      <span className="font-medium">{stats?.lifetimeCoins.toLocaleString() || 0} coins</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

export default UserProfile;
