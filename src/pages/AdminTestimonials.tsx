import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, Check, X, Star, Clock, Loader2, 
  Eye, Sparkles, Shield, Search, Filter,
  ChevronDown, ImageIcon
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAdminRole } from "@/hooks/useAdminRole";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import AuroraBackground from "@/components/AuroraBackground";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface AdminTestimonial {
  id: string;
  user_id: string;
  testimony: string;
  image_url: string | null;
  is_approved: boolean;
  is_featured: boolean;
  likes_count: number;
  comments_count: number;
  created_at: string;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

type FilterStatus = "all" | "pending" | "approved" | "featured";

const AdminTestimonials = () => {
  const { isAuthenticated } = useAuth();
  const { isAdmin, isLoading: isCheckingRole } = useAdminRole();
  const [testimonials, setTestimonials] = useState<AdminTestimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTestimonial, setSelectedTestimonial] = useState<AdminTestimonial | null>(null);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | "feature" | "unfeature" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchTestimonials = useCallback(async () => {
    if (!isAdmin) return;

    setIsLoading(true);
    try {
      let query = supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false });

      if (filterStatus === "pending") {
        query = query.eq("is_approved", false);
      } else if (filterStatus === "approved") {
        query = query.eq("is_approved", true);
      } else if (filterStatus === "featured") {
        query = query.eq("is_featured", true);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch profiles
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(t => t.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name, avatar_url")
          .in("id", userIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

        const withProfiles = data.map(t => ({
          ...t,
          profile: profileMap.get(t.user_id) || { display_name: null, avatar_url: null },
        }));

        // Apply search filter
        let filtered = withProfiles;
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          filtered = withProfiles.filter(t =>
            t.testimony.toLowerCase().includes(query) ||
            t.profile?.display_name?.toLowerCase().includes(query)
          );
        }

        setTestimonials(filtered);
      } else {
        setTestimonials([]);
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      toast.error("Không thể tải danh sách");
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, filterStatus, searchQuery]);

  useEffect(() => {
    if (isAdmin) {
      fetchTestimonials();
    }
  }, [fetchTestimonials, isAdmin]);

  const handleAction = async () => {
    if (!selectedTestimonial || !actionType) return;

    setIsProcessing(true);
    try {
      let updateData: Partial<AdminTestimonial> = {};

      switch (actionType) {
        case "approve":
          updateData = { is_approved: true };
          break;
        case "reject":
          updateData = { is_approved: false };
          break;
        case "feature":
          updateData = { is_featured: true, is_approved: true };
          break;
        case "unfeature":
          updateData = { is_featured: false };
          break;
      }

      const { error } = await supabase
        .from("testimonials")
        .update(updateData)
        .eq("id", selectedTestimonial.id);

      if (error) throw error;

      const messages = {
        approve: "Đã duyệt nhân chứng",
        reject: "Đã từ chối nhân chứng",
        feature: "Đã đánh dấu nổi bật",
        unfeature: "Đã bỏ đánh dấu nổi bật",
      };

      toast.success(messages[actionType]);
      setIsActionDialogOpen(false);
      fetchTestimonials();
    } catch (error) {
      console.error("Error updating testimonial:", error);
      toast.error("Không thể cập nhật");
    } finally {
      setIsProcessing(false);
    }
  };

  const openActionDialog = (testimonial: AdminTestimonial, action: typeof actionType) => {
    setSelectedTestimonial(testimonial);
    setActionType(action);
    setIsActionDialogOpen(true);
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getStatusBadge = (testimonial: AdminTestimonial) => {
    if (testimonial.is_featured) {
      return <Badge className="bg-gradient-to-r from-gold to-primary text-white">⭐ Nổi bật</Badge>;
    }
    if (testimonial.is_approved) {
      return <Badge variant="outline" className="text-emerald-600 border-emerald-600">✓ Đã duyệt</Badge>;
    }
    return <Badge variant="outline" className="text-amber-600 border-amber-600">⏳ Chờ duyệt</Badge>;
  };

  // Access control
  if (isCheckingRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Shield className="w-16 h-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold text-foreground">Truy cập bị từ chối</h1>
        <p className="text-muted-foreground">Bạn không có quyền truy cập trang này.</p>
        <Link to="/">
          <Button>Về trang chủ</Button>
        </Link>
      </div>
    );
  }

  const counts = {
    all: testimonials.length,
    pending: testimonials.filter(t => !t.is_approved).length,
    approved: testimonials.filter(t => t.is_approved && !t.is_featured).length,
    featured: testimonials.filter(t => t.is_featured).length,
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <AuroraBackground />

      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/30">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/testimonials" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Quay lại</span>
              </Link>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <span className="font-semibold text-foreground">Quản lý Nhân chứng</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Chờ duyệt", count: counts.pending, color: "text-amber-600", filter: "pending" as FilterStatus },
              { label: "Đã duyệt", count: counts.approved, color: "text-emerald-600", filter: "approved" as FilterStatus },
              { label: "Nổi bật", count: counts.featured, color: "text-primary", filter: "featured" as FilterStatus },
              { label: "Tổng cộng", count: counts.all, color: "text-foreground", filter: "all" as FilterStatus },
            ].map((stat) => (
              <motion.button
                key={stat.label}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFilterStatus(stat.filter)}
                className={`p-4 rounded-xl border transition-all ${
                  filterStatus === stat.filter
                    ? "bg-primary/10 border-primary/50"
                    : "bg-card/50 border-border/30 hover:border-primary/30"
                }`}
              >
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.count}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.button>
            ))}
          </div>

          {/* Search */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm theo nội dung hoặc tên..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Testimonials List */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : testimonials.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Không có nhân chứng nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {testimonials.map((testimonial, index) => (
                  <motion.div
                    key={testimonial.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card/70 backdrop-blur-sm rounded-xl border border-border/30 p-6 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex gap-4">
                      {/* Avatar */}
                      <Avatar className="w-12 h-12 flex-shrink-0">
                        <AvatarImage src={testimonial.profile?.avatar_url || ""} />
                        <AvatarFallback className="bg-primary/10">
                          {getInitials(testimonial.profile?.display_name)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="font-medium text-foreground">
                            {testimonial.profile?.display_name || "Linh hồn ẩn danh"}
                          </span>
                          {getStatusBadge(testimonial)}
                          <span className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(testimonial.created_at), {
                              addSuffix: true,
                              locale: vi,
                            })}
                          </span>
                        </div>

                        <p className="text-foreground/90 mb-3 leading-relaxed">
                          "{testimonial.testimony}"
                        </p>

                        {/* Image preview */}
                        {testimonial.image_url && (
                          <div className="mb-3">
                            <img
                              src={testimonial.image_url}
                              alt="Attached"
                              className="max-w-[200px] h-24 object-cover rounded-lg"
                            />
                          </div>
                        )}

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          <span>❤️ {testimonial.likes_count} tim</span>
                          <span>💬 {testimonial.comments_count} bình luận</span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {!testimonial.is_approved && (
                            <Button
                              size="sm"
                              onClick={() => openActionDialog(testimonial, "approve")}
                              className="gap-1 bg-emerald-600 hover:bg-emerald-700"
                            >
                              <Check className="w-4 h-4" />
                              Duyệt
                            </Button>
                          )}

                          {testimonial.is_approved && !testimonial.is_featured && (
                            <Button
                              size="sm"
                              onClick={() => openActionDialog(testimonial, "feature")}
                              className="gap-1 bg-gradient-to-r from-gold to-primary"
                            >
                              <Star className="w-4 h-4" />
                              Đánh dấu nổi bật
                            </Button>
                          )}

                          {testimonial.is_featured && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openActionDialog(testimonial, "unfeature")}
                              className="gap-1"
                            >
                              <Star className="w-4 h-4" />
                              Bỏ nổi bật
                            </Button>
                          )}

                          {testimonial.is_approved && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openActionDialog(testimonial, "reject")}
                              className="gap-1 text-destructive hover:text-destructive"
                            >
                              <X className="w-4 h-4" />
                              Ẩn
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>

      {/* Action Confirmation Dialog */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" && "Xác nhận duyệt"}
              {actionType === "reject" && "Xác nhận ẩn"}
              {actionType === "feature" && "Xác nhận đánh dấu nổi bật"}
              {actionType === "unfeature" && "Xác nhận bỏ nổi bật"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve" && "Nhân chứng này sẽ được hiển thị công khai."}
              {actionType === "reject" && "Nhân chứng này sẽ bị ẩn khỏi trang công khai."}
              {actionType === "feature" && "Nhân chứng này sẽ được hiển thị trong carousel nổi bật."}
              {actionType === "unfeature" && "Nhân chứng này sẽ bị xóa khỏi carousel nổi bật."}
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
    </div>
  );
};

export default AdminTestimonials;
