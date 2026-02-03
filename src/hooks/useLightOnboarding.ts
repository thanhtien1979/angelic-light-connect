import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

const ONBOARDING_COMPLETED_KEY = 'camly_light_onboarding_completed';
const ONBOARDING_SESSION_KEY = 'camly_light_onboarding_session';

export interface OnboardingAnswer {
  questionId: string;
  answerId: string;
  score: number;
}

export interface OnboardingQuestion {
  id: string;
  question: string;
  description?: string;
  answers: {
    id: string;
    text: string;
    score: number;
    energyType: 'light' | 'neutral' | 'shadow';
  }[];
}

export const onboardingQuestions: OnboardingQuestion[] = [
  {
    id: 'morning_feeling',
    question: 'Khi thức dậy mỗi sáng, bạn thường cảm thấy thế nào?',
    description: 'Hãy chọn trạng thái gần nhất với cảm xúc thường ngày của bạn',
    answers: [
      { id: 'grateful', text: '✨ Biết ơn và tràn đầy năng lượng', score: 15, energyType: 'light' },
      { id: 'peaceful', text: '🌸 Bình an và sẵn sàng cho ngày mới', score: 12, energyType: 'light' },
      { id: 'neutral', text: '☁️ Bình thường, không có cảm xúc đặc biệt', score: 8, energyType: 'neutral' },
      { id: 'tired', text: '🌙 Mệt mỏi và cần thêm thời gian nghỉ ngơi', score: 5, energyType: 'shadow' },
    ],
  },
  {
    id: 'reaction_to_difficulty',
    question: 'Khi gặp khó khăn trong cuộc sống, bạn thường phản ứng như thế nào?',
    description: 'Cách bạn đối mặt với thử thách phản ánh năng lượng nội tâm',
    answers: [
      { id: 'learn', text: '🌱 Xem đó là cơ hội để học hỏi và phát triển', score: 15, energyType: 'light' },
      { id: 'calm', text: '🧘 Giữ bình tĩnh và tìm cách giải quyết', score: 12, energyType: 'light' },
      { id: 'worry', text: '💭 Lo lắng nhưng vẫn cố gắng vượt qua', score: 7, energyType: 'neutral' },
      { id: 'overwhelmed', text: '🌊 Cảm thấy choáng ngợp và khó chịu', score: 4, energyType: 'shadow' },
    ],
  },
  {
    id: 'helping_others',
    question: 'Bạn có thường giúp đỡ người khác không?',
    description: 'Lòng từ bi và sự sẻ chia là nguồn năng lượng ánh sáng mạnh mẽ',
    answers: [
      { id: 'always', text: '💝 Luôn sẵn lòng giúp đỡ mọi người', score: 15, energyType: 'light' },
      { id: 'often', text: '🤝 Thường xuyên khi có cơ hội', score: 12, energyType: 'light' },
      { id: 'sometimes', text: '🙂 Thỉnh thoảng, tùy hoàn cảnh', score: 7, energyType: 'neutral' },
      { id: 'rarely', text: '😔 Ít khi, vì bận rộn hoặc không có điều kiện', score: 4, energyType: 'shadow' },
    ],
  },
  {
    id: 'meditation_experience',
    question: 'Bạn có kinh nghiệm với thiền định hoặc cầu nguyện không?',
    description: 'Thực hành tâm linh giúp kết nối với nguồn năng lượng vũ trụ',
    answers: [
      { id: 'daily', text: '🧘‍♀️ Thực hành hàng ngày', score: 15, energyType: 'light' },
      { id: 'weekly', text: '🌟 Thực hành thường xuyên', score: 12, energyType: 'light' },
      { id: 'occasionally', text: '🌸 Thỉnh thoảng thử', score: 8, energyType: 'neutral' },
      { id: 'never', text: '🌱 Chưa bao giờ, nhưng muốn bắt đầu', score: 5, energyType: 'neutral' },
    ],
  },
  {
    id: 'nature_connection',
    question: 'Bạn cảm thấy như thế nào khi ở giữa thiên nhiên?',
    description: 'Sự kết nối với thiên nhiên phản ánh mức độ hòa hợp với vũ trụ',
    answers: [
      { id: 'deeply_connected', text: '🌳 Cảm nhận sự kết nối sâu sắc và bình an', score: 15, energyType: 'light' },
      { id: 'relaxed', text: '🌿 Thư giãn và được nạp lại năng lượng', score: 12, energyType: 'light' },
      { id: 'pleasant', text: '🌺 Dễ chịu và thoải mái', score: 8, energyType: 'neutral' },
      { id: 'indifferent', text: '🏙️ Không có cảm xúc đặc biệt', score: 5, energyType: 'neutral' },
    ],
  },
  {
    id: 'forgiveness',
    question: 'Bạn có dễ dàng tha thứ cho người khác không?',
    description: 'Sự tha thứ giải phóng năng lượng tiêu cực và mở đường cho ánh sáng',
    answers: [
      { id: 'easily', text: '💫 Tha thứ một cách dễ dàng và buông bỏ', score: 15, energyType: 'light' },
      { id: 'try', text: '🙏 Cố gắng tha thứ dù cần thời gian', score: 11, energyType: 'light' },
      { id: 'difficult', text: '💭 Khó khăn nhưng đang học cách buông bỏ', score: 7, energyType: 'neutral' },
      { id: 'hold', text: '😞 Thường giữ sự tổn thương trong lòng', score: 4, energyType: 'shadow' },
    ],
  },
  {
    id: 'life_purpose',
    question: 'Bạn có cảm thấy cuộc sống của mình có ý nghĩa và mục đích không?',
    description: 'Cảm giác về mục đích sống kết nối với sứ mệnh tâm hồn',
    answers: [
      { id: 'clear', text: '🌟 Rõ ràng và đang theo đuổi sứ mệnh', score: 15, energyType: 'light' },
      { id: 'searching', text: '🔍 Đang tìm kiếm và khám phá', score: 10, energyType: 'neutral' },
      { id: 'uncertain', text: '❓ Chưa chắc chắn nhưng hy vọng tìm được', score: 7, energyType: 'neutral' },
      { id: 'lost', text: '🌫️ Cảm thấy lạc lõng và mơ hồ', score: 4, energyType: 'shadow' },
    ],
  },
];

