import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useNinePath } from '@/hooks/useNinePath';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface NinePathStageDetailProps {
  stageId: number;
  onBack: () => void;
}

interface ChecklistItem {
  id: string;
  item_title: string;
  item_description: string | null;
  is_completed: boolean;
  completed_at: string | null;
}

const NinePathStageDetail = ({ stageId, onBack }: NinePathStageDetailProps) => {
  const { stages, profile } = useNinePath();
  const { user } = useAuth();
  const stage = stages?.find(s => s.id === stageId);
  const isCurrentStage = profile?.current_stage === stageId;

  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch checklist
  useEffect(() => {
    const fetchChecklist = async () => {
      if (!user?.id) return;
      
      const { data, error } = await supabase
        .from('nine_path_stage_checklist')
        .select('*')
        .eq('user_id', user.id)
        .eq('stage_id', stageId)
        .order('sort_order');
      
      if (error) {
        console.error('Error fetching checklist:', error);
      } else {
        setChecklist(data || []);
      }
      setIsLoading(false);
    };

    fetchChecklist();
  }, [user?.id, stageId]);

  const handleAddItem = async () => {
    if (!user?.id || !newItemTitle.trim()) return;

    const { data, error } = await supabase
      .from('nine_path_stage_checklist')
      .insert({
        user_id: user.id,
        stage_id: stageId,
        item_title: newItemTitle.trim(),
        sort_order: checklist.length,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể thêm mục mới',
        variant: 'destructive',
      });
    } else if (data) {
      setChecklist(prev => [...prev, data]);
      setNewItemTitle('');
    }
  };

  const handleToggleItem = async (itemId: string, isCompleted: boolean) => {
    const { error } = await supabase
      .from('nine_path_stage_checklist')
      .update({
        is_completed: !isCompleted,
        completed_at: !isCompleted ? new Date().toISOString() : null,
      })
      .eq('id', itemId);

    if (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật',
        variant: 'destructive',
      });
    } else {
      setChecklist(prev => prev.map(item => 
        item.id === itemId 
          ? { ...item, is_completed: !isCompleted, completed_at: !isCompleted ? new Date().toISOString() : null }
          : item
      ));
    }
  };

  if (!stage) return null;

  const completedCount = checklist.filter(i => i.is_completed).length;
  const totalCount = checklist.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Back Button */}
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Quay lại bản đồ
      </Button>

      {/* Stage Header */}
      <Card 
        className="overflow-hidden border-2"
        style={{ borderColor: `${stage.theme_color}40` }}
      >
        <div 
          className="h-32 flex items-center justify-center relative"
          style={{ 
            background: `linear-gradient(135deg, ${stage.theme_color}30, ${stage.theme_color}10)` 
          }}
        >
          <div className="text-center">
            <div className="text-5xl mb-2">{stage.icon}</div>
            <h2 className="text-2xl font-bold">
              Chặng {stage.id}: {stage.name_vi}
            </h2>
          </div>
          {isCurrentStage && (
            <Badge 
              className="absolute top-4 right-4 bg-violet-500"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Chặng hiện tại
            </Badge>
          )}
        </div>
        <CardContent className="pt-4">
          <p className="text-muted-foreground">{stage.description_vi}</p>
        </CardContent>
      </Card>

      {/* Focus Areas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-rose-500/30 bg-rose-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-rose-500">
              💗 Healing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{stage.healing_focus}</p>
          </CardContent>
        </Card>

        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-amber-500">
              ✨ Awakening
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{stage.awakening_focus}</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-emerald-500">
              🙏 Service
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{stage.service_focus}</p>
          </CardContent>
        </Card>
      </div>

      {/* Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>📋 Checklist cho chặng này</span>
            {totalCount > 0 && (
              <Badge variant="outline">
                {completedCount}/{totalCount} ({progress}%)
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add new item */}
          <div className="flex gap-2">
            <Input
              placeholder="Thêm mục mới..."
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
            />
            <Button size="icon" onClick={handleAddItem} disabled={!newItemTitle.trim()}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Checklist items */}
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-10 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : checklist.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Chưa có mục nào. Thêm mục đầu tiên của bạn!
            </p>
          ) : (
            <div className="space-y-2">
              {checklist.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border"
                >
                  <Checkbox
                    checked={item.is_completed}
                    onCheckedChange={() => handleToggleItem(item.id, item.is_completed)}
                  />
                  <span className={item.is_completed ? 'line-through text-muted-foreground' : ''}>
                    {item.item_title}
                  </span>
                  {item.is_completed && (
                    <Check className="w-4 h-4 text-green-500 ml-auto" />
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default NinePathStageDetail;
