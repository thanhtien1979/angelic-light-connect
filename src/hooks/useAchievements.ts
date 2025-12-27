import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'meditation' | 'breathing' | 'social' | 'reflection' | 'general';
  requirement: number;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
}

export const ACHIEVEMENTS: Achievement[] = [
  // Meditation achievements
  { id: 'meditation_1', name: 'Người mới bắt đầu', description: 'Hoàn thành 1 phiên thiền định', icon: '🧘', category: 'meditation', requirement: 1, tier: 'bronze' },
  { id: 'meditation_5', name: 'Tâm hồn yên bình', description: 'Hoàn thành 5 phiên thiền định', icon: '🧘‍♀️', category: 'meditation', requirement: 5, tier: 'silver' },
  { id: 'meditation_25', name: 'Thiền sư', description: 'Hoàn thành 25 phiên thiền định', icon: '🪷', category: 'meditation', requirement: 25, tier: 'gold' },
  { id: 'meditation_100', name: 'Đại sư thiền định', description: 'Hoàn thành 100 phiên thiền định', icon: '✨', category: 'meditation', requirement: 100, tier: 'diamond' },
  
  // Breathing achievements
  { id: 'breathing_1', name: 'Hơi thở đầu tiên', description: 'Hoàn thành 1 bài tập thở', icon: '💨', category: 'breathing', requirement: 1, tier: 'bronze' },
  { id: 'breathing_10', name: 'Kiểm soát hơi thở', description: 'Hoàn thành 10 bài tập thở', icon: '🌬️', category: 'breathing', requirement: 10, tier: 'silver' },
  { id: 'breathing_50', name: 'Bậc thầy hơi thở', description: 'Hoàn thành 50 bài tập thở', icon: '🌊', category: 'breathing', requirement: 50, tier: 'gold' },
  
  // Social achievements
  { id: 'followers_5', name: 'Ánh sáng lan tỏa', description: 'Có 5 người theo dõi', icon: '👥', category: 'social', requirement: 5, tier: 'bronze' },
  { id: 'followers_25', name: 'Người truyền cảm hứng', description: 'Có 25 người theo dõi', icon: '🌟', category: 'social', requirement: 25, tier: 'silver' },
  { id: 'followers_100', name: 'Ngôi sao cộng đồng', description: 'Có 100 người theo dõi', icon: '⭐', category: 'social', requirement: 100, tier: 'gold' },
  { id: 'friends_3', name: 'Kết nối đầu tiên', description: 'Có 3 bạn bè', icon: '🤝', category: 'social', requirement: 3, tier: 'bronze' },
  { id: 'friends_10', name: 'Vòng tròn ánh sáng', description: 'Có 10 bạn bè', icon: '💫', category: 'social', requirement: 10, tier: 'silver' },
  
  // Reflection achievements
  { id: 'reflection_1', name: 'Suy ngẫm đầu tiên', description: 'Viết 1 ghi chú suy ngẫm', icon: '📝', category: 'reflection', requirement: 1, tier: 'bronze' },
  { id: 'reflection_10', name: 'Người suy tư', description: 'Viết 10 ghi chú suy ngẫm', icon: '📓', category: 'reflection', requirement: 10, tier: 'silver' },
  { id: 'reflection_50', name: 'Triết gia', description: 'Viết 50 ghi chú suy ngẫm', icon: '📚', category: 'reflection', requirement: 50, tier: 'gold' },
  
  // General achievements
  { id: 'coins_1000', name: 'Người sưu tầm ánh sáng', description: 'Tích lũy 1,000 Camly Coins', icon: '💰', category: 'general', requirement: 1000, tier: 'bronze' },
  { id: 'coins_10000', name: 'Kho báu ánh sáng', description: 'Tích lũy 10,000 Camly Coins', icon: '💎', category: 'general', requirement: 10000, tier: 'silver' },
  { id: 'coins_100000', name: 'Tỷ phú ánh sáng', description: 'Tích lũy 100,000 Camly Coins', icon: '👑', category: 'general', requirement: 100000, tier: 'gold' },
  { id: 'moments_5', name: 'Người chia sẻ', description: 'Chia sẻ 5 khoảnh khắc', icon: '🌈', category: 'social', requirement: 5, tier: 'bronze' },
  { id: 'moments_25', name: 'Người lan tỏa', description: 'Chia sẻ 25 khoảnh khắc', icon: '🎯', category: 'social', requirement: 25, tier: 'silver' },
];

