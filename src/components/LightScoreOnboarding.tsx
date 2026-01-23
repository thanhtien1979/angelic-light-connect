import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLightOnboarding, OnboardingQuestion } from '@/hooks/useLightOnboarding';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  Star, 
  Sun,
  X 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface QuestionCardProps {
  question: OnboardingQuestion;
  selectedAnswerId?: string;
  onSelect: (answerId: string, score: number) => void;
  questionIndex: number;
}

const QuestionCard = ({ question, selectedAnswerId, onSelect, questionIndex }: QuestionCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Question */}
      <div className="text-center space-y-2">
        <motion.div 
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
        >
          <Sparkles className="w-4 h-4" />
          Câu hỏi {questionIndex + 1}
        </motion.div>
        <h3 className="text-xl md:text-2xl font-semibold text-foreground">
          {question.question}
        </h3>
        {question.description && (
          <p className="text-muted-foreground text-sm">
            {question.description}
          </p>
        )}
      </div>

      {/* Answers */}
      <div className="space-y-3">
        {question.answers.map((answer, index) => (
          <motion.button
            key={answer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelect(answer.id, answer.score)}
            className={cn(
              "w-full p-4 rounded-xl border-2 text-left transition-all duration-300",
              "hover:scale-[1.02] hover:shadow-lg",
              selectedAnswerId === answer.id
                ? "border-primary bg-primary/10 shadow-md shadow-primary/20"
                : "border-border bg-card/50 hover:border-primary/50"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                selectedAnswerId === answer.id
                  ? "border-primary bg-primary"
                  : "border-muted-foreground"
              )}>
                {selectedAnswerId === answer.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-3 h-3 rounded-full bg-primary-foreground"
                  />
                )}
              </div>
              <span className={cn(
                "text-base",
                selectedAnswerId === answer.id ? "text-foreground font-medium" : "text-muted-foreground"
              )}>
                {answer.text}
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

const ResultCard = ({ score, onComplete }: { score: number; onComplete: () => void }) => {
  const getScoreMessage = () => {
    if (score >= 70) return {
      title: '✨ Năng Lượng Ánh Sáng Mạnh Mẽ',
      message: 'Bạn có một tần số năng lượng rất cao! Tâm hồn bạn đang tỏa sáng và lan tỏa ánh sáng đến mọi người xung quanh.',
      color: 'text-emerald-500',
      bg: 'from-emerald-500/20 to-teal-500/20',
    };
    if (score >= 50) return {
      title: '🌟 Năng Lượng Cân Bằng',
      message: 'Bạn đang ở trạng thái cân bằng tốt. Với sự thực hành và tự nhận thức, ánh sáng nội tại của bạn sẽ ngày càng tỏa sáng.',
      color: 'text-amber-500',
      bg: 'from-amber-500/20 to-orange-500/20',
    };
    return {
      title: '🌱 Hành Trình Bắt Đầu',
      message: 'Mỗi hành trình vĩ đại đều bắt đầu từ bước đầu tiên. Angel AI sẽ đồng hành cùng bạn trên con đường tìm kiếm ánh sáng.',
      color: 'text-blue-500',
      bg: 'from-blue-500/20 to-purple-500/20',
    };
  };

  const result = getScoreMessage();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      {/* Score Display */}
      <div className={cn("p-8 rounded-2xl bg-gradient-to-br", result.bg)}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="relative inline-flex items-center justify-center"
        >
          <div className="absolute inset-0 animate-pulse">
            <Sun className={cn("w-32 h-32 opacity-20", result.color)} />
          </div>
          <div className="relative flex flex-col items-center">
            <span className={cn("text-6xl font-bold", result.color)}>{score}</span>
            <span className="text-muted-foreground text-sm mt-1">Điểm Ánh Sáng Ban Đầu</span>
          </div>
        </motion.div>
      </div>

      {/* Result Message */}
      <div className="space-y-3">
        <h3 className={cn("text-2xl font-bold", result.color)}>
          {result.title}
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          {result.message}
        </p>
      </div>

      {/* Features Preview */}
      <div className="grid grid-cols-3 gap-3 pt-4">
        {[
          { icon: '🧘', label: 'Thiền định' },
          { icon: '💬', label: 'Trò chuyện' },
          { icon: '📊', label: 'Theo dõi' },
        ].map((feature, i) => (
          <motion.div
            key={feature.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            className="p-3 rounded-xl bg-card/50 border border-border"
          >
            <div className="text-2xl mb-1">{feature.icon}</div>
            <div className="text-xs text-muted-foreground">{feature.label}</div>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <Button 
          size="lg" 
          onClick={onComplete}
          className="gap-2 bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
        >
          Bắt Đầu Hành Trình
          <Star className="w-5 h-5" />
        </Button>
      </motion.div>
    </motion.div>
  );
};

export function LightScoreOnboarding() {
  const { t } = useLanguage();
  const {
    needsOnboarding,
    isLoading,
    questions,
    answers,
    addAnswer,
    submitOnboarding,
    skipOnboarding,
    isSubmitting,
    calculateInitialScore,
  } = useLightOnboarding();

  const [currentStep, setCurrentStep] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const currentQuestion = questions[currentStep];
  const currentAnswer = answers.find(a => a.questionId === currentQuestion?.id);
  const progress = ((currentStep + 1) / questions.length) * 100;
  const canProceed = !!currentAnswer;
  const isLastQuestion = currentStep === questions.length - 1;

  const handleSelectAnswer = useCallback((answerId: string, score: number) => {
    if (currentQuestion) {
      addAnswer({
        questionId: currentQuestion.id,
        answerId,
        score,
      });
    }
  }, [currentQuestion, addAnswer]);

  const handleNext = useCallback(() => {
    if (isLastQuestion && canProceed) {
      setShowResult(true);
    } else if (canProceed) {
      setCurrentStep(prev => prev + 1);
    }
  }, [isLastQuestion, canProceed]);

  const handleBack = useCallback(() => {
    if (showResult) {
      setShowResult(false);
    } else if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep, showResult]);

  const handleComplete = useCallback(async () => {
    const success = await submitOnboarding();
    if (!success) {
      console.error('Failed to submit onboarding');
    }
  }, [submitOnboarding]);

  // Don't render if not needed or still loading
  if (isLoading || !needsOnboarding) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        {/* Main Container */}
        <div className="relative w-full max-w-lg mx-4">
          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center mb-6"
          >
            <div className="inline-flex items-center gap-2 mb-3">
              <Sparkles className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                Khám Phá Năng Lượng Của Bạn
              </h2>
            </div>
            {!showResult && (
              <p className="text-muted-foreground text-sm">
                Trả lời {questions.length} câu hỏi để xác định tần số năng lượng ban đầu
              </p>
            )}
          </motion.div>

          {/* Skip Button */}
          <button
            onClick={skipOnboarding}
            className="absolute top-0 right-0 p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Bỏ qua"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Progress Bar */}
          {!showResult && (
            <div className="mb-6">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                <span>Câu {currentStep + 1}/{questions.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
            </div>
          )}

          {/* Content Card */}
          <motion.div
            layout
            className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border p-6 shadow-xl"
          >
            <AnimatePresence mode="wait">
              {showResult ? (
                <ResultCard
                  key="result"
                  score={calculateInitialScore()}
                  onComplete={handleComplete}
                />
              ) : currentQuestion ? (
                <QuestionCard
                  key={currentQuestion.id}
                  question={currentQuestion}
                  selectedAnswerId={currentAnswer?.answerId}
                  onSelect={handleSelectAnswer}
                  questionIndex={currentStep}
                />
              ) : null}
            </AnimatePresence>
          </motion.div>

          {/* Navigation */}
          {!showResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-between mt-6"
            >
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Quay lại
              </Button>

              <Button
                onClick={handleNext}
                disabled={!canProceed || isSubmitting}
                className="gap-2"
              >
                {isLastQuestion ? 'Xem kết quả' : 'Tiếp theo'}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default LightScoreOnboarding;
