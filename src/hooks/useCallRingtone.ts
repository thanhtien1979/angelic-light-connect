import { useRef, useEffect, useCallback } from 'react';

// Generate ringtone using Web Audio API
const createRingtone = (audioContext: AudioContext): OscillatorNode[] => {
  const oscillators: OscillatorNode[] = [];
  
  // Create a pleasant ringtone with two frequencies
  const frequencies = [523.25, 659.25]; // C5 and E5
  
  frequencies.forEach((freq) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillators.push(oscillator);
  });
  
  return oscillators;
};

export const useCallRingtone = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPlayingRef = useRef(false);

  const startRingtone = useCallback(() => {
    if (isPlayingRef.current) return;
    
    try {
      audioContextRef.current = new AudioContext();
      isPlayingRef.current = true;
      
      const playTone = () => {
        if (!audioContextRef.current || !isPlayingRef.current) return;
        
        const oscillators = createRingtone(audioContextRef.current);
        oscillatorsRef.current = oscillators;
        
        oscillators.forEach(osc => osc.start());
        
        // Stop after 500ms
        setTimeout(() => {
          oscillators.forEach(osc => {
            try {
              osc.stop();
            } catch (e) {
              // Ignore if already stopped
            }
          });
        }, 500);
      };
      
      // Play immediately and then every 1.5 seconds
      playTone();
      intervalRef.current = setInterval(playTone, 1500);
    } catch (error) {
      console.error('Error starting ringtone:', error);
    }
  }, []);

  const stopRingtone = useCallback(() => {
    isPlayingRef.current = false;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    oscillatorsRef.current.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {
        // Ignore if already stopped
      }
    });
    oscillatorsRef.current = [];
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRingtone();
    };
  }, [stopRingtone]);

  return { startRingtone, stopRingtone };
};

// Hook for outgoing call sound (dial tone)
export const useDialTone = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPlayingRef = useRef(false);

  const startDialTone = useCallback(() => {
    if (isPlayingRef.current) return;
    
    try {
      audioContextRef.current = new AudioContext();
      isPlayingRef.current = true;
      
      const playTone = () => {
        if (!audioContextRef.current || !isPlayingRef.current) return;
        
        const oscillator = audioContextRef.current.createOscillator();
        const gainNode = audioContextRef.current.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioContextRef.current.currentTime); // A4
        
        gainNode.gain.setValueAtTime(0.05, audioContextRef.current.currentTime);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);
        
        oscillatorRef.current = oscillator;
        oscillator.start();
        
        // Stop after 1 second
        setTimeout(() => {
          try {
            oscillator.stop();
          } catch (e) {
            // Ignore
          }
        }, 1000);
      };
      
      playTone();
      intervalRef.current = setInterval(playTone, 3000);
    } catch (error) {
      console.error('Error starting dial tone:', error);
    }
  }, []);

  const stopDialTone = useCallback(() => {
    isPlayingRef.current = false;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
      } catch (e) {
        // Ignore
      }
      oscillatorRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopDialTone();
    };
  }, [stopDialTone]);

  return { startDialTone, stopDialTone };
};