export function useLightOnboarding() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [answers, setAnswers] = useState<OnboardingAnswer[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user needs onboarding - only once per session for new users
  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user) {
        setIsLoading(false);
        setNeedsOnboarding(false);
        return;
      }

      // First check localStorage - if completed, never show again
      const completedKey = `${ONBOARDING_COMPLETED_KEY}_${user.id}`;
      const sessionKey = `${ONBOARDING_SESSION_KEY}_${user.id}`;
      
      if (localStorage.getItem(completedKey) === 'true') {
        setIsLoading(false);
        setNeedsOnboarding(false);
        return;
      }

      // Check if already shown in this browser session
      if (sessionStorage.getItem(sessionKey) === 'shown') {
        setIsLoading(false);
        setNeedsOnboarding(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_light_profile')
          .select('onboarding_completed')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking onboarding status:', error);
          // On error, mark as shown for this session to prevent repeated attempts
          sessionStorage.setItem(sessionKey, 'shown');
          setNeedsOnboarding(false);
        } else if (!data) {
          // No profile yet, needs onboarding - but only show once per session
          sessionStorage.setItem(sessionKey, 'shown');
          setNeedsOnboarding(true);
        } else if (data.onboarding_completed) {
          // Already completed in DB, save to localStorage for future
          localStorage.setItem(completedKey, 'true');
          setNeedsOnboarding(false);
        } else {
          // Profile exists but not completed - show onboarding once per session
          sessionStorage.setItem(sessionKey, 'shown');
          setNeedsOnboarding(true);
        }
      } catch (err) {
        console.error('Error in checkOnboarding:', err);
        sessionStorage.setItem(sessionKey, 'shown');
        setNeedsOnboarding(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboarding();
  }, [user]);

  const addAnswer = useCallback((answer: OnboardingAnswer) => {
    setAnswers(prev => {
      const filtered = prev.filter(a => a.questionId !== answer.questionId);
      return [...filtered, answer];
    });
  }, []);

  const calculateInitialScore = useCallback(() => {
    if (answers.length === 0) return 50;
    
    const totalScore = answers.reduce((sum, a) => sum + a.score, 0);
    const maxPossible = onboardingQuestions.length * 15;
    const percentage = totalScore / maxPossible;
    
    // Scale to 30-80 range for initial score
    return Math.round(30 + (percentage * 50));
  }, [answers]);

  const determineEnergyDirection = useCallback(() => {
    const lightCount = answers.filter(a => {
      const question = onboardingQuestions.find(q => q.id === a.questionId);
      const answer = question?.answers.find(ans => ans.id === a.answerId);
      return answer?.energyType === 'light';
    }).length;

    const shadowCount = answers.filter(a => {
      const question = onboardingQuestions.find(q => q.id === a.questionId);
      const answer = question?.answers.find(ans => ans.id === a.answerId);
      return answer?.energyType === 'shadow';
    }).length;

    if (lightCount >= 4) return 'ascending';
    if (shadowCount >= 3) return 'descending';
    return 'stable';
  }, [answers]);

  const submitOnboarding = useCallback(async () => {
    if (!user || answers.length < onboardingQuestions.length) return false;

    setIsSubmitting(true);
    
    try {
      const initialScore = calculateInitialScore();
      const energyDirection = determineEnergyDirection();
      
      const answersJson = answers.reduce((acc, a) => {
        acc[a.questionId] = a.answerId;
        return acc;
      }, {} as Record<string, string>);

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('user_light_profile')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('user_light_profile')
          .update({
            light_score: initialScore,
            energy_direction: energyDirection,
            onboarding_answers: answersJson,
            onboarding_completed: true,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Create new profile
        const { error } = await supabase
          .from('user_light_profile')
          .insert({
            user_id: user.id,
            light_score: initialScore,
            energy_direction: energyDirection,
            onboarding_answers: answersJson,
            onboarding_completed: true,
          });

        if (error) throw error;
      }

      // Mark as completed in localStorage
      const completedKey = `${ONBOARDING_COMPLETED_KEY}_${user.id}`;
      localStorage.setItem(completedKey, 'true');
      
      setNeedsOnboarding(false);
      return true;
    } catch (err) {
      console.error('Error submitting onboarding:', err);
      // Even on error, mark as completed locally to prevent repeated popups
      const completedKey = `${ONBOARDING_COMPLETED_KEY}_${user.id}`;
      localStorage.setItem(completedKey, 'true');
      setNeedsOnboarding(false);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [user, answers, calculateInitialScore, determineEnergyDirection]);

  const skipOnboarding = useCallback(async () => {
    if (!user) return;

    // Mark as completed in localStorage immediately
    const completedKey = `${ONBOARDING_COMPLETED_KEY}_${user.id}`;
    localStorage.setItem(completedKey, 'true');
    setNeedsOnboarding(false);

    try {
      const { data: existingProfile } = await supabase
        .from('user_light_profile')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingProfile) {
        await supabase
          .from('user_light_profile')
          .update({ onboarding_completed: true })
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('user_light_profile')
          .insert({
            user_id: user.id,
            light_score: 50,
            onboarding_completed: true,
          });
      }
    } catch (err) {
      console.error('Error skipping onboarding:', err);
      // Already marked as completed locally, so user won't see it again
    }
  }, [user]);

  return {
    isLoading,
    needsOnboarding,
    questions: onboardingQuestions,
    answers,
    addAnswer,
    submitOnboarding,
    skipOnboarding,
    isSubmitting,
    calculateInitialScore,
  };
}
