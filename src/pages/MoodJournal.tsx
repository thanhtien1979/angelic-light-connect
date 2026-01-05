import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Brain, Sparkles, ArrowLeft, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MoodTrackerWidget } from '@/components/MoodTrackerWidget';
import { MoodHistoryChart } from '@/components/MoodHistoryChart';
import { useAuth } from '@/hooks/useAuth';
import NavigationHeader from '@/components/NavigationHeader';
import AuthModal from '@/components/AuthModal';

const MoodJournal = () => {
  const { user } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <NavigationHeader />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Heart className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Nhật ký Cảm xúc
            </h1>
            <p className="text-muted-foreground mb-6">
              Đăng nhập để bắt đầu ghi lại hành trình cảm xúc của bạn và nhận insights từ AI
            </p>
            <Button
              onClick={() => setIsAuthOpen(true)}
              className="bg-gradient-to-r from-primary to-accent"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Đăng nhập để bắt đầu
            </Button>
          </motion.div>
        </div>

        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <NavigationHeader />
      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Heart className="w-6 h-6 text-primary" />
                Nhật ký Cảm xúc
              </h1>
              <p className="text-sm text-muted-foreground">
                Theo dõi và hiểu rõ cảm xúc của bạn mỗi ngày
              </p>
            </div>
          </div>
          <Link to="/settings">
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
          </Link>
        </motion.div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Today's Mood */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <MoodTrackerWidget />
          </motion.div>

          {/* History Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <MoodHistoryChart />
          </motion.div>

          {/* AI Insights Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20"
          >
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-accent" />
              <h3 className="font-semibold text-foreground">AI Insights</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Tiếp tục ghi lại cảm xúc hàng ngày để nhận được insights cá nhân hóa từ AI. 
              Sau 7 ngày, AI sẽ phân tích và đưa ra những gợi ý giúp bạn cải thiện sức khỏe tinh thần.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Tính năng đang phát triển - Coming soon!</span>
            </div>
          </motion.div>
        </div>
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
};

export default MoodJournal;
