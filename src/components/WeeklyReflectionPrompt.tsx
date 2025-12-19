import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, X, Feather, Sparkles } from 'lucide-react';
import { useWeeklyReflection } from '@/hooks/useWeeklyReflection';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const WeeklyReflectionPrompt = () => {
  const { user } = useAuth();
  const { showPrompt, currentPrompt, dismissPrompt, closePrompt } = useWeeklyReflection();
  const [reflection, setReflection] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSave = async () => {
    if (!user || !reflection.trim()) return;

    setIsSaving(true);
    try {
      // Save to reflection_notes
      const { error: reflectionError } = await supabase
        .from('reflection_notes')
        .insert({
          user_id: user.id,
          content: reflection.trim(),
          word_count: reflection.trim().split(/\s+/).filter(Boolean).length,
          is_public: false, // Always private initially
          approved: true, // Auto-approve personal reflections
        });

      if (reflectionError) throw reflectionError;

      // If user wants to share, create a light moment
      if (isPublic) {
        await supabase
          .from('shared_light_moments')
          .insert({
            user_id: user.id,
            moment_type: 'breathing_reflection',
            spiritual_message: reflection.trim().slice(0, 200),
          });
      }

      toast.success('Your reflection has been saved');
      closePrompt();
    } catch (error) {
      console.error('Error saving reflection:', error);
      toast.error('Could not save reflection');
    } finally {
      setIsSaving(false);
    }
  };

  if (!showPrompt || !user) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && !isExpanded && dismissPrompt()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative w-full max-w-md"
        >
          {/* Soft glow background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-[hsl(45,50%,70%)]/10 to-[hsl(350,40%,75%)]/10 blur-2xl rounded-3xl" />
          
          <div className="relative bg-card/95 backdrop-blur-xl rounded-2xl border border-border/40 shadow-2xl overflow-hidden">
            {/* Close button */}
            <button
              onClick={dismissPrompt}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted/50 text-muted-foreground/50 hover:text-muted-foreground transition-colors z-10"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="p-6 pb-4 text-center">
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 via-[hsl(45,50%,70%)]/20 to-[hsl(350,40%,75%)]/20 flex items-center justify-center"
              >
                <Feather className="w-6 h-6 text-primary/70" />
              </motion.div>
              
              <h3 className="text-lg font-serif text-foreground/90 mb-2">
                A Gentle Invitation
              </h3>
              <p className="text-sm text-muted-foreground/70 italic leading-relaxed">
                {currentPrompt}
              </p>
            </div>

            {/* Reflection area */}
            <div className="px-6 pb-4">
              {!isExpanded ? (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setIsExpanded(true)}
                  className="w-full p-4 rounded-xl bg-muted/20 border border-border/30 text-left text-sm text-muted-foreground/50 italic hover:bg-muted/30 hover:border-border/40 transition-all"
                >
                  Tap here to reflect...
                </motion.button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  <textarea
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder="Write freely, without judgment..."
                    className="w-full min-h-[120px] p-4 rounded-xl bg-muted/20 border border-border/30 text-sm text-foreground/80 placeholder:text-muted-foreground/40 placeholder:italic focus:outline-none focus:border-primary/30 focus:bg-muted/30 transition-all resize-none"
                    autoFocus
                  />
                  
                  {/* Share toggle */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/20">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-muted-foreground/40" />
                      <Label 
                        htmlFor="share-reflection" 
                        className="text-xs text-muted-foreground/60 cursor-pointer"
                      >
                        Share as Light Moment
                      </Label>
                    </div>
                    <Switch
                      id="share-reflection"
                      checked={isPublic}
                      onCheckedChange={setIsPublic}
                      className="scale-75 data-[state=checked]:bg-[hsl(45,50%,60%)]"
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={dismissPrompt}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm text-muted-foreground/70 hover:text-muted-foreground hover:bg-muted/30 transition-colors"
              >
                Maybe later
              </button>
              
              {isExpanded && reflection.trim() && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium bg-gradient-to-br from-primary/80 to-primary text-primary-foreground shadow-lg shadow-primary/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Wind className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <>
                      <Feather className="w-4 h-4" />
                      Save
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WeeklyReflectionPrompt;
