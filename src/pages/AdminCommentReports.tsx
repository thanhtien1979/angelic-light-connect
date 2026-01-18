import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, MessageCircle, Search, Loader2, Shield, ShieldCheck,
  ShieldX, User, Calendar, Flag, CheckCircle, XCircle, Trash2,
  Eye, MoreVertical, Ban, AlertTriangle, Clock, FileWarning
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAdminRole } from "@/hooks/useAdminRole";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { BackgroundEffects } from "@/components/BackgroundEffects";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";
import { vi } from "date-fns/locale";

interface CommentReport {
  id: string;
  comment_id: string;
  reporter_id: string;
  reason: string;
  description: string | null;
  status: string;
  created_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
  comment?: {
    id: string;
    content: string;
    user_id: string;
    testimonial_id: string;
    created_at: string;
  };
  reporter?: {
    display_name: string | null;
    avatar_url: string | null;
  };
  comment_author?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

type FilterStatus = "all" | "pending" | "resolved" | "dismissed";

const REASON_LABELS: Record<string, string> = {
  spam: "Spam / Quảng cáo",
  harassment: "Quấy rối / Bắt nạt",
  inappropriate: "Nội dung không phù hợp",
  hate_speech: "Ngôn từ thù địch",
  misinformation: "Thông tin sai lệch",
  other: "Lý do khác",
};

const AdminCommentReports = () => {
  const { isAuthenticated } = useAuth();
  const { isAdmin, isLoading: isCheckingRole } = useAdminRole();
  const [reports, setReports] = useState<CommentReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<CommentReport | null>(null);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"resolve" | "dismiss" | "delete" | null>(null);
  const [banReason, setBanReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    dismissed: 0
  });

