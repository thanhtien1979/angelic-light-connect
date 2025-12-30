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
        return <Crown className="h-6 w-6 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" />;
      case 2:
        return <Medal className="h-5 w-5 text-pink-300 drop-shadow-[0_0_6px_rgba(244,114,182,0.6)]" />;
      case 3:
        return <Award className="h-5 w-5 text-rose-400 drop-shadow-[0_0_6px_rgba(251,113,133,0.6)]" />;
      default:
        return <span className="text-pink-300/80 font-bold w-6 text-center text-sm">{rank}</span>;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/30 via-pink-500/20 to-rose-500/30 border-yellow-400/60 shadow-[0_0_20px_rgba(250,204,21,0.3)]';
      case 2:
        return 'bg-gradient-to-r from-pink-400/25 to-rose-400/25 border-pink-400/50 shadow-[0_0_15px_rgba(244,114,182,0.2)]';
      case 3:
        return 'bg-gradient-to-r from-rose-400/20 to-pink-400/20 border-rose-400/40 shadow-[0_0_12px_rgba(251,113,133,0.2)]';
      default:
        return 'bg-gradient-to-r from-pink-950/40 to-rose-950/40 border-pink-500/20 hover:border-pink-400/40';
    }
  };

  const getCategoryIcon = () => {
    switch (category) {
      case 'coins':
        return <Coins className="h-4 w-4 text-pink-400" />;
      case 'meditation':
        return <Wind className="h-4 w-4 text-pink-400" />;
      case 'moments':
        return <Sparkles className="h-4 w-4 text-pink-400" />;
      case 'likes':
        return <Heart className="h-4 w-4 text-pink-400" />;
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
    <Card className="relative overflow-hidden bg-gradient-to-br from-pink-950/80 via-rose-950/70 to-fuchsia-950/80 backdrop-blur-xl border-pink-500/30 shadow-[0_0_40px_rgba(236,72,153,0.15)]">
      {/* Decorative glow effects */}
      <div className="absolute top-0 left-1/4 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-rose-500/15 rounded-full blur-3xl" />
      <div className="absolute top-1/2 right-0 w-24 h-24 bg-fuchsia-500/20 rounded-full blur-2xl" />
      
      <CardHeader className="pb-4 relative z-10">
        <CardTitle className="flex items-center justify-center gap-3">
          <motion.div
            animate={{ 
              rotate: [0, -10, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3
            }}
          >
            <Trophy className="h-8 w-8 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]" />
          </motion.div>
          <span className="text-2xl font-bold bg-gradient-to-r from-pink-300 via-rose-300 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(244,114,182,0.5)]">
            HONOR BOARD
          </span>
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3
            }}
          >
            <Trophy className="h-8 w-8 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]" />
          </motion.div>
        </CardTitle>
        <p className="text-center text-pink-300/70 text-sm mt-1">Vinh danh những Thiên Thần xuất sắc</p>
      </CardHeader>

      <CardContent className="space-y-4 relative z-10">
        <Tabs value={category} onValueChange={(v) => setCategory(v as LeaderboardCategory)}>
          <TabsList className="grid grid-cols-4 w-full bg-pink-950/50 border border-pink-500/20">
            <TabsTrigger 
              value="coins" 
              className="gap-1 text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500/40 data-[state=active]:to-rose-500/40 data-[state=active]:text-pink-100 data-[state=active]:border-pink-400/50 text-pink-300/70 hover:text-pink-200"
            >
              <Coins className="h-3 w-3" />
              <span className="hidden sm:inline">Camly</span>
            </TabsTrigger>
            <TabsTrigger 
              value="meditation" 
              className="gap-1 text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500/40 data-[state=active]:to-rose-500/40 data-[state=active]:text-pink-100 data-[state=active]:border-pink-400/50 text-pink-300/70 hover:text-pink-200"
            >
              <Wind className="h-3 w-3" />
              <span className="hidden sm:inline">Thiền</span>
            </TabsTrigger>
            <TabsTrigger 
              value="moments" 
              className="gap-1 text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500/40 data-[state=active]:to-rose-500/40 data-[state=active]:text-pink-100 data-[state=active]:border-pink-400/50 text-pink-300/70 hover:text-pink-200"
            >
              <Sparkles className="h-3 w-3" />
              <span className="hidden sm:inline">Chia sẻ</span>
            </TabsTrigger>
            <TabsTrigger 
              value="likes" 
              className="gap-1 text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500/40 data-[state=active]:to-rose-500/40 data-[state=active]:text-pink-100 data-[state=active]:border-pink-400/50 text-pink-300/70 hover:text-pink-200"
            >
              <Heart className="h-3 w-3" />
              <span className="hidden sm:inline">Yêu thích</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={category} className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-pink-400" />
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-12 text-pink-300/60">
                  <Star className="h-12 w-12 mx-auto mb-2 opacity-50 text-pink-400" />
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
                      whileHover={{ scale: 1.02, x: 5 }}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-300 ${getRankStyle(index + 1)}`}
                      onClick={() => navigate(`/user/${user.id}`)}
                    >
                      <div className="flex items-center justify-center w-8">
                        {getRankIcon(index + 1)}
                      </div>

                      <Avatar className={`h-10 w-10 ${index < 3 ? 'ring-2 ring-pink-400/60 shadow-[0_0_10px_rgba(244,114,182,0.4)]' : 'ring-1 ring-pink-500/30'}`}>
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-pink-500/30 to-rose-500/30 text-pink-200">
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-pink-100">
                          {user.display_name || 'Thiên Thần ẩn danh'}
                        </p>
                      </div>

                      <Badge 
                        variant="secondary" 
                        className="gap-1 shrink-0 bg-gradient-to-r from-pink-500/30 to-rose-500/30 border-pink-400/40 text-pink-100"
                      >
                        {getCategoryIcon()}
                        <span className="font-bold">{user.score.toLocaleString()}</span>
                        <span className="text-xs text-pink-300/70 hidden sm:inline">
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
