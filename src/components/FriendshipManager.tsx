import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, UserPlus, Search, Check, X, 
  Heart, Clock, Send, UserMinus, Sparkles, Circle, MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFriendships, Profile } from '@/hooks/useFriendships';
import { useAuth } from '@/hooks/useAuth';

const FriendshipManager = () => {
  const { user } = useAuth();
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

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);
  const [sendingTo, setSendingTo] = useState<string | null>(null);

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
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getFriendProfile = (friendship: any) => {
    return friendship.requester || friendship.addressee;
  };

  if (!user) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-rose-200">
        <CardContent className="p-8 text-center">
          <Users className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <p className="text-rose-700 font-medium">
            Vui lòng đăng nhập để sử dụng tính năng kết bạn
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-xl">
      <CardHeader className="border-b border-rose-100">
        <CardTitle className="flex items-center gap-2 text-rose-800">
          <Heart className="w-6 h-6 text-pink-500" />
          <span className="font-bold">Bạn Bè Ánh Sáng</span>
          {pendingRequests.length > 0 && (
            <Badge className="bg-pink-500 text-white ml-2">
              {pendingRequests.length} mới
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
        <Tabs defaultValue="friends" className="w-full">
          <TabsList className="w-full grid grid-cols-4 bg-rose-100/50 mb-4">
            <TabsTrigger value="friends" className="text-xs sm:text-sm data-[state=active]:bg-white">
              <Users className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Bạn bè</span>
              <span className="sm:hidden">BB</span>
              {friends.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {friends.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pending" className="text-xs sm:text-sm data-[state=active]:bg-white">
              <Clock className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Chờ duyệt</span>
              <span className="sm:hidden">CD</span>
              {pendingRequests.length > 0 && (
                <Badge className="ml-1 text-xs bg-pink-500">
                  {pendingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent" className="text-xs sm:text-sm data-[state=active]:bg-white">
              <Send className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Đã gửi</span>
              <span className="sm:hidden">ĐG</span>
              {sentRequests.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {sentRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="search" className="text-xs sm:text-sm data-[state=active]:bg-white">
              <UserPlus className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Tìm kiếm</span>
              <span className="sm:hidden">TK</span>
            </TabsTrigger>
          </TabsList>

          {/* Friends Tab */}
          <TabsContent value="friends" className="space-y-3">
            {loading ? (
              <div className="text-center py-8">
                <Sparkles className="w-8 h-8 text-rose-400 animate-spin mx-auto" />
                <p className="text-rose-600 mt-2">Đang tải...</p>
              </div>
            ) : friends.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-rose-300 mx-auto mb-3" />
                <p className="text-rose-600">Chưa có bạn bè nào</p>
                <p className="text-rose-400 text-sm">Tìm và kết bạn với những người bạn ánh sáng!</p>
              </div>
            ) : (
              <AnimatePresence>
                {friends.map((friendship) => {
                  const profile = getFriendProfile(friendship);
                  return (
                    <motion.div
                      key={friendship.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="w-10 h-10 ring-2 ring-pink-300">
                            <AvatarImage src={profile?.avatar_url || ''} />
                            <AvatarFallback className="bg-gradient-to-br from-rose-400 to-pink-500 text-white">
                              {getInitials(profile?.display_name)}
                            </AvatarFallback>
                          </Avatar>
                          {profile?.is_online && (
                            <Circle className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 fill-green-400 text-green-400 ring-2 ring-white" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-rose-800">
                            {profile?.display_name || 'Người dùng'}
                          </p>
                          <p className="text-xs text-rose-500">
                            {profile?.is_online ? '🟢 Online' : 'Bạn bè ánh sáng ✨'}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => unfriend(friendship.id)}
                        className="text-rose-400 hover:text-rose-600 hover:bg-rose-100"
                      >
                        <UserMinus className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </TabsContent>

          {/* Pending Requests Tab */}
          <TabsContent value="pending" className="space-y-3">
            {pendingRequests.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-rose-300 mx-auto mb-3" />
                <p className="text-rose-600">Không có lời mời chờ duyệt</p>
              </div>
            ) : (
              <AnimatePresence>
                {pendingRequests.map((request) => {
                  const profile = request.requester;
                  return (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 ring-2 ring-amber-300">
                          <AvatarImage src={profile?.avatar_url || ''} />
                          <AvatarFallback className="bg-gradient-to-br from-amber-400 to-yellow-500 text-white">
                            {getInitials(profile?.display_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-amber-800">
                            {profile?.display_name || 'Người dùng'}
                          </p>
                          <p className="text-xs text-amber-600">Muốn kết bạn với bạn 💫</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => acceptFriendRequest(request.id)}
                          className="bg-green-500 hover:bg-green-600 text-white"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rejectFriendRequest(request.id)}
                          className="border-rose-300 text-rose-600 hover:bg-rose-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </TabsContent>

          {/* Sent Requests Tab */}
          <TabsContent value="sent" className="space-y-3">
            {sentRequests.length === 0 ? (
              <div className="text-center py-8">
                <Send className="w-12 h-12 text-rose-300 mx-auto mb-3" />
                <p className="text-rose-600">Chưa gửi lời mời nào</p>
              </div>
            ) : (
              <AnimatePresence>
                {sentRequests.map((request) => {
                  const profile = request.addressee;
                  return (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 ring-2 ring-blue-300">
                          <AvatarImage src={profile?.avatar_url || ''} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-500 text-white">
                            {getInitials(profile?.display_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-blue-800">
                            {profile?.display_name || 'Người dùng'}
                          </p>
                          <p className="text-xs text-blue-600">Đang chờ phản hồi...</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => cancelFriendRequest(request.id)}
                        className="border-blue-300 text-blue-600 hover:bg-blue-50"
                      >
                        Hủy
                      </Button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search" className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Tìm kiếm theo tên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="border-rose-200 focus:border-pink-400"
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
              <div className="text-center py-8">
                <Sparkles className="w-8 h-8 text-rose-400 animate-spin mx-auto" />
                <p className="text-rose-600 mt-2">Đang tìm kiếm...</p>
              </div>
            ) : searchResults.length === 0 && searchQuery ? (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-rose-300 mx-auto mb-3" />
                <p className="text-rose-600">Không tìm thấy người dùng nào</p>
              </div>
            ) : (
              <AnimatePresence>
                {searchResults.map((profile) => (
                  <motion.div
                    key={profile.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 ring-2 ring-violet-300">
                        <AvatarImage src={profile.avatar_url || ''} />
                        <AvatarFallback className="bg-gradient-to-br from-violet-400 to-purple-500 text-white">
                          {getInitials(profile.display_name)}
                        </AvatarFallback>
                      </Avatar>
                      <p className="font-semibold text-violet-800">
                        {profile.display_name || 'Người dùng'}
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
              </AnimatePresence>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FriendshipManager;
