import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  PenLine, Heart, MessageCircle, Star, 
  TrendingUp, Award, Sparkles, Eye 
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface UserStats {
  testimonialsCount: number;
  totalLikesReceived: number;
  totalCommentsReceived: number;
  likesGiven: number;
  commentsGiven: number;
  featuredCount: number;
  reactionsReceived: number;
}

const TestimonialUserStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) {
        setStats(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Fetch user's testimonials
        const { data: testimonials } = await supabase
          .from("testimonials")
          .select("id, likes_count, comments_count, is_featured")
          .eq("user_id", user.id);

        const testimonialsCount = testimonials?.length || 0;
        const totalLikesReceived = testimonials?.reduce((sum, t) => sum + (t.likes_count || 0), 0) || 0;
        const totalCommentsReceived = testimonials?.reduce((sum, t) => sum + (t.comments_count || 0), 0) || 0;
        const featuredCount = testimonials?.filter(t => t.is_featured).length || 0;

        // Fetch likes given by user
        const { count: likesGiven } = await supabase
          .from("testimonial_likes")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        // Fetch comments given by user
        const { count: commentsGiven } = await supabase
          .from("testimonial_comments")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        // Fetch reactions received on user's testimonials
        let reactionsReceived = 0;
        if (testimonials && testimonials.length > 0) {
          const testimonialIds = testimonials.map(t => t.id);
          const { count } = await supabase
            .from("testimonial_reactions")
            .select("*", { count: "exact", head: true })
            .in("testimonial_id", testimonialIds);
          reactionsReceived = count || 0;
        }

        setStats({
          testimonialsCount,
          totalLikesReceived,
          totalCommentsReceived,
          likesGiven: likesGiven || 0,
          commentsGiven: commentsGiven || 0,
          featuredCount,
          reactionsReceived,
        });
      } catch (error) {
        console.error("Error fetching user stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (!user) return null;

  if (isLoading) {
    return (
      <Card className="bg-card/70 backdrop-blur-xl border-border/30">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const statItems = [
    {
      icon: PenLine,
      label: "Nhân chứng",
      value: stats.testimonialsCount,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Heart,
      label: "Lượt thích nhận",
      value: stats.totalLikesReceived,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      icon: MessageCircle,
      label: "Bình luận nhận",
      value: stats.totalCommentsReceived,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: Sparkles,
      label: "Reactions nhận",
      value: stats.reactionsReceived,
      color: "text-gold",
      bgColor: "bg-gold/10",
    },
    {
      icon: TrendingUp,
      label: "Thích đã gửi",
      value: stats.likesGiven,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      icon: Eye,
      label: "Bình luận đã gửi",
      value: stats.commentsGiven,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      icon: Award,
      label: "Nổi bật",
      value: stats.featuredCount,
      color: "text-gold",
      bgColor: "bg-gold/10",
    },
    {
      icon: Star,
      label: "Điểm tương tác",
      value: stats.totalLikesReceived * 2 + stats.totalCommentsReceived * 3 + stats.reactionsReceived,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  return (
    <Card className="bg-card/70 backdrop-blur-xl border-border/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-serif">
          <TrendingUp className="w-5 h-5 text-primary" />
          Thống kê của bạn
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative group"
            >
              <div className={`p-3 rounded-xl ${item.bgColor} border border-border/20 group-hover:border-primary/30 transition-colors`}>
                <div className="flex items-center gap-2 mb-1">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <span className="text-xs text-muted-foreground truncate">{item.label}</span>
                </div>
                <p className={`text-2xl font-bold ${item.color}`}>
                  {item.value.toLocaleString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TestimonialUserStats;
