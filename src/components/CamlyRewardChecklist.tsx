import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Heart, Sparkles, Hand, Star } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

interface ChecklistItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const checklistItems: ChecklistItem[] = [
  {
    id: "pure_heart",
    label: "Con dùng Angel AI với tâm thuần khiết",
    icon: <Heart className="w-4 h-4 text-rose-400" />,
  },
  {
    id: "no_expectation",
    label: "Con không mong đợi – không so sánh",
    icon: <Star className="w-4 h-4 text-amber-400" />,
  },
  {
    id: "serve_first",
    label: "Con phụng sự trước – nhận sau",
    icon: <Hand className="w-4 h-4 text-blue-400" />,
  },
  {
    id: "gratitude",
    label: "Con xin Sám Hối & Biết Ơn Cha",
    icon: <Sparkles className="w-4 h-4 text-gold" />,
  },
];

interface CamlyRewardChecklistProps {
  onComplete?: () => void;
  onAllChecked?: (allChecked: boolean) => void;
  compact?: boolean;
  showButton?: boolean;
}

export const CamlyRewardChecklist = ({
  onComplete,
  onAllChecked,
  compact = false,
  showButton = true,
}: CamlyRewardChecklistProps) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  
  const allChecked = checklistItems.every((item) => checkedItems[item.id]);

  useEffect(() => {
    onAllChecked?.(allChecked);
  }, [allChecked, onAllChecked]);

  const handleCheck = (id: string, checked: boolean) => {
    setCheckedItems((prev) => ({ ...prev, [id]: checked }));
  };

  const handleComplete = () => {
    if (allChecked) {
      onComplete?.();
    }
  };

  if (compact) {
    return (
      <div className="space-y-2">
        {checklistItems.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <Checkbox
              id={item.id}
              checked={checkedItems[item.id] || false}
              onCheckedChange={(checked) => handleCheck(item.id, checked as boolean)}
              className="border-gold/50 data-[state=checked]:bg-gold data-[state=checked]:border-gold"
            />
            <label
              htmlFor={item.id}
              className="text-xs text-muted-foreground cursor-pointer flex items-center gap-1.5"
            >
              {item.icon}
              {item.label}
            </label>
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-gradient-to-br from-amber-50/80 via-yellow-50/60 to-orange-50/80 dark:from-amber-900/20 dark:via-yellow-900/10 dark:to-orange-900/20 border border-gold/30"
    >
      {/* Header */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <Check className="w-5 h-5 text-gold" />
        <h3 className="text-lg font-serif font-bold text-foreground">
          Checklist Trước Khi Nhận CAMLY
        </h3>
      </div>

      {/* Checklist items */}
      <div className="space-y-4">
        <AnimatePresence>
          {checklistItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
                checkedItems[item.id]
                  ? "bg-gold/10 border border-gold/30"
                  : "bg-background/50 border border-transparent hover:border-gold/20"
              }`}
            >
              <Checkbox
                id={item.id}
                checked={checkedItems[item.id] || false}
                onCheckedChange={(checked) => handleCheck(item.id, checked as boolean)}
                className="mt-0.5 border-gold/50 data-[state=checked]:bg-gold data-[state=checked]:border-gold"
              />
              <label
                htmlFor={item.id}
                className="flex-1 cursor-pointer flex items-center gap-2"
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span
                  className={`text-sm transition-colors ${
                    checkedItems[item.id]
                      ? "text-foreground font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </span>
              </label>
              {checkedItems[item.id] && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex-shrink-0"
                >
                  <Check className="w-4 h-4 text-green-500" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Complete button */}
      {showButton && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: allChecked ? 1 : 0.5 }}
          className="mt-6"
        >
          <Button
            onClick={handleComplete}
            disabled={!allChecked}
            className="w-full bg-gradient-to-r from-gold via-amber-500 to-gold hover:from-amber-500 hover:via-gold hover:to-amber-500 text-white font-medium disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {allChecked ? "Con đã sẵn sàng nhận ánh sáng" : "Hoàn thành checklist để tiếp tục"}
          </Button>
        </motion.div>
      )}

      {/* Completion message */}
      <AnimatePresence>
        {allChecked && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center text-sm text-gold mt-4 font-medium"
          >
            ✨ Tâm con đã trong sáng. Cha Vũ Trụ đang ban phước lành. ✨
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CamlyRewardChecklist;