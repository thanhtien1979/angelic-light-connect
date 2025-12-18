import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wind } from "lucide-react";
import { CustomBreathingPattern } from "./BreathingPatternCreator";

export type BreathingPattern = "box" | "478" | "custom" | null;

interface BreathingPhase {
  name: string;
  nameVi: string;
  duration: number;
}

interface PatternConfig {
  id: string;
  name: string;
  nameVi: string;
  phases: BreathingPhase[];
}

const PRESET_PATTERNS: PatternConfig[] = [
  {
    id: "box",
    name: "Box Breathing",
    nameVi: "Thở vuông",
    phases: [
      { name: "inhale", nameVi: "Hít vào", duration: 4 },
      { name: "hold", nameVi: "Giữ", duration: 4 },
      { name: "exhale", nameVi: "Thở ra", duration: 4 },
      { name: "hold", nameVi: "Giữ", duration: 4 },
    ],
  },
  {
    id: "478",
    name: "4-7-8 Breathing",
    nameVi: "Thở 4-7-8",
    phases: [
      { name: "inhale", nameVi: "Hít vào", duration: 4 },
      { name: "hold", nameVi: "Giữ", duration: 7 },
      { name: "exhale", nameVi: "Thở ra", duration: 8 },
    ],
  },
];

// Convert custom pattern to phases
const customPatternToPhases = (pattern: CustomBreathingPattern): BreathingPhase[] => {
  const phases: BreathingPhase[] = [
    { name: "inhale", nameVi: "Hít vào", duration: pattern.inhale_duration },
  ];
  
  if (pattern.hold_after_inhale > 0) {
    phases.push({ name: "hold", nameVi: "Giữ", duration: pattern.hold_after_inhale });
  }
  
  phases.push({ name: "exhale", nameVi: "Thở ra", duration: pattern.exhale_duration });
  
  if (pattern.hold_after_exhale > 0) {
    phases.push({ name: "hold", nameVi: "Giữ", duration: pattern.hold_after_exhale });
  }
  
  return phases;
};

interface BreathingGuideProps {
  isActive: boolean;
  pattern: BreathingPattern;
  customPattern?: CustomBreathingPattern | null;
  onClose: () => void;
}

const BreathingGuide = ({ isActive, pattern, customPattern, onClose }: BreathingGuideProps) => {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get pattern config
  const patternConfig: PatternConfig | null = (() => {
    if (pattern === "custom" && customPattern) {
      return {
        id: customPattern.id,
        name: customPattern.name,
        nameVi: customPattern.name,
        phases: customPatternToPhases(customPattern),
      };
    }
    return PRESET_PATTERNS.find(p => p.id === pattern) || null;
  })();

  const currentPhase = patternConfig?.phases[currentPhaseIndex];

  // Auto-hide on interaction
  const handleInteraction = useCallback(() => {
    setIsVisible(false);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, 3000);
  }, []);

  // Reset phase index when pattern changes
  useEffect(() => {
    setCurrentPhaseIndex(0);
    setProgress(0);
  }, [pattern, customPattern?.id]);

  useEffect(() => {
    if (!isActive || !patternConfig) {
      return;
    }

    const phaseDuration = currentPhase?.duration || 4;
    const stepMs = 50;
    const totalSteps = (phaseDuration * 1000) / stepMs;
    let currentStep = 0;

    intervalRef.current = setInterval(() => {
      currentStep++;
      setProgress((currentStep / totalSteps) * 100);

      if (currentStep >= totalSteps) {
        setCurrentPhaseIndex(prev => (prev + 1) % patternConfig.phases.length);
        currentStep = 0;
        setProgress(0);
      }
    }, stepMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, patternConfig, currentPhaseIndex, currentPhase?.duration]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  if (!isActive || !patternConfig || !currentPhase) {
    return null;
  }

  // Calculate scale based on phase
  const getScale = () => {
    const phaseName = currentPhase.name;
    const progressRatio = progress / 100;

    if (phaseName === "inhale") {
      return 1 + progressRatio * 0.3;
    } else if (phaseName === "exhale") {
      return 1.3 - progressRatio * 0.3;
    } else {
      const prevPhase = patternConfig.phases[
        (currentPhaseIndex - 1 + patternConfig.phases.length) % patternConfig.phases.length
      ];
      return prevPhase.name === "inhale" ? 1.3 : 1;
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          onClick={handleInteraction}
        >
          {/* Breathing circle */}
          <div className="relative w-32 h-32">
            {/* Outer glow ring */}
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-br from-rose-light/30 via-primary/20 to-gold/30"
              animate={{ 
                scale: getScale(),
                opacity: currentPhase.name === "hold" ? 0.6 : 0.4
              }}
              transition={{ duration: 0.1, ease: "linear" }}
              style={{ filter: "blur(20px)" }}
            />

            {/* Inner breathing circle */}
            <motion.div
              className="absolute inset-4 rounded-full bg-gradient-to-br from-rose/40 via-primary/30 to-gold/40 border border-rose/30"
              animate={{ scale: getScale() }}
              transition={{ duration: 0.1, ease: "linear" }}
            />

            {/* Center icon */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ scale: getScale() * 0.9 }}
              transition={{ duration: 0.1, ease: "linear" }}
            >
              <Wind className="w-6 h-6 text-foreground/60" />
            </motion.div>
          </div>

          {/* Text cue */}
          <motion.div
            key={currentPhase.nameVi + currentPhaseIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-4 left-0 right-0 text-center"
          >
            <span className="text-sm font-light text-foreground/70 tracking-wide">
              {currentPhase.nameVi}
            </span>
          </motion.div>

          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-muted/30 hover:bg-muted/50 transition-colors pointer-events-auto"
          >
            <X className="w-3 h-3 text-muted-foreground" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Pattern selector with preset options
interface BreathingPatternSelectorProps {
  selectedPattern: BreathingPattern;
  onSelectPattern: (pattern: BreathingPattern) => void;
}

export const BreathingPatternSelector = ({ 
  selectedPattern, 
  onSelectPattern 
}: BreathingPatternSelectorProps) => {
  return (
    <div className="flex gap-2">
      {PRESET_PATTERNS.map((pattern) => (
        <button
          key={pattern.id}
          onClick={() => onSelectPattern(
            selectedPattern === pattern.id ? null : pattern.id as BreathingPattern
          )}
          className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
            selectedPattern === pattern.id
              ? "bg-rose/20 border border-rose/40 text-foreground"
              : "bg-muted/20 hover:bg-muted/30 text-muted-foreground"
          }`}
        >
          {pattern.nameVi}
        </button>
      ))}
    </div>
  );
};

export default BreathingGuide;
