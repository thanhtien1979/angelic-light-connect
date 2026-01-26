import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface NinePathStage {
  id: number;
  name_vi: string;
  name_en: string;
  description_vi: string;
  description_en: string;
  theme_color: string;
  icon: string;
  healing_focus: string | null;
  awakening_focus: string | null;
  service_focus: string | null;
}

export interface NinePathProfile {
  id: string;
  user_id: string;
  birth_date: string;
  onboarding_completed: boolean;
  onboarding_answers: Record<string, unknown> | null;
  current_stage: number;
  total_points: number;
  created_at: string;
  updated_at: string;
}

export interface NinePathDailyTask {
  id: string;
  user_id: string;
  stage_id: number;
  task_date: string;
  category: 'healing' | 'awakening' | 'service';
  task_title: string;
  task_description: string | null;
  is_completed: boolean;
  completed_at: string | null;
  verification_level: 'self_claim' | 'proof' | 'community_witness' | 'impact_verified';
  points_earned: number;
}

export interface NinePathTaskProof {
  id: string;
  task_id: string;
  user_id: string;
  proof_text: string | null;
  image_urls: string[];
  video_url: string | null;
  verification_level: 'self_claim' | 'proof' | 'community_witness' | 'impact_verified';
  community_votes: number;
  required_votes: number;
  is_verified: boolean;
  verified_at: string | null;
}

export interface OnboardingQuestion {
  id: string;
  question: string;
  options: { value: string; label: string; points: number }[];
}

// Calculate personal year based on 9-year cycle
export const calculatePersonalYear = (birthDate: Date): number => {
  const currentYear = new Date().getFullYear();
  const birthDay = birthDate.getDate();
  const birthMonth = birthDate.getMonth() + 1;
  
  // Personal Year = Current Year + Birth Day + Birth Month (reduced to single digit 1-9)
  let sum = currentYear + birthDay + birthMonth;
  
  // Reduce to single digit (1-9)
  while (sum > 9) {
    sum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
  }
  
  // Ensure result is between 1-9
  return sum === 0 ? 9 : sum;
};

// Onboarding questions for Nine Path
export const NINE_PATH_QUESTIONS: OnboardingQuestion[] = [
  {
    id: 'life_focus',
    question: 'Hiện tại, điều gì quan trọng nhất với bạn?',
    options: [
      { value: 'self', label: 'Khám phá bản thân', points: 1 },
      { value: 'relationships', label: 'Các mối quan hệ', points: 2 },
      { value: 'expression', label: 'Thể hiện sáng tạo', points: 3 },
      { value: 'stability', label: 'Sự ổn định', points: 4 },
    ],
  },
  {
    id: 'current_challenge',
    question: 'Thử thách lớn nhất bạn đang đối mặt?',
    options: [
      { value: 'change', label: 'Thay đổi & chuyển hóa', points: 5 },
      { value: 'responsibility', label: 'Trách nhiệm gia đình', points: 6 },
      { value: 'purpose', label: 'Tìm kiếm ý nghĩa', points: 7 },
      { value: 'abundance', label: 'Tài chính & thịnh vượng', points: 8 },
    ],
  },
  {
    id: 'spiritual_practice',
    question: 'Thực hành tâm linh nào bạn thường xuyên làm?',
    options: [
      { value: 'meditation', label: 'Thiền định', points: 7 },
      { value: 'service', label: 'Phụng sự cộng đồng', points: 6 },
      { value: 'creativity', label: 'Sáng tạo nghệ thuật', points: 3 },
      { value: 'none', label: 'Chưa có', points: 1 },
    ],
  },
  {
    id: 'healing_need',
    question: 'Khía cạnh nào bạn cần chữa lành nhất?',
    options: [
      { value: 'childhood', label: 'Tuổi thơ & inner child', points: 1 },
      { value: 'relationships', label: 'Các mối quan hệ', points: 2 },
      { value: 'self_worth', label: 'Giá trị bản thân', points: 4 },
      { value: 'fear', label: 'Nỗi sợ hãi', points: 5 },
    ],
  },
  {
    id: 'life_cycle',
    question: 'Bạn cảm thấy mình đang ở giai đoạn nào của cuộc sống?',
    options: [
      { value: 'beginning', label: 'Khởi đầu mới', points: 1 },
      { value: 'building', label: 'Xây dựng nền tảng', points: 4 },
      { value: 'transforming', label: 'Đang chuyển hóa', points: 5 },
      { value: 'completing', label: 'Hoàn thiện', points: 9 },
    ],
  },
  {
    id: 'service_calling',
    question: 'Bạn muốn phụng sự thế giới theo cách nào?',
    options: [
      { value: 'teaching', label: 'Giảng dạy & hướng dẫn', points: 7 },
      { value: 'healing', label: 'Chữa lành người khác', points: 6 },
      { value: 'creating', label: 'Tạo ra cái đẹp', points: 3 },
      { value: 'leading', label: 'Dẫn dắt & truyền cảm hứng', points: 8 },
    ],
  },
];

