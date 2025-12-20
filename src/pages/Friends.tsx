import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, Users, Heart, Sparkles, MessageCircle, 
  UserPlus, Search, Shield, ShieldOff, Flag, Video, Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useFriendships, Profile } from "@/hooks/useFriendships";
import { useBlockedUsers } from "@/hooks/useBlockedUsers";
import { useAuth } from "@/hooks/useAuth";
import { useVideoCall } from "@/hooks/useVideoCall";
import NavigationHeader from "@/components/NavigationHeader";
import SacredGeometryWatermark from "@/components/SacredGeometryWatermark";
import PrivateChat from "@/components/PrivateChat";
import AuthModal from "@/components/AuthModal";
import BlockUserDialog from "@/components/BlockUserDialog";
import BlockedUsersList from "@/components/BlockedUsersList";
import ReportUserDialog from "@/components/ReportUserDialog";
import VideoCallModal from "@/components/VideoCallModal";

const Friends = () => {
  const { user } = useAuth();
  const prefersReducedMotion = useReducedMotion();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);
  const [sendingTo, setSendingTo] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [userToBlock, setUserToBlock] = useState<{ id: string; name: string } | null>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [userToReport, setUserToReport] = useState<{ id: string; name: string } | null>(null);

  const { blockUser, isBlocked } = useBlockedUsers();

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

  const {
    friends,
    pendingRequests,
    sentRequests,
    loading,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    unfriend,
    searchUsers
  } = useFriendships();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    const results = await searchUsers(searchQuery);
    setSearchResults(results);
    setSearching(false);
  };

  const handleSendRequest = async (userId: string) => {
    setSendingTo(userId);
    await sendFriendRequest(userId);
    setSendingTo(null);
    setSearchResults(prev => prev.filter(p => p.id !== userId));
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getFriendProfile = (friendship: any) => {
    return friendship.requester || friendship.addressee;
  };

  const handleOpenChat = () => {
    setIsChatOpen(true);
  };

  const handleBlockUser = (userId: string, userName: string) => {
    setUserToBlock({ id: userId, name: userName });
    setBlockDialogOpen(true);
  };

  const confirmBlockUser = async (reason?: string) => {
    if (!userToBlock) return;
    await blockUser(userToBlock.id, reason);
    setBlockDialogOpen(false);
    setUserToBlock(null);
  };

  const handleReportUser = (userId: string, userName: string) => {
    setUserToReport({ id: userId, name: userName });
    setReportDialogOpen(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
        <NavigationHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 max-w-md mx-4"
          >
            <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-4">
              <Shield className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-serif font-semibold text-foreground mb-2">
              Đăng nhập để kết bạn
            </h2>
            <p className="text-muted-foreground mb-6">
              Hãy đăng nhập để tìm kiếm và kết nối với những người bạn ánh sáng
            </p>
            <Button 
              onClick={() => setShowAuthModal(true)}
              className="bg-gradient-to-r from-primary to-gold hover:opacity-90"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Đăng nhập ngay
            </Button>
          </motion.div>
        </div>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 relative">
      <SacredGeometryWatermark />
      
      {/* Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-radial from-rose-500/[0.05] via-pink-200/[0.03] to-transparent animate-ambient-breath blur-3xl" />
      </div>

      <NavigationHeader />

      {/* Header */}
      <header className="sticky top-16 z-40 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 rounded-full hover:bg-muted transition-colors">
              <ArrowLeft className="w-5 h-5 text-foreground/70" />
            </Link>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" />
              <h1 className="text-lg font-semibold text-foreground">Bạn Bè Ánh Sáng</h1>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenChat()}
            className="gap-2 border-rose-200 text-rose-600 hover:bg-rose-50"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Chat Bạn Bè</span>
          </Button>
        </div>
      </header>

      <motion.main
        initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-4xl mx-auto px-4 py-8"
      >
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 border border-rose-200 dark:border-rose-800/50 text-center"
          >
            <Users className="w-6 h-6 text-rose-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-rose-700 dark:text-rose-300">{friends.length}</p>
            <p className="text-xs text-rose-600 dark:text-rose-400">Bạn bè</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border border-amber-200 dark:border-amber-800/50 text-center"
          >
            <Sparkles className="w-6 h-6 text-amber-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{pendingRequests.length}</p>
            <p className="text-xs text-amber-600 dark:text-amber-400">Chờ duyệt</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800/50 text-center"
          >
            <UserPlus className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{sentRequests.length}</p>
            <p className="text-xs text-blue-600 dark:text-blue-400">Đã gửi</p>
          </motion.div>
        </div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 shadow-lg"
        >
          <Tabs defaultValue="friends" className="w-full">
            <TabsList className="w-full grid grid-cols-4 bg-muted/50 mb-6">
              <TabsTrigger value="friends" className="text-xs sm:text-sm data-[state=active]:bg-background">
                <Users className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Bạn bè</span>
                {friends.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">{friends.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="pending" className="text-xs sm:text-sm data-[state=active]:bg-background">
                <Sparkles className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Chờ duyệt</span>
                {pendingRequests.length > 0 && (
                  <Badge className="ml-1 text-xs bg-rose-500">{pendingRequests.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="sent" className="text-xs sm:text-sm data-[state=active]:bg-background">
                <UserPlus className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Đã gửi</span>
                {sentRequests.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">{sentRequests.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="search" className="text-xs sm:text-sm data-[state=active]:bg-background">
                <Search className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Tìm kiếm</span>
              </TabsTrigger>
            </TabsList>

            {/* Friends Tab */}
            <TabsContent value="friends" className="space-y-3">
              {loading ? (
                <div className="text-center py-12">
                  <Sparkles className="w-8 h-8 text-rose-400 animate-spin mx-auto" />
                  <p className="text-muted-foreground mt-2">Đang tải...</p>
                </div>
              ) : friends.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-foreground font-medium mb-2">Chưa có bạn bè nào</p>
                  <p className="text-muted-foreground text-sm">Tìm và kết bạn với những người bạn ánh sáng!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {friends.map((friendship, index) => {
                    const profile = getFriendProfile(friendship);
                    return (
                      <motion.div
                        key={friendship.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-rose-50/50 to-pink-50/50 dark:from-rose-950/20 dark:to-pink-950/20 border border-rose-200/50 dark:border-rose-800/30 hover:border-rose-300 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="w-12 h-12 ring-2 ring-rose-200">
                              <AvatarImage src={profile?.avatar_url || ""} />
                              <AvatarFallback className="bg-gradient-to-br from-rose-400 to-pink-500 text-white font-medium">
                                {getInitials(profile?.display_name)}
                              </AvatarFallback>
                            </Avatar>
                            {profile?.is_online && (
                              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full ring-2 ring-background" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">
                              {profile?.display_name || "Người dùng"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {profile?.is_online ? "🟢 Đang online" : "Bạn bè ánh sáng ✨"}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => initiateCall(profile?.id || "", profile?.display_name || "Người dùng", 'video')}
                            className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                            title="Gọi video"
                          >
                            <Video className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => initiateCall(profile?.id || "", profile?.display_name || "Người dùng", 'audio')}
                            className="text-green-500 hover:text-green-600 hover:bg-green-50"
                            title="Gọi thoại"
                          >
                            <Phone className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenChat()}
                            className="text-primary hover:text-primary hover:bg-primary/10"
                            title="Nhắn tin"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => unfriend(friendship.id)}
                            className="text-muted-foreground hover:text-amber-600 hover:bg-amber-50"
                            title="Hủy kết bạn"
                          >
                            <Users className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReportUser(profile?.id || "", profile?.display_name || "Người dùng")}
                            className="text-muted-foreground hover:text-amber-600 hover:bg-amber-50"
                            title="Báo cáo"
                          >
                            <Flag className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleBlockUser(profile?.id || "", profile?.display_name || "Người dùng")}
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            title="Chặn"
                          >
                            <ShieldOff className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Pending Requests Tab */}
            <TabsContent value="pending" className="space-y-3">
              {pendingRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Sparkles className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-foreground font-medium mb-2">Không có lời mời chờ duyệt</p>
                  <p className="text-muted-foreground text-sm">Khi có người muốn kết bạn, họ sẽ xuất hiện ở đây</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((request, index) => {
                    const profile = request.requester;
                    return (
                      <motion.div
                        key={request.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-amber-50/50 to-yellow-50/50 dark:from-amber-950/20 dark:to-yellow-950/20 border border-amber-200/50 dark:border-amber-800/30"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12 ring-2 ring-amber-200">
                            <AvatarImage src={profile?.avatar_url || ""} />
                            <AvatarFallback className="bg-gradient-to-br from-amber-400 to-yellow-500 text-white font-medium">
                              {getInitials(profile?.display_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-foreground">
                              {profile?.display_name || "Người dùng"}
                            </p>
                            <p className="text-xs text-amber-600 dark:text-amber-400">Muốn kết bạn với bạn 💫</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => acceptFriendRequest(request.id)}
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            Chấp nhận
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rejectFriendRequest(request.id)}
                            className="border-rose-300 text-rose-600 hover:bg-rose-50"
                          >
                            Từ chối
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Sent Requests Tab */}
            <TabsContent value="sent" className="space-y-3">
              {sentRequests.length === 0 ? (
                <div className="text-center py-12">
                  <UserPlus className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-foreground font-medium mb-2">Chưa gửi lời mời nào</p>
                  <p className="text-muted-foreground text-sm">Tìm kiếm bạn bè và gửi lời mời kết bạn</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sentRequests.map((request, index) => {
                    const profile = request.addressee;
                    return (
                      <motion.div
                        key={request.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200/50 dark:border-blue-800/30"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12 ring-2 ring-blue-200">
                            <AvatarImage src={profile?.avatar_url || ""} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-500 text-white font-medium">
                              {getInitials(profile?.display_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-foreground">
                              {profile?.display_name || "Người dùng"}
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-400">Đang chờ phản hồi...</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => cancelFriendRequest(request.id)}
                          className="border-blue-300 text-blue-600 hover:bg-blue-50"
                        >
                          Hủy lời mời
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Search Tab */}
            <TabsContent value="search" className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Tìm kiếm theo tên..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="border-border focus:border-primary"
                />
                <Button
                  onClick={handleSearch}
                  disabled={searching || !searchQuery.trim()}
                  className="bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>

              {searching ? (
                <div className="text-center py-12">
                  <Sparkles className="w-8 h-8 text-rose-400 animate-spin mx-auto" />
                  <p className="text-muted-foreground mt-2">Đang tìm kiếm...</p>
                </div>
              ) : searchResults.length === 0 && searchQuery ? (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-foreground font-medium mb-2">Không tìm thấy người dùng nào</p>
                  <p className="text-muted-foreground text-sm">Thử tìm với tên khác</p>
                </div>
              ) : !searchQuery ? (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-foreground font-medium mb-2">Tìm kiếm bạn bè</p>
                  <p className="text-muted-foreground text-sm">Nhập tên để tìm người dùng</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {searchResults.map((profile, index) => (
                    <motion.div
                      key={profile.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-violet-50/50 to-purple-50/50 dark:from-violet-950/20 dark:to-purple-950/20 border border-violet-200/50 dark:border-violet-800/30"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12 ring-2 ring-violet-200">
                          <AvatarImage src={profile.avatar_url || ""} />
                          <AvatarFallback className="bg-gradient-to-br from-violet-400 to-purple-500 text-white font-medium">
                            {getInitials(profile.display_name)}
                          </AvatarFallback>
                        </Avatar>
                        <p className="font-semibold text-foreground">
                          {profile.display_name || "Người dùng"}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleSendRequest(profile.id)}
                        disabled={sendingTo === profile.id}
                        className="bg-gradient-to-r from-pink-400 to-rose-500 hover:from-pink-500 hover:to-rose-600 text-white"
                      >
                        {sendingTo === profile.id ? (
                          <Sparkles className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4 mr-1" />
                            Kết bạn
                          </>
                        )}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.main>

      {/* Blocked Users List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-4xl mx-auto px-4 pb-8"
      >
        <BlockedUsersList />
      </motion.div>

      {/* Private Chat */}
      <PrivateChat 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)}
      />

      {/* Block User Dialog */}
      <BlockUserDialog
        isOpen={blockDialogOpen}
        onClose={() => {
          setBlockDialogOpen(false);
          setUserToBlock(null);
        }}
        onConfirm={confirmBlockUser}
        userName={userToBlock?.name || ""}
      />

      {/* Report User Dialog */}
      <ReportUserDialog
        isOpen={reportDialogOpen}
        onClose={() => {
          setReportDialogOpen(false);
          setUserToReport(null);
        }}
        userId={userToReport?.id || ""}
        userName={userToReport?.name || ""}
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
    </div>
  );
};

export default Friends;
