import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Profile } from './useFriendships';

export interface SuggestedFriend extends Profile {
  reason: string;
  score: number;
  mutual_friends_count?: number;
  shared_interests?: string[];
}

export const useFriendSuggestions = () => {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<SuggestedFriend[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSuggestions = useCallback(async () => {
    if (!user) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Get current user's friends
      const { data: friendships } = await supabase
        .from('friendships')
        .select('requester_id, addressee_id')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .eq('status', 'accepted');

      const friendIds = new Set<string>();
      (friendships || []).forEach(f => {
        if (f.requester_id === user.id) friendIds.add(f.addressee_id);
        else friendIds.add(f.requester_id);
      });

      // Get pending/sent requests
      const { data: pendingData } = await supabase
        .from('friendships')
        .select('requester_id, addressee_id')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .in('status', ['pending', 'rejected']);

      const pendingIds = new Set<string>();
      (pendingData || []).forEach(f => {
        if (f.requester_id === user.id) pendingIds.add(f.addressee_id);
        else pendingIds.add(f.requester_id);
      });

      // Get blocked users
      const { data: blockedData } = await supabase
        .from('blocked_users')
        .select('blocked_id, blocker_id')
        .or(`blocker_id.eq.${user.id},blocked_id.eq.${user.id}`);

      const blockedIds = new Set<string>();
      (blockedData || []).forEach(b => {
        if (b.blocker_id === user.id) blockedIds.add(b.blocked_id);
        if (b.blocked_id === user.id) blockedIds.add(b.blocker_id);
      });

      // Get users with private profiles
      const { data: privateProfiles } = await supabase
        .from('privacy_settings')
        .select('user_id')
        .eq('profile_visibility', 'nobody');

      const privateIds = new Set((privateProfiles || []).map(p => p.user_id));

      // Get current user's testimonial tags for interest matching
      const { data: userTestimonial } = await supabase
        .from('testimonials')
        .select('tags')
        .eq('user_id', user.id)
        .maybeSingle();

      const userTags = new Set(userTestimonial?.tags || []);

      // Get active users with profiles (ordered by recent activity)
      const { data: activeProfiles } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, created_at')
        .not('id', 'eq', user.id)
        .not('display_name', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(100);

      if (!activeProfiles) {
        setSuggestions([]);
        setLoading(false);
        return;
      }

      // Filter out existing friends, pending, blocked, and private
      const eligibleProfiles = activeProfiles.filter(p => 
        !friendIds.has(p.id) && 
        !pendingIds.has(p.id) && 
        !blockedIds.has(p.id) &&
        !privateIds.has(p.id)
      );

      // Get testimonials for eligible users to match interests
      const eligibleIds = eligibleProfiles.map(p => p.id);
      const { data: testimonials } = await supabase
        .from('testimonials')
        .select('user_id, tags')
        .in('user_id', eligibleIds)
        .eq('is_approved', true);

      const userTagsMap = new Map<string, string[]>();
      (testimonials || []).forEach(t => {
        userTagsMap.set(t.user_id, t.tags || []);
      });

      // Get presence data
      const { data: presenceData } = await supabase
        .from('user_presence')
        .select('user_id, is_online')
        .in('user_id', eligibleIds);

      const onlineMap = new Map<string, boolean>();
      (presenceData || []).forEach(p => {
        onlineMap.set(p.user_id, p.is_online);
      });

      // Get friends of friends (mutual connections)
      const mutualFriendsMap = new Map<string, number>();
      for (const friendId of friendIds) {
        const { data: friendOfFriends } = await supabase
          .from('friendships')
          .select('requester_id, addressee_id')
          .or(`requester_id.eq.${friendId},addressee_id.eq.${friendId}`)
          .eq('status', 'accepted');

        (friendOfFriends || []).forEach(ff => {
          const otherId = ff.requester_id === friendId ? ff.addressee_id : ff.requester_id;
          if (otherId !== user.id && !friendIds.has(otherId)) {
            mutualFriendsMap.set(otherId, (mutualFriendsMap.get(otherId) || 0) + 1);
          }
        });
      }

      // Score and rank suggestions
      const scoredSuggestions: SuggestedFriend[] = eligibleProfiles.map(profile => {
        let score = 0;
        let reason = '';
        const sharedInterests: string[] = [];

        // Mutual friends bonus (highest priority)
        const mutualCount = mutualFriendsMap.get(profile.id) || 0;
        if (mutualCount > 0) {
          score += mutualCount * 30;
          reason = `${mutualCount} bạn chung`;
        }

        // Shared interests bonus
        const theirTags = userTagsMap.get(profile.id) || [];
        theirTags.forEach(tag => {
          if (userTags.has(tag)) {
            score += 20;
            sharedInterests.push(tag);
          }
        });

        if (sharedInterests.length > 0 && !reason) {
          reason = `Cùng quan tâm: ${sharedInterests.slice(0, 2).join(', ')}`;
        }

        // Online bonus
        if (onlineMap.get(profile.id)) {
          score += 10;
          if (!reason) reason = 'Đang hoạt động';
        }

        // Has testimonial bonus
        if (theirTags.length > 0) {
          score += 5;
          if (!reason) reason = 'Đã chia sẻ nhân chứng';
        }

        // New user bonus (created within last 7 days)
        const createdAt = new Date(profile.created_at);
        const daysSinceCreated = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceCreated < 7) {
          score += 15;
          if (!reason) reason = 'Thành viên mới';
        }

        // Default reason
        if (!reason) reason = 'Gợi ý cho bạn';

        return {
          ...profile,
          is_online: onlineMap.get(profile.id) || false,
          reason,
          score,
          mutual_friends_count: mutualCount,
          shared_interests: sharedInterests,
        };
      });

      // Sort by score and take top 10
      scoredSuggestions.sort((a, b) => b.score - a.score);
      setSuggestions(scoredSuggestions.slice(0, 10));
    } catch (error) {
      console.error('Error fetching friend suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  return {
    suggestions,
    loading,
    refetch: fetchSuggestions,
  };
};
