import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  AlertTriangle, 
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Heart,
  Flag,
  ArrowRight,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAdminRole } from "@/hooks/useAdminRole";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format, subDays, startOfDay } from "date-fns";
import { vi } from "date-fns/locale";

interface DashboardStats {
  totalUsers: number;
  newUsersToday: number;
  totalTestimonials: number;
  pendingTestimonials: number;
  approvedTestimonials: number;
  totalComments: number;
  pendingReports: number;
  resolvedReports: number;
  totalLikes: number;
  totalReactions: number;
}

interface RecentReport {
  id: string;
  reason: string;
  status: string;
  created_at: string;
  reporter_name: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isAdmin, isLoading: isCheckingRole } = useAdminRole();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    newUsersToday: 0,
    totalTestimonials: 0,
    pendingTestimonials: 0,
    approvedTestimonials: 0,
    totalComments: 0,
    pendingReports: 0,
    resolvedReports: 0,
    totalLikes: 0,
    totalReactions: 0,
  });
  const [recentReports, setRecentReports] = useState<RecentReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isCheckingRole && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, isCheckingRole, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardStats();
      fetchRecentReports();
    }
  }, [isAdmin]);

  const fetchDashboardStats = async () => {
    try {
      const todayStart = startOfDay(new Date()).toISOString();
      
      // Fetch all stats in parallel
      const [
        usersResult,
        newUsersResult,
        testimonialsResult,
        pendingTestimonialsResult,
        approvedTestimonialsResult,
        commentsResult,
        pendingReportsResult,
        resolvedReportsResult,
        likesResult,
        reactionsResult,
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", todayStart),
        supabase.from("testimonials").select("id", { count: "exact", head: true }),
        supabase.from("testimonials").select("id", { count: "exact", head: true }).eq("is_approved", false),
        supabase.from("testimonials").select("id", { count: "exact", head: true }).eq("is_approved", true),
        supabase.from("testimonial_comments").select("id", { count: "exact", head: true }),
        supabase.from("testimonial_comment_reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("testimonial_comment_reports").select("id", { count: "exact", head: true }).eq("status", "resolved"),
        supabase.from("testimonial_likes").select("id", { count: "exact", head: true }),
        supabase.from("testimonial_reactions").select("id", { count: "exact", head: true }),
      ]);

      setStats({
        totalUsers: usersResult.count || 0,
        newUsersToday: newUsersResult.count || 0,
        totalTestimonials: testimonialsResult.count || 0,
        pendingTestimonials: pendingTestimonialsResult.count || 0,
        approvedTestimonials: approvedTestimonialsResult.count || 0,
        totalComments: commentsResult.count || 0,
        pendingReports: pendingReportsResult.count || 0,
        resolvedReports: resolvedReportsResult.count || 0,
        totalLikes: likesResult.count || 0,
        totalReactions: reactionsResult.count || 0,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentReports = async () => {
    try {
      const { data: reports } = await supabase
        .from("testimonial_comment_reports")
        .select(`
          id,
          reason,
          status,
          created_at,
          reporter_id
        `)
        .order("created_at", { ascending: false })
        .limit(5);

      if (reports && reports.length > 0) {
        const reporterIds = reports.map(r => r.reporter_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name")
          .in("id", reporterIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p.display_name]) || []);

        setRecentReports(reports.map(r => ({
          id: r.id,
          reason: r.reason,
          status: r.status,
          created_at: r.created_at,
          reporter_name: profileMap.get(r.reporter_id) || "Người dùng ẩn danh",
        })));
      }
    } catch (error) {
      console.error("Error fetching recent reports:", error);
    }
  };

  if (isCheckingRole || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-pink-950/10">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const statCards = [
    {
      title: "Tổng người dùng",
      value: stats.totalUsers,
      subtitle: `+${stats.newUsersToday} hôm nay`,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Nhân chứng",
      value: stats.totalTestimonials,
      subtitle: `${stats.pendingTestimonials} chờ duyệt`,
      icon: Sparkles,
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
    },
    {
      title: "Bình luận",
      value: stats.totalComments,
      subtitle: `${stats.totalLikes} lượt thích`,
      icon: MessageSquare,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Báo cáo",
      value: stats.pendingReports,
      subtitle: `${stats.resolvedReports} đã xử lý`,
      icon: AlertTriangle,
      color: stats.pendingReports > 0 ? "text-orange-500" : "text-green-500",
      bgColor: stats.pendingReports > 0 ? "bg-orange-500/10" : "bg-green-500/10",
    },
  ];

  const quickActions = [
    {
      title: "Quản lý người dùng",
      description: "Xem, cấm, và phân quyền người dùng",
      icon: Users,
      href: "/admin/users",
      color: "text-blue-400",
    },
    {
      title: "Duyệt nhân chứng",
      description: "Phê duyệt hoặc từ chối testimonials",
      icon: Sparkles,
      href: "/admin/testimonials",
      color: "text-pink-400",
      badge: stats.pendingTestimonials > 0 ? stats.pendingTestimonials : undefined,
    },
    {
      title: "Báo cáo bình luận",
      description: "Xử lý các báo cáo vi phạm",
      icon: Flag,
      href: "/admin/comment-reports",
      color: "text-orange-400",
      badge: stats.pendingReports > 0 ? stats.pendingReports : undefined,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-pink-950/10 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-violet-400 bg-clip-text text-transparent flex items-center gap-3">
              <LayoutDashboard className="w-8 h-8 text-pink-400" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Quản lý và giám sát hoạt động của ứng dụng
            </p>
          </div>
          <Button asChild variant="outline" className="border-pink-500/30">
            <Link to="/">
              <ArrowRight className="w-4 h-4 mr-2" />
              Về trang chủ
            </Link>
          </Button>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {statCards.map((stat, index) => (
            <Card key={stat.title} className="bg-card/50 backdrop-blur-sm border-border/30">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl md:text-3xl font-bold mt-1">{isLoading ? "..." : stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border/30 h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-pink-400" />
                  Hành động nhanh
                </CardTitle>
                <CardDescription>
                  Truy cập nhanh các chức năng quản trị
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.map((action) => (
                  <Link
                    key={action.href}
                    to={action.href}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
                  >
                    <div className={`p-2 rounded-lg bg-muted/50`}>
                      <action.icon className={`w-5 h-5 ${action.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium group-hover:text-pink-400 transition-colors">
                        {action.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                    {action.badge && (
                      <Badge variant="destructive" className="animate-pulse">
                        {action.badge}
                      </Badge>
                    )}
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-pink-400 transition-colors" />
                  </Link>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Reports */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border/30 h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                  Báo cáo gần đây
                </CardTitle>
                <CardDescription>
                  Các báo cáo bình luận mới nhất cần xử lý
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentReports.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500/50" />
                    <p>Không có báo cáo nào</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentReports.map((report) => (
                      <div
                        key={report.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                      >
                        <div className={`w-2 h-2 rounded-full ${
                          report.status === "pending" ? "bg-orange-500" : "bg-green-500"
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{report.reason}</p>
                          <p className="text-xs text-muted-foreground">
                            Bởi {report.reporter_name} • {format(new Date(report.created_at), "dd/MM HH:mm", { locale: vi })}
                          </p>
                        </div>
                        <Badge variant={report.status === "pending" ? "outline" : "secondary"} className="text-xs">
                          {report.status === "pending" ? "Chờ xử lý" : "Đã xử lý"}
                        </Badge>
                      </div>
                    ))}
                    <Separator className="my-2" />
                    <Button asChild variant="ghost" className="w-full" size="sm">
                      <Link to="/admin/comment-reports">
                        Xem tất cả báo cáo
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Activity Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-card/50 backdrop-blur-sm border-border/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-400" />
                Tổng quan hoạt động
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{stats.approvedTestimonials}</p>
                  <p className="text-sm text-muted-foreground">Nhân chứng đã duyệt</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{stats.pendingTestimonials}</p>
                  <p className="text-sm text-muted-foreground">Đang chờ duyệt</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <Heart className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{stats.totalLikes}</p>
                  <p className="text-sm text-muted-foreground">Lượt thích</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <Sparkles className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{stats.totalReactions}</p>
                  <p className="text-sm text-muted-foreground">Cảm xúc</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