  const fetchReports = useCallback(async () => {
    if (!isAdmin) return;

    setIsLoading(true);
    try {
      let query = supabase
        .from("testimonial_comment_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus);
      }

      const { data: reportsData, error: reportsError } = await query;
      if (reportsError) throw reportsError;

      if (!reportsData || reportsData.length === 0) {
        setReports([]);
        setStats({ total: 0, pending: 0, resolved: 0, dismissed: 0 });
        setIsLoading(false);
        return;
      }

      // Get unique IDs
      const commentIds = [...new Set(reportsData.map(r => r.comment_id))];
      const reporterIds = [...new Set(reportsData.map(r => r.reporter_id))];

      // Fetch comments
      const { data: comments } = await supabase
        .from("testimonial_comments")
        .select("id, content, user_id, testimonial_id, created_at")
        .in("id", commentIds);

      // Get comment author IDs
      const commentAuthorIds = comments?.map(c => c.user_id) || [];
      const allUserIds = [...new Set([...reporterIds, ...commentAuthorIds])];

      // Fetch profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in("id", allUserIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      const commentMap = new Map(comments?.map(c => [c.id, c]) || []);

      // Combine data
      const enrichedReports: CommentReport[] = reportsData.map(report => {
        const comment = commentMap.get(report.comment_id);
        return {
          ...report,
          comment: comment || undefined,
          reporter: profileMap.get(report.reporter_id) || { display_name: null, avatar_url: null },
          comment_author: comment ? profileMap.get(comment.user_id) : undefined,
        };
      });

      // Apply search filter
      let filtered = enrichedReports;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = enrichedReports.filter(r =>
          r.comment?.content?.toLowerCase().includes(query) ||
          r.reporter?.display_name?.toLowerCase().includes(query) ||
          r.comment_author?.display_name?.toLowerCase().includes(query) ||
          r.reason.toLowerCase().includes(query)
        );
      }

      setReports(filtered);

      // Calculate stats (from all reports, not filtered)
      const { data: allReports } = await supabase
        .from("testimonial_comment_reports")
        .select("status");

      if (allReports) {
        setStats({
          total: allReports.length,
          pending: allReports.filter(r => r.status === "pending").length,
          resolved: allReports.filter(r => r.status === "resolved").length,
          dismissed: allReports.filter(r => r.status === "dismissed").length
        });
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Không thể tải danh sách báo cáo");
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, filterStatus, searchQuery]);

  useEffect(() => {
    if (isAdmin) {
      fetchReports();
    }
  }, [isAdmin, fetchReports]);

  const handleAction = async () => {
    if (!selectedReport || !actionType) return;

    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (actionType === "delete") {
        // Delete the comment
        const { error: deleteError } = await supabase
          .from("testimonial_comments")
          .delete()
          .eq("id", selectedReport.comment_id);

        if (deleteError) throw deleteError;

        // Mark report as resolved
        const { error: updateError } = await supabase
          .from("testimonial_comment_reports")
          .update({
            status: "resolved",
            resolved_at: new Date().toISOString(),
            resolved_by: user.id
          })
          .eq("id", selectedReport.id);

        if (updateError) throw updateError;

        toast.success("Đã xóa bình luận vi phạm");
      } else {
        const newStatus = actionType === "resolve" ? "resolved" : "dismissed";
        
        const { error } = await supabase
          .from("testimonial_comment_reports")
          .update({
            status: newStatus,
            resolved_at: new Date().toISOString(),
            resolved_by: user.id
          })
          .eq("id", selectedReport.id);

        if (error) throw error;

        toast.success(actionType === "resolve" ? "Đã xử lý báo cáo" : "Đã bỏ qua báo cáo");
      }

      setIsActionDialogOpen(false);
      setSelectedReport(null);
      setActionType(null);
      fetchReports();
    } catch (error) {
      console.error("Error processing report:", error);
      toast.error("Không thể xử lý báo cáo");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBanUser = async () => {
    if (!selectedReport?.comment?.user_id) return;

    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Ban the user
      const { error: banError } = await supabase
        .from("banned_users")
        .insert({
          user_id: selectedReport.comment.user_id,
          banned_by: user.id,
          reason: banReason || "Vi phạm quy tắc cộng đồng trong bình luận"
        });

      if (banError) throw banError;

      // Mark report as resolved
      const { error: updateError } = await supabase
        .from("testimonial_comment_reports")
        .update({
          status: "resolved",
          resolved_at: new Date().toISOString(),
          resolved_by: user.id
        })
        .eq("id", selectedReport.id);

      if (updateError) throw updateError;

      toast.success("Đã cấm người dùng vi phạm");
      setIsBanDialogOpen(false);
      setSelectedReport(null);
      setBanReason("");
      fetchReports();
    } catch (error) {
      console.error("Error banning user:", error);
      toast.error("Không thể cấm người dùng");
    } finally {
      setIsProcessing(false);
    }
  };

  const openActionDialog = (report: CommentReport, action: typeof actionType) => {
    setSelectedReport(report);
    setActionType(action);
    setIsActionDialogOpen(true);
  };

  const openBanDialog = (report: CommentReport) => {
    setSelectedReport(report);
    setIsBanDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
            <Clock className="w-3 h-3 mr-1" />
            Chờ xử lý
          </Badge>
        );
      case "resolved":
        return (
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Đã xử lý
          </Badge>
        );
      case "dismissed":
        return (
          <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">
            <XCircle className="w-3 h-3 mr-1" />
            Bỏ qua
          </Badge>
        );
      default:
        return null;
    }
  };

  const getReasonBadge = (reason: string) => {
    return (
      <Badge variant="outline" className="text-foreground/80">
        <Flag className="w-3 h-3 mr-1" />
        {REASON_LABELS[reason] || reason}
      </Badge>
    );
  };

  // Loading state
  if (isCheckingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated or not admin
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <ShieldX className="w-16 h-16 mx-auto text-destructive" />
          <h1 className="text-2xl font-bold text-foreground">Không có quyền truy cập</h1>
          <p className="text-muted-foreground">Bạn cần quyền Admin để truy cập trang này.</p>
          <Button asChild>
            <Link to="/">Về trang chủ</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <BackgroundEffects showAurora />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <FileWarning className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
                Quản Lý Báo Cáo Bình Luận
              </h1>
              <p className="text-sm text-muted-foreground">
                Xem xét và xử lý các báo cáo vi phạm
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <Card 
            className={`bg-background/60 backdrop-blur-xl cursor-pointer transition-all ${filterStatus === "all" ? "border-primary" : "border-border/20 hover:border-primary/50"}`}
            onClick={() => setFilterStatus("all")}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Flag className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Tổng báo cáo</p>
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className={`bg-background/60 backdrop-blur-xl cursor-pointer transition-all ${filterStatus === "pending" ? "border-amber-500" : "border-border/20 hover:border-amber-500/50"}`}
            onClick={() => setFilterStatus("pending")}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Chờ xử lý</p>
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className={`bg-background/60 backdrop-blur-xl cursor-pointer transition-all ${filterStatus === "resolved" ? "border-emerald-500" : "border-border/20 hover:border-emerald-500/50"}`}
            onClick={() => setFilterStatus("resolved")}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-400">{stats.resolved}</p>
                <p className="text-xs text-muted-foreground">Đã xử lý</p>
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className={`bg-background/60 backdrop-blur-xl cursor-pointer transition-all ${filterStatus === "dismissed" ? "border-slate-500" : "border-border/20 hover:border-slate-500/50"}`}
            onClick={() => setFilterStatus("dismissed")}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-400">{stats.dismissed}</p>
                <p className="text-xs text-muted-foreground">Bỏ qua</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 mb-6"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo nội dung, tên người dùng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/60 border-border/20"
            />
          </div>
        </motion.div>

        {/* Reports List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-background/60 backdrop-blur-xl border-border/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Danh sách báo cáo ({reports.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : reports.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Flag className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Không có báo cáo nào</p>
                </div>
              ) : (
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    <AnimatePresence>
                      {reports.map((report, index) => (
                        <motion.div
                          key={report.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.02 }}
                          className="p-4 rounded-xl bg-gradient-to-r from-background/80 to-background/60 border border-border/20 hover:border-primary/30 transition-all"
                        >
                          {/* Header */}
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex items-center gap-3 flex-wrap">
                              {getStatusBadge(report.status)}
                              {getReasonBadge(report.reason)}
                              <span className="text-sm text-muted-foreground">
                                {formatDistanceToNow(new Date(report.created_at), {
                                  addSuffix: true,
                                  locale: vi,
                                })}
                              </span>
                            </div>

                            {report.status === "pending" && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openActionDialog(report, "resolve")}>
                                    <CheckCircle className="w-4 h-4 mr-2 text-emerald-400" />
                                    Đánh dấu đã xử lý
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openActionDialog(report, "delete")}>
                                    <Trash2 className="w-4 h-4 mr-2 text-red-400" />
                                    Xóa bình luận
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => openBanDialog(report)}>
                                    <Ban className="w-4 h-4 mr-2 text-red-400" />
                                    Cấm người vi phạm
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => openActionDialog(report, "dismiss")}>
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Bỏ qua báo cáo
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>

                          {/* Comment Content */}
                          <div className="bg-background/50 rounded-lg p-3 mb-3 border border-border/10">
                            <div className="flex items-center gap-2 mb-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={report.comment_author?.avatar_url || undefined} />
                                <AvatarFallback className="text-xs">
                                  {report.comment_author?.display_name?.[0] || "?"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium">
                                {report.comment_author?.display_name || "Ẩn danh"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                (người bị báo cáo)
                              </span>
                            </div>
                            <p className="text-sm text-foreground/80 italic">
                              "{report.comment?.content || "Bình luận đã bị xóa"}"
                            </p>
                          </div>

                          {/* Description */}
                          {report.description && (
                            <div className="mb-3">
                              <p className="text-xs text-muted-foreground mb-1">Mô tả thêm:</p>
                              <p className="text-sm text-foreground/70">{report.description}</p>
                            </div>
                          )}

                          {/* Reporter */}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Người báo cáo:</span>
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={report.reporter?.avatar_url || undefined} />
                              <AvatarFallback className="text-xs">
                                {report.reporter?.display_name?.[0] || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <span>{report.reporter?.display_name || "Ẩn danh"}</span>
                          </div>

                          {/* Action Buttons for Pending Reports */}
                          {report.status === "pending" && (
                            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/10">
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                                onClick={() => openActionDialog(report, "resolve")}
                              >
                                <CheckCircle className="w-4 h-4" />
                                Xử lý
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1 text-red-400 border-red-500/30 hover:bg-red-500/10"
                                onClick={() => openActionDialog(report, "delete")}
                              >
                                <Trash2 className="w-4 h-4" />
                                Xóa BL
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1 text-red-400 border-red-500/30 hover:bg-red-500/10"
                                onClick={() => openBanDialog(report)}
                              >
                                <Ban className="w-4 h-4" />
                                Cấm
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="gap-1 text-muted-foreground"
                                onClick={() => openActionDialog(report, "dismiss")}
                              >
                                <XCircle className="w-4 h-4" />
                                Bỏ qua
                              </Button>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Action Confirmation Dialog */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "resolve" && "Xác nhận xử lý báo cáo"}
              {actionType === "dismiss" && "Xác nhận bỏ qua báo cáo"}
              {actionType === "delete" && "Xác nhận xóa bình luận"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "resolve" && "Đánh dấu báo cáo này đã được xử lý."}
              {actionType === "dismiss" && "Bỏ qua báo cáo này (không vi phạm)."}
              {actionType === "delete" && "Xóa bình luận vi phạm và đánh dấu báo cáo đã xử lý."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleAction} disabled={isProcessing}>
              {isProcessing && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban User Dialog */}
      <Dialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <Ban className="w-5 h-5" />
              Cấm người dùng vi phạm
            </DialogTitle>
            <DialogDescription>
              Người dùng "{selectedReport?.comment_author?.display_name || "Ẩn danh"}" sẽ bị cấm khỏi hệ thống.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-foreground">
                Lý do cấm (tùy chọn)
              </label>
              <Textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Nhập lý do cấm người dùng..."
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBanDialogOpen(false)}>
              Hủy
            </Button>
            <Button 
              variant="destructive"
              onClick={handleBanUser} 
              disabled={isProcessing}
            >
              {isProcessing && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Cấm người dùng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCommentReports;
