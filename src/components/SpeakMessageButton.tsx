import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Loader2, Settings, Check, User, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SpeakMessageButtonProps {
  text: string;
  className?: string;
}

interface VoiceOption {
  id: string;
  name: string;
  gender: 'male' | 'female';
  age: 'young' | 'middle' | 'old';
  region: 'north' | 'central' | 'south' | 'neutral';
  icon: string;
  description: string;
}

interface VoiceSettings {
  voiceId: string;
  speed: number;
  pitch: number;
}

// Predefined Vietnamese voice options with different characteristics
const VOICE_OPTIONS: VoiceOption[] = [
  // Female voices
  {
    id: 'female-north-young',
    name: 'Hà Linh',
    gender: 'female',
    age: 'young',
    region: 'north',
    icon: '👩',
    description: 'Giọng nữ trẻ miền Bắc'
  },
  {
    id: 'female-north-middle',
    name: 'Thu Hà',
    gender: 'female',
    age: 'middle',
    region: 'north',
    icon: '👩‍💼',
    description: 'Giọng nữ trung niên miền Bắc'
  },
  {
    id: 'female-south-young',
    name: 'Ngọc Trinh',
    gender: 'female',
    age: 'young',
    region: 'south',
    icon: '👧',
    description: 'Giọng nữ trẻ miền Nam'
  },
  {
    id: 'female-south-middle',
    name: 'Mỹ Tâm',
    gender: 'female',
    age: 'middle',
    region: 'south',
    icon: '👩‍🦰',
    description: 'Giọng nữ trung niên miền Nam'
  },
  {
    id: 'female-central-young',
    name: 'Thu Trang',
    gender: 'female',
    age: 'young',
    region: 'central',
    icon: '👩‍🎤',
    description: 'Giọng nữ trẻ miền Trung'
  },
  {
    id: 'female-neutral-old',
    name: 'Bà Ngoại',
    gender: 'female',
    age: 'old',
    region: 'neutral',
    icon: '👵',
    description: 'Giọng bà hiền từ, ấm áp'
  },
  // Male voices
  {
    id: 'male-north-young',
    name: 'Minh Quân',
    gender: 'male',
    age: 'young',
    region: 'north',
    icon: '👨',
    description: 'Giọng nam trẻ miền Bắc'
  },
  {
    id: 'male-north-middle',
    name: 'Bách Việt',
    gender: 'male',
    age: 'middle',
    region: 'north',
    icon: '👨‍💼',
    description: 'Giọng nam trung niên miền Bắc'
  },
  {
    id: 'male-south-young',
    name: 'Quang Vũ',
    gender: 'male',
    age: 'young',
    region: 'south',
    icon: '🧑',
    description: 'Giọng nam trẻ miền Nam'
  },
  {
    id: 'male-south-middle',
    name: 'Văn Hoàng',
    gender: 'male',
    age: 'middle',
    region: 'south',
    icon: '👨‍🦱',
    description: 'Giọng nam trung niên miền Nam'
  },
  {
    id: 'male-central-young',
    name: 'Minh Trí',
    gender: 'male',
    age: 'young',
    region: 'central',
    icon: '👦',
    description: 'Giọng nam trẻ miền Trung'
  },
  {
    id: 'male-neutral-old',
    name: 'Ông Nội',
    gender: 'male',
    age: 'old',
    region: 'neutral',
    icon: '👴',
    description: 'Giọng ông hiền từ, trầm ấm'
  },
  // Special Angel voices
  {
    id: 'angel-female',
    name: 'Thiên Thần Nữ',
    gender: 'female',
    age: 'young',
    region: 'neutral',
    icon: '👼',
    description: 'Giọng thiên thần dịu dàng'
  },
  {
    id: 'angel-male',
    name: 'Thiên Thần Nam',
    gender: 'male',
    age: 'young',
    region: 'neutral',
    icon: '😇',
    description: 'Giọng thiên thần thanh thoát'
  },
];

