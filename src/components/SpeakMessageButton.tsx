import React, { useState, useCallback, useRef } from 'react';
import { Volume2, VolumeX, Loader2, Settings, Check, User, Users, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
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
  isAngel?: boolean;
}

interface VoiceSettings {
  voiceId: string;
  speed: number;
}

// TTS API URL
const TTS_API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`;

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
    description: 'Giọng nữ trẻ miền Bắc - Trong trẻo, tươi vui'
  },
  {
    id: 'female-north-middle',
    name: 'Thu Hà',
    gender: 'female',
    age: 'middle',
    region: 'north',
    icon: '👩‍💼',
    description: 'Giọng nữ trung niên miền Bắc - Điềm đạm'
  },
  {
    id: 'female-south-young',
    name: 'Ngọc Trinh',
    gender: 'female',
    age: 'young',
    region: 'south',
    icon: '👧',
    description: 'Giọng nữ trẻ miền Nam - Sôi nổi, ngọt ngào'
  },
  {
    id: 'female-south-middle',
    name: 'Mỹ Tâm',
    gender: 'female',
    age: 'middle',
    region: 'south',
    icon: '👩‍🦰',
    description: 'Giọng nữ trung niên miền Nam - Ấm áp'
  },
  {
    id: 'female-central-young',
    name: 'Thu Trang',
    gender: 'female',
    age: 'young',
    region: 'central',
    icon: '👩‍🎤',
    description: 'Giọng nữ trẻ miền Trung - Duyên dáng'
  },
  {
    id: 'female-neutral-old',
    name: 'Bà Ngoại',
    gender: 'female',
    age: 'old',
    region: 'neutral',
    icon: '👵',
    description: 'Giọng bà hiền từ, ấm áp, trìu mến'
  },
  // Male voices
  {
    id: 'male-north-young',
    name: 'Minh Quân',
    gender: 'male',
    age: 'young',
    region: 'north',
    icon: '👨',
    description: 'Giọng nam trẻ miền Bắc - Năng động'
  },
  {
    id: 'male-north-middle',
    name: 'Bách Việt',
    gender: 'male',
    age: 'middle',
    region: 'north',
    icon: '👨‍💼',
    description: 'Giọng nam trung niên miền Bắc - Trầm ổn'
  },
  {
    id: 'male-south-young',
    name: 'Quang Vũ',
    gender: 'male',
    age: 'young',
    region: 'south',
    icon: '🧑',
    description: 'Giọng nam trẻ miền Nam - Vui vẻ'
  },
  {
    id: 'male-south-middle',
    name: 'Văn Hoàng',
    gender: 'male',
    age: 'middle',
    region: 'south',
    icon: '👨‍🦱',
    description: 'Giọng nam trung niên miền Nam - Thân thiện'
  },
  {
    id: 'male-central-young',
    name: 'Minh Trí',
    gender: 'male',
    age: 'young',
    region: 'central',
    icon: '👦',
    description: 'Giọng nam trẻ miền Trung - Mộc mạc'
  },
  {
    id: 'male-neutral-old',
    name: 'Ông Nội',
    gender: 'male',
    age: 'old',
    region: 'neutral',
    icon: '👴',
    description: 'Giọng ông hiền từ, trầm ấm, sâu lắng'
  },
  // Special Angel voices
  {
    id: 'angel-female',
    name: 'Thiên Thần Nữ',
    gender: 'female',
    age: 'young',
    region: 'neutral',
    icon: '👼',
    description: 'Giọng thiên thần nữ dịu dàng, thanh thoát',
    isAngel: true
  },
  {
    id: 'angel-male',
    name: 'Thiên Thần Nam',
    gender: 'male',
    age: 'young',
    region: 'neutral',
    icon: '😇',
    description: 'Giọng thiên thần nam thanh tao, bình an',
    isAngel: true
  },
];

const SPEED_OPTIONS = [
  { value: 0.7, label: 'Rất chậm' },
  { value: 0.85, label: 'Chậm' },
  { value: 1.0, label: 'Bình thường' },
  { value: 1.1, label: 'Nhanh' },
  { value: 1.2, label: 'Rất nhanh' },
];

// Get saved settings from localStorage
const getSavedSettings = (): VoiceSettings => {
  try {
    const saved = localStorage.getItem('tts_voice_settings_v2');
    if (saved) return JSON.parse(saved);
  } catch {}
  return { voiceId: 'angel-female', speed: 1.0 };
};

// Save settings to localStorage
const saveSettings = (settings: VoiceSettings) => {
  localStorage.setItem('tts_voice_settings_v2', JSON.stringify(settings));
};

export const SpeakMessageButton: React.FC<SpeakMessageButtonProps> = ({
  text,
  className,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<VoiceSettings>(getSavedSettings);
  const [activeTab, setActiveTab] = useState<'female' | 'male'>('female');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  const updateSettings = useCallback((newSettings: Partial<VoiceSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveSettings(updated);
  }, [settings]);

  const getSelectedVoice = useCallback(() => {
    return VOICE_OPTIONS.find(v => v.id === settings.voiceId) || VOICE_OPTIONS[0];
  }, [settings.voiceId]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  const handleSpeak = useCallback(async () => {
    // If already speaking, stop
    if (isSpeaking) {
      stopAudio();
      return;
    }

    setIsLoading(true);

    try {
      // Clean text for speech
      const cleanText = text
        .replace(/[✨🌸💫🤍❤️💕🙏🌟⭐️🌈🦋🌺🌷💐🌹🌻😊😇🥰💖🕊️👼💝🌙✿❀🍀🌼🪷🌞🍃💛🧡💜💙💚🖤🤎💗💓💞💘💟❣️♥️🔥⚡️🎶🎵🎤🎧📿📖🕯️🌅🌄🌇🌆🏞️🏵️🌾🍂🍁🌿☘️🌱🌲🌳🌴🌵🌷🌸🌹🌺🌻🌼💮🪻🪸🪴🪺🐚🦢🦩🕊️🐝🦋🐞🌕🌖🌗🌘🌑🌒🌓🌔🌙⭐️🌟💫✨☀️🌤️⛅️🌥️🌦️🌧️⛈️🌩️🌪️🌫️🌬️💨🌀🌊💧💦☔️⚡️❄️🌨️☃️⛄️🔥💥✳️✴️☸️♻️🔯☯️☮️🕉️☪️✝️☦️✡️🔯🕎☸️⚛️🕉️🆔⚜️🔱❇️✳️✴️❌⭕️🛑⛔️📛🚫💯💢♨️🚷🚯🚳🚱🔞📵🚭❗️❓❕❔‼️⁉️🔅🔆〽️⚠️🚸🔱⚜️🔰♻️✅❎✔️☑️🔘🔴🟠🟡🟢🔵🟣⚫️⚪️🟤🔺🔻🔸🔹🔶🔷🔳🔲▪️▫️◾️◽️◼️◻️🟥🟧🟨🟩🟦🟪⬛️⬜️🟫🔈🔇🔉🔊🔔🔕📣📢💬💭🗯️♠️♣️♥️♦️🃏🎴🀄️🕐🕑🕒🕓🕔🕕🕖🕗🕘🕙🕚🕛🕜🕝🕞🕟🕠🕡🕢🕣🕤🕥🕦🕧]/g, '')
        .replace(/\*\*/g, '')
        .replace(/\n+/g, '. ')
        .replace(/\.+/g, '.')
        .trim();

      if (!cleanText) {
        toast.error('Không có nội dung để đọc');
        setIsLoading(false);
        return;
      }

      const response = await fetch(TTS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          text: cleanText,
          voiceId: settings.voiceId,
          userSpeed: settings.speed,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Lỗi ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        setIsLoading(false);
        setIsSpeaking(true);
      };

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };

      audio.onerror = () => {
        setIsLoading(false);
        setIsSpeaking(false);
        toast.error('Không thể phát âm thanh');
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error('TTS Error:', error);
      setIsLoading(false);
      setIsSpeaking(false);
      toast.error(error instanceof Error ? error.message : 'Không thể tạo giọng nói');
    }
  }, [text, isSpeaking, settings, stopAudio]);

  const handlePreview = useCallback(async () => {
    stopAudio();
    setIsLoading(true);

    try {
      const selectedVoice = getSelectedVoice();
      const previewText = `Xin chào, tôi là ${selectedVoice.name}. Rất vui được đồng hành cùng bạn trên hành trình tâm linh.`;

      const response = await fetch(TTS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          text: previewText,
          voiceId: settings.voiceId,
          userSpeed: settings.speed,
        }),
      });

      if (!response.ok) {
        throw new Error('Không thể tạo giọng nói');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        setIsLoading(false);
        setIsSpeaking(true);
      };

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };

      audio.onerror = () => {
        setIsLoading(false);
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error('Preview Error:', error);
      setIsLoading(false);
      toast.error('Không thể xem trước giọng nói');
    }
  }, [getSelectedVoice, settings, stopAudio]);

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
        <div 
          className={cn(
            'absolute z-50 top-full mt-1 right-0',
            'w-[300px] sm:w-[340px] p-3 rounded-xl',
            'bg-background/95 backdrop-blur-md border border-border shadow-xl',
            'animate-fade-in'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with ElevenLabs badge */}
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/50">
            <span className="text-lg">{selectedVoice.icon}</span>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium">{selectedVoice.name}</p>
                {selectedVoice.isAngel && (
                  <Sparkles className="w-3 h-3 text-amber-500" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">{selectedVoice.description}</p>
            </div>
            <div className="px-1.5 py-0.5 rounded bg-gradient-to-r from-violet-500/20 to-indigo-500/20 border border-violet-500/30">
              <span className="text-[10px] font-medium text-violet-600 dark:text-violet-400">AI Voice</span>
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
              Giọng nữ ({femaleVoices.length})
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
              Giọng nam ({maleVoices.length})
            </button>
          </div>

          {/* Voice list */}
          <div className="max-h-[200px] overflow-y-auto space-y-1 mb-3 pr-1">
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
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-medium truncate">{voice.name}</p>
                    {voice.isAngel && (
                      <Sparkles className="w-3 h-3 text-amber-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{voice.description}</p>
                </div>
                {settings.voiceId === voice.id && (
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                )}
              </button>
            ))}
          </div>

          {/* Speed control */}
          <div className="mb-3 pt-2 border-t border-border/50">
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Tốc độ đọc
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

          {/* Preview button */}
          <button
            onClick={handlePreview}
            disabled={isLoading || isSpeaking}
            className={cn(
              'w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              'bg-gradient-to-r from-violet-500/20 to-indigo-500/20 hover:from-violet-500/30 hover:to-indigo-500/30',
              'text-violet-700 dark:text-violet-300 border border-violet-500/30',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isSpeaking ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
            {isSpeaking ? 'Đang phát...' : `Thử nghe giọng ${selectedVoice.name}`}
          </button>
        </div>
      )}
    </div>
  );
};

export default SpeakMessageButton;
