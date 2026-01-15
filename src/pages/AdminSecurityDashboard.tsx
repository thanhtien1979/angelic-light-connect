import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdminRole } from "@/hooks/useAdminRole";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  AlertTriangle, 
  Clock, 
  Users, 
  Activity, 
  RefreshCw,
  ArrowLeft,
  Lock,
  Ban,
  Eye,
  TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface SecurityLog {
  id: string;
  event_type: string;
  event_severity: string;
  user_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  endpoint: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

interface SecurityStats {
  total_events: number;
  rate_limit_count: number;
  failed_auth_count: number;
  suspicious_count: number;
  critical_count: number;
  unique_ips: number;
}

const EVENT_TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  rate_limit: { label: "Rate Limit", icon: <Ban className="w-4 h-4" />, color: "bg-yellow-500" },
  failed_auth: { label: "Đăng nhập thất bại", icon: <Lock className="w-4 h-4" />, color: "bg-red-500" },
  suspicious_activity: { label: "Hoạt động đáng ngờ", icon: <AlertTriangle className="w-4 h-4" />, color: "bg-orange-500" },
  data_access: { label: "Truy cập dữ liệu", icon: <Eye className="w-4 h-4" />, color: "bg-blue-500" },
};

const SEVERITY_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  info: { label: "Thông tin", variant: "secondary" },
  warn: { label: "Cảnh báo", variant: "outline" },
  error: { label: "Lỗi", variant: "destructive" },
  critical: { label: "Nghiêm trọng", variant: "destructive" },
};

export default function AdminSecurityDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, isLoading: isAdminLoading } = useAdminRole();
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("24");
  const [filterType, setFilterType] = useState<string>("all");

  const fetchStats = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc("get_security_stats", {
        p_hours: parseInt(timeRange),
      });

      if (error) throw error;
      if (data && data.length > 0) {
        setStats(data[0] as SecurityStats);
      }
    } catch (error) {
      console.error("Error fetching security stats:", error);
    }
  }, [timeRange]);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const hoursAgo = new Date();
      hoursAgo.setHours(hoursAgo.getHours() - parseInt(timeRange));

      let query = supabase
        .from("security_logs")
        .select("*")
        .gte("created_at", hoursAgo.toISOString())
        .order("created_at", { ascending: false })
        .limit(100);

      if (filterType !== "all") {
        query = query.eq("event_type", filterType);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs((data || []) as SecurityLog[]);
    } catch (error) {
      console.error("Error fetching security logs:", error);
    } finally {
      setIsLoading(false);
    }
  }, [timeRange, filterType]);

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
      fetchLogs();
    }
  }, [isAdmin, fetchStats, fetchLogs]);

  // Realtime subscription
  useEffect(() => {
    if (!isAdmin) return;

    const channel = supabase
      .channel("security-logs-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "security_logs",
        },
        (payload) => {
          setLogs((prev) => [payload.new as SecurityLog, ...prev].slice(0, 100));
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, fetchStats]);

  // Redirect non-admins
  useEffect(() => {
    if (!isAdminLoading && !isAdmin && user) {
      navigate("/");
    }
  }, [isAdmin, isAdminLoading, user, navigate]);

  if (isAdminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const handleRefresh = () => {
    fetchStats();
    fetchLogs();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                Security Dashboard
              </h1>
              <p className="text-muted-foreground">
                Giám sát bảo mật và phát hiện hoạt động bất thường
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px]">
                <Clock className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 giờ qua</SelectItem>
                <SelectItem value="6">6 giờ qua</SelectItem>
                <SelectItem value="24">24 giờ qua</SelectItem>
                <SelectItem value="72">3 ngày qua</SelectItem>
                <SelectItem value="168">7 ngày qua</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleRefresh} variant="outline" size="icon">
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Activity className="w-4 h-4" />
                  <span className="text-xs">Tổng sự kiện</span>
                </div>
                <p className="text-2xl font-bold">{stats?.total_events || 0}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="border-yellow-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-yellow-500 mb-1">
                  <Ban className="w-4 h-4" />
                  <span className="text-xs">Rate Limit</span>
                </div>
                <p className="text-2xl font-bold">{stats?.rate_limit_count || 0}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-red-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-500 mb-1">
                  <Lock className="w-4 h-4" />
                  <span className="text-xs">Auth thất bại</span>
                </div>
                <p className="text-2xl font-bold">{stats?.failed_auth_count || 0}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="border-orange-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-orange-500 mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-xs">Đáng ngờ</span>
                </div>
                <p className="text-2xl font-bold">{stats?.suspicious_count || 0}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-destructive/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-destructive mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs">Nghiêm trọng</span>
                </div>
                <p className="text-2xl font-bold">{stats?.critical_count || 0}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card className="border-blue-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-blue-500 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-xs">IP duy nhất</span>
                </div>
                <p className="text-2xl font-bold">{stats?.unique_ips || 0}</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Nhật ký bảo mật</CardTitle>
                <CardDescription>
                  Theo dõi các sự kiện bảo mật trong hệ thống
                </CardDescription>
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Lọc theo loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="rate_limit">Rate Limit</SelectItem>
                  <SelectItem value="failed_auth">Auth thất bại</SelectItem>
                  <SelectItem value="suspicious_activity">Đáng ngờ</SelectItem>
                  <SelectItem value="data_access">Truy cập dữ liệu</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              {logs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Không có sự kiện bảo mật nào trong khoảng thời gian này</p>
                  <p className="text-sm">Hệ thống đang hoạt động bình thường ✓</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {logs.map((log, index) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${EVENT_TYPE_CONFIG[log.event_type]?.color || "bg-gray-500"}`}>
                            {EVENT_TYPE_CONFIG[log.event_type]?.icon || <Activity className="w-4 h-4 text-white" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">
                                {EVENT_TYPE_CONFIG[log.event_type]?.label || log.event_type}
                              </span>
                              <Badge variant={SEVERITY_CONFIG[log.event_severity]?.variant || "secondary"}>
                                {SEVERITY_CONFIG[log.event_severity]?.label || log.event_severity}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              {log.endpoint && (
                                <p>Endpoint: <code className="bg-muted px-1 rounded">{log.endpoint}</code></p>
                              )}
                              {log.ip_address && (
                                <p>IP: <code className="bg-muted px-1 rounded">{log.ip_address}</code></p>
                              )}
                              {log.user_id && (
                                <p>User ID: <code className="bg-muted px-1 rounded text-xs">{log.user_id.slice(0, 8)}...</code></p>
                              )}
                              {log.details && Object.keys(log.details).length > 0 && (
                                <details className="mt-2">
                                  <summary className="cursor-pointer text-xs hover:text-foreground">
                                    Chi tiết...
                                  </summary>
                                  <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                                    {JSON.stringify(log.details, null, 2)}
                                  </pre>
                                </details>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-sm text-muted-foreground whitespace-nowrap">
                          <p>{formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: vi })}</p>
                          <p className="text-xs">{format(new Date(log.created_at), "HH:mm:ss")}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