const SPEED_OPTIONS = [
  { value: 0.6, label: 'Rất chậm' },
  { value: 0.8, label: 'Chậm' },
  { value: 1.0, label: 'Bình thường' },
  { value: 1.2, label: 'Nhanh' },
  { value: 1.4, label: 'Rất nhanh' },
];

const PITCH_OPTIONS = [
  { value: 0.8, label: 'Trầm' },
  { value: 1.0, label: 'Bình thường' },
  { value: 1.2, label: 'Cao' },
];

// Voice characteristics mapping for Web Speech API simulation
const getVoiceCharacteristics = (voiceOption: VoiceOption) => {
  let pitch = 1.0;
  let rate = 1.0;
  
  // Adjust pitch based on gender and age
  if (voiceOption.gender === 'female') {
    pitch = voiceOption.age === 'old' ? 1.1 : voiceOption.age === 'young' ? 1.3 : 1.2;
  } else {
    pitch = voiceOption.age === 'old' ? 0.8 : voiceOption.age === 'young' ? 1.0 : 0.9;
  }
  
  // Adjust rate based on age
  if (voiceOption.age === 'old') {
    rate = 0.85;
  } else if (voiceOption.age === 'young') {
    rate = 1.05;
  }
  
  // Special adjustments for angel voices
  if (voiceOption.id.startsWith('angel')) {
    pitch = voiceOption.gender === 'female' ? 1.25 : 1.1;
    rate = 0.95;
  }
  
  return { pitch, rate };
};

// Get saved settings from localStorage
const getSavedSettings = (): VoiceSettings => {
  try {
    const saved = localStorage.getItem('tts_voice_settings');
    if (saved) return JSON.parse(saved);
  } catch {}
  return { voiceId: 'angel-female', speed: 1.0, pitch: 1.0 };
};

// Save settings to localStorage
const saveSettings = (settings: VoiceSettings) => {
  localStorage.setItem('tts_voice_settings', JSON.stringify(settings));
};