export function useNinePath() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all 9 stages
  const { data: stages, isLoading: stagesLoading } = useQuery({
    queryKey: ['nine-path-stages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nine_path_stages')
        .select('*')
        .order('id');
      
      if (error) throw error;
      return data as NinePathStage[];
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  // Fetch user's Nine Path profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['nine-path-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('nine_path_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as NinePathProfile | null;
    },
    enabled: !!user?.id,
  });

  // Fetch today's tasks
  const { data: dailyTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['nine-path-daily-tasks', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('nine_path_daily_tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('task_date', today);
      
      if (error) throw error;
      return data as NinePathDailyTask[];
    },
    enabled: !!user?.id && !!profile?.onboarding_completed,
  });

  // Create/Update profile mutation
  const createProfileMutation = useMutation({
    mutationFn: async (data: { birthDate: Date; answers: Record<string, string> }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const personalYear = calculatePersonalYear(data.birthDate);
      
      const profileData = {
        user_id: user.id,
        birth_date: data.birthDate.toISOString().split('T')[0],
        onboarding_completed: true,
        onboarding_answers: data.answers,
        current_stage: personalYear,
        total_points: 0,
      };
      
      const { data: result, error } = await supabase
        .from('nine_path_profiles')
        .upsert(profileData, { onConflict: 'user_id' })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nine-path-profile'] });
      toast({
        title: '✨ Chào mừng đến với Bản đồ 9!',
        description: 'Hành trình chuyển hóa của bạn bắt đầu từ đây.',
      });
    },
    onError: (error) => {
      console.error('Failed to create profile:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tạo hồ sơ. Vui lòng thử lại.',
        variant: 'destructive',
      });
    },
  });

  // Generate daily tasks
  const generateDailyTasksMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !profile) throw new Error('Not ready');
      
      const today = new Date().toISOString().split('T')[0];
      const currentStage = stages?.find(s => s.id === profile.current_stage);
      
      if (!currentStage) throw new Error('Stage not found');
      
      // Create 3 tasks (one for each category)
      const tasks = [
        {
          user_id: user.id,
          stage_id: profile.current_stage,
          task_date: today,
          category: 'healing' as const,
          task_title: `${currentStage.healing_focus}`,
          task_description: `Nhiệm vụ chữa lành cho chặng ${currentStage.name_vi}`,
        },
        {
          user_id: user.id,
          stage_id: profile.current_stage,
          task_date: today,
          category: 'awakening' as const,
          task_title: `${currentStage.awakening_focus}`,
          task_description: `Nhiệm vụ thức tỉnh cho chặng ${currentStage.name_vi}`,
        },
        {
          user_id: user.id,
          stage_id: profile.current_stage,
          task_date: today,
          category: 'service' as const,
          task_title: `${currentStage.service_focus}`,
          task_description: `Nhiệm vụ phụng sự cho chặng ${currentStage.name_vi}`,
        },
      ];
      
      const { data, error } = await supabase
        .from('nine_path_daily_tasks')
        .insert(tasks)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nine-path-daily-tasks'] });
    },
  });

  // Complete task mutation
  const completeTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { data, error } = await supabase
        .from('nine_path_daily_tasks')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
          verification_level: 'self_claim',
          points_earned: 10,
        })
        .eq('id', taskId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nine-path-daily-tasks'] });
      toast({
        title: '✅ Hoàn thành!',
        description: '+10 điểm ánh sáng',
      });
    },
  });

  // Submit proof mutation
  const submitProofMutation = useMutation({
    mutationFn: async (data: {
      taskId: string;
      proofText: string;
      imageUrls?: string[];
      videoUrl?: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data: result, error } = await supabase
        .from('nine_path_task_proofs')
        .insert({
          task_id: data.taskId,
          user_id: user.id,
          proof_text: data.proofText,
          image_urls: data.imageUrls || [],
          video_url: data.videoUrl,
          verification_level: 'proof',
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update task verification level
      await supabase
        .from('nine_path_daily_tasks')
        .update({
          verification_level: 'proof',
          points_earned: 25,
        })
        .eq('id', data.taskId);
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nine-path-daily-tasks'] });
      toast({
        title: '📸 Proof đã gửi!',
        description: '+25 điểm. Đang chờ xác minh cộng đồng.',
      });
    },
  });

  // Need to generate tasks?
  const needsTaskGeneration = profile?.onboarding_completed && dailyTasks?.length === 0;

  // Auto-generate tasks if needed
  useEffect(() => {
    if (needsTaskGeneration && !tasksLoading) {
      generateDailyTasksMutation.mutate();
    }
  }, [needsTaskGeneration, tasksLoading]);

  const currentStage = stages?.find(s => s.id === profile?.current_stage);

  return {
    // Data
    stages,
    profile,
    dailyTasks,
    currentStage,
    questions: NINE_PATH_QUESTIONS,
    
    // Loading states
    isLoading: stagesLoading || profileLoading,
    tasksLoading,
    
    // Computed
    needsOnboarding: !profileLoading && !profile?.onboarding_completed,
    
    // Actions
    createProfile: createProfileMutation.mutate,
    isCreatingProfile: createProfileMutation.isPending,
    completeTask: completeTaskMutation.mutate,
    isCompletingTask: completeTaskMutation.isPending,
    submitProof: submitProofMutation.mutate,
    isSubmittingProof: submitProofMutation.isPending,
  };
}
