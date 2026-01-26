import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useNinePath } from '@/hooks/useNinePath';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import NavigationHeader from '@/components/NavigationHeader';
import NinePathOnboarding from '@/components/nine-path/NinePathOnboarding';
import NinePathDashboard from '@/components/nine-path/NinePathDashboard';
import NinePathJourneyMap from '@/components/nine-path/NinePathJourneyMap';
import NinePathStageDetail from '@/components/nine-path/NinePathStageDetail';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const NinePath = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, isLoading: authLoading } = useAuth();
  const { isLoading, needsOnboarding } = useNinePath();
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Redirect if not authenticated
  if (!authLoading && !user) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <NavigationHeader />

      <main className="container mx-auto px-4 pt-24 pb-12 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent">
              Bản Đồ 9
            </h1>
            <p className="text-muted-foreground text-sm">
              Hành trình 9 chặng chuyển hóa
            </p>
          </div>
        </motion.div>

        {isLoading || authLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        ) : needsOnboarding ? (
          <NinePathOnboarding />
        ) : (
          <AnimatePresence mode="wait">
            {selectedStageId ? (
              <NinePathStageDetail
                key="stage-detail"
                stageId={selectedStageId}
                onBack={() => setSelectedStageId(null)}
              />
            ) : (
              <motion.div
                key="main-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="dashboard" className="gap-2">
                      <span>📊</span> Nhiệm vụ hôm nay
                    </TabsTrigger>
                    <TabsTrigger value="journey" className="gap-2">
                      <span>🗺️</span> Bản đồ hành trình
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="dashboard">
                    <NinePathDashboard />
                  </TabsContent>

                  <TabsContent value="journey">
                    <NinePathJourneyMap onSelectStage={setSelectedStageId} />
                  </TabsContent>
                </Tabs>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
};

export default NinePath;