export const SpeakMessageButton: React.FC<SpeakMessageButtonProps> = ({
  text,
  className,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [systemVoices, setSystemVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [settings, setSettings] = useState<VoiceSettings>(getSavedSettings);
  const [activeTab, setActiveTab] = useState<'female' | 'male'>('female');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Load available system voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setSystemVoices(availableVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Close settings when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    };

    if (showSettings) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSettings]);

  const updateSettings = useCallback((newSettings: Partial<VoiceSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveSettings(updated);
  }, [settings]);

  const getSelectedVoice = useCallback(() => {
    return VOICE_OPTIONS.find(v => v.id === settings.voiceId) || VOICE_OPTIONS[0];
  }, [settings.voiceId]);

  const getBestSystemVoice = useCallback(() => {
    // Try to find Vietnamese voice
    const viVoice = systemVoices.find(v => v.lang.startsWith('vi'));
    if (viVoice) return viVoice;
    
    // Fallback to any available voice
    return systemVoices[0] || null;
  }, [systemVoices]);

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

    // Clean text for speech
    const cleanText = text
      .replace(/[✨🌸💫🤍❤️💕🙏🌟⭐️🌈🦋🌺🌷💐🌹🌻😊😇🥰💖🕊️👼💝🌙✿❀🍀🌼🪷]/g, '')
      .replace(/\*\*/g, '')
      .replace(/\n+/g, '. ')
      .replace(/\.+/g, '.')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utteranceRef.current = utterance;

    // Get selected voice option and its characteristics
    const selectedVoice = getSelectedVoice();
    const characteristics = getVoiceCharacteristics(selectedVoice);
    
    // Use system voice
    const systemVoice = getBestSystemVoice();
    if (systemVoice) {
      utterance.voice = systemVoice;
    }
    
    utterance.lang = 'vi-VN';
    
    // Apply voice characteristics with user speed/pitch adjustments
    utterance.rate = characteristics.rate * settings.speed;
    utterance.pitch = characteristics.pitch * settings.pitch;
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
  }, [text, isSpeaking, settings, getSelectedVoice, getBestSystemVoice]);

  const handlePreview = useCallback(() => {
    if (!window.speechSynthesis) return;
    
    window.speechSynthesis.cancel();
    
    const selectedVoice = getSelectedVoice();
    const previewText = `Xin chào, tôi là ${selectedVoice.name}. Rất vui được đồng hành cùng bạn.`;
    
    const utterance = new SpeechSynthesisUtterance(previewText);
    const characteristics = getVoiceCharacteristics(selectedVoice);
    
    const systemVoice = getBestSystemVoice();
    if (systemVoice) {
      utterance.voice = systemVoice;
    }
    
    utterance.lang = 'vi-VN';
    utterance.rate = characteristics.rate * settings.speed;
    utterance.pitch = characteristics.pitch * settings.pitch;
    utterance.volume = 1;
    
    window.speechSynthesis.speak(utterance);
  }, [getSelectedVoice, getBestSystemVoice, settings]);

  // Check if speech synthesis is supported
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return null;
  }

  const femaleVoices = VOICE_OPTIONS.filter(v => v.gender === 'female');
  const maleVoices = VOICE_OPTIONS.filter(v => v.gender === 'male');
  const selectedVoice = getSelectedVoice();

  return (
    <div className={cn('relative flex items-center gap-0.5', className)} ref={settingsRef}>
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
        title={isSpeaking ? 'Dừng đọc' : `Nghe (${selectedVoice.name})`}
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
        title="Chọn giọng đọc"
      >
        <Settings className="w-3 h-3 text-muted-foreground" />
      </button>

      {/* Settings dropdown */}
      {showSettings && (
        <div className={cn(
          'absolute z-50 top-full mt-1 right-0',
          'w-[280px] sm:w-[320px] p-3 rounded-xl',
          'bg-background/95 backdrop-blur-md border border-border shadow-xl',
          'animate-fade-in'
        )}>
          {/* Header */}
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/50">
            <span className="text-lg">{selectedVoice.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-medium">{selectedVoice.name}</p>
              <p className="text-xs text-muted-foreground">{selectedVoice.description}</p>
            </div>
          </div>

          {/* Gender tabs */}
          <div className="flex gap-1 mb-3">
            <button
              onClick={() => setActiveTab('female')}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all',
                activeTab === 'female' 
                  ? 'bg-pink-500/20 text-pink-600 dark:text-pink-400 border border-pink-500/30' 
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              )}
            >
              <Users className="w-3.5 h-3.5" />
              Giọng nữ
            </button>
            <button
              onClick={() => setActiveTab('male')}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all',
                activeTab === 'male' 
                  ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30' 
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              )}
            >
              <User className="w-3.5 h-3.5" />
              Giọng nam
            </button>
          </div>

          {/* Voice list */}
          <div className="max-h-[180px] overflow-y-auto space-y-1 mb-3 pr-1">
            {(activeTab === 'female' ? femaleVoices : maleVoices).map((voice) => (
              <button
                key={voice.id}
                onClick={() => updateSettings({ voiceId: voice.id })}
                className={cn(
                  'w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all',
                  'hover:bg-accent/50',
                  settings.voiceId === voice.id && 'bg-primary/10 border border-primary/30'
                )}
              >
                <span className="text-base">{voice.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{voice.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{voice.description}</p>
                </div>
                {settings.voiceId === voice.id && (
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                )}
              </button>
            ))}
          </div>

          {/* Speed and Pitch controls */}
          <div className="grid grid-cols-2 gap-2 mb-3 pt-2 border-t border-border/50">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Tốc độ
              </label>
              <Select 
                value={settings.speed.toString()} 
                onValueChange={(v) => updateSettings({ speed: parseFloat(v) })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SPEED_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()} className="text-xs">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Cao độ
              </label>
              <Select 
                value={settings.pitch.toString()} 
                onValueChange={(v) => updateSettings({ pitch: parseFloat(v) })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PITCH_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()} className="text-xs">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Preview button */}
          <button
            onClick={handlePreview}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
          >
            <Volume2 className="w-4 h-4" />
            Thử nghe giọng {selectedVoice.name}
          </button>
        </div>
      )}
    </div>
  );
};

export default SpeakMessageButton;
