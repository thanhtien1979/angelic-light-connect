import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useNinePath, NINE_PATH_QUESTIONS, calculatePersonalYear } from '@/hooks/useNinePath';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const NinePathOnboarding = () => {
  const { createProfile, isCreatingProfile, stages } = useNinePath();
  const [step, setStep] = useState<'birthdate' | 'questions' | 'result'>('birthdate');
  const [birthDate, setBirthDate] = useState<Date | undefined>();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const totalSteps = 1 + NINE_PATH_QUESTIONS.length; // birthdate + questions
  const currentStep = step === 'birthdate' ? 1 : 1 + currentQuestionIndex + 1;
  const progress = (currentStep / totalSteps) * 100;

  const handleBirthdateNext = useCallback(() => {
    if (birthDate) {
      setStep('questions');
    }
  }, [birthDate]);

  const handleAnswerSelect = useCallback((questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    
    if (currentQuestionIndex < NINE_PATH_QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
      }, 300);
    } else {
      setStep('result');
    }
  }, [currentQuestionIndex]);

  const handlePrevQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      setStep('birthdate');
    }
  }, [currentQuestionIndex]);

  const handleComplete = useCallback(() => {
    if (birthDate) {
      createProfile({ birthDate, answers });
    }
  }, [birthDate, answers, createProfile]);

  const calculatedStage = birthDate ? calculatePersonalYear(birthDate) : 1;
  const stageInfo = stages?.find(s => s.id === calculatedStage);

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress Bar */}
      <div className="mb-6">
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Bước {currentStep} / {totalSteps}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {/* Birth Date Step */}
        {step === 'birthdate' && (
          <motion.div
            key="birthdate"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="border-violet-500/30 bg-gradient-to-br from-violet-500/5 to-purple-500/5">
              <CardContent className="pt-6 space-y-6">
                <div className="text-center space-y-2">
                  <div className="text-4xl mb-4">🌟</div>
                  <h2 className="text-xl font-semibold">Chào mừng đến với Bản Đồ 9</h2>
                  <p className="text-muted-foreground text-sm">
                    Hãy cho tôi biết ngày sinh của bạn để xác định chặng đường hiện tại
                  </p>
                </div>

                <div className="flex justify-center">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-64 justify-start text-left font-normal",
                          !birthDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {birthDate ? (
                          format(birthDate, "dd MMMM, yyyy", { locale: vi })
                        ) : (
                          <span>Chọn ngày sinh</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="center">
                      <CalendarPicker
                        mode="single"
                        selected={birthDate}
                        onSelect={setBirthDate}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1920-01-01")
                        }
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                        captionLayout="dropdown"
                        fromYear={1920}
                        toYear={new Date().getFullYear()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {birthDate && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 text-center"
                  >
                    <p className="text-sm text-muted-foreground">Năm cá nhân của bạn</p>
                    <p className="text-3xl font-bold text-violet-500">
                      {calculatedStage}
                    </p>
                    <p className="text-sm text-violet-400 mt-1">
                      Chặng {stageInfo?.name_vi || '...'}
                    </p>
                  </motion.div>
                )}

                <Button
                  onClick={handleBirthdateNext}
                  disabled={!birthDate}
                  className="w-full gap-2 bg-gradient-to-r from-violet-500 to-purple-600"
                >
                  Tiếp tục <ChevronRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Questions Step */}
        {step === 'questions' && (
          <motion.div
            key={`question-${currentQuestionIndex}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="border-violet-500/30 bg-gradient-to-br from-violet-500/5 to-purple-500/5">
              <CardContent className="pt-6 space-y-6">
                <div className="text-center space-y-2">
                  <div className="text-2xl mb-2">
                    {['💫', '🌸', '🔮', '✨', '🌙', '🦋'][currentQuestionIndex % 6]}
                  </div>
                  <h2 className="text-lg font-medium">
                    {NINE_PATH_QUESTIONS[currentQuestionIndex].question}
                  </h2>
                </div>

                <div className="space-y-3">
                  {NINE_PATH_QUESTIONS[currentQuestionIndex].options.map((option) => (
                    <motion.button
                      key={option.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswerSelect(
                        NINE_PATH_QUESTIONS[currentQuestionIndex].id,
                        option.value
                      )}
                      className={cn(
                        "w-full p-4 rounded-xl border text-left transition-all",
                        answers[NINE_PATH_QUESTIONS[currentQuestionIndex].id] === option.value
                          ? "bg-violet-500/20 border-violet-500"
                          : "bg-card/50 border-border hover:border-violet-500/50"
                      )}
                    >
                      {option.label}
                    </motion.button>
                  ))}
                </div>

                <Button
                  variant="ghost"
                  onClick={handlePrevQuestion}
                  className="w-full gap-2"
                >
                  <ChevronLeft className="w-4 h-4" /> Quay lại
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Result Step */}
        {step === 'result' && stageInfo && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-purple-500/10 overflow-hidden">
              <CardContent className="pt-6 space-y-6">
                {/* Stage Badge */}
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="inline-flex items-center justify-center w-24 h-24 rounded-full text-5xl mb-4"
                    style={{ backgroundColor: `${stageInfo.theme_color}20` }}
                  >
                    {stageInfo.icon}
                  </motion.div>
                  <h2 className="text-2xl font-bold">Chặng {calculatedStage}</h2>
                  <p className="text-xl font-medium" style={{ color: stageInfo.theme_color }}>
                    {stageInfo.name_vi}
                  </p>
                </div>

                {/* Description */}
                <p className="text-center text-muted-foreground">
                  {stageInfo.description_vi}
                </p>

                {/* Focus Areas */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
                    <div className="text-lg mb-1">💗</div>
                    <div className="text-xs font-medium text-rose-400">Healing</div>
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {stageInfo.healing_focus}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                    <div className="text-lg mb-1">✨</div>
                    <div className="text-xs font-medium text-amber-400">Awakening</div>
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {stageInfo.awakening_focus}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <div className="text-lg mb-1">🙏</div>
                    <div className="text-xs font-medium text-emerald-400">Service</div>
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {stageInfo.service_focus}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleComplete}
                  disabled={isCreatingProfile}
                  className="w-full gap-2 bg-gradient-to-r from-violet-500 to-purple-600"
                >
                  <Sparkles className="w-4 h-4" />
                  {isCreatingProfile ? 'Đang khởi tạo...' : 'Bắt đầu hành trình'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NinePathOnboarding;
