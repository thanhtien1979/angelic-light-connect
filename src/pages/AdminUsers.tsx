import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, Users, Search, Loader2, Shield, ShieldCheck,
  ShieldX, User, Mail, Calendar, Coins, Crown, UserCog,
  Eye, MoreVertical, Ban, CheckCircle, XCircle, Sparkles
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAdminRole } from "@/hooks/useAdminRole";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AuroraBackground from "@/components/AuroraBackground";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";
import { vi } from "date-fns/locale";

interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  roles: string[];
  coins: number;
  email?: string;
  isBanned?: boolean;
  banReason?: string | null;
  bannedAt?: string | null;
}

type FilterRole = "all" | "admin" | "moderator" | "user" | "banned";

const AdminUsers = () => {
  const { isAuthenticated } = useAuth();
  const { isAdmin, isLoading: isCheckingRole } = useAdminRole();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<FilterRole>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    admins: 0,
    moderators: 0,
    bannedUsers: 0
  });

  const fetchUsers = useCallback(async () => {
    if (!isAdmin) return;

    setIsLoading(true);
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Fetch all coins
      const { data: coins, error: coinsError } = await supabase
        .from("user_camly_coins")
        .select("user_id, total_coins");

      if (coinsError) throw coinsError;

      // Fetch banned users
      const { data: bannedUsers, error: bannedError } = await supabase
        .from("banned_users")
        .select("user_id, reason, banned_at");

      if (bannedError) throw bannedError;

      // Combine data
      const usersWithDetails: UserProfile[] = (profiles || []).map(profile => {
        const userRoles = roles?.filter(r => r.user_id === profile.id).map(r => r.role) || [];
        const userCoins = coins?.find(c => c.user_id === profile.id)?.total_coins || 0;
        const banInfo = bannedUsers?.find(b => b.user_id === profile.id);
        
        return {
          id: profile.id,
          display_name: profile.display_name,
          avatar_url: profile.avatar_url,
          created_at: profile.created_at,
          roles: userRoles.length > 0 ? userRoles : ["user"],
          coins: userCoins,
          isBanned: !!banInfo,
          banReason: banInfo?.reason,
          bannedAt: banInfo?.banned_at
        };
      });

      setUsers(usersWithDetails);

      // Calculate stats
      setStats({
        totalUsers: usersWithDetails.length,
        admins: usersWithDetails.filter(u => u.roles.includes("admin")).length,
        moderators: usersWithDetails.filter(u => u.roles.includes("moderator")).length,
        bannedUsers: usersWithDetails.filter(u => u.isBanned).length
      });

    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin, fetchUsers]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.display_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesRole = filterRole === "all";
    if (filterRole === "banned") {
      matchesRole = user.isBanned === true;
    } else if (filterRole !== "all") {
      matchesRole = user.roles.includes(filterRole);
    }
    
    return matchesSearch && matchesRole;
  });

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole) return;

    setIsProcessing(true);
    try {
      if (selectedRole === "remove") {
        // Remove all roles
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", selectedUser.id);
        
        if (error) throw error;
        toast.success("Đã xóa tất cả quyền của người dùng");
      } else {
        // Check if role already exists
        const existingRole = selectedUser.roles.find(r => r === selectedRole);
        
        if (existingRole) {
          toast.info("Người dùng đã có quyền này");
        } else {
        const { error } = await supabase
          .from("user_roles")
          .insert({
            user_id: selectedUser.id,
            role: selectedRole as "admin" | "moderator"
          });
        
        if (error) throw error;
          toast.success(`Đã gán quyền ${selectedRole} cho người dùng`);
        }
      }

      setIsRoleDialogOpen(false);
      setSelectedUser(null);
      setSelectedRole("");
      fetchUsers();
    } catch (error) {
      console.error("Error assigning role:", error);
      toast.error("Không thể thay đổi quyền");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveRole = async (userId: string, role: string) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role as "admin" | "moderator" | "user");
      
      if (error) throw error;
      toast.success(`Đã xóa quyền ${role}`);
      fetchUsers();
    } catch (error) {
      console.error("Error removing role:", error);
      toast.error("Không thể xóa quyền");
    }
  };

  const handleBanUser = async () => {
    if (!selectedUser) return;

    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("banned_users")
        .insert({
          user_id: selectedUser.id,
          banned_by: user.id,
          reason: banReason || null
        });

      if (error) throw error;
      toast.success("Đã cấm người dùng này");
      setIsBanDialogOpen(false);
      setSelectedUser(null);
      setBanReason("");
      fetchUsers();
    } catch (error) {
      console.error("Error banning user:", error);
      toast.error("Không thể cấm người dùng");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("banned_users")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;
      toast.success("Đã bỏ cấm người dùng");
      fetchUsers();
    } catch (error) {
      console.error("Error unbanning user:", error);
      toast.error("Không thể bỏ cấm người dùng");
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white gap-1">
            <Crown className="w-3 h-3" />
            Admin
          </Badge>
        );
      case "moderator":
        return (
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white gap-1">
            <ShieldCheck className="w-3 h-3" />
            Moderator
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            <User className="w-3 h-3" />
            User
          </Badge>
        );
    }
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
      <AuroraBackground />
      
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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-rose-500 bg-clip-text text-transparent">
                Quản Lý Người Dùng
              </h1>
              <p className="text-sm text-muted-foreground">
                Quản lý tài khoản và phân quyền
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
          <Card className="bg-background/60 backdrop-blur-xl border-pink-500/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-xs text-muted-foreground">Tổng người dùng</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-background/60 backdrop-blur-xl border-pink-500/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.admins}</p>
                <p className="text-xs text-muted-foreground">Admins</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-background/60 backdrop-blur-xl border-pink-500/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.moderators}</p>
                <p className="text-xs text-muted-foreground">Moderators</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-background/60 backdrop-blur-xl border-pink-500/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
                <Ban className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.bannedUsers}</p>
                <p className="text-xs text-muted-foreground">Bị cấm</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 mb-6"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên hoặc ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/60 border-pink-500/20"
            />
          </div>
          
          <Tabs value={filterRole} onValueChange={(v) => setFilterRole(v as FilterRole)}>
            <TabsList className="bg-background/60">
              <TabsTrigger value="all">Tất cả</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
              <TabsTrigger value="moderator">Mod</TabsTrigger>
              <TabsTrigger value="user">User</TabsTrigger>
              <TabsTrigger value="banned" className="text-destructive">Bị cấm</TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Users List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-background/60 backdrop-blur-xl border-pink-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="w-5 h-5 text-pink-400" />
                Danh sách người dùng ({filteredUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-pink-400" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Không tìm thấy người dùng</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    <AnimatePresence>
                      {filteredUsers.map((user, index) => (
                        <motion.div
                          key={user.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.02 }}
                          className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-pink-950/30 to-rose-950/30 border border-pink-500/20 hover:border-pink-400/40 transition-all"
                        >
                          <Avatar className="h-12 w-12 ring-2 ring-pink-400/30">
                            <AvatarImage src={user.avatar_url || undefined} />
                            <AvatarFallback className="bg-gradient-to-br from-pink-500/30 to-rose-500/30">
                              <User className="w-5 h-5 text-pink-300" />
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-foreground truncate">
                                {user.display_name || "Thiên Thần ẩn danh"}
                              </p>
                              {user.isBanned && (
                                <Badge className="bg-gradient-to-r from-red-600 to-red-800 text-white gap-1">
                                  <Ban className="w-3 h-3" />
                                  Bị cấm
                                </Badge>
                              )}
                              {user.roles.map(role => (
                                <span key={role}>{getRoleBadge(role)}</span>
                              ))}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(user.created_at), "dd/MM/yyyy", { locale: vi })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Coins className="w-3 h-3 text-amber-400" />
                                {user.coins.toLocaleString()} Camly
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
                              ID: {user.id}
                            </p>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link to={`/user/${user.id}`} className="flex items-center gap-2">
                                  <Eye className="w-4 h-4" />
                                  Xem hồ sơ
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsRoleDialogOpen(true);
                                }}
                                className="flex items-center gap-2"
                              >
                                <Shield className="w-4 h-4" />
                                Thay đổi quyền
                              </DropdownMenuItem>
                              {user.roles.includes("admin") && (
                                <DropdownMenuItem
                                  onClick={() => handleRemoveRole(user.id, "admin")}
                                  className="flex items-center gap-2 text-destructive"
                                >
                                  <XCircle className="w-4 h-4" />
                                  Xóa quyền Admin
                                </DropdownMenuItem>
                              )}
                              {user.roles.includes("moderator") && (
                                <DropdownMenuItem
                                  onClick={() => handleRemoveRole(user.id, "moderator")}
                                  className="flex items-center gap-2 text-destructive"
                                >
                                  <XCircle className="w-4 h-4" />
                                  Xóa quyền Moderator
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              {user.isBanned ? (
                                <DropdownMenuItem
                                  onClick={() => handleUnbanUser(user.id)}
                                  className="flex items-center gap-2 text-green-500"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Bỏ cấm người dùng
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setIsBanDialogOpen(true);
                                  }}
                                  className="flex items-center gap-2 text-destructive"
                                >
                                  <Ban className="w-4 h-4" />
                                  Cấm người dùng
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Admin Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex flex-wrap gap-4"
        >
          <Button asChild variant="outline" className="border-pink-500/30 hover:bg-pink-500/10">
            <Link to="/admin/testimonials">
              <Sparkles className="w-4 h-4 mr-2" />
              Quản lý Nhân chứng
            </Link>
          </Button>
        </motion.div>
      </div>

      {/* Role Assignment Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="bg-background/95 backdrop-blur-xl border-pink-500/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-pink-400" />
              Thay đổi quyền người dùng
            </DialogTitle>
            <DialogDescription>
              Gán hoặc thay đổi quyền cho {selectedUser?.display_name || "người dùng này"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <Avatar>
                <AvatarImage src={selectedUser?.avatar_url || undefined} />
                <AvatarFallback>
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{selectedUser?.display_name || "Thiên Thần ẩn danh"}</p>
                <p className="text-xs text-muted-foreground">
                  Quyền hiện tại: {selectedUser?.roles.join(", ")}
                </p>
              </div>
            </div>
            
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn quyền mới" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">
                  <span className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-orange-500" />
                    Admin - Toàn quyền quản trị
                  </span>
                </SelectItem>
                <SelectItem value="moderator">
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-500" />
                    Moderator - Kiểm duyệt nội dung
                  </span>
                </SelectItem>
                <SelectItem value="remove">
                  <span className="flex items-center gap-2 text-destructive">
                    <XCircle className="w-4 h-4" />
                    Xóa tất cả quyền đặc biệt
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRoleDialogOpen(false)}
              disabled={isProcessing}
            >
              Hủy
            </Button>
            <Button
              onClick={handleAssignRole}
              disabled={!selectedRole || isProcessing}
              className="bg-gradient-to-r from-pink-500 to-rose-500"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban User Dialog */}
      <Dialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
        <DialogContent className="bg-background/95 backdrop-blur-xl border-red-500/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Ban className="w-5 h-5" />
              Cấm người dùng
            </DialogTitle>
            <DialogDescription>
              Người dùng bị cấm sẽ không thể đăng nhập và sử dụng ứng dụng.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <Avatar>
                <AvatarImage src={selectedUser?.avatar_url || undefined} />
                <AvatarFallback>
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{selectedUser?.display_name || "Thiên Thần ẩn danh"}</p>
                <p className="text-xs text-muted-foreground">ID: {selectedUser?.id}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Lý do cấm (tùy chọn)</label>
              <Input
                placeholder="Nhập lý do cấm người dùng..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                className="border-destructive/30"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsBanDialogOpen(false);
                setBanReason("");
              }}
              disabled={isProcessing}
            >
              Hủy
            </Button>
            <Button
              onClick={handleBanUser}
              disabled={isProcessing}
              variant="destructive"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Ban className="w-4 h-4 mr-2" />
              )}
              Cấm người dùng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
