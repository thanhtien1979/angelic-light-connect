import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Medal, 
  Award, 
  Coins, 
  Heart, 
  Wind, 
  Sparkles,
  Crown,
  Star,
  User,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

interface LeaderboardUser {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  score: number;
}

type LeaderboardCategory = 'coins' | 'meditation' | 'moments' | 'likes';

export const CommunityLeaderboard = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState<LeaderboardCategory>('coins');
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [category]);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      let leaderboardData: LeaderboardUser[] = [];

      switch (category) {
        case 'coins':
          const { data: coinsData } = await supabase
            .from('user_camly_coins')
            .select('user_id, lifetime_coins')
            .order('lifetime_coins', { ascending: false })
            .limit(20);

          if (coinsData) {
            const userIds = coinsData.map(c => c.user_id);
            const { data: profiles } = await supabase
              .from('profiles')
              .select('id, display_name, avatar_url')
              .in('id', userIds);

            leaderboardData = coinsData.map(c => {
              const profile = profiles?.find(p => p.id === c.user_id);
              return {
                id: c.user_id,
                display_name: profile?.display_name,
                avatar_url: profile?.avatar_url,
                score: c.lifetime_coins
              };
            });
          }
          break;

        case 'meditation':
          const { data: meditationData } = await supabase
            .from('meditation_history')
            .select('user_id, duration_seconds');

          if (meditationData) {
            const grouped: Record<string, number> = {};
            meditationData.forEach(m => {
              grouped[m.user_id] = (grouped[m.user_id] || 0) + m.duration_seconds;
            });

            const sorted = Object.entries(grouped)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 20);

            const userIds = sorted.map(([id]) => id);
            const { data: profiles } = await supabase
              .from('profiles')
              .select('id, display_name, avatar_url')
              .in('id', userIds);

            leaderboardData = sorted.map(([userId, score]) => {
              const profile = profiles?.find(p => p.id === userId);
              return {
                id: userId,
                display_name: profile?.display_name,
                avatar_url: profile?.avatar_url,
                score: Math.round(score / 60) // Convert to minutes
              };
            });
          }
          break;

        case 'moments':
          const { data: momentsData } = await supabase
            .from('shared_light_moments')
            .select('user_id');

          if (momentsData) {
            const grouped: Record<string, number> = {};
            momentsData.forEach(m => {
              grouped[m.user_id] = (grouped[m.user_id] || 0) + 1;
            });

            const sorted = Object.entries(grouped)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 20);

            const userIds = sorted.map(([id]) => id);
            const { data: profiles } = await supabase
              .from('profiles')
              .select('id, display_name, avatar_url')
              .in('id', userIds);

            leaderboardData = sorted.map(([userId, score]) => {
              const profile = profiles?.find(p => p.id === userId);
              return {
                id: userId,
                display_name: profile?.display_name,
                avatar_url: profile?.avatar_url,
                score
              };
            });
          }
          break;

        case 'likes':
          const { data: likesData } = await supabase
            .from('shared_light_moments')
            .select('user_id, likes_count');

          if (likesData) {
            const grouped: Record<string, number> = {};
            likesData.forEach(m => {
              grouped[m.user_id] = (grouped[m.user_id] || 0) + m.likes_count;
            });

            const sorted = Object.entries(grouped)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 20);

            const userIds = sorted.map(([id]) => id);
            const { data: profiles } = await supabase
              .from('profiles')
              .select('id, display_name, avatar_url')
              .in('id', userIds);

            leaderboardData = sorted.map(([userId, score]) => {
              const profile = profiles?.find(p => p.id === userId);
              return {
                id: userId,
                display_name: profile?.display_name,
                avatar_url: profile?.avatar_url,
                score
              };
            });
          }
          break;
      }

      setUsers(leaderboardData);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-muted-foreground font-bold w-6 text-center">{rank}</span>;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/50';
      case 2:
        return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/50';
      case 3:
        return 'bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-amber-600/50';
      default:
        return 'bg-muted/30 border-border/50';
    }
  };

  const getCategoryIcon = () => {
    switch (category) {
      case 'coins':
        return <Coins className="h-4 w-4" />;
      case 'meditation':
        return <Wind className="h-4 w-4" />;
      case 'moments':
        return <Sparkles className="h-4 w-4" />;
      case 'likes':
        return <Heart className="h-4 w-4" />;
    }
  };

  const getCategoryUnit = () => {
    switch (category) {
      case 'coins':
        return 'Camly';
      case 'meditation':
        return 'phút';
      case 'moments':
        return 'khoảnh khắc';
      case 'likes':
        return 'lượt thích';
    }
  };

  return (
    <Card className="bg-background/60 backdrop-blur-xl border-primary/20 overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Trophy className="h-6 w-6 text-yellow-500" />
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Bảng Xếp Hạng
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs value={category} onValueChange={(v) => setCategory(v as LeaderboardCategory)}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="coins" className="gap-1 text-xs">
              <Coins className="h-3 w-3" />
              <span className="hidden sm:inline">Camly</span>
            </TabsTrigger>
            <TabsTrigger value="meditation" className="gap-1 text-xs">
              <Wind className="h-3 w-3" />
              <span className="hidden sm:inline">Thiền</span>
            </TabsTrigger>
            <TabsTrigger value="moments" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3" />
              <span className="hidden sm:inline">Chia sẻ</span>
            </TabsTrigger>
            <TabsTrigger value="likes" className="gap-1 text-xs">
              <Heart className="h-3 w-3" />
              <span className="hidden sm:inline">Yêu thích</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={category} className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Star className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Chưa có dữ liệu</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {users.map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer hover:scale-[1.02] transition-all ${getRankStyle(index + 1)}`}
                      onClick={() => navigate(`/user/${user.id}`)}
                    >
                      <div className="flex items-center justify-center w-8">
                        {getRankIcon(index + 1)}
                      </div>

                      <Avatar className={`h-10 w-10 ${index < 3 ? 'ring-2 ring-primary/50' : ''}`}>
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20">
                          <User className="h-5 w-5 text-primary" />
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {user.display_name || 'Linh hồn ẩn danh'}
                        </p>
                      </div>

                      <Badge variant="secondary" className="gap-1 shrink-0">
                        {getCategoryIcon()}
                        <span className="font-bold">{user.score.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground hidden sm:inline">
                          {getCategoryUnit()}
                        </span>
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
