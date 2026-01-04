import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpeakMessageButtonProps {
  text: string;
  className?: string;
}

export const SpeakMessageButton: React.FC<SpeakMessageButtonProps> = ({
  text,
  className,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const getVietnameseVoice = useCallback((): SpeechSynthesisVoice | null => {
    const voices = window.speechSynthesis.getVoices();
    // Try to find Vietnamese voice
    const viVoice = voices.find(v => v.lang.startsWith('vi'));
    if (viVoice) return viVoice;
    // Fallback to any available female voice or first voice
    const femaleVoice = voices.find(v => v.name.toLowerCase().includes('female') || v.name.includes('Google'));
    return femaleVoice || voices[0] || null;
  }, []);

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
      .replace(/[✨🌸💫🤍❤️💕🙏🌟⭐️🌈🦋🌺🌷💐🌹🌻]/g, '')
      .replace(/\*\*/g, '')
      .replace(/\n+/g, '. ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utteranceRef.current = utterance;

    // Wait for voices to load
    const setVoice = () => {
      const voice = getVietnameseVoice();
      if (voice) {
        utterance.voice = voice;
      }
      utterance.lang = 'vi-VN';
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1.1; // Slightly higher for gentle tone
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
    };

    // Voices might not be loaded yet
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = setVoice;
    } else {
      setVoice();
    }
  }, [text, isSpeaking, getVietnameseVoice]);

  // Check if speech synthesis is supported
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return null;
  }

  return (
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
        isSpeaking && 'bg-primary/20 border-primary/50',
        className
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
  );
};

export default SpeakMessageButton;
