import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Loader2, Settings, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpeakMessageButtonProps {
  text: string;
  className?: string;
}

interface VoiceSettings {
  voiceIndex: number;
  speed: number;
}

const SPEED_OPTIONS = [
  { value: 0.7, label: 'Chậm' },
  { value: 0.9, label: 'Bình thường' },
  { value: 1.1, label: 'Nhanh' },
  { value: 1.3, label: 'Rất nhanh' },
];

// Get saved settings from localStorage
const getSavedSettings = (): VoiceSettings => {
  try {
    const saved = localStorage.getItem('tts_settings');
    if (saved) return JSON.parse(saved);
  } catch {}
  return { voiceIndex: -1, speed: 0.9 };
};

// Save settings to localStorage
const saveSettings = (settings: VoiceSettings) => {
  localStorage.setItem('tts_settings', JSON.stringify(settings));
};

export const SpeakMessageButton: React.FC<SpeakMessageButtonProps> = ({
  text,
  className,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [settings, setSettings] = useState<VoiceSettings>(getSavedSettings);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      // Filter to show Vietnamese and common voices
      const filteredVoices = availableVoices.filter(v => 
        v.lang.startsWith('vi') || 
        v.lang.startsWith('en') ||
        v.name.toLowerCase().includes('female') ||
        v.name.toLowerCase().includes('male') ||
        v.name.includes('Google')
      ).slice(0, 10); // Limit to 10 voices
      setVoices(filteredVoices.length > 0 ? filteredVoices : availableVoices.slice(0, 10));
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const updateSettings = useCallback((newSettings: Partial<VoiceSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveSettings(updated);
  }, [settings]);

  const getVoiceLabel = (voice: SpeechSynthesisVoice): string => {
    // Try to identify gender from voice name
    const name = voice.name.toLowerCase();
    let gender = '';
    if (name.includes('female') || name.includes('zira') || name.includes('hazel') || name.includes('susan')) {
      gender = '👩 ';
    } else if (name.includes('male') || name.includes('david') || name.includes('mark') || name.includes('james')) {
      gender = '👨 ';
    }
    
    // Shorten the name
    let displayName = voice.name.split(' ').slice(0, 2).join(' ');
    if (displayName.length > 20) displayName = displayName.slice(0, 18) + '...';
    
    const lang = voice.lang.split('-')[0].toUpperCase();
    return `${gender}${displayName} (${lang})`;
  };

  const handleSpeak = useCallback(() => {
    if (!window.speechSynthesis) {
      console.warn('Speech synthesis not supported');
      return;
    }

    // If already speaking, stop
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    setIsLoading(true);

    // Clean text for speech (remove emojis and special chars)
    const cleanText = text
      .replace(/[✨🌸💫🤍❤️💕🙏🌟⭐️🌈🦋🌺🌷💐🌹🌻😊😇🥰💖🕊️]/g, '')
      .replace(/\*\*/g, '')
      .replace(/\n+/g, '. ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utteranceRef.current = utterance;

    // Apply saved settings
    if (settings.voiceIndex >= 0 && voices[settings.voiceIndex]) {
      utterance.voice = voices[settings.voiceIndex];
    } else {
      // Default to Vietnamese or first voice
      const viVoice = voices.find(v => v.lang.startsWith('vi'));
      if (viVoice) utterance.voice = viVoice;
    }
    
    utterance.lang = 'vi-VN';
    utterance.rate = settings.speed;
    utterance.pitch = 1.1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsLoading(false);
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (e) => {
      console.error('Speech error:', e);
      setIsLoading(false);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [text, isSpeaking, settings, voices]);

  // Check if speech synthesis is supported
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return null;
  }

  return (
    <div className={cn('relative flex items-center gap-0.5', className)}>
      {/* Speak button */}
      <button
        type="button"
        onClick={handleSpeak}
        disabled={isLoading}
        className={cn(
          'p-1.5 rounded-md transition-all duration-200',
          'opacity-0 group-hover:opacity-100 focus:opacity-100',
          'sm:opacity-0 opacity-60',
          'bg-background/80 backdrop-blur-sm border border-border/30',
          'hover:bg-background hover:border-border/50',
          'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-1',
          'motion-reduce:transition-none',
          'touch-manipulation',
          'disabled:opacity-50',
          isSpeaking && 'bg-primary/20 border-primary/50'
        )}
        aria-label={isSpeaking ? 'Dừng đọc' : 'Nghe tin nhắn'}
        title={isSpeaking ? 'Dừng đọc' : 'Nghe'}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin" />
        ) : isSpeaking ? (
          <VolumeX className="w-3.5 h-3.5 text-primary" />
        ) : (
          <Volume2 className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors" />
        )}
      </button>

      {/* Settings button */}
      <button
        type="button"
        onClick={() => setShowSettings(!showSettings)}
        className={cn(
          'p-1 rounded-md transition-all duration-200',
          'opacity-0 group-hover:opacity-70 focus:opacity-100',
          'sm:opacity-0 opacity-40',
          'hover:opacity-100 hover:bg-background/80',
          'focus:outline-none',
          'touch-manipulation',
          showSettings && 'opacity-100 bg-background/80'
        )}
        aria-label="Cài đặt giọng đọc"
        title="Cài đặt"
      >
        <Settings className="w-3 h-3 text-muted-foreground" />
      </button>

      {/* Settings dropdown */}
      {showSettings && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowSettings(false)}
          />
          <div className={cn(
            'absolute z-50 top-full mt-1 right-0',
            'min-w-[200px] p-2 rounded-lg',
            'bg-background border border-border shadow-lg',
            'animate-fade-in'
          )}>
            {/* Voice selection */}
            <div className="mb-3">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Giọng đọc
              </label>
              <div className="max-h-[120px] overflow-y-auto space-y-0.5">
                <button
                  onClick={() => updateSettings({ voiceIndex: -1 })}
                  className={cn(
                    'w-full flex items-center justify-between px-2 py-1.5 rounded text-xs hover:bg-accent/50 transition-colors',
                    settings.voiceIndex === -1 && 'bg-accent/30'
                  )}
                >
                  <span>🌸 Tự động (Tiếng Việt)</span>
                  {settings.voiceIndex === -1 && <Check className="w-3 h-3 text-primary" />}
                </button>
                {voices.map((voice, index) => (
                  <button
                    key={index}
                    onClick={() => updateSettings({ voiceIndex: index })}
                    className={cn(
                      'w-full flex items-center justify-between px-2 py-1.5 rounded text-xs hover:bg-accent/50 transition-colors text-left',
                      settings.voiceIndex === index && 'bg-accent/30'
                    )}
                  >
                    <span className="truncate">{getVoiceLabel(voice)}</span>
                    {settings.voiceIndex === index && <Check className="w-3 h-3 text-primary flex-shrink-0 ml-1" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Speed selection */}
            <div className="border-t border-border/50 pt-2">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Tốc độ đọc
              </label>
              <div className="grid grid-cols-2 gap-1">
                {SPEED_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateSettings({ speed: option.value })}
                    className={cn(
                      'px-2 py-1.5 rounded text-xs hover:bg-accent/50 transition-colors',
                      settings.speed === option.value && 'bg-primary/20 text-primary border border-primary/30'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview button */}
            <div className="border-t border-border/50 pt-2 mt-2">
              <button
                onClick={() => {
                  setShowSettings(false);
                  handleSpeak();
                }}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
              >
                <Volume2 className="w-3 h-3" />
                Thử nghe
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SpeakMessageButton;