export const useAchievements = (userId?: string) => {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    meditationCount: 0,
    breathingCount: 0,
    reflectionCount: 0,
    followersCount: 0,
    friendsCount: 0,
    coins: 0,
    momentsCount: 0,
  });

  // Fetch unlocked achievements
  const fetchUnlockedAchievements = useCallback(async () => {
    if (!targetUserId) return;
    
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', targetUserId);
      
      if (error) throw error;
      setUnlockedAchievements(data?.map(a => a.achievement_id) || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  }, [targetUserId]);

  // Fetch user stats for achievement calculation
  const fetchStats = useCallback(async () => {
    if (!targetUserId) return;
    
    try {
      const [
        meditationRes,
        breathingRes,
        reflectionRes,
        followersRes,
        friendsRes,
        coinsRes,
        momentsRes,
      ] = await Promise.all([
        supabase.from('meditation_history').select('id', { count: 'exact', head: true }).eq('user_id', targetUserId),
        supabase.from('breathing_session_history').select('id', { count: 'exact', head: true }).eq('user_id', targetUserId),
        supabase.from('reflection_notes').select('id', { count: 'exact', head: true }).eq('user_id', targetUserId),
        supabase.from('user_follows').select('id', { count: 'exact', head: true }).eq('following_id', targetUserId),
        supabase.from('friendships').select('id', { count: 'exact', head: true }).or(`requester_id.eq.${targetUserId},addressee_id.eq.${targetUserId}`).eq('status', 'accepted'),
        supabase.from('user_camly_coins').select('lifetime_coins').eq('user_id', targetUserId).single(),
        supabase.from('shared_light_moments').select('id', { count: 'exact', head: true }).eq('user_id', targetUserId),
      ]);

      setStats({
        meditationCount: meditationRes.count || 0,
        breathingCount: breathingRes.count || 0,
        reflectionCount: reflectionRes.count || 0,
        followersCount: followersRes.count || 0,
        friendsCount: friendsRes.count || 0,
        coins: coinsRes.data?.lifetime_coins || 0,
        momentsCount: momentsRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, [targetUserId]);

  // Check and unlock achievements
  const checkAndUnlockAchievements = useCallback(async () => {
    if (!user?.id || userId) return; // Only check for current user
    
    const achievementsToUnlock: string[] = [];
    
    ACHIEVEMENTS.forEach(achievement => {
      if (unlockedAchievements.includes(achievement.id)) return;
      
      let currentValue = 0;
      switch (achievement.id) {
        case 'meditation_1':
        case 'meditation_5':
        case 'meditation_25':
        case 'meditation_100':
          currentValue = stats.meditationCount;
          break;
        case 'breathing_1':
        case 'breathing_10':
        case 'breathing_50':
          currentValue = stats.breathingCount;
          break;
        case 'reflection_1':
        case 'reflection_10':
        case 'reflection_50':
          currentValue = stats.reflectionCount;
          break;
        case 'followers_5':
        case 'followers_25':
        case 'followers_100':
          currentValue = stats.followersCount;
          break;
        case 'friends_3':
        case 'friends_10':
          currentValue = stats.friendsCount;
          break;
        case 'coins_1000':
        case 'coins_10000':
        case 'coins_100000':
          currentValue = stats.coins;
          break;
        case 'moments_5':
        case 'moments_25':
          currentValue = stats.momentsCount;
          break;
      }
      
      if (currentValue >= achievement.requirement) {
        achievementsToUnlock.push(achievement.id);
      }
    });

    // Unlock new achievements
    for (const achievementId of achievementsToUnlock) {
      try {
        const { error } = await supabase
          .from('user_achievements')
          .insert({ user_id: user.id, achievement_id: achievementId });
        
        if (!error) {
          const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
          if (achievement) {
            toast.success(`🏆 Mở khóa thành tựu: ${achievement.name}!`, {
              description: achievement.description,
            });
          }
          setUnlockedAchievements(prev => [...prev, achievementId]);
        }
      } catch (error) {
        console.error('Error unlocking achievement:', error);
      }
    }
  }, [user?.id, userId, unlockedAchievements, stats]);

  useEffect(() => {
    fetchUnlockedAchievements();
    fetchStats();
  }, [fetchUnlockedAchievements, fetchStats]);

  useEffect(() => {
    if (!isLoading && stats.meditationCount > 0) {
      checkAndUnlockAchievements();
    }
  }, [isLoading, stats, checkAndUnlockAchievements]);

  const getAchievementProgress = (achievement: Achievement): number => {
    let currentValue = 0;
    switch (achievement.id) {
      case 'meditation_1':
      case 'meditation_5':
      case 'meditation_25':
      case 'meditation_100':
        currentValue = stats.meditationCount;
        break;
      case 'breathing_1':
      case 'breathing_10':
      case 'breathing_50':
        currentValue = stats.breathingCount;
        break;
      case 'reflection_1':
      case 'reflection_10':
      case 'reflection_50':
        currentValue = stats.reflectionCount;
        break;
      case 'followers_5':
      case 'followers_25':
      case 'followers_100':
        currentValue = stats.followersCount;
        break;
      case 'friends_3':
      case 'friends_10':
        currentValue = stats.friendsCount;
        break;
      case 'coins_1000':
      case 'coins_10000':
      case 'coins_100000':
        currentValue = stats.coins;
        break;
      case 'moments_5':
      case 'moments_25':
        currentValue = stats.momentsCount;
        break;
    }
    return Math.min((currentValue / achievement.requirement) * 100, 100);
  };

  return {
    achievements: ACHIEVEMENTS,
    unlockedAchievements,
    isLoading,
    stats,
    getAchievementProgress,
    isUnlocked: (id: string) => unlockedAchievements.includes(id),
  };
};
