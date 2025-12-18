import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, X, Play, Square, Volume2, VolumeX, ChevronDown, Sparkles } from 'lucide-react';
import { useBreathingCompletionSound } from '@/hooks/useBreathingCompletionSound';
import { useAmbientSound, AMBIENT_SOUNDS, type AmbientSoundType } from '@/hooks/useAmbientSound';
import { Slider } from '@/components/ui/slider';

type BreathPhase = 'idle' | 'inhale' | 'hold-in' | 'exhale' | 'hold-out' | 'next-cycle' | 'complete';

interface BreathingPattern {
  id: string;
  name: string;
  description: string;
  icon: string;
  inhale: number;
  holdIn: number;
  exhale: number;
  holdOut: number;
  cycles: number;
}

// Gentle breathing patterns with spiritual, non-technical names
const BREATHING_PATTERNS: BreathingPattern[] = [
  {
    id: 'gentle-wave',
    name: 'Gentle Wave',
    description: 'A soft rhythm like ocean waves',
    icon: '🌊',
    inhale: 4,
    holdIn: 0,
    exhale: 6,
    holdOut: 0,
    cycles: 6,
  },
  {
    id: 'calm-rest',
    name: 'Calm Rest',
    description: 'Deep relaxation and grounding',
    icon: '🌙',
    inhale: 4,
    holdIn: 7,
    exhale: 8,
    holdOut: 0,
    cycles: 4,
  },
  {
    id: 'inner-balance',
    name: 'Inner Balance',
    description: 'Equal rhythm for centered stillness',
    icon: '⚖️',
    inhale: 4,
    holdIn: 4,
    exhale: 4,
    holdOut: 4,
    cycles: 4,
  },
  {
    id: 'peaceful-flow',
    name: 'Peaceful Flow',
    description: 'Smooth inhale and exhale harmony',
    icon: '🍃',
    inhale: 5,
    holdIn: 0,
    exhale: 5,
    holdOut: 0,
    cycles: 6,
  },
  {
    id: 'soft-release',
    name: 'Soft Release',
    description: 'Longer exhale for gentle letting go',
    icon: '🌸',
    inhale: 3,
    holdIn: 0,
    exhale: 6,
    holdOut: 0,
    cycles: 6,
  },
];

const PATTERN_STORAGE_KEY = 'breathing-pattern-preference';

// Subset of sounds for quick breathing (calming ambient only)
const BREATHING_SOUNDS = AMBIENT_SOUNDS.filter(s => 
  ['silence', 'rain', 'forest', 'ocean'].includes(s.id)
);

const QuickBreathingWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>('idle');
  const [cycleCount, setCycleCount] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showSoundPicker, setShowSoundPicker] = useState(false);
  const [showPatternPicker, setShowPatternPicker] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern>(() => {
    const stored = localStorage.getItem(PATTERN_STORAGE_KEY);
    const found = BREATHING_PATTERNS.find(p => p.id === stored);
    return found || BREATHING_PATTERNS[0];
  });
  
  const { playCompletionSound, enableAudioContext } = useBreathingCompletionSound();
  const { 
    isPlaying: isAmbientPlaying, 
    isLoading: isAmbientLoading,
    selectedSound, 
    setSelectedSound, 
    volume, 
    setVolume, 
    playSound, 
    stopSound 
  } = useAmbientSound();

  // Save pattern preference
  useEffect(() => {
    localStorage.setItem(PATTERN_STORAGE_KEY, selectedPattern.id);
  }, [selectedPattern]);

  const startSession = useCallback(() => {
    enableAudioContext();
    setIsActive(true);
    setPhase('inhale');
    setCycleCount(0);
    // Start ambient sound if one is selected
    if (selectedSound !== 'silence') {
      playSound(selectedSound);
    }
  }, [enableAudioContext, selectedSound, playSound]);

  const stopSession = useCallback(() => {
    setIsActive(false);
    setPhase('idle');
    setCycleCount(0);
    stopSound();
  }, [stopSound]);

  // Breathing cycle logic with pattern support
  useEffect(() => {
    if (!isActive) return;

    const { inhale, holdIn, exhale, holdOut, cycles } = selectedPattern;

    if (phase === 'inhale') {
      const timer = setTimeout(() => {
        setPhase(holdIn > 0 ? 'hold-in' : 'exhale');
      }, inhale * 1000);
      return () => clearTimeout(timer);
    }

    if (phase === 'hold-in') {
      const timer = setTimeout(() => {
        setPhase('exhale');
      }, holdIn * 1000);
      return () => clearTimeout(timer);
    }

    if (phase === 'exhale') {
      const timer = setTimeout(() => {
        setPhase(holdOut > 0 ? 'hold-out' : 'next-cycle');
      }, exhale * 1000);
      return () => clearTimeout(timer);
    }

    if (phase === 'hold-out') {
      const timer = setTimeout(() => {
        setPhase('next-cycle');
      }, holdOut * 1000);
      return () => clearTimeout(timer);
    }

    if (phase === 'next-cycle') {
      const newCount = cycleCount + 1;
      setCycleCount(newCount);
      
      if (newCount >= cycles) {
        setPhase('complete');
        setIsActive(false);
        playCompletionSound();
        stopSound();
      } else {
        setPhase('inhale');
      }
    }
  }, [isActive, phase, cycleCount, selectedPattern, playCompletionSound, stopSound]);

  // Reset complete state after viewing
  const handleClose = () => {
    setIsOpen(false);
    setShowSoundPicker(false);
    if (phase === 'complete') {
      setTimeout(() => setPhase('idle'), 300);
    }
    if (isActive) {
      stopSound();
    }
  };

  const handleSoundSelect = (soundId: AmbientSoundType) => {
    setSelectedSound(soundId);
    setShowSoundPicker(false);
    // If session is active, switch to new sound
    if (isActive && soundId !== 'silence') {
      playSound(soundId);
    } else if (soundId === 'silence') {
      stopSound();
    }
  };

  if (isDismissed) return null;

  return (
    <>
      {/* Floating Widget Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 right-4 z-40 p-3.5 rounded-full bg-gradient-to-br from-primary/80 to-primary shadow-lg shadow-primary/20 border border-primary/30 backdrop-blur-sm"
            aria-label="Open quick breathing session"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Wind className="w-5 h-5 text-primary-foreground" />
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Expanded Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-4 z-50 w-72"
          >
            <div className="relative">
              {/* Soft glow */}
              <div className="absolute inset-0 bg-primary/10 blur-xl rounded-2xl" />
              
              <div className="relative bg-card/95 backdrop-blur-xl rounded-2xl border border-border/40 shadow-xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 pb-2">
                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">One Minute of Breath</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setIsDismissed(true)}
                      className="p-1.5 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Dismiss widget"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 pt-2">
                  {phase === 'complete' ? (
                    // Completion message
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-6"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 15 }}
                        className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center"
                      >
                        <Wind className="w-8 h-8 text-primary" />
                      </motion.div>
                      <p className="text-sm text-foreground/80 italic">
                        One minute of presence has passed.
                      </p>
                      <button
                        onClick={handleClose}
                        className="mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Close
                      </button>
                    </motion.div>
                  ) : (
                    <>
                      {/* Breathing Circle */}
                      <div className="flex flex-col items-center py-4">
                        <div className="relative w-32 h-32 flex items-center justify-center">
                          {/* Outer ring */}
                          <motion.div
                            animate={{
                              scale: phase === 'inhale' ? 1 : phase === 'exhale' ? 0.6 : 0.8,
                              opacity: isActive ? 0.3 : 0.1,
                            }}
                            transition={{
                              duration: phase === 'inhale' ? selectedPattern.inhale : phase === 'exhale' ? selectedPattern.exhale : 0.5,
                              ease: 'easeInOut',
                            }}
                            className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 border border-primary/20"
                          />
                          
                          {/* Inner breathing circle */}
                          <motion.div
                            animate={{
                              scale: phase === 'inhale' ? 1 : phase === 'exhale' ? 0.5 : 0.75,
                            }}
                            transition={{
                              duration: phase === 'inhale' ? selectedPattern.inhale : phase === 'exhale' ? selectedPattern.exhale : 0.5,
                              ease: 'easeInOut',
                            }}
                            className={`w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20 border border-primary/30 flex items-center justify-center ${isActive ? 'shadow-[0_0_40px_hsl(var(--primary)/0.3)]' : 'shadow-[0_0_20px_hsl(var(--primary)/0.1)]'}`}
                          >
                            <Wind className="w-8 h-8 text-primary/60" />
                          </motion.div>
                        </div>

                        {/* Phase text */}
                        <AnimatePresence mode="wait">
                          <motion.p
                            key={phase}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.3 }}
                            className="mt-4 text-sm text-muted-foreground italic"
                          >
                            {phase === 'idle' && "When you're ready..."}
                            {phase === 'inhale' && 'Inhale...'}
                            {phase === 'hold-in' && 'Hold gently...'}
                            {phase === 'exhale' && 'Exhale...'}
                            {phase === 'hold-out' && 'Rest...'}
                            {phase === 'next-cycle' && '...'}
                          </motion.p>
                        </AnimatePresence>
                      </div>

                      {/* Controls */}
                      <div className="flex justify-center pt-2">
                        {isActive ? (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={stopSession}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-sm"
                          >
                            <Square className="w-3 h-3" />
                            Stop
                          </motion.button>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={startSession}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-br from-primary/80 to-primary text-primary-foreground shadow-lg shadow-primary/20 text-sm font-medium"
                          >
                            <Play className="w-3.5 h-3.5" />
                            Begin
                          </motion.button>
                        )}
                      </div>

                      {/* Subtle info */}
                      <p className="text-center text-xs text-muted-foreground/60 mt-4">
                        {isActive ? `${cycleCount + 1} of ${selectedPattern.cycles}` : selectedPattern.description}
                      </p>

                      {/* Pattern Selector */}
                      <div className="mt-4 pt-4 border-t border-border/20">
                        <div className="relative">
                          <button
                            onClick={() => !isActive && setShowPatternPicker(!showPatternPicker)}
                            disabled={isActive}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <div className="flex items-center gap-2">
                              <span>{selectedPattern.icon}</span>
                              <span className="text-muted-foreground">{selectedPattern.name}</span>
                            </div>
                            <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${showPatternPicker ? 'rotate-180' : ''}`} />
                          </button>

                          {/* Pattern options dropdown */}
                          <AnimatePresence>
                            {showPatternPicker && (
                              <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="absolute bottom-full left-0 right-0 mb-1 bg-card/95 backdrop-blur-lg rounded-lg border border-border/40 shadow-lg overflow-hidden z-20"
                              >
                                {BREATHING_PATTERNS.map((pattern) => (
                                  <button
                                    key={pattern.id}
                                    onClick={() => {
                                      setSelectedPattern(pattern);
                                      setShowPatternPicker(false);
                                    }}
                                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs hover:bg-muted/50 transition-colors text-left ${
                                      selectedPattern.id === pattern.id ? 'bg-primary/10' : ''
                                    }`}
                                  >
                                    <span className="text-base">{pattern.icon}</span>
                                    <div className="flex-1 min-w-0">
                                      <p className={`font-medium ${selectedPattern.id === pattern.id ? 'text-primary' : 'text-foreground/80'}`}>
                                        {pattern.name}
                                      </p>
                                      <p className="text-[10px] text-muted-foreground/60 truncate">
                                        {pattern.description}
                                      </p>
                                    </div>
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Ambient Sound Section */}
                      <div className="mt-4 pt-4 border-t border-border/20">
                        {/* Sound selector */}
                        <div className="relative">
                          <button
                            onClick={() => setShowSoundPicker(!showSoundPicker)}
                            disabled={isAmbientLoading}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-xs"
                          >
                            <div className="flex items-center gap-2">
                              {selectedSound === 'silence' ? (
                                <VolumeX className="w-3.5 h-3.5 text-muted-foreground" />
                              ) : (
                                <Volume2 className="w-3.5 h-3.5 text-primary/70" />
                              )}
                              <span className="text-muted-foreground">
                                {isAmbientLoading ? 'Loading...' : BREATHING_SOUNDS.find(s => s.id === selectedSound)?.name || 'Select sound'}
                              </span>
                            </div>
                            <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${showSoundPicker ? 'rotate-180' : ''}`} />
                          </button>

                          {/* Sound options dropdown */}
                          <AnimatePresence>
                            {showSoundPicker && (
                              <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="absolute bottom-full left-0 right-0 mb-1 bg-card/95 backdrop-blur-lg rounded-lg border border-border/40 shadow-lg overflow-hidden z-10"
                              >
                                {BREATHING_SOUNDS.map((sound) => (
                                  <button
                                    key={sound.id}
                                    onClick={() => handleSoundSelect(sound.id)}
                                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted/50 transition-colors ${
                                      selectedSound === sound.id ? 'bg-primary/10 text-primary' : 'text-foreground/70'
                                    }`}
                                  >
                                    <span>{sound.icon}</span>
                                    <span>{sound.name}</span>
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Volume slider - only show if sound is selected */}
                        {selectedSound !== 'silence' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 flex items-center gap-3 px-1"
                          >
                            <VolumeX className="w-3 h-3 text-muted-foreground/50" />
                            <Slider
                              value={[volume]}
                              onValueChange={([v]) => setVolume(v)}
                              min={0}
                              max={0.5}
                              step={0.01}
                              className="flex-1"
                            />
                            <Volume2 className="w-3 h-3 text-muted-foreground/50" />
                          </motion.div>
                        )}

                        {/* Ambient indicator during session */}
                        {isActive && isAmbientPlaying && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-2 flex items-center justify-center gap-1.5"
                          >
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="w-1.5 h-1.5 rounded-full bg-primary/50"
                            />
                            <span className="text-[10px] text-muted-foreground/50">
                              {BREATHING_SOUNDS.find(s => s.id === selectedSound)?.name}
                            </span>
                          </motion.div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Close panel button */}
                {phase !== 'complete' && (
                  <button
                    onClick={handleClose}
                    className="w-full py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors border-t border-border/20"
                  >
                    Minimize
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default QuickBreathingWidget;