import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, ImageIcon, Upload, Database } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export type SaveStep = "idle" | "compressing" | "uploading" | "saving" | "complete";

interface SaveProgressOverlayProps {
  isVisible: boolean;
  currentStep: SaveStep;
  uploadProgress: number;
}

const stepConfig = {
  idle: { icon: ImageIcon, label: "", color: "text-muted-foreground" },
  compressing: { icon: ImageIcon, label: "Đang nén ảnh...", color: "text-amber-500" },
  uploading: { icon: Upload, label: "Đang tải lên...", color: "text-blue-500" },
  saving: { icon: Database, label: "Đang lưu vào Gallery...", color: "text-purple-500" },
  complete: { icon: CheckCircle2, label: "Hoàn tất!", color: "text-emerald-500" },
};

export default function SaveProgressOverlay({ 
  isVisible, 
  currentStep, 
  uploadProgress 
}: SaveProgressOverlayProps) {
  const config = stepConfig[currentStep];
  const Icon = config.icon;

  // Calculate overall progress based on step
  const getOverallProgress = () => {
    switch (currentStep) {
      case "compressing": return 15;
      case "uploading": return 20 + (uploadProgress * 0.6); // 20-80%
      case "saving": return 85;
      case "complete": return 100;
      default: return 0;
    }
  };

  return (
    <AnimatePresence>
      {isVisible && currentStep !== "idle" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-card border border-border rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4"
          >
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className={`p-4 rounded-full bg-muted ${config.color}`}>
                {currentStep === "complete" ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Icon className="w-8 h-8" />
                  </motion.div>
                ) : (
                  <Loader2 className="w-8 h-8 animate-spin" />
                )}
              </div>
            </div>

            {/* Step Label */}
            <h3 className={`text-center text-lg font-medium mb-4 ${config.color}`}>
              {config.label}
            </h3>

            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress value={getOverallProgress()} className="h-2" />
              <p className="text-center text-sm text-muted-foreground">
                {Math.round(getOverallProgress())}%
              </p>
            </div>

            {/* Step Indicators */}
            <div className="flex justify-between mt-6 px-2">
              {(["compressing", "uploading", "saving"] as const).map((step, index) => {
                const StepIcon = stepConfig[step].icon;
                const isActive = currentStep === step;
                const isCompleted = 
                  (currentStep === "uploading" && step === "compressing") ||
                  (currentStep === "saving" && ["compressing", "uploading"].includes(step)) ||
                  (currentStep === "complete");
                
                return (
                  <div key={step} className="flex flex-col items-center gap-1">
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        isCompleted 
                          ? "bg-emerald-500/20 text-emerald-500" 
                          : isActive 
                            ? `bg-muted ${stepConfig[step].color}` 
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <StepIcon className="w-4 h-4" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {index === 0 ? "Nén" : index === 1 ? "Upload" : "Lưu"}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
