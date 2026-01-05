import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type MemoryType = 'preference' | 'milestone' | 'interest' | 'struggle' | 'goal' | 'personal';

export interface UserMemory {
  id: string;
  user_id: string;
  memory_type: MemoryType;
  memory_key: string;
  memory_value: string;
  context?: string | null;
  importance_score: number;
  last_referenced_at?: string | null;
  created_at: string;
  updated_at: string;
}

export const useUserMemory = () => {
  const { user } = useAuth();
  const [memories, setMemories] = useState<UserMemory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMemories = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_memory')
        .select('*')
        .eq('user_id', user.id)
        .order('importance_score', { ascending: false });

      if (error) throw error;
      setMemories((data || []) as UserMemory[]);
    } catch (error) {
      console.error('Error fetching memories:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  const addMemory = async (
    memoryType: UserMemory['memory_type'],
    key: string,
    value: string,
    context?: string,
    importanceScore = 5
  ) => {
    if (!user) return null;

    try {
      // Check if memory with same key exists
      const existing = memories.find(
        m => m.memory_type === memoryType && m.memory_key === key
      );

      if (existing) {
        // Update existing memory
        const { data, error } = await supabase
          .from('user_memory')
          .update({
            memory_value: value,
            context,
            importance_score: importanceScore,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        await fetchMemories();
        return data;
      } else {
        // Create new memory
        const { data, error } = await supabase
          .from('user_memory')
          .insert({
            user_id: user.id,
            memory_type: memoryType,
            memory_key: key,
            memory_value: value,
            context,
            importance_score: importanceScore
          })
          .select()
          .single();

        if (error) throw error;
        await fetchMemories();
        return data;
      }
    } catch (error) {
      console.error('Error adding memory:', error);
      return null;
    }
  };

  const deleteMemory = async (memoryId: string) => {
    try {
      const { error } = await supabase
        .from('user_memory')
        .delete()
        .eq('id', memoryId);

      if (error) throw error;
      await fetchMemories();
      return true;
    } catch (error) {
      console.error('Error deleting memory:', error);
      return false;
    }
  };

  const getMemoriesForContext = useCallback(() => {
    // Format memories for AI context
    const grouped = memories.reduce((acc, memory) => {
      if (!acc[memory.memory_type]) {
        acc[memory.memory_type] = [];
      }
      acc[memory.memory_type].push(memory);
      return acc;
    }, {} as Record<string, UserMemory[]>);

    let context = '';

    if (grouped.personal?.length) {
      context += '\n[Thông tin cá nhân]\n';
      grouped.personal.forEach(m => {
        context += `- ${m.memory_key}: ${m.memory_value}\n`;
      });
    }

    if (grouped.preference?.length) {
      context += '\n[Sở thích & Thói quen]\n';
      grouped.preference.forEach(m => {
        context += `- ${m.memory_key}: ${m.memory_value}\n`;
      });
    }

    if (grouped.goal?.length) {
      context += '\n[Mục tiêu]\n';
      grouped.goal.forEach(m => {
        context += `- ${m.memory_key}: ${m.memory_value}\n`;
      });
    }

    if (grouped.struggle?.length) {
      context += '\n[Khó khăn đang đối mặt]\n';
      grouped.struggle.forEach(m => {
        context += `- ${m.memory_key}: ${m.memory_value}\n`;
      });
    }

    if (grouped.milestone?.length) {
      context += '\n[Cột mốc đã đạt được]\n';
      grouped.milestone.forEach(m => {
        context += `- ${m.memory_key}: ${m.memory_value}\n`;
      });
    }

    if (grouped.interest?.length) {
      context += '\n[Chủ đề quan tâm]\n';
      grouped.interest.forEach(m => {
        context += `- ${m.memory_key}: ${m.memory_value}\n`;
      });
    }

    return context;
  }, [memories]);

  const getUserDisplayName = useCallback(() => {
    const nameMemory = memories.find(
      m => m.memory_type === 'personal' && m.memory_key === 'name'
    );
    return nameMemory?.memory_value || null;
  }, [memories]);

  return {
    memories,
    isLoading,
    addMemory,
    deleteMemory,
    getMemoriesForContext,
    getUserDisplayName,
    refetch: fetchMemories
  };
};
