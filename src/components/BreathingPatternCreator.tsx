import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Save, Trash2, Wind, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export interface CustomBreathingPattern {
  id: string;
  name: string;
  inhale_duration: number;
  hold_after_inhale: number;
  exhale_duration: number;
  hold_after_exhale: number;
}

interface BreathingPatternCreatorProps {
  onSelectPattern?: (pattern: CustomBreathingPattern) => void;
  selectedPatternId?: string | null;
}

const BreathingPatternCreator = ({ 
  onSelectPattern, 
  selectedPatternId 
}: BreathingPatternCreatorProps) => {
  const { user } = useAuth();
  const [patterns, setPatterns] = useState<CustomBreathingPattern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // New pattern form state
  const [newPattern, setNewPattern] = useState({
    name: "",
    inhale_duration: 4,
    hold_after_inhale: 0,
    exhale_duration: 4,
    hold_after_exhale: 0,
  });

  // Fetch user's saved patterns
  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    const fetchPatterns = async () => {
      try {
        const { data, error } = await supabase
          .from("custom_breathing_patterns")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setPatterns(data || []);
      } catch (error) {
        console.error("Error fetching patterns:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatterns();
  }, [user?.id]);

  const handleSavePattern = async () => {
    if (!user?.id || !newPattern.name.trim()) {
      toast.error("Vui lòng nhập tên cho nhịp thở");
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from("custom_breathing_patterns")
        .insert({
          user_id: user.id,
          name: newPattern.name.trim(),
          inhale_duration: newPattern.inhale_duration,
          hold_after_inhale: newPattern.hold_after_inhale,
          exhale_duration: newPattern.exhale_duration,
          hold_after_exhale: newPattern.hold_after_exhale,
        })
        .select()
        .single();

      if (error) throw error;

      setPatterns(prev => [data, ...prev]);
      setNewPattern({
        name: "",
        inhale_duration: 4,
        hold_after_inhale: 0,
        exhale_duration: 4,
        hold_after_exhale: 0,
      });
      setIsCreating(false);
      toast.success("Đã lưu nhịp thở mới ✨");
    } catch (error) {
      console.error("Error saving pattern:", error);
      toast.error("Không thể lưu nhịp thở");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePattern = async (id: string) => {
    try {
      const { error } = await supabase
        .from("custom_breathing_patterns")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setPatterns(prev => prev.filter(p => p.id !== id));
      toast.success("Đã xóa nhịp thở");
    } catch (error) {
      console.error("Error deleting pattern:", error);
      toast.error("Không thể xóa nhịp thở");
    }
  };

  const formatDurations = (pattern: CustomBreathingPattern): string => {
    const parts = [];
    parts.push(`${pattern.inhale_duration}s hít`);
    if (pattern.hold_after_inhale > 0) parts.push(`${pattern.hold_after_inhale}s giữ`);
    parts.push(`${pattern.exhale_duration}s thở`);
    if (pattern.hold_after_exhale > 0) parts.push(`${pattern.hold_after_exhale}s giữ`);
    return parts.join(" · ");
  };

  if (!user) {
    return (
      <div className="p-4 rounded-xl bg-muted/20 text-center">
        <p className="text-xs text-muted-foreground">
          Đăng nhập để lưu nhịp thở cá nhân
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Saved patterns */}
      {patterns.length > 0 && (
        <div className="space-y-2">
          {patterns.map((pattern) => (
            <motion.div
              key={pattern.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`group p-3 rounded-xl border transition-all cursor-pointer ${
                selectedPatternId === pattern.id
                  ? "bg-rose/10 border-rose/30"
                  : "bg-muted/20 border-border/30 hover:border-rose/20"
              }`}
              onClick={() => onSelectPattern?.(pattern)}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Wind className="w-3 h-3 text-rose/60" />
                    <span className="text-sm font-medium text-foreground/90 truncate">
                      {pattern.name}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {formatDurations(pattern)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePattern(pattern.id);
                  }}
                  className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3 text-muted-foreground" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create new pattern */}
      <AnimatePresence mode="wait">
        {isCreating ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-xl bg-muted/20 border border-border/30 space-y-4">
              {/* Pattern name */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Tên nhịp thở</label>
                <Input
                  value={newPattern.name}
                  onChange={(e) => setNewPattern(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nhịp thở của tôi"
                  className="h-9 text-sm bg-background/50"
                />
              </div>

              {/* Duration sliders */}
              <div className="grid grid-cols-2 gap-3">
                {/* Inhale */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Hít vào: {newPattern.inhale_duration}s
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="10"
                    value={newPattern.inhale_duration}
                    onChange={(e) => setNewPattern(prev => ({ 
                      ...prev, 
                      inhale_duration: parseInt(e.target.value) 
                    }))}
                    className="w-full h-1.5 appearance-none bg-muted/50 rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-rose [&::-webkit-slider-thumb]:rounded-full"
                  />
                </div>

                {/* Hold after inhale */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Giữ sau hít: {newPattern.hold_after_inhale}s
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={newPattern.hold_after_inhale}
                    onChange={(e) => setNewPattern(prev => ({ 
                      ...prev, 
                      hold_after_inhale: parseInt(e.target.value) 
                    }))}
                    className="w-full h-1.5 appearance-none bg-muted/50 rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-rose [&::-webkit-slider-thumb]:rounded-full"
                  />
                </div>

                {/* Exhale */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Thở ra: {newPattern.exhale_duration}s
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="12"
                    value={newPattern.exhale_duration}
                    onChange={(e) => setNewPattern(prev => ({ 
                      ...prev, 
                      exhale_duration: parseInt(e.target.value) 
                    }))}
                    className="w-full h-1.5 appearance-none bg-muted/50 rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-rose [&::-webkit-slider-thumb]:rounded-full"
                  />
                </div>

                {/* Hold after exhale */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Giữ sau thở: {newPattern.hold_after_exhale}s
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="8"
                    value={newPattern.hold_after_exhale}
                    onChange={(e) => setNewPattern(prev => ({ 
                      ...prev, 
                      hold_after_exhale: parseInt(e.target.value) 
                    }))}
                    className="w-full h-1.5 appearance-none bg-muted/50 rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-rose [&::-webkit-slider-thumb]:rounded-full"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 h-8"
                >
                  Hủy
                </Button>
                <Button
                  size="sm"
                  onClick={handleSavePattern}
                  disabled={isSaving || !newPattern.name.trim()}
                  className="flex-1 h-8 bg-rose/20 hover:bg-rose/30 text-foreground border border-rose/30"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-3 h-3 mr-1" />
                      Lưu
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="add-button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCreating(true)}
            className="w-full p-3 rounded-xl border border-dashed border-border/40 hover:border-rose/30 transition-colors flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <Plus className="w-4 h-4" />
            Tạo nhịp thở mới
          </motion.button>
        )}
      </AnimatePresence>

      {/* Gentle hint */}
      <p className="text-[10px] text-muted-foreground/60 text-center px-2">
        Nhịp thở của con là riêng tư và chỉ dành cho con
      </p>
    </div>
  );
};

export default BreathingPatternCreator;
